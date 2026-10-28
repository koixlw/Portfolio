"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, notifyContentChanged } from "@/lib/client";
import { Btn, Card, ColorInput, Field, Grid, Input, SaveState, Select, Textarea, Toggle } from "./ui";
import { FONT_OPTIONS, fontStack } from "@/lib/theme";
import type { SiteSettings, ThemeSettings } from "@/lib/content";

type State = "idle" | "saving" | "saved" | "error";

export default function ThemeEditor({
  initialTheme,
  initialSite,
}: {
  initialTheme: ThemeSettings;
  initialSite: SiteSettings;
}) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeSettings>(initialTheme);
  const [site, setSite] = useState<SiteSettings>(initialSite);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  const setT = <K extends keyof ThemeSettings>(k: K, v: ThemeSettings[K]) =>
    setTheme((t) => ({ ...t, [k]: v }));
  const setS = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setSite((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setState("saving");
    setError("");
    try {
      await api("/api/theme", { method: "PUT", json: { theme, site } });
      setState("saved");
      notifyContentChanged();
      router.refresh();
      setTimeout(() => setState("idle"), 2500);
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-fg-muted">
          这里的每一项都会直接改变前台样式，保存后立即生效，无需重新构建。
        </p>
        <div className="flex items-center gap-3">
          <SaveState state={state} error={error} />
          <Btn variant="primary" onClick={save} disabled={state === "saving"}>
            {state === "saving" ? "保存中…" : "保存设置"}
          </Btn>
        </div>
      </div>

      {/* 颜色 */}
      <Card title="颜色" description="主强调色 + 辅助强调色，其余为黑白灰中性色阶">
        <Grid>
          <ColorInput
            label="主强调色"
            value={theme.accent}
            onChange={(v) => setT("accent", v)}
          />
          <ColorInput
            label="辅助强调色"
            value={theme.accent2}
            onChange={(v) => setT("accent2", v)}
          />
        </Grid>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            ["背景", "var(--bg)"],
            ["卡片", "var(--surface)"],
            ["线条", "var(--line)"],
            ["正文", "var(--fg)"],
            ["次级文字", "var(--fg-muted)"],
            ["主强调", theme.accent],
            ["辅助强调", theme.accent2],
          ].map(([label, color]) => (
            <div key={label} className="flex items-center gap-2.5">
              <span
                className="h-7 w-7 rounded-[var(--radius)] border border-line"
                style={{ background: color }}
              />
              <span className="t-label">{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 字体 */}
      <Card title="字体" description="标题与正文各一个字体族，最多两套">
        <Grid>
          <Field label="标题字体">
            <Select
              value={theme.fontDisplay}
              onChange={(e) => setT("fontDisplay", e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label} — {f.note}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="正文字体">
            <Select value={theme.fontBody} onChange={(e) => setT("fontBody", e.target.value)}>
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label} — {f.note}
                </option>
              ))}
            </Select>
          </Field>
        </Grid>

        <div className="mt-6 rounded-[var(--radius)] border border-line p-6">
          <p className="t-label">预览</p>
          <p
            className="mt-3 font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] tracking-[-0.035em]"
            style={{ fontFamily: fontStack(theme.fontDisplay, "ui-serif, serif") }}
          >
            设计与代码的交界处
          </p>
          <p
            className="mt-3 max-w-lg text-[14px] text-fg-muted"
            style={{ fontFamily: fontStack(theme.fontBody, "ui-sans-serif, sans-serif") }}
          >
            把想法写成能跑的产品——结构清楚、边界干净、细节有人管。
          </p>
          <p className="mt-2 text-[11px] text-fg-subtle">
            标题字体族：{theme.fontDisplay} · 正文：{theme.fontBody}
          </p>
        </div>
      </Card>

      {/* 排版与动效 */}
      <Card title="排版与动效">
        <Grid>
          <Field label="圆角" hint={`${theme.radius}px`}>
            <input
              type="range"
              min={0}
              max={24}
              step={1}
              value={theme.radius}
              onChange={(e) => setT("radius", Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>

          <Field label="首页主视觉版式">
            <Select
              value={theme.heroStyle}
              onChange={(e) => setT("heroStyle", e.target.value as ThemeSettings["heroStyle"])}
            >
              <option value="showcase">夜航首屏（推荐）</option>
              <option value="split">左右分栏</option>
              <option value="centered">居中排版</option>
            </Select>
          </Field>
        </Grid>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Toggle
            checked={theme.cursor}
            onChange={(v) => setT("cursor", v)}
            label="自定义光标"
            hint="桌面端跟随鼠标的圆点与描边环"
          />
          <Toggle
            checked={theme.progressBar}
            onChange={(v) => setT("progressBar", v)}
            label="顶部阅读进度条"
            hint="显示当前滚动位置"
          />
        </div>
      </Card>

      {/* 站点信息 */}
      <Card title="站点信息" description="浏览器标题、分享卡片文案等">
        <Grid>
          <Field label="站点标题">
            <Input value={site.siteTitle} onChange={(e) => setS("siteTitle", e.target.value)} />
          </Field>
          <Field label="站点描述">
            <Input value={site.siteDescription} onChange={(e) => setS("siteDescription", e.target.value)} />
          </Field>
          <Field label="作品区标题">
            <Input value={site.indexTitle} onChange={(e) => setS("indexTitle", e.target.value)} />
          </Field>
          <Field label="作品区说明">
            <Input
              value={site.indexDescription}
              onChange={(e) => setS("indexDescription", e.target.value)}
            />
          </Field>
        </Grid>
      </Card>

      <PasswordSection />
    </div>
  );
}

function PasswordSection() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setMsg("");
    try {
      await api("/api/auth/password", { method: "POST", json: { password } });
      setMsg("密码已更新");
      setPassword("");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "修改失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="登录密码" description="修改后下次登录生效，至少 8 位">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="新密码" className="min-w-[220px] flex-1">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="至少 8 位"
          />
        </Field>
        <Btn onClick={submit} disabled={busy || password.length < 8}>
          {busy ? "提交中…" : "更新密码"}
        </Btn>
      </div>
      {msg && (
        <p className={`mt-3 text-[12.5px] ${msg.includes("已更新") ? "text-accent" : "text-red-400"}`}>
          {msg}
        </p>
      )}
    </Card>
  );
}
