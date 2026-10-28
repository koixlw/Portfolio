import { getTags } from "@/lib/content";
import { bad, ok, num, readBody, requireAuth, str } from "@/lib/api";
import { run, uniqueSlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({ tags: getTags() });
}

export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const b = await readBody(req);
  const name = str(b.name).trim();
  if (!name) return bad("请填写标签名称");

  const r = run("INSERT INTO tags (slug, name, color, sort_order) VALUES (?,?,?,?)", [
    uniqueSlug("tags", str(b.slug) || name),
    name,
    str(b.color),
    num(b.sortOrder, 0),
  ]);
  return ok({ id: r.lastInsertRowid, tags: getTags() });
}
