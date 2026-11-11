// Autoprueba: node --experimental-strip-types autopilot/scripts/prueba-inteligencia.mjs [pubs.json]
// Con un archivo de publicaciones reales (salida JSON de wrangler d1) imprime además el análisis.
import assert from "node:assert/strict";
import fs from "node:fs";
import { analizar } from "../src/analisis.ts";
import { validarGuion } from "../src/produccion.ts";

const AHORA = Date.parse("2026-11-11T12:00:00Z");
const pub = (red, dias, vistas, historia = "h", titulo = "t", tipo = "reel") => ({ red, cuando: new Date(AHORA - dias * 86400e3).toISOString(), titulo, tipo, historia_id: historia, vistas });

// Caída: 6 videos viejos con ~400 y 6 nuevos con ~2 → alerta; lo de hoy no cuenta.
const a = analizar([...[9, 10, 11, 12, 13, 14].map((d) => pub("tiktok", d, 400 + d, "oro", "El oro perdido")), ...[2, 3, 4, 5, 6, 7].map((d) => pub("tiktok", d, 2, "dama")), pub("tiktok", 0.2, 9999)], AHORA);
assert.equal(a.alertas.length, 1);
assert.match(a.alertas[0], /tiktok: caída fuerte/);
assert.equal(a.por_red.tiktok.n, 12);
assert.equal(a.por_red.tiktok.por_historia[0].grupo, "oro");
assert.equal(a.por_red.tiktok.tema_oro_y_tesoros.con.n, 6);
assert.equal(a.por_red.tiktok.mejores[0].vistas, 414);
// Sin caída no hay alerta; grupos de menos de 3 no salen.
const b = analizar([1.5, 2, 3, 9].map((d) => pub("youtube", d, 100)), AHORA);
assert.equal(b.alertas.length, 0);
assert.equal(b.por_red.youtube.por_historia[0].muestra_chica, true);

// Guion: las reglas de calidad nuevas.
const en = (h) => new Date(AHORA + h * 3600e3).toISOString();
const base = () => ({ id: "prueba-oro", titulo: "El oro de prueba", estilo: "cinematic film still, epic mystery, no text",
  escenas: ["g1", "g2", "c1"].map((id) => ({ id, texto: "Cuenta la tradición que el oro nunca salió de la montaña, y nadie volvió.", img: "misty mountain with gold glow at dawn", mov: "acercar" })),
  reels: [{ gancho: "El oro que nadie encontró", escenas: ["g1", "g2", "c1"], cuando: en(30), texto: "¿Tú qué crees? #leyendas #tesoros", titulo_yt: "El oro que nadie encontró #shorts" }] });
assert.ok(validarGuion(base(), AHORA).guion, "guion base válido");
let g = base(); g.escenas[0].texto = "x".repeat(241);
assert.match(validarGuion(g, AHORA).error, /máximo 240/);
g = base(); g.reels[0].gancho = "Este gancho tiene demasiadas palabras para leerse en dos segundos";
assert.match(validarGuion(g, AHORA).error, /máximo 9/);
g = base(); g.reels[0].escenas = ["g1", "g2"]; g.escenas[0].texto = g.escenas[1].texto = "Corto, muy corto.";
assert.match(validarGuion(g, AHORA).error, /130 a 700/);
g = base(); g.reels.push({ ...g.reels[0] });
assert.match(validarGuion(g, AHORA).error, /repite el gancho/);
console.log("inteligencia: 13 comprobaciones bien");

if (process.argv[2]) {
  const pubs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))[0].results;
  const r = analizar(pubs);
  console.log(r.alertas.join("\n"));
  for (const [red, d] of Object.entries(r.por_red)) console.log(red, JSON.stringify({ n: d.n, mediana: d.mediana, u7: d.ultimos_7_dias, p7: d.los_7_dias_anteriores, historia: d.por_historia, formato: d.por_formato, hora: d.por_hora_ecuador, oro: d.tema_oro_y_tesoros }));
}
