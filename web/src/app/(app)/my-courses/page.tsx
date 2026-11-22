"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import CourseCard from "@/components/CourseCard";
import type { Course } from "@/types";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    api.get("/my-courses").then((r) => setCourses(r.data.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">My Courses</h1>

      {!courses ? (
        <p className="text-slate-500">Memuat...</p>
      ) : courses.length === 0 ? (
        <p className="text-slate-500">
          Kamu belum mengikuti course apa pun.{" "}
          <Link href="/courses" className="text-blue-700 underline">
            Jelajahi katalog
          </Link>
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
