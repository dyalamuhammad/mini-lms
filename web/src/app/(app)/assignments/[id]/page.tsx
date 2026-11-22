"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import type { Assignment } from "@/types";

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [a, setA] = useState<Assignment | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .get(`/assignments/${id}`)
      .then((r) => {
        setA(r.data.data);
        setText(r.data.data.submission_text ?? "");
      })
      .catch(() =>
        setError("Tugas tidak ditemukan atau kamu belum terdaftar."),
      );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post(`/assignments/${id}/submit`, { submission_text: text });
      await load();
    } catch (err: any) {
      setError(
        err.response?.data?.errors?.submission_text?.[0] ??
          err.response?.data?.message ??
          "Gagal mengirim.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!a)
    return error ? <p className="text-slate-500">{error}</p> : <Loading />;

  const submitted = a.status === "submitted";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/assignments"
        className="text-sm text-blue-700 hover:underline"
      >
        ← Semua tugas
      </Link>

      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-medium text-blue-700">{a.course}</p>
          <h1 className="text-xl font-bold text-blue-950">{a.title}</h1>
          <p className="text-sm text-slate-500">
            Deadline:{" "}
            {a.deadline ? new Date(a.deadline).toLocaleString("id-ID") : "-"}
          </p>
        </div>
        <p className="text-slate-700">{a.description}</p>

        <form
          onSubmit={submit}
          className="space-y-3 border-t border-slate-100 pt-4"
        >
          <label
            htmlFor="answer"
            className="text-sm font-medium text-slate-700"
          >
            Jawabanmu
          </label>
          <textarea
            id="answer"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600"
          />
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
          {submitted && (
            <p className="text-sm text-green-700">
              ✓ Terkirim. Kamu masih bisa mengubah jawaban sebelum deadline.
            </p>
          )}
          <button
            disabled={saving}
            className="rounded-lg bg-blue-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-60"
          >
            {saving
              ? "Mengirim..."
              : submitted
                ? "Perbarui jawaban"
                : "Kirim tugas"}
          </button>
        </form>
      </div>
    </div>
  );
}
