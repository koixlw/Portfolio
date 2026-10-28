import { contentTypeFor, readUpload } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * 提供上传的图片。
 * 生产模式下 next start 不会提供运行时新增的 public/ 文件，
 * 所以图片统一走这个路由，URL 形如 /media/xxxx.png。
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ file: string[] }> }
) {
  const { file } = await ctx.params;
  const name = file.join("/");
  const data = await readUpload(name);

  if (!data) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": contentTypeFor(name),
      "Content-Length": String(data.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
