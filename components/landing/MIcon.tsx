import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export type MIconProps = {
  /** Material Symbols 的图标名，例如 "auto_awesome" */
  name: string;
  /** 像素尺寸（同时决定字高与图标盒尺寸） */
  size?: number;
  /** 是否填充（FILL 轴 0/1） */
  fill?: boolean;
  /** 字重（wght 轴 100–700） */
  weight?: number;
  /**  grades（GRAD 轴 -50–200） */
  grade?: number;
  /** 光学尺寸（opsz 轴 20–48） */
  opticalSize?: number;
  className?: string;
};

/**
 * Material Symbols Outlined 图标。
 * 用 font-variation-settings 驱动可变轴，而不是取多份字体文件。
 */
export default function MIcon({
  name,
  size = 20,
  fill = false,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  className,
}: MIconProps) {
  const style: CSSProperties = {
    fontSize: `${size}px`,
    width: `${size}px`,
    height: `${size}px`,
    fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
  };

  return (
    <span
      aria-hidden="true"
      className={cn(
        "material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none",
        className,
      )}
      style={style}
    >
      {name}
    </span>
  );
}
