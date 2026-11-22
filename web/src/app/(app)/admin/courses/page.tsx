"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import type { AdminCourse } from "@/types";

export default function AdminCoursesPage() {
  const [items, setItems] = useState<AdminCourse[] | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    api.get("/admin/courses").then((r) => setItems(r.data.data));

  useEffect(() => {
    load();
  }, []);

  const remove = async (c: AdminCourse) => {
    if (!confirm(`Hapus course "${c.title}"?`)) return;
    setError("");
    try {
      await api.delete(`/admin/courses/${c.id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal menghapus.");
    }
  };

  if (!items) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-blue-700 hover:underline">
            ← Panel
          </Link>
          <h1 className="text-2xl font-bold text-blue-950">Kelola Course</h1>
        </div>
        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
        >
          + Course Baru
        </Link>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-slate-500">
            <tr>
              <th className="p-4">Course</th>
              <th className="p-4">Status</th>
              <th className="p-4">Modul / Lesson</th>
              <th className="p-4">Student</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0">
                <td className="p-4">
                  <p className="font-medium text-slate-900">{c.title}</p>
                  <p className="text-xs text-slate-500">
                    {c.category} · <span className="capitalize">{c.level}</span>
                  </p>
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.status === "published" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-slate-700">
                  {c.modules_count} / {c.lessons_count}
                </td>
                <td className="p-4 text-slate-700">{c.enrollments_count}</td>
                <td className="space-x-3 p-4 text-right">
                  <Link
                    href={`/admin/courses/${c.id}/edit`}
                    className="text-blue-700 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => remove(c)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
