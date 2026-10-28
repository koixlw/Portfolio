"use client";

import type { ReactNode } from "react";
import AnimatedText from "./AnimatedText";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: "h-9 px-5 text-xs",
  md: "h-11 px-7 text-[13px]",
  lg: "h-12 px-9 text-sm",
} as const;

export type PrimaryButtonProps = {
  /** 默认渲染 <a>；传 "button" 渲染原生按钮 */
  as?: "a" | "button";
  href?: string;
  size?: keyof typeof SIZES;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  "aria-label"?: string;
};

/**
 * Landing 里的白色胶囊主按钮。文字用 AnimatedText 做悬停上滑。
 */
export default function PrimaryButton({
  as = "a",
  href,
  size = "lg",
  className,
  children,
  type = "button",
  onClick,
  "aria-label": ariaLabel,
}: PrimaryButtonProps) {
  const classes = cn(
    "group inline-flex items-center justify-center rounded-full bg-white/80 font-medium leading-none text-black transition-colors hover:bg-white",
    SIZES[size],
    className,
  );

  const inner = <AnimatedText>{children}</AnimatedText>;

  if (as === "button") {
    return (
      <button type={type} onClick={onClick} aria-label={ariaLabel} className={classes}>
        {inner}
      </button>
    );
  }

  return (
    <a href={href} onClick={onClick} aria-label={ariaLabel} className={classes}>
      {inner}
    </a>
  );
}
