import { conectar } from "./cdp.mjs";
import fs from "node:fs";
const c = await conectar();
const clic = (texto) => c.evaluar(`(()=>{const el=[...document.querySelectorAll("button,div[role=button],span,label")].reverse().find(e=>e.innerText&&e.innerText.trim()===${JSON.stringify(texto)}&&e.offsetParent);if(!el)return false;el.click();return true})()`);
globalThis.c = c; globalThis.clic = clic;
const codigo = fs.readFileSync(process.argv[2], "utf8");
await (new Function("c", "clic", "return (async()=>{" + codigo + "})()"))(c, clic);
await c.foto("ver.jpg");
c.cerrar();
