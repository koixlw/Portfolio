"use client";

import { useState } from "react";
import CoverArt from "./CoverArt";

type Props = {
  src?: string | null;
  alt?: string;
  seed: string;
  accent?: string;
  accent2?: string;
  index?: number;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * 图片框：有图用图，无图用设计过的抽象封面。
 * 加载失败时自动回退到封面，绝不出现破图图标。
 */
export default function MediaFrame({
  src,
  alt = "",
  seed,
  accent,
  accent2,
  index = 0,
  className = "",
  imgClassName = "",
  sizes,
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const showCover = !src || failed;

  return (
    <div className={`media ${className}`}>
      {showCover ? (
        <CoverArt seed={seed} accent={accent} accent2={accent2} index={index} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={imgClassName}
        />
      )}
    </div>
  );
}
