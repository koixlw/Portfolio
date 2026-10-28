import Clock from "./Clock";
import type { GlobalLink, SiteSettings } from "@/lib/content";

export default function Footer({
  site,
  links,
  name,
}: {
  site: SiteSettings;
  links: GlobalLink[];
  name: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="u-container py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-baseline gap-4">
            <span className="font-display text-[17px] tracking-[-0.01em]">{name}</span>
            <sup className="text-[0.45em] text-fg-subtle">®</sup>
            <span className="t-label hidden sm:inline">{site.siteDescription}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {links
              .filter((l) => l.kind === "social")
              .slice(0, 4)
              .map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target={l.target === "_blank" ? "_blank" : undefined}
                  rel="noreferrer"
                  className="t-label transition-colors hover:text-fg"
                >
                  {l.label}
                </a>
              ))}
            <Clock />
            <a href="#top" className="t-label hidden transition-colors hover:text-fg sm:inline">
              ↑ 回到顶部
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label">© {year} {name}. 保留所有权利。</p>
          <p className="t-label">
            Designed &amp; built by <span className="text-accent">{name}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
