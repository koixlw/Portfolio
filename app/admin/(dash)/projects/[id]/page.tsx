import { notFound } from "next/navigation";
import { getCategories, getProjects, getTags } from "@/lib/content";
import ProjectEditor from "@/components/admin/ProjectEditor";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjects({ includeDrafts: true }).find((p) => p.id === Number(id));
  if (!project) notFound();

  return (
    <ProjectEditor
      mode="edit"
      project={project}
      categories={getCategories(true)}
      tags={getTags()}
    />
  );
}
