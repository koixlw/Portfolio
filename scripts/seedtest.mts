/** 直接跑 seed，定位初始化报错（不走 Next 构建）。 */
import { db } from "../lib/db.ts";

try {
  db();
  console.log("✅ seed 成功");
} catch (e) {
  console.error("❌ seed 失败：", e);
  process.exitCode = 1;
}
