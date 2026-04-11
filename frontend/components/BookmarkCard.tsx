"use client";

import { motion } from "framer-motion";
import {
  GlobalOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { Button, Tooltip, Popconfirm } from "antd";
import Image from "next/image";

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  favicon?: string;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  index: number;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function BookmarkCard({
  bookmark,
  onDelete,
  onEdit,
  index,
}: BookmarkCardProps) {
  return (
    <motion.div
      {...fadeUp(index * 0.05)}
      className="glass premium-card group relative p-5 border-none shadow-2xl! shadow-black/5 hover:shadow-primary/10 transition-all duration-500 overflow-hidden"
    >
      {/* Background glow effect on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-foreground/5 shadow-inner border border-foreground/5 group-hover:border-primary/20 transition-colors duration-500 overflow-hidden">
              {bookmark.favicon ? (
                <Image
                  src={bookmark.favicon}
                  alt={bookmark.title}
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                  unoptimized
                />
              ) : (
                <GlobalOutlined className="text-xl text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-foreground text-lg tracking-tight truncate leading-tight group-hover:text-primary transition-colors">
                {bookmark.title}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5 mt-0.5">
                <FolderOutlined className="text-[10px]" />
                {bookmark.category}
              </p>
            </div>
          </div>

          <div className="flex gap-1 opacity-10 sm:group-hover:opacity-100 transition-opacity duration-300">
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(bookmark)}
                className="hover:text-primary! hover:bg-primary/5! rounded-lg!"
              />
            </Tooltip>
            <Popconfirm
              title="Delete Bookmark"
              description="Are you sure you want to delete this bookmark?"
              onConfirm={() => onDelete(bookmark.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="hover:bg-error/5! rounded-lg!"
                />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-muted-foreground hover:text-primary truncate max-w-[180px] transition-colors flex items-center gap-1.5"
          >
            {bookmark.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>

          <Button
            type="primary"
            size="small"
            href={bookmark.url}
            target="_blank"
            className="rounded-lg! font-bold! text-[10px]! uppercase! tracking-tighter! h-7! px-3! bg-primary! border-none! shadow-lg! shadow-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          >
            Visit
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
