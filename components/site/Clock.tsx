"use client";

import { useEffect, useState } from "react";

/** 实时本地时间。 */
export default function Clock({ timeZone }: { timeZone?: string }) {
  const [time, setTime] = useState<string>("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeZone]);

  return (
    <span className="t-mono text-[11px] tracking-[0.12em] text-fg-subtle">
      LOCAL {time}
    </span>
  );
}
