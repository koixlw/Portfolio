import { NextResponse } from "next/server";
import { authenticate, createSessionToken, ensureDefaultUser, sessionCookie } from "@/lib/auth";
import { bad, readBody } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  ensureDefaultUser();
  const body = await readBody<{ username?: string; password?: string }>(req);
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (!username || !password) return bad("请输入用户名和密码");

  const user = authenticate(username, password);
  if (!user) return bad("用户名或密码不正确", 401);

  const res = NextResponse.json({ ok: true, user: { username: user.username } });
  res.cookies.set(sessionCookie.name, createSessionToken(user.username), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: sessionCookie.maxAge,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
