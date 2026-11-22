"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import CourseForm from "@/components/CourseForm";
import Loading from "@/components/Loading";
import type { CourseInput } from "@/types";

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<CourseInput | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/admin/courses/${id}`)
      .then((r) => {
        const c = r.data.data;
        setInitial({
          title: c.title,
          category_id: c.category_id,
          description: c.description,
          thumbnail: c.thumbnail,
          level: c.level,
          status: c.status,
        });
      })
      .catch(() => setError("Course tidak ditemukan atau bukan milikmu."));
  }, [id]);

  if (error) return <p className="text-slate-500">{error}</p>;
  if (!initial) return <Loading />;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-blue-950">Edit Course</h1>
      <CourseForm
        initial={initial}
        submitLabel="Simpan perubahan"
        onSubmit={async (d) => {
          await api.put(`/admin/courses/${id}`, d);
          router.push("/admin/courses");
        }}
      />
    </div>
  );
}
