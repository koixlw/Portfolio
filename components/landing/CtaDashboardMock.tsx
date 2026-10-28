import ChatPanel from "./ChatPanel";
import ProjectPreview from "./ProjectPreview";
import type { Project } from "@/lib/content";

/**
 * 仪表盘模型：左边一次项目沟通，右边作品实时预览。
 * 整体是一块毛玻璃，比例从手机竖版 3/4 走到宽屏 16/9。
 */
export default function CtaDashboardMock({ project }: { project: Project }) {
  return (
    <div className="liquid-glass mx-auto aspect-[3/4] w-full max-w-[1100px] overflow-hidden rounded-2xl p-2 sm:aspect-[16/10] sm:p-3 lg:aspect-[16/9]">
      <div className="grid h-full grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,320px)_1fr] sm:gap-3">
        <div className="hidden min-h-0 sm:block">
          <ChatPanel initialScroll="top" animateMessagesIn />
        </div>
        <div className="min-h-0">
          <ProjectPreview project={project} />
        </div>
      </div>
    </div>
  );
}
