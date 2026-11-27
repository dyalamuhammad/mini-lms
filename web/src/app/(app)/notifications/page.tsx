"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import type { Notif } from "@/types";

const icon = { deadline: "⏰", overdue: "⚠️", completed: "🎓" };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[] | null>(null);

  useEffect(() => {
    api.get("/notifications").then((r) => setItems(r.data.data));
  }, []);

  if (!items) return <Loading />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Notifikasi</h1>

      {items.length === 0 ? (
        <p className="text-slate-500">Tidak ada notifikasi baru.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.link}
                className="flex gap-3 rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <span className="text-xl">{icon[n.type]}</span>
                <div>
                  <p className="text-sm text-slate-800">{n.message}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(n.time).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
