import { getCategories } from "@/lib/content";
import { bad, bool, ok, num, oneOf, readBody, requireAuth, str } from "@/lib/api";
import { run, uniqueSlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({ categories: getCategories(true) });
}

export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const b = await readBody(req);
  const name = str(b.name).trim();
  if (!name) return bad("请填写分类名称");

  const r = run(
    "INSERT INTO categories (slug, name, description, color, sort_order, is_visible) VALUES (?,?,?,?,?,?)",
    [
      uniqueSlug("categories", str(b.slug) || name),
      name,
      str(b.description),
      str(b.color),
      num(b.sortOrder, 0),
      bool(b.isVisible, 1),
    ]
  );
  return ok({ id: r.lastInsertRowid, categories: getCategories(true) });
}
