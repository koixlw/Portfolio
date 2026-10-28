"use client";

import { useEffect, useRef } from "react";

/** 路由切换时的页面过渡：内容淡入 + 轻微上移。 */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.animate(
      [
        { opacity: 0, transform: "translate3d(0, 14px, 0)" },
        { opacity: 1, transform: "translate3d(0, 0, 0)" },
      ],
      { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" }
    );
  }, []);

  return <div ref={ref}>{children}</div>;
}
