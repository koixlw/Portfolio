import { getTags } from "@/lib/content";
import { bad, ok, num, readBody, requireAuth, str } from "@/lib/api";
import { run, uniqueSlug } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await ctx.params;
  const tid = Number(id);
  const current = getTags().find((t) => t.id === tid);
  if (!current) return bad("标签不存在", 404);

  const b = await readBody(req);
  const name = str(b.name, current.name).trim();
  const slugRaw = str(b.slug).trim();
  const slug = slugRaw && slugRaw !== current.slug ? uniqueSlug("tags", slugRaw, tid) : current.slug;

  run("UPDATE tags SET slug = ?, name = ?, color = ?, sort_order = ? WHERE id = ?", [
    slug,
    name,
    str(b.color, current.color),
    num(b.sortOrder, current.sortOrder),
    tid,
  ]);
  return ok({ tags: getTags() });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await ctx.params;
  run("DELETE FROM tags WHERE id = ?", [Number(id)]);
  return ok({ ok: true, tags: getTags() });
}
