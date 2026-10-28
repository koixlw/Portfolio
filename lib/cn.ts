import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * clsx 负责条件类名（falsy 剔除、数组/对象展开），
 * tailwind-merge 负责同类工具类冲突时保留最后一个（后写的赢）。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
