"use client";

import { useState, useLayoutEffect } from "react";
import { Avatar, Button, Skeleton, Result, Progress, Tag } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
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
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Interviewing: "#6366f1",
  Accepted: "#10b981",
  Rejected: "#ef4444",
};
const PIE_COLORS = ["#f59e0b", "#6366f1", "#10b981", "#ef4444", "#8b5cf6"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function ProfilePage() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Lazy initializer: reads localStorage once at mount — no state update needed
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
      bg: "rgba(99,102,241,0.08)",
    },
    {
      label: "Pending Requests",
      value: stats?.pendingFriends ?? 0,
      icon: <BellOutlined />,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
    },
    {
      label: "Notifications",
      value: stats?.unreadNotifications ?? 0,
      icon: <BellOutlined />,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
    },
    {
      label: "Resume",
      value: null,
      percent: stats?.resumeCompleteness ?? 0,
      icon: <TrophyOutlined />,
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
    },
  ];

  return (
    <div className="page-container">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-left"
      >
        {/* ── Page header ── */}
        <motion.div
          {...fadeUp(0)}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-foreground leading-tight">
              My{" "}
              <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              Welcome back, {user?.name?.split(" ")[0] || "Developer"}!
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              icon={<FileTextOutlined />}
              onClick={() => router.push("/resume-builder")}
            >
              Resume Builder
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div
          {...fadeUp(0.05)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-border p-4 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ background: "var(--card)" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                  {s.label}
                </p>
                {isLoading ? (
                  <Skeleton.Input size="small" active />
                ) : s.percent !== undefined ? (
                  <div className="flex items-center gap-2">
                    <Progress
                      type="circle"
                      percent={s.percent}
                      size={32}
                      strokeColor={s.color}
                      trailColor="var(--muted)"
                      format={(p) => (
                        <span style={{ fontSize: 9, color: s.color }}>
                          {p}%
                        </span>
                      )}
                    />
                    <span className="text-xl font-black text-foreground">
                      {s.percent}%
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-foreground">
                    {s.value}
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Main content: Profile + Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Profile card */}
          <motion.div {...fadeUp(0.1)} className="lg:col-span-3">
            <div
              className="rounded-2xl border border-border h-full"
              style={{ background: "var(--card)" }}
            >
              {/* Cover strip */}
              <div
                className="h-24 rounded-t-2xl relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, var(--accent) 60%, var(--secondary) 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
              </div>

              <div className="px-5 pb-6">
                {/* Avatar */}
                <div className="flex items-end justify-between -mt-10 mb-5">
                  <div
                    className="rounded-full p-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--accent))",
                    }}
                  >
                    <Avatar
                      size={80}
                      icon={<UserOutlined />}
                      src={user?.profilePhoto}
                      style={{
                        border: "3px solid var(--card)",
                        display: "block",
                      }}
                    />
                  </div>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditModalOpen(true)}
                    style={{ borderRadius: "999px" }}
                  >
                    Edit
                  </Button>
                </div>

                {isLoading ? (
                  <Skeleton active avatar={false} paragraph={{ rows: 5 }} />
                ) : (
                  <>
                    <div className="mb-5">
                      <h2 className="text-xl font-black text-foreground tracking-tight">
                        {user?.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    {/* Details */}
                    <div
                      className="rounded-xl p-4 space-y-3 mb-6"
                      style={{ background: "var(--muted)" }}
                    >
                      <InfoRow
                        icon={
                          user?.gender === "male" ? (
                            <ManOutlined className="text-primary" />
                          ) : user?.gender === "female" ? (
                            <WomanOutlined style={{ color: "#ec4899" }} />
                          ) : (
                            <UserOutlined className="text-muted-foreground" />
                          )
                        }
                        label="Gender"
                        value={
                          user?.gender ? capitalize(user.gender) : "Not set"
                        }
                      />
                      <InfoRow
                        icon={<CalendarOutlined className="text-primary" />}
                        label="Birth Date"
                        value={
                          user?.birthDate
                            ? new Date(user.birthDate).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "Not provided"
                        }
                      />
                      <InfoRow
                        icon={<TrophyOutlined style={{ color: "#f59e0b" }} />}
                        label="Member Since"
                        value={
                          user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                undefined,
                                { year: "numeric", month: "long" },
                              )
                            : "—"
                        }
                      />
                    </div>

                    {/* Social links */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Social Presence
                      </p>
                      <SocialLinks />
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Job Applications chart */}
          <motion.div {...fadeUp(0.15)} className="lg:col-span-2">
            <div
              className="rounded-2xl border border-border h-full flex flex-col"
              style={{ background: "var(--card)" }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-primary"
                    style={{ background: "rgba(99,102,241,0.08)" }}
                  >
                    <RocketOutlined />
                  </div>
                  <span className="font-bold text-foreground">
                    Job Applications
                  </span>
                </div>
                <Button
                  type="link"
                  size="small"
                  icon={<ArrowRightOutlined />}
                  onClick={() => router.push("/jobs")}
                  className="text-primary!"
                >
                  View All
                </Button>
              </div>

              <div className="flex-1 px-5 py-4">
                {isLoading ? (
                  <Skeleton active paragraph={{ rows: 7 }} />
                ) : hasJobs ? (
                  <>
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.jobApplications}
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={72}
                            paddingAngle={4}
                            dataKey="count"
                            nameKey="status"
                          >
                            {stats.jobApplications.map(
                              (_: unknown, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                                  stroke="none"
                                />
                              ),
                            )}
                          </Pie>
                          <text
                            x="50%"
                            y="43%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{
                              fontSize: "1.5rem",
                              fontWeight: 900,
                              fill: "var(--foreground)",
                            }}
                          >
                            {stats.jobApplications.reduce(
                              (s: number, e: { count: number }) => s + e.count,
                              0,
                            )}
                          </text>
                          <text
                            x="50%"
                            y="57%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{
                              fontSize: "0.65rem",
                              fill: "var(--muted-foreground)",
                              fontWeight: 600,
                            }}
                          >
                            Total
                          </text>
                          <Tooltip
                            contentStyle={{
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "0.75rem",
                              color: "var(--foreground)",
                              fontSize: "0.8rem",
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={28}
                            formatter={(value) => (
                              <span
                                style={{
                                  color: "var(--muted-foreground)",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}
                              >
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Status breakdown */}
                    <div className="mt-4 space-y-2">
                      {stats.jobApplications.map(
                        (
                          entry: { status: string; count: number },
                          i: number,
                        ) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{
                                  background: PIE_COLORS[i % PIE_COLORS.length],
                                }}
                              />
                              <span className="text-xs text-muted-foreground font-medium">
                                {entry.status}
                              </span>
                            </div>
                            <Tag
                              color={STATUS_COLORS[entry.status] || "default"}
                              className="text-xs font-bold m-0"
                            >
                              {entry.count}
                            </Tag>
                          </div>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                      style={{
                        background: "var(--muted)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      <RocketOutlined />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-foreground">
                        No applications yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start tracking your job hunt
                      </p>
                    </div>
                    <Button type="primary" onClick={() => router.push("/jobs")}>
                      Start Tracking
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

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
    <div className="flex items-center gap-3">
      <span className="text-base shrink-0">{icon}</span>
      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide shrink-0">
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground truncate text-right">
          {value}
        </span>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
