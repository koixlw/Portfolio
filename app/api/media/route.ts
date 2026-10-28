import { all, run } from "@/lib/db";
import { bad, ok, requireAuth, str } from "@/lib/api";
import { deleteUpload } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const media = all<{ id: number; url: string; filename: string; alt: string; size: number; created_at: string }>(
    "SELECT * FROM media ORDER BY id DESC"
  );
  return ok({ media });
}

export async function PUT(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return bad("缺少 id");
  run("UPDATE media SET alt = ? WHERE id = ?", [str(body.alt), id]);
  return ok({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await req.json().catch(() => ({}));
  const mediaId = Number(id);
  const row = all<{ url: string }>("SELECT url FROM media WHERE id = ?", [mediaId])[0];
  if (!row) return bad("资源不存在", 404);

  run("DELETE FROM media WHERE id = ?", [mediaId]);

  // 只删除上传目录内的文件，避免路径穿越
  await deleteUpload(row.url.split("/").pop() ?? "");

  return ok({ ok: true });
}
