import { run } from "@/lib/db";
import { getProfile } from "@/lib/content";
import { bad, ok, readBody, requireAuth, str } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({ profile: getProfile() });
}

export async function PUT(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const b = await readBody(req);
  const cur = getProfile();

  // 合并语义：只提交部分字段时，其余字段保持原值（不清空）
  const social = Array.isArray(b.social) ? b.social : cur.social;
  const stats = Array.isArray(b.stats) ? b.stats : cur.stats;
  const heroLines = Array.isArray(b.heroLines) ? b.heroLines : cur.heroLines;

  run(
    `UPDATE profile SET
       name = ?, role = ?, tagline = ?, bio = ?, avatar_url = ?, location = ?,
       email = ?, phone = ?, resume_url = ?, availability = ?, social_json = ?, stats_json = ?,
       hero_image = ?, hero_image_alt = ?, hero_kicker = ?, signature = ?, hero_lines = ?,
       hero_title = ?, hero_title_cn = ?, hero_sub = ?, hero_video = ?,
       updated_at = datetime('now')
     WHERE id = 1`,
    [
      str(b.name, cur.name),
      str(b.role, cur.role),
      str(b.tagline, cur.tagline),
      str(b.bio, cur.bio),
      str(b.avatarUrl, cur.avatarUrl),
      str(b.location, cur.location),
      str(b.email, cur.email),
      str(b.phone, cur.phone),
      str(b.resumeUrl, cur.resumeUrl),
      str(b.availability, cur.availability),
      JSON.stringify(social),
      JSON.stringify(stats),
      str(b.heroImage, cur.heroImage),
      str(b.heroImageAlt, cur.heroImageAlt),
      str(b.heroKicker, cur.heroKicker),
      str(b.signature, cur.signature),
      JSON.stringify(heroLines),
      str(b.heroTitle, cur.heroTitle),
      str(b.heroTitleCn, cur.heroTitleCn),
      str(b.heroSub, cur.heroSub),
      str(b.heroVideo, cur.heroVideo),
    ]
  );
  return ok({ profile: getProfile() });
}
