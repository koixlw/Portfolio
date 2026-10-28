"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api, notifyContentChanged } from "@/lib/client";
import { Btn, EmptyState, Input } from "./ui";

type MediaItem = {
  id: number;
  url: string;
  filename: string;
  alt: string;
  size: number;
  created_at: string;
};

function humanSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setBusy(true);
    setError("");
    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        await api("/api/upload", { method: "POST", body: fd });
      }
      const res = await api<{ media: MediaItem[] }>("/api/media");
      setItems(res.media);
      notifyContentChanged();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: MediaItem) => {
    if (!confirm(`确定删除「${item.filename}」？`)) return;
    try {
      await api("/api/media", { method: "DELETE", json: { id: item.id } });
      setItems((its) => its.filter((i) => i.id !== item.id));
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    }
  };

  const saveAlt = async (item: MediaItem, alt: string) => {
    setItems((its) => its.map((i) => (i.id === item.id ? { ...i, alt } : i)));
    await api("/api/media", { method: "PUT", json: { id: item.id, alt } });
  };

  const copy = async (item: MediaItem) => {
    const url = `${window.location.origin}${item.url}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(item.id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      prompt("复制这个地址：", url);
    }
  };

  return (
    <div className="space-y-5">
      {/* 上传区 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
        className={`rounded-[var(--radius)] border border-dashed px-6 py-12 text-center transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-line"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-[13.5px] text-fg-muted">
          把图片拖到这里，或
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mx-1 text-accent underline underline-offset-4"
          >
            点击选择文件
          </button>
        </p>
        <p className="t-label mt-2">支持 JPG / PNG / WebP / GIF / AVIF / SVG，单个文件不超过 10MB</p>
        {busy && <p className="mt-3 text-[12.5px] text-accent">上传中…</p>}
        {error && <p className="mt-3 text-[12.5px] text-red-400">{error}</p>}
      </div>

      {items.length === 0 ? (
        <EmptyState>媒体库还是空的。</EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[var(--radius)] border border-line bg-elev"
            >
              <div className="relative bg-surface-2" style={{ aspectRatio: "4 / 3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-[12px] text-fg-muted" title={item.filename}>
                  {item.filename || item.url}
                </p>
                <p className="t-label">{humanSize(item.size)}</p>
                <Input
                  defaultValue={item.alt}
                  onBlur={(e) => saveAlt(item, e.target.value)}
                  placeholder="Alt 文本"
                  className="!py-1.5 !text-[12px]"
                />
                <div className="flex gap-2 pt-0.5">
                  <Btn size="sm" className="flex-1" onClick={() => copy(item)}>
                    {copied === item.id ? "已复制" : "复制链接"}
                  </Btn>
                  <Btn size="sm" variant="danger" onClick={() => remove(item)}>
                    删除
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
