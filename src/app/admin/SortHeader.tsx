import Link from "next/link";

export default function SortHeader({
  label,
  col,
  basePath,
  sort,
  dir,
  align = "left",
}: {
  label: string;
  col: string;
  basePath: string;
  sort?: string;
  dir?: string;
  align?: "left" | "right";
}) {
  const active = sort === col;
  const nextDir = active && dir === "asc" ? "desc" : "asc";
  return (
    <Link
      href={`${basePath}?sort=${col}&dir=${nextDir}`}
      className={`inline-flex items-center gap-1 hover:text-ink ${active ? "text-ink" : ""} ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      {label}
      <span className="text-[8px]">{active ? (dir === "asc" ? "▲" : "▼") : "↕"}</span>
    </Link>
  );
}
