// Imagen del resumen diario (PNG 1080 de ancho, alto según la recomendación) para adjuntarla al WhatsApp de la noche. SVG -> PNG con resvg (wasm),
// con las fuentes de la marca empaquetadas (Inter y Cinzel). Sin emojis: resvg no trae fuente de emojis.
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import wasm from "@resvg/resvg-wasm/index_bg.wasm";
import inter400 from "./fuentes/inter-400.ttf";
import inter700 from "./fuentes/inter-700.ttf";
import inter800 from "./fuentes/inter-800.ttf";
import cinzel700 from "./fuentes/cinzel-700.ttf";

let listo: Promise<void> | null = null;
const C = { fondo: "#080b0d", panel: "#10161a", borde: "#22303a", texto: "#ece3d6", tenue: "#8d9aa3", ambar: "#f2a33a", youtube: "#ef4444", tiktok: "#2dd4bf", facebook: "#3b82f6" };
const NIVEL: Record<string, { c: string; t: string }> = { excelente: { c: "#34d399", t: "EXCELENTE DÍA" }, bueno: { c: "#f2a33a", t: "BUEN DÍA" }, normal: { c: "#8d9aa3", t: "DÍA NORMAL" }, flojo: { c: "#f87171", t: "DÍA FLOJO" } };
const REDES: [string, string][] = [["youtube", "YouTube"], ["tiktok", "TikTok"], ["facebook", "Facebook"]];
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const num = (n: number) => Math.round(n || 0).toLocaleString("es-EC");
const corto = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
/** Corta un texto en renglones de hasta n letras (resvg no hace saltos de línea solo). */
const renglones = (s: string, n: number) => s.split(" ").reduce<string[]>((l, p) => { if (!l.length || (l.at(-1)! + " " + p).length > n) l.push(p); else l[l.length - 1] += " " + p; return l; }, []);

// Solo lo que la imagen necesita del resumen de salud.
type Resumen = {
  dia: string; total_hoy: number; comparacion: string; calificacion: { nivel: string }; vistas_hoy: Record<string, number>;
  historial: ({ dia: string } & Record<string, number | string>)[]; seguidores: Record<string, number>; seguidores_7: Record<string, number>;
  top: { titulo: string; red: string; ritmo: number }[]; recomendacion: string;
};

export function svgResumen(r: Resumen) {
  // La altura crece con la recomendación (hasta 4 renglones).
  const lin = renglones(r.recomendacion, 62).slice(0, 4), by = 1350;
  const W = 1080, H = by + 70 + lin.length * 34 + 50, nivel = NIVEL[r.calificacion.nivel] || NIVEL.normal;
  const fecha = new Date(`${r.dia}T12:00:00Z`).toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const t = (x: number, y: number, s: string, o: { tam?: number; peso?: number; color?: string; fam?: string; ancla?: string } = {}) =>
    `<text x="${x}" y="${y}" font-family="${o.fam || "Inter"}" font-size="${o.tam || 28}" font-weight="${o.peso || 400}" fill="${o.color || C.texto}" text-anchor="${o.ancla || "start"}">${esc(s)}</text>`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><radialGradient id="g" cx="80%" cy="0%" r="90%"><stop offset="0" stop-color="#10202a"/><stop offset="1" stop-color="${C.fondo}"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${C.ambar}"/>`;
  s += t(W / 2, 100, "RELATOS DE LA MITAD", { fam: "Cinzel", tam: 50, peso: 700, color: C.ambar, ancla: "middle" });
  s += t(W / 2, 150, `Resumen del ${fecha}`, { tam: 30, color: C.tenue, ancla: "middle" });
  // Calificación del día
  s += `<rect x="${W / 2 - 220}" y="185" width="440" height="72" rx="36" fill="${nivel.c}" fill-opacity="0.16" stroke="${nivel.c}" stroke-width="3"/>`;
  s += t(W / 2, 233, nivel.t, { tam: 36, peso: 800, color: nivel.c, ancla: "middle" });
  // Total del día
  s += t(W / 2, 395, num(r.total_hoy), { tam: 130, peso: 800, ancla: "middle" });
  s += t(W / 2, 445, "vistas hoy sumando las 3 redes", { tam: 30, color: C.tenue, ancla: "middle" });
  s += t(W / 2, 492, r.comparacion, { tam: 26, peso: 700, color: nivel.c, ancla: "middle" });
  // Una tarjeta por red
  REDES.forEach(([k, n], i) => {
    const x = 60 + i * 330, y = 535, dif = (r.seguidores[k] || 0) - (r.seguidores_7[k] ?? r.seguidores[k] ?? 0);
    s += `<rect x="${x}" y="${y}" width="300" height="215" rx="22" fill="${C.panel}" stroke="${C.borde}" stroke-width="2"/><rect x="${x}" y="${y}" width="300" height="7" rx="3" fill="${(C as Record<string, string>)[k]}"/>`;
    s += t(x + 26, y + 56, n, { tam: 30, peso: 700, color: (C as Record<string, string>)[k] });
    s += t(x + 26, y + 125, num(r.vistas_hoy[k]), { tam: 62, peso: 800 });
    s += t(x + 26, y + 158, "vistas hoy", { tam: 22, color: C.tenue });
    s += t(x + 26, y + 194, `${num(r.seguidores[k] || 0)} seguidores${dif ? ` (${dif > 0 ? "+" : ""}${num(dif)} en 7 d)` : ""}`, { tam: 20, color: C.texto });
  });
  // Últimos 8 días (barras apiladas por red; la última es hoy)
  const dias = [...r.historial.map((d) => ({ dia: String(d.dia), youtube: +d.youtube || 0, tiktok: +d.tiktok || 0, facebook: +d.facebook || 0 })), { dia: r.dia, youtube: r.vistas_hoy.youtube || 0, tiktok: r.vistas_hoy.tiktok || 0, facebook: r.vistas_hoy.facebook || 0 }];
  const max = Math.max(1, ...dias.map((d) => d.youtube + d.tiktok + d.facebook)), gx = 90, gy = 840, gh = 210, ancho = 900 / dias.length;
  s += t(60, 815, "Vistas por día", { tam: 28, peso: 700 });
  s += t(1020, 815, "YouTube · TikTok · Facebook", { tam: 20, color: C.tenue, ancla: "end" });
  dias.forEach((d, i) => {
    let base = gy + gh;
    const x = gx + i * ancho + ancho * 0.18, w = ancho * 0.64;
    for (const k of ["youtube", "tiktok", "facebook"] as const) {
      const h = ((d[k] || 0) / max) * gh;
      if (h > 0.5) { base -= h; s += `<rect x="${x}" y="${base}" width="${w}" height="${h}" fill="${C[k]}" fill-opacity="${i === dias.length - 1 ? 1 : 0.75}"/>`; }
    }
    const tot = d.youtube + d.tiktok + d.facebook;
    s += t(x + w / 2, base - 10, tot ? num(tot) : "", { tam: 18, peso: 700, color: i === dias.length - 1 ? C.ambar : C.tenue, ancla: "middle" });
    const etq = i === dias.length - 1 ? "HOY" : new Date(`${d.dia}T12:00:00Z`).toLocaleDateString("es-EC", { day: "numeric", month: "short", timeZone: "UTC" });
    s += t(x + w / 2, gy + gh + 32, etq, { tam: 18, peso: i === dias.length - 1 ? 800 : 400, color: i === dias.length - 1 ? C.ambar : C.tenue, ancla: "middle" });
  });
  // Lo más visto
  s += t(60, 1150, "Lo más visto en 24 horas", { tam: 28, peso: 700 });
  r.top.slice(0, 3).forEach((v, i) => {
    const y = 1195 + i * 46, nom = REDES.find(([k]) => k === v.red)?.[1] || v.red;
    s += t(60, y, `${i + 1}.`, { tam: 26, peso: 800, color: C.ambar });
    s += t(100, y, corto(v.titulo, 44), { tam: 26 });
    s += t(1020, y, `${nom} +${num(v.ritmo)}`, { tam: 24, peso: 700, color: (C as Record<string, string>)[v.red] || C.tenue, ancla: "end" });
  });
  // Recomendación
  s += `<rect x="60" y="${by}" width="960" height="${70 + lin.length * 34}" rx="20" fill="${C.ambar}" fill-opacity="0.1" stroke="${C.ambar}" stroke-opacity="0.5" stroke-width="2"/>`;
  s += t(88, by + 40, "RECOMENDACIÓN", { tam: 20, peso: 800, color: C.ambar });
  lin.forEach((l, i) => { s += t(88, by + 78 + i * 34, l, { tam: 25 }); });
  return s + "</svg>";
}

export async function pngResumen(r: Resumen) {
  listo ??= initWasm(wasm as WebAssembly.Module);
  await listo;
  const fontBuffers = [inter400, inter700, inter800, cinzel700].map((b) => new Uint8Array(b as ArrayBuffer));
  const png = new Resvg(svgResumen(r), { font: { fontBuffers, loadSystemFonts: false, defaultFontFamily: "Inter" }, fitTo: { mode: "width", value: 1080 } }).render().asPng();
  return png;
}
