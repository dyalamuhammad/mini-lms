"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import CourseForm from "@/components/CourseForm";

export default function NewCoursePage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-blue-950">Course Baru</h1>
      <CourseForm
        submitLabel="Simpan course"
        onSubmit={async (d) => {
          await api.post("/admin/courses", d);
          router.push("/admin/courses");
        }}
      />
    </div>
  );
}
