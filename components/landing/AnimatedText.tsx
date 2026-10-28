"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 悬停时文字上移，副本从下方顶上来。
 * 依赖父级的 `group` class 触发（按钮上已加）。
 */
export default function AnimatedText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <span className="block transition-transform duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-full transition-transform duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}
