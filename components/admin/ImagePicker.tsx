"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/client";
import { Input } from "./ui";

/**
 * 图片选择器：上传本地文件 或 直接粘贴外链，并提供实时预览。
 */
export default function ImagePicker({
  value,
  onChange,
  label = "图片",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api<{ url: string }>("/api/upload", { method: "POST", body: fd });
      onChange(res.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="t-label mb-2 block">{label}</span>

      <div className="flex gap-4">
        {/* 预览 */}
        <div className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[var(--radius)] border border-line bg-surface-2">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="预览" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-fg-subtle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5h18v14H3V5zm2 12 5-5 4 4 2-2 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        {/* 操作 */}
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/xxx.jpg 或 https://…"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-[var(--radius)] border border-line px-3 py-1.5 text-[12px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-50"
            >
              {busy ? "上传中…" : "上传图片"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-[var(--radius)] px-2 py-1.5 text-[12px] text-fg-subtle transition-colors hover:text-red-400"
              >
                移除
              </button>
            )}
          </div>
          {error && <p className="text-[11.5px] text-red-400">{error}</p>}
          {hint && <p className="text-[11.5px] text-fg-subtle">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
