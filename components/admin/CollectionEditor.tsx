"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, notifyContentChanged } from "@/lib/client";
import { Btn, Card, EmptyState, Field, Input, Select, Textarea } from "@/components/admin/ui";
import Icon from "./icons";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "color" | "number" | "select" | "toggle";
  options?: { value: string; label: string }[];
  hint?: string;
  placeholder?: string;
  half?: boolean;
};

type Row = Record<string, unknown> & { id: number };

export default function CollectionEditor({
  endpoint,
  items,
  fields,
  addDefaults,
  itemLabelKey,
  emptyHint,
}: {
  endpoint: string;
  items: Record<string, unknown>[];
  fields: FieldDef[];
  addDefaults: Record<string, unknown>;
  /** 用哪个字段作为列表里的显示名（不能传函数：服务端组件 → 客户端组件不允许） */
  itemLabelKey: string;
  emptyHint: string;
}) {
  const itemLabel = (row: Row) => String(row[itemLabelKey] ?? "未命名");
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(items as Row[]);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);

  const startEdit = (row: Row) => {
    setEditing(row.id);
    setDraft({ ...row });
  };

  const save = async (row: Row) => {
    setBusy(true);
    try {
      await api(`${endpoint}/${row.id}`, { method: "PUT", json: draft });
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, ...draft } : r)));
      setEditing(null);
      notifyContentChanged();
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    setBusy(true);
    try {
      const res = await api<Record<string, Row[]>>(endpoint, {
        method: "POST",
        json: addDefaults,
      });
      const list = res.categories ?? res.tags ?? res.links;
      if (Array.isArray(list)) setRows(list);
      notifyContentChanged();
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "新增失败");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: Row) => {
    if (!confirm(`确定删除「${itemLabel(row)}」？`)) return;
    setBusy(true);
    try {
      await api(`${endpoint}/${row.id}`, { method: "DELETE" });
      setRows((rs) => rs.filter((r) => r.id !== row.id));
      notifyContentChanged();
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    } finally {
      setBusy(false);
    }
  };

  const renderField = (f: FieldDef, value: unknown, onChange: (v: unknown) => void) => {
    switch (f.type) {
      case "textarea":
        return (
          <Textarea
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[80px]"
            placeholder={f.placeholder}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={Number(value ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        );
      case "color":
        return (
          <div className="flex items-center gap-3">
            <label className="relative h-10 w-12 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius)] border border-line">
              <input
                type="color"
                value={String(value || "#C6F24E")}
                onChange={(e) => onChange(e.target.value)}
                className="absolute -left-2 -top-2 h-14 w-16 cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
            <Input
              value={String(value ?? "")}
              onChange={(e) => onChange(e.target.value)}
              className="t-mono uppercase"
            />
          </div>
        );
      case "select":
        return (
          <Select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            {(f.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        );
      case "toggle":
        return (
          <button
            type="button"
            onClick={() => onChange(value ? 0 : 1)}
            className="flex w-full items-center justify-between gap-4 rounded-[var(--radius)] border border-line px-3.5 py-2.5 text-left text-[13px] transition-colors hover:border-line-strong"
          >
            <span className="text-fg-muted">{Number(value) ? "显示" : "隐藏"}</span>
            <span
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                Number(value) ? "bg-accent" : "bg-line-strong"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-all duration-300 ${
                  Number(value) ? "left-[18px]" : "left-0.5"
                }`}
              />
            </span>
          </button>
        );
      default:
        return (
          <Input
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={f.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-fg-muted">{emptyHint}</p>
        <Btn variant="primary" onClick={add} disabled={busy}>
          <Icon name="plus" className="h-4 w-4" />
          新增
        </Btn>
      </div>

      {rows.length === 0 ? (
        <EmptyState>还没有内容，点右上角「新增」。</EmptyState>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const isEditing = editing === row.id;
            return (
              <Card key={row.id} className="!p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {fields.map((f) => (
                          <Field
                            key={f.key}
                            label={f.label}
                            hint={f.hint}
                            className={f.half ? "" : "md:col-span-2"}
                          >
                            {renderField(f, draft[f.key], (v) =>
                              setDraft((d) => ({ ...d, [f.key]: v }))
                            )}
                          </Field>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        <span className="text-[14px]">{itemLabel(row)}</span>
                        {fields
                          .filter((f) => f.type !== "toggle" && f.type !== "textarea" && f.type !== "color")
                          .map((f) => {
                            const v = row[f.key];
                            if (v === undefined || v === null || v === "") return null;
                            return (
                              <span key={f.key} className="t-label">
                                {String(v)}
                              </span>
                            );
                          })}
                        {row.isVisible !== undefined && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10.5px] ${
                              Number(row.isVisible) ? "bg-accent/15 text-accent" : "bg-line text-fg-subtle"
                            }`}
                          >
                            {Number(row.isVisible) ? "显示中" : "已隐藏"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isEditing ? (
                      <>
                        <Btn size="sm" variant="primary" onClick={() => save(row)} disabled={busy}>
                          保存
                        </Btn>
                        <Btn size="sm" variant="ghost" onClick={() => setEditing(null)}>
                          取消
                        </Btn>
                      </>
                    ) : (
                      <>
                        <Btn size="sm" onClick={() => startEdit(row)}>
                          编辑
                        </Btn>
                        <button
                          type="button"
                          onClick={() => remove(row)}
                          className="grid h-8 w-8 place-items-center rounded-[var(--radius)] text-fg-subtle transition-colors hover:bg-surface hover:text-red-400"
                          title="删除"
                        >
                          <Icon name="trash" className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
