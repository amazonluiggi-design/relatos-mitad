// Carga un video de la cola en TikTok Studio con texto y etiqueta IA (sin publicar). ID en process.env.VID
const fs = await import("node:fs");
const o = JSON.parse(fs.readFileSync("cola.json","utf8")).find(x=>x.id===process.env.VID);
const tecla = async (key, code, vk, modifiers=0) => { await c.cmd("Input.dispatchKeyEvent",{type:"keyDown",key,code,windowsVirtualKeyCode:vk,modifiers}); await c.cmd("Input.dispatchKeyEvent",{type:"keyUp",key,code,windowsVirtualKeyCode:vk,modifiers}); };
await c.cmd("Page.navigate",{url:"https://www.tiktok.com/tiktokstudio/upload"}); await c.dormir(7000);
if (/no se ha guardado/.test(await c.evaluar("document.body.innerText"))) { await clic("Descartar"); await c.dormir(1200); await c.evaluar(`(()=>{const bs=[...document.querySelectorAll("button")].filter(b=>b.innerText.trim()==="Descartar"&&b.offsetParent);if(bs.length)bs[bs.length-1].click()})()`); await c.dormir(1500); }
await c.cmd("DOM.enable");
const ruta = "C:/Users/DJ LUIGGI DELGADO/relatos-mitad/" + o.archivo;
if (!fs.existsSync(ruta)) throw new Error("no existe " + ruta);
for (let k = 0; k < 5; k++) {
  const { root } = await c.cmd("DOM.getDocument", { depth: -1, pierce: true });
  const { nodeId } = await c.cmd("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
  await c.cmd("DOM.setFileInputFiles", { nodeId, files: [ruta] });
  await c.dormir(2500);
  if (!/Selecciona el vídeo que quieres cargar/.test(await c.evaluar("document.body.innerText"))) break;
}
let ok=false; for (let i = 0; i < 80; i++) { await c.dormir(3000); if (/Cargado（/.test(await c.evaluar("document.body.innerText"))) { ok=true; break; } }
if(!ok) throw new Error("no cargó");
await c.dormir(1500); await clic("Entendido"); await clic("Cancelar"); await c.dormir(500);
await c.evaluar(`document.querySelector("[contenteditable=true]").focus()`);
await tecla("a","KeyA",65,2); await tecla("Backspace","Backspace",8); await c.dormir(400);
await c.cmd("Input.insertText",{text: o.texto + " "}); await c.dormir(1200); await tecla("Escape","Escape",27);
await clic("Mostrar más"); await c.dormir(800);
await c.evaluar(`(()=>{const lab=[...document.querySelectorAll("*")].find(e=>e.childElementCount===0&&e.innerText&&e.innerText.trim()==="Contenido generado por IA");let n=lab;for(let i=0;i<6&&n;i++){n=n.parentElement;const s=n.querySelector("[role=switch]");if(s){if(!s.checked)s.click();return}}})()`);
await c.dormir(1200); await clic("Activar"); await c.dormir(800);
console.log("texto:", (await c.evaluar(`document.querySelector("[contenteditable=true]").innerText`)).slice(0,60));
console.log("IA:", await c.evaluar(`(()=>{const lab=[...document.querySelectorAll("*")].find(e=>e.childElementCount===0&&e.innerText&&e.innerText.trim()==="Contenido generado por IA");let n=lab;for(let i=0;i<6&&n;i++){n=n.parentElement;const s=n.querySelector("[role=switch]");if(s)return s.checked}})()`));
