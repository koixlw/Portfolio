import { all } from "@/lib/db";
import MediaLibrary from "@/components/admin/MediaLibrary";

export const dynamic = "force-dynamic";

export default function MediaPage() {
  const media = all<{
    id: number;
    url: string;
    filename: string;
    alt: string;
    size: number;
    created_at: string;
  }>("SELECT * FROM media ORDER BY id DESC");

  return <MediaLibrary initial={media} />;
}
