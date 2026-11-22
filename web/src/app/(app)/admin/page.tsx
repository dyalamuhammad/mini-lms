"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";
import ProgressBar from "@/components/ProgressBar";
import type { AdminStats, AdminStudent } from "@/types";
import Link from "next/link";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<AdminStudent[] | null>(null);

  useEffect(() => {
    if (user && !["admin", "instructor"].includes(user.role)) {
      router.replace("/dashboard");
      return;
    }
    api.get("/admin/stats").then((r) => setStats(r.data.data));
    api.get("/admin/students").then((r) => setStudents(r.data.data));
  }, [user, router]);

  if (!stats || !students) return <Loading label="Memuat panel admin..." />;

  const cards = [
    { label: "Student", value: stats.students },
    { label: "Course", value: stats.courses },
    { label: "Enrollment", value: stats.enrollments },
    { label: "Enrollment selesai", value: stats.completed_enrollments },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-950">
          {user?.role === "admin" ? "Admin Panel" : "Instructor Panel"}
        </h1>
        <Link
          href="/admin/courses"
          className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
        >
          Kelola Course
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-blue-950">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-blue-950">Student & Progress</h2>
        {students.map((s) => (
          <div
            key={s.id}
            className="border-t border-slate-100 pt-3 first:border-0 first:pt-0"
          >
            <p className="font-medium text-slate-900">{s.name}</p>
            <p className="mb-2 text-xs text-slate-500">{s.email}</p>
            {s.courses.length === 0 ? (
              <p className="text-sm text-slate-400">Belum enroll course.</p>
            ) : (
              <ul className="space-y-2">
                {s.courses.map((c) => (
                  <li key={c.title} className="text-sm">
                    <div className="flex justify-between text-slate-700">
                      <span>{c.title}</span>
                      <span>{c.percentage}%</span>
                    </div>
                    <ProgressBar value={c.percentage} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
