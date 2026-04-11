"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// FIX: This page was an orphaned duplicate of /resume-builder with an
// unused `Select` import and no route guard. It has been replaced with a
// simple client-side redirect so any bookmarked or linked /resume URLs
// still work without showing a broken page.
export default function ResumePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/resume-builder");
  }, [router]);

  return null;
}
