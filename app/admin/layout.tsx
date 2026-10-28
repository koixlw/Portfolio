import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "后台管理",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg text-fg">{children}</div>;
}
