import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { run } from "@/lib/db";
import { bad, ok, requireAuth } from "@/lib/api";
import { ensureUploadDir, UPLOAD_DIR, UPLOAD_URL_PREFIX } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  if (!form) return bad("无效的上传请求");

  const file = form.get("file");
  if (!(file instanceof File)) return bad("没有收到文件");
  if (file.size > MAX_BYTES) return bad("文件过大（上限 10MB）");

  const ext = EXT[file.type];
  if (!ext) return bad("仅支持图片格式：JPG / PNG / WebP / GIF / AVIF / SVG");

  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash("md5").update(buffer).digest("hex").slice(0, 10);
  const filename = `${Date.now().toString(36)}-${hash}${ext}`;

  await ensureUploadDir();
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  const url = `${UPLOAD_URL_PREFIX}/${filename}`;
  const r = run("INSERT INTO media (url, filename, alt, size) VALUES (?,?,?,?)", [
    url,
    file.name,
    "",
    file.size,
  ]);

  return ok({ url, id: r.lastInsertRowid, size: file.size, type: file.type });
}
