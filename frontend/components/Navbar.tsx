"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MenuOutlined,
  CloseOutlined,
  SunOutlined,
  MoonOutlined,
  BellOutlined,
  CheckCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  MoonFilled,
} from "@ant-design/icons";
import { useTheme } from "next-themes";
import { Badge, Popover, List, Button, Empty, Avatar } from "antd";
import { message } from "@/lib/antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  Notification,
} from "@/lib/notification";
import { respondToFriendRequest } from "@/lib/user";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import SiteTitle from "./SiteTitle";
import ThemeToggler from "./ThemeToggler";
import { div } from "framer-motion/client";

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data;
    },
    retry: false,
  });

  const isLoggedIn = !!user;

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000, // Poll every 30 seconds
    enabled: isLoggedIn, // Only fetch if logged in
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const allNavLinks = [
    { href: "/", label: "Home" },
    { href: "/users", label: "Users" },
    { href: "/jobs", label: "My Jobs", protected: true },
    { href: "/friends", label: "Friends", protected: true },
    { href: "/profile", label: "Profile", protected: true },
  ];

  const navLinks = allNavLinks.filter((link) => !link.protected || isLoggedIn);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      message.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      message.success("All notifications marked as read");
    } catch {
      message.error("Failed to mark all as read");
    }
  };

  const handleFriendResponse = async (
    notification: Notification,
    action: "ACCEPT" | "REJECT",
  ) => {
    try {
      if (!notification.requesterId) return;
      await respondToFriendRequest(notification.requesterId, action);
      message.success(
        `Friend request ${action === "ACCEPT" ? "accepted" : "rejected"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      message.error(`Failed to ${action.toLowerCase()} request`);
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["profile"], null);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    message.success("Logged out successfully");
    router.push("/auth/login");
  };

  const notificationContent = (
    <div className="w-80">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
        <span className="font-bold text-lg">Notifications</span>
        {unreadCount > 0 && (
          <Button type="link" onClick={handleMarkAllAsRead} size="small">
            Mark all as read
          </Button>
        )}
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notifications.slice(0, 5)}
        locale={{
          emptyText: (
            <Empty
              description="No notifications"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        renderItem={(item) => (
          <List.Item
            className={`cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors ${!item.read ? "bg-primary/5" : ""}`}
            onClick={() =>
              !item.read &&
              item.type !== "FRIEND_REQUEST" &&
              handleMarkAsRead(item.id)
            }
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={
                    item.type === "FRIEND_REQUEST" ? (
                      <UserOutlined />
                    ) : (
                      <CheckCircleOutlined />
                    )
                  }
                  className={!item.read ? "bg-primary" : "bg-muted-foreground"}
                />
              }
              title={
                <span className={!item.read ? "font-bold" : ""}>
                  {item.message}
                </span>
              }
              description={
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  {item.type === "FRIEND_REQUEST" && !item.read && (
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="primary"
                        size="small"
                        className="text-xs h-7 px-3 rounded-full"
                        onClick={() => handleFriendResponse(item, "ACCEPT")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        className="text-xs h-7 px-3 rounded-full"
                        onClick={() => handleFriendResponse(item, "REJECT")}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
      {notifications.length > 5 && (
        <div className="text-center mt-2 pt-2 border-t border-border">
          <Link
            href="/notifications"
            className="text-primary text-sm font-medium"
            onClick={() => document.body.click()}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );

  const avatarContent = (
    <div className="flex flex-col p-2">
      <p>{user?.name}</p>
      <p>{user?.email}</p>
      <Button
        danger
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        classNames={{
          root: "w-full bg-red-400 mt-5",
        }}
      >
        Logout
      </Button>
    </div>
  );

  return (
    <nav
      className={`fixed left-0 right-0 z-50 w-full h-14 transition-all duration-500 ease-in-out border-b bg-background px-0 lg:px-5 ${isScrolled ? "shadow-sm" : "shadow-xs"}`}
    >
      {/* Large Device */}
      <div className="max-w-7xl mx-auto flex items-center h-full border-x">
        <SiteTitle />
        <div className="hidden lg:flex items-center h-full">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>
        {/* Authorize Logic */}
        {isLoggedIn ? (
          <>
            <span className="nav-link">
              <Popover
                content={notificationContent}
                trigger="click"
                placement="bottomRight"
              >
                <Badge count={unreadCount} size="small" offset={[2, -2]}>
                  <span className="circle-button">
                    <BellOutlined className="text-lg" />
                  </span>
                </Badge>
              </Popover>{" "}
            </span>

            <span className="nav-link ">
              <Popover
                content={avatarContent}
                trigger="hover"
                placement="bottomRight"
              >
                <span className="circle-button">
                  <Avatar
                    shape="circle"
                    draggable
                    src={user?.profilePhoto}
                    icon={<UserOutlined />}
                  />
                </span>
              </Popover>
            </span>
          </>
        ) : (
          <Link className="nav-link" href={"/auth/login"}>
            <UserOutlined className="circle-button" />
          </Link>
        )}
        {/* Theme Toggler */}
        <span className="nav-link">
          <ThemeToggler className="circle-button" />
        </span>
        {/* Mobile Nav Button */}
        <div
          className="lg:hidden block h-full z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <CloseOutlined className="text-2xl opacity-60 p-5" />
          ) : (
            <span className="nav-link ">
              <MenuOutlined className="text-xl px-1" />
            </span>
          )}
        </div>

        {/* Mobile Menu Overflow */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="flex flex-col h-full pt-24 px-6 space-y-4">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-6 py-4 rounded-2xl text-2xl font-black tracking-tight text-foreground/60 hover:text-primary hover:bg-primary/5 transition-all opacity-0 animate-nav-slide-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-8 border-t border-border/50 mt-auto pb-12 space-y-4">
                {isLoggedIn ? (
                  <Button
                    danger
                    block
                    size="large"
                    icon={<LogoutOutlined />}
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="h-14 rounded-2xl font-black tracking-tight text-lg"
                  >
                    LOGOUT
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-4 rounded-2xl text-foreground font-black tracking-tight bg-muted/50"
                    >
                      LOG IN
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-4 rounded-2xl bg-primary text-white font-black tracking-tight"
                    >
                      SIGN UP
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
