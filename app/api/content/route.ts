import { getSiteBundle } from "@/lib/content";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/** 前台公开数据：任何内容改动后立即反映。 */
export async function GET() {
  return ok(getSiteBundle());
}
