"use client";

import { message } from "antd";
import { useState } from "react";


type UseImageKitUploadReturn = {
  uploadImage: (file: File) => Promise<string | null>;
  loading: boolean;
};

export const useImageKitUpload = (folder: string = "default"): UseImageKitUploadReturn => {
  const [loading, setLoading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    if (file.size > 3 * 1024 * 1024) {
      message.error("Image size should be under 3MB");
      return null;
    }

    setLoading(true);

    try {
      // 1️⃣ Get signature from your server
      const tokenVal = localStorage.getItem('token');
      const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/image-kit/auth`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(tokenVal ? { "Authorization": `Bearer ${tokenVal}` } : {})
        },
      });

      if (!sigRes.ok) throw new Error("Failed to get signature");
      const { signature, token, expire } = await sigRes.json();

      // 2️⃣ Upload to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("folder", folder);
      formData.append("signature", signature);
      formData.append("token", token);
      formData.append("expire", expire);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);

      const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json();
      message.success("Image uploaded successfully!");
      return data.url; // secure URL
    } catch (err) {
      console.error(err);
      message.error("Failed to upload image");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading };
};
