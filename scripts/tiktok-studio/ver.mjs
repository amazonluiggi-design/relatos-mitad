import { conectar } from "./cdp.mjs";
const c = await conectar();
if (process.argv[2]) { await c.cmd("Page.navigate", { url: process.argv[2] }); await c.dormir(8000); }
console.log(await c.evaluar("location.href + ' | ' + document.title"));
await c.foto("ver.jpg");
c.cerrar();
