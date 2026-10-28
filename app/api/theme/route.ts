import { setSetting } from "@/lib/db";
import { getSite, getTheme } from "@/lib/content";
import { DEFAULT_THEME } from "@/lib/db";
import { ok, readBody, requireAuth } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({ theme: getTheme(), site: getSite() });
}

export async function PUT(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const b = await readBody<{ theme?: Record<string, unknown>; site?: Record<string, unknown> }>(req);

  if (b.theme && typeof b.theme === "object") {
    const next: Record<string, unknown> = { ...DEFAULT_THEME, ...getTheme() };
    for (const [k, v] of Object.entries(b.theme)) next[k] = v;
    setSetting("theme", next);
  }
  if (b.site && typeof b.site === "object") {
    const current = getSite();
    setSetting("site", { ...current, ...b.site });
  }
  return ok({ theme: getTheme(), site: getSite() });
}
