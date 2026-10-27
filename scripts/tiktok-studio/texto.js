// Deja la descripción exactamente igual al texto de la cola (VID)
const fs = await import("node:fs");
const o = JSON.parse(fs.readFileSync("cola.json","utf8")).find(x=>x.id===process.env.VID);
const tecla = async (key, code, vk, modifiers=0) => { await c.cmd("Input.dispatchKeyEvent",{type:"keyDown",key,code,windowsVirtualKeyCode:vk,modifiers}); await c.cmd("Input.dispatchKeyEvent",{type:"keyUp",key,code,windowsVirtualKeyCode:vk,modifiers}); };
const leer = () => c.evaluar(`document.querySelector("[contenteditable=true]").innerText`);
for (let k = 0; k < 4; k++) {
  await c.evaluar(`document.querySelector("[contenteditable=true]").focus()`); await c.dormir(300);
  for (let j = 0; j < 3 && (await leer()).trim(); j++) { await tecla("a","KeyA",65,2); await c.dormir(200); await tecla("Delete","Delete",46); await c.dormir(300); }
  if ((await leer()).trim()) continue;
  await c.cmd("Input.insertText",{text: o.texto + " "}); await c.dormir(1200); await tecla("Escape","Escape",27); await c.dormir(300);
  const norm = (s) => s.replace(/\s+/g," ").trim();
  if (norm(await leer()) === norm(o.texto)) { console.log("texto ok"); break; }
  console.log("texto distinto:", (await leer()).slice(0,80));
}
