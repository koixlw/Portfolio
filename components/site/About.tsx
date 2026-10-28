import SectionHeader from "./SectionHeader";
import type { Profile, Tag } from "@/lib/content";

export default function About({ profile, tags }: { profile: Profile; tags: Tag[] }) {
  const paragraphs = profile.bio.split(/\n+/).filter((p) => p.trim());

  return (
    <section id="about" className="scroll-mt-24 border-t border-line">
      <div className="u-container py-24 md:py-32">
        <SectionHeader
          index="02"
          eyebrow="ABOUT"
          title="关于"
          description="我是谁，以及我在做什么。"
        />

        <div className="grid gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
          {/* 左侧：自述 */}
          <div>
            <div className="max-w-2xl" data-reveal>
              {paragraphs.map((p, i) =>
                i === 0 ? (
                  <p
                    key={i}
                    className="t-h3 mb-8 text-fg"
                    style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                  >
                    {p}
                  </p>
                ) : (
                  <p
                    key={i}
                    className={`t-body-lg text-fg-muted ${
                      i === paragraphs.length - 1 ? "mb-0" : "mb-6"
                    }`}
                    style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                  >
                    {p}
                  </p>
                )
              )}
            </div>

            {/* 数字 */}
            {profile.stats.length > 0 && (
              <div
                className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line sm:grid-cols-3"
                data-reveal
                style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
              >
                {profile.stats.map((s, i) => (
                  <div key={i} className="bg-bg px-6 py-7">
                    <div className="font-display text-[clamp(1.9rem,3.4vw,2.9rem)] leading-none tracking-[-0.02em] text-accent">
                      {s.value}
                    </div>
                    <div className="t-label mt-2.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：能力标签 */}
          <div data-reveal style={{ "--reveal-delay": "160ms" } as React.CSSProperties}>
            <div className="border-t border-line pt-5">
              <h3 className="t-eyebrow text-fg-subtle">擅长 / STACK</h3>
              <ul className="mt-5 space-y-0">
                {tags.slice(0, 8).map((t, i) => (
                  <li
                    key={t.id}
                    className="group flex items-center justify-between border-b border-line py-3.5 transition-colors hover:border-line-strong"
                  >
                    <span className="flex items-center gap-3">
                      <span className="t-mono text-[10px] text-fg-subtle">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-[16px] tracking-[-0.01em] transition-colors group-hover:text-accent">
                        {t.name}
                      </span>
                    </span>
                    {t.color && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: t.color }}
                        aria-hidden
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* 联系信息 */}
            <div className="mt-10 space-y-3 border-t border-line pt-5">
              <h3 className="t-eyebrow text-fg-subtle">基本信息 / INFO</h3>
              {profile.location && (
                <div className="flex justify-between gap-4 py-1.5 text-sm">
                  <span className="text-fg-subtle">坐标</span>
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex justify-between gap-4 py-1.5 text-sm">
                  <span className="text-fg-subtle">邮箱</span>
                  <a href={`mailto:${profile.email}`} className="u-link-underline">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.phone && (
                <div className="flex justify-between gap-4 py-1.5 text-sm">
                  <span className="text-fg-subtle">电话</span>
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
