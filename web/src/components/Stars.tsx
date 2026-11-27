export default function Stars({
  value,
  size = "text-base",
}: {
  value: number;
  size?: number | string;
}) {
  return (
    <span
      className={`text-amber-500 ${typeof size === "string" ? size : ""}`}
      aria-label={`Rating ${value} dari 5`}
    >
      {"★".repeat(Math.round(value))}
      <span className="text-slate-300">
        {"★".repeat(5 - Math.round(value))}
      </span>
    </span>
  );
}
