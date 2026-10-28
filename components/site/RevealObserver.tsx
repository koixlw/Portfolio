"use client";

import { useEffect } from "react";

/**
 * 全局滚动进场观察器。
 * 扫描所有 [data-reveal] / [data-mask] 元素，进入视口时加 .is-in。
 * 用 MutationObserver 捕获客户端路由切换后新插入的节点。
 */
export default function RevealObserver() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveal = (el: Element) => el.classList.add("is-in");

    // 共用一个观察器，减少开销
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    const scan = () => {
      document
        .querySelectorAll("[data-reveal]:not(.is-in), [data-mask]:not(.is-in)")
        .forEach((el) => {
          const node = el as HTMLElement;
          if (node.dataset.revealBound) return;
          node.dataset.revealBound = "1";

          if (reduce) {
            reveal(node);
            return;
          }

          // 已经在视口内（或在视口上方）→ 直接显示，不等观察器回调
          const r = node.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            reveal(node);
            return;
          }

          io.observe(node);
        });
    };

    scan();

    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
