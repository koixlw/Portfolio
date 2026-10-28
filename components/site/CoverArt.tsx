import type { CSSProperties } from "react";

/** 由 seed 派生的确定性伪随机，保证同一个项目每次渲染出同样的图形。 */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rng(seed: string) {
  let s = hash(seed) || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

type Props = {
  seed: string;
  accent?: string;
  accent2?: string;
  index?: number;
  className?: string;
};

/**
 * 抽象封面占位图。
 * 项目还没上传图片时，用设计过的几何构成顶上，避免前台出现破图。
 */
export default function CoverArt({
  seed,
  accent = "var(--accent)",
  accent2 = "var(--accent-2)",
  index = 0,
  className = "",
}: Props) {
  const r = rng(seed);
  const cx = 18 + r() * 64;
  const cy = 16 + r() * 60;
  const rings = 3 + Math.floor(r() * 3);
  const rotate = Math.floor(r() * 90);
  const barX = Math.floor(r() * 60);
  const style = { "--ca": accent, "--ca2": accent2 } as CSSProperties;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={style} aria-hidden>
      {/* 底色 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(120% 100% at 18% 8%, color-mix(in srgb, var(--ca) 26%, transparent), transparent 62%),` +
            `radial-gradient(100% 100% at 88% 92%, color-mix(in srgb, var(--ca2) 20%, transparent), transparent 58%),` +
            `var(--surface-2)`,
        }}
      />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <g
          transform={`rotate(${rotate} 50 50)`}
          fill="none"
          stroke="var(--ca)"
          strokeWidth="0.35"
          opacity="0.55"
        >
          {Array.from({ length: rings }).map((_, i) => (
            <circle key={i} cx={cx} cy={cy} r={12 + i * 9} opacity={0.9 - i * 0.18} />
          ))}
        </g>

        {/* 斜向网格线 */}
        <g stroke="var(--fg)" strokeWidth="0.12" opacity="0.14">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={barX + i * 6} y1="0" x2={barX + i * 6 - 30} y2="100" />
          ))}
        </g>

        {/* 实心块 */}
        <rect
          x="8"
          y={58 + (index % 3) * 4}
          width="26"
          height="12"
          fill="var(--ca)"
          opacity="0.85"
        />
        <rect x="78" y="14" width="14" height="14" fill="var(--ca2)" opacity="0.55" />
      </svg>

      {/* 编号 */}
      <span className="t-mono absolute bottom-4 right-5 text-[11px] tracking-[0.2em] text-fg-subtle">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}
