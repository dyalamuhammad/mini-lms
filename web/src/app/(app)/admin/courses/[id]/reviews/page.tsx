"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import Stars from "@/components/Stars";

type Data = {
  course: { id: number; title: string };
  average: number;
  count: number;
  reviews: {
    id: number;
    user: string;
    rating: number;
    comment: string | null;
    created_at: string;
  }[];
};

export default function AdminReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/admin/courses/${id}/reviews`)
      .then((r) => setData(r.data.data))
      .catch(() => setError("Course tidak ditemukan atau bukan milikmu."));
  }, [id]);

  if (error) return <p className="text-slate-500">{error}</p>;
  if (!data) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/courses"
          className="text-sm text-blue-700 hover:underline"
        >
          ← Kelola Course
        </Link>
        <h1 className="text-2xl font-bold text-blue-950">
          Ulasan: {data.course.title}
        </h1>
        <p className="text-sm text-slate-500">
          {data.count > 0 ? (
            <>
              <Stars value={data.average} /> {data.average} dari {data.count}{" "}
              ulasan
            </>
          ) : (
            "Belum ada ulasan."
          )}
        </p>
      </div>

      <ul className="space-y-3">
        {data.reviews.map((r) => (
          <li
            key={r.id}
            className="space-y-1 rounded-2xl bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-slate-900">
                {r.user} <Stars value={r.rating} />
              </p>
              <p className="text-xs text-slate-500">
                {new Date(r.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            {r.comment && <p className="text-sm text-slate-700">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
