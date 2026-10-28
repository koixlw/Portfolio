import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import MediaFrame from "@/components/site/MediaFrame";
import { getGlobalLinks, getProfile, getProjectBySlug, getProjects, getSite } from "@/lib/content";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

const NAV = [
  { label: "作品", url: "/#work" },
  { label: "关于", url: "/#about" },
  { label: "联系", url: "/#contact" },
];

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "作品" };
  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    openGraph: {
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.summary,
      images: project.coverUrl ? [project.coverUrl] : undefined,
    },
  };
}

const IMG_SPAN: Record<string, string> = {
  full: "md:col-span-12",
  half: "md:col-span-6",
  third: "md:col-span-4",
  portrait: "md:col-span-4",
};

const IMG_HEIGHT: Record<string, string> = {
  full: "min-h-[clamp(260px,42vw,620px)]",
  half: "min-h-[clamp(240px,32vw,460px)]",
  third: "min-h-[clamp(240px,30vw,440px)]",
  portrait: "min-h-[clamp(320px,42vw,620px)]",
};

export default async function ProjectPage({ params }: Ctx) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const profile = getProfile();
  const site = getSite();
  const links = getGlobalLinks();
  const all = getProjects();
  const index = all.findIndex((p) => p.slug === project.slug);
  const next = all[(index + 1) % all.length];

  const paragraphs = project.description.split(/\n+/).filter((p) => p.trim());

  return (
    <>
      <Nav name={profile.name} items={NAV} email={profile.email} />

      <main>
        {/* 头部 */}
        <article className="pt-[calc(var(--nav-h)+3rem)]">
          <div className="u-container">
            <Link
              href="/#work"
              className="t-label inline-flex items-center gap-2 transition-colors hover:text-fg"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              返回作品集
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
              <div>
                <p className="t-label mb-5" data-reveal>
                  {project.category?.name ?? "作品"}
                  {project.year && ` · ${project.year}`}
                </p>
                <h1 className="t-h1" data-mask>
                  <span>{project.title}</span>
                </h1>
                {project.subtitle && (
                  <p
                    className="t-body-lg mt-5 max-w-2xl text-fg-muted"
                    data-reveal
                    style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
                  >
                    {project.subtitle}
                  </p>
                )}
              </div>

              {/* 项目信息 */}
              <dl
                className="border-t border-line text-sm"
                data-reveal
                style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
              >
                {[
                  ["角色", project.role],
                  ["客户", project.client],
                  ["年份", project.year],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-b border-line py-3">
                      <dt className="text-fg-subtle">{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                {project.tags.length > 0 && (
                  <div className="flex justify-between gap-6 border-b border-line py-3">
                    <dt className="text-fg-subtle">标签</dt>
                    <dd className="flex flex-wrap justify-end gap-x-3">
                      {project.tags.map((t) => (
                        <span key={t.id}>#{t.name}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* 封面 */}
            <div className="mt-12" data-reveal="clip">
              <MediaFrame
                src={project.coverUrl}
                alt={project.coverAlt || project.title}
                seed={project.slug}
                accent={project.accent}
                className="w-full min-h-[clamp(300px,52vw,760px)]"
                sizes="100vw"
                priority
              />
            </div>

            {/* 概述 */}
            {project.summary && (
              <p
                className="t-h3 mt-16 max-w-3xl text-fg-muted"
                data-reveal
              >
                {project.summary}
              </p>
            )}

            {/* 正文 */}
            {paragraphs.length > 0 && (
              <div className="prose-body t-body-lg mt-10 max-w-2xl text-fg-muted" data-reveal>
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {/* 图文 */}
            {project.images.length > 0 && (
              <div className="mt-20 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-12">
                {project.images.map((img, i) => (
                  <figure
                    key={img.id}
                    className={`${IMG_SPAN[img.layout] ?? IMG_SPAN.full} group`}
                    data-reveal
                    style={{ "--reveal-delay": `${Math.min(i, 5) * 80}ms` } as React.CSSProperties}
                  >
                    <MediaFrame
                      src={img.url}
                      alt={img.alt}
                      seed={`${project.slug}-${img.id}`}
                      accent={project.accent}
                      index={i}
                      className={`w-full ${IMG_HEIGHT[img.layout] ?? IMG_HEIGHT.full}`}
                      sizes="(min-width:768px) 50vw, 100vw"
                    />
                    {img.caption && (
                      <figcaption className="t-label mt-3">{img.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {/* 外链 */}
            {project.links.length > 0 && (
              <div className="mt-20 flex flex-wrap gap-3 border-t border-line pt-8">
                {project.links.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[13px] transition-colors hover:border-accent hover:text-accent"
                  >
                    {l.label}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ))}
              </div>
            )}

            {/* 下一个 */}
            {next && next.slug !== project.slug && (
              <Link href={`/work/${next.slug}`} className="group mt-20 block border-t border-line pt-10">
                <span className="t-label">下一个项目</span>
                <div className="mt-4 flex items-end justify-between gap-6">
                  <span className="t-h2 transition-colors group-hover:text-accent">{next.title}</span>
                  <span className="t-mono shrink-0 text-[11px] text-fg-subtle">
                    {String(all.findIndex((p) => p.slug === next.slug) + 1).padStart(2, "0")}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </article>
      </main>

      <Footer site={site} links={links} name={profile.name} />
    </>
  );
}
