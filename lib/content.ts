import { all, get, jsonGet, setSetting, DEFAULT_THEME, type ThemeConfig } from "./db";

/* ----------------------------- types ----------------------------- */

export type ThemeSettings = ThemeConfig;

export type SocialLink = { label: string; url: string; icon: string };

export type Profile = {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  location: string;
  email: string;
  phone: string;
  resumeUrl: string;
  availability: string;
  social: SocialLink[];
  stats: { value: string; label: string }[];
  /* 首屏大图区 */
  heroImage: string;
  heroImageAlt: string;
  heroKicker: string;
  signature: string;
  heroLines: string[];
  /* 夜航首屏文案与素材 */
  heroTitle: string;
  heroTitleCn: string;
  heroSub: string;
  heroVideo: string;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  isVisible: number;
};

export type Tag = {
  id: number;
  slug: string;
  name: string;
  color: string;
  sortOrder: number;
};

export type ProjectImage = {
  id: number;
  url: string;
  alt: string;
  caption: string;
  layout: "full" | "half" | "third" | "portrait";
  sortOrder: number;
};

export type ProjectLink = { id: number; label: string; url: string; kind: string };

export type Project = {
  id: number;
  slug: string;
  title: string;
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
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /* joined */
  category: { slug: string; name: string; color: string } | null;
  tags: { id: number; slug: string; name: string; color: string }[];
  images: ProjectImage[];
  links: ProjectLink[];
};

export type GlobalLink = {
  id: number;
  label: string;
  url: string;
  icon: string;
  kind: string;
  target: string;
  sortOrder: number;
  isVisible: number;
};

export type SiteSettings = {
  siteTitle: string;
  siteDescription: string;
  indexTitle: string;
  indexDescription: string;
  indexIntro: string;
};

/* --------------------------- mappers ---------------------------- */

type P = Record<string, unknown>;

function mapProfile(r: P | undefined): Profile {
  return {
    name: (r?.name as string) ?? "",
    role: (r?.role as string) ?? "",
    tagline: (r?.tagline as string) ?? "",
    bio: (r?.bio as string) ?? "",
    avatarUrl: (r?.avatar_url as string) ?? "",
    location: (r?.location as string) ?? "",
    email: (r?.email as string) ?? "",
    phone: (r?.phone as string) ?? "",
    resumeUrl: (r?.resume_url as string) ?? "",
    availability: (r?.availability as string) ?? "",
    social: jsonGet<SocialLink[]>((r?.social_json as string) ?? "[]", []),
    stats: jsonGet<{ value: string; label: string }[]>((r?.stats_json as string) ?? "[]", []),
    heroImage: (r?.hero_image as string) ?? "",
    heroImageAlt: (r?.hero_image_alt as string) ?? "",
    heroKicker: (r?.hero_kicker as string) ?? "PORTFOLIO",
    signature: (r?.signature as string) ?? "",
    heroLines: jsonGet<string[]>((r?.hero_lines as string) ?? "[]", []),
    heroTitle: (r?.hero_title as string) ?? "",
    heroTitleCn: (r?.hero_title_cn as string) ?? "",
    heroSub: (r?.hero_sub as string) ?? "",
    heroVideo: (r?.hero_video as string) ?? "",
  };
}

function mapCategory(r: P): Category {
  return {
    id: r.id as number,
    slug: r.slug as string,
    name: r.name as string,
    description: (r.description as string) ?? "",
    color: (r.color as string) ?? "",
    sortOrder: (r.sort_order as number) ?? 0,
    isVisible: (r.is_visible as number) ?? 1,
  };
}

function mapTag(r: P): Tag {
  return {
    id: r.id as number,
    slug: r.slug as string,
    name: r.name as string,
    color: (r.color as string) ?? "",
    sortOrder: (r.sort_order as number) ?? 0,
  };
}

function mapImage(r: P): ProjectImage {
  return {
    id: r.id as number,
    url: r.url as string,
    alt: (r.alt as string) ?? "",
    caption: (r.caption as string) ?? "",
    layout: ((r.layout as string) ?? "full") as ProjectImage["layout"],
    sortOrder: (r.sort_order as number) ?? 0,
  };
}

function mapProject(r: P): Project {
  return {
    id: r.id as number,
    slug: r.slug as string,
    title: r.title as string,
    subtitle: (r.subtitle as string) ?? "",
    summary: (r.summary as string) ?? "",
    description: (r.description as string) ?? "",
    role: (r.role as string) ?? "",
    client: (r.client as string) ?? "",
    year: (r.year as string) ?? "",
    coverUrl: (r.cover_url as string) ?? "",
    coverAlt: (r.cover_alt as string) ?? "",
    categoryId: (r.category_id as number) ?? null,
    status: ((r.status as string) ?? "published") as Project["status"],
    featured: (r.featured as number) ?? 0,
    sortOrder: (r.sort_order as number) ?? 0,
    layout: ((r.layout as string) ?? "grid") as Project["layout"],
    accent: (r.accent as string) ?? "",
    seoTitle: (r.seo_title as string) ?? "",
    seoDescription: (r.seo_description as string) ?? "",
    publishedAt: (r.published_at as string) ?? null,
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
    category: null,
    tags: [],
    images: [],
    links: [],
  };
}

/* ----------------------------- readers --------------------------- */

export function getProfile(): Profile {
  return mapProfile(get<P>("SELECT * FROM profile WHERE id = 1"));
}

export function getTheme(): ThemeSettings {
  const row = get<{ value: string }>("SELECT value FROM settings WHERE key = 'theme'");
  return { ...DEFAULT_THEME, ...jsonGet<Partial<ThemeSettings>>(row?.value, {}) };
}

export function getSite(): SiteSettings {
  const row = get<{ value: string }>("SELECT value FROM settings WHERE key = 'site'");
  return {
    siteTitle: "Portfolio",
    siteDescription: "",
    indexTitle: "Selected Works",
    indexDescription: "",
    indexIntro: "",
    ...jsonGet<Partial<SiteSettings>>(row?.value, {}),
  };
}

export function saveSite(patch: Partial<SiteSettings>) {
  const current = getSite();
  setSetting("site", { ...current, ...patch });
}

export function getCategories(includeHidden = false): Category[] {
  const rows = includeHidden
    ? all<P>("SELECT * FROM categories ORDER BY sort_order, id")
    : all<P>("SELECT * FROM categories WHERE is_visible = 1 ORDER BY sort_order, id");
  return rows.map(mapCategory);
}

export function getTags(): Tag[] {
  return all<P>("SELECT * FROM tags ORDER BY sort_order, id").map(mapTag);
}

export function getGlobalLinks(includeHidden = false): GlobalLink[] {
  const rows = includeHidden
    ? all<P>("SELECT * FROM links ORDER BY sort_order, id")
    : all<P>("SELECT * FROM links WHERE is_visible = 1 ORDER BY sort_order, id");
  return rows.map((r) => ({
    id: r.id as number,
    label: r.label as string,
    url: r.url as string,
    icon: (r.icon as string) ?? "",
    kind: (r.kind as string) ?? "social",
    target: (r.target as string) ?? "_self",
    sortOrder: (r.sort_order as number) ?? 0,
    isVisible: (r.is_visible as number) ?? 1,
  }));
}

export function getProjects(opts?: {
  includeDrafts?: boolean;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  featuredOnly?: boolean;
}): Project[] {
  const where: string[] = [];
  const params: unknown[] = [];

  if (!opts?.includeDrafts) where.push("p.status = 'published'");
  if (opts?.featuredOnly) where.push("p.featured = 1");
  if (opts?.categorySlug) {
    where.push("c.slug = ?");
    params.push(opts.categorySlug);
  }
  if (opts?.tagSlug) {
    where.push("EXISTS (SELECT 1 FROM project_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.project_id = p.id AND t.slug = ?)");
    params.push(opts.tagSlug);
  }

  const sql = `
    SELECT p.*, c.slug AS cat_slug, c.name AS cat_name, c.color AS cat_color
    FROM projects p
    LEFT JOIN categories c ON c.id = p.category_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY p.sort_order, p.id DESC
    ${opts?.limit ? "LIMIT ?" : ""}
  `;
  if (opts?.limit) params.push(opts.limit);

  const rows = all<P>(sql, params);
  return rows.map((r) => {
    const p = mapProject(r);
    if (r.cat_slug) {
      p.category = {
        slug: r.cat_slug as string,
        name: r.cat_name as string,
        color: (r.cat_color as string) ?? "",
      };
    }
    p.tags = all<P>(
      `SELECT t.id, t.slug, t.name, t.color FROM project_tags pt
       JOIN tags t ON t.id = pt.tag_id
       WHERE pt.project_id = ? ORDER BY t.sort_order, t.id`,
      [p.id]
    ).map(mapTag);
    p.images = all<P>(
      "SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order, id",
      [p.id]
    ).map(mapImage);
    p.links = all<P>(
      "SELECT id, label, url, kind FROM project_links WHERE project_id = ? ORDER BY sort_order, id",
      [p.id]
    ).map((r) => ({
      id: r.id as number,
      label: r.label as string,
      url: r.url as string,
      kind: (r.kind as string) ?? "link",
    }));
    return p;
  });
}

export function getProjectBySlug(slug: string, includeDrafts = false): Project | null {
  const found = getProjects({ includeDrafts }).find((p) => p.slug === slug);
  return found ?? null;
}

/** 前台一次性拉取的完整数据包（减少请求数）。 */
export function getSiteBundle() {
  return {
    profile: getProfile(),
    site: getSite(),
    theme: getTheme(),
    categories: getCategories(),
    tags: getTags(),
    links: getGlobalLinks(),
    projects: getProjects(),
  };
}
