import { getSite, getTheme } from "@/lib/content";
import ThemeEditor from "@/components/admin/ThemeEditor";

export const dynamic = "force-dynamic";

export default function ThemePage() {
  return <ThemeEditor initialTheme={getTheme()} initialSite={getSite()} />;
}
