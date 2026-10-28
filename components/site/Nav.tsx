"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Magnetic from "./Magnetic";

type Props = {
  name: string;
  items: { label: string; url: string }[];
  email: string;
  /** 浅色页面上用深色胶囊，深色页面上用玻璃质感 */
  tone?: "glass" | "solid";
};

export default function Nav({ name, items, email, tone = "glass" }: Props) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y > last && y > 260) setHidden(true);
      else setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const shell =
    tone === "solid"
      ? "border-line bg-bg/85 backdrop-blur-xl"
      : "border-[rgb(var(--nav-glass-border))] bg-[rgb(var(--nav-glass))] backdrop-blur-xl";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-3 z-50 flex justify-center px-4 transition-transform duration-500 md:top-5 ${
          hidden && !open ? "-translate-y-[140%]" : ""
        }`}
      >
        <div
          className={`flex items-center gap-2 rounded-full border p-1.5 pl-4 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] transition-colors duration-300 ${shell} ${
            scrolled ? "shadow-[0_18px_60px_-20px_rgba(0,0,0,0.95)]" : ""
          }`}
        >
          {/* 字标 */}
          <Link
            href="/"
            className="group flex items-baseline gap-0.5 pr-1 transition-opacity hover:opacity-80"
          >
            <span className="font-display text-[17px] leading-none tracking-[-0.01em] text-white">
              {name}
            </span>
            <sup className="text-[0.42em] text-white/45">®</sup>
          </Link>

          {/* 中间导航 */}
          <nav className="hidden items-center md:flex">
            {items.map((item) => (
              <a
                key={item.url + item.label}
                href={item.url}
                className="rounded-full px-3.5 py-2 text-[13px] text-white/60 transition-colors hover:bg-white/8 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <span className="hidden pr-1 lg:inline [&_button]:border-white/25 [&_button]:text-white/70 hover:[&_button]:border-white/45 hover:[&_button]:text-white">
              <ThemeToggle initial="dark" />
            </span>

            {email && (
              // 显隐交给外层包裹：Magnetic 自带 inline-block，会压掉 hidden
              <span className="hidden sm:inline-block">
                <Magnetic strength={0.18}>
                  <a
                    href={`mailto:${email}`}
                    className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] text-white/85 transition-colors hover:bg-white/12"
                  >
                    联系我
                  </a>
                </Magnetic>
              </span>
            )}

            {/* 移动端菜单 */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "关闭菜单" : "打开菜单"}
              aria-expanded={open}
              className="relative grid h-9 w-9 place-items-center rounded-full text-white md:hidden"
            >
              <span
                className={`absolute h-px w-4 bg-current transition-all duration-300 ${
                  open ? "rotate-45" : "-translate-y-1.5"
                }`}
              />
              <span
                className={`absolute h-px w-4 bg-current transition-all duration-300 ${
                  open ? "-rotate-45" : "translate-y-1.5"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* 移动端全屏菜单 */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          opacity: open ? 1 : 0,
          transition: "opacity 0.4s var(--ease-out)",
          visibility: open ? "visible" : "hidden",
          background: "linear-gradient(180deg, #070c17 0%, #04060c 100%)",
        }}
      >
        <nav className="u-container flex h-full flex-col justify-center gap-2">
          <span className="t-eyebrow mb-6 text-white/35">{name}®</span>
          {items.map((item, i) => (
            <a
              key={item.url + item.label}
              href={item.url}
              onClick={() => setOpen(false)}
              className="t-h1 border-b border-white/8 py-3 text-white"
              style={{
                transform: open ? "translateY(0)" : "translateY(18px)",
                opacity: open ? 1 : 0,
                transition: `all 0.5s var(--ease-out) ${i * 55}ms`,
              }}
            >
              {item.label}
            </a>
          ))}
          <Magnetic className="mt-10">
            <a
              href={`mailto:${email}`}
              onClick={() => setOpen(false)}
              className="liquid-glass inline-flex rounded-full px-6 py-3 text-sm text-white/85"
            >
              {email}
            </a>
          </Magnetic>
        </nav>
      </div>
    </>
  );
}
