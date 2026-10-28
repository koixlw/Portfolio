import Magnetic from "./Magnetic";
import Parallax from "./Parallax";
import HeroBackdrop from "./HeroBackdrop";
import type { Profile } from "@/lib/content";

type Props = {
  profile: Profile;
  style: "split" | "centered" | "showcase";
};

const KEYWORDS = [
  "前端架构",
  "TypeScript",
  "设计系统",
  "数据可视化",
  "性能优化",
  "Node / Postgres",
  "独立交付",
  "动效实现",
];

/**
 * 中文标题按标点断行：在逗号、顿号之后换行，
 * 避免浏览器把「时候」这种词拆到两行里。
 */
function splitCnLines(text: string): string[] {
  return text
    .split(/(?<=[，、。；：！？])/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Hero({ profile, style }: Props) {
  const { name, role, tagline, avatarUrl, location, availability, resumeUrl } = profile;

  /* ---------------------------------------------------------------- */
  /* showcase：夜航首屏 —— 夜景视频 + 衬线巨字 + 玻璃胶囊 CTA           */
  /* ---------------------------------------------------------------- */
  if (style === "showcase") {
    const kicker = profile.heroKicker || "PORTFOLIO";
    // 中文副文案只有一个来源：后台的「一句话介绍」。一行一句，回车换行。
    const lines = (tagline || profile.heroLines.join("\n"))
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const titleEn = profile.heroTitle || "Where the code outlives the noise.";
    const titleCn = profile.heroTitleCn;
    const sub = profile.heroSub;

    return (
      <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <HeroBackdrop
          video={profile.heroVideo}
          image={profile.heroImage}
          alt={profile.heroImageAlt}
        />

        <div className="relative z-10 flex flex-1 flex-col justify-center pb-10 pt-[calc(var(--nav-h)+2rem)] md:pb-14">
          <div className="u-container">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              {/* 状态 */}
              {availability && (
                <span
                  className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] text-white/75"
                  data-reveal
                >
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
                  {availability}
                </span>
              )}

              {/* 小标签 */}
              <span
                className="t-eyebrow mt-6 text-white/40"
                data-reveal
                style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
              >
                {kicker}
              </span>

              {/* 英文大标题 */}
              <h1
                className="t-display mt-4 max-w-4xl text-balance text-white"
                data-mask
                style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
              >
                <span>{titleEn}</span>
              </h1>

              {/* 中文大标题 */}
              {titleCn && (
                <h2
                  className="t-h1 mt-4 max-w-3xl text-balance text-white/55"
                  data-reveal
                  style={{ "--reveal-delay": "260ms" } as React.CSSProperties}
                >
                  {splitCnLines(titleCn).map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              )}

              {/* 英文副文案 */}
              {sub && (
                <p
                  className="t-body-lg mt-6 max-w-2xl text-balance text-white/55"
                  data-reveal
                  style={{ "--reveal-delay": "340ms" } as React.CSSProperties}
                >
                  {sub}
                </p>
              )}

              {/* 中文副文案 */}
              {lines.length > 0 && (
                <div
                  className="mt-3 flex flex-col gap-1"
                  data-reveal
                  style={{ "--reveal-delay": "420ms" } as React.CSSProperties}
                >
                  {lines.map((line, i) => (
                    <p key={i} className="text-[15px] tracking-[0.01em] text-white/45">
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {/* 主行动 */}
              <div
                className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4"
                data-reveal
                style={{ "--reveal-delay": "520ms" } as React.CSSProperties}
              >
                <Magnetic strength={0.22}>
                  <a
                    href="#contact"
                    className="liquid-glass inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[13.5px] text-white/90 transition-colors duration-300 hover:bg-white/12"
                  >
                    开始一个项目
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </Magnetic>

                <a
                  href="#work"
                  className="u-link-underline text-[13.5px] text-white/55 transition-colors hover:text-white"
                >
                  看作品
                </a>

                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="u-link-underline text-[13.5px] text-white/55 transition-colors hover:text-white"
                  >
                    下载简历
                  </a>
                )}
              </div>

              {/* 签名 */}
              {(profile.signature || role) && (
                <div
                  className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
                  data-reveal
                  style={{ "--reveal-delay": "620ms" } as React.CSSProperties}
                >
                  {profile.signature && (
                    <span
                      className="-rotate-6 text-[clamp(1.5rem,3vw,2.1rem)] leading-none text-white/70"
                      style={{ fontFamily: "var(--font-script)" }}
                    >
                      {profile.signature}
                    </span>
                  )}
                  <span className="hidden h-px w-12 bg-white/20 sm:block" aria-hidden />
                  <span className="t-eyebrow max-w-[80%] text-center text-white/40 sm:max-w-none sm:text-left">
                    {[role, location].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /* split / centered：极简备选版式                                      */
  /* ---------------------------------------------------------------- */
  const centered = style === "centered";

  return (
    <section
      id="top"
      className={`relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-[var(--nav-h)] ${
        centered ? "items-center text-center" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(70% 55% at 78% 8%, color-mix(in srgb, var(--accent) 9%, transparent), transparent 62%), radial-gradient(60% 50% at 5% 92%, color-mix(in srgb, var(--accent-2) 7%, transparent), transparent 60%)",
        }}
      />

      <div className="u-container relative flex-1">
        <div
          data-reveal
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line py-5"
        >
          <div className="flex items-center gap-2.5">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="t-label text-fg-muted">{availability || "开放合作"}</span>
          </div>
          <div className="flex items-center gap-6">
            {location && <span className="t-label">{location}</span>}
            <span className="t-label hidden sm:inline">© {new Date().getFullYear()}</span>
          </div>
        </div>

        <div
          className={`grid gap-10 py-12 md:py-16 ${
            centered ? "justify-items-center" : "lg:grid-cols-[1.15fr_0.85fr] lg:items-center"
          }`}
        >
          <div className={centered ? "max-w-4xl" : ""}>
            <p className="t-label mb-6" data-reveal>
              {role}
            </p>

            <h1 className="t-display">
              {name
                .split(/(\s+)/)
                .map((word, i) => (
                  <span
                    key={i}
                    data-mask
                    style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                    className="inline-block"
                  >
                    <span>{word === " " ? " " : word}</span>
                  </span>
                ))}
            </h1>

            {tagline && (
              <p
                className="t-body-lg mt-7 max-w-xl whitespace-pre-line text-fg-muted"
                data-reveal
                style={{ "--reveal-delay": "320ms" } as React.CSSProperties}
              >
                {tagline}
              </p>
            )}

            <div
              className="mt-9 flex flex-wrap items-center gap-3"
              data-reveal
              style={{ "--reveal-delay": "420ms" } as React.CSSProperties}
            >
              <Magnetic>
                <a
                  href="#work"
                  className="inline-flex items-center gap-2.5 rounded-full bg-accent px-6 py-3 text-[13px] font-medium text-accent-ink transition-transform duration-300 hover:scale-[1.03]"
                >
                  查看作品集
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Magnetic>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-[13px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  下载简历
                </a>
              )}
            </div>
          </div>

          {!centered && (
            <Parallax speed={0.08} className="relative">
              <div data-reveal="clip" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
                <div className="media ml-auto w-full max-w-[440px]" style={{ aspectRatio: "4 / 5" }}>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-surface-2">
                      <div className="relative h-full w-full overflow-hidden">
                        <div
                          className="absolute -right-[26%] -top-[20%] h-[74%] w-[74%] rounded-full border"
                          style={{
                            borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)",
                          }}
                        />
                        <div
                          className="absolute -bottom-[14%] -left-[10%] h-[62%] w-[62%] rounded-full"
                          style={{
                            background:
                              "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 55%, transparent), transparent 68%)",
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-8 grid place-items-center">
                          <span className="t-mono text-[11px] tracking-[0.34em] text-fg-subtle">
                            {name.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Parallax>
          )}
        </div>
      </div>

      <div className="relative border-t border-line py-4">
        <div className="marquee-track" style={{ "--marquee-duration": "38s" } as React.CSSProperties}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {KEYWORDS.map((k) => (
                <span key={k} className="flex items-center">
                  <span className="px-7 font-display text-[13px] tracking-[-0.01em] text-fg-muted">
                    {k}
                  </span>
                  <span className="text-accent">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
