"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GlobalOutlined,
  LoadingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Input, Empty } from "antd";
import { message } from "@/lib/antd";
import {
  getUsers,
  sendFriendRequest,
  respondToFriendRequest,
  cancelFriendRequest,
  getSentRequests,
  getFriends,
} from "@/lib/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@/components/ChatProvider";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import UserCard from "@/components/UserCard";

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openChat } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isLoggedIn] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("token"),
  );

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const { data: sentRequests = [] } = useQuery({
    queryKey: ["friendships", "sent"],
    queryFn: getSentRequests,
    enabled: isLoggedIn,
  });

  // FIX: fetch friends list upfront and keep it in the query cache.
  // Previously getFriends() was called inside the onMessage click handler
  // on every click, hammering the API unnecessarily.
  const { data: friends = [] } = useQuery({
    queryKey: ["friendships", "accepted"],
    queryFn: getFriends,
    enabled: isLoggedIn,
  });

  const handleAction = async (
    userId: string,
    action: string,
    friendshipId?: string,
  ) => {
    setActionLoadingId(userId);
    try {
      if (action === "ADD") {
        await sendFriendRequest(userId);
        message.success("Friend request sent!");
      } else if (action === "CANCEL") {
        const idToCancel =
          friendshipId || sentRequests.find((r) => r.user.id === userId)?.id;
        if (idToCancel) {
          await cancelFriendRequest(idToCancel);
          message.success("Request cancelled");
        }
      } else if (action === "ACCEPT" || action === "REJECT") {
        let idToRespond = friendshipId;
        if (!idToRespond) {
          const receivedData = await queryClient.fetchQuery({
            queryKey: ["friendships", "received"],
            queryFn: () =>
              import("@/lib/user").then((m) => m.getReceivedRequests()),
          });
          idToRespond = receivedData.find((r) => r.user.id === userId)?.id;
        }
        if (idToRespond) {
          await respondToFriendRequest(
            idToRespond,
            action as "ACCEPT" | "REJECT",
          );
          message.success(`Request ${action.toLowerCase()}ed`);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      message.error(
        axiosError.response?.data?.message ||
          `Failed to ${action.toLowerCase()}`,
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const containerStyle = {
    background:
      "radial-gradient(circle at top left, var(--color-primary-hover) 0%, transparent 20%), radial-gradient(circle at bottom right, var(--color-accent-hover) 0%, transparent 20%)",
  };

  return (
    <div
      className="page-container pt-15 md:pt-20 pb-10 min-h-dvh"
      style={containerStyle}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-16 mt-12"
      >
        <div className="flex flex-col items-center justify-center px-5 gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
              <GlobalOutlined />
              <span>Global Network</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              Discover{" "}
              <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Developers
              </span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl font-medium">
              Explore and connect with talented developers from around the
              world. Build your network and collaborate on amazing projects.
            </p>
          </div>

          <div className="relative w-full md:max-w-md">
            <Input
              placeholder="Search by name or email..."
              prefix={<SearchOutlined className="text-muted-foreground mr-2" />}
              size="large"
              className="h-14 md:h-16"
              style={{
                borderRadius: "1.25rem",
                border: "1px solid var(--border)",
                backgroundColor: "var(--color-card)",
                backdropFilter: "blur(24px)",
                transition: "all 0.3s ease",
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* Users Grid */}
      <div className="max-w-7xl mx-auto px-5 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse scale-150" />
              <LoadingOutlined className="text-6xl text-primary animate-spin relative" />
            </div>
            <p className="text-muted-foreground animate-pulse font-bold text-lg">
              Summoning developers...
            </p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  type="global"
                  isLoggedIn={isLoggedIn}
                  loading={actionLoadingId === user.id}
                  onAction={handleAction}
                  onViewProfile={() => router.push(`/users/${user.id}`)}
                  onMessage={() => {
                    // FIX: use the already-fetched friends cache instead of
                    // calling getFriends() on every single click.
                    const friend = friends.find((f) => f.user.id === user.id);
                    if (friend) {
                      openChat(friend);
                    } else {
                      message.warning("You must be friends to start a chat.");
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32"
          >
            <Empty
              description={
                <div className="space-y-4">
                  <p className="text-muted-foreground text-2xl font-bold">
                    No developers found
                  </p>
                  <p className="text-muted-foreground/60">
                    Try searching for a different name or email
                  </p>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        .ant-input-affix-wrapper-lg {
          padding: 0 1.5rem !important;
        }
        .ant-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.025em;
        }
      `}</style>
    </div>
  );
}
