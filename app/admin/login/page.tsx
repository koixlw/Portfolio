import { redirect } from "next/navigation";
import { currentUser, ensureDefaultUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  ensureDefaultUser();
  const user = await currentUser();
  if (user) redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      {/* 背景 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%), radial-gradient(50% 50% at 85% 90%, color-mix(in srgb, var(--accent-2) 10%, transparent), transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-[400px]">
        <div className="mb-8">
          <div className="font-display text-[15px] tracking-[-0.01em]">
            Portfolio<span className="text-accent">.</span>CMS
          </div>
          <h1 className="t-h2 mt-8">登录后台</h1>
          <p className="mt-2 text-[13px] text-fg-muted">管理作品集的全部内容。</p>
        </div>

        <LoginForm />

        <p className="mt-6 rounded-[var(--radius)] border border-line px-4 py-3 text-[12px] leading-relaxed text-fg-subtle">
          首次使用请用 <span className="text-fg">admin</span> /{" "}
          <span className="text-fg">admin12345</span> 登录，登录后请立刻在「主题与排版」页修改密码。
        </p>
      </div>
    </div>
  );
}
