import Link from "next/link";
import type { Course } from "@/types";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        loading="lazy"
        src={course.thumbnail ?? ""}
        alt={course.title}
        className="aspect-video w-full bg-slate-200 object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
            {course.category}
          </span>
          {course.is_enrolled && (
            <span className="font-medium text-green-600">Terdaftar</span>
          )}
        </div>
        <h3 className="font-semibold text-blue-950">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {course.description}
        </p>
        <p className="mt-auto pt-3 text-xs text-slate-500">
          {course.instructor} · {course.duration} menit ·{" "}
          <span className="capitalize">{course.level}</span>
        </p>
      </div>
    </Link>
  );
}
