"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 后台保存内容后，通过 BroadcastChannel 通知已打开的前台标签页即时刷新。
 * ——这就是「不改源码、不重新打包，前台实时生效」的最后一环。
 */
export default function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel("pf-cms");
    bc.onmessage = (e) => {
      if (e.data?.type === "content-updated") {
        router.refresh();
      }
    };
    return () => bc.close();
  }, [router]);

  return null;
}
