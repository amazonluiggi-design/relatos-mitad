// Última comprobación antes de pulsar Programar: fecha y hora exactas (si no, se corta y no se programa nada).
const fs = await import("node:fs");
const o = JSON.parse(fs.readFileSync("cola.json", "utf8")).find((x) => x.id === process.env.VID);
const dt = new Date(new Date(o.cuando).getTime() - 5 * 3600e3);
const esperado = `${String(dt.getUTCHours()).padStart(2, "0")}:${String(dt.getUTCMinutes()).padStart(2, "0")} ${dt.toISOString().slice(0, 10)}`;
const puesto = await c.evaluar(`[...document.querySelectorAll("[data-e2e=schedule_container] input[type=text]")].map((i) => i.value).join(" ")`);
console.log("verificación:", puesto, "esperado", esperado);
if (puesto !== esperado) throw new Error("hora cambiada antes de programar");
