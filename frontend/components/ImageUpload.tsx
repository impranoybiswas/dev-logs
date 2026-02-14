import React, { useRef } from "react";
import { useImageKitUpload } from "@/lib/image-kit";
import Image from "next/image";
import { LoadingOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Spin, Button, Typography } from "antd";
import { motion, AnimatePresence } from "framer-motion";

const { Text } = Typography;

type ImageUploadProps = {
  folder?: string;
  label?: string;
  className?: string;
  value?: string | null;
  onChange?: (url: string | null) => void;
};

export function ImageUpload({
  folder = "profile_photos",
  label = "Profile Photo",
  className = "",
  value = null,
  onChange,
}: ImageUploadProps) {
  const { uploadImage, loading } = useImageKitUpload(folder);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl && onChange) {
      onChange(uploadedUrl);
    }
  };

  const handleDelete = () => {
    if (onChange) {
      onChange(null);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Text strong className="text-sm text-foreground/70">{label}</Text>}

      <div
        onClick={handleContainerClick}
        className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 ${value ? 'border-primary/30 h-48' : 'border-border/60 hover:border-primary/50 h-48'
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          disabled={loading}
          accept="image/*"
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
              <Text type="secondary" className="font-medium">Uploading...</Text>
            </motion.div>
          ) : value ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-full"
            >
              <Image
                fill
                src={value}
                alt="Profile preview"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  icon={<UploadOutlined />}
                  ghost
                  size="small"
                  className="rounded-lg border-white text-white hover:text-primary hover:border-primary"
                >
                  Change
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  size="small"
                  className="rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3 p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UploadOutlined className="text-2xl" />
              </div>
              <div className="space-y-1">
                <Text className="block font-bold">Click to upload photo</Text>
                <Text type="secondary" className="text-xs">JPG, PNG or GIF up to 3MB</Text>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
