// Resumen Ejecutivo de RELATOS AI GROUP: todo con datos reales del panel.
// Movimiento (personalidad "Premium"): entradas 450 ms con cubic-bezier(.4,0,.2,1), escalonadas ≤ 400 ms; cifras que cuentan;
// la oficina es un bucle de video hecho en Remotion; las etiquetas de los agentes reflejan su estado real cada 15 s.
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const ZONA = "America/Guayaquil";
const n0 = (n) => Number(n || 0).toLocaleString("es-EC");
const usd = (n) => "$" + Number(n || 0).toFixed(2);

// Dónde está cada agente en la imagen de la oficina (% del ancho y alto).
export const PUESTOS = { ryan: [11, 55], kelly: [24.5, 46], andy: [29.5, 63, "abajo"], sentinel: [49.6, 37], michael: [50.3, 48], angela: [66.5, 49], oscar: [72.5, 64, "abajo"], pam: [74.5, 44], dwight: [81, 37], jim: [91, 55] };
const ICONO = { michael: "♛", sentinel: "⛨", andy: "⌕", oscar: "▥", ryan: "✎", kelly: "✺", jim: "▶", dwight: "✓", pam: "➚", angela: "$" };
const EST = { disponible: "Disponible", investigando: "Investigando", analizando: "Analizando", escribiendo: "Escribiendo", produciendo: "Produciendo", renderizando: "Renderizando", revisando: "Revisando", coordinando: "Coordinando", pausa: "En pausa", error: "Error" };
const trabajando = (a) => a.activo && !["disponible", "pausa", "no-activado"].includes(a.estado);

/** Línea de tendencia (SVG) con relleno degradado. */
function chispa(valores, color, id) {
  const v = valores.filter((x) => Number.isFinite(x));
  if (v.length < 2) return `<svg class="chispa" viewBox="0 0 100 32"></svg>`;
  const min = Math.min(...v), max = Math.max(...v), r = max - min || 1;
  const pts = v.map((x, i) => [(i / (v.length - 1)) * 100, 28 - ((x - min) / r) * 24]);
  const linea = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return `<svg class="chispa" viewBox="0 0 100 32" preserveAspectRatio="none"><defs><linearGradient id="g${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    <path d="${linea} L100,32 L0,32 Z" fill="url(#g${id})"/><path d="${linea}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" class="trazo"/></svg>`;
}

function diasAlCorte() {
  const h = new Date(Date.now() - 5 * 3600e3); // hora de Ecuador
  return Math.max(1, Math.ceil((Date.UTC(h.getUTCFullYear(), h.getUTCMonth() + 1, 1) - h.getTime()) / 86400000));
}

function hace(cuando) {
  const t = Date.parse(cuando.includes("T") ? cuando : cuando.replace(" ", "T") + "Z");
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? "ahora" : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : `hace ${Math.round(m / 1440)} d`;
}

export function etiquetasHtml(agentes, elegido = null) {
  return agentes.filter((a) => PUESTOS[a.id] && a.activo).map((a) => {
    const [x, y, lado] = PUESTOS[a.id], vivo = trabajando(a);
    return `<button class="etiqueta ${lado || ""} ${a.id === elegido ? "elegida" : ""} ${vivo ? "viva" : ""} ${a.estado === "error" ? "falla" : ""}" data-charlar="${esc(a.id)}" title="${esc(a.nombre + " · " + a.cargo)}" style="left:${x}%;top:${y}%">
      <span class="eti-icono">${ICONO[a.id] || "•"}</span><span class="eti-txt"><b>${esc(a.nombre)}</b>${vivo ? `<small>${esc(EST[a.estado] || a.estado)}${a.tarea_titulo ? " · " + esc(a.tarea_titulo) : ""}</small>` : a.abiertas ? `<small class="pend">📥 ${a.abiertas} pendiente${a.abiertas > 1 ? "s" : ""}</small>` : ""}</span>
      <i class="eti-punto"></i></button>`;
  }).join("");
}

export function escenaHtml(agentes, grande = false) {
  return `<div class="hero ${grande ? "grande" : ""}">
      <div class="escena-mov">
        <video data-oficina src="/oficina.mp4" poster="/oficina.jpg" muted loop playsinline preload="metadata" aria-hidden="true"></video>
        <img class="escena-hd" alt="" data-src="/oficina-hd.jpg" decoding="async" aria-hidden="true">
        <div class="hero-marca" aria-hidden="true"><img src="/icono.png" alt=""><div><b>RELATOS</b><span>AI MEDIA AGENCY</span></div></div>
        <div class="etiquetas" id="etiquetas">${etiquetasHtml(agentes)}</div>
      </div>
      <div class="vuelos" aria-hidden="true"></div>
      <aside class="chat" id="chat" hidden aria-label="Chat con el agente"></aside>
      ${grande ? "" : `<a href="#oficina" class="hero-link">Ver oficina completa →</a>`}
    </div>`;
}

/** "Si seguimos así": cuánto crecemos por semana en cada red (estimación del equipo con la tendencia de 14 días). */
export function proyeccionHtml(p) {
  if (!p) return "";
  const RED = { facebook: ["Facebook", "f", "#3b82f6"], youtube: ["YouTube", "▶", "#ef4444"], tiktok: ["TikTok", "♪", "#2dd4bf"] };
  const signo = (n) => (n > 0 ? "+" : "");
  return `<section class="proy rev"><div class="proy-cab"><b>📈 Si seguimos así</b><span>Estimación de Oscar con la tendencia de los últimos 14 días · se recalcula sola</span></div>
    <div class="proy-redes">${p.map((x) => { const [n, ic, col] = RED[x.red]; return `<div class="proy-red" style="--c:${col}"><span class="red-ico">${ic}</span>
      <div><small>${n}</small><b><span data-k="p-${x.red}" data-contar="${x.seguidores_semana}" data-fmt="s">0</span><em> ${x.red === "youtube" ? "suscriptores" : "seguidores"}/semana</em></b>
      <p>≈ <span data-k="p4-${x.red}" data-contar="${x.en_4_semanas ?? ""}" data-fmt="n">0</span> en 4 semanas · <span data-k="pv-${x.red}" data-contar="${x.vistas_semana}" data-fmt="n">0</span> vistas/semana</p>
      <i class="conf ${x.confianza}">confianza ${x.confianza} · ${x.dias} días</i></div></div>`; }).join("")}</div></section>`;
}

export function actividadHtml(lista, vistos) {
  const TIPO = { agente: "◉", persona: "◆", sistema: "●" };
  return lista.slice(0, 9).map((a) => {
    const clave = a.cuando + a.texto;
    const nuevo = vistos && !vistos.has(clave);
    return `<li class="${esc(a.nivel)} ${nuevo ? "nuevo" : ""}" data-clave="${esc(clave)}"><span class="act-ico t-${esc(a.tipo)}">${TIPO[a.tipo] || "●"}</span><div><p>${esc(a.texto)}</p><small>${esc(hace(a.cuando))} · ${esc(a.division || "grupo")}</small></div></li>`;
  }).join("");
}

export function inicioHtml(d) {
  const { resumen, crec, serie, pres, agentes, grupo, historias } = d;
  const red = (r) => resumen.cuentas[r] || {};
  const seg = (r) => red(r).ultimo?.seguidores ?? null;
  const delta = (r) => (seg(r) != null && red(r).seguidores_7d != null ? seg(r) - red(r).seguidores_7d : null);
  const pct = (r) => (delta(r) != null && red(r).seguidores_7d ? (delta(r) / red(r).seguidores_7d) * 100 : null);
  const serieSeg = (r) => crec.cuentas.filter((c) => c.red === r).slice(-14).map((c) => c.seguidores);
  // Vistas nuevas por día y red (de nuestros videos): diferencia del acumulado diario.
  const vistasDia = (r) => { const s = serie.filter((x) => x.red === r).map((x) => x.vistas || 0); return s.slice(1).map((v, i) => Math.max(0, v - s[i])).slice(-14); };
  const sum7 = (r) => vistasDia(r).slice(-7).reduce((a, b) => a + b, 0);
  const prev7 = (r) => vistasDia(r).slice(-14, -7).reduce((a, b) => a + b, 0);
  const rel = grupo.divisiones.find((x) => x.id === "relatos") || {};
  const porDia = (rel.publicados_7d || 0) / 7;
  const usadoPct = pres.limites.total ? Math.min(100, (pres.usado / pres.limites.total) * 100) : 0;
  const kpi = (cls, icono, valor, etiqueta, pie, chis, fmt = "n") => `<div class="kpi-c ${cls} rev"><span class="kpi-ico">${icono}</span>
      <div><b data-k="${cls}" data-contar="${valor ?? ""}" data-fmt="${fmt}">${valor == null ? "—" : fmt === "usd" ? usd(0) : "0"}</b><small>${etiqueta}</small>${pie}</div>${chis || ""}</div>`;
  const flecha = (d0, p) => d0 == null ? `<em class="neutro">sin dato de 7 días</em>` : `<em class="${d0 >= 0 ? "sube" : "baja"}">${d0 >= 0 ? "↑" : "↓"} ${d0 >= 0 ? "+" : ""}${n0(d0)}${p != null ? ` (${p >= 0 ? "+" : ""}${Math.abs(p) < 10 ? p.toFixed(1) : p.toFixed(0)}%)` : ""} · 7 días</em>`;
  const ORDEN = ["idea", "guion", "voz", "imagenes", "render", "listo"], AVANCE = { idea: 10, guion: 25, voz: 45, imagenes: 60, render: 80, listo: 100 }, NOM = { idea: "Idea", guion: "Guion", voz: "Voz", imagenes: "Imágenes", render: "Render", listo: "Listo para salir" };
  const proyectos = historias.filter((h) => h.estado !== "publicado").sort((a, b) => (a.semana || "").localeCompare(b.semana || "")).slice(0, 4);
  const redes = [["facebook", "Facebook", "f", "var(--fb)"], ["youtube", "YouTube", "▶", "var(--yt)"], ["tiktok", "TikTok", "♪", "var(--tt)"]];

  return `
  <div class="kpis">
    ${kpi("fb", "f", seg("facebook"), "Seguidores Facebook", flecha(delta("facebook"), pct("facebook")), chispa(serieSeg("facebook"), "#3b82f6", "fb"))}
    ${kpi("yt", "▶", seg("youtube"), "Suscriptores YouTube", flecha(delta("youtube"), pct("youtube")), chispa(serieSeg("youtube"), "#ef4444", "yt"))}
    ${kpi("tt", "♪", seg("tiktok"), "Seguidores TikTok", flecha(delta("tiktok"), pct("tiktok")), chispa(serieSeg("tiktok"), "#2dd4bf", "tt"))}
    ${kpi("vd", "▶", Math.round(porDia * 10) / 10, "Publicaciones al día", `<em class="neutro">${n0(rel.publicados_7d)} en 7 días · ${n0(rel.agenda)} en agenda</em>`, "", "d1")}
    ${kpi("gs", "◉", pres.usado, "Gasto del mes", `<em class="neutro">hoy ${usd(pres.hoy)} · proyección ${usd(pres.proyeccion)}</em>`, "", "usd")}
    ${kpi("dp", "⛨", pres.disponible, "Disponible", `<div class="barra-p"><span style="width:${(100 - usadoPct).toFixed(1)}%"></span></div>`, "", "usd")}
  </div>

  ${proyeccionHtml(d.proyeccion)}
  <p class="fuente-datos" id="fuente-datos">Seguidores y vistas: datos oficiales de Facebook, YouTube y TikTok · última lectura ${resumen.ultima_sync ? esc(hace(resumen.ultima_sync)) : "pendiente"} <button type="button" id="sync-ahora">↻ Actualizar ahora</button></p>
  <section class="escenario rev">
    ${escenaHtml(agentes.agentes)}
    <aside class="feed">
      <h3><span class="vivo"></span>Actividad en tiempo real <a href="#grupo">Ver todo →</a></h3>
      <ul id="feed">${actividadHtml(grupo.actividad, null)}</ul>
    </aside>
  </section>

  <div class="fila3">
    <div class="tarjeta proyectos rev"><h3>★ Proyectos en proceso <a href="#historias">Ver todos →</a></h3>
      ${proyectos.length ? `<ol>${proyectos.map((h, i) => `<li><span class="num">${i + 1}</span><img src="/api/medio/${encodeURIComponent(h.id + "/miniatura.jpg")}" alt="" loading="lazy">
        <div><b>${esc(h.titulo)}</b><small>${esc(NOM[h.estado] || h.estado)} · ${AVANCE[h.estado] ?? 0}%${h.semana ? " · sale " + esc(new Date(h.semana + "T12:00:00-05:00").toLocaleDateString("es-EC", { day: "numeric", month: "short" })) : ""}</small>
        <div class="barra-p"><span style="width:${AVANCE[h.estado] ?? 0}%"></span></div></div></li>`).join("")}</ol>` : `<div class="vacio">No hay historias en producción.</div>`}
    </div>
    <div class="tarjeta rendimiento rev"><h3>▥ Rendimiento por plataforma <span class="nd">vistas nuevas · 7 días</span></h3>
      <div class="redes3">${redes.map(([r, nom, ic, col]) => { const a = sum7(r), b = prev7(r), v = b ? ((a - b) / b) * 100 : null;
        return `<div class="red-col" style="--c:${col}"><span class="red-ico">${ic}</span><small>${nom}</small><b data-k="r-${r}" data-contar="${a}" data-fmt="n">0</b>
          ${v == null ? `<em class="neutro">sin semana previa</em>` : `<em class="${v >= 0 ? "sube" : "baja"}">${v >= 0 ? "↑ +" : "↓ "}${v.toFixed(0)}%</em>`}${chispa(vistasDia(r), col.includes("fb") ? "#3b82f6" : col.includes("yt") ? "#ef4444" : "#2dd4bf", "r" + r)}</div>`; }).join("")}</div>
    </div>
    <div class="tarjeta finanzas rev"><h3>$ Resumen financiero <a href="#presupuesto">Ver detalle →</a></h3>
      <div class="fin">
        <svg viewBox="0 0 120 120" class="anillo"><circle cx="60" cy="60" r="50" class="pista"/><circle cx="60" cy="60" r="50" class="valor" style="--p:${usadoPct.toFixed(1)}"/>
          <text x="60" y="66" text-anchor="middle">${usadoPct.toFixed(0)}%</text></svg>
        <div><small>Presupuesto mensual</small><b>${usd(pres.usado)} <span class="nd">/ ${usd(pres.limites.total)}</span></b>
          <div class="barra-p"><span style="width:${usadoPct.toFixed(1)}%"></span></div>
          <small>${pres.estimado ? usd(pres.estimado) + " estimados (precio de lista) · " : ""}el mes se reinicia en ${diasAlCorte()} días</small></div>
      </div>
    </div>
  </div>`;
}

/** Cifras que cuentan desde 0 (700 ms, desaceleración). */
export function contar(raiz, previos = {}) {
  const fmt = (v, f) => (f === "usd" ? usd(v) : f === "d1" ? v.toFixed(1) : f === "s" ? (Math.round(v) > 0 ? "+" : "") + n0(Math.round(v)) : n0(Math.round(v)));
  raiz.querySelectorAll("[data-contar]").forEach((el) => {
    const fin = parseFloat(el.dataset.contar);
    if (!Number.isFinite(fin)) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fmt(fin, el.dataset.fmt); return; }
    const ini = previos[el.dataset.k] ?? 0;
    if (ini === fin) { el.textContent = fmt(fin, el.dataset.fmt); return; }
    const t0 = performance.now(), dur = 700;
    const paso = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(ini + (fin - ini) * e, el.dataset.fmt); if (k < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  });
}

export function reloj() {
  const ahora = new Date();
  const r = document.getElementById("reloj");
  if (!r) return;
  r.querySelector("b").textContent = ahora.toLocaleTimeString("es-EC", { timeZone: ZONA, hour: "2-digit", minute: "2-digit" });
  r.querySelector("small").textContent = ahora.toLocaleDateString("es-EC", { timeZone: ZONA, weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}
