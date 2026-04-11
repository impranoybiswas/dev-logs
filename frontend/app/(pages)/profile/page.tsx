"use client";

import { useState, useLayoutEffect } from "react";
import dayjs from "dayjs";
import { Avatar, Button, Skeleton, Result, Progress } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  BellOutlined,
  RocketOutlined,
  EditOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import SocialLinks from "@/components/SocialLinks";
import { motion } from "framer-motion";
import EditProfileModal from "@/components/EditProfileModal";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// FIX: STATUS_COLORS was defined but never consumed — the chart was using
// the positional PIE_COLORS array instead, so each status got a random
// colour rather than its semantic one (warning=Pending, primary=Interviewing,
// success=Accepted, error=Rejected).
const STATUS_COLORS: Record<string, string> = {
  Pending: "var(--color-warning)",
  Interviewing: "var(--color-primary)",
  Accepted: "var(--color-success)",
  Rejected: "var(--color-error)",
};

// Fallback colour for any status not in the map above
const FALLBACK_COLOR = "var(--color-accent)";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function ProfilePage() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChecking] = useState(() =>
    typeof window !== "undefined" ? !localStorage.getItem("token") : true,
  );

  useLayoutEffect(() => {
    if (isChecking) {
      router.replace("/auth/login");
    }
  }, [isChecking, router]);

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data;
    },
    enabled: !isChecking,
    retry: (failureCount, error: AxiosError) => {
      if (error.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/users/dashboard/stats");
      return response.data;
    },
    enabled: !isChecking,
  });

  if (isChecking) return null;

  if (userError && (userError as AxiosError).response?.status === 401)
    return null;

  if (userError) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Result
          status="error"
          title="Failed to load profile"
          subTitle={(userError as Error).message}
        />
      </div>
    );
  }

  const isLoading = isUserLoading || isStatsLoading;
  const hasJobs = stats?.jobApplications?.length > 0;

  const statCards = [
    {
      label: "Connections",
      value: stats?.totalFriends ?? 0,
      icon: <TeamOutlined />,
      color: "var(--primary)",
      bg: "rgba(var(--primary-rgb, 99,102,241),0.08)",
    },
    {
      label: "Pending",
      value: stats?.pendingFriends ?? 0,
      icon: <BellOutlined />,
      color: "var(--color-warning)",
      bg: "rgba(245,158,11,0.08)",
    },
    {
      label: "Alerts",
      value: stats?.unreadNotifications ?? 0,
      icon: <RocketOutlined />,
      color: "var(--color-accent)",
      bg: "rgba(239,68,68,0.08)",
    },
    {
      label: "Resume",
      value: null,
      percent: stats?.resumeCompleteness ?? 0,
      icon: <TrophyOutlined />,
      color: "var(--color-success)",
      bg: "rgba(16,185,129,0.08)",
    },
  ];

  return (
    <div className="page-container selection:bg-primary/20">
      <section className="text-left py-24 px-6 md:px-10">
        {/* ── Page header ── */}
        <motion.div
          {...fadeUp(0)}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12"
        >
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground leading-tight">
              My{" "}
              <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent italic">
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mt-2 font-medium">
              Welcome back,{" "}
              <span className="text-foreground font-bold">
                {user?.name?.split(" ")[0] || "Developer"}
              </span>
              !
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Button
              size="large"
              icon={<FileTextOutlined />}
              onClick={() => router.push("/resume-builder")}
              className="h-12! px-6! rounded-xl! border-border! hover:border-primary! font-bold! tracking-tight!"
            >
              Resume Builder
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<EditOutlined />}
              onClick={() => setIsEditModalOpen(true)}
              className="h-12! px-6! rounded-xl! bg-primary! border-none! font-bold! tracking-tight! shadow-lg! shadow-primary/20"
            >
              Edit Profile
            </Button>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((s, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.1 + i * 0.05)}
              className="glass premium-card p-6 flex flex-col gap-4 border-none shadow-2xl! shadow-black/5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mb-1">
                  {s.label}
                </p>
                {isLoading ? (
                  <Skeleton.Input size="small" active className="h-8!" />
                ) : s.percent !== undefined ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-foreground tracking-tighter">
                      {s.percent}%
                    </span>
                    <Progress
                      type="circle"
                      percent={s.percent}
                      size={28}
                      strokeColor={s.color}
                      trailColor="rgba(var(--foreground-rgb), 0.05)"
                      format={() => null}
                    />
                  </div>
                ) : (
                  <span className="text-3xl font-black text-foreground tracking-tighter">
                    {s.value}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main content: Profile + Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Profile card */}
          <motion.div {...fadeUp(0.3)} className="lg:col-span-3">
            <div className="glass premium-card h-full border-none shadow-2xl! shadow-black/5">
              <div
                className="h-32 rounded-t-3xl relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, var(--accent) 60%, var(--secondary) 100%)",
                }}
              >
                <div className="absolute inset-0 opacity-10 blur-3xl animate-pulse bg-white/20" />
              </div>

              <div className="px-8 pb-10">
                <div className="flex items-end justify-between -mt-12 mb-8">
                  <div
                    className="rounded-full p-1 shadow-2xl shadow-black/20"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--accent))",
                    }}
                  >
                    <Avatar
                      size={100}
                      icon={<UserOutlined />}
                      src={user?.profilePhoto}
                      className="border-4 border-card!"
                    />
                  </div>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditModalOpen(true)}
                    className="rounded-full! px-4! h-8! font-bold! text-xs! tracking-wide! border-border!"
                  >
                    Update
                  </Button>
                </div>

                {isLoading ? (
                  <Skeleton active avatar={false} paragraph={{ rows: 6 }} />
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tighter">
                        {user?.name}
                      </h2>
                      <p className="text-lg text-muted-foreground font-medium truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-foreground/3 border border-foreground/5">
                        <InfoRow
                          icon={<UserOutlined className="text-primary" />}
                          label="Gender"
                          value={
                            user?.gender ? capitalize(user.gender) : "Not set"
                          }
                        />
                      </div>
                      <div className="p-5 rounded-2xl bg-foreground/3 border border-foreground/5">
                        <InfoRow
                          icon={<CalendarOutlined className="text-accent" />}
                          label="Birth Date"
                          value={
                            user?.birthDate
                              ? dayjs(user.birthDate).format("MMMM DD, YYYY")
                              : "Not set"
                          }
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-6">
                        Professional Presence
                      </p>
                      <SocialLinks />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Job Applications chart */}
          <motion.div {...fadeUp(0.4)} className="lg:col-span-2">
            <div className="glass premium-card h-full flex flex-col border-none shadow-2xl! shadow-black/5">
              <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-border/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary shadow-inner">
                    <RocketOutlined />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-foreground">
                    Job Hunt Stats
                  </span>
                </div>
                <Button
                  type="link"
                  size="small"
                  icon={<ArrowRightOutlined />}
                  onClick={() => router.push("/jobs")}
                  className="text-primary! font-bold! tracking-tight!"
                >
                  View Desk
                </Button>
              </div>

              <div className="flex-1 px-8 py-8">
                {isLoading ? (
                  <Skeleton active paragraph={{ rows: 10 }} />
                ) : hasJobs ? (
                  <div className="space-y-8">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.jobApplications}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={6}
                            dataKey="count"
                            nameKey="status"
                            animationBegin={200}
                            animationDuration={1500}
                          >
                            {stats.jobApplications.map(
                              (entry: { status: string; count: number }, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  // FIX: use STATUS_COLORS keyed by the actual
                                  // status string so colours have semantic meaning.
                                  // Falls back to FALLBACK_COLOR for unknown statuses.
                                  fill={STATUS_COLORS[entry.status] ?? FALLBACK_COLOR}
                                  stroke="none"
                                />
                              ),
                            )}
                          </Pie>
                          <text
                            x="50%"
                            y="45%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-foreground font-black text-3xl tracking-tighter"
                          >
                            {stats.jobApplications.reduce(
                              (s: number, e: { count: number }) => s + e.count,
                              0,
                            )}
                          </text>
                          <text
                            x="50%"
                            y="58%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]"
                          >
                            Jobs
                          </text>
                          <Tooltip
                            contentStyle={{
                              background:
                                "rgba(var(--background-rgb, 10, 10, 10), 0.8)",
                              backdropFilter: "blur(12px)",
                              border: "1px solid var(--border)",
                              borderRadius: "16px",
                              color: "var(--foreground)",
                              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Status breakdown */}
                    <div className="grid grid-cols-2 gap-3">
                      {stats.jobApplications.map(
                        (
                          entry: { status: string; count: number },
                          i: number,
                        ) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-xl bg-foreground/3 border border-foreground/1"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  // FIX: consistent with the pie chart above
                                  background: STATUS_COLORS[entry.status] ?? FALLBACK_COLOR,
                                }}
                              />
                              <span className="text-xs text-muted-foreground font-bold truncate max-w-[80px]">
                                {entry.status}
                              </span>
                            </div>
                            <span className="text-xs font-black text-foreground">
                              {entry.count}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16 gap-6">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl bg-muted/30 text-muted-foreground shadow-inner">
                      <RocketOutlined />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-xl text-foreground tracking-tight">
                        No actions yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">
                        Ready to start your next chapter?
                      </p>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => router.push("/jobs")}
                      className="h-12! px-8! rounded-xl! bg-primary! border-none! font-bold!"
                    >
                      Launch Mission
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {user && (
        <EditProfileModal
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-xl shrink-0 opacity-80">{icon}</div>
      <div className="min-w-0 flex-1 flex flex-col">
        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">
          {label}
        </span>
        <span className="text-base font-bold text-foreground truncate mt-0.5">
          {value}
        </span>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
