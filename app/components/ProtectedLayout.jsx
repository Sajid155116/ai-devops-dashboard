"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "./AuthGuard";
import { clearJwtToken } from "../lib/auth";

export default function ProtectedLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    clearJwtToken();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="protected-layout">
        <nav className="top-navbar">
          <div className="top-navbar-inner">
            <h1 className="app-brand">AI DevOps Dashboard</h1>

            <div className="top-navbar-links">
              <Link href="/dashboard" className="top-link">
                Dashboard
              </Link>

              <button type="button" onClick={handleLogout} className="top-link top-link-button">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="protected-main">
          <div className="protected-container">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}