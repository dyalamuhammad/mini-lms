"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="lg:pl-64">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            ☰
          </button>
          <span className="font-bold text-blue-950">LearnPath</span>
        </header>

        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
