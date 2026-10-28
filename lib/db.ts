import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_HERO_VIDEO } from "./hero";

/**
 * 数据层：Node 24 内置的 node:sqlite（零原生依赖、零外部服务）。
 * 单文件数据库位于 data/portfolio.db，随项目走，方便迁移与备份。
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "portfolio.db");

declare global {
  // eslint-disable-next-line no-var
  var __portfolioDb: DatabaseSync | undefined;
}

function open(): DatabaseSync {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_FILE);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

/** 单例：dev 下 HMR 不会重复打开句柄。 */
export function db(): DatabaseSync {
  if (!globalThis.__portfolioDb) {
    const conn = open();
    migrate(conn);
    // 先种子、后登记单例：种子失败必须抛出来，否则会留下半初始化的库。
    try {
      seed(conn);
    } catch (e) {
      console.error("[db] 初始种子数据写入失败：", e);
      throw e;
    }
    globalThis.__portfolioDb = conn;
  }
  return globalThis.__portfolioDb;
}

/* ------------------------------------------------------------------ */
/* schema                                                              */
/* ------------------------------------------------------------------ */

function migrate(d: DatabaseSync) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt          TEXT NOT NULL,
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profile (
      id            INTEGER PRIMARY KEY CHECK (id = 1),
      name          TEXT NOT NULL DEFAULT '',
      role          TEXT NOT NULL DEFAULT '',
      tagline       TEXT NOT NULL DEFAULT '',
      bio           TEXT NOT NULL DEFAULT '',
      avatar_url    TEXT NOT NULL DEFAULT '',
      location      TEXT NOT NULL DEFAULT '',
      email         TEXT NOT NULL DEFAULT '',
      phone         TEXT NOT NULL DEFAULT '',
      resume_url    TEXT NOT NULL DEFAULT '',
      availability  TEXT NOT NULL DEFAULT '',
      social_json   TEXT NOT NULL DEFAULT '[]',
      stats_json    TEXT NOT NULL DEFAULT '[]',
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT NOT NULL UNIQUE,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      color       TEXT NOT NULL DEFAULT '',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_visible  INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tags (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      slug       TEXT NOT NULL UNIQUE,
      name       TEXT NOT NULL,
      color      TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      slug            TEXT NOT NULL UNIQUE,
      title           TEXT NOT NULL,
      subtitle        TEXT NOT NULL DEFAULT '',
      summary         TEXT NOT NULL DEFAULT '',
      description     TEXT NOT NULL DEFAULT '',
      role            TEXT NOT NULL DEFAULT '',
      client          TEXT NOT NULL DEFAULT '',
      year            TEXT NOT NULL DEFAULT '',
      cover_url       TEXT NOT NULL DEFAULT '',
      cover_alt       TEXT NOT NULL DEFAULT '',
      category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      status          TEXT NOT NULL DEFAULT 'published',
      featured        INTEGER NOT NULL DEFAULT 0,
      sort_order      INTEGER NOT NULL DEFAULT 0,
      layout          TEXT NOT NULL DEFAULT 'grid',
      accent          TEXT NOT NULL DEFAULT '',
      seo_title       TEXT NOT NULL DEFAULT '',
      seo_description TEXT NOT NULL DEFAULT '',
      published_at    TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_images (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      url        TEXT NOT NULL,
      alt        TEXT NOT NULL DEFAULT '',
      caption    TEXT NOT NULL DEFAULT '',
      layout     TEXT NOT NULL DEFAULT 'full',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS project_tags (
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      tag_id     INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS project_links (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      label      TEXT NOT NULL,
      url        TEXT NOT NULL,
      kind       TEXT NOT NULL DEFAULT 'link',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS links (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      label      TEXT NOT NULL,
      url        TEXT NOT NULL,
      icon       TEXT NOT NULL DEFAULT '',
      kind       TEXT NOT NULL DEFAULT 'social',
      target     TEXT NOT NULL DEFAULT '_self',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS media (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      url        TEXT NOT NULL,
      filename   TEXT NOT NULL DEFAULT '',
      alt        TEXT NOT NULL DEFAULT '',
      size       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_pi_project  ON project_images(project_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_pt_project  ON project_tags(project_id);
    CREATE INDEX IF NOT EXISTS idx_proj_status ON projects(status, sort_order);
  `);

  // 增量迁移：给已存在的表补新字段
  ensureColumns(d, "profile", {
    hero_image: "TEXT NOT NULL DEFAULT ''",
    hero_image_alt: "TEXT NOT NULL DEFAULT ''",
    hero_kicker: "TEXT NOT NULL DEFAULT 'PORTFOLIO'",
    signature: "TEXT NOT NULL DEFAULT ''",
    hero_lines: "TEXT NOT NULL DEFAULT '[]'",
    hero_title: "TEXT NOT NULL DEFAULT ''",
    hero_title_cn: "TEXT NOT NULL DEFAULT ''",
    hero_sub: "TEXT NOT NULL DEFAULT ''",
    hero_video: "TEXT NOT NULL DEFAULT ''",
  });
}

/** 给表补齐缺失的列（SQLite 的 ALTER TABLE ADD COLUMN 是幂等友好的，但需要先查有没有）。 */
function ensureColumns(d: DatabaseSync, table: string, cols: Record<string, string>) {
  const existing = new Set(
    (
      d.prepare(`PRAGMA table_info(${table})`).all() as unknown as { name: string }[]
    ).map((r) => r.name)
  );
  for (const [name, type] of Object.entries(cols)) {
    if (!existing.has(name)) {
      d.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* query helpers                                                       */
/* ------------------------------------------------------------------ */

export type Row = Record<string, unknown>;

export function all<T = Row>(sql: string, params: unknown[] = []): T[] {
  const rows = db()
    .prepare(sql)
    .all(...(params as never[])) as object[];
  // node:sqlite 返回的是 null 原型对象，无法序列化给客户端组件，统一转成普通对象
  return rows.map((r) => ({ ...r })) as T[];
}

export function get<T = Row>(sql: string, params: unknown[] = []): T | undefined {
  const row = db()
    .prepare(sql)
    .get(...(params as never[])) as object | undefined;
  return row === undefined ? undefined : ({ ...row } as T);
}

export function run(sql: string, params: unknown[] = []): { changes: number; lastInsertRowid: number } {
  const r = db()
    .prepare(sql)
    .run(...(params as never[]));
  return {
    changes: Number(r.changes),
    lastInsertRowid: Number(r.lastInsertRowid),
  };
}

/** 事务包装：出错自动回滚。 */
export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec("BEGIN");
  try {
    const out = fn();
    d.exec("COMMIT");
    return out;
  } catch (e) {
    try {
      d.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw e;
  }
}

export function jsonGet<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return (v ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `item-${Date.now().toString(36)}`;
}

/** 保证 slug 唯一：重复时追加 -2 / -3 … */
export function uniqueSlug(
  table: "projects" | "categories" | "tags",
  desired: string,
  excludeId?: number
): string {
  const base = slugify(desired);
  let candidate = base;
  let n = 1;
  for (;;) {
    const row = get<{ id: number }>(`SELECT id FROM ${table} WHERE slug = ?`, [candidate]);
    if (!row || (excludeId !== undefined && row.id === excludeId)) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

/* ------------------------------------------------------------------ */
/* default settings                                                    */
/* ------------------------------------------------------------------ */

export type ThemeConfig = {
  accent: string;
  accent2: string;
  fontDisplay: string;
  fontBody: string;
  radius: number;
  gridDensity: string;
  heroStyle: "split" | "centered" | "showcase";
  cursor: boolean;
  progressBar: boolean;
  motion: boolean;
  navStyle: string;
};

export const DEFAULT_THEME: ThemeConfig = {
  /** 强调色（主色）——月光蓝，夜色画布上最稳的高亮 */
  accent: "#A8CCFF",
  /** 辅助强调色——暖琥珀，冷夜里的第二层温度 */
  accent2: "#F0C48A",
  /** 标题字体 */
  fontDisplay: "Instrument Serif",
  /** 正文字体 */
  fontBody: "Inter",
  /** 圆角像素：0 = 硬朗，999 = 圆润 */
  radius: 14,
  /** 栅格密度 */
  gridDensity: "comfortable",
  /** Hero 版式 */
  heroStyle: "showcase",
  /** 是否启用自定义光标 */
  cursor: true,
  /** 是否显示滚动进度条 */
  progressBar: true,
  /** 是否启用进场动画 */
  motion: true,
  /** 导航栏布局 */
  navStyle: "floating",
};

export function getSettings(): Record<string, unknown> {
  const rows = all<{ key: string; value: string }>("SELECT key, value FROM settings");
  const out: Record<string, unknown> = {};
  for (const r of rows) {
    if (r.key === "theme") out.theme = { ...DEFAULT_THEME, ...jsonGet<Record<string, unknown>>(r.value, {}) };
    else out[r.key] = jsonGet<unknown>(r.value, r.value);
  }
  if (!out.theme) out.theme = { ...DEFAULT_THEME };
  return out;
}

export function setSetting(key: string, value: unknown) {
  const raw = typeof value === "string" ? value : JSON.stringify(value);
  run(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, raw]
  );
}

/* ------------------------------------------------------------------ */
/* seed                                                                */
/* ------------------------------------------------------------------ */

function seed(d: DatabaseSync) {
  const count = d.prepare("SELECT COUNT(*) AS c FROM projects").get() as { c: number };
  if (Number(count.c) > 0) return;

  // 种子写入必须原子：任何一条失败都整体回滚，不留半初始化数据。
  d.exec("BEGIN");
  try {
    seedRows(d);
    d.exec("COMMIT");
  } catch (e) {
    try {
      d.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw e;
  }
}

function seedRows(d: DatabaseSync) {
  const now = new Date().toISOString().slice(0, 10);

  /* settings */
  d.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(
    "theme",
    JSON.stringify(DEFAULT_THEME)
  );
  d.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(
    "site",
    JSON.stringify({
      siteTitle: "Zhang San — Software Engineer",
      siteDescription: "独立软件工程师的作品集：前端架构、设计系统与交互实现。",
      indexTitle: "Selected Works",
      indexDescription: "精选项目",
    })
  );

  /* profile */
  d.prepare(
    `INSERT INTO profile (name, role, tagline, bio, avatar_url, location, email, phone, resume_url, availability, social_json, stats_json,
                          hero_image, hero_image_alt, hero_kicker, signature, hero_lines,
                          hero_title, hero_title_cn, hero_sub, hero_video)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    "张三",
    "Software Engineer / Creative Developer",
    "把想法写成能跑的产品\n从架构到动效，一个人把它做完",
    "十年 web 开发经验，现居上海，独立接单。\n\n好的工程和好的设计其实是同一件事：结构清楚、边界干净、细节有人管。日常写 TypeScript 与 React，也做设计系统、数据可视化和交互站点。\n\n交付的不只是代码，还有架构说明、部署脚本和一份能接手的文档。合作请直接邮件，48 小时内回复。",
    "",
    "中国 · 上海",
    "hello@zhangsan.design",
    "",
    "",
    "2026 Q3 档期可约",
    JSON.stringify([
      { label: "GitHub", url: "https://github.com", icon: "github" },
      { label: "Dribbble", url: "https://dribbble.com", icon: "dribbble" },
      { label: "Behance", url: "https://behance.net", icon: "behance" },
      { label: "邮箱", url: "mailto:hello@zhangsan.design", icon: "mail" },
    ]),
    JSON.stringify([
      { value: "10", label: "年经验" },
      { value: "48", label: "个交付项目" },
      { value: "6", label: "个合作品牌" },
    ]),
    "",
    "",
    "PORTFOLIO",
    "San.",
    JSON.stringify(["把想法写成能跑的产品", "从架构到动效，一个人把它做完"]),
    "Where the code outlives the noise.",
    "在没人盯着的时候，代码才最诚实。",
    "I'm a software engineer building interfaces and systems for people who think in structures — quietly, deliberately, one line at a time.",
    DEFAULT_HERO_VIDEO
  );

  /* categories */
  const catIns = d.prepare(
    "INSERT INTO categories (slug, name, description, color, sort_order) VALUES (?,?,?,?,?)"
  );
  const cats = [
    ["web", "网站", "品牌官网与营销站点", "#C6F24E", 1],
    ["product", "产品", "App 与 Web 产品界面", "#FF7A59", 2],
    ["brand", "品牌", "视觉识别与动态规范", "#6BA8FF", 3],
    ["lab", "实验", "动效与前端技术实验", "#B98CFF", 4],
  ];
  for (const c of cats) catIns.run(...c);
  const catIds = d
    .prepare("SELECT id, slug FROM categories ORDER BY id")
    .all() as unknown as { id: number; slug: string }[];

  /* tags */
  const tagIns = d.prepare("INSERT INTO tags (slug, name, color, sort_order) VALUES (?,?,?,?)");
  const tags = [
    ["ui", "UI", "#8A8C90", 1],
    ["motion", "动效", "#C6F24E", 2],
    ["webgl", "WebGL", "#B98CFF", 3],
    ["frontend", "前端", "#6BA8FF", 4],
    ["branding", "品牌", "#FF7A59", 5],
    ["design-system", "设计系统", "#8A8C90", 6],
  ];
  for (const t of tags) tagIns.run(...t);
  const tagIds = d
    .prepare("SELECT id, slug FROM tags ORDER BY id")
    .all() as unknown as { id: number; slug: string }[];

  /* projects */
  const projIns = d.prepare(
    `INSERT INTO projects
      (slug, title, subtitle, summary, description, role, client, year, cover_url, cover_alt,
       category_id, status, featured, sort_order, layout, accent, seo_title, seo_description, published_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );

  const projects = [
    {
      slug: "aurora-design-system",
      title: "Aurora 设计系统",
      subtitle: "为 12 条产品线建立的一致性语言",
      summary:
        "从色彩、字体、间距到组件动效的完整设计系统，一套代码覆盖 Web / iOS / Android 三端。",
      description:
        "Aurora 是一套服务多端的设计系统。我们从令牌（design token）层开始抽象，把颜色、圆角、阴影、动效曲线收敛为 300+ 个变量，交给 Figma Variables 与 CSS 变量双向同步。\n\n组件库共 48 个，覆盖表单、数据表格、图表和无障碍焦点管理三种状态规范。动效上统一了时长（120 / 240 / 420ms）与缓动曲线，弱化了无意义的位移。\n\n最终前端开发效率提升约 40%，设计到开发的还原度问题下降了一个量级。",
      role: "设计系统负责人 / 前端",
      client: "Aurora Tech",
      year: "2025",
      cover_url: "",
      cover_alt: "Aurora 设计系统界面",
      cat: "product",
      featured: 1,
      layout: "wide",
      accent: "#C6F24E",
      seo_title: "Aurora 设计系统 — 多端一致的设计语言",
      seo_description: "300+ 设计令牌、48 个组件、覆盖 Web/iOS/Android 的完整设计系统实践。",
      published_at: now,
      images: [
        { url: "", alt: "组件总览", caption: "48 个组件的完整矩阵", layout: "full" },
        { url: "", alt: "令牌面板", caption: "令牌层与多端同步", layout: "half" },
        { url: "", alt: "动效曲线", caption: "统一的三段动效节奏", layout: "half" },
      ],
    },
    {
      slug: "kinetic-type-lab",
      title: "Kinetic 动态字体实验",
      subtitle: "可编程的排版实验台",
      summary:
        "一个把文字交给物理引擎驱动的浏览器实验：滚动速度、视差、字重都能实时响应。",
      description:
        "这是一个没有商业目标的自发项目：用 WebGL + 自写物理引擎驱动字体的重量与字距，让文字像流体一样响应滚动惯性。\n\n技术核心是把每个字形采样成曲线点云，在 GPU 上做弹簧阻尼积分，再回写进 canvas。移动端降级为 CSS 变量驱动的粗体变化。\n\n实验被拆成了 11 个可复用的模块，开放源码。",
      role: "独立开发",
      client: "自发项目",
      year: "2024",
      cover_url: "",
      cover_alt: "动态字体实验",
      cat: "lab",
      featured: 1,
      layout: "tall",
      accent: "#B98CFF",
      seo_title: "Kinetic — 可编程的动态字体实验台",
      seo_description: "用物理引擎驱动 WebGL 字形排布的自发项目，开源。",
      published_at: now,
      images: [
        { url: "", alt: "实验主画面", caption: "滚动驱动的字重响应", layout: "full" },
        { url: "", alt: "模块拆解", caption: "11 个可复用模块", layout: "half" },
      ],
    },
    {
      slug: "monolith-brand-site",
      title: "Monolith 品牌官网",
      subtitle: "建筑事务所的数字门面",
      summary:
        "为一家建筑事务所做的品牌站，用超大字号与全出血影像承载空间叙事。",
      description:
        "客户是一家专注小型公共建筑的事务所。他们需要让图纸和照片成为主角，而不是让动效抢戏。\n\n我们把首页做成一条横向滚动的项目长廊，图片全出血，文字压在安全区内。字号跨度从 14px 到 240px，制造节奏差。\n\n上线后平均停留时长从 48 秒提升到 2 分 10 秒，作品页的咨询转化提高明显。",
      role: "设计 + 前端",
      client: "Monolith Architects",
      year: "2024",
      cover_url: "",
      cover_alt: "建筑作品集官网",
      cat: "web",
      featured: 0,
      layout: "grid",
      accent: "#8A8C90",
      seo_title: "Monolith 建筑事务所 — 品牌官网",
      seo_description: "全出血影像与超大排版构成的建筑事务所数字门面。",
      published_at: now,
      images: [
        { url: "", alt: "首页长廊", caption: "横向滚动的项目长廊", layout: "full" },
        { url: "", alt: "项目内页", caption: "图文交错的叙事节奏", layout: "half" },
        { url: "", alt: "移动端", caption: "移动端重新编排为单列", layout: "third" },
      ],
    },
    {
      slug: "pulse-analytics",
      title: "Pulse 数据看板",
      subtitle: "把监控大屏做成能看的界面",
      summary:
        "给运营团队的实时数据看板，用颜色与动效区分状态，而不是堆满图表。",
      description:
        "运营团队每天要盯 9 块大屏，最初的版本信息密度极高却没人看。我们重做了信息层级：只用三种颜色表达状态，其余全部交给灰阶和留白。\n\n数字用等宽字体重排 tabular-nums，滚动时不跳动。告警用一次性的呼吸动画而非常驻闪烁，避免视觉疲劳。\n\n组件基于 Tailwind 与一套自研的图表封装，数据源换成实时 WebSocket。",
      role: "产品设计 / 前端",
      client: "Pulse Data",
      year: "2023",
      cover_url: "",
      cover_alt: "数据看板界面",
      cat: "product",
      featured: 0,
      layout: "grid",
      accent: "#FF7A59",
      seo_title: "Pulse 实时数据看板",
      seo_description: "用色彩与克制动效重建信息层级的运营看板。",
      published_at: now,
      images: [
        { url: "", alt: "总览页", caption: "三色状态语言", layout: "full" },
        { url: "", alt: "详情页", caption: "下钻三级", layout: "half" },
      ],
    },
    {
      slug: "atlas-visual-brand",
      title: "Atlas 视觉识别",
      subtitle: "一套会生长的网格系统",
      summary:
        "为科技媒体重做视觉识别：核心是一套可变网格，让每期封面都不同但同源。",
      description:
        "Atlas 是一份关于工程的季度刊。我们没有做一套死的 logo 系统，而是定义了一套可变网格——横竖分割、留白比例、字号基线全部参数化。\n\n每一期封面由编辑从网格里取一个变体，自动化脚本保证不越界。字体只用两档权重，靠大小拉开层级。\n\n交付包含 Figma 变量、自动化校验脚本与一份 40 页的规范手册。",
      role: "品牌设计",
      client: "Atlas Quarterly",
      year: "2023",
      cover_url: "",
      cover_alt: "期刊视觉识别",
      cat: "brand",
      featured: 0,
      layout: "grid",
      accent: "#6BA8FF",
      seo_title: "Atlas 期刊 — 可变网格视觉识别",
      seo_description: "参数化网格驱动的季度刊视觉系统，自动化约束。",
      published_at: now,
      images: [
        { url: "", alt: "封面变体", caption: "网格参数化出的封面变体", layout: "half" },
        { url: "", alt: "内页版式", caption: "两档字重拉开层级", layout: "half" },
      ],
    },
    {
      slug: "drift-e-commerce",
      title: "Drift 商城前端",
      subtitle: "把购物流程做到只剩两步",
      summary:
        "重构一个服饰商城的结算流程，把四步压缩到两步，转化率提升 22%。",
      description:
        "用户调研发现大量流失发生在登录与配送地址之间。我们把这两个步骤合并为一张表单，用地址自动补全与手机号验证码替代账号密码。\n\n前端用 Remix 重写，配合图片 CDN 的渐进式加载与骨架屏。\n\n结算转化提升 22%，页面首屏从 3.4s 降到 1.1s。",
      role: "前端负责人",
      client: "Drift",
      year: "2022",
      cover_url: "",
      cover_alt: "电商结算流程",
      cat: "web",
      featured: 0,
      layout: "grid",
      accent: "#C6F24E",
      seo_title: "Drift 商城 — 四步到两步的结算重构",
      seo_description: "重构服饰商城结算流程，转化提升 22%。",
      published_at: now,
      images: [{ url: "", alt: "结算页", caption: "合并后的单页结算", layout: "full" }],
    },
  ];

  const imgIns = d.prepare(
    "INSERT INTO project_images (project_id, url, alt, caption, layout, sort_order) VALUES (?,?,?,?,?,?)"
  );
  const tagLink = d.prepare("INSERT OR IGNORE INTO project_tags (project_id, tag_id) VALUES (?,?)");
  const plink = d.prepare(
    "INSERT INTO project_links (project_id, label, url, kind, sort_order) VALUES (?,?,?,?,?)"
  );

  let order = 1;
  projects.forEach((p, projectIndex) => {
    const catId = catIds.find((c) => c.slug === p.cat)?.id ?? null;
    const r = projIns.run(
      p.slug,
      p.title,
      p.subtitle,
      p.summary,
      p.description,
      p.role,
      p.client,
      p.year,
      p.cover_url,
      p.cover_alt,
      catId,
      "published",
      p.featured,
      order,
      p.layout,
      p.accent,
      p.seo_title,
      p.seo_description,
      p.published_at
    );
    const pid = Number(r.lastInsertRowid);
    p.images.forEach((img, i) =>
      imgIns.run(pid, img.url, img.alt, img.caption, img.layout, i + 1)
    );
    // 每个项目轮换挂 3 个标签（只用真实存在的 tag id）
    for (let k = 0; k < 3 && tagIds.length > 0; k++) {
      const t = tagIds[(projectIndex + k) % tagIds.length];
      if (t) tagLink.run(pid, t.id);
    }
    plink.run(pid, "访问项目", "https://example.com", "live", 1);
    plink.run(pid, "源码", "https://github.com", "code", 2);
    order += 1;
  });

  /* 全局链接 */
  const linkIns = d.prepare(
    "INSERT INTO links (label, url, icon, kind, target, sort_order, is_visible) VALUES (?,?,?,?,?,?,?)"
  );
  const links = [
    // kind='nav' → 出现在顶部悬浮胶囊导航里
    ["精选作品", "#work", "work", "nav", "_self", 1, 1],
    ["个人优势", "#about", "user", "nav", "_self", 2, 1],
    ["联系方式", "#contact", "mail", "nav", "_self", 3, 1],
    ["GitHub", "https://github.com", "github", "social", "_blank", 4, 1],
    ["Dribbble", "https://dribbble.com", "dribbble", "social", "_blank", 5, 1],
    ["Behance", "https://behance.net", "behance", "social", "_blank", 6, 1],
    ["微信", "https://wechat.com", "wechat", "social", "_blank", 7, 1],
    ["下载简历", "/resume.pdf", "file", "link", "_self", 8, 1],
  ];
  for (const l of links) linkIns.run(...l);
}
