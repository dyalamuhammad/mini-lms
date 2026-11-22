"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import CourseCard from "@/components/CourseCard";
import type { Category, Course } from "@/types";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import type { PageMeta } from "@/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta | null>(null);

  // reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [search, categoryId]);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .get("/courses", {
          params: {
            search: search || undefined,
            category_id: categoryId || undefined,
            page,
          },
        })
        .then((r) => {
          setCourses(r.data.data);
          setMeta(r.data.meta);
        });
    }, 300); // debounce agar tidak request di setiap ketikan
    return () => clearTimeout(t);
  }, [search, categoryId, page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Course Catalog</h1>
        <p className="text-slate-500">
          Temukan course yang sesuai kebutuhanmu.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Cari nama course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-600 sm:max-w-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-600"
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {!courses ? (
        <Loading />
      ) : courses.length === 0 ? (
        <p className="text-slate-500">Course tidak ditemukan.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
      {meta && <Pagination meta={meta} onChange={setPage} />}
    </div>
  );
}
