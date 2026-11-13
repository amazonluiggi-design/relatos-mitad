// Reel nuevo a partir de una historia ya producida: otro gancho y otro orden de escenas que ya tienen voz e imagen vertical.
// No gasta voz ni imágenes. Lo usa la jornada de los agentes (herramienta reel_nuevo) y también se puede correr a mano:
//   node scripts/reel-nuevo.mjs '<json>' [--probar]
//   json: { historia, gancho, escenas: [...], cierre, cuando: "2026-11-18T12:30:00-05:00", texto, titulo_yt }
// Escribe historias/<h>.mjs y publicaciones/<h>.mjs, comprueba la duración con planear.mjs y (en GitHub) hace commit y lanza la Fábrica solo para ese reel.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const MAX_DIA = 3;
const ec = (ms) => new Date(ms - 5 * 36e5).toISOString().slice(0, 10);

/** Escenas que ya tienen imagen vertical (salieron en algún reel o parte) y ganchos usados. */
export async function opciones(h) {
  if (!/^[a-z0-9-]+$/.test(h) || !fs.existsSync(`historias/${h}.mjs`) || !fs.existsSync(`src/datos/${h}-plan.json`)) return null;
  const { HISTORIA, REELS = [] } = await import(`../historias/${h}.mjs?${Date.now()}`);
  const verticales = new Set(REELS.flatMap((r) => r.escenas));
  return {
    escenas: HISTORIA.escenas.filter((e) => verticales.has(e.id)).map((e) => ({ id: e.id, texto: e.texto })),
    ganchos: REELS.map((r) => r.gancho),
  };
}

async function horasOcupadas() {
  const horas = [];
  for (const f of fs.readdirSync("publicaciones").filter((f) => f.endsWith(".mjs"))) {
    const { PUBLICACION } = await import(`../publicaciones/${f}?${Date.now()}`);
    const todo = [PUBLICACION.largo, ...(PUBLICACION.reels || []), ...(PUBLICACION.episodios || [])].filter(Boolean).map((p) => p.cuando);
    horas.push(...todo, ...(PUBLICACION.partes || []).map((p) => p.yt).filter(Boolean));
  }
  return horas.map((c) => Date.parse(c));
}

export async function reelNuevo(p, { probar = false } = {}) {
  const h = String(p.historia || "");
  const op = await opciones(h);
  if (!op) return { error: `La historia "${h}" no existe o no está producida.` };
  const escenas = Array.isArray(p.escenas) ? p.escenas.map(String) : [];
  const validas = new Set(op.escenas.map((e) => e.id));
  const malas = escenas.filter((e) => !validas.has(e));
  if (escenas.length < 2 || escenas.length > 7) return { error: "Usa de 2 a 7 escenas." };
  if (malas.length) return { error: `Estas escenas no tienen imagen vertical: ${malas.join(", ")}. Válidas: ${[...validas].join(", ")}` };
  const gancho = String(p.gancho || "").trim();
  if (!gancho || gancho.split(/\s+/).length > 9) return { error: "El gancho debe tener de 1 a 9 palabras." };
  if (op.ganchos.some((g) => g.toLowerCase() === gancho.toLowerCase())) return { error: "Ese gancho ya se usó en esta historia." };
  const cierre = String(p.cierre || "La historia completa, en el canal").trim().slice(0, 60);
  const titulo = String(p.titulo_yt || "").trim();
  if (!titulo || titulo.length > 100) return { error: "titulo_yt debe tener de 1 a 100 letras (incluye #shorts)." };
  const texto = String(p.texto || "").trim();
  if (texto.length < 20 || texto.length > 1500) return { error: "texto (descripción de Facebook) debe tener de 20 a 1500 letras." };
  const cuando = Date.parse(p.cuando);
  if (!/-05:00$/.test(String(p.cuando)) || isNaN(cuando)) return { error: 'cuando debe ser hora de Ecuador, ej. "2026-11-18T12:30:00-05:00".' };
  if (cuando < Date.now() + 6 * 36e5 || cuando > Date.now() + 10 * 864e5) return { error: "cuando debe estar entre 6 horas y 10 días desde ahora (la Fábrica tarda en renderizar)." };
  const choque = (await horasOcupadas()).find((x) => Math.abs(x - cuando) < 2 * 36e5);
  if (choque) return { error: `Choca con otra publicación a las ${new Date(choque - 5 * 36e5).toISOString().slice(11, 16)} de ese día: deja 2 h de distancia.` };
  const marca = `// reel nuevo ${ec(Date.now())}`;
  const hechosHoy = fs.readdirSync("publicaciones").filter((f) => f.endsWith(".mjs")).reduce((n, f) => n + fs.readFileSync(`publicaciones/${f}`, "utf8").split(marca).length - 1, 0);
  if (hechosHoy >= MAX_DIA) return { error: `Ya se hicieron ${MAX_DIA} reels nuevos hoy: el resto mañana.` };

  const { PUBLICACION } = await import(`../publicaciones/${h}.mjs?${Date.now()}`);
  const id = `reel${PUBLICACION.reels.length + 1}`;
  const rutaH = `historias/${h}.mjs`, rutaP = `publicaciones/${h}.mjs`, rutaPlan = `src/datos/${h}-plan.json`;
  const antes = { h: fs.readFileSync(rutaH, "utf8"), p: fs.readFileSync(rutaP, "utf8"), plan: fs.readFileSync(rutaPlan, "utf8") };
  const deshacer = () => { fs.writeFileSync(rutaH, antes.h); fs.writeFileSync(rutaP, antes.p); fs.writeFileSync(rutaPlan, antes.plan); };
  fs.appendFileSync(rutaH, `\n${marca}\nREELS.push(${JSON.stringify({ id, gancho, escenas, cierre })});\n`);
  fs.appendFileSync(rutaP, `\n${marca}\nPUBLICACION.reels.push(${JSON.stringify({ archivo: `out/${h}-${id}.mp4`, cuando: p.cuando, texto })});\nYOUTUBE.reels.push(${JSON.stringify({ titulo })});\n`);
  try {
    execFileSync(process.execPath, ["scripts/planear.mjs", h], { stdio: "pipe" });
    const r = JSON.parse(fs.readFileSync(rutaPlan, "utf8")).reels.find((x) => x.id === id);
    const s = r ? r.total / JSON.parse(fs.readFileSync(rutaPlan, "utf8")).fps : 0;
    if (s < 10 || s > 60) { deshacer(); return { error: `El reel duraría ${s.toFixed(0)} s: tiene que durar de 10 a 60 s (cambia las escenas).` }; }
    if (probar) { deshacer(); return { ok: true, probado: true, id, segundos: Math.round(s) }; }
    if (process.env.GITHUB_ACTIONS) {
      const git = (...a) => execFileSync("git", a, { stdio: "pipe" });
      git("config", "user.name", "Relatos de la Mitad"); git("config", "user.email", "amazonluiggi@gmail.com");
      git("add", rutaH, rutaP, rutaPlan);
      git("commit", "-m", `Reel nuevo de los agentes: ${h} ${id} («${gancho}»)`);
      for (let i = 0; i < 5; i++) { try { git("pull", "--rebase", "-q"); git("push", "-q"); break; } catch (e) { if (i === 4) throw e; } }
      execFileSync("gh", ["workflow", "run", "fabrica.yml", "-f", `historia=${h}`, "-f", `solo=${id}`], { stdio: "pipe" });
    }
    return { ok: true, id, segundos: Math.round(s), sale: p.cuando, nota: process.env.GITHUB_ACTIONS ? "La Fábrica ya lo está renderizando y lo programa en Facebook y YouTube." : "Guardado en esta PC (sin Fábrica)." };
  } catch (e) { deshacer(); return { error: `No se pudo: ${String(e.message || e).slice(0, 300)}` }; }
}

// ── Marcador real: la nota de un reel la ponen sus vistas a 24 h en YouTube, no la opinión de Dwight ──
// nota = 50 en la mediana de reels de YouTube, 100 al doble. Los reels hechos aquí llevan "// reel nuevo" en publicaciones/.
export function marcador(c, ahora = Date.now()) {
  const yt = c.analisis?.por_red?.youtube;
  const mediana = yt?.por_formato?.find((f) => f.grupo === "reel")?.mediana || yt?.mediana || 100;
  const nuevos = new Set(fs.readdirSync("publicaciones").filter((f) => f.endsWith(".mjs")).flatMap((f) =>
    [...fs.readFileSync(`publicaciones/${f}`, "utf8").matchAll(/\/\/ reel nuevo [\d-]+\nPUBLICACION\.reels\.push\(\{"archivo":"out\/([\w-]+)\.mp4"/g)].map((m) => m[1])));
  const filas = (c.datos?.pubs || []).filter((p) => p.red === "youtube" && p.tipo === "reel" && p.vistas_24h != null && Date.parse(p.publicado_en || p.cuando) < ahora - 864e5)
    .sort((a, b) => Date.parse(b.cuando) - Date.parse(a.cuando)).slice(0, 15)
    .map((p) => ({ video: p.video_id, gancho: p.gancho, vistas_24h: p.vistas_24h, nota: Math.min(100, Math.round((50 * p.vistas_24h) / mediana)), de_agentes: nuevos.has(p.video_id), salio: p.cuando }));
  return { mediana, filas };
}

if (process.argv[1]?.endsWith("reel-nuevo.mjs")) {
  console.log(JSON.stringify(await reelNuevo(JSON.parse(process.argv[2]), { probar: process.argv.includes("--probar") }), null, 1));
}
