"use client";

import { useEffect } from "react";

export default function EntryTracker({ entry }: { entry: "main" | "wedding" }) {
  useEffect(() => {
    // Drop a cookie that expires in 30 days so the Nav knows which silo the user belongs to.
    document.cookie = `entry=${entry}; path=/; max-age=2592000`;
  }, [entry]);

  return null;
}
