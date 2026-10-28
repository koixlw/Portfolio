import { changePassword, currentUser } from "@/lib/auth";
import { bad, ok, readBody, requireAuth } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const user = await currentUser();
  if (!user) return bad("未登录", 401);

  const body = await readBody<{ password?: string }>(req);
  const password = String(body.password ?? "");
  if (password.length < 8) return bad("新密码至少 8 位");
  changePassword(user.id, password);
  return ok({ ok: true });
}
