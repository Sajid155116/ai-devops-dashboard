"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasJwtToken } from "./lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (hasJwtToken()) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/login");
  }, [router]);

  return null;
}