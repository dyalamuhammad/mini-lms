"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import ProgressBar from "@/components/ProgressBar";
import type { Curriculum, LessonDetail, Progress } from "@/types";
import ReactMarkdown from "react-markdown";
import Loading from "@/components/Loading";

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [cur, setCur] = useState<Curriculum | null>(null);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const openLesson = useCallback(async (id: number) => {
    const r = await api.get(`/lessons/${id}`);
    setLesson(r.data.data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    api
      .get(`/courses/${courseId}/curriculum`)
      .then((r) => {
        const d: Curriculum = r.data.data;
        setCur(d);
        setProgress(d.progress);
        // resume dari lesson terakhir, atau mulai dari lesson pertama
        const start = d.last_lesson_id ?? d.modules[0]?.lessons[0]?.id;
        if (start) openLesson(start);
      })
      .catch((err) =>
        setError(
          err.response?.status === 403
            ? "Kamu belum terdaftar di course ini."
            : "Gagal memuat course.",
        ),
      );
  }, [courseId, openLesson]);

  const complete = async () => {
    if (!lesson) return;
    setSaving(true);
    try {
      const r = await api.post(`/lessons/${lesson.id}/complete`);
      setProgress(r.data.data);
      setLesson({ ...lesson, is_completed: true });
    } finally {
      setSaving(false);
    }
  };

  if (error)
    return (
      <p className="text-slate-500">
        {error}{" "}
        <Link href="/courses" className="text-blue-700 underline">
          Ke katalog
        </Link>
      </p>
    );
  if (!cur || !progress) return <Loading />;

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/my-courses"
          className="text-sm text-blue-700 hover:underline"
        >
          ← My Courses
        </Link>
        <h1 className="text-2xl font-bold text-blue-950">{cur.course.title}</h1>
        <div className="mt-2 max-w-md">
          <ProgressBar value={progress.percentage} />
          <p className="mt-1 text-xs text-slate-500">
            {progress.completed_lessons}/{progress.total_lessons} lesson ·{" "}
            {progress.percentage}%
          </p>
          {progress.percentage === 100 && (
            <Link
              href={`/certificate/${courseId}`}
              className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              🎓 Lihat Sertifikat
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lesson viewer */}
        <section className="space-y-4 lg:col-span-2">
          {!lesson ? (
            <Loading label="Memuat lesson..." />
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {lesson.video_url && (
                <iframe
                  src={lesson.video_url}
                  title={lesson.title}
                  allowFullScreen
                  className="aspect-video w-full bg-slate-900"
                />
              )}
              <div className="space-y-4 p-6">
                <div>
                  <p className="text-xs font-medium text-blue-700">
                    {lesson.module}
                  </p>
                  <h2 className="text-xl font-bold text-blue-950">
                    {lesson.title}
                  </h2>
                </div>
                <div className="space-y-2 text-slate-700">
                  <ReactMarkdown>{lesson.content ?? ""}</ReactMarkdown>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <button
                    disabled={!lesson.prev_lesson_id}
                    onClick={() => openLesson(lesson.prev_lesson_id!)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-40"
                  >
                    ← Sebelumnya
                  </button>

                  {lesson.is_completed ? (
                    <span className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                      ✓ Selesai
                    </span>
                  ) : (
                    <button
                      onClick={complete}
                      disabled={saving}
                      className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-60"
                    >
                      {saving ? "Menyimpan..." : "Tandai selesai"}
                    </button>
                  )}

                  <button
                    disabled={!lesson.next_lesson_id}
                    onClick={() => openLesson(lesson.next_lesson_id!)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-40"
                  >
                    Berikutnya →
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Kurikulum */}
        <aside className="h-fit space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-blue-950">Kurikulum</h3>
          {cur.modules.map((m) => (
            <div key={m.id}>
              <p className="mb-1 text-sm font-medium text-slate-900">
                {m.title}
              </p>
              <ul className="space-y-1">
                {m.lessons.map((l) => {
                  const done = progress.completed_lesson_ids.includes(l.id);
                  const active = lesson?.id === l.id;
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => openLesson(l.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${
                          active
                            ? "bg-blue-50 text-blue-900"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={done ? "text-green-600" : "text-slate-300"}
                        >
                          {done ? "✓" : "○"}
                        </span>
                        <span className="flex-1">{l.title}</span>
                        <span className="text-xs text-slate-400">
                          {l.duration}m
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
