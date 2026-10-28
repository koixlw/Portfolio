"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_HERO_VIDEO } from "@/lib/hero";

/**
 * 星空点位：[x, y, 半径, 闪烁延迟]
 * 固定坐标，不随机——每次刷新星星都在同一个位置，不会闪一下就换布局。
 */
const STARS: [number, number, number, number][] = [
  [90, 120, 1.6, 0], [210, 60, 1.1, 1.2], [330, 180, 1.3, 2.1], [450, 90, 1.0, 0.6],
  [560, 210, 1.7, 3.0], [690, 70, 1.2, 1.8], [800, 150, 1.0, 2.6], [910, 110, 1.5, 0.3],
  [1030, 200, 1.1, 1.5], [1150, 60, 1.4, 2.9], [1260, 170, 1.0, 0.9], [1380, 95, 1.8, 3.4],
  [1500, 210, 1.2, 1.1], [140, 300, 1.0, 2.3], [280, 380, 1.4, 0.4], [420, 300, 1.1, 3.2],
  [600, 350, 1.3, 1.4], [760, 290, 1.0, 0.7], [880, 400, 1.6, 2.4], [1010, 330, 1.1, 3.3],
  [1180, 420, 1.0, 1.6], [1320, 310, 1.4, 0.2], [1450, 390, 1.1, 2.8], [1560, 300, 1.0, 1.0],
  [190, 500, 1.2, 3.1], [350, 560, 1.0, 1.9], [520, 470, 1.3, 0.5], [700, 540, 1.1, 2.7],
  [950, 500, 1.0, 1.3], [1120, 570, 1.5, 3.5], [1290, 490, 1.1, 0.8], [1440, 550, 1.2, 2.2],
  [1560, 480, 1.0, 1.7],
];

/**
 * 首屏背景：夜色。
 * 优先级 —— 后台传了背景图就用图；否则用背景视频（默认是一段夜间工作影像）。
 * 底层永远垫一层生成的夜空，保证任何素材缺失时画面都不空。
 */
export default function HeroBackdrop({
  video,
  image,
  alt,
  className = "",
}: {
  video?: string;
  image?: string;
  alt?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // 减少动效：不自动播放视频，停在第一帧
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
    }
  }, []);

  const videoSrc = image ? "" : video || DEFAULT_HERO_VIDEO;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* 底层夜空 */}
      <div className="night-sky absolute inset-0" aria-hidden />

      {/* 背景视频 */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-85"
        />
      )}

      {/* 背景图（后台传图时优先） */}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={alt ?? ""} className="absolute inset-0 h-full w-full object-cover" />
      )}

      {/* 夜色统一：把素材压进蓝调，画面才不会和字体打架 */}
      <div className="absolute inset-0 bg-[#08101f]/40" aria-hidden />

      {/* 星空 */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <g fill="#ffffff">
          {STARS.map(([x, y, r, d], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              className="animate-twinkle"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
        </g>
      </svg>

      {/* 暗角 */}
      <div className="night-vignette absolute inset-0" aria-hidden />

      {/* 颗粒 */}
      <div className="grain absolute inset-0 opacity-[0.16] mix-blend-overlay" aria-hidden />
    </div>
  );
}
