"use client";

import { useState } from "react";
import { api, notifyContentChanged } from "@/lib/client";
import { Btn, Card, Field, Grid, Input, SaveState, Textarea } from "@/components/admin/ui";
import ImagePicker from "@/components/admin/ImagePicker";
import type { Profile } from "@/lib/content";

type State = "idle" | "saving" | "saved" | "error";

export default function ProfileEditor({ initial }: { initial: Profile }) {
  const [form, setForm] = useState<Profile>(initial);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setState("saving");
    setError("");
    try {
      await api("/api/profile", { method: "PUT", json: form });
      setState("saved");
      notifyContentChanged();
      setTimeout(() => setState("idle"), 2500);
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-fg-muted">这里的内容会显示在前台首页的「关于」与「联系」区块。</p>
        <div className="flex items-center gap-3">
          <SaveState state={state} error={error} />
          <Btn variant="primary" onClick={save} disabled={state === "saving"}>
            {state === "saving" ? "保存中…" : "保存更改"}
          </Btn>
        </div>
      </div>

      <Card title="基本信息">
        <Grid>
          <Field label="姓名">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="身份 / 头衔" hint="显示在导航栏和首页大标题上方">
            <Input value={form.role} onChange={(e) => set("role", e.target.value)} />
          </Field>
        </Grid>

        <div className="mt-5">
          <Field label="一句话介绍" hint="首页大标题下方。一行一句，回车换行，第一行更亮">
            <Textarea
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className="min-h-[80px]"
              placeholder={"用视觉系统与 AI 工作流\n让品牌内容更快、更准、更有辨识度"}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="个人简介" hint="空一行即分段，前台会按段落排版">
            <Textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              className="min-h-[200px]"
            />
          </Field>
        </div>
      </Card>

      <Card
        title="首屏"
        description="夜航首屏的背景与文案。背景图留空时使用背景视频，视频也留空则回落到内置夜景。"
      >
        <Field
          label="背景视频地址"
          hint="直链 mp4（.mp4 / .webm）。传了背景图就以图优先，两者都留空使用内置夜景素材。"
        >
          <Input
            value={form.heroVideo}
            onChange={(e) => set("heroVideo", e.target.value)}
            placeholder="https://…/hero.mp4"
          />
        </Field>

        <div className="mt-5">
          <ImagePicker
            label="背景图"
            value={form.heroImage}
            onChange={(url) => set("heroImage", url)}
            hint="建议 2400×1350 以上，横向构图；填了就会盖掉背景视频"
          />
        </div>

        <div className="mt-5">
          <Field label="无障碍 / SEO 描述" hint="填写图片内容描述，会作为图片的 alt 文本">
            <Input
              value={form.heroImageAlt}
              onChange={(e) => set("heroImageAlt", e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="英文大标题" hint="首屏最上面那行衬线巨字，一句话">
            <Input
              value={form.heroTitle}
              onChange={(e) => set("heroTitle", e.target.value)}
              placeholder="Where the code outlives the noise."
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="中文大标题" hint="紧跟英文巨字下方，字号小一档、颜色更淡">
            <Input
              value={form.heroTitleCn}
              onChange={(e) => set("heroTitleCn", e.target.value)}
              placeholder="在没人盯着的时候，代码才最诚实。"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="英文副文案" hint="巨字下方的一段话，讲你做什么">
            <Textarea
              value={form.heroSub}
              onChange={(e) => set("heroSub", e.target.value)}
              className="min-h-[80px]"
            />
          </Field>
        </div>

        <Grid>
          <Field label="小标签英文" hint="巨字上方那一行小字，例如 PORTFOLIO">
            <Input value={form.heroKicker} onChange={(e) => set("heroKicker", e.target.value)} />
          </Field>
          <Field label="手写签名" hint="留空则不显示；建议 2~4 个字母或汉字">
            <Input
              value={form.signature}
              onChange={(e) => set("signature", e.target.value)}
              placeholder="San."
            />
          </Field>
        </Grid>

      </Card>

      <Card title="联系方式与状态">
        <Grid>
          <Field label="邮箱">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="hello@example.com"
            />
          </Field>
          <Field label="电话">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="坐标">
            <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="简历文件地址" hint="前台「下载简历」按钮的链接">
            <Input value={form.resumeUrl} onChange={(e) => set("resumeUrl", e.target.value)} />
          </Field>
        </Grid>

        <div className="mt-5">
          <Field label="当前状态" hint="显示在首页顶部的状态点旁，例如「2026 Q3 档期可约」">
            <Input
              value={form.availability}
              onChange={(e) => set("availability", e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-5">
          <ImagePicker
            label="头像 / 个人照片"
            value={form.avatarUrl}
            onChange={(url) => set("avatarUrl", url)}
            hint="留空则使用默认的抽象几何构图"
          />
        </div>
      </Card>

      {/* 社交链接 */}
      <Card
        title="社交链接"
        description="显示在「联系」区块与页脚"
        action={
          <Btn
            size="sm"
            onClick={() => set("social", [...form.social, { label: "", url: "", icon: "" }])}
          >
            + 添加
          </Btn>
        }
      >
        {form.social.length === 0 && (
          <p className="py-6 text-center text-[13px] text-fg-subtle">还没有链接</p>
        )}
        <div className="space-y-3">
          {form.social.map((s, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-[var(--radius)] border border-line p-3">
              <Field label="名称" className="min-w-[120px] flex-1">
                <Input
                  value={s.label}
                  onChange={(e) => {
                    const next = [...form.social];
                    next[i] = { ...s, label: e.target.value };
                    set("social", next);
                  }}
                />
              </Field>
              <Field label="地址" className="min-w-[180px] flex-[2]">
                <Input
                  value={s.url}
                  onChange={(e) => {
                    const next = [...form.social];
                    next[i] = { ...s, url: e.target.value };
                    set("social", next);
                  }}
                  placeholder="https://…"
                />
              </Field>
              <button
                type="button"
                onClick={() => set("social", form.social.filter((_, j) => j !== i))}
                className="mb-1 rounded-[var(--radius)] px-2 py-1.5 text-[12px] text-fg-subtle transition-colors hover:text-red-400"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* 数据统计 */}
      <Card
        title="数据统计"
        description="显示在「关于」区块的三个数字"
        action={
          <Btn
            size="sm"
            onClick={() => set("stats", [...form.stats, { value: "", label: "" }])}
          >
            + 添加
          </Btn>
        }
      >
        <div className="space-y-3">
          {form.stats.map((s, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-[var(--radius)] border border-line p-3">
              <Field label="数值" className="w-28">
                <Input
                  value={s.value}
                  onChange={(e) => {
                    const next = [...form.stats];
                    next[i] = { ...s, value: e.target.value };
                    set("stats", next);
                  }}
                />
              </Field>
              <Field label="说明" className="min-w-[140px] flex-1">
                <Input
                  value={s.label}
                  onChange={(e) => {
                    const next = [...form.stats];
                    next[i] = { ...s, label: e.target.value };
                    set("stats", next);
                  }}
                />
              </Field>
              <button
                type="button"
                onClick={() => set("stats", form.stats.filter((_, j) => j !== i))}
                className="mb-1 rounded-[var(--radius)] px-2 py-1.5 text-[12px] text-fg-subtle transition-colors hover:text-red-400"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
