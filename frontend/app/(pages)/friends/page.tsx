"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, Typography, Badge, Skeleton, Card, Empty } from "antd";
import { message } from "@/lib/antd";
import { UserAddOutlined } from "@ant-design/icons";
import {
  getSentRequests,
  getReceivedRequests,
  getFriends,
  respondToFriendRequest,
  cancelFriendRequest,
  unfriend,
  FriendshipRequest,
} from "@/lib/user";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useChat } from "@/components/ChatProvider";
import UserCard from "@/components/UserCard";

const { Title, Text } = Typography;

interface RequestListProps {
  requests: FriendshipRequest[];
  type: "sent" | "received" | "friends";
  onAction: (
    id: string,
    action: "ACCEPT" | "REJECT" | "CANCEL" | "UNFRIEND",
  ) => Promise<void>;
  loading?: boolean;
}

const RequestList = ({
  requests,
  type,
  onAction,
  loading,
}: RequestListProps) => {
  const router = useRouter();
  const { openChat } = useChat();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-4xl overflow-hidden border-border/50 bg-card/20 backdrop-blur-xl h-[400px] p-4"
          >
            <Skeleton avatar active paragraph={{ rows: 3 }} />
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-card/10 backdrop-blur-sm rounded-4xl border border-dashed border-border/50">
        <Empty
          description={
            <span className="text-muted-foreground font-black uppercase tracking-widest">
              No {type} requests
            </span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {requests.map((item) => (
          <UserCard
            key={item.id}
            user={item.user}
            type={type}
            friendshipId={item.id}
            createdAt={item.createdAt}
            onAction={async (userId, action, fId) => {
              const mappedAction = action === "ADD" ? "ACCEPT" : action;
              await onAction(
                fId || item.id,
                mappedAction as "ACCEPT" | "REJECT" | "CANCEL" | "UNFRIEND",
              );
            }}
            onMessage={() => openChat(item)}
            onViewProfile={() => router.push(`/users/${item.user.id}`)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function FriendsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  React.useEffect(() => {
    if (!token && typeof window !== "undefined") {
      router.push("/auth/login");
    }
  }, [token, router]);

  const [activeTab, setActiveTab] = useState("friends");

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friendships", "accepted"],
    queryFn: getFriends,
    enabled: !!token,
  });

  const { data: receivedRequests = [], isLoading: loadingReceived } = useQuery({
    queryKey: ["friendships", "received"],
    queryFn: getReceivedRequests,
    enabled: !!token,
  });

  const { data: sentRequests = [], isLoading: loadingSent } = useQuery({
    queryKey: ["friendships", "sent"],
    queryFn: getSentRequests,
    enabled: !!token,
  });

  if (!token) return null;

  const handleAction = async (
    id: string,
    action: "ACCEPT" | "REJECT" | "CANCEL" | "UNFRIEND",
  ) => {
    try {
      if (action === "CANCEL") {
        await cancelFriendRequest(id);
        message.success("Request cancelled");
      } else if (action === "UNFRIEND") {
        await unfriend(id);
        message.success("Friend removed");
      } else {
        await respondToFriendRequest(id, action);
        message.success(`Request ${action.toLowerCase()}ed successfully`);
      }
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error) {
      message.error(`Failed to perform action`);
      console.error(error);
    }
  };

  return (
    <div className="page-container">
      <section className="px-5 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="space-y-4 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 ">
              <UserAddOutlined />
              <span>Your Network</span>
            </div>
            <Title
              level={1}
              className="m-0! text-2xl md:text-4xl lg:text-6xl font-black! tracking-tight! leading-none!"
            >
              Professional{" "}
              <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Connections
              </span>
            </Title>
            <Text
              type="secondary"
              className="text-lg md:text-xl font-medium block max-w-2xl opacity-80 mt-2 mx-auto"
            >
              Expand your horizons and collaborate with fellow developers.
              Manage your connections and incoming requests in one place.
            </Text>
          </div>
        </motion.div>

        <div className="relative">
          {/* Background Blur Decoration */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

          <Card className="rounded-[3rem] shadow-[0_32px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_100px_-20px_rgba(0,0,0,0.3)] border-border/40 bg-card/30 backdrop-blur-3xl overflow-hidden p-0 md:p-8 transition-all duration-500 z-10">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="large"
              className="custom-tabs"
              items={[
                {
                  key: "friends",
                  label: (
                    <div className="flex items-center gap-3 px-6 py-2">
                      <span className="font-black text-xs md:text-sm uppercase tracking-widest">
                        Friends
                      </span>
                      <Badge
                        count={friends.length}
                        size="small"
                        color="var(--primary)"
                        className="scale-90"
                      />
                    </div>
                  ),
                  children: (
                    <div className="py-10 min-h-[500px]">
                      <RequestList
                        requests={friends}
                        type="friends"
                        onAction={handleAction}
                        loading={loadingFriends}
                      />
                    </div>
                  ),
                },
                {
                  key: "received",
                  label: (
                    <div className="flex items-center gap-3 px-6 py-2">
                      <span className="font-black text-xs md:text-sm uppercase tracking-widest">
                        Incoming
                      </span>
                      <Badge
                        count={receivedRequests.length}
                        size="small"
                        color="var(--accent)"
                        className="scale-90"
                      />
                    </div>
                  ),
                  children: (
                    <div className="py-10 min-h-[500px]">
                      <RequestList
                        requests={receivedRequests}
                        type="received"
                        onAction={handleAction}
                        loading={loadingReceived}
                      />
                    </div>
                  ),
                },
                {
                  key: "sent",
                  label: (
                    <div className="flex items-center gap-3 px-6 py-2">
                      <span className="font-black text-xs md:text-sm uppercase tracking-widest">
                        Sent
                      </span>
                      <Badge
                        count={sentRequests.length}
                        size="small"
                        color="var(--secondary)"
                        className="scale-90"
                      />
                    </div>
                  ),
                  children: (
                    <div className="py-10 min-h-[500px]">
                      <RequestList
                        requests={sentRequests}
                        type="sent"
                        onAction={handleAction}
                        loading={loadingSent}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </section>

      <style jsx global>{`
        .custom-tabs .ant-tabs-nav {
          background: rgba(var(--muted-rgb), 0.05);
          border-radius: 2rem;
          padding: 0.5rem;
          border-bottom: none !important;
          margin-bottom: 2rem !important;
        }
        .custom-tabs .ant-tabs-nav::before {
          display: none !important;
        }
        .custom-tabs .ant-tabs-tab {
          padding: 8px 0 !important;
          margin: 0 4px !important;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
          border-radius: 1.5rem !important;
        }
        .custom-tabs .ant-tabs-tab-active {
          background: var(--color-card) !important;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1) !important;
        }
        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--color-primary) !important;
          transform: scale(1.02);
        }
        .custom-tabs .ant-tabs-ink-bar {
          display: none !important;
        }
        .ant-modal-content {
          border-radius: 3rem !important;
          padding: 3rem !important;
          background: var(--color-card) !important;
          backdrop-filter: blur(24px) !important;
          border: 1px solid var(--border);
        }
        .ant-modal-confirm-title {
          font-size: 1.5rem !important;
          font-weight: 900 !important;
          letter-spacing: -0.025em !important;
        }
        .ant-modal-confirm-btns .ant-btn {
          border-radius: 1.25rem !important;
          height: 3.5rem !important;
          padding: 0 2.5rem !important;
          font-weight: 800 !important;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}
