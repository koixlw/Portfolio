import { getCategories, getTags } from "@/lib/content";
import ProjectEditor from "@/components/admin/ProjectEditor";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <ProjectEditor mode="create" categories={getCategories(true)} tags={getTags()} />
  );
}
