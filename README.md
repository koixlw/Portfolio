# Portfolio + CMS

一个带**独立管理后台**的个人作品集网站。前台负责展示，后台负责内容，改完即生效——**不用改源码、不用重新打包、不用重新部署**。

技术栈：Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · framer-motion · Node 内置 `node:sqlite`

---

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
```

打开 <http://localhost:3000> 看前台，打开 <http://localhost:3000/admin> 进后台。

**默认账号**：`admin` / `admin12345`
> 登录后请到「主题与排版 → 登录密码」立刻改掉。

生产模式：

```bash
npm run build
npm run start
```

---

## 它能做什么

| 能力 | 位置 |
|---|---|
| 个人介绍（姓名、身份、简介、头像、联系方式、社交链接、数据统计） | 后台 → 个人介绍 |
| **首屏大图**（背景照片、英文副标题、手写签名、中文副标题） | 后台 → 个人介绍 → 首屏大图 |
| 项目作品（标题、封面、分类、标签、图文混排、排序、草稿/发布、外链、SEO） | 后台 → 项目作品 |
| 作品分类 | 后台 → 作品分类 |
| 标签 | 后台 → 标签 |
| 外部链接（**顶部导航项** / 社交 / 页脚） | 后台 → 外部链接 |
| 主题：主色、辅助色、字体、圆角、**首屏版式**、动效开关 | 后台 → 主题与排版 |
| 媒体库（上传、预览、复制链接、设 Alt、删除） | 后台 → 媒体库 |

**前台立即生效**：所有前台页面都是服务端按请求渲染的（`force-dynamic`），保存后刷新即见新内容。
**已打开的标签页也会自动刷新**：后台保存时通过 `BroadcastChannel` 通知前台标签页，无需手动刷新。

### 「可自定义排版」是怎么做到的

排版参数不在代码里，而是存在数据库的 `settings` 表，服务端渲染时把变量注入 `<html>` 的内联样式：

```
--accent-user   主强调色
--accent2-user  辅助强调色
--radius        圆角
--font-display  标题字体
--font-body     正文字体
```

`app/globals.css` 里所有颜色、字体、圆角都引用这批变量，所以改一次，全站跟着变。中文回退字体固定为 Noto Sans SC。

---

## 目录结构

```
app/
  layout.tsx            根布局：注入主题变量、字体、无闪烁主题脚本
  page.tsx              前台首页
  work/[slug]/page.tsx  作品详情页
  media/[...file]/      上传图片的读取路由
  not-found.tsx         404
  admin/
    login/              登录
    (dash)/             后台主体（带登录校验）
      page.tsx          仪表盘
      profile/          个人介绍
      projects/         项目列表 + 新建 + 编辑
      categories/ tags/ links/   通用集合编辑器
      theme/            主题与排版 + 改密码
      media/            媒体库
  api/                  全部 REST 接口（前后台共用）
components/
  site/                 前台组件（导航、Hero、作品网格、关于、联系、页脚、动效）
  landing/              Landing CTA 模块（仪表盘模型、AI 课程对话、Velorah 首屏预览）
  admin/                后台组件（外壳、UI 套件、表单、图片选择器）
lib/
  db.ts                 SQLite 初始化、schema、种子数据
  content.ts            内容读取层（前台与后台共用）
  project-write.ts      项目的写入逻辑（事务 + 子资源整体替换）
  auth.ts               scrypt 密码 + HMAC 签名会话
  theme.ts              字体栈定义
data/portfolio.db       SQLite 数据文件（首次启动自动创建并写入种子内容）
data/uploads/           上传的图片（与数据库同目录，备份时一起拷走）
```

> 上传的图片走 `/media/<文件名>` 路由提供，而不是放在 `public/`。
> 原因：生产模式下 `next start` 只提供**构建时**已存在于 `public/` 的文件，
> 运行时上传的图片会 404。

---

## 数据与备份

数据库就是 `data/portfolio.db` 一个文件（WAL 模式，实际还有 `-wal` / `-shm` 两个附属文件），上传的图片在 `data/uploads/`。

**备份**：停掉服务后整个复制 `data/` 目录即可。
**迁移**：把 `data/` 目录一起拷到新机器。

想清空重来：

```bash
npm run seed:reset    # 删库，下次启动重新写入种子内容
```

---

## 部署

当前用的是 SQLite 文件库，适合**自建服务器 / VPS / 宝塔**这类有持久磁盘的环境：

```bash
npm ci --omit=dev && npm run build && npm run start
```

用 PM2 或 systemd 守护 `npm run start`，并确保 `data/` 和 `public/uploads/` 目录可写。

**如果之后要上 Vercel 这类 Serverless 平台**，SQLite 文件不持久，需要把 `lib/db.ts` 换成托管 Postgres（Neon / Supabase）。数据访问都收敛在 `lib/db.ts` + `lib/content.ts` 两个文件里，替换面很小。需要的话我可以帮你迁。

---

## 一些实现细节

- **数据库**：Node 24 自带的 `node:sqlite`，无原生编译、无需装数据库服务。`PRAGMA foreign_keys = ON` + WAL。
- **会话**：scrypt 存密码哈希（随机盐），Cookie 里放 HMAC-SHA256 签名的过期时间戳，`httpOnly` + `sameSite=lax`。
- **上传**：`multipart/form-data` 直传 `data/uploads/`，只接受图片 MIME，文件名用时间戳 + 内容哈希，10MB 上限；由 `/media/[...file]` 路由读取，含路径穿越防护。
- **安全**：所有写操作接口都要求登录；删除项目用 `ON DELETE CASCADE` 连带清理图片、标签关联、外链。
- **无障碍**：全站键盘可达，焦点环清晰，`prefers-reduced-motion` 下动效全部降级，暗色模式下对比度经过校验。
- **自定义光标**：只在前台启用；后台管理端完全不用（密集输入时系统的原生光标和插入点更可靠）；文本输入框 / 可编辑区域一律交还原生文字光标。

---

## 设计决策

配色、字体、交互的完整记录见 [DESIGN.md](./DESIGN.md)。
