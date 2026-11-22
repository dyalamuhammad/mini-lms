"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProgressBar from "@/components/ProgressBar";
import type { Dashboard } from "@/types";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    api.get("/dashboard").then((r) => setData(r.data.data));
  }, []);

  if (!data) return <p className="text-slate-500">Memuat dashboard...</p>;

  const { stats, continue_learning: cont } = data;
  const cards = [
    { label: "Course diikuti", value: stats.total_courses },
    { label: "Sedang berjalan", value: stats.in_progress },
    { label: "Selesai", value: stats.completed },
    { label: "Progress total", value: `${stats.overall_progress}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">
          Halo, {user?.name} 👋
        </h1>
        <p className="text-slate-500">
          Lanjutkan perjalanan belajarmu hari ini.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-blue-950">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold text-blue-950">Continue Learning</h2>
        {cont ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="font-medium text-slate-900">{cont.title}</p>
              <p className="mb-2 text-sm text-slate-500">
                {cont.last_lesson_title
                  ? `Terakhir: ${cont.last_lesson_title}`
                  : "Belum mulai"}
              </p>
              <ProgressBar value={cont.percentage} />
              <p className="mt-1 text-xs text-slate-500">
                {cont.completed_lessons}/{cont.total_lessons} lesson ·{" "}
                {cont.percentage}%
              </p>
            </div>
            <Link
              href={`/learn/${cont.course_id}`}
              className="rounded-lg bg-blue-950 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-900"
            >
              Lanjutkan
            </Link>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Belum ada course aktif.{" "}
            <Link href="/courses" className="text-blue-700 underline">
              Jelajahi katalog
            </Link>
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-blue-950">Tugas Mendatang</h2>
          {data.upcoming_assignments.length === 0 ? (
            <p className="text-sm text-slate-500">Tidak ada tugas mendatang.</p>
          ) : (
            <ul className="space-y-3">
              {data.upcoming_assignments.map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="font-medium text-slate-900">{a.title}</p>
                  <p className="text-slate-500">
                    {a.course} · Deadline {fmt(a.deadline)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-blue-950">
            Aktivitas Terakhir
          </h2>
          {data.recent_activity.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada aktivitas.</p>
          ) : (
            <ul className="space-y-3">
              {data.recent_activity.map((r, i) => (
                <li key={i} className="text-sm">
                  <p className="font-medium text-slate-900">
                    Menyelesaikan: {r.lesson}
                  </p>
                  <p className="text-slate-500">
                    {r.course} · {fmt(r.completed_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
