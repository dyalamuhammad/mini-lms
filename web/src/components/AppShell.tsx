"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Loading from "@/components/Loading";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";
import { isStaff, homePath } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const staff = isStaff(user?.role);
  const wrongArea = pathname.startsWith("/profile")
    ? false
    : staff
      ? !pathname.startsWith("/admin")
      : pathname.startsWith("/admin");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    else if (!loading && user && wrongArea) router.replace(homePath(user.role));
  }, [loading, user, wrongArea, router]);

  if (loading || !user || wrongArea) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="lg:pl-64 print:pl-0">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden print:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            ☰
          </button>
          <span className="font-bold text-blue-950">LearnPath</span>
          <ThemeToggle className="ml-auto text-sm text-slate-600" />
        </header>

        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
