// Programa la fecha y hora (calendario nuevo de TikTok Studio, oct-2026): hora "HH:MM" en dos columnas y fecha "YYYY-MM-DD".
const fs = await import("node:fs");
const o = JSON.parse(fs.readFileSync("cola.json", "utf8")).find((x) => x.id === process.env.VID);
const dt = new Date(new Date(o.cuando).getTime() - 5 * 3600e3); // hora de Ecuador
const Y = dt.getUTCFullYear(), M = dt.getUTCMonth(), D = dt.getUTCDate();
const hh = String(dt.getUTCHours()).padStart(2, "0"), mm = String(dt.getUTCMinutes()).padStart(2, "0");
const fechaTxt = `${Y}-${String(M + 1).padStart(2, "0")}-${String(D).padStart(2, "0")}`;
const MESES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const clicXY = async ([x, y]) => { await c.cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }); for (const type of ["mousePressed", "mouseReleased"]) await c.cmd("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 }); };
const inputs = `[...document.querySelectorAll("[data-e2e=schedule_container] input[type=text]")]`;

await c.evaluar(`document.querySelector("input[value=schedule]").click()`); await c.dormir(1500);
await clic("Permitir"); await c.dormir(1000);

// FECHA
await c.evaluar(`${inputs}[1].scrollIntoView({ block: "center" })`); await c.dormir(500);
const cabecera = `(() => { const h = [...document.querySelectorAll("*")].filter((e) => e.offsetParent && /^[A-Za-zÁÉÍÓÚáéíóúñ]+\\s*\\/\\s*\\d{4}$/.test((e.innerText || "").trim()) && (e.innerText || "").trim().length < 20).pop(); return h ? h.innerText.trim() : ""; })()`;
if (!(await c.evaluar(cabecera))) { await clicXY(await c.evaluar(`(() => { const r = ${inputs}[1].getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`)); await c.dormir(1200); }
for (let k = 0; k < 4; k++) {
  const cab = await c.evaluar(cabecera); 
  if ([`${MESES[M]}/${Y}`, `${MESES_EN[M]}/${Y}`].includes(cab.replace(/\s+/g, ""))) break;
  // flecha ">" a la derecha de la cabecera
  const pos = await c.evaluar(`(() => { const h = [...document.querySelectorAll("*")].filter((e) => e.offsetParent && /^[A-Za-zÁÉÍÓÚáéíóúñ]+\\s*\\/\\s*\\d{4}$/.test((e.innerText || "").trim()) && (e.innerText || "").trim().length < 20).pop(); let n = h.parentElement; const cands = [...n.parentElement.querySelectorAll("*")].filter((e) => e.offsetParent && e !== h && !e.innerText.trim() && e.getBoundingClientRect().x > h.getBoundingClientRect().right); const b = cands.sort((a, b) => b.getBoundingClientRect().x - a.getBoundingClientRect().x)[0]; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
  await clicXY(pos); await c.dormir(900);
}
console.log("mes:", await c.evaluar(cabecera));
const posDia = await c.evaluar(`(() => {
  const h = [...document.querySelectorAll("*")].filter((e) => e.offsetParent && /^[A-Za-zÁÉÍÓÚáéíóúñ]+\\s*\\/\\s*\\d{4}$/.test((e.innerText || "").trim()) && (e.innerText || "").trim().length < 20).pop();
  let pop = h; for (let i = 0; i < 6 && pop && !/Dom|Sun/.test(pop.innerText); i++) pop = pop.parentElement;
  const celdas = [...pop.querySelectorAll("*")].filter((e) => e.childElementCount === 0 && /^\\d{1,2}$/.test((e.innerText || "").trim()) && e.offsetParent);
  const ini = celdas.findIndex((e) => e.innerText.trim() === "1");
  let fin = celdas.findIndex((e, i) => i > ini && e.innerText.trim() === "1"); if (fin < 0) fin = celdas.length;
  const d = celdas.slice(ini, fin).find((e) => +e.innerText.trim() === ${D});
  if (!d) return null; const r = d.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2];
})()`);
if (!posDia) throw new Error("no encuentro el día " + D);
await clicXY(posDia); await c.dormir(1000);

// HORA (se cierra el calendario antes; se reintenta hasta que la hora quede bien)
const esc = async () => { await c.cmd("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); await c.cmd("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); };
const abrirHora = async () => { await esc(); await c.dormir(500); await clicXY(await c.evaluar(`(() => { const r = ${inputs}[0].getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`)); await c.dormir(1200); };
const elegir = async (col, txt) => {
  const p = await c.evaluar(`(() => {
    const i = ${inputs}[0]; let n = i; for (let k = 0; k < 6 && n && !n.querySelector("span"); k++) n = n.parentElement;
    let raiz = i; for (let k = 0; k < 6; k++) raiz = raiz.parentElement;
    const cols = [...raiz.querySelectorAll("div")].filter((d) => d.childElementCount >= 12 && [...d.children].every((x) => /^\\d{2}$/.test((x.innerText || "").trim())));
    const col = cols[${col}]; if (!col) return null;
    const el = [...col.children].find((x) => x.innerText.trim() === "${txt}"); el.scrollIntoView({ block: "center" });
    return true;
  })()`);
  if (!p) throw new Error("no encuentro la columna " + col);
  // La lista se acomoda (snap) después de desplazarse: se mide la posición cuando ya quedó quieta.
  await c.dormir(600);
  const q = await c.evaluar(`(() => {
    let raiz = ${inputs}[0]; for (let k = 0; k < 6; k++) raiz = raiz.parentElement;
    const cols = [...raiz.querySelectorAll("div")].filter((d) => d.childElementCount >= 12 && [...d.children].every((x) => /^\\d{2}$/.test((x.innerText || "").trim())));
    const el = [...cols[${col}].children].find((x) => x.innerText.trim() === "${txt}");
    const r = el.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2];
  })()`);
  await clicXY(q); await c.dormir(700);
  return;
  await clicXY(p); await c.dormir(700);
};
for (let k = 0; k < 3; k++) {
  await abrirHora();
  try {
    // El selector de TikTok a veces marca la opción vecina: se lee lo que quedó y se compensa la diferencia.
    let hObj = +hh, mObj = +mm;
    for (let j = 0; j < 4; j++) {
      await elegir(0, String((hObj + 24) % 24).padStart(2, "0")); await elegir(1, String((mObj + 60) % 60).padStart(2, "0"));
      const [h2, m2] = String(await c.evaluar(`${inputs}[0].value`)).split(":").map(Number);
      if (h2 === +hh && m2 === +mm) break;
      hObj += +hh - h2; mObj += +mm - m2;
      console.log("ajuste hora:", `${h2}:${m2}`, "→ apunto a", hObj, mObj);
    }
  } catch (e) { console.log("reintento hora:", e.message); }
  await esc(); await c.dormir(600);
  if ((await c.evaluar(`${inputs}[0].value`)) === `${hh}:${mm}`) break;
}
await c.cmd("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); await c.cmd("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await c.dormir(800);
const puesto = await c.evaluar(`${inputs}.map((i) => i.value).join(" ")`);
const esperado = `${hh}:${mm} ${fechaTxt}`;
console.log(o.id, "→", puesto, "(esperado", esperado + ")");
if (puesto !== esperado) throw new Error("fecha no coincide");
