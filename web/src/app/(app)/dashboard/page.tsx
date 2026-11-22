"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-blue-950">Halo, {user?.name}</h1>
      <button
        onClick={logout}
        className="mt-4 rounded-lg bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300"
      >
        Logout
      </button>
    </main>
  );
}
