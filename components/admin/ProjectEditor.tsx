"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, notifyContentChanged } from "@/lib/client";
import {
  Btn,
  Card,
  ColorInput,
  Field,
  Grid,
  Input,
  SaveState,
  Select,
  Textarea,
  Toggle,
} from "@/components/admin/ui";
import ImagePicker from "@/components/admin/ImagePicker";
import Icon from "./icons";
import type { Category, Project, Tag } from "@/lib/content";

type ImageDraft = {
  url: string;
  alt: string;
  caption: string;
  layout: "full" | "half" | "third" | "portrait";
};

type LinkDraft = { label: string; url: string; kind: string };

type Draft = {
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  description: string;
  role: string;
  client: string;
  year: string;
  coverUrl: string;
  coverAlt: string;
  categoryId: number | null;
  status: "draft" | "published";
  featured: number;
  sortOrder: number;
  layout: "grid" | "wide" | "tall";
  accent: string;
  seoTitle: string;
  seoDescription: string;
  images: ImageDraft[];
  tagIds: number[];
  links: LinkDraft[];
};

const LAYOUT_LABEL: Record<string, string> = {
  full: "通栏（整行）",
  half: "半栏（两列）",
  third: "三栏之一",
  portrait: "竖版三栏",
};

const IMG_LAYOUTS = ["full", "half", "third", "portrait"] as const;

export default function ProjectEditor({
  mode,
  project,
  categories,
  tags,
}: {
  mode: "create" | "edit";
  project?: Project;
  categories: Category[];
  tags: Tag[];
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const [form, setForm] = useState<Draft>({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    subtitle: project?.subtitle ?? "",
    summary: project?.summary ?? "",
    description: project?.description ?? "",
    role: project?.role ?? "",
    client: project?.client ?? "",
    year: project?.year ?? String(new Date().getFullYear()),
    coverUrl: project?.coverUrl ?? "",
    coverAlt: project?.coverAlt ?? "",
    categoryId: project?.categoryId ?? null,
    status: project?.status ?? "draft",
    featured: project?.featured ?? 0,
    sortOrder: project?.sortOrder ?? 0,
    layout: project?.layout ?? "grid",
    accent: project?.accent ?? "#C6F24E",
    seoTitle: project?.seoTitle ?? "",
    seoDescription: project?.seoDescription ?? "",
    images: (project?.images ?? []).map((im) => ({
      url: im.url,
      alt: im.alt,
      caption: im.caption,
      layout: im.layout,
    })),
    tagIds: (project?.tags ?? []).map((t) => t.id),
    links: (project?.links ?? []).map((l) => ({ label: l.label, url: l.url, kind: l.kind })),
  });

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.title.trim()) {
      setError("请填写作品名称");
      setState("error");
      return;
    }
    setState("saving");
    setError("");
    try {
      if (mode === "create") {
        const res = await api<{ id: number }>("/api/projects", { method: "POST", json: form });
        notifyContentChanged();
        router.replace(`/admin/projects/${res.id}`);
        router.refresh();
      } else {
        await api(`/api/projects/${project!.id}`, { method: "PUT", json: form });
        setState("saved");
        notifyContentChanged();
        router.refresh();
        setTimeout(() => setState("idle"), 2500);
      }
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const toggleTag = (id: number) =>
    set(
      "tagIds",
      form.tagIds.includes(id)
        ? form.tagIds.filter((t) => t !== id)
        : [...form.tagIds, id]
    );

  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...form.images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("images", next);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 操作条 */}
      <div className="sticky top-[60px] z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-md md:-mx-7 md:px-7 lg:top-[61px]">
        <div className="flex items-center gap-3">
          <a
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-fg-muted transition-colors hover:text-fg"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            返回列表
          </a>
          <span className="hidden text-[12px] text-fg-subtle sm:inline">
            {mode === "create" ? "新建作品" : form.title || "未命名"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SaveState state={state} error={error} />
          <Btn variant="primary" onClick={save} disabled={state === "saving"}>
            {state === "saving" ? "保存中…" : mode === "create" ? "创建并保存" : "保存更改"}
          </Btn>
        </div>
      </div>

      {/* 基本信息 */}
      <Card title="基本信息">
        <Grid>
          <Field label="作品名称">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="URL 标识" hint="留空自动生成；前台地址为 /work/该标识">
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="my-project"
            />
          </Field>
        </Grid>

        <div className="mt-5">
          <Field label="副标题" hint="一句话描述这个项目">
            <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="概述" hint="显示在作品卡片下方">
            <Textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              className="min-h-[90px]"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="项目详情" hint="空一行分段，前台按段落排版">
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="min-h-[200px]"
            />
          </Field>
        </div>

        <Grid>
          <div className="mt-5">
            <Field label="我的角色">
              <Input value={form.role} onChange={(e) => set("role", e.target.value)} />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="客户 / 品牌">
              <Input value={form.client} onChange={(e) => set("client", e.target.value)} />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="年份">
              <Input value={form.year} onChange={(e) => set("year", e.target.value)} />
            </Field>
          </div>
        </Grid>
      </Card>

      {/* 展示设置 */}
      <Card title="展示设置">
        <Grid>
          <Field label="分类">
            <Select
              value={form.categoryId === null ? "" : String(form.categoryId)}
              onChange={(e) =>
                set("categoryId", e.target.value === "" ? null : Number(e.target.value))
              }
            >
              <option value="">未分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="卡片版式" hint="前台作品列表中的排布">
            <Select
              value={form.layout}
              onChange={(e) => set("layout", e.target.value as Draft["layout"])}
            >
              <option value="grid">标准（两列）</option>
              <option value="wide">宽幅（整行通栏）</option>
              <option value="tall">高图（竖构图）</option>
            </Select>
          </Field>

          <Field label="发布状态">
            <Select
              value={form.status}
              onChange={(e) => set("status", e.target.value as Draft["status"])}
            >
              <option value="draft">草稿（前台不显示）</option>
              <option value="published">已发布</option>
            </Select>
          </Field>

          <Field label="排序权重" hint="数字越小越靠前">
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
            />
          </Field>
        </Grid>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Toggle
            checked={form.featured === 1}
            onChange={(v) => set("featured", v ? 1 : 0)}
            label="设为精选作品"
            hint="用于首页的重点展示"
          />
          <ColorInput
            label="项目强调色"
            value={form.accent}
            onChange={(v) => set("accent", v)}
          />
        </div>

        <div className="mt-5">
          <ImagePicker
            label="封面图"
            value={form.coverUrl}
            onChange={(url) => set("coverUrl", url)}
            hint="留空则使用自动生成的抽象封面"
          />
        </div>

        <div className="mt-5">
          <Field label="封面图 Alt 文本" hint="描述图片内容，利于无障碍与 SEO">
            <Input value={form.coverAlt} onChange={(e) => set("coverAlt", e.target.value)} />
          </Field>
        </div>
      </Card>

      {/* 项目图文 */}
      <Card
        title="项目图文"
        description="前台作品详情页的图文混排，可设置每张图的宽度"
        action={
          <Btn
            size="sm"
            onClick={() =>
              set("images", [...form.images, { url: "", alt: "", caption: "", layout: "full" }])
            }
          >
            + 添加图片
          </Btn>
        }
      >
        {form.images.length === 0 && (
          <p className="py-8 text-center text-[13px] text-fg-subtle">
            还没有图片。点右上角「添加图片」。
          </p>
        )}
        <div className="space-y-4">
          {form.images.map((img, i) => (
            <div
              key={i}
              className="rounded-[var(--radius)] border border-line p-3.5"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="t-label">图 {String(i + 1).padStart(2, "0")}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    className="grid h-7 w-7 place-items-center rounded-[var(--radius)] text-fg-subtle hover:bg-surface hover:text-fg"
                  >
                    <Icon name="up" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    className="grid h-7 w-7 place-items-center rounded-[var(--radius)] text-fg-subtle hover:bg-surface hover:text-fg"
                  >
                    <Icon name="down" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                    className="grid h-7 w-7 place-items-center rounded-[var(--radius)] text-fg-subtle hover:bg-surface hover:text-red-400"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <ImagePicker
                  label="图片"
                  value={img.url}
                  onChange={(url) => {
                    const next = [...form.images];
                    next[i] = { ...img, url };
                    set("images", next);
                  }}
                />

                <div className="space-y-4">
                  <Field label="宽度版式">
                    <Select
                      value={img.layout}
                      onChange={(e) => {
                        const next = [...form.images];
                        next[i] = { ...img, layout: e.target.value as ImageDraft["layout"] };
                        set("images", next);
                      }}
                    >
                      {IMG_LAYOUTS.map((l) => (
                        <option key={l} value={l}>
                          {LAYOUT_LABEL[l]}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="说明文字">
                    <Input
                      value={img.caption}
                      onChange={(e) => {
                        const next = [...form.images];
                        next[i] = { ...img, caption: e.target.value };
                        set("images", next);
                      }}
                      placeholder="图注，显示在图片下方"
                    />
                  </Field>

                  <Field label="Alt 文本">
                    <Input
                      value={img.alt}
                      onChange={(e) => {
                        const next = [...form.images];
                        next[i] = { ...img, alt: e.target.value };
                        set("images", next);
                      }}
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 标签 */}
      <Card title="标签" description="点击选中/取消">
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 && <p className="text-[13px] text-fg-subtle">还没有标签</p>}
          {tags.map((t) => {
            const on = form.tagIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
                  on
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-line text-fg-muted hover:text-fg"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 外部链接 */}
      <Card
        title="项目链接"
        description="上线地址、源码地址等"
        action={
          <Btn
            size="sm"
            onClick={() => set("links", [...form.links, { label: "", url: "", kind: "link" }])}
          >
            + 添加链接
          </Btn>
        }
      >
        {form.links.length === 0 && (
          <p className="py-6 text-center text-[13px] text-fg-subtle">还没有链接</p>
        )}
        <div className="space-y-3">
          {form.links.map((l, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-[var(--radius)] border border-line p-3">
              <Field label="名称" className="min-w-[110px] flex-1">
                <Input
                  value={l.label}
                  onChange={(e) => {
                    const next = [...form.links];
                    next[i] = { ...l, label: e.target.value };
                    set("links", next);
                  }}
                />
              </Field>
              <Field label="地址" className="min-w-[180px] flex-[2]">
                <Input
                  value={l.url}
                  onChange={(e) => {
                    const next = [...form.links];
                    next[i] = { ...l, url: e.target.value };
                    set("links", next);
                  }}
                  placeholder="https://…"
                />
              </Field>
              <Field label="类型" className="w-28">
                <Select
                  value={l.kind}
                  onChange={(e) => {
                    const next = [...form.links];
                    next[i] = { ...l, kind: e.target.value };
                    set("links", next);
                  }}
                >
                  <option value="link">链接</option>
                  <option value="live">上线</option>
                  <option value="code">源码</option>
                  <option value="case">案例</option>
                </Select>
              </Field>
              <button
                type="button"
                onClick={() => set("links", form.links.filter((_, j) => j !== i))}
                className="mb-1 rounded-[var(--radius)] px-2 py-1.5 text-[12px] text-fg-subtle transition-colors hover:text-red-400"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* SEO */}
      <Card title="SEO" description="可选，留空则自动使用作品名称与概述">
        <Field label="页面标题">
          <Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
        </Field>
        <div className="mt-5">
          <Field label="页面描述">
            <Textarea
              value={form.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
              className="min-h-[90px]"
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
