import { getCategories } from "@/lib/content";
import { bad, bool, ok, num, readBody, requireAuth, str } from "@/lib/api";
import { run, uniqueSlug } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await ctx.params;
  const cid = Number(id);
  const current = getCategories(true).find((c) => c.id === cid);
  if (!current) return bad("分类不存在", 404);

  const b = await readBody(req);
  const name = str(b.name, current.name).trim();
  const slugRaw = str(b.slug).trim();
  const slug = slugRaw && slugRaw !== current.slug ? uniqueSlug("categories", slugRaw, cid) : current.slug;

  run(
    "UPDATE categories SET slug = ?, name = ?, description = ?, color = ?, sort_order = ?, is_visible = ? WHERE id = ?",
    [
      slug,
      name,
      str(b.description, current.description),
      str(b.color, current.color),
      num(b.sortOrder, current.sortOrder),
      bool(b.isVisible, current.isVisible),
      cid,
    ]
  );
  return ok({ categories: getCategories(true) });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await ctx.params;
  run("DELETE FROM categories WHERE id = ?", [Number(id)]);
  return ok({ ok: true, categories: getCategories(true) });
}
