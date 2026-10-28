import Link from "next/link";
import { all } from "@/lib/db";
import { getCategories, getGlobalLinks, getProfile, getProjects, getTags } from "@/lib/content";
import Icon from "@/components/admin/icons";
import { Card } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const projects = getProjects({ includeDrafts: true });
  const published = projects.filter((p) => p.status === "published");
  const drafts = projects.filter((p) => p.status !== "published");
  const categories = getCategories(true);
  const tags = getTags();
  const links = getGlobalLinks(true);
  const profile = getProfile();
  const media = all<{ id: number }>("SELECT id FROM media");

  const stats = [
    { label: "已发布作品", value: published.length, href: "/admin/projects" },
    { label: "草稿", value: drafts.length, href: "/admin/projects" },
    { label: "分类", value: categories.length, href: "/admin/categories" },
    { label: "标签", value: tags.length, href: "/admin/tags" },
    { label: "外部链接", value: links.length, href: "/admin/links" },
    { label: "媒体资源", value: media.length, href: "/admin/media" },
  ];

  const recent = projects.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* 快速操作 */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-accent px-4 py-2.5 text-[13px] font-medium text-accent-ink transition-opacity hover:opacity-90"
        >
          <Icon name="plus" className="h-4 w-4" />
          新建作品
        </Link>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-line px-4 py-2.5 text-[13px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          <Icon name="external" className="h-4 w-4" />
          查看前台
        </Link>
      </div>

      {/* 概览 */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group bg-elev px-5 py-5 transition-colors hover:bg-surface"
          >
            <div className="font-display text-[26px] leading-none tracking-[-0.03em] transition-colors group-hover:text-accent">
              {String(s.value).padStart(2, "0")}
            </div>
            <div className="t-label mt-2.5">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* 最近作品 */}
        <Card
          title="作品列表"
          description="点击任意作品进入编辑器"
          action={
            <Link href="/admin/projects" className="t-label transition-colors hover:text-fg">
              全部 →
            </Link>
          }
        >
          {recent.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-fg-subtle">还没有作品，点右上角新建。</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="group flex items-center gap-4 py-3 transition-colors hover:text-accent"
                  >
                    <span className="t-mono w-6 shrink-0 text-[11px] text-fg-subtle">
                      {String(p.id).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px]">{p.title}</span>
                    <span className="t-label hidden sm:inline">{p.category?.name ?? "—"}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10.5px] ${
                        p.status === "published"
                          ? "bg-accent/15 text-accent"
                          : "bg-line text-fg-subtle"
                      }`}
                    >
                      {p.status === "published" ? "已发布" : "草稿"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* 个人介绍概览 */}
        <Card
          title="个人介绍"
          action={
            <Link href="/admin/profile" className="t-label transition-colors hover:text-fg">
              编辑 →
            </Link>
          }
        >
          <dl className="space-y-3 text-[13px]">
            {[
              ["姓名", profile.name],
              ["身份", profile.role],
              ["一句话", profile.tagline],
              ["邮箱", profile.email],
              ["坐标", profile.location],
              ["状态", profile.availability],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex gap-4">
                  <dt className="w-16 shrink-0 text-fg-subtle">{k}</dt>
                  <dd className="min-w-0 flex-1 truncate">{v}</dd>
                </div>
              ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
