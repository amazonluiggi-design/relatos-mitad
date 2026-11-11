// Programa la fecha y hora en TikTok Studio (inglés o español). Hora "HH:MM" en dos columnas y fecha "YYYY-MM-DD".
// Aprendido el 11-nov-2026: TikTok solo responde a clics reales del ratón y la hora se guarda al CERRAR el selector.
// Cada clic pasa por clicSeguro: si bajo el puntero no está el elemento buscado, no se hace clic (evita tocar otros ajustes).
const fs = await import("node:fs");
const o = JSON.parse(fs.readFileSync("cola.json", "utf8")).find((x) => x.id === process.env.VID);
const dt = new Date(new Date(o.cuando).getTime() - 5 * 3600e3); // hora de Ecuador
const Y = dt.getUTCFullYear(), M = dt.getUTCMonth(), D = dt.getUTCDate();
const hh = String(dt.getUTCHours()).padStart(2, "0"), mm = String(dt.getUTCMinutes()).padStart(2, "0");
const fechaTxt = `${Y}-${String(M + 1).padStart(2, "0")}-${String(D).padStart(2, "0")}`;
const MESES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const inputs = `[...document.querySelectorAll("[data-e2e=schedule_container] input[type=text]")]`;

const clicSeguro = async (expr, nombre) => {
  await c.evaluar(`(() => { const e = ${expr}; if (e && !e.classList.contains("tiktok-timepicker-option-item")) e.scrollIntoView({ block: "center", behavior: "instant" }); })()`);
  await c.dormir(900);
  const p = await c.evaluar(`(() => { const e = ${expr}; if (!e) return null; const r = e.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2; const b = document.elementFromPoint(x, y); return (b && (e === b || e.contains(b) || b.contains(e))) ? [x, y] : "tapado por: " + (b ? b.tagName + " " + (b.innerText || "").trim().slice(0, 30) : "nada"); })()`);
  if (!Array.isArray(p)) throw new Error(`no hago clic en ${nombre}: ${p}`);
  await c.cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x: p[0], y: p[1] }); await c.dormir(300);
  for (const type of ["mousePressed", "mouseReleased"]) await c.cmd("Input.dispatchMouseEvent", { type, x: p[0], y: p[1], button: "left", clickCount: 1 });
};
// Cierra el selector abierto con un clic en zona vacía, a la derecha del título "When to post / Cuándo publicar".
const cerrar = async () => {
  // Se pulsa un título de texto ("Settings", "Details", "When to post"…): no hace nada y cierra el menú abierto.
  const p = await c.evaluar(`(() => { const ts = [...document.querySelectorAll("*")].filter((x) => /^(Settings|Configuración|Ajustes|Details|Detalles|When to post|Cuándo publicar|Cover|Portada)$/.test((x.innerText || "").trim())); for (const t of ts) { const r = t.getBoundingClientRect(); if (r.width <= 0 || r.y < 80 || r.y > innerHeight - 20) continue; const x = r.x + Math.min(r.width / 2, 30), y = r.y + r.height / 2; const b = document.elementFromPoint(x, y); if (b && (b === t || t.contains(b)) && !b.closest("button, input, label, [role=switch], a")) return [x, y]; } return null; })()`);
  if (!p) throw new Error("no encuentro zona vacía para cerrar el selector");
  for (const type of ["mousePressed", "mouseReleased"]) await c.cmd("Input.dispatchMouseEvent", { type, x: p[0], y: p[1], button: "left", clickCount: 1 });
  await c.dormir(800);
};

// PROGRAMAR (radio "Schedule"); TikTok a veces pide permiso la primera vez.
if (!(await c.evaluar(`document.querySelector("input[value=schedule]").checked`))) {
  await clicSeguro(`document.querySelector("input[value=schedule]").closest("label") || document.querySelector("input[value=schedule]").parentElement`, "Schedule");
  await c.dormir(1500); await clic("Permitir"); await c.dormir(1000);
}
if (!(await c.evaluar(`document.querySelector("input[value=schedule]").checked`))) throw new Error("no se pudo marcar Programar");

// FECHA
const CAB = `[...document.querySelectorAll("*")].filter((e) => e.getBoundingClientRect().width > 0 && /^[A-Za-zÁÉÍÓÚáéíóúñ]+\\s*\\/\\s*\\d{4}$/.test((e.innerText || "").trim()) && (e.innerText || "").trim().length < 20).pop()`;
const cabecera = () => c.evaluar(`(() => { const h = ${CAB}; return h ? h.innerText.trim() : ""; })()`);
if (!(await cabecera())) { await clicSeguro(`${inputs}[1]`, "campo fecha"); await c.dormir(1200); }
for (let k = 0; k < 4; k++) {
  if ([`${MESES[M]}/${Y}`, `${MESES_EN[M]}/${Y}`].includes((await cabecera()).replace(/\s+/g, ""))) break;
  // flecha ">" a la derecha de la cabecera del mes
  await clicSeguro(`(() => { const h = ${CAB}; const cands = [...h.parentElement.parentElement.querySelectorAll("*")].filter((e) => e.getBoundingClientRect().width > 0 && e !== h && !e.innerText.trim() && e.getBoundingClientRect().x > h.getBoundingClientRect().right); return cands.sort((a, b) => b.getBoundingClientRect().x - a.getBoundingClientRect().x)[0]; })()`, "mes siguiente");
  await c.dormir(900);
}
console.log("mes:", await cabecera());
await clicSeguro(`(() => {
  const h = ${CAB}; let pop = h; for (let i = 0; i < 12 && pop && !/Dom|Sun/.test(pop.innerText); i++) pop = pop.parentElement; if (!pop) pop = h.parentElement.parentElement.parentElement;
  const celdas = [...pop.querySelectorAll("*")].filter((e) => e.childElementCount === 0 && /^\\d{1,2}$/.test((e.innerText || "").trim()) && e.getBoundingClientRect().width > 0);
  const ini = celdas.findIndex((e) => e.innerText.trim() === "1");
  let fin = celdas.findIndex((e, i) => i > ini && e.innerText.trim() === "1"); if (fin < 0) fin = celdas.length;
  return celdas.slice(ini, fin).find((e) => +e.innerText.trim() === ${D});
})()`, "día " + D);
await c.dormir(1000);
if ((await c.evaluar(`${inputs}[1].value`)) !== fechaTxt) { await cerrar(); }
if ((await c.evaluar(`${inputs}[1].value`)) !== fechaTxt) throw new Error("la fecha no quedó: " + (await c.evaluar(`${inputs}[1].value`)));

// HORA: abrir, elegir hora y minutos, cerrar y recién ahí comprobar.
const OP = (col, txt) => `(() => { const op = [...document.querySelectorAll(".tiktok-timepicker-option-item")].filter((x) => x.getBoundingClientRect().width > 0); const cols = [...new Set(op.map((x) => x.parentElement))]; const col = cols[${col}]; if (!col) return null; const el = [...col.children].find((x) => x.innerText.trim() === "${txt}"); if (!el) return null;
  // Se desplaza la LISTA (no la página) para que la opción quede en medio de la parte visible.
  let s = el.parentElement; while (s && s.scrollHeight <= s.clientHeight + 2) s = s.parentElement;
  if (s) s.scrollTop += el.getBoundingClientRect().top - s.getBoundingClientRect().top - s.clientHeight / 2 + el.offsetHeight / 2;
  return el; })()`;
// Primero como una persona (rueda del ratón sobre cada columna); si no queda, el método anterior.
globalThis.inputs = inputs; globalThis.clicSeguro = clicSeguro; globalThis.hh = hh; globalThis.mm = mm;
await (0, eval)(`(async () => { ${fs.readFileSync("hora-rueda.js", "utf8")} })()`);
for (let k = 0; k < 4; k++) {
  try {
    if (k < 2) await ponerHora();
    else {
      await clicSeguro(`${inputs}[0]`, "campo hora"); await c.dormir(1200);
      await clicSeguro(OP(0, hh), "hora " + hh); await c.dormir(600);
      await clicSeguro(OP(1, mm), "minuto " + mm); await c.dormir(600);
      // TikTok guarda la hora al volver a pulsar su campo (no al pulsar fuera).
      try { await clicSeguro(`${inputs}[0]`, "campo hora (cerrar)"); } catch { await cerrar(); }
      await c.dormir(1000);
    }
  } catch (e) { console.log("reintento hora:", e.message); try { await cerrar(); } catch {} }
  if ((await c.evaluar(`${inputs}[0].value`)) === `${hh}:${mm}`) break;
  console.log("hora quedó", await c.evaluar(`${inputs}[0].value`), "— reintento");
}
const puesto = await c.evaluar(`${inputs}.map((i) => i.value).join(" ")`);
const esperado = `${hh}:${mm} ${fechaTxt}`;
console.log(o.id, "→", puesto, "(esperado", esperado + ")");
if (puesto !== esperado) throw new Error("fecha no coincide");
