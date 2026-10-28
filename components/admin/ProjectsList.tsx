"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, notifyContentChanged } from "@/lib/client";
import { Btn, Card, EmptyState, Input } from "@/components/admin/ui";
import Icon from "./icons";
import MediaFrame from "@/components/site/MediaFrame";
import type { Category, Project } from "@/lib/content";

export default function ProjectsList({
  initial,
  categories,
}: {
  initial: Project[];
  categories: Category[];
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState<number | null>(null);

  // 服务端数据刷新后同步到本地状态
  useEffect(() => {
    setProjects(initial);
  }, [initial]);

  const visible =
    filter === "all"
      ? projects
      : filter === "draft"
        ? projects.filter((p) => p.status !== "published")
        : projects.filter((p) => p.category?.slug === filter);

  const patch = async (id: number, body: Record<string, unknown>) => {
    setBusyId(id);
    try {
      const res = await api<{ project: Project }>(`/api/projects/${id}`, {
        method: "PUT",
        json: body,
      });
      setProjects((ps) => ps.map((p) => (p.id === id ? res.project : p)));
      notifyContentChanged();
      router.refresh();
    } catch {
      alert("操作失败，请重试");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number, title: string) => {
    if (!confirm(`确定删除「${title}」？此操作不可撤销。`)) return;
    setBusyId(id);
    try {
      await api(`/api/projects/${id}`, { method: "DELETE" });
      setProjects((ps) => ps.filter((p) => p.id !== id));
      notifyContentChanged();
      router.refresh();
    } catch {
      alert("删除失败");
    } finally {
      setBusyId(null);
    }
  };

  const move = async (p: Project, dir: -1 | 1) => {
    const idx = projects.findIndex((x) => x.id === p.id);
    const target = projects[idx + dir];
    if (!target) return;
    await patch(p.id, { sortOrder: target.sortOrder });
    await patch(target.id, { sortOrder: p.sortOrder });
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: `全部 ${projects.length}` },
            { key: "draft", label: `草稿 ${projects.filter((p) => p.status !== "published").length}` },
            ...categories.map((c) => ({
              key: c.slug,
              label: `${c.name} ${projects.filter((p) => p.category?.slug === c.slug).length}`,
            })),
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.97] ${
                filter === f.key
                  ? "border-accent bg-accent/12 text-accent"
                  : "border-line text-fg-muted hover:border-fg hover:text-fg"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-accent px-4 py-2.5 text-[13px] font-medium text-accent-ink transition-opacity hover:opacity-90"
        >
          <Icon name="plus" className="h-4 w-4" />
          新建作品
        </Link>
      </div>

      {visible.length === 0 ? (
        <EmptyState>这里还没有作品。点右上角「新建作品」开始。</EmptyState>
      ) : (
        <div className="space-y-3">
          {visible.map((p, i) => (
            <Card key={p.id} className="!p-3.5">
              <div className="flex items-center gap-4">
                {/* 缩略图 */}
                <Link href={`/admin/projects/${p.id}`} className="shrink-0">
                  <div className="h-16 w-24">
                    <MediaFrame
                      src={p.coverUrl}
                      alt={p.title}
                      seed={p.slug}
                      accent={p.accent}
                      index={i}
                      className="h-full w-full"
                    />
                  </div>
                </Link>

                {/* 信息 */}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/projects/${p.id}`} className="block truncate text-[14px] hover:text-accent">
                    {p.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-fg-subtle">
                    <span className="t-mono">/{p.slug}</span>
                    <span>{p.category?.name ?? "未分类"}</span>
                    <span>{p.year || "—"}</span>
                    <span className="t-mono">排序 {p.sortOrder}</span>
                  </div>
                </div>

                {/* 状态 */}
                <button
                  type="button"
                  disabled={busyId === p.id}
                  onClick={() =>
                    patch(p.id, { status: p.status === "published" ? "draft" : "published" })
                  }
                  title={p.status === "published" ? "点击转为草稿" : "点击发布"}
                  className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] transition-opacity sm:inline-block ${
                    p.status === "published"
                      ? "bg-accent/15 text-accent"
                      : "bg-line text-fg-subtle"
                  }`}
                >
                  {p.status === "published" ? "已发布" : "草稿"}
                </button>

                {/* 操作 */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(p, -1)}
                    title="上移"
                    className="grid h-8 w-8 place-items-center rounded-[var(--radius)] text-fg-subtle transition-colors hover:bg-surface hover:text-fg"
                  >
                    <Icon name="up" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(p, 1)}
                    title="下移"
                    className="grid h-8 w-8 place-items-center rounded-[var(--radius)] text-fg-subtle transition-colors hover:bg-surface hover:text-fg"
                  >
                    <Icon name="down" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id, p.title)}
                    title="删除"
                    className="grid h-8 w-8 place-items-center rounded-[var(--radius)] text-fg-subtle transition-colors hover:bg-surface hover:text-red-400"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
