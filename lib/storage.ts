import fs from "node:fs/promises";
import path from "node:path";

/**
 * 上传文件存储。
 * 放在 data/uploads 下，和数据库放在一起 —— 备份时整个 data/ 目录拷走即可。
 * 不放 public/，因为生产模式下 next start 只提供构建时快照的 public 文件，
 * 运行时新增的图片会 404。
 */

export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
export const UPLOAD_URL_PREFIX = "/media";

export const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/** 只允许纯文件名，杜绝路径穿越。 */
export function safeName(name: string): string | null {
  const base = path.basename(name);
  if (!base || base === "." || base === "..") return null;
  if (!/^[A-Za-z0-9._-]+$/.test(base)) return null;
  return base;
}

export async function readUpload(name: string): Promise<Buffer | null> {
  const safe = safeName(name);
  if (!safe) return null;
  const target = path.join(UPLOAD_DIR, safe);
  // 双保险：解析后的绝对路径必须仍在上传目录内
  if (!path.resolve(target).startsWith(path.resolve(UPLOAD_DIR) + path.sep)) return null;
  try {
    return await fs.readFile(target);
  } catch {
    return null;
  }
}

export async function deleteUpload(name: string): Promise<void> {
  const safe = safeName(name);
  if (!safe) return;
  const target = path.join(UPLOAD_DIR, safe);
  if (!path.resolve(target).startsWith(path.resolve(UPLOAD_DIR) + path.sep)) return;
  await fs.unlink(target).catch(() => undefined);
}

export function contentTypeFor(name: string): string {
  return MIME_BY_EXT[path.extname(name).toLowerCase()] ?? "application/octet-stream";
}
