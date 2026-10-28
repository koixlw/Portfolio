export default function SectionHeader({
  index,
  title,
  eyebrow,
  description,
  action,
}: {
  index: string;
  title: string;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-12 border-t border-line pt-6 md:mb-16">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-4">
          <span className="t-eyebrow text-accent/70">{index}</span>
          <h2 className="t-h2">{title}</h2>
          {eyebrow && <span className="t-eyebrow text-fg-subtle">{eyebrow}</span>}
        </div>
        {action}
      </div>
      {description && (
        <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-fg-muted" data-reveal>
          {description}
        </p>
      )}
    </div>
  );
}
