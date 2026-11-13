// Locución con ElevenLabs. Graba la historia por bloques (secciones del guion,
// <= 1.800 letras) para que la entonación fluya, y corta cada escena con el
// tiempo de cada letra. Guarda public/<historia>/voz/bN.mp3 y src/datos/<historia>-voz.json.
//
// Uso: VOZ=<voice_id> node scripts/voz.mjs cantuna        (REUSAR=1 no gasta créditos)
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const nombre = process.argv[2];
const { HISTORIA } = await import(`../historias/${nombre}.mjs`);
// Clave de la cuenta Starter (uso comercial), aparte de la cuenta gratis de Nexia.
const KEY = fs.readFileSync(path.join(os.homedir(), ".relatos-secretos/elevenlabs.txt"), "utf8").trim();
if (!KEY) throw new Error("Falta la clave en ~/.relatos-secretos/elevenlabs.txt");
const VOZ = process.env.VOZ || HISTORIA.voz;
const MODELO = process.env.MODELO || "eleven_multilingual_v2";
const dir = `public/${nombre}/voz`;
fs.mkdirSync(dir, { recursive: true });

// Bloques: se corta en las escenas cuyo id cambia de letra (g, a, c, t...) sin pasar de 1.800 letras.
const bloques = [];
for (const e of HISTORIA.escenas) {
  const ult = bloques.at(-1);
  const largo = ult ? ult.reduce((a, x) => a + x.texto.length, 0) : 0;
  if (!ult || (ult.at(-1).id[0] !== e.id[0] && largo > 700) || largo + e.texto.length > 1800) bloques.push([e]);
  else ult.push(e);
}

// Sentinel: botón DETENER y presupuesto (ElevenLabs Starter: las letras van dentro del plan → costo marginal 0, se anotan las letras).
const { detenido, anotarGasto } = await import("./nube.mjs");
if (await detenido("relatos", "apis")) { console.error("🛑 DETENER EMPRESA: APIs con consumo paradas."); process.exit(3); }
let salida = [];
async function conElevenLabs() {
for (const [n, bloque] of bloques.entries()) {
  const archivo = `${dir}/b${n}.json`;
  const texto = bloque.map((e) => e.texto).join("\n\n");
  let r;
  if (process.env.REUSAR && fs.existsSync(archivo)) r = JSON.parse(fs.readFileSync(archivo, "utf8"));
  else {
    const prev = n > 0 ? bloques[n - 1].map((e) => e.texto).join(" ").slice(-400) : undefined;
    const next = bloques[n + 1]?.map((e) => e.texto).join(" ").slice(0, 400);
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOZ}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: texto, model_id: MODELO, language_code: "es",
        ...(MODELO.includes("v3") ? {} : { previous_text: prev, next_text: next }),
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, speed: 0.95 },
      }),
    });
    if (!res.ok) throw new Error(`bloque ${n}: ${res.status} ${(await res.text()).slice(0, 300)}`);
    await anotarGasto({ proveedor: "elevenlabs", concepto: `Voz ${nombre} bloque ${n}`, monto: 0, unidades: texto.length, unidad: "letras", agente: "voz.mjs" });
    r = await res.json();
    fs.writeFileSync(`${dir}/b${n}.mp3`, Buffer.from(r.audio_base64, "base64"));
    delete r.audio_base64;
    fs.writeFileSync(archivo, JSON.stringify(r));
  }
  const a = r.alignment;
  const letras = a.characters.join(""), ini = a.character_start_times_seconds, fin = a.character_end_times_seconds;
  let desde = 0;
  for (const e of bloque) {
    const pos = letras.indexOf(e.texto, desde);
    if (pos < 0) throw new Error(`no encuentro la escena ${e.id}`);
    desde = pos + e.texto.length;
    const palabras = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(e.texto))) {
      const x = pos + m.index, y = x + m[0].length - 1;
      if (/[\p{L}\p{N}]/u.test(m[0])) palabras.push({ texto: m[0], desde: ini[x], hasta: fin[y] });
    }
    const recorte = Math.max(0, palabras[0].desde - 0.06);
    const final = palabras.at(-1).hasta + 0.25;
    salida.push({
      id: e.id, bloque: n, archivo: `${nombre}/voz/b${n}.mp3`,
      recorte: +recorte.toFixed(3), duracion: +(final - recorte).toFixed(3),
      palabras: palabras.map((w) => ({ texto: w.texto, desde: +(w.desde - recorte).toFixed(3), hasta: +(w.hasta - recorte).toFixed(3) })),
    });
  }
  console.log(`bloque ${n}: ${bloque.length} escenas, ${texto.length} letras`);
}
}

// Respaldo gratis: Kokoro (VOZ_RESPALDO=em_alex, etc.) escena por escena cuando ElevenLabs no tiene letras.
// Kokoro no da tiempos por palabra: se reparten por largo de cada palabra (los subtítulos quedan aproximados).
async function conKokoro(voz) {
  const { execFileSync } = await import("node:child_process");
  const pedido = HISTORIA.escenas.map((e) => ({ texto: e.texto, salida: `${dir}/k-${e.id}.wav` }));
  fs.writeFileSync(`${dir}/kokoro.json`, JSON.stringify(pedido));
  const py = process.env.PYTHON || "python3";
  const lineas = execFileSync(py, ["scripts/voz-kokoro.py", voz, `${dir}/kokoro.json`], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim().split("\n").map((l) => JSON.parse(l));
  const ff = "node_modules/@remotion/cli/remotion-cli.js";
  salida = HISTORIA.escenas.map((e, n) => {
    const mp3 = `${dir}/k-${e.id}.mp3`;
    execFileSync(process.execPath, [ff, "ffmpeg", "-y", "-loglevel", "error", "-i", pedido[n].salida, "-b:a", "128k", mp3], { stdio: "ignore" });
    fs.rmSync(pedido[n].salida);
    const seg = lineas[n].segundos, palabras = e.texto.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
    const total = palabras.reduce((a, w) => a + w.length + 1, 0);
    let t = 0;
    return { id: e.id, bloque: n, archivo: `${nombre}/voz/k-${e.id}.mp3`, recorte: 0, duracion: +(seg + 0.25).toFixed(3),
      palabras: palabras.map((w) => { const d = (seg * (w.length + 1)) / total, p = { texto: w, desde: +t.toFixed(3), hasta: +(t + d).toFixed(3) }; t += d; return p; }) };
  });
  fs.rmSync(`${dir}/kokoro.json`);
  console.log(`voz de respaldo Kokoro (${voz}): ${salida.length} escenas`);
}

if (process.env.VOZ_RESPALDO_FORZAR) await conKokoro(process.env.VOZ_RESPALDO_FORZAR);
else try { await conElevenLabs(); }
catch (e) {
  const sinLetras = /quota|credits|401|402|429/i.test(String(e.message));
  if (!process.env.VOZ_RESPALDO || !sinLetras) throw e;
  console.error(`ElevenLabs sin letras (${String(e.message).slice(0, 120)}) → voz de respaldo`);
  await conKokoro(process.env.VOZ_RESPALDO);
}
fs.writeFileSync(`src/datos/${nombre}-voz.json`, JSON.stringify(salida));
console.log("total", salida.reduce((a, x) => a + x.duracion, 0).toFixed(1), "s de voz");
