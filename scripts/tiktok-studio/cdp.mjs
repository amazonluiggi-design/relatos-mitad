// Cliente CDP mínimo para la ventana de Chrome de TikTok (puerto 9333).
import fs from "node:fs";
export async function conectar() {
  const lista = await (await fetch("http://127.0.0.1:9333/json/list")).json();
  const p = lista.find((t) => t.type === "page" && !t.url.startsWith("chrome"));
  const ws = new WebSocket(p.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let n = 0; const esperas = new Map();
  ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && esperas.has(m.id)) { esperas.get(m.id)(m); esperas.delete(m.id); } });
  const cmd = (method, params = {}) => new Promise((res, rej) => { const id = ++n; esperas.set(id, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id, method, params })); });
  const evaluar = async (expr) => { const r = await cmd("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  const foto = async (archivo) => { const r = await cmd("Page.captureScreenshot", { format: "jpeg", quality: 60 }); fs.writeFileSync(archivo, Buffer.from(r.data, "base64")); };
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
  return { cmd, evaluar, foto, dormir, cerrar: () => ws.close() };
}
