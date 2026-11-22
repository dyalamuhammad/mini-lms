"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import type { Certificate } from "@/types";

export default function CertificatePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [c, setC] = useState<Certificate | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/courses/${courseId}/certificate`)
      .then((r) => setC(r.data.data))
      .catch((err) =>
        setError(err.response?.data?.message ?? "Sertifikat tidak tersedia."),
      );
  }, [courseId]);

  if (error)
    return (
      <p className="text-slate-500">
        {error}{" "}
        <Link href={`/learn/${courseId}`} className="text-blue-700 underline">
          Kembali belajar
        </Link>
      </p>
    );
  if (!c) return <Loading label="Memuat sertifikat..." />;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/my-courses"
          className="text-sm text-blue-700 hover:underline"
        >
          ← My Courses
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
        >
          Cetak / Simpan PDF
        </button>
      </div>

      <div className="rounded-2xl border-8 border-double border-blue-950 bg-white p-8 text-center shadow-sm sm:p-14 print:rounded-none print:shadow-none">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
          LearnPath
        </p>
        <h1 className="mt-4 text-3xl font-bold text-blue-950 sm:text-4xl">
          Sertifikat Penyelesaian
        </h1>

        <p className="mt-8 text-slate-500">Diberikan kepada</p>
        <p className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          {c.student}
        </p>

        <p className="mt-8 text-slate-500">
          atas keberhasilan menyelesaikan course
        </p>
        <p className="mt-2 text-xl font-semibold text-blue-950 sm:text-2xl">
          {c.course}
        </p>
        <p className="mt-2 text-sm text-slate-500">Durasi {c.duration} menit</p>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 text-sm sm:flex-row">
          <div>
            <p className="font-medium text-slate-900">
              {new Date(c.completed_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-slate-500">Tanggal selesai</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">{c.instructor}</p>
            <p className="text-slate-500">Instruktur</p>
          </div>
        </div>

        <p className="mt-10 text-xs text-slate-400">
          No. Sertifikat: {c.certificate_no}
        </p>
      </div>
    </div>
  );
}
