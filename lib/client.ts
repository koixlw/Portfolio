"use client";

/** 通知已打开的前台标签页：内容已更新，请刷新。 */
export function notifyContentChanged() {
  try {
    const bc = new BroadcastChannel("pf-cms");
    bc.postMessage({ type: "content-updated" });
    bc.close();
  } catch {
    /* 不支持就忽略 */
  }
}

export async function api<T = unknown>(
  url: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(rest.headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      (data as { error?: string } | null)?.error ?? `请求失败（${res.status}）`;
    throw new Error(msg);
  }
  return data as T;
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
