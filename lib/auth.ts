import crypto from "node:crypto";
import { cookies } from "next/headers";
import { all, get, run, setSetting } from "./db";

const COOKIE = "pf_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 天

/* ------------------------------------------------------------------ */
/* password hashing (scrypt)                                           */
/* ------------------------------------------------------------------ */

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, salt: string, expected: string): boolean {
  const actual = Buffer.from(hashPassword(password, salt), "hex");
  const want = Buffer.from(expected, "hex");
  if (actual.length !== want.length) return false;
  return crypto.timingSafeEqual(actual, want);
}

/* ------------------------------------------------------------------ */
/* session secret                                                      */
/* ------------------------------------------------------------------ */

function sessionSecret(): string {
  let row = get<{ value: string }>("SELECT value FROM settings WHERE key = 'session_secret'");
  if (!row) {
    const secret = crypto.randomBytes(32).toString("hex");
    setSetting("session_secret", secret);
    return secret;
  }
  return row.value;
}

/* ------------------------------------------------------------------ */
/* signed cookie session                                               */
/* ------------------------------------------------------------------ */

function sign(payload: string): string {
  return crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + MAX_AGE * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): { u: string } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      u: string;
      exp: number;
    };
    if (!data.u || Date.now() > data.exp) return null;
    return { u: data.u };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* users                                                               */
/* ------------------------------------------------------------------ */

export type AdminUser = { id: number; username: string };

export function listUsers(): AdminUser[] {
  return all<AdminUser>("SELECT id, username FROM users ORDER BY id");
}

export function ensureDefaultUser() {
  const count = all<{ id: number }>("SELECT id FROM users");
  if (count.length > 0) return;
  const username = "admin";
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword("admin12345", salt);
  run("INSERT INTO users (username, password_hash, salt) VALUES (?,?,?)", [username, hash, salt]);
}

export function authenticate(username: string, password: string): AdminUser | null {
  const row = get<{ id: number; username: string; password_hash: string; salt: string }>(
    "SELECT id, username, password_hash, salt FROM users WHERE username = ?",
    [username]
  );
  if (!row) return null;
  if (!verifyPassword(password, row.salt, row.password_hash)) return null;
  return { id: row.id, username: row.username };
}

export function changePassword(userId: number, password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  run("UPDATE users SET password_hash = ?, salt = ?, updated_at = datetime('now') WHERE id = ?", [
    hash,
    salt,
    userId,
  ]);
}

/* ------------------------------------------------------------------ */
/* request helpers                                                     */
/* ------------------------------------------------------------------ */

export async function currentUser(): Promise<AdminUser | null> {
  const jar = await cookies();
  const session = readSessionToken(jar.get(COOKIE)?.value);
  if (!session) return null;
  const row = get<{ id: number; username: string }>(
    "SELECT id, username FROM users WHERE username = ?",
    [session.u]
  );
  return row ?? null;
}

export const sessionCookie = {
  name: COOKIE,
  maxAge: MAX_AGE,
};

export { COOKIE as SESSION_COOKIE_NAME };
