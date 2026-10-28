import { getProjects } from "@/lib/content";
import { createProject, type ProjectInput } from "@/lib/project-write";
import { bad, ok, readBody, requireAuth } from "@/lib/api";
import { get } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = getProjects({ includeDrafts: true });
  return ok({ projects });
}

export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await readBody<ProjectInput>(req);
  if (!String(body.title ?? "").trim()) return bad("请填写项目名称");

  const id = createProject(body);
  return ok({ id, project: getProjects({ includeDrafts: true }).find((p) => p.id === id) });
}
