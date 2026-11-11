import { conectar } from "./cdp.mjs";
import fs from "node:fs";
const c = await conectar();
const EN = { Descartar: "Discard", Permitir: "Allow", Entendido: "Got it", Cancelar: "Cancel", "Mostrar más": "Show more", Activar: "Turn on", Programar: "Schedule", Publicar: "Post", Continuar: "Continue", "Editar portada": "Edit cover", Guardar: "Save", "Cargar imagen": "Upload image" };
// clic("Texto"): busca el último elemento visible con ese texto (español o inglés) y le hace un clic REAL de ratón
// (desde nov-2026 TikTok ignora los clics por código). Antes comprueba que bajo el puntero esté ese mismo elemento;
// si algo lo tapa, usa el clic por código sobre el elemento correcto (nunca hace clic en otra cosa).
const clic = async (texto) => {
  const ts = [texto, EN[texto]].filter(Boolean);
  const p = await c.evaluar(`(() => { const ts = ${JSON.stringify(ts)};
    const el = [...document.querySelectorAll("button,div[role=button],span,label")].reverse().find((e) => e.innerText && ts.includes(e.innerText.trim()) && e.getBoundingClientRect().width > 0);
    if (!el) return null; el.scrollIntoView({ block: "center", behavior: "instant" });
    const r = el.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2; const b = document.elementFromPoint(x, y);
    if (b && (b === el || el.contains(b) || b.contains(el))) return [x, y];
    el.click(); return "codigo"; })()`);
  if (!p) return false;
  if (Array.isArray(p)) {
    await c.cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x: p[0], y: p[1] }); await c.dormir(250);
    for (const type of ["mousePressed", "mouseReleased"]) await c.cmd("Input.dispatchMouseEvent", { type, x: p[0], y: p[1], button: "left", clickCount: 1 });
  }
  return true;
};
globalThis.c = c; globalThis.clic = clic;
const codigo = fs.readFileSync(process.argv[2], "utf8");
await (new Function("c", "clic", "return (async()=>{" + codigo + "})()"))(c, clic);
await c.foto("ver.jpg");
c.cerrar();
