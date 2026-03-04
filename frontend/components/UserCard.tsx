"use client";

import React from "react";
import { Avatar, Button, Tag, Typography, Tooltip } from "antd";
import {
  UserOutlined,
  CheckCircleFilled,
  MessageOutlined,
  UserAddOutlined,
  CloseOutlined,
  CheckOutlined,
  GlobalOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { User } from "@/lib/user";

const { Text } = Typography;

export interface UserCardProps {
  user: User;
  type: "global" | "friends" | "sent" | "received";
  friendshipId?: string;
  createdAt?: string;
  onAction: (
    userId: string,
    action: string,
    friendshipId?: string,
  ) => Promise<void>;
  onMessage?: () => void;
  onViewProfile?: () => void;
  loading?: boolean;
  isLoggedIn?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  type,
  friendshipId,
  createdAt,
  onAction,
  onMessage,
  onViewProfile,
  loading,
  isLoggedIn = true,
}) => {
  // Determine displayed status for decoration
  const getStatusInfo = () => {
    if (type === "friends")
      return { label: "Connected", color: "var(--success)" };
    if (user.friendshipStatus === "ACCEPTED")
      return { label: "Friend", color: "var(--success)" };
    if (user.friendshipStatus === "PENDING")
      return { label: "Pending", color: "var(--warning)" };
    return { label: "Developer", color: "var(--primary)" };
  };

  const status = getStatusInfo();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative h-full"
    >
      <div className="relative h-full overflow-hidden rounded-4xl border border-border/50 bg-card/40 p-6 backdrop-blur-3xl transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_50px_-12px_rgba(var(--primary-rgb),0.15)] dark:bg-card/20 flex flex-col items-center text-center">
        {/* Background Decorative Element */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-linear-to-br from-primary/10 to-accent/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />

        {/* Avatar Section */}
        <div className="relative mb-6">
          <div className="absolute inset-0 scale-125 rounded-full bg-linear-to-br from-primary/20 to-accent/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <Avatar
            size={90}
            src={user.profilePhoto}
            icon={<UserOutlined />}
            className="relative z-10 border-4 border-card shadow-2xl transition-transform duration-500 group-hover:scale-105"
          />
          {type === "friends" && (
            <div className="absolute bottom-0 right-0 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-success shadow-lg border-2 border-card">
              <SafetyCertificateOutlined className="text-[10px] text-white" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mb-6 w-full grow space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="truncate text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
              {user.name}
            </h3>
          </div>
          <div className="inline-block w-full max-w-[200px] rounded-full bg-muted/30 px-3 py-1 text-xs font-bold text-muted-foreground border border-border/50 transition-colors group-hover:bg-primary/5 group-hover:text-primary/70 truncate">
            {user.email}
          </div>

          {createdAt && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <CalendarOutlined />
              <span>
                Joined{" "}
                {new Date(createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Badge Indicator */}
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-muted/20 px-3 py-1.5 border border-border/30">
          <div
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: status.color }}
          />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            {status.label}
          </span>
        </div>

        {/* Action Buttons - Optimized for Mobile */}
        <div className="w-full flex flex-col gap-2 relative z-10">
          {/* Main Action (Context Sensitive) */}
          <div className="flex gap-2 w-full">
            {type === "global" && (
              <>
                {user.friendshipStatus === "ACCEPTED" ? (
                  <Button
                    block
                    type="primary"
                    icon={<MessageOutlined />}
                    onClick={onMessage}
                    className="h-11 rounded-xl font-black border-none bg-linear-to-r from-primary to-primary-hover shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs tracking-widest uppercase"
                  >
                    Message
                  </Button>
                ) : user.friendshipStatus === "PENDING" && user.isRequester ? (
                  <Button
                    block
                    danger
                    loading={loading}
                    icon={<CloseOutlined />}
                    onClick={() => onAction(user.id, "CANCEL", friendshipId)}
                    className="h-11 rounded-xl font-black border-2 border-error/20 hover:bg-error/10 transition-all text-xs tracking-widest uppercase"
                  >
                    Cancel
                  </Button>
                ) : user.friendshipStatus === "PENDING" && !user.isRequester ? (
                  <>
                    <Button
                      type="primary"
                      loading={loading}
                      icon={<CheckOutlined />}
                      onClick={() => onAction(user.id, "ACCEPT", friendshipId)}
                      className="h-11 flex-1 rounded-xl font-black border-none bg-success shadow-lg shadow-success/20 hover:scale-[1.02] transition-all text-[10px] tracking-widest uppercase"
                    >
                      Accept
                    </Button>
                    <Button
                      danger
                      loading={loading}
                      onClick={() => onAction(user.id, "REJECT", friendshipId)}
                      className="h-11 flex-1 rounded-xl font-black border-2 border-error/20 hover:bg-error/10 transition-all text-[10px] tracking-widest uppercase"
                    >
                      Decline
                    </Button>
                  </>
                ) : (
                  <Button
                    block
                    type="primary"
                    disabled={!isLoggedIn}
                    loading={loading}
                    icon={<UserAddOutlined />}
                    onClick={() => onAction(user.id, "ADD")}
                    className="h-11 rounded-xl font-black border-none bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-xs tracking-widest uppercase"
                  >
                    {isLoggedIn ? "Add Friend" : "Login"}
                  </Button>
                )}
              </>
            )}

            {type === "friends" && (
              <Button
                block
                type="primary"
                icon={<MessageOutlined />}
                onClick={onMessage}
                className="h-11 rounded-xl font-black border-none bg-linear-to-r from-primary to-primary-hover shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs tracking-widest uppercase"
              >
                Chat Now
              </Button>
            )}

            {type === "received" && (
              <>
                <Button
                  type="primary"
                  loading={loading}
                  icon={<CheckOutlined />}
                  onClick={() => onAction(user.id, "ACCEPT", friendshipId)}
                  className="h-11 flex-1 rounded-xl font-black border-none bg-success shadow-lg shadow-success/20 hover:scale-[1.02] transition-all text-[10px] tracking-widest uppercase"
                >
                  Accept
                </Button>
                <Button
                  danger
                  loading={loading}
                  icon={<CloseOutlined />}
                  onClick={() => onAction(user.id, "REJECT", friendshipId)}
                  className="h-11 flex-1 rounded-xl font-black border-2 border-error/20 hover:bg-error/10 transition-all text-[10px] tracking-widest uppercase"
                >
                  Decline
                </Button>
              </>
            )}

            {type === "sent" && (
              <Button
                block
                danger
                loading={loading}
                icon={<CloseOutlined />}
                onClick={() => onAction(user.id, "CANCEL", friendshipId)}
                className="h-11 rounded-xl font-black border-2 border-error/20 hover:bg-error/10 transition-all text-xs tracking-widest uppercase"
              >
                Cancel Request
              </Button>
            )}
          </div>

          {/* Secondary Action (Profile) - Context Sensitive */}
          <div className="flex gap-2 w-full">
            <Button
              block
              icon={<GlobalOutlined />}
              disabled={!isLoggedIn}
              onClick={onViewProfile}
              className="h-11 rounded-xl font-bold border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all text-[10px] tracking-widest uppercase"
            >
              Profile
            </Button>

            {type === "friends" && (
              <Tooltip title="Unfriend">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => onAction(user.id, "UNFRIEND", friendshipId)}
                  className="h-11 w-11 shrink-0 rounded-xl font-black border-2 border-error/20 hover:bg-error/10 transition-all"
                />
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;
