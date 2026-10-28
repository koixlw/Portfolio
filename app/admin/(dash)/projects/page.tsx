import { getCategories, getProjects } from "@/lib/content";
import ProjectsList from "@/components/admin/ProjectsList";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  return (
    <ProjectsList initial={getProjects({ includeDrafts: true })} categories={getCategories(true)} />
  );
}
