import { NextResponse } from "next/server";
import { currentUser } from "./auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data as object, init);
}

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** 未登录时返回 401 响应；已登录返回 null。 */
export async function requireAuth(): Promise<NextResponse | null> {
  const user = await currentUser();
  if (!user) return bad("未登录或登录已过期", 401);
  return null;
}

export async function readBody<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

/** 把布尔 / 数字 / 空串统一成适合入库的值。 */
export function str(v: unknown, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

export function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function bool(v: unknown, fallback = 0): number {
  if (v === undefined || v === null) return fallback;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string") return v === "true" || v === "1" || v === "on" ? 1 : 0;
  return Number(v) ? 1 : 0;
}

export function nullableNum(v: unknown): number | null {
  if (v === undefined || v === null || v === "" || v === "null") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  const s = String(v);
  return (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
}
