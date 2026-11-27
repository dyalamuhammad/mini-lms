"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import type { AdminModule } from "@/types";

const field =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600";
const emptyLesson = { title: "", content: "", video_url: "", duration: 10 };

export default function CurriculumPage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [modules, setModules] = useState<AdminModule[] | null>(null);
  const [error, setError] = useState("");
  const [newModule, setNewModule] = useState("");
  const [lessonForm, setLessonForm] = useState<{
    moduleId: number;
    lessonId?: number;
  } | null>(null);
  const [form, setForm] = useState(emptyLesson);

  const load = useCallback(
    () =>
      api.get(`/admin/courses/${id}/curriculum`).then((r) => {
        setTitle(r.data.data.course.title);
        setModules(r.data.data.modules);
      }),
    [id],
  );

  useEffect(() => {
    load().catch(() => setError("Course tidak ditemukan atau bukan milikmu."));
  }, [load]);

  const run = async (fn: () => Promise<unknown>) => {
    setError("");
    try {
      await fn();
      await load();
    } catch (err: any) {
      const e = err.response?.data;
      setError(
        e?.errors
          ? Object.values<string[]>(e.errors)[0][0]
          : (e?.message ?? "Terjadi kesalahan."),
      );
    }
  };
  const move = (
    type: "modules" | "lessons",
    itemId: number,
    direction: "up" | "down",
  ) => run(() => api.post(`/admin/${type}/${itemId}/move`, { direction }));

  const addModule = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api.post(`/admin/courses/${id}/modules`, { title: newModule });
      setNewModule("");
    });
  };

  const saveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm) return;
    const payload = {
      ...form,
      video_url: form.video_url || null,
      content: form.content || null,
    };
    run(async () => {
      if (lessonForm.lessonId)
        await api.put(`/admin/lessons/${lessonForm.lessonId}`, payload);
      else
        await api.post(
          `/admin/modules/${lessonForm.moduleId}/lessons`,
          payload,
        );
      setLessonForm(null);
    });
  };

  if (error && !modules) return <p className="text-slate-500">{error}</p>;
  if (!modules) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/courses"
          className="text-sm text-blue-700 hover:underline"
        >
          ← Kelola Course
        </Link>
        <h1 className="text-2xl font-bold text-blue-950">Kurikulum: {title}</h1>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {modules.map((m) => (
        <section
          key={m.id}
          className="space-y-3 rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-blue-950">
              {m.title}
              <button
                onClick={() => move("modules", m.id, "up")}
                aria-label="Naikkan modul"
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                ▲
              </button>
              <button
                onClick={() => move("modules", m.id, "down")}
                aria-label="Turunkan modul"
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                ▼
              </button>
            </h2>{" "}
            <button
              onClick={() =>
                confirm(`Hapus modul "${m.title}"?`) &&
                run(() => api.delete(`/admin/modules/${m.id}`))
              }
              className="text-sm text-red-600 hover:underline"
            >
              Hapus modul
            </button>
          </div>

          <ul className="divide-y divide-slate-100">
            {m.lessons.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-slate-800">
                  {l.title}{" "}
                  <span className="text-slate-400">· {l.duration}m</span>
                </span>
                <span className="space-x-3">
                  <button
                    onClick={() => move("lessons", l.id, "up")}
                    aria-label="Naikkan lesson"
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move("lessons", l.id, "down")}
                    aria-label="Turunkan lesson"
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => {
                      setLessonForm({ moduleId: m.id, lessonId: l.id });
                      setForm({
                        title: l.title,
                        content: l.content ?? "",
                        video_url: l.video_url ?? "",
                        duration: l.duration,
                      });
                    }}
                    className="text-blue-700 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      confirm(`Hapus lesson "${l.title}"?`) &&
                      run(() => api.delete(`/admin/lessons/${l.id}`))
                    }
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </span>
              </li>
            ))}
          </ul>

          {lessonForm?.moduleId === m.id ? (
            <form
              onSubmit={saveLesson}
              className="space-y-3 rounded-lg bg-slate-50 p-4"
            >
              <input
                className={field}
                placeholder="Judul lesson"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className={field}
                rows={4}
                placeholder="Materi (markdown)"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <input
                className={field}
                placeholder="URL video embed (opsional)"
                value={form.video_url}
                onChange={(e) =>
                  setForm({ ...form, video_url: e.target.value })
                }
              />
              <input
                className={field}
                type="number"
                min={0}
                placeholder="Durasi (menit)"
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: Number(e.target.value) })
                }
              />
              <div className="space-x-2">
                <button className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900">
                  {lessonForm.lessonId ? "Simpan" : "Tambah lesson"}
                </button>
                <button
                  type="button"
                  onClick={() => setLessonForm(null)}
                  className="text-sm text-slate-500 hover:underline"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setLessonForm({ moduleId: m.id });
                setForm(emptyLesson);
              }}
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              + Tambah lesson
            </button>
          )}
        </section>
      ))}

      <form onSubmit={addModule} className="flex gap-2">
        <input
          className={field}
          placeholder="Judul modul baru"
          value={newModule}
          onChange={(e) => setNewModule(e.target.value)}
        />
        <button className="shrink-0 rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900">
          + Modul
        </button>
      </form>
    </div>
  );
}
