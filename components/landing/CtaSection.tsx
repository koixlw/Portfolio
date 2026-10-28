"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CtaDashboardMock from "./CtaDashboardMock";
import FadeUp from "./FadeUp";
import PrimaryButton from "./PrimaryButton";
import { useIsMobile } from "@/lib/use-is-mobile";
import type { Project } from "@/lib/content";

/**
 * Landing CTA：合作邀约。
 * 左侧是文案，右侧是一块「工作台」——左边一次项目沟通，右边作品的实时预览。
 * 配色写死在自己的模块里（黑 + 白色半透明），不跟全站主题互相干扰。
 */
export default function CtaSection({ project }: { project: Project }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // 工作台随滚动轻微上移，制造纵深
  const dashboardY = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? ["40px", "-40px"] : ["90px", "-90px"]
  );

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative w-full scroll-mt-24 overflow-hidden bg-black"
      style={{ backgroundImage: "linear-gradient(to bottom, #05070e 0%, #0a1018 45%, #14191e 100%)" }}
    >
      {/* 底部地平线辉光 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px]"
        style={{
          background:
            "radial-gradient(58% 100% at 50% 100%, rgba(120,170,255,0.18), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1180px] px-4 py-24 sm:px-6 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-10">
          {/* 左栏：文案 */}
          <div className="relative z-20 max-w-[420px]">
            <FadeUp delay={0.9}>
              <span className="t-eyebrow text-white/35">COLLABORATE</span>
            </FadeUp>

            <FadeUp delay={1}>
              <h2 className="font-display mt-5 text-[clamp(1.9rem,4.2vw,3.1rem)] font-normal leading-[1.06] tracking-[-0.02em] text-white">
                Available for a small number of projects each season.
              </h2>
            </FadeUp>

            <FadeUp delay={1.1}>
              <p className="mt-4 text-[15px] text-white/45">每季度只接几个项目。</p>
            </FadeUp>

            <FadeUp delay={0.1}>
              <p className="mt-7 max-w-[380px] text-[15px] leading-[1.65] text-white/70">
                从产品原型到上线部署，一个人负责设计、实现与交付。交付的不只是代码，还有架构说明、部署脚本和一份能接手的文档。
              </p>
            </FadeUp>

            <FadeUp delay={0.2} className="mt-10">
              <PrimaryButton as="a" href="#contact">
                开始一个项目
              </PrimaryButton>
            </FadeUp>
          </div>

          {/* 右栏：工作台 */}
          <motion.div style={{ y: dashboardY }} className="relative z-10 lg:-mr-[6%]">
            <CtaDashboardMock project={project} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
