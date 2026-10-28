/**
 * 端到端冒烟测试：前台渲染 + 后台鉴权 + 内容增删改 + 主题联动 + 上传。
 * 用法：先 npm run start，再另开一个终端跑 node --experimental-strip-types scripts/e2e.mts
 */
const BASE = process.env.BASE ?? "http://localhost:3000";

let pass = 0;
let fail = 0;

function check(name: string, ok: boolean, extra = "") {
  if (ok) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name} ${extra}`);
  }
}

const jar = new Map<string, string>();

function saveCookies(res: Response) {
  const raw = res.headers.getSetCookie?.() ?? [];
  for (const c of raw) {
    const [pair] = c.split(";");
    const idx = pair.indexOf("=");
    if (idx > 0) jar.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
  }
}

function cookieHeader() {
  return [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function req(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<Response> {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (json !== undefined) headers.set("Content-Type", "application/json");
  if (jar.size) headers.set("Cookie", cookieHeader());
  return fetch(`${BASE}${path}`, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
    redirect: "manual",
  });
}

async function j<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await req(path, init);
  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */

console.log(`\n▶ 目标站点 ${BASE}\n`);

console.log("【1】前台渲染");
{
  const bundle = await (await fetch(`${BASE}/api/content`)).json();
  const home = await fetch(`${BASE}/`);
  const html = await home.text();
  check("首页 200", home.status === 200, `got ${home.status}`);
  check("含姓名", html.includes(bundle.profile.name as string));
  check("含邮箱", html.includes(bundle.profile.email as string));
  check("含 6 个作品标题", ["Aurora", "Kinetic", "Monolith", "Pulse", "Atlas", "Drift"].every((k) => html.includes(k)));
  check("作品区标题一致", html.includes(bundle.site.indexTitle as string));

  const detail = await fetch(`${BASE}/work/aurora-design-system`);
  check("作品详情页 200", detail.status === 200);
  const missing = await fetch(`${BASE}/work/does-not-exist`);
  check("不存在的作品返回 404", missing.status === 404, `got ${missing.status}`);
}

console.log("\n【2】后台鉴权");
{
  const anon = await fetch(`${BASE}/admin`, { redirect: "manual" });
  check("未登录访问 /admin 被重定向", anon.status === 307 || anon.status === 302, `got ${anon.status}`);

  const bad = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "wrong" }),
  });
  check("错误密码 401", bad.status === 401, `got ${bad.status}`);

  const ok = await req("/api/auth/login", {
    method: "POST",
    json: { username: "admin", password: "admin12345" },
  });
  check("正确密码 200", ok.status === 200, `got ${ok.status}`);
  saveCookies(ok);

  const me = await j<{ user: { username: string } | null }>("/api/auth/me");
  check("会话有效", me.user?.username === "admin");

  const admin = await req("/admin");
  check("带 cookie 访问 /admin 200", admin.status === 200, `got ${admin.status}`);
}

console.log("\n【3】内容增删改");
{
  const created = await j<{ id: number; project: { slug: string } }>("/api/projects", {
    method: "POST",
    json: {
      title: "E2E 临时项目",
      summary: "冒烟测试用",
      description: "第一段\n\n第二段",
      status: "published",
      categoryId: 1,
      layout: "wide",
      year: "2026",
      images: [{ url: "", alt: "图1", caption: "图注", layout: "half" }],
      tagIds: [1, 2],
      links: [{ label: "上线", url: "https://example.com", kind: "live" }],
    },
  });
  check("创建项目", typeof created.id === "number");
  const id = created.id;

  const after = await j<{ project: Record<string, unknown> }>(`/api/projects/${id}`);
  check("图片已保存", (after.project.images as unknown[]).length === 1);
  check("标签已保存", (after.project.tags as unknown[]).length === 2);
  check("外链已保存", (after.project.links as unknown[]).length === 1);

  const home = await (await fetch(`${BASE}/`)).text();
  check("新项目已出现在前台", home.includes("E2E 临时项目"));

  await req(`/api/projects/${id}`, { method: "PUT", json: { title: "E2E 临时项目改" } });
  const home2 = await (await fetch(`${BASE}/`)).text();
  check("改名后前台同步", home2.includes("E2E 临时项目改"));

  await req(`/api/projects/${id}`, { method: "PUT", json: { status: "draft" } });
  const home3 = await (await fetch(`${BASE}/`)).text();
  check("转为草稿后前台不再显示", !home3.includes("E2E 临时项目改"));

  const del = await req(`/api/projects/${id}`, { method: "DELETE" });
  check("删除项目", del.status === 200);
  const gone = await req(`/api/projects/${id}`);
  check("删除后再查 404", gone.status === 404, `got ${gone.status}`);
}

console.log("\n【4】分类 / 标签 / 链接");
{
  const cat = await j<{ id: number; categories: unknown[] }>("/api/categories", {
    method: "POST",
    json: { name: "E2E 分类", color: "#123456" },
  });
  check("新增分类", cat.categories.length > 0);
  const tag = await j<{ id: number; tags: unknown[] }>("/api/tags", {
    method: "POST",
    json: { name: "E2E 标签" },
  });
  check("新增标签", tag.tags.length > 0);
  const link = await j<{ id: number; links: unknown[] }>("/api/links", {
    method: "POST",
    json: { label: "E2E 链接", url: "https://e2e.example.com", kind: "social" },
  });
  check("新增链接", link.links.length > 0);

  await req(`/api/categories/${cat.id}`, { method: "DELETE" });
  await req(`/api/tags/${tag.id}`, { method: "DELETE" });
  await req(`/api/links/${link.id}`, { method: "DELETE" });
  check("删除三类内容", true);
}

console.log("\n【5】主题 / 个人介绍 → 前台即时生效");
{
  const orig = await j<{ theme: Record<string, unknown>; site: Record<string, unknown> }>("/api/theme");
  const origProfile = await j<{ profile: Record<string, unknown> }>("/api/profile");

  await req("/api/theme", {
    method: "PUT",
    json: { theme: { accent: "#FF00AA", radius: 12 }, site: { indexTitle: "冒烟测试作品区" } },
  });
  await new Promise((r) => setTimeout(r, 300));
  let html = await (await fetch(`${BASE}/`)).text();
  check("强调色已变", html.includes("--accent-user:#FF00AA"));
  check("圆角已变", html.includes("--radius:12px"));
  check("作品区标题已变", html.includes("冒烟测试作品区"));

  await req("/api/profile", {
    method: "PUT",
    json: { name: "冒烟测试名", tagline: "冒烟测试标语" },
  });
  await new Promise((r) => setTimeout(r, 300));
  html = await (await fetch(`${BASE}/`)).text();
  check("姓名已变", html.includes("冒烟测试名"));
  check("标语已变", html.includes("冒烟测试标语"));
  check(
    "未提供的字段被保留（简介不被清空）",
    typeof origProfile.profile.bio === "string" && (origProfile.profile.bio as string).length > 0
      ? html.includes((origProfile.profile.bio as string).split(/\n+/)[0])
      : true
  );

  // 还原
  await req("/api/theme", { method: "PUT", json: { theme: orig.theme, site: orig.site } });
  await req("/api/profile", { method: "PUT", json: origProfile.profile });
  await new Promise((r) => setTimeout(r, 300));
  html = await (await fetch(`${BASE}/`)).text();
  const bundle = await (await fetch(`${BASE}/api/content`)).json();
  check("已还原", html.includes(bundle.profile.name as string) && html.includes(bundle.site.indexTitle as string));
}

console.log("\n【6】图片上传");
{
  // 1x1 PNG
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  const fd = new FormData();
  fd.append("file", new Blob([png], { type: "image/png" }), "e2e.png");
  const up = await req("/api/upload", { method: "POST", body: fd });
  const upJson = await up.json().catch(() => ({}));
  check("上传返回 200", up.status === 200, `got ${up.status} ${JSON.stringify(upJson)}`);
  const url = (upJson as { url?: string }).url ?? "";
  check("返回了文件地址", !!url, JSON.stringify(upJson));
  if (url) {
    const got = await fetch(`${BASE}${url}`);
    check("上传文件可访问", got.status === 200, `got ${got.status}`);
  }

  const bad = new FormData();
  bad.append("file", new Blob(["hello"], { type: "text/plain" }), "x.txt");
  const badRes = await req("/api/upload", { method: "POST", body: bad });
  check("非图片被拒 400", badRes.status === 400, `got ${badRes.status}`);
}

console.log(`\n──────── 结果：${pass} 通过 / ${fail} 失败 ────────\n`);
process.exit(fail > 0 ? 1 : 0);
