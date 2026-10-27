// Programa en TikTok Studio el video VID de la cola: carga, texto, IA, fecha/hora, Programar.
const fs = await import("node:fs");
const o = JSON.parse(fs.readFileSync("cola.json","utf8")).find(x=>x.id===process.env.VID);
const dt = new Date(new Date(o.cuando).getTime() - 5*3600e3); // hora Ecuador
const dia = dt.getUTCDate(), hh = String(dt.getUTCHours()).padStart(2,"0"), mm = String(dt.getUTCMinutes()).padStart(2,"0");
const mes = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][dt.getUTCMonth()];
const etiqueta = `${dia} de ${mes} de ${dt.getUTCFullYear()}`;
await c.evaluar(`document.querySelector("input[value=schedule]").click()`); await c.dormir(1500);
await clic("Permitir"); await c.dormir(1000);
await c.evaluar(`(()=>{if(!document.querySelector("button[aria-label='Next month']"))document.querySelector("[aria-label='Select date']").click()})()`); await c.dormir(1000);
for (let k = 0; k < 3; k++) {
  const hecho = await c.evaluar(`(()=>{const et=${JSON.stringify(", " + etiqueta)};const b=[...document.querySelectorAll("button[aria-label]")].find(b=>!b.disabled&&b.getAttribute("aria-label").endsWith(et));if(!b)return false;b.click();return true})()`);
  if (hecho) break;
  await c.evaluar(`document.querySelector("button[aria-label='Next month']").click()`); await c.dormir(800);
}
await c.dormir(800);
await c.evaluar(`(()=>{if(!document.querySelector("[aria-label='Hours ${hh}']"))document.querySelector("[aria-label='Select time']").click()})()`); await c.dormir(1000);
await c.evaluar(`document.querySelector("[aria-label='Hours ${hh}']").click()`); await c.dormir(500);
await c.evaluar(`document.querySelector("[aria-label='Minutes ${mm}']").click()`); await c.dormir(500);
await c.cmd("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27}); await c.cmd("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
await c.dormir(600);
const puesto = await c.evaluar(`document.querySelector("[aria-label='Select date']").innerText + " " + document.querySelector("[aria-label='Select time']").innerText`);
const esperado = `${dia} ${mes.slice(0,3)} ${dt.getUTCFullYear()} ${hh}:${mm}`;
console.log(o.id, "→", puesto, "(esperado", esperado + ")");
if (puesto !== esperado) throw new Error("fecha no coincide");
