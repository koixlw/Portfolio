/** 后台可选的字体组合 → 实际 CSS font-family 栈。 */

export const FONT_OPTIONS = [
  {
    id: "Instrument Serif",
    label: "Instrument Serif",
    note: "高对比衬线 · 夜航风格 · 标题首选",
    stack:
      '"Instrument Serif", "Noto Serif SC", "Iowan Old Style", Georgia, ui-serif, serif',
  },
  {
    id: "Noto Serif SC",
    label: "Noto Serif SC",
    note: "中文衬线 · 中英标题同气质",
    stack: '"Noto Serif SC", "Songti SC", "SimSun", ui-serif, Georgia, serif',
  },
  {
    id: "Space Grotesk",
    label: "Space Grotesk",
    note: "几何无衬线 · 技术感 · 作品集首选",
    stack: '"Space Grotesk", "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: "Inter",
    label: "Inter",
    note: "中性无衬线 · 可读性最佳",
    stack: '"Inter", "Noto Sans SC", ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  {
    id: "JetBrains Mono",
    label: "JetBrains Mono",
    note: "等宽 · 偏技术 / 编辑感",
    stack: '"JetBrains Mono", "Noto Sans SC", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  {
    id: "System",
    label: "System UI",
    note: "系统字体 · 零加载最快",
    stack: 'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
] as const;

export function fontStack(id: string, fallback: string): string {
  const found = FONT_OPTIONS.find((f) => f.id === id);
  return found ? found.stack : fallback;
}
