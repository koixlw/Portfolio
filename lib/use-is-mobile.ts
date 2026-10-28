"use client";

import { useEffect, useState } from "react";

/** 与 Tailwind 的 md 断点保持一致（768px） */
const MD_BREAKPOINT = 768;

/**
 * 视口是否小于 md 断点。
 * SSR 阶段返回 false，hydration 后再纠正——视口尺寸本来就不该由服务端猜。
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MD_BREAKPOINT - 1}px)`);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile;
}
