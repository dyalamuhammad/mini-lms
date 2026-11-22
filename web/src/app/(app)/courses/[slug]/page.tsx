"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Course } from "@/types";

type Meta = { modules_count: number; lessons_count: number };

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/courses/${slug}`)
      .then((r) => {
        setCourse(r.data.data);
        setMeta(r.data.meta);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const enroll = async () => {
    if (!course) return;
    setError("");
    setEnrolling(true);
    try {
      await api.post(`/courses/${course.id}/enroll`);
      setCourse({ ...course, is_enrolled: true });
    } catch (err: any) {
      if (err.response?.status === 409)
        setCourse({ ...course, is_enrolled: true });
      else setError("Gagal enroll, coba lagi.");
    } finally {
      setEnrolling(false);
    }
  };

  if (notFound)
    return <p className="text-slate-500">Course tidak ditemukan.</p>;
  if (!course || !meta)
    return <p className="text-slate-500">Memuat course...</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/courses" className="text-sm text-blue-700 hover:underline">
        ← Kembali ke katalog
      </Link>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.thumbnail ?? ""}
          alt={course.title}
          className="aspect-[21/9] w-full bg-slate-200 object-cover"
        />
        <div className="space-y-4 p-6">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {course.category}
          </span>
          <h1 className="text-2xl font-bold text-blue-950">{course.title}</h1>
          <p className="text-slate-600">{course.description}</p>

          <dl className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-slate-500">Instruktur</dt>
              <dd className="font-medium">{course.instructor}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Level</dt>
              <dd className="font-medium capitalize">{course.level}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Durasi</dt>
              <dd className="font-medium">{course.duration} menit</dd>
            </div>
            <div>
              <dt className="text-slate-500">Materi</dt>
              <dd className="font-medium">
                {meta.modules_count} modul · {meta.lessons_count} lesson
              </dd>
            </div>
          </dl>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {course.is_enrolled ? (
            <Link
              href={`/learn/${course.id}`}
              className="inline-block rounded-lg bg-blue-950 px-5 py-2.5 font-medium text-white hover:bg-blue-900"
            >
              Mulai / Lanjutkan Belajar
            </Link>
          ) : (
            <button
              onClick={enroll}
              disabled={enrolling}
              className="rounded-lg bg-blue-950 px-5 py-2.5 font-medium text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {enrolling ? "Memproses..." : "Enroll Gratis"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
