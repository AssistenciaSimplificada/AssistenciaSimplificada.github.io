import fs from "node:fs";
import path from "node:path";

const port = Number(process.env.ORCAMENTOS_CDP_PORT || 9333);
const username = String(process.env.ORCAMENTOS_PREVIEW_USER || "");
const password = String(process.env.ORCAMENTOS_PREVIEW_PASSWORD || "");
const outputDirectory = path.resolve(
  process.env.ORCAMENTOS_SCREENSHOT_DIRECTORY || "public/assets/img/app/current",
);
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === "page" && String(item.url).startsWith("orcamentos://"));
if (!target?.webSocketDebuggerUrl) throw new Error("A janela do aplicativo não foi encontrada.");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(String(event.data));
  const operation = pending.get(message.id);
  if (!operation) return;
  pending.delete(message.id);
  if (message.error) operation.reject(new Error(message.error.message));
  else operation.resolve(message.result);
});

function call(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const response = await call("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  }
  return response.result.value;
}

async function waitFor(expression, description, timeout = 20_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await evaluate(expression)) return;
    await delay(120);
  }
  throw new Error(`Tempo esgotado ao aguardar ${description}.`);
}

async function clickButton(label, scope = "document") {
  const clicked = await evaluate(`(()=>{const root=${scope};const wanted=${JSON.stringify(label)};const button=[...root.querySelectorAll('button')].find(item=>item.innerText.trim()===wanted||item.innerText.trim().includes(wanted)||item.getAttribute('aria-label')===wanted);if(!button)return false;button.click();return true;})()`);
  if (!clicked) throw new Error(`Botão não encontrado: ${label}`);
  await delay(320);
}

async function openSidebar(label, expectedHeading = label) {
  await clickButton(label, "document.querySelector('aside.sidebar')");
  await waitFor(
    `document.querySelector('.topbar-copy strong')?.innerText.includes(${JSON.stringify(expectedHeading)})`,
    `a tela ${label}`,
  );
  await evaluate("document.querySelector('.content')?.scrollTo(0,0);window.scrollTo(0,0)");
  await delay(220);
}

async function capture(name) {
  const screenshot = await call("Page.captureScreenshot", {
    format: "webp",
    quality: 84,
    captureBeyondViewport: false,
    fromSurface: true,
  });
  fs.mkdirSync(outputDirectory, { recursive: true });
  const destination = path.join(outputDirectory, `${name}.webp`);
  fs.writeFileSync(destination, Buffer.from(screenshot.data, "base64"));
  process.stdout.write(`${destination}\n`);
}

try {
  await call("Runtime.enable");
  await call("Page.enable");
  await call("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  if (await evaluate("Boolean(document.querySelector('[data-testid=desktop-login-form]'))")) {
    if (!username || !password) throw new Error("Informe o usuário e a senha temporários da prévia.");
    await evaluate(`(()=>{const set=(element,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(element,value);element.dispatchEvent(new Event('input',{bubbles:true}));};set(document.querySelector('#desktop-username'),${JSON.stringify(username)});set(document.querySelector('#desktop-password'),${JSON.stringify(password)});document.querySelector('[data-testid=desktop-login-form]').requestSubmit();})()`);
  }
  await waitFor("Boolean(document.querySelector('.app-shell'))", "o acesso ao aplicativo");

  if (await evaluate("[...document.querySelectorAll('button')].some(button=>button.innerText.includes('Pular tutorial'))")) {
    await clickButton("Pular tutorial");
  }

  await openSidebar("Visão geral", "Visão geral");
  await capture("dashboard-principal");
  await openSidebar("Atendimentos");
  await capture("atendimentos");
  await openSidebar("Clientes");
  await capture("clientes");
  await openSidebar("Pesquisa de peças", "Peças");
  await capture("pesquisa-de-pecas");
  await openSidebar("Aparelhos");
  await capture("aparelhos");
  await openSidebar("Garantias");
  await capture("garantias");
  await openSidebar("Configurações");
  await capture("configuracoes");
  await openSidebar("Novo orçamento", "Novo orçamento");
  await capture("novo-orcamento");
} finally {
  socket.close();
}
