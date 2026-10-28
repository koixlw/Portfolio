/**
 * 清空数据库并重新写入种子数据。
 * 用法：npm run seed:reset
 */
import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "data", "portfolio.db");
for (const suffix of ["", "-wal", "-shm", "-journal"]) {
  const target = `${file}${suffix}`;
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
    console.log("已删除", path.basename(target));
  }
}
console.log("数据库已重置，下次启动会重新写入种子数据。");
