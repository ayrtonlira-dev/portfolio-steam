/**
 * Smoke test e captura de telas do site em execução.
 * Requer o servidor do Vite ativo e o Chrome instalado no Windows.
 *
 *   node scripts/qa-browser.mjs --url http://127.0.0.1:5173/
 *
 * O script não faz parte do bundle do portfólio. Ele abre o Chrome headless,
 * exercita as interações principais e salva capturas em design/qa.
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const args = new Map();
const rawArgs = process.argv.slice(2);
for (let i = 0; i < rawArgs.length; i++) {
  if (!rawArgs[i].startsWith("--")) continue;
  const key = rawArgs[i].slice(2);
  const next = rawArgs[i + 1];
  if (next && !next.startsWith("--")) {
    args.set(key, next);
    i += 1;
  } else {
    args.set(key, true);
  }
}

const baseUrl = args.get("url") || "http://127.0.0.1:5173/";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = path.resolve("design/qa");
const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const profileDir = path.join(os.tmpdir(), `ayrton-portfolio-qa-${stamp}`);
await fs.mkdir(outDir, { recursive: true });

const results = [];
const consoleErrors = [];
let socket;
let nextId = 0;
const pending = new Map();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function check(name, condition, details = "") {
  results.push({ name, pass: Boolean(condition), details });
  console.log(`${condition ? "PASS" : "FAIL"} ${name}${details ? ` — ${details}` : ""}`);
}

async function waitForDevtools() {
  const portFile = path.join(profileDir, "DevToolsActivePort");
  for (let i = 0; i < 160; i++) {
    try {
      const content = await fs.readFile(portFile, "utf8");
      const [port, wsPath] = content.trim().split(/\r?\n/);
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
      const page = targets.find((target) => target.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await wait(100);
  }
  throw new Error("Chrome DevTools did not start.");
}

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
}

async function evaluate(expression, awaitPromise = true) {
  const response = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || "Evaluation failed.");
  }
  return response.result?.value;
}

async function waitForSelector(selector, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = await evaluate(
      `Boolean(document.querySelector(${JSON.stringify(selector)}))`,
      false,
    );
    if (found) return true;
    await wait(100);
  }
  return false;
}

async function pageWait(ms = 300) {
  await wait(ms);
}

async function clickSelector(selector) {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    element.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
    const rect = element.getBoundingClientRect();
    element.focus();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  if (!point) throw new Error(`Element not found: ${selector}`);
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: point.x,
    y: point.y,
    button: "left",
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: point.x,
    y: point.y,
    button: "left",
    clickCount: 1,
  });
  await pageWait(320);
}

async function pressKey(key, code = key) {
  const windowsVirtualKeyCode =
    key === "Escape" ? 27 : key === "ArrowLeft" ? 37 : key === "ArrowRight" ? 39 : 0;
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key,
    code,
    windowsVirtualKeyCode,
    nativeVirtualKeyCode: windowsVirtualKeyCode,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key,
    code,
    windowsVirtualKeyCode,
    nativeVirtualKeyCode: windowsVirtualKeyCode,
  });
  await pageWait(250);
}

async function setViewport(width, height, deviceScaleFactor = 1, mobile = false) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor,
    mobile,
  });
}

async function setReducedMotion(reduce) {
  await send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-reduced-motion", value: reduce ? "reduce" : "no-preference" },
    ],
  });
}

async function navigate() {
  const loaded = new Promise((resolve) => {
    const timer = setTimeout(resolve, 8000);
    const handler = (event) => {
      if (event.method === "Page.loadEventFired") {
        clearTimeout(timer);
        resolve();
      }
    };
    const previous = messageHandlers.get("Page.loadEventFired");
    messageHandlers.set("Page.loadEventFired", (data) => {
      previous?.(data);
      handler({ method: "Page.loadEventFired" });
    });
  });
  await send("Page.navigate", { url: baseUrl });
  await loaded;
  await evaluate("document.fonts.ready", true);
  await pageWait(500);
}

async function screenshot(filename) {
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  const output = path.join(outDir, filename);
  await fs.writeFile(output, Buffer.from(data, "base64"));
  console.log(`SHOT ${path.relative(process.cwd(), output)}`);
}

async function getActiveDesktopNav() {
  return evaluate(
    `document.querySelector(".local-nav a[aria-current='location']")?.textContent?.trim() || ""`,
    false,
  );
}

async function getActiveMobileNav() {
  return evaluate(
    `document.querySelector(".mobile-nav a[aria-current='location']")?.textContent?.trim() || ""`,
    false,
  );
}

async function isDialogOpen(selector) {
  return evaluate(
    `Boolean(document.querySelector(${JSON.stringify(selector)})?.open)`,
    false,
  );
}

const messageHandlers = new Map();
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

try {
  const wsUrl = await waitForDevtools();
  socket = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") {
      const description =
        message.params?.exceptionDetails?.exception?.description ||
        message.params?.exceptionDetails?.text ||
        "Unknown exception";
      consoleErrors.push(description);
    }
    if (
      message.method === "Log.entryAdded" &&
      ["error", "warning"].includes(message.params?.entry?.level)
    ) {
      consoleErrors.push(message.params.entry.text);
    }
    if (message.method && messageHandlers.has(message.method)) {
      messageHandlers.get(message.method)(message.params);
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  // ---------------------------------------------------------------------
  // Desktop
  // ---------------------------------------------------------------------
  await setViewport(1600, 900, 1, false);
  await setReducedMotion(false);
  await navigate();

  check("Página desktop monta o perfil", await waitForSelector(".profile-shell"));
  check(
    "H1 contém o nome",
    (await evaluate(`document.querySelector("h1")?.textContent?.trim()`, false)) ===
      "Ayrton Lira",
  );
  check(
    "Sem rolagem horizontal no desktop",
    await evaluate(
      `document.documentElement.scrollWidth <= window.innerWidth`,
      false,
    ),
  );
  check(
    "Navegação lateral existe",
    await evaluate(`Boolean(document.querySelector(".local-nav"))`, false),
  );
  check(
    "Controle de movimento inicia ligado sem preferência reduzida",
    (await evaluate(`document.querySelector(".app")?.dataset.motion`, false)) ===
      "on",
  );
  check(
    "Formação inclui a UNINASSAU",
    await evaluate(
      `document.querySelector("#sobre")?.textContent?.includes("UNINASSAU")`,
      false,
    ),
  );
  check(
    "Sobre inclui como eu trabalho",
    await evaluate(
      `document.querySelector("#sobre .about-note")?.textContent?.includes("No GAMERBOXX")`,
      false,
    ),
  );
  await screenshot("desktop-top.png");

  await evaluate(
    `document.querySelector("#sobre")?.scrollIntoView({ block: "start" }); true;`,
    false,
  );
  await pageWait(300);
  await screenshot("desktop-about.png");
  await evaluate(`window.scrollTo({ top: 0, behavior: "instant" }); true;`, false);
  await pageWait(200);

  await clickSelector(".project-row");
  await pageWait(450);
  check("Projeto abre diálogo", await isDialogOpen(".project-dialog"));
  check(
    "Foco inicial no fechar",
    await evaluate(
      `document.activeElement?.classList.contains("dialog-close")`,
      false,
    ),
  );
  check(
    "Rolagem do body bloqueada",
    (await evaluate(`document.body.style.overflow`, false)) === "hidden",
  );
  check(
    "Diálogo anuncia o projeto",
    (await evaluate(
      `document.querySelector("#project-dialog-title")?.textContent?.trim()`,
      false,
    )) === "GAMERBOXX",
  );
  check(
    "Painel do GAMERBOXX registra a contribuição no backend",
    await evaluate(
      `document.querySelector(".project-dialog")?.textContent?.includes("endpoint do backend")`,
      false,
    ),
  );
  await screenshot("desktop-project-dialog.png");
  await evaluate(`document.activeElement?.blur(); true;`, false);
  await pageWait(80);
  await screenshot("desktop-project-dialog-clean.png");

  const firstCaption = await evaluate(
    `document.querySelector(".gallery-caption strong")?.textContent?.trim()`,
    false,
  );
  await clickSelector(".gallery-arrow--next");
  const secondCaption = await evaluate(
    `document.querySelector(".gallery-caption strong")?.textContent?.trim()`,
    false,
  );
  check(
    "Seta da galeria troca a captura",
    Boolean(firstCaption && secondCaption && firstCaption !== secondCaption),
    `${firstCaption} -> ${secondCaption}`,
  );
  check(
    "Miniatura ativa acompanha a captura",
    await evaluate(
      `document.querySelectorAll(".gallery-thumb[aria-pressed='true']").length === 1`,
      false,
    ),
  );

  await pressKey("ArrowRight");
  const keyboardCaption = await evaluate(
    `document.querySelector(".gallery-caption strong")?.textContent?.trim()`,
    false,
  );
  check(
    "Teclado troca a captura com foco na galeria",
    Boolean(secondCaption && keyboardCaption && secondCaption !== keyboardCaption),
    `${secondCaption} -> ${keyboardCaption}`,
  );

  await clickSelector(".gallery-zoom");
  await pageWait(300);
  check("Ampliação abre segundo diálogo", await isDialogOpen(".image-dialog"));
  const lightboxCountBefore = await evaluate(
    `document.querySelector(".lightbox-count")?.textContent?.trim()`,
    false,
  );
  await pressKey("ArrowLeft");
  const lightboxCountAfter = await evaluate(
    `document.querySelector(".lightbox-count")?.textContent?.trim()`,
    false,
  );
  check(
    "Teclado navega na ampliação",
    Boolean(
      lightboxCountBefore &&
        lightboxCountAfter &&
        lightboxCountBefore !== lightboxCountAfter,
    ),
    `${lightboxCountBefore} -> ${lightboxCountAfter}`,
  );
  await evaluate(`document.activeElement?.blur(); true;`, false);
  await screenshot("desktop-image-viewer.png");
  await pressKey("Escape");
  check("Escape fecha a ampliação", !(await isDialogOpen(".image-dialog")));
  check("Diálogo do projeto permanece aberto", await isDialogOpen(".project-dialog"));
  check(
    "Foco volta ao botão de ampliar",
    await evaluate(
      `document.activeElement?.classList.contains("gallery-zoom")`,
      false,
    ),
  );

  await clickSelector(".next-project");
  await pageWait(350);
  check(
    "Próximo projeto atualiza o título",
    (await evaluate(
      `document.querySelector("#project-dialog-title")?.textContent?.trim()`,
      false,
    )) === "Studio Car Recife",
  );
  check(
    "Status do Studio Car",
    (await evaluate(
      `document.querySelector(".info-status")?.textContent?.trim() || document.querySelector(".dialog-actions .status")?.textContent?.trim()`,
      false,
    )) === "Publicado",
  );
  check(
    "Link publicado do Studio Car existe",
    (await evaluate(
      `document.querySelector(".project-site-link")?.getAttribute("href")`,
      false,
    )) === "https://studiocarrecife.com.br/",
  );
  check(
    "Contribuição do Studio Car inclui a publicação",
    await evaluate(
      `document.querySelector(".project-dialog")?.textContent?.includes("domínio, Cloudflare e publicação")`,
      false,
    ),
  );

  await pressKey("Escape");
  await pageWait(350);
  check("Escape fecha o painel de projeto", !(await isDialogOpen(".project-dialog")));
  check(
    "Foco volta ao projeto de origem",
    await evaluate(
      `document.activeElement?.classList.contains("project-row")`,
      false,
    ),
  );
  check(
    "Rolagem do body é restaurada",
    (await evaluate(`document.body.style.overflow`, false)) !== "hidden",
  );

  await clickSelector(".project-row");
  await pageWait(350);
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: 8,
    y: 8,
    button: "left",
    buttons: 1,
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: 8,
    y: 8,
    button: "left",
    buttons: 0,
    clickCount: 1,
  });
  await pageWait(300);
  check(
    "Clique no fundo fecha o painel de projeto",
    !(await isDialogOpen(".project-dialog")),
  );

  await clickSelector(".tech-chip");
  check(
    "Tecnologia abre contexto por toque/clique",
    await evaluate(`Boolean(document.querySelector(".tech-item.is-open"))`, false),
  );
  await pressKey("Escape");

  const initialMotion = await evaluate(
    `document.querySelector(".app")?.dataset.motion`,
    false,
  );
  await clickSelector(".sidebar .motion-toggle");
  const toggledMotion = await evaluate(
    `document.querySelector(".app")?.dataset.motion`,
    false,
  );
  check(
    "Controle de movimento alterna o estado",
    initialMotion !== toggledMotion,
    `${initialMotion} -> ${toggledMotion}`,
  );
  check(
    "Preferência de movimento fica salva",
    (await evaluate(
      `localStorage.getItem("ayrton-portfolio:motion")`,
      false,
    )) === toggledMotion,
  );
  await clickSelector(".sidebar .motion-toggle");

  await evaluate(`window.scrollTo({ top: document.querySelector("#projetos").offsetTop - 40, behavior: "instant" }); true;`, false);
  await pageWait(350);
  check(
    "Navegação lateral acompanha a rolagem",
    (await getActiveDesktopNav()) === "Projetos",
    await getActiveDesktopNav(),
  );

  // ---------------------------------------------------------------------
  // Reduced motion
  // ---------------------------------------------------------------------
  await evaluate(`localStorage.clear(); true;`, false);
  await setReducedMotion(true);
  await navigate();
  check(
    "Movimento reduzido é respeitado por padrão",
    (await evaluate(`document.querySelector(".app")?.dataset.motion`, false)) ===
      "off",
  );
  await setReducedMotion(false);
  await navigate();

  // ---------------------------------------------------------------------
  // Mobile
  // ---------------------------------------------------------------------
  await setViewport(390, 844, 2, true);
  await navigate();

  check(
    "Navegação compacta visível no mobile",
    await evaluate(
      `getComputedStyle(document.querySelector(".mobile-nav")).display !== "none"`,
      false,
    ),
  );
  check(
    "Sidebar desktop oculta no mobile",
    await evaluate(
      `getComputedStyle(document.querySelector(".sidebar")).display === "none"`,
      false,
    ),
  );
  check(
    "Sem rolagem horizontal no mobile",
    await evaluate(
      `document.documentElement.scrollWidth <= window.innerWidth`,
      false,
    ),
  );
  check(
    "Alvos principais com pelo menos 44 px",
    await evaluate(`(() => {
      const selectors = [".header-actions .button", ".header-actions .contact-link", ".mobile-nav a", ".expand-art-button"];
      return selectors.every((selector) => {
        const el = document.querySelector(selector);
        if (!el) return true;
        const rect = el.getBoundingClientRect();
        return rect.height >= 44;
      });
    })()`, false),
  );
  await screenshot("mobile-top.png");

  await clickSelector(".expand-art-button");
  await pageWait(300);
  check(
    "Arte da vitrine amplia no mobile",
    await isDialogOpen(".image-dialog"),
  );
  await pressKey("Escape");
  check(
    "Escape fecha a arte ampliada",
    !(await isDialogOpen(".image-dialog")),
  );

  await evaluate(`window.scrollTo({ top: document.querySelector("#projetos").offsetTop - 56, behavior: "instant" }); true;`, false);
  await pageWait(350);
  check(
    "Navegação mobile indica Projetos",
    (await getActiveMobileNav()) === "Projetos",
    await getActiveMobileNav(),
  );
  await screenshot("mobile-projects.png");

  await evaluate(`window.scrollTo({ top: document.querySelector("#sobre").offsetTop - 56, behavior: "instant" }); true;`, false);
  await pageWait(350);
  check(
    "Navegação mobile indica Sobre",
    (await getActiveMobileNav()) === "Sobre",
    await getActiveMobileNav(),
  );
  await screenshot("mobile-about.png");

  await evaluate(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }); true;`, false);
  await pageWait(350);
  check(
    "Navegação mobile indica Contato no fim",
    (await getActiveMobileNav()) === "Contato",
    await getActiveMobileNav(),
  );
  await screenshot("mobile-contact.png");

  await evaluate(`window.scrollTo({ top: 0, behavior: "instant" }); true;`, false);
  await pageWait(200);
  await clickSelector(".project-row");
  await pageWait(450);
  check("Projeto abre no mobile", await isDialogOpen(".project-dialog"));
  check(
    "Ficha do projeto não causa rolagem horizontal no mobile",
    await evaluate(
      `document.documentElement.scrollWidth <= window.innerWidth`,
      false,
    ),
  );
  await screenshot("mobile-project-dialog.png");
  await pressKey("Escape");

  await setViewport(320, 760, 2, true);
  await navigate();
  check(
    "Sem rolagem horizontal em 320 px",
    await evaluate(
      `document.documentElement.scrollWidth <= window.innerWidth`,
      false,
    ),
  );

  await setViewport(1024, 900, 1, false);
  await pageWait(250);
  check(
    "Layout de tablet mantém a coluna única",
    await evaluate(
      `getComputedStyle(document.querySelector(".mobile-nav")).display !== "none" && getComputedStyle(document.querySelector(".sidebar")).display === "none"`,
      false,
    ),
  );
  check(
    "Sem rolagem horizontal em 1024 px",
    await evaluate(
      `document.documentElement.scrollWidth <= window.innerWidth`,
      false,
    ),
  );

  await setViewport(1121, 900, 1, false);
  await pageWait(250);
  check(
    "Layout de desktop reintroduz a barra lateral",
    await evaluate(
      `getComputedStyle(document.querySelector(".sidebar")).display !== "none" && getComputedStyle(document.querySelector(".mobile-nav")).display === "none"`,
      false,
    ),
  );
  check(
    "Sem rolagem horizontal em 1121 px",
    await evaluate(
      `document.documentElement.scrollWidth <= window.innerWidth`,
      false,
    ),
  );

  check(
    "O site não inclui áudio",
    await evaluate(`document.querySelectorAll("audio").length === 0`, false),
  );

  // ---------------------------------------------------------------------
  // Console
  // ---------------------------------------------------------------------
  check(
    "Sem erros de runtime no console",
    consoleErrors.length === 0,
    consoleErrors.slice(0, 3).join(" | "),
  );
} catch (error) {
  console.error(error.stack || error);
  check("Execução do teste", false, String(error));
} finally {
  const failed = results.filter((result) => !result.pass);
  console.log(
    `\nSUMMARY ${results.length - failed.length}/${results.length} passed`,
  );
  if (failed.length) {
    for (const failure of failed) console.log(`- ${failure.name}: ${failure.details}`);
  }
  try {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ id: ++nextId, method: "Browser.close", params: {} }));
    }
  } catch {}
  try {
    socket?.close();
  } catch {}
  chrome.kill();
  await wait(250);
  try {
    await fs.rm(profileDir, { recursive: true, force: true });
  } catch {}
  if (failed.length) process.exitCode = 1;
}
