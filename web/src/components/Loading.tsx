export default function Loading({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      {label}
    </div>
  );
}
