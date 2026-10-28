import { get, run, tx, uniqueSlug } from "./db";
import { bool, num, nullableNum, oneOf, str } from "./api";

export type ProjectInput = {
  slug?: string;
  title?: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  role?: string;
  client?: string;
  year?: string;
  coverUrl?: string;
  coverAlt?: string;
  categoryId?: number | null;
  status?: string;
  featured?: number;
  sortOrder?: number;
  layout?: string;
  accent?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string | null;
  images?: { url?: string; alt?: string; caption?: string; layout?: string }[];
  tagIds?: number[];
  links?: { label?: string; url?: string; kind?: string }[];
};

const STATUSES = ["draft", "published"] as const;
const LAYOUTS = ["grid", "wide", "tall"] as const;
const IMG_LAYOUTS = ["full", "half", "third", "portrait"] as const;

/** 新建项目，返回新 id。 */
export function createProject(input: ProjectInput): number {
  return tx(() => {
    const title = str(input.title).trim();
    const slug = uniqueSlug("projects", str(input.slug) || title);
    const status = oneOf(input.status, STATUSES, "draft");

    const r = run(
      `INSERT INTO projects
        (slug, title, subtitle, summary, description, role, client, year, cover_url, cover_alt,
         category_id, status, featured, sort_order, layout, accent, seo_title, seo_description, published_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        slug,
        title,
        str(input.subtitle),
        str(input.summary),
        str(input.description),
        str(input.role),
        str(input.client),
        str(input.year),
        str(input.coverUrl),
        str(input.coverAlt),
        nullableNum(input.categoryId),
        status,
        bool(input.featured, 0),
        num(input.sortOrder, 0),
        oneOf(input.layout, LAYOUTS, "grid"),
        str(input.accent),
        str(input.seoTitle),
        str(input.seoDescription),
        str(input.publishedAt) || (status === "published" ? new Date().toISOString().slice(0, 10) : null),
      ]
    );
    const id = Number(r.lastInsertRowid);
    writeChildren(id, input);
    return id;
  });
}

/** 更新项目（含子资源整体替换）。 */
export function updateProject(id: number, input: ProjectInput): void {
  tx(() => {
    const existing = dbGet(id);
    const title = str(input.title, existing?.title ?? "");
    const slug =
      str(input.slug).trim() && str(input.slug).trim() !== existing?.slug
        ? uniqueSlug("projects", str(input.slug), id)
        : (existing?.slug ?? uniqueSlug("projects", title));
    const status = oneOf(input.status, STATUSES, existing?.status ?? "draft");

    run(
      `UPDATE projects SET
         slug = ?, title = ?, subtitle = ?, summary = ?, description = ?, role = ?, client = ?,
         year = ?, cover_url = ?, cover_alt = ?, category_id = ?, status = ?, featured = ?,
         sort_order = ?, layout = ?, accent = ?, seo_title = ?, seo_description = ?,
         published_at = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        slug,
        title,
        str(input.subtitle, existing?.subtitle ?? ""),
        str(input.summary, existing?.summary ?? ""),
        str(input.description, existing?.description ?? ""),
        str(input.role, existing?.role ?? ""),
        str(input.client, existing?.client ?? ""),
        str(input.year, existing?.year ?? ""),
        str(input.coverUrl, existing?.coverUrl ?? ""),
        str(input.coverAlt, existing?.coverAlt ?? ""),
        input.categoryId === undefined ? existing?.categoryId ?? null : nullableNum(input.categoryId),
        status,
        bool(input.featured, existing?.featured ?? 0),
        num(input.sortOrder, existing?.sortOrder ?? 0),
        oneOf(input.layout, LAYOUTS, existing?.layout ?? "grid"),
        str(input.accent, existing?.accent ?? ""),
        str(input.seoTitle, existing?.seoTitle ?? ""),
        str(input.seoDescription, existing?.seoDescription ?? ""),
        str(input.publishedAt) ||
          existing?.publishedAt ||
          (status === "published" ? new Date().toISOString().slice(0, 10) : null),
        id,
      ]
    );
    writeChildren(id, input);
  });
}

function dbGet(id: number) {
  const r = get<Record<string, unknown>>("SELECT * FROM projects WHERE id = ?", [id]);
  if (!r) return null;
  return {
    id: r.id as number,
    slug: r.slug as string,
    title: r.title as string,
    subtitle: r.subtitle as string,
    summary: r.summary as string,
    description: r.description as string,
    role: r.role as string,
    client: r.client as string,
    year: r.year as string,
    coverUrl: r.cover_url as string,
    coverAlt: r.cover_alt as string,
    categoryId: (r.category_id as number) ?? null,
    status: r.status as string,
    featured: r.featured as number,
    sortOrder: r.sort_order as number,
    layout: r.layout as string,
    accent: r.accent as string,
    seoTitle: r.seo_title as string,
    seoDescription: r.seo_description as string,
    publishedAt: (r.published_at as string) ?? null,
  };
}

/** 图片 / 标签 / 外链：整体替换式写入。 */
function writeChildren(id: number, input: ProjectInput) {
  if (Array.isArray(input.images)) {
    run("DELETE FROM project_images WHERE project_id = ?", [id]);
    input.images.forEach((img, i) => {
      run(
        "INSERT INTO project_images (project_id, url, alt, caption, layout, sort_order) VALUES (?,?,?,?,?,?)",
        [
          id,
          str(img.url),
          str(img.alt),
          str(img.caption),
          oneOf(img.layout, IMG_LAYOUTS, "full"),
          num((img as { sortOrder?: number }).sortOrder, i + 1),
        ]
      );
    });
  }
  if (Array.isArray(input.tagIds)) {
    run("DELETE FROM project_tags WHERE project_id = ?", [id]);
    for (const tid of input.tagIds) {
      if (Number.isFinite(Number(tid))) {
        run("INSERT OR IGNORE INTO project_tags (project_id, tag_id) VALUES (?,?)", [id, Number(tid)]);
      }
    }
  }
  if (Array.isArray(input.links)) {
    run("DELETE FROM project_links WHERE project_id = ?", [id]);
    input.links.forEach((l, i) => {
      run("INSERT INTO project_links (project_id, label, url, kind, sort_order) VALUES (?,?,?,?,?)", [
        id,
        str(l.label, "链接"),
        str(l.url),
        str(l.kind, "link"),
        num((l as { sortOrder?: number }).sortOrder, i + 1),
      ]);
    });
  }
}
