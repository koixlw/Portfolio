import Magnetic from "./Magnetic";
import SectionHeader from "./SectionHeader";
import type { GlobalLink, Profile } from "@/lib/content";

export default function Contact({
  profile,
  links,
}: {
  profile: Profile;
  links: GlobalLink[];
}) {
  const socials = links.filter((l) => l.kind === "social");
  const extras = links.filter((l) => l.kind === "link");

  return (
    <section id="contact" className="scroll-mt-24 border-t border-line">
      <div className="u-container py-24 md:py-32">
        <SectionHeader index="03" eyebrow="CONTACT" title="联系" description="有想法？聊聊看。" />

        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div>
            <h3 className="t-h1 max-w-3xl text-balance" data-reveal>
              Let's build something
              <span className="text-fg-muted"> that outlasts the deadline.</span>
            </h3>
            <p className="t-body-lg mt-4 max-w-2xl text-fg-muted" data-reveal>
              让我们做点经得起时间的东西。
            </p>

            {profile.email && (
              <div
                className="mt-10"
                data-reveal
                style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
              >
                <Magnetic>
                  <a
                    href={`mailto:${profile.email}`}
                    className="group inline-flex items-center gap-3 text-[clamp(1.05rem,2.4vw,1.85rem)] tracking-[-0.02em]"
                  >
                    <span className="u-link-underline">{profile.email}</span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="transition-transform duration-500 group-hover:translate-x-1.5 group-hover:-translate-y-1.5"
                    >
                      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </Magnetic>
              </div>
            )}

            {profile.availability && (
              <p className="mt-7 text-sm text-fg-muted" data-reveal>
                {profile.availability}
              </p>
            )}
          </div>

          {/* 链接列表 */}
          <div data-reveal style={{ "--reveal-delay": "140ms" } as React.CSSProperties}>
            <h3 className="t-eyebrow border-b border-line pb-3 text-fg-subtle">在别处 / ELSEWHERE</h3>
            <ul>
              {socials.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.url}
                    target={l.target === "_blank" ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group flex items-center justify-between border-b border-line py-4 transition-colors hover:border-line-strong"
                  >
                    <span className="text-fg-muted transition-colors group-hover:text-accent">
                      {l.label}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="text-fg-subtle transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    >
                      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              ))}
              {extras.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.url}
                    target={l.target === "_blank" ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group flex items-center justify-between border-b border-line py-4 transition-colors hover:border-line-strong"
                  >
                    <span className="text-fg-muted transition-colors group-hover:text-accent">
                      {l.label}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="text-fg-subtle transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    >
                      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
