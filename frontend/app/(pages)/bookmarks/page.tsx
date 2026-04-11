"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusOutlined,
  SearchOutlined,
  StarOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  CompassOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Button, Input, Select, Modal, Form, message } from "antd";
import BookmarkCard, { Bookmark } from "@/components/BookmarkCard";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: "1",
    title: "Google",
    url: "https://google.com",
    category: "General",
    favicon: "https://www.google.com/s2/favicons?domain=google.com&sz=64",
  },
  {
    id: "2",
    title: "GitHub",
    url: "https://github.com",
    category: "Dev Tools",
    favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
  },
  {
    id: "3",
    title: "Stack Overflow",
    url: "https://stackoverflow.com",
    category: "Resources",
    favicon:
      "https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=64",
  },
  {
    id: "4",
    title: "Next.js Docs",
    url: "https://nextjs.org/docs",
    category: "Resources",
    favicon: "https://www.google.com/s2/favicons?domain=nextjs.org&sz=64",
  },
];

const CATEGORIES = [
  "All",
  "General",
  "Dev Tools",
  "Design",
  "Resources",
  "Social",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } as const,
});

export default function BookmarksPage() {
  const queryClient = useQueryClient();
  const [localBookmarks, setLocalBookmarks] =
    useState<Bookmark[]>(DEFAULT_BOOKMARKS);
  const [hydrated, setHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [form] = Form.useForm();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load from localStorage only after client-side hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user_bookmarks");
      if (saved) {
        setLocalBookmarks(JSON.parse(saved));
      }

      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    } catch (e) {
      console.error("Failed to parse bookmarks or token", e);
    }
    setHydrated(true);
  }, []);

  // DB Bookmarks Query
  const {
    data: dbBookmarks = [],
    isLoading: isLoadingDb,
    isError: isErrorDb,
    error: dbError,
  } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      console.log("Fetching bookmarks from DB...");
      const response = await api.get("/user-bookmarks");
      console.log("Fetched bookmarks:", response.data);
      return response.data;
    },
    enabled: isLoggedIn && hydrated,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Bookmark>) => api.post("/bookmarks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      message.success("Bookmark added to cloud!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/bookmarks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      message.success("Bookmark removed from cloud");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Bookmark> }) =>
      api.patch(`/user-bookmarks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      message.success("Bookmark updated in cloud!");
    },
  });

  const syncMutation = useMutation({
    mutationFn: (bookmarks: Bookmark[]) =>
      api.post("/user-bookmarks/sync", bookmarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      localStorage.removeItem("user_bookmarks");
      setLocalBookmarks(DEFAULT_BOOKMARKS);
      message.success("Local bookmarks synced to your account!");
    },
  });

  const bookmarks = isLoggedIn ? dbBookmarks : localBookmarks;

  // Remove the old useEffect that handled hydration as it's now merged into the top one

  // Save local bookmarks to localStorage
  useEffect(() => {
    if (!hydrated || isLoggedIn) return;
    localStorage.setItem("user_bookmarks", JSON.stringify(localBookmarks));
  }, [localBookmarks, hydrated, isLoggedIn]);

  // Sync logic: If logged in and have unsynced local bookmarks
  useEffect(() => {
    if (isLoggedIn && hydrated && localBookmarks.length > 0) {
      // Find bookmarks NOT in DEFAULT_BOOKMARKS
      const customBookmarks = localBookmarks.filter(
        (local) => !DEFAULT_BOOKMARKS.some((def) => def.url === local.url),
      );
      if (customBookmarks.length > 0) {
        syncMutation.mutate(customBookmarks);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, hydrated, localBookmarks.length]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b: Bookmark) => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || b.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [bookmarks, searchQuery, selectedCategory]);

  const handleAddOrUpdate = async (values: Partial<Bookmark>) => {
    if (!values.url) return;
    const domain = new URL(
      values.url.startsWith("http") ? values.url : `https://${values.url}`,
    ).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const bookmarkData = { ...values, favicon: faviconUrl };

    if (isLoggedIn) {
      if (editingBookmark) {
        await updateMutation.mutateAsync({
          id: editingBookmark.id,
          data: bookmarkData,
        });
      } else {
        await createMutation.mutateAsync(bookmarkData);
      }
    } else {
      if (editingBookmark) {
        setLocalBookmarks((prev) =>
          prev.map((b) =>
            b.id === editingBookmark.id
              ? ({ ...b, ...bookmarkData } as Bookmark)
              : b,
          ),
        );
        message.success("Bookmark updated locally!");
      } else {
        const newBookmark: Bookmark = {
          id: Date.now().toString(),
          title: values.title || "Untitled",
          url: values.url!,
          category: values.category || "General",
          favicon: faviconUrl,
        };
        setLocalBookmarks((prev) => [newBookmark, ...prev]);
        message.success("Bookmark added locally!");
      }
    }
    setIsModalOpen(false);
    setEditingBookmark(null);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    if (isLoggedIn) {
      deleteMutation.mutate(id);
    } else {
      setLocalBookmarks((prev) => prev.filter((b) => b.id !== id));
      message.success("Bookmark removed locally");
    }
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    form.setFieldsValue(bookmark);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container selection:bg-primary/20 bg-background min-h-screen">
      <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
        {/* ── Header Section ── */}
        <div className="w-full flex flex-col items-center gap-8 mb-16">
          <motion.div {...fadeUp(0)}>
            <h1 className="text-xl md:text-4xl font-black tracking-tighter text-foreground leading-tight">
              Curate Your
              <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent italic inline-block ml-2">
                Digital Universe
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mt-6 font-medium max-w-xl leading-relaxed">
              Save, organize, and access your favorite web destinations with
              style. Everything you need, just one click away.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp(0.1)}
            className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto"
          >
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingBookmark(null);
                form.resetFields();
                setIsModalOpen(true);
              }}
              className="h-14! px-8! rounded-2xl! bg-primary! border-none! font-bold! tracking-tight! shadow-xl! shadow-primary/25 hover:scale-105 transition-transform"
            >
              Add New Bookmark
            </Button>
          </motion.div>
        </div>

        {/* ── Search & Filter Bar ── */}
        <motion.div
          {...fadeUp(0.2)}
          className="glass premium-card p-4 mb-12 flex flex-col md:flex-row items-center gap-4 border-none shadow-2xl! shadow-black/5"
        >
          <div className="relative w-full md:flex-1">
            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              placeholder="Search bookmarks..."
              variant="borderless"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12! pl-12! pr-4! rounded-xl! bg-foreground/3! border-none! font-medium! text-foreground!"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "bg-foreground/5 text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Stats / Quick Access ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <motion.div
            {...fadeUp(0.3)}
            className="glass premium-card p-6 border-none shadow-xl! shadow-black/5 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl shadow-inner">
              <StarOutlined />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                Total Bookmarks
              </p>
              <h4 className="text-3xl font-black text-foreground tracking-tighter">
                {bookmarks.length}
              </h4>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.4)}
            className="glass premium-card p-6 border-none shadow-xl! shadow-black/5 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-2xl shadow-inner">
              <ThunderboltOutlined />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                Efficiency Score
              </p>
              <h4 className="text-3xl font-black text-foreground tracking-tighter">
                98%
              </h4>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.5)}
            className="glass premium-card p-6 border-none shadow-xl! shadow-black/5 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-2xl shadow-inner">
              <CompassOutlined />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                Active Categories
              </p>
              <h4 className="text-3xl font-black text-foreground tracking-tighter">
                {new Set(bookmarks.map((b: Bookmark) => b.category)).size}
              </h4>
            </div>
          </motion.div>
        </div>

        {/* ── Grid of Bookmarks ── */}
        {isLoadingDb && isLoggedIn ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : isErrorDb && isLoggedIn ? (
          <div className="text-center py-20 glass premium-card border-none">
            <h3 className="text-xl font-bold text-error">
              Failed to load bookmarks
            </h3>
            <p className="text-muted-foreground mt-2">
              {(dbError as Error)?.message || "Unknown error"}
            </p>
            <Button
              className="mt-4"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
              }
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredBookmarks.length > 0 ? (
                filteredBookmarks.map((bookmark: Bookmark, index: number) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    index={index}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-24 text-center glass premium-card border-none"
                >
                  <div className="w-20 h-20 rounded-3xl bg-foreground/5 text-muted-foreground/30 flex items-center justify-center text-4xl mx-auto mb-6">
                    <GlobalOutlined />
                  </div>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter">
                    No bookmarks found
                  </h3>
                  <p className="text-muted-foreground mt-2 font-medium">
                    Try a different search or add a new one.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── Bookmark Modal ── */}
      <Modal
        title={
          <div className="flex items-center gap-3 pt-4 pb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
              {editingBookmark ? <EditOutlined /> : <PlusOutlined />}
            </div>
            <span className="font-black text-2xl tracking-tighter text-foreground">
              {editingBookmark ? "Edit Bookmark" : "New Collection"}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingBookmark(null);
        }}
        footer={null}
        width={480}
        className="premium-modal"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrUpdate}
          className="mt-6"
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label={
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Display Name
              </span>
            }
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input
              placeholder="e.g. My Awesome Portfolio"
              className="h-12! rounded-xl! bg-foreground/3! border-border/10! font-bold!"
            />
          </Form.Item>

          <Form.Item
            name="url"
            label={
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Website URL
              </span>
            }
            rules={[{ required: true, message: "Please enter a URL" }]}
          >
            <Input
              placeholder="e.g. https://github.com"
              className="h-12! rounded-xl! bg-foreground/3! border-border/10! font-bold!"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label={
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Category
              </span>
            }
            initialValue="General"
            rules={[{ required: true }]}
          >
            <Select className="h-12! rounded-xl! child:rounded-xl!">
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <Select.Option key={c} value={c}>
                  {c}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex gap-4 mt-10">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 h-12! rounded-xl! font-bold! tracking-tight! border-border!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="flex-1 h-12! rounded-xl! bg-primary! border-none! font-bold! tracking-tight! shadow-lg! shadow-primary/20"
            >
              {editingBookmark ? "Update Mission" : "Launch Collection"}
            </Button>
          </div>
        </Form>
      </Modal>

      <style jsx global>{`
        .premium-modal .ant-modal-content {
          background: var(--card) !important;
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .premium-modal .ant-modal-header {
          background: transparent !important;
          border: none;
        }
        .premium-modal .ant-form-item-label label {
          height: auto !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
