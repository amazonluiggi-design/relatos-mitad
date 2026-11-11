// Pone una portada con imagen (cuadro del segundo 1,5 del propio video) antes de programar. ID en process.env.VID.
// Regla de la empresa: ningún video sale sin miniatura (el primer cuadro de los reels viejos era negro).
// Ojo: el editor de portada es un diálogo fijo (offsetParent = null): lo visible se mide con getBoundingClientRect.
const fs = await import("node:fs");
const { execFileSync } = await import("node:child_process");
const o = JSON.parse(fs.readFileSync("cola.json", "utf8")).find((x) => x.id === process.env.VID);
const RAIZ = "C:/Users/DJ LUIGGI DELGADO/relatos-mitad/";
const img = RAIZ + o.archivo.replace(/\.mp4$/, "-portada.jpg");
execFileSync(process.execPath, [RAIZ + "node_modules/@remotion/cli/remotion-cli.js", "ffmpeg", "-y", "-loglevel", "error", "-ss", "1.5", "-i", RAIZ + o.archivo, "-frames:v", "1", "-q:v", "2", img]);
if (!fs.existsSync(img)) throw new Error("no se pudo sacar la portada");
const clicXY = async ([x, y]) => { await c.cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }); await c.dormir(500); for (const type of ["mousePressed", "mouseReleased"]) await c.cmd("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 }); };
const visible = `((x) => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0; })`;
const posBoton = (re) => c.evaluar(`(() => { const b = [...document.querySelectorAll("button")].filter((x) => ${visible}(x) && ${re}.test(x.innerText.trim())).pop(); if (!b || b.disabled) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
const editorAbierto = () => c.evaluar(`[...document.querySelectorAll("[role=dialog]")].some((d) => ${visible}(d) && /Edit cover|Editar portada/.test(d.innerText))`);

if (!(await editorAbierto())) {
  // Cierra menús abiertos (el selector de hora no se cierra con Escape) y abre el editor desde la miniatura.
  const vacio = await c.evaluar(`(() => { const e = [...document.querySelectorAll("*")].find((x) => x.offsetParent && /^(Details|Detalles)$/.test((x.innerText || "").trim())); if (!e) return null; const r = e.getBoundingClientRect(); return [r.right + 300, r.y + r.height / 2]; })()`);
  if (vacio) { await clicXY(vacio); await c.dormir(800); }
  const boton = () => c.evaluar(`(() => { const e = [...document.querySelectorAll("*")].filter((x) => x.offsetParent && ${visible}(x) && /^(Edit cover|Editar portada)$/.test((x.innerText || "").trim())).pop(); if (!e) return null; e.scrollIntoView({ block: "center" }); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
  if (!(await boton())) throw new Error("no encuentro Editar portada");
  await c.dormir(700); await clicXY(await boton());
  for (let i = 0; i < 15 && !(await editorAbierto()); i++) await c.dormir(1000);
  if (!(await editorAbierto())) throw new Error("no se abrió el editor de portada");
}
await c.dormir(1500);
await c.cmd("DOM.enable");
const { root } = await c.cmd("DOM.getDocument", { depth: -1, pierce: true });
const { nodeIds } = await c.cmd("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "input[type=file]" });
let subida = false;
for (const id of nodeIds) {
  const { node } = await c.cmd("DOM.describeNode", { nodeId: id });
  const accept = (node.attributes || []).join(" ");
  if (!/image/.test(accept)) continue;
  await c.cmd("DOM.setFileInputFiles", { nodeId: id, files: [img] }); subida = true;
}
// Sin campo de subida = la imagen ya se cargó en un intento anterior (el editor quedó abierto con ella).
if (!subida) console.log("la imagen ya estaba cargada en el editor");
await c.dormir(5000);
for (let i = 0; i < 8 && (await editorAbierto()); i++) {
  const p = await posBoton("/^(Save|Guardar)$/");
  if (p) await clicXY(p);
  await c.dormir(2500);
}
if (await editorAbierto()) throw new Error("no se pudo guardar la portada");
console.log("portada ok:", img.split("/").pop());
