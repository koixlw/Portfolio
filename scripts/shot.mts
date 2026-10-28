/**
 * 用 Chrome DevTools Protocol 截图（无需 puppeteer，Node 24 自带 WebSocket）。
 * 能整页截图（captureBeyondViewport），也能注入 cookie 截后台页面。
 *
 * 用法：
 *   node --experimental-strip-types scripts/shot.mts <url> <输出文件> [宽] [高] [--admin]
 */
import { writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9333;

const [, , url, out, wArg, hArg, ...flags] = process.argv;
if (!url || !out) {
  console.error("用法: node --experimental-strip-types scripts/shot.mts <url> <out.png> [w] [h] [--admin]");
  process.exit(1);
}
const width = Number(wArg ?? 1440);
const height = Number(hArg ?? 900);
const wantAdmin = flags.includes("--admin");
const themeFlag = flags.find((f) => f.startsWith("--theme="))?.split("=")[1] as
  | "light"
  | "dark"
  | undefined;
const origin = new URL(url).origin;

/* ---------- 启动 headless Edge ---------- */
const edge = spawn(
  EDGE,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=C:\\Users\\23796\\AppData\\Local\\Temp\\edge-cdp",
    "about:blank",
  ],
  { stdio: "ignore", detached: false }
);

async function waitForDevtools() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return;
    } catch {
      /* retry */
    }
    await sleep(250);
  }
  throw new Error("DevTools 没起来");
}

class CDP {
  private ws!: WebSocket;
  private id = 0;
  private pending = new Map<number, (v: any) => void>();
  private events: (() => void)[] = [];

  async connect(wsUrl: string) {
    this.ws = new WebSocket(wsUrl);
    await new Promise<void>((res, rej) => {
      this.ws.onopen = () => res();
      this.ws.onerror = () => rej(new Error("ws 连接失败"));
    });
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(String(e.data));
      if (msg.id && this.pending.has(msg.id)) {
        this.pending.get(msg.id)!(msg);
        this.pending.delete(msg.id);
      } else if (msg.method) {
        this.events.forEach((f) => f());
      }
    };
  }

  send(method: string, params: Record<string, unknown> = {}) {
    const id = ++this.id;
    return new Promise<any>((res) => {
      this.pending.set(id, res);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  onEvent(fn: () => void) {
    this.events.push(fn);
  }
}

try {
  await waitForDevtools();
  const target = await (
    await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })
  ).json();

  const cdp = new CDP();
  await cdp.connect(target.webSocketDebuggerUrl);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });

  if (wantAdmin) {
    // 用 fetch 登录拿 cookie，再显式写进浏览器（生产模式下 Cookie 是 Secure）
    await cdp.send("Page.navigate", { url: `${origin}/admin/login` });
    await sleep(1200);
    const loginRes = await cdp.send("Runtime.evaluate", {
      expression: `
        fetch('${origin}/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin12345' })
        }).then(async r => ({ status: r.status, body: await r.text() }))
      `,
      awaitPromise: true,
      returnByValue: true,
    });
    const info = loginRes.result?.result?.value;
    if (!info || info.status !== 200) {
      console.error("登录失败:", JSON.stringify(info));
    }
    const all = await cdp.send("Network.getAllCookies");
    for (const c of all.result?.cookies ?? []) {
      if (c.name === "pf_session") {
        await cdp.send("Network.setCookie", {
          name: c.name,
          value: c.value,
          domain: "localhost",
          path: "/",
          httpOnly: true,
        });
      }
    }
    await sleep(300);
  }

  await cdp.send("Page.navigate", { url });
  await sleep(1200);

  if (themeFlag) {
    // 主题存在 localStorage，写入后重载
    await cdp.send("Runtime.evaluate", {
      expression: `localStorage.setItem('pf-theme', '${themeFlag}');`,
      returnByValue: true,
    });
    await cdp.send("Page.reload");
    await sleep(2200);
  } else {
    await sleep(1300);
  }

  // 逐屏滚动一遍，触发所有滚动进场动画（整页截图不会自动滚动）
  await cdp.send("Runtime.evaluate", {
    expression: `
      (async () => {
        // 站点开了 scroll-behavior: smooth，会让 scrollTo 一直动画、滚不到位
        const prev = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        const step = Math.round(window.innerHeight * 0.5);
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y <= h; y += step) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 160));
        }
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 500));
        document.documentElement.style.scrollBehavior = prev;
      })()
    `,
    awaitPromise: true,
  });
  await sleep(600);

  // 可选：把鼠标移到某个元素上再截图（用来检查 hover / 自定义光标）
  const hoverSel = flags.find((f) => f.startsWith("--hover="))?.slice("--hover=".length);
  if (hoverSel) {
    // 先滚动到视口中间，再取坐标（视口外的元素派发鼠标事件不会生效）
    await cdp.send("Runtime.evaluate", {
      expression: `
        document.querySelector(${JSON.stringify(hoverSel)})?.scrollIntoView({ block: 'center' })
      `,
      returnByValue: true,
    });
    await sleep(700);

    const box = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const el = document.querySelector(${JSON.stringify(hoverSel)});
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        })()
      `,
      returnByValue: true,
    });
    const b = box.result?.result?.value;
    if (b) {
      await cdp.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: b.x,
        y: b.y,
        buttons: 0,
      });
      await sleep(600);
    } else {
      console.error("没找到元素:", hoverSel);
    }
  }

  const clipArg = flags.find((f) => f.startsWith("--clip="))?.slice("--clip=".length);
  const clip = clipArg
    ? (([x, y, w, h]) => ({
        x: Number(x),
        y: Number(y),
        width: Number(w),
        height: Number(h),
        scale: 1,
      }))(clipArg.split(","))
    : undefined;

  // 可选：求值并打印结果（调试用）
  const evalArg = flags.find((f) => f.startsWith("--eval="))?.slice("--eval=".length);
  if (evalArg) {
    const r = await cdp.send("Runtime.evaluate", {
      expression: evalArg,
      returnByValue: true,
      awaitPromise: true,
    });
    console.log("eval →", JSON.stringify(r.result?.result?.value ?? r.result?.exceptionDetails));
  }

  // 可选：强制显示所有进场动画元素。
  // headless 下程序化滚动不一定能触发 IntersectionObserver，整页截图会出现空白区块。
  if (flags.includes("--reveal")) {
    await cdp.send("Runtime.evaluate", {
      expression: `
        document.querySelectorAll('[data-reveal], [data-mask]').forEach(el => el.classList.add('is-in'))
      `,
      returnByValue: true,
    });
    await sleep(1400);
  }

  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    ...(clip ? { clip } : {}),
  });
  writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  console.log(`已保存 ${out}`);

  cdp.ws.close();
} finally {
  edge.kill();
}
process.exit(0);
