import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <span className="t-label">404</span>
      <h1 className="t-h1 mt-5">这里什么都没有</h1>
      <p className="mt-3 max-w-md text-sm text-fg-muted">
        你要找的页面可能已经被移动或删除了。
      </p>
      <Link
        href="/"
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[13px] font-medium text-accent-ink transition-opacity hover:opacity-90"
      >
        回到首页
      </Link>
    </div>
  );
}
