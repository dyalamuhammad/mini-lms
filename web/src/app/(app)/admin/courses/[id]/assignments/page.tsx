"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import type { AdminAssignment } from "@/types";

const field =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600";
const empty = { title: "", description: "", deadline: "" };

// datetime-local butuh format "YYYY-MM-DDTHH:mm"
const toInput = (d: string | null) =>
  d ? d.slice(0, 16).replace(" ", "T") : "";

export default function AdminAssignmentsPage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<AdminAssignment[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(empty);

  const load = useCallback(
    () =>
      api.get(`/admin/courses/${id}/assignments`).then((r) => {
        setTitle(r.data.data.course.title);
        setItems(r.data.data.assignments);
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

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, deadline: form.deadline || null };
    run(async () => {
      if (editing === "new")
        await api.post(`/admin/courses/${id}/assignments`, payload);
      else await api.put(`/admin/assignments/${editing}`, payload);
      setEditing(null);
    });
  };

  if (error && !items) return <p className="text-slate-500">{error}</p>;
  if (!items) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/courses"
          className="text-sm text-blue-700 hover:underline"
        >
          ← Kelola Course
        </Link>
        <h1 className="text-2xl font-bold text-blue-950">Tugas: {title}</h1>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <ul className="space-y-3">
        {items.length === 0 && (
          <p className="text-slate-500">Belum ada tugas.</p>
        )}
        {items.map((a) => (
          <li key={a.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">{a.title}</p>
                <p className="text-sm text-slate-500">
                  Deadline:{" "}
                  {a.deadline
                    ? new Date(a.deadline).toLocaleString("id-ID")
                    : "-"}{" "}
                  · {a.submissions_count} jawaban
                </p>
              </div>
              <span className="space-x-3 text-sm">
                <button
                  onClick={() => {
                    setEditing(a.id);
                    setForm({
                      title: a.title,
                      description: a.description,
                      deadline: toInput(a.deadline),
                    });
                  }}
                  className="text-blue-700 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    confirm(`Hapus tugas "${a.title}"?`) &&
                    run(() => api.delete(`/admin/assignments/${a.id}`))
                  }
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>

      {editing ? (
        <form
          onSubmit={save}
          className="space-y-3 rounded-2xl bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold text-blue-950">
            {editing === "new" ? "Tugas baru" : "Edit tugas"}
          </h2>
          <input
            className={field}
            placeholder="Judul tugas"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className={field}
            rows={4}
            placeholder="Deskripsi / instruksi"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="space-y-1">
            <label htmlFor="deadline" className="text-sm text-slate-600">
              Deadline (opsional)
            </label>
            <input
              id="deadline"
              type="datetime-local"
              className={field}
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div className="space-x-2">
            <button className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900">
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm text-slate-500 hover:underline"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {
            setEditing("new");
            setForm(empty);
          }}
          className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
        >
          + Tugas Baru
        </button>
      )}
    </div>
  );
}
