import MediaFrame from "@/components/site/MediaFrame";
import type { Project } from "@/lib/content";

/**
 * 项目预览：仪表盘右半边的一只「浏览器窗口」，
 * 展示后台里真实的作品数据（封面 / 标题 / 年份 / 标签）。
 */
export default function ProjectPreview({ project }: { project: Project }) {
  const tags = project.tags.slice(0, 3).map((t) => t.name);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080d16]">
      {/* 浏览器条 */}
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-white/18" />
        <span className="h-2 w-2 rounded-full bg-white/18" />
        <span className="h-2 w-2 rounded-full bg-white/18" />
        <span className="ml-2 truncate font-mono text-[10px] tracking-[0.14em] text-white/35">
          {project.slug}
        </span>
      </div>

      {/* 封面 */}
      <div className="relative min-h-0 flex-1">
        <MediaFrame
          src={project.coverUrl}
          alt={project.coverAlt || project.title}
          seed={project.slug}
          accent={project.accent}
          className="h-full w-full"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4">
          <p className="font-display text-[15px] leading-tight tracking-[-0.01em] text-white">
            {project.title}
          </p>
          <p className="t-mono mt-1 text-[10px] tracking-[0.12em] text-white/50">
            {[project.year, ...tags].filter(Boolean).join("  ·  ")}
          </p>
        </div>
      </div>
    </div>
  );
}
