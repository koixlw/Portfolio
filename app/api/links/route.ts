import { getGlobalLinks } from "@/lib/content";
import { bad, bool, ok, num, readBody, requireAuth, str } from "@/lib/api";
import { run } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({ links: getGlobalLinks(true) });
}

export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const b = await readBody(req);
  const label = str(b.label).trim();
  const url = str(b.url).trim();
  if (!label || !url) return bad("请填写链接名称和地址");

  const r = run(
    "INSERT INTO links (label, url, icon, kind, target, sort_order, is_visible) VALUES (?,?,?,?,?,?,?)",
    [
      label,
      url,
      str(b.icon),
      str(b.kind, "social"),
      str(b.target, "_self"),
      num(b.sortOrder, 0),
      bool(b.isVisible, 1),
    ]
  );
  return ok({ id: r.lastInsertRowid, links: getGlobalLinks(true) });
}
