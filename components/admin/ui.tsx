"use client";

import { cx } from "@/lib/client";
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

/* ------------------------------ 容器 ------------------------------ */

export function Card({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-[var(--radius)] border border-line bg-elev p-5 md:p-6",
        className
      )}
    >
      {(title || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
          <div>
            {title && <h2 className="font-display text-[15px] tracking-[-0.01em]">{title}</h2>}
            {description && (
              <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-fg-muted">
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const map = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };
  return <div className={cx("grid gap-5", map[cols])}>{children}</div>;
}

/* ------------------------------ 表单 ------------------------------ */

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="t-label mb-2 block">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11.5px] leading-relaxed text-fg-subtle">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-3 py-2.5 text-[13.5px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:ring-0";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputBase, className)} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputBase, "min-h-[120px] resize-y leading-relaxed", className)} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cx(inputBase, "appearance-none pr-8", className)}>
      {children}
    </select>
  );
}

export function ColorInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <label className="relative h-10 w-12 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius)] border border-line">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -left-2 -top-2 h-14 w-16 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="t-mono uppercase"
        />
      </div>
    </Field>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-[var(--radius)] border border-line px-3.5 py-3 text-left transition-colors hover:border-line-strong"
    >
      <span>
        <span className="block text-[13px]">{label}</span>
        {hint && <span className="mt-0.5 block text-[11.5px] text-fg-subtle">{hint}</span>}
      </span>
      <span
        className={cx(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-line-strong"
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-all duration-300",
            checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

/* ------------------------------ 按钮 ------------------------------ */

export function Btn({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger" | "ghost";
  size?: "sm" | "md";
}) {
  const variants = {
    default:
      "border border-line text-fg hover:border-line-strong hover:bg-surface",
    primary: "bg-accent text-accent-ink hover:opacity-90 border border-transparent",
    danger: "border border-transparent bg-red-500/12 text-red-400 hover:bg-red-500/20",
    ghost: "border border-transparent text-fg-muted hover:text-fg hover:bg-surface",
  };
  const sizes = { sm: "px-3 py-1.5 text-[12px]", md: "px-4 py-2.5 text-[13px]" };
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------ 状态 ------------------------------ */

export function SaveState({
  state,
  error,
}: {
  state: "idle" | "saving" | "saved" | "error";
  error?: string;
}) {
  return (
    <span className="t-label" aria-live="polite">
      {state === "saving" && "保存中…"}
      {state === "saved" && <span className="text-accent">已保存 · 前台已同步</span>}
      {state === "error" && <span className="text-red-400">{error ?? "保存失败"}</span>}
      {state === "idle" && ""}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-line px-6 py-14 text-center text-[13px] text-fg-subtle">
      {children}
    </div>
  );
}
