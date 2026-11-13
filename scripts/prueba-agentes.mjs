// Pruebas de los reels nuevos y del marcador real (no publica nada; reel_nuevo en modo --probar deja los archivos como estaban).
// node scripts/prueba-agentes.mjs
import assert from "node:assert";
import fs from "node:fs";
import { marcador, reelNuevo } from "./reel-nuevo.mjs";

const antes = fs.readFileSync("historias/llanganates.mjs", "utf8");
const base = { historia: "llanganates", gancho: "Escondieron 750 cargas de oro inca", escenas: ["a1", "a2", "a3", "g1"], cierre: "¿Dónde está? En el canal",
  cuando: new Date(Date.now() + 9 * 864e5 - 5 * 36e5).toISOString().slice(0, 11) + "05:15:00-05:00",
  texto: "Rumiñahui escondió el oro del rescate en las montañas. ¿Tú lo buscarías? #llanganates #tesoro", titulo_yt: "750 cargas de oro inca escondidas #shorts" };
let n = 0;
const ok = (x, msg) => { assert.ok(x, msg); n++; };

const r = await reelNuevo(base, { probar: true });
ok(r.ok && r.segundos >= 10 && r.segundos <= 60, "reel válido: " + JSON.stringify(r));
ok((await reelNuevo({ ...base, escenas: ["zz9", "a1"] }, { probar: true })).error?.includes("imagen vertical"), "escena sin imagen vertical");
ok((await reelNuevo({ ...base, gancho: "Prometió una habitación llena de oro" }, { probar: true })).error?.includes("ya se usó"), "gancho repetido");
ok((await reelNuevo({ ...base, gancho: "uno dos tres cuatro cinco seis siete ocho nueve diez" }, { probar: true })).error?.includes("9 palabras"), "gancho largo");
ok((await reelNuevo({ ...base, cuando: new Date(Date.now() + 36e5).toISOString().replace("Z", "-05:00") }, { probar: true })).error, "muy pronto");
ok((await reelNuevo({ ...base, titulo_yt: "x".repeat(101) }, { probar: true })).error?.includes("100"), "título largo");
ok(fs.readFileSync("historias/llanganates.mjs", "utf8") === antes, "no deja cambios");

const ahora = Date.parse("2026-11-12T12:00:00Z");
const m = marcador({ analisis: { por_red: { youtube: { por_formato: [{ grupo: "reel", mediana: 100 }] } } },
  datos: { pubs: [
    { red: "youtube", tipo: "reel", video_id: "a", gancho: "A", vistas_24h: 100, cuando: "2026-11-10T12:00:00Z" },
    { red: "youtube", tipo: "reel", video_id: "b", gancho: "B", vistas_24h: 300, cuando: "2026-11-09T12:00:00Z" },
    { red: "youtube", tipo: "reel", video_id: "c", gancho: "C", vistas_24h: 5, cuando: "2026-11-12T06:00:00Z" },
    { red: "facebook", tipo: "reel", video_id: "d", gancho: "D", vistas_24h: 1, cuando: "2026-11-09T12:00:00Z" } ] } }, ahora);
ok(m.filas.length === 2, "solo YouTube y con 24 h cumplidas");
ok(m.filas[0].nota === 50 && m.filas[1].nota === 100, "nota 50 en la mediana, tope 100");
console.log(`ok ${n}/${n}`);
