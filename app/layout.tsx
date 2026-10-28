import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { getSite, getTheme } from "@/lib/content";
import { fontStack } from "@/lib/theme";
import RevealObserver from "@/components/site/RevealObserver";
import CustomCursor from "@/components/site/CustomCursor";
import ScrollProgress from "@/components/site/ScrollProgress";
import LiveRefresh from "@/components/site/LiveRefresh";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = getSite();
  return {
    title: { default: site.siteTitle, template: `%s — ${site.siteTitle}` },
    description: site.siteDescription,
    keywords: ["portfolio", "作品集", "软件工程师", "前端", "全栈开发", "独立开发者"],
    openGraph: {
      title: site.siteTitle,
      description: site.siteDescription,
      type: "website",
      locale: "zh_CN",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05070e" },
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * 首帧前执行：
 * 1) 标记 JS 可用（进场动画才隐藏初始状态，JS 挂了内容依然可见）
 * 2) 决定明暗主题，避免刷新时闪烁。默认深色，用户在本地选过则以用户选择为准。
 */
const themeInitScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var s=localStorage.getItem('pf-theme');if(s!=='light'&&s!=='dark'){s='dark';}d.setAttribute('data-theme',s);}catch(e){d.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = getTheme();
  const site = getSite();

  const htmlStyle = {
    "--accent-user": theme.accent,
    "--accent2-user": theme.accent2,
    "--radius": `${theme.radius}px`,
    "--font-display": fontStack(
      theme.fontDisplay,
      '"Instrument Serif", "Noto Serif SC", "Iowan Old Style", Georgia, serif'
    ),
    "--font-body": fontStack(
      theme.fontBody,
      '"Inter", "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
    ),
  } as CSSProperties;

  return (
    <html lang="zh-CN" data-theme="dark" style={htmlStyle} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Caveat:wght@500;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;600&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap"
        />
        {/* Material Symbols 是可变字体，只能走 Google Fonts 的轴向 URL，next/font 覆盖不了 */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="antialiased">
        <ScrollProgress enabled={theme.progressBar} />
        <CustomCursor enabled={theme.cursor} />
        <RevealObserver />
        <LiveRefresh />
        {children}
      </body>
    </html>
  );
}
