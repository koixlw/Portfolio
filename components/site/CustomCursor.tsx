"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * 自定义光标：一个即时跟随的小圆点 + 一个带延迟的描边环。
 *
 * 三条原则：
 * 1. 后台管理端完全不用 —— 那里要密集输入，系统的原生光标更可靠。
 * 2. 文本输入框 / 可编辑区域一律隐藏自定义光标，交还给原生文字光标。
 * 3. 环要克制 —— 只在真正可点的元素上轻微放大，不再糊一圈光晕。
 */
export default function CustomCursor({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const inAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (!enabled || inAdmin) {
      delete document.documentElement.dataset.customCursor;
      return;
    }
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    document.documentElement.dataset.customCursor = "on";

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;

      // 文本输入类元素：完全让位给原生文字光标
      if (t.closest("input, textarea, select, [contenteditable='true']")) {
        dot.classList.add("is-hidden");
        ring.classList.add("is-hidden");
        return;
      }

      dot.classList.remove("is-hidden");
      ring.classList.remove("is-hidden");

      const interactive = t.closest("a, button, [role='button'], summary, label");
      ring.classList.toggle("is-active", !!interactive);
      dot.classList.toggle("is-active", !!interactive);
    };

    const onLeave = () => {
      dot.classList.add("is-hidden");
      ring.classList.add("is-hidden");
    };
    const onEnter = () => {
      dot.classList.remove("is-hidden");
      ring.classList.remove("is-hidden");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
      delete document.documentElement.dataset.customCursor;
    };
  }, [enabled, inAdmin]);

  if (!enabled || inAdmin) return null;

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}
