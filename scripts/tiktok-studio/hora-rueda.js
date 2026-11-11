// Pone la HORA como una persona: abre el selector, gira la rueda del ratón sobre cada columna hasta que la opción
// buscada quede a la vista y en el centro, la pulsa, y cierra pulsando el campo. Necesita: c, inputs, clicSeguro, hh, mm.
// (Se carga con eval desde programar.js para poder probarla aparte.)
const centroCol = (col) => `(() => { const op = [...document.querySelectorAll(".tiktok-timepicker-option-item")].filter((x) => x.getBoundingClientRect().width > 0); const cols = [...new Set(op.map((x) => x.parentElement))]; const c0 = cols[${col}]; if (!c0) return null; let s = c0; while (s && s.scrollHeight <= s.clientHeight + 2) s = s.parentElement; const caja = (s || c0).getBoundingClientRect(); return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2, top: caja.top, bottom: caja.bottom }; })()`;
const opcion = (col, txt) => `(() => { const op = [...document.querySelectorAll(".tiktok-timepicker-option-item")].filter((x) => x.getBoundingClientRect().width > 0); const cols = [...new Set(op.map((x) => x.parentElement))]; const c0 = cols[${col}]; if (!c0) return null; const el = [...c0.children].find((x) => x.innerText.trim() === "${txt}"); if (!el) return null; const r = el.getBoundingClientRect(); return { y: r.y + r.height / 2, h: r.height }; })()`;
globalThis.ponerHora = async () => {
  await clicSeguro(`${inputs}[0]`, "campo hora"); await c.dormir(1200);
  for (const [col, txt] of [[0, hh], [1, mm]]) {
    let listo = false;
    for (let i = 0; i < 40 && !listo; i++) {
      const caja = await c.evaluar(centroCol(col)); const o = await c.evaluar(opcion(col, txt));
      if (!caja || !o) throw new Error(`no veo la columna ${col}`);
      const dif = o.y - caja.y;
      if (Math.abs(dif) < o.h / 2 && o.y > caja.top && o.y < caja.bottom) {
        await c.cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x: caja.x, y: o.y }); await c.dormir(250);
        const b = await c.evaluar(`(document.elementFromPoint(${caja.x}, ${o.y})?.innerText || "").trim()`);
        if (b !== txt) throw new Error(`bajo el puntero hay "${b}", no "${txt}"`);
        for (const type of ["mousePressed", "mouseReleased"]) await c.cmd("Input.dispatchMouseEvent", { type, x: caja.x, y: o.y, button: "left", clickCount: 1 });
        listo = true; break;
      }
      // Rueda del ratón sobre la columna: pasos cortos para no pasarse.
      const paso = Math.max(-160, Math.min(160, dif));
      await c.cmd("Input.dispatchMouseEvent", { type: "mouseWheel", x: caja.x, y: caja.y, deltaX: 0, deltaY: paso }); await c.dormir(350);
    }
    if (!listo) throw new Error(`no llegué a ${txt}`);
    await c.dormir(500);
  }
  await clicSeguro(`${inputs}[0]`, "campo hora (cerrar)"); await c.dormir(1000);
  return c.evaluar(`${inputs}[0].value`);
};
