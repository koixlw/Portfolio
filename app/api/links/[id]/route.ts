import { getGlobalLinks } from "@/lib/content";
import { bad, bool, ok, num, readBody, requireAuth, str } from "@/lib/api";
import { run } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await ctx.params;
  const lid = Number(id);
  const current = getGlobalLinks(true).find((l) => l.id === lid);
  if (!current) return bad("链接不存在", 404);

  const b = await readBody(req);
  run(
    "UPDATE links SET label = ?, url = ?, icon = ?, kind = ?, target = ?, sort_order = ?, is_visible = ? WHERE id = ?",
    [
      str(b.label, current.label),
      str(b.url, current.url),
      str(b.icon, current.icon),
      str(b.kind, current.kind),
      str(b.target, current.target),
      num(b.sortOrder, current.sortOrder),
      bool(b.isVisible, current.isVisible),
      lid,
    ]
  );
  return ok({ links: getGlobalLinks(true) });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await ctx.params;
  run("DELETE FROM links WHERE id = ?", [Number(id)]);
  return ok({ ok: true, links: getGlobalLinks(true) });
}
