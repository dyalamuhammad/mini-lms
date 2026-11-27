import type { PageMeta } from "@/types";

export default function Pagination({
  meta,
  onChange,
}: {
  meta: PageMeta;
  onChange: (p: number) => void;
}) {
  if (meta.last_page <= 1) return null;

  const btn =
    "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40";

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button
        className={btn}
        disabled={meta.current_page === 1}
        onClick={() => onChange(meta.current_page - 1)}
      >
        ← Sebelumnya
      </button>
      <span className="text-sm text-slate-500">
        {meta.from && meta.to
          ? `${meta.from}-${meta.to} dari ${meta.total}`
          : `Halaman ${meta.current_page} dari ${meta.last_page}`}
      </span>
      <button
        className={btn}
        disabled={meta.current_page === meta.last_page}
        onClick={() => onChange(meta.current_page + 1)}
      >
        Berikutnya →
      </button>
    </div>
  );
}
