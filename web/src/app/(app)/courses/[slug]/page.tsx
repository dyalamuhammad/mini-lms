"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Course } from "@/types";
import Loading from "@/components/Loading";
import Stars from "@/components/Stars";
import type { Review } from "@/types";

type Meta = { modules_count: number; lessons_count: number };

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [rev, setRev] = useState<{
    average: number;
    count: number;
    reviews: Review[];
  } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [revMsg, setRevMsg] = useState("");

  const loadReviews = (courseId: number) =>
    api.get(`/courses/${courseId}/reviews`).then((r) => {
      setRev(r.data.data);
      const mine = r.data.data.reviews.find((x: Review) => x.is_mine);
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment ?? "");
      }
    });

  useEffect(() => {
    if (course) loadReviews(course.id);
  }, [course?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setRevMsg("");
    try {
      await api.post(`/courses/${course.id}/reviews`, {
        rating,
        comment: comment || null,
      });
      setRevMsg("Ulasan disimpan.");
      await loadReviews(course.id);
    } catch {
      setRevMsg("Gagal menyimpan ulasan.");
    }
  };

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
  if (!course || !meta) return <Loading label="Memuat Course..." />;

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
      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-blue-950">
          Ulasan{" "}
          {rev && rev.count > 0 && (
            <span className="font-normal text-slate-500">
              · <Stars value={rev.average} /> {rev.average} ({rev.count})
            </span>
          )}
        </h2>

        {course.is_enrolled && (
          <form
            onSubmit={saveReview}
            className="space-y-3 rounded-lg bg-slate-50 p-4"
          >
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="rating"
            >
              Rating kamu
            </label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="ml-2 rounded-lg border border-slate-300 px-2 py-1 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis ulasan singkat (opsional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
            <div className="flex items-center gap-3">
              <button className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900">
                Kirim ulasan
              </button>
              {revMsg && (
                <span className="text-sm text-slate-500">{revMsg}</span>
              )}
            </div>
          </form>
        )}

        {!rev ? null : rev.reviews.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada ulasan.</p>
        ) : (
          <ul className="space-y-3">
            {rev.reviews.map((r) => (
              <li
                key={r.id}
                className="border-t border-slate-100 pt-3 text-sm first:border-0 first:pt-0"
              >
                <p className="font-medium text-slate-900">
                  {r.user}{" "}
                  {r.is_mine && (
                    <span className="text-xs text-blue-700">(kamu)</span>
                  )}{" "}
                  <Stars value={r.rating} />
                </p>
                {r.comment && <p className="text-slate-600">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
