"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category, CourseInput } from "@/types";

const empty: CourseInput = {
  title: "",
  category_id: "",
  description: "",
  thumbnail: null,
  level: "beginner",
  status: "draft",
};
const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600";

export default function CourseForm({
  initial = empty,
  submitLabel,
  onSubmit,
}: {
  initial?: CourseInput;
  submitLabel: string;
  onSubmit: (d: CourseInput) => Promise<void>;
}) {
  const [d, setD] = useState<CourseInput>(initial);
  const [cats, setCats] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data.data));
  }, []);

  const set = (k: keyof CourseInput, v: string | number) =>
    setD({ ...d, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setSaving(true);
    try {
      await onSubmit({ ...d, thumbnail: d.thumbnail || null });
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setMessage(err.response?.data?.message ?? "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const err = (k: string) =>
    errors[k] && <p className="text-xs text-red-600">{errors[k][0]}</p>;

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
    >
      {message && Object.keys(errors).length === 0 && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {message}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Judul
        </label>
        <input
          id="title"
          className={input}
          value={d.title}
          onChange={(e) => set("title", e.target.value)}
        />
        {err("title")}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="category"
          className="text-sm font-medium text-slate-700"
        >
          Kategori
        </label>
        <select
          id="category"
          className={input}
          value={d.category_id}
          onChange={(e) => set("category_id", Number(e.target.value))}
        >
          <option value="">Pilih kategori</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {err("category_id")}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-700"
        >
          Deskripsi
        </label>
        <textarea
          id="description"
          rows={4}
          className={input}
          value={d.description}
          onChange={(e) => set("description", e.target.value)}
        />
        {err("description")}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="thumbnail"
          className="text-sm font-medium text-slate-700"
        >
          URL thumbnail (opsional)
        </label>
        <input
          id="thumbnail"
          className={input}
          value={d.thumbnail ?? ""}
          onChange={(e) => set("thumbnail", e.target.value)}
        />
        {err("thumbnail")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="level" className="text-sm font-medium text-slate-700">
            Level
          </label>
          <select
            id="level"
            className={input}
            value={d.level}
            onChange={(e) => set("level", e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="status"
            className="text-sm font-medium text-slate-700"
          >
            Status
          </label>
          <select
            id="status"
            className={input}
            value={d.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="draft">Draft (tersembunyi)</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <button
        disabled={saving}
        className="rounded-lg bg-blue-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-60"
      >
        {saving ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
