"use client";

import { useEffect, useState } from "react";

type Mode = "dark" | "light";

export default function ThemeToggle({ initial = "dark" }: { initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem("pf-theme") as Mode | null) ?? initial;
    setMode(stored);
  }, [initial]);

  const toggle = () => {
    const next: Mode = mode === "dark" ? "light" : "dark";
    setMode(next);
    localStorage.setItem("pf-theme", next);
    document.documentElement.dataset.theme = next;
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "切换到亮色主题" : "切换到深色主题"}
      className="group relative grid h-9 w-9 place-items-center rounded-full border border-line text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      <span className="sr-only">{mounted ? mode : ""}</span>
      {/* 太阳 */}
      <svg
        viewBox="0 0 24 24"
        className="absolute h-4 w-4 transition-all duration-500 group-hover:rotate-90"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </svg>
      {/* 月亮 */}
      <svg
        viewBox="0 0 24 24"
        className="absolute h-4 w-4 transition-all duration-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
