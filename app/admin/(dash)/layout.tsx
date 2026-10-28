import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");

  return <AdminShell username={user.username}>{children}</AdminShell>;
}
