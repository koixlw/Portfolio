import { getProjects } from "@/lib/content";
import { updateProject, type ProjectInput } from "@/lib/project-write";
import { bad, ok, readBody, requireAuth } from "@/lib/api";
import { run } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const project = getProjects({ includeDrafts: true }).find((p) => p.id === Number(id));
  if (!project) return bad("项目不存在", 404);
  return ok({ project });
}

export async function PUT(req: Request, ctx: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await ctx.params;
  const projectId = Number(id);
  const body = await readBody<ProjectInput>(req);

  // 部分更新语义：未提供的字段沿用原值（updateProject 内部逐字段回退）
  const existing = getProjects({ includeDrafts: true }).find((p) => p.id === projectId);
  if (!existing) return bad("项目不存在", 404);
  const nextTitle = String(body.title ?? existing.title).trim();
  if (!nextTitle) return bad("请填写项目名称");

  updateProject(projectId, { ...body, title: nextTitle });
  const project = getProjects({ includeDrafts: true }).find((p) => p.id === projectId);
  return ok({ project });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await ctx.params;
  const projectId = Number(id);
  run("DELETE FROM projects WHERE id = ?", [projectId]);
  return ok({ ok: true, id: projectId });
}
