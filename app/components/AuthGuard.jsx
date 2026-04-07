"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasJwtToken } from "../lib/auth";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hasJwtToken()) {
      router.replace("/login");
      return;
    }

    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return null;
  }

  return children;
}