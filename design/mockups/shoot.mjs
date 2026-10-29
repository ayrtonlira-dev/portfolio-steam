/**
 * Tiny Chrome DevTools Protocol screenshot helper. No extra dependencies.
 *
 * Usage:
 *   node shoot.mjs --url file:///... --width 390 --height 844 --dpr 2 \
 *     --out renders/mobile.png [--scroll 640] [--full]
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const args = new Map();
const raw = process.argv.slice(2);
for (let i = 0; i < raw.length; i++) {
  const key = raw[i];
  if (key.startsWith("--")) {
    const next = raw[i + 1];
    if (!next || next.startsWith("--")) args.set(key.slice(2), true);
    else {
      args.set(key.slice(2), next);
      i++;
    }
  }
}

const url = args.get("url");
const width = Number(args.get("width") || 1440);
const height = Number(args.get("height") || 900);
const dpr = Number(args.get("dpr") || 1);
const out = args.get("out");
const scrollTarget = args.get("scroll");
const full = Boolean(args.get("full"));

if (!url || !out) {
  console.error("Missing --url or --out");
  process.exit(1);
}

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const profileDir = path.resolve(`.research/cdp-profile-${stamp}`);
const screenshotPath = path.resolve(out);

await fs.mkdir(path.dirname(profileDir), { recursive: true });
await fs.mkdir(path.dirname(screenshotPath), { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--allow-file-access-from-files",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-debugging-port=0",
  `--user-data-dir=${profileDir}`,
  "about:blank",
], { stdio: "ignore" });

let socket;
let nextId = 0;
const pending = new Map();
const events = new Map();

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForDebugger() {
  const portFile = path.join(profileDir, "DevToolsActivePort");
  for (let i = 0; i < 150; i++) {
    try {
      const contents = await fs.readFile(portFile, "utf8");
      const [port, wsPath] = contents.trim().split(/\r?\n/);
      if (port && wsPath) {
        const list = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
        const page = list.find(target => target.type === "page");
        if (page) return page.webSocketDebuggerUrl;
      }
    } catch {
      // Chrome is still booting.
    }
    await wait(100);
  }
  throw new Error("Chrome DevTools did not become available.");
}

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

function onEvent(method, callback) {
  if (!events.has(method)) events.set(method, []);
  events.get(method).push(callback);
}

async function evaluate(expression, awaitPromise = true) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Evaluation failed");
  }
  return result.result?.value;
}

try {
  const wsUrl = await waitForDebugger();
  socket = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else if (message.method && events.has(message.method)) {
      for (const callback of events.get(message.method)) callback(message.params);
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: dpr,
    mobile: width < 700,
  });
  // The design includes a reduced-motion query; keep animations at 0 for
  // deterministic screenshots.
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  const loaded = new Promise(resolve => onEvent("Page.loadEventFired", resolve));
  await send("Page.navigate", { url });
  await Promise.race([loaded, wait(8000)]);
  await evaluate("document.fonts.ready", true);
  await wait(250);

  if (scrollTarget !== undefined) {
    let scrollTo;
    if (scrollTarget === "end") {
      scrollTo = await evaluate("Math.max(0, document.documentElement.scrollHeight - innerHeight)");
    } else if (/^\d+$/.test(String(scrollTarget))) {
      scrollTo = Number(scrollTarget);
    } else if (String(scrollTarget).startsWith("#")) {
      scrollTo = await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(scrollTarget)});
        return el ? Math.max(0, el.getBoundingClientRect().top + scrollY - 58) : 0;
      })()`);
    } else if (String(scrollTarget).startsWith(".")) {
      scrollTo = await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(scrollTarget)});
        return el ? Math.max(0, el.getBoundingClientRect().top + scrollY - 58) : 0;
      })()`);
    } else {
      scrollTo = Number(scrollTarget);
    }
    await evaluate(`document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, ${scrollTo}); true;`);
    await wait(350);
  }

  let shotParams = { format: "png", fromSurface: true };
  if (full) {
    const metrics = await send("Page.getLayoutMetrics");
    const content = metrics.cssContentSize || metrics.contentSize;
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: Math.ceil(content.height),
      deviceScaleFactor: dpr,
      mobile: width < 700,
    });
    shotParams.clip = {
      x: 0,
      y: 0,
      width,
      height: Math.ceil(content.height),
      scale: 1,
    };
    shotParams.captureBeyondViewport = true;
    await wait(250);
  }

  const { data } = await send("Page.captureScreenshot", shotParams);
  await fs.writeFile(screenshotPath, Buffer.from(data, "base64"));
  console.log(`saved ${screenshotPath} (${width}x${height} @${dpr}${full ? ", full page" : ""})`);
} catch (error) {
  console.error(error.stack || error);
  process.exitCode = 1;
} finally {
  try {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ id: ++nextId, method: "Browser.close", params: {} }));
    }
  } catch {}
  try { socket?.close(); } catch {}
  chrome.kill();
  await wait(250);
  try { await fs.rm(profileDir, { recursive: true, force: true }); } catch {}
}
