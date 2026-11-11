// ¿Ya está en TikTok Studio la publicación VID (mismo inicio de texto y misma fecha/hora)? Imprime YA_ESTA o NO_ESTA.
// Studio en español ("12 nov, 08:30") o en inglés ("Nov 12, 8:30 AM").
const fs = await import("node:fs");
const o = JSON.parse(fs.readFileSync("cola.json", "utf8")).find((x) => x.id === process.env.VID);
const dt = new Date(new Date(o.cuando).getTime() - 5 * 3600e3);
const H = dt.getUTCHours(), Mi = String(dt.getUTCMinutes()).padStart(2, "0");
const ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"][dt.getUTCMonth()];
const EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dt.getUTCMonth()];
const fechas = [`${dt.getUTCDate()} ${ES}, ${String(H).padStart(2, "0")}:${Mi}`, `${EN} ${dt.getUTCDate()}, ${H % 12 || 12}:${Mi} ${H < 12 ? "AM" : "PM"}`];
const norm = (s) => s.normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase().slice(0, 30);
const buscado = norm(o.texto);
await c.cmd("Page.navigate", { url: "https://www.tiktok.com/tiktokstudio/content" });
for (let i = 0; i < 30; i++) { await c.dormir(2000); const t = await c.evaluar("document.body ? document.body.innerText : ''"); if (/Contenido \(Creada el\)|Posts \(Created on\)/.test(t)) break; }
await c.dormir(2500);
let ya = false;
for (let paso = 0; paso < 25 && !ya; paso++) {
  // TikTok escribe "8:30 AM" con espacio fino (U+202F): se normalizan todos los espacios.
  const l = (await c.evaluar("document.body.innerText")).split("\n").map((x) => x.replace(/[\s  ]+/g, " ").trim()).filter(Boolean);
  for (let i = 1; i < l.length; i++) if (fechas.some((f) => l[i].startsWith(f)) && norm(l[i - 1]).startsWith(buscado.slice(0, 25))) { ya = true; break; }
  // Las primeras vueltas solo esperan a que carguen las filas (las programadas salen arriba); después se baja.
  if (paso < 10) await c.dormir(1500); else { await c.cmd("Input.dispatchMouseEvent", { type: "mouseWheel", x: 800, y: 600, deltaX: 0, deltaY: 500 }); await c.dormir(800); }
}
console.log(ya ? "YA_ESTA" : "NO_ESTA", fechas.join(" / "));
