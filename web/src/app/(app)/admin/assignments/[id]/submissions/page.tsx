"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import type { AdminSubmission } from "@/types";

type Data = {
  assignment: { id: number; title: string; deadline: string | null };
  course: { id: number; title: string };
  submissions: AdminSubmission[];
};

export default function SubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/admin/assignments/${id}/submissions`)
      .then((r) => setData(r.data.data))
      .catch(() => setError("Tugas tidak ditemukan atau bukan milikmu."));
  }, [id]);

  if (error) return <p className="text-slate-500">{error}</p>;
  if (!data) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/admin/courses/${data.course.id}/assignments`}
          className="text-sm text-blue-700 hover:underline"
        >
          ← Tugas: {data.course.title}
        </Link>
        <h1 className="text-2xl font-bold text-blue-950">
          {data.assignment.title}
        </h1>
        <p className="text-sm text-slate-500">
          {data.submissions.length} jawaban masuk
        </p>
      </div>

      {data.submissions.length === 0 ? (
        <p className="text-slate-500">Belum ada jawaban.</p>
      ) : (
        <ul className="space-y-3">
          {data.submissions.map((s) => (
            <li
              key={s.id}
              className="space-y-2 rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{s.student}</p>
                  <p className="text-xs text-slate-500">{s.email}</p>
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(s.submitted_at).toLocaleString("id-ID")}
                </p>
              </div>
              <p className="whitespace-pre-line text-sm text-slate-700">
                {s.submission_text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
