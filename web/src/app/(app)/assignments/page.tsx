"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import type { Assignment } from "@/types";

const fmt = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

export default function AssignmentsPage() {
  const [items, setItems] = useState<Assignment[] | null>(null);

  useEffect(() => {
    api.get("/my-assignments").then((r) => setItems(r.data.data));
  }, []);

  if (!items) return <Loading label="Memuat tugas..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Assignments</h1>

      {items.length === 0 ? (
        <p className="text-slate-500">
          Belum ada tugas. Enroll course terlebih dahulu.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                href={`/assignments/${a.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <p className="font-medium text-slate-900">{a.title}</p>
                  <p className="text-sm text-slate-500">
                    {a.course} · Deadline {fmt(a.deadline)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    a.status === "submitted"
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {a.status === "submitted" ? "Terkirim" : "Pending"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
