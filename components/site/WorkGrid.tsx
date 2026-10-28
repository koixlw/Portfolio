"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MediaFrame from "./MediaFrame";
import SectionHeader from "./SectionHeader";
import type { Category, Project } from "@/lib/content";

const HEIGHTS: Record<string, string> = {
  grid: "min-h-[clamp(300px,34vw,460px)]",
  wide: "min-h-[clamp(240px,30vw,430px)]",
  tall: "min-h-[clamp(400px,48vw,660px)]",
};

const SPANS: Record<string, string> = {
  grid: "md:col-span-6",
  wide: "md:col-span-12",
  tall: "md:col-span-6",
};

export default function WorkGrid({
  projects,
  categories,
  title,
  description,
}: {
  projects: Project[];
  categories: Category[];
  title: string;
  description?: string;
}) {
  const [filter, setFilter] = useState<string>("all");

  const visible = useMemo(() => {
    if (filter === "all") return projects;
    if (filter.startsWith("cat:")) {
      const slug = filter.slice(4);
      return projects.filter((p) => p.category?.slug === slug);
    }
    if (filter.startsWith("tag:")) {
      const slug = filter.slice(4);
      return projects.filter((p) => p.tags.some((t) => t.slug === slug));
    }
    return projects;
  }, [projects, filter]);

  const chips: { key: string; label: string; count: number }[] = [
    { key: "all", label: "全部", count: projects.length },
    ...categories.map((c) => ({
      key: `cat:${c.slug}`,
      label: c.name,
      count: projects.filter((p) => p.category?.slug === c.slug).length,
    })),
  ];

  return (
    <section id="work" className="u-container scroll-mt-24 py-24 md:py-32">
      <SectionHeader index="01" eyebrow="SELECTED WORKS" title={title} description={description} />

      {/* 筛选 */}
      <div className="mb-12 flex flex-wrap items-center gap-2" data-reveal>
        {chips.map((c) => {
          const active = filter === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              aria-pressed={active}
              className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] transition-all duration-250 active:scale-[0.97] ${
                active
                  ? "border-transparent bg-fg text-bg"
                  : "border-line text-fg-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {c.label}
              <span className={`t-mono text-[10px] ${active ? "opacity-60" : "opacity-40"}`}>
                {String(c.count).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      {/* 列表 */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-12 md:gap-y-20">
        {visible.map((p, i) => (
          <article
            key={p.id}
            className={`${SPANS[p.layout] ?? SPANS.grid} group`}
            data-reveal
            style={{ "--reveal-delay": `${Math.min(i, 6) * 70}ms` } as React.CSSProperties}
          >
            <Link href={`/work/${p.slug}`} className="block">
              <div className="relative">
                <MediaFrame
                  src={p.coverUrl}
                  alt={p.coverAlt || p.title}
                  seed={p.slug}
                  accent={p.accent}
                  index={i}
                  className={`w-full ${HEIGHTS[p.layout] ?? HEIGHTS.grid}`}
                  sizes={p.layout === "wide" ? "100vw" : "(min-width:768px) 50vw, 100vw"}
                />

                {/* 悬浮信息 */}
                <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium"
                    style={{
                      background: p.accent || "var(--accent)",
                      color: "var(--accent-ink)",
                    }}
                  >
                    查看案例
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* 标题行 */}
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="t-h3 transition-colors duration-300 group-hover:text-accent">
                  {p.title}
                </h3>
                <span className="t-mono shrink-0 text-[11px] text-fg-subtle">{p.year}</span>
              </div>

              {p.summary && (
                <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-fg-muted">
                  {p.summary}
                </p>
              )}

              <div className="mt-3.5 flex flex-wrap items-center gap-3">
                {p.category && (
                  <span
                    className="rounded-full border px-2.5 py-1 text-[10.5px] tracking-wide"
                    style={{
                      borderColor: p.category.color
                        ? `color-mix(in srgb, ${p.category.color} 45%, transparent)`
                        : "var(--line)",
                      color: p.category.color || "var(--fg-muted)",
                    }}
                  >
                    {p.category.name}
                  </span>
                )}
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t.id} className="t-label">
                    #{t.name}
                  </span>
                ))}
              </div>
            </Link>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-24 text-center text-sm text-fg-subtle">这个分类下还没有作品。</p>
      )}
    </section>
  );
}
