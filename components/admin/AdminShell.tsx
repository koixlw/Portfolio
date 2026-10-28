"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Icon, { type IconName } from "./icons";
import ThemeToggle from "@/components/site/ThemeToggle";
import { api } from "@/lib/client";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "仪表盘", icon: "grid" },
  { href: "/admin/profile", label: "个人介绍", icon: "user" },
  { href: "/admin/projects", label: "项目作品", icon: "layers" },
  { href: "/admin/categories", label: "作品分类", icon: "tag" },
  { href: "/admin/tags", label: "标签", icon: "tag" },
  { href: "/admin/links", label: "外部链接", icon: "link" },
  { href: "/admin/theme", label: "主题与排版", icon: "palette" },
  { href: "/admin/media", label: "媒体库", icon: "image" },
];

export default function AdminShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const title = NAV.find((n) => isActive(n.href))?.label ?? "后台管理";

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 p-3">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`group flex items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-[13px] transition-colors ${
              active
                ? "bg-surface text-fg"
                : "text-fg-muted hover:bg-surface/60 hover:text-fg"
            }`}
          >
            <Icon
              name={item.icon}
              className={`h-4 w-4 shrink-0 transition-colors ${
                active ? "text-accent" : "text-fg-subtle group-hover:text-fg-muted"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-line p-3">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <span className="truncate text-[12.5px] text-fg-muted">
          {username}
        </span>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-[11.5px] text-fg-subtle transition-colors hover:text-red-400"
        >
          <Icon name="logout" className="h-3.5 w-3.5" />
          退出
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* 移动端顶栏 */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-bg px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-[var(--radius)] border border-line"
          aria-label="切换菜单"
        >
          <Icon name="grid" className="h-4 w-4" />
        </button>
        <span className="font-display text-[14px]">{title}</span>
        <ThemeToggle initial="dark" />
      </header>

      <div className="lg:flex">
        {/* 侧边栏 */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-line bg-elev transition-transform duration-400 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
            <Link href="/admin" className="font-display text-[14px] tracking-[-0.01em]">
              Portfolio<span className="text-accent">.</span>CMS
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center lg:hidden"
              aria-label="关闭菜单"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {nav}
          {footer}
        </aside>

        {open && (
          <button
            type="button"
            aria-label="关闭菜单"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}

        {/* 主区 */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 hidden items-center justify-between gap-4 border-b border-line bg-bg/85 px-7 py-4 backdrop-blur-md lg:flex">
            <h1 className="font-display text-[15px] tracking-[-0.01em]">{title}</h1>
            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-line px-3 py-1.5 text-[12px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                查看前台
                <Icon name="external" className="h-3.5 w-3.5" />
              </a>
              <ThemeToggle initial="dark" />
            </div>
          </header>

          <main className="px-4 py-6 md:px-7 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
