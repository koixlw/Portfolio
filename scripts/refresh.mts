/**
 * 把现有站点内容刷新到 Nocturne 夜航主题：
 * 主题令牌（配色 / 字体 / 圆角）+ 站点信息 + 个人资料（含新的首屏文案字段）。
 *
 * 只改内容，不动 projects / users——后台密码和作品数据都保留。
 * 用法：node --experimental-strip-types scripts/refresh.mts
 */
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const file = path.join(process.cwd(), "data", "portfolio.db");
const db = new DatabaseSync(file);
db.exec("PRAGMA journal_mode = WAL;");

/* 补齐新字段（与 lib/db.ts 的迁移保持一致） */
const existing = new Set(
  (db.prepare("PRAGMA table_info(profile)").all() as unknown as { name: string }[]).map(
    (r) => r.name
  )
);
const NEW_COLUMNS: Record<string, string> = {
  hero_title: "TEXT NOT NULL DEFAULT ''",
  hero_title_cn: "TEXT NOT NULL DEFAULT ''",
  hero_sub: "TEXT NOT NULL DEFAULT ''",
  hero_video: "TEXT NOT NULL DEFAULT ''",
};
for (const [name, type] of Object.entries(NEW_COLUMNS)) {
  if (!existing.has(name)) {
    db.exec(`ALTER TABLE profile ADD COLUMN ${name} ${type}`);
    console.log("新增字段 profile." + name);
  }
}

/* 主题令牌 */
const theme = {
  accent: "#A8CCFF",
  accent2: "#F0C48A",
  fontDisplay: "Instrument Serif",
  fontBody: "Inter",
  radius: 14,
  gridDensity: "comfortable",
  heroStyle: "showcase",
  cursor: true,
  progressBar: true,
  motion: true,
  navStyle: "floating",
};
db.prepare(
  "INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', ?)"
).run(JSON.stringify(theme));

/* 站点信息 */
db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('site', ?)").run(
  JSON.stringify({
    siteTitle: "Zhang San — Software Engineer",
    siteDescription: "独立软件工程师的作品集：前端架构、设计系统与交互实现。",
    indexTitle: "Selected Works",
    indexDescription: "精选项目",
    indexIntro: "",
  })
);

/* 个人资料 */
db.prepare(
  `UPDATE profile SET
     role = ?, tagline = ?, bio = ?, availability = ?,
     hero_kicker = ?, signature = ?, hero_lines = ?,
     hero_title = ?, hero_title_cn = ?, hero_sub = ?, hero_video = ?,
     updated_at = datetime('now')
   WHERE id = 1`
).run(
  "Software Engineer / Creative Developer",
  "把想法写成能跑的产品\n从架构到动效，一个人把它做完",
  "十年 web 开发经验，现居上海，独立接单。\n\n好的工程和好的设计其实是同一件事：结构清楚、边界干净、细节有人管。日常写 TypeScript 与 React，也做设计系统、数据可视化和交互站点。\n\n交付的不只是代码，还有架构说明、部署脚本和一份能接手的文档。合作请直接邮件，48 小时内回复。",
  "2026 Q3 档期可约",
  "PORTFOLIO",
  "San.",
  JSON.stringify(["把想法写成能跑的产品", "从架构到动效，一个人把它做完"]),
  "Where the code outlives the noise.",
  "在没人盯着的时候，代码才最诚实。",
  "I'm a software engineer building interfaces and systems for people who think in structures — quietly, deliberately, one line at a time.",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
);

console.log("已刷新主题 / 站点信息 / 个人资料。");
