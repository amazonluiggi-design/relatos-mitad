// Panel de Relatos Autopilot. Todo el texto que viene de la base se escapa antes de pintarse.
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const ZONA = "America/Guayaquil";
const fecha = (iso, op) => new Date(iso).toLocaleString("es-EC", { timeZone: ZONA, ...op });
const num = (n) => (n === null || n === undefined ? null : Number(n).toLocaleString("es-EC"));
const REDES = { facebook: { nombre: "Facebook", c: "var(--fb)", i: "f" }, youtube: { nombre: "YouTube", c: "var(--yt)", i: "▶" }, tiktok: { nombre: "TikTok", c: "var(--tt)", i: "♪" } };
const ESTADO = { "por-aprobar": "Por aprobar", "por-programar": "Por aprobar", pendiente: "En agenda", programado: "Programado", enviado: "Enviando", publicado: "Publicado", privado: "Privado", fallido: "Falló" };
const TITULOS = { resumen: "Resumen", crecimiento: "Crecimiento", historias: "Historias", animar: "Animar", agenda: "Agenda", videos: "Videos", facebook: "Facebook", youtube: "YouTube", tiktok: "TikTok", actividad: "Actividad" };

async function api(ruta, op = {}) {
  const r = await fetch("/api" + ruta, { ...op, headers: { "Content-Type": "application/json", ...(op.headers || {}) } });
  if (r.status === 401) { mostrarLogin(); throw new Error("sin sesión"); }
  return r.json();
}

/* ───── Sesión: contraseña → código MFA (o alta del autenticador) ───── */
const PASOS = { login: "#form-login", codigo: "#form-codigo", enrolar: "#form-enrolar", codigos: "#paso-codigos" };
function mostrarLogin(paso = "login", error = "") {
  $("#app").hidden = true; $("#casa").hidden = true; $("#login").hidden = false;
  for (const [k, sel] of Object.entries(PASOS)) $(sel).hidden = k !== paso;
  $("#login-error").textContent = error;
  const foco = { login: "#correo", codigo: "#codigo", enrolar: "#codigo-nuevo" }[paso];
  if (foco) setTimeout(() => $(foco).focus(), 0);
}
async function post(ruta, cuerpo) {
  const r = await fetch("/api" + ruta, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo || {}) });
  return { ok: r.ok, status: r.status, ...(await r.json().catch(() => ({}))) };
}
function ocupado(form, si) { const b = form.querySelector("button[type=submit]"); if (b) b.disabled = si; }
const sesionVencida = (r) => r.status === 401 && /venció/.test(r.error || "");

$("#form-login").addEventListener("submit", async (e) => {
  e.preventDefault(); ocupado(e.target, true); $("#login-error").textContent = "";
  try {
    const r = await post("/login", { correo: $("#correo").value, clave: $("#clave").value });
    if (!r.ok) { $("#login-error").textContent = r.error || "No se pudo entrar."; return; }
    $("#clave").value = "";
    if (r.paso === "codigo") return mostrarLogin("codigo");
    const m = await fetch("/api/mfa/enrolar").then((x) => x.json());
    if (m.error) return mostrarLogin("login", m.error);
    $("#qr").innerHTML = m.qr; // SVG generado por nuestro servidor
    $("#secreto").textContent = m.secreto;
    mostrarLogin("enrolar");
  } catch { $("#login-error").textContent = "Sin conexión con el servidor."; } finally { ocupado(e.target, false); }
});
$("#ver-clave").addEventListener("click", (e) => {
  const ver = $("#clave").type === "password";
  $("#clave").type = ver ? "text" : "password";
  e.currentTarget.textContent = ver ? "Ocultar" : "Ver";
  e.currentTarget.setAttribute("aria-pressed", String(ver));
  e.currentTarget.setAttribute("aria-label", ver ? "Ocultar contraseña" : "Mostrar contraseña");
});
$("#form-codigo").addEventListener("submit", async (e) => {
  e.preventDefault(); ocupado(e.target, true);
  try {
    const r = await post("/mfa/verificar", { codigo: $("#codigo").value });
    $("#codigo").value = "";
    if (sesionVencida(r)) return mostrarLogin("login", r.error);
    if (!r.ok) { $("#login-error").textContent = r.error; return; }
    entrar();
  } finally { ocupado(e.target, false); }
});
$("#form-enrolar").addEventListener("submit", async (e) => {
  e.preventDefault(); ocupado(e.target, true);
  try {
    const r = await post("/mfa/activar", { codigo: $("#codigo-nuevo").value });
    $("#codigo-nuevo").value = "";
    if (sesionVencida(r)) return mostrarLogin("login", r.error);
    if (!r.ok) { $("#login-error").textContent = r.error; return; }
    $("#codigos").innerHTML = r.codigos.map((c) => `<li><code>${esc(c.replace(/(.{5})/, "$1-"))}</code></li>`).join("");
    $("#copiar-codigos").onclick = async () => { await navigator.clipboard.writeText(r.codigos.join("\n")); $("#copiar-codigos").textContent = "✓ Copiados"; };
    mostrarLogin("codigos");
  } finally { ocupado(e.target, false); }
});
$("#codigos-listo").addEventListener("click", () => { $("#codigos").innerHTML = ""; entrar(); });
document.addEventListener("click", async (e) => {
  if (!e.target.closest("[data-salir]")) return;
  await fetch("/api/salir", { method: "POST" }); datos.resumen = null; mostrarLogin();
});
function conexion() { const c = $("#conexion"); c.classList.toggle("fuera", !navigator.onLine); c.querySelector("b").textContent = navigator.onLine ? "Conectado" : "Sin conexión"; }
addEventListener("online", conexion); addEventListener("offline", conexion); conexion();

/* ───── Datos ───── */
let datos = { resumen: null, pubs: [], serie: [], historias: [], animaciones: [], crec: { cuentas: [], pubs: [], recomendaciones: [] } };
async function cargar() {
  const [resumen, pubs, serie, historias, animaciones, crec] = await Promise.all([api("/resumen"), api("/publicaciones"), api("/serie"), api("/historias"), api("/animaciones"), api("/crecimiento")]);
  datos = { resumen, pubs, serie, historias, animaciones, crec };
  $("#pausa").checked = resumen.pausa;
  $("#pausa-txt").textContent = resumen.pausa ? "Automático en PAUSA" : "Automático activo";
  $("#sync").textContent = resumen.ultima_sync ? `Estadísticas actualizadas ${fecha(resumen.ultima_sync, { dateStyle: "short", timeStyle: "short" })}` : "Las estadísticas se actualizan cada hora";
}

/* ───── Piezas ───── */
const chip = (p) => `<span class="chip ${esc(p.red)} ${esc(p.estado)}">${esc(REDES[p.red].nombre)} · ${esc(ESTADO[p.estado] || p.estado)}</span>`;
const nd = `<span class="nd">sin datos aún</span>`;

function tarjetaRed(red, c) {
  const r = REDES[red], u = c.ultimo || {};
  const seg = u.seguidores, delta = seg != null && c.seguidores_7d != null ? seg - c.seguidores_7d : null;
  return `<a class="tarjeta red-tarjeta" href="#${red}" style="--c:${r.c}">
    <div class="red-cab"><span class="red-icono">${r.i}</span>${r.nombre}</div>
    <div class="cifra">${seg != null ? num(seg) : "—"}<small>${red === "youtube" ? "suscriptores" : "seguidores"}</small></div>
    <div class="delta">${delta != null ? (delta >= 0 ? "+" : "") + num(delta) + " en 7 días" : "&nbsp;"}</div>
    <div class="mini">
      <div><b>${c.vistas != null ? num(c.vistas) : "—"}</b>vistas</div>
      <div><b>${num(c.pub || 0)}</b>publicados</div>
      <div><b>${num(c.prox || 0)}</b>en agenda</div>
    </div></a>`;
}

// Agrupa publicaciones por video para la agenda.
function porVideo(pubs) {
  const m = new Map();
  for (const p of pubs) {
    const k = p.video_id;
    if (!m.has(k)) m.set(k, { ...p, redes: [] });
    m.get(k).redes.push(p);
  }
  return [...m.values()].sort((a, b) => a.cuando.localeCompare(b.cuando));
}

function itemAgenda(v) {
  return `<div class="item">
    <div class="item-fecha"><b>${esc(fecha(v.cuando, { day: "2-digit" }))}</b>${esc(fecha(v.cuando, { month: "short" }))}<br>${esc(fecha(v.cuando, { hour: "2-digit", minute: "2-digit" }))}</div>
    <div class="item-txt"><b>${esc(v.titulo)}</b><span class="nd">${esc(TIPO[v.tipo] || "Reel")} · ${esc(v.historia_id)}</span>
      <div class="chips">${v.redes.map(chip).join("")}</div></div></div>`;
}


const eventosHtml = (ev) => ev.length ? ev.map((e) => `<div class="evento"><span class="punto ${esc(e.nivel)}"></span><div>${esc(e.mensaje)}<time>${esc(fecha(e.cuando.replace(" ", "T") + "Z", { dateStyle: "short", timeStyle: "short" }))}${e.red ? " · " + esc(REDES[e.red]?.nombre || e.red) : ""}</time></div></div>`).join("") : `<div class="vacio">Sin actividad todavía.</div>`;

/* ───── Crecimiento: análisis automático + plan ───── */
const TIPO = { largo: "Video largo", reel: "Reel", parte: "Parte (TikTok)", episodio: "Episodio" };
const mediana = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0; };
const pct = (n) => (n == null || !isFinite(n) ? "—" : (n * 100).toLocaleString("es-EC", { maximumFractionDigits: 1 }) + " %");

function analizar(crec) {
  const pubs = crec.pubs.map((p) => ({ ...p, extra: p.extra ? JSON.parse(p.extra) : null, vistas: p.vistas ?? 0, inter: (p.me_gusta || 0) + (p.comentarios || 0) + (p.compartidos || 0) }));
  for (const p of pubs) {
    const grupo = pubs.filter((q) => q.red === p.red && q.tipo === p.tipo).map((q) => q.vistas);
    const m = mediana(grupo);
    p.rel = m > 0 ? p.vistas / m : null;
    p.estadoRend = p.rel == null || grupo.length < 2 ? ["nuevo", "Midiendo"] : p.rel >= 2 ? ["top", "Destaca"] : p.rel >= 0.9 ? ["bien", "Bien"] : p.rel >= 0.5 ? ["normal", "Normal"] : ["bajo", "Bajo"];
    p.ritmo = p.vistas_24h != null ? p.vistas - p.vistas_24h : null;
    p.engage = p.vistas > 0 ? p.inter / p.vistas : null;
  }
  const porRed = {};
  for (const r of Object.keys(REDES)) {
    const l = pubs.filter((p) => p.red === r);
    const vistas = l.reduce((a, p) => a + p.vistas, 0);
    porRed[r] = { l, vistas, prom: l.length ? vistas / l.length : 0, inter: l.reduce((a, p) => a + p.inter, 0), ritmo: l.reduce((a, p) => a + (p.ritmo || 0), 0) };
  }
  const total = Object.values(porRed).reduce((a, r) => a + r.vistas, 0);
  const ultimo = (red) => [...crec.cuentas].reverse().find((c) => c.red === red) || {};
  const hace = (red, dias) => { const lim = new Date(Date.now() - dias * 864e5).toISOString().slice(0, 10); return [...crec.cuentas].reverse().find((c) => c.red === red && c.dia <= lim) || crec.cuentas.find((c) => c.red === red) || {}; };

  // Hallazgos automáticos a partir de los números.
  const h = [];
  const top = [...pubs].sort((a, b) => b.vistas - a.vistas)[0];
  if (top && top.vistas > 0) h.push(["top", `Tu mejor video es <b>${esc(top.titulo)}</b> en ${REDES[top.red].nombre}: ${num(top.vistas)} vistas${top.engage ? ` y ${pct(top.engage)} de interacción` : ""}. Ese tipo de gancho es el que hay que repetir.`]);
  if (total > 0) {
    const [red, x] = Object.entries(porRed).sort((a, b) => b[1].vistas - a[1].vistas)[0];
    h.push(["red", `<b>${REDES[red].nombre}</b> trae el ${pct(x.vistas / total)} de todas tus vistas (${num(x.vistas)} de ${num(total)}).`]);
  }
  const yt = porRed.youtube.l;
  const vS = yt.filter((p) => p.tipo !== "largo").reduce((a, p) => a + p.vistas, 0), vL = yt.filter((p) => p.tipo === "largo").reduce((a, p) => a + p.vistas, 0);
  if (vS > 50 && vL < vS * 0.1) h.push(["aviso", `En YouTube los Shorts suman ${num(vS)} vistas y los videos largos solo ${num(vL)}. Los Shorts atraen gente, pero casi nadie pasa a la historia completa: hay que conectarlos con el video largo.`]);
  const fb = porRed.facebook, segFb = ultimo("facebook").seguidores;
  if (fb.l.length >= 3 && segFb && fb.prom < segFb * 0.01) h.push(["aviso", `Facebook tiene ${num(segFb)} seguidores pero cada video promedia ${num(Math.round(fb.prom))} vistas (menos del 1 %). Los seguidores actuales llegaron por otro tipo de contenido; el alcance tiene que venir de gente nueva.`]);
  const seg = fb.l.map((p) => p.extra?.seg_medio).filter((x) => x != null);
  if (seg.length) h.push(["info", `En Facebook la gente mira en promedio ${mediana(seg).toLocaleString("es-EC")} segundos de cada video. Mientras más alto, más lo recomienda Facebook.`]);
  const tt = porRed.tiktok;
  if (tt.l.length >= 3 && tt.prom < 20) h.push(["aviso", `TikTok promedia ${num(Math.round(tt.prom))} vistas por video. Es lo normal en cuentas recién creadas: TikTok todavía está aprendiendo a quién mostrárselos.`]);
  const vistos = pubs.filter((p) => p.vistas > 0);
  if (vistos.length && vistos.every((p) => !p.comentarios)) h.push(["aviso", "Ninguna publicación tiene comentarios aún. Los comentarios son la señal que más empuja el alcance en las 3 redes."]);
  const best = Object.entries(porRed).filter(([, r]) => r.vistas >= 50).sort((a, b) => b[1].inter / b[1].vistas - a[1].inter / a[1].vistas)[0];
  if (best) h.push(["info", `La mejor interacción (me gusta, comentarios y compartidos por vista) está en <b>${REDES[best[0]].nombre}</b>: ${pct(best[1].inter / best[1].vistas)}.`]);
  return { pubs, porRed, total, ultimo, hace, hallazgos: h };
}

function metas(a) {
  const yt = a.ultimo("youtube"), tt = a.ultimo("tiktok"), fb = a.ultimo("facebook");
  const shorts = a.porRed.youtube.l.filter((p) => p.tipo !== "largo").reduce((s, p) => s + p.vistas, 0);
  const fila = (txt, v, meta, c) => `<div class="meta-fila"><div><span>${txt}</span><b>${num(v || 0)} / ${num(meta)}</b></div>
    <div class="meta-barra"><i style="width:${Math.min(100, ((v || 0) / meta) * 100).toFixed(2)}%;background:${c}"></i></div></div>`;
  return `<div class="rejilla r3 metas">
    <div class="tarjeta"><h3><span class="red-icono" style="--c:var(--yt)">▶</span> Monetizar YouTube</h3>
      ${fila("Suscriptores (primer nivel)", yt.seguidores, 500, "var(--yt)")}
      ${fila("Suscriptores (anuncios)", yt.seguidores, 1000, "var(--yt)")}
      ${fila("Vistas de Shorts (90 días)", shorts, 3000000, "var(--yt)")}
      <p class="nd">Programa de socios: 500 suscriptores y 3 millones de vistas de Shorts en 90 días para el primer nivel; 1.000 y 10 millones para ganar con anuncios.</p></div>
    <div class="tarjeta"><h3><span class="red-icono" style="--c:var(--tt)">♪</span> Monetizar TikTok</h3>
      ${fila("Seguidores", tt.seguidores, 10000, "var(--tt)")}
      ${fila("Vistas (30 días)", a.porRed.tiktok.vistas, 100000, "var(--tt)")}
      <p class="nd">Programa de recompensas: 10.000 seguidores, 100.000 vistas en 30 días y videos de más de 1 minuto (las partes ya cumplen).</p></div>
    <div class="tarjeta"><h3><span class="red-icono" style="--c:var(--fb)">f</span> Facebook</h3>
      ${fila("Seguidores (próxima meta)", fb.seguidores, 5000, "var(--fb)")}
      <p class="nd">La página ya está monetizada. Ahora el objetivo es que los videos lleguen a gente nueva: con más vistas sube lo que paga Facebook.</p></div>
  </div>`;
}

function graficoSeguidores(cuentas) {
  // Una mini gráfica por red (cada una con su escala y sus números), para no mezclar 3.368 con 12.
  const dias = [...new Set(cuentas.map((c) => c.dia))].slice(-14);
  const fecha = (d) => new Date(d + "T12:00:00").toLocaleDateString("es-EC", { day: "numeric", month: "short" });
  return `<div class="seg-lista">${Object.entries(REDES).map(([red, x]) => {
    const s = dias.map((d) => ({ d, v: cuentas.find((c) => c.dia === d && c.red === red)?.seguidores })).filter((p) => p.v != null);
    if (!s.length) return "";
    const ult = s.at(-1).v, cambio = ult - s[0].v;
    const signo = cambio > 0 ? "sube" : cambio < 0 ? "baja" : "igual";
    const txt = (cambio > 0 ? "+" : cambio < 0 ? "−" : "±") + num(Math.abs(cambio)) + " en " + (s.length - 1) + " días";
    let svg = "";
    if (s.length >= 2) {
      const W = 300, H = 64, min = Math.min(...s.map((p) => p.v)), max = Math.max(...s.map((p) => p.v)), r = Math.max(1, max - min, max * 0.02), lo = min - (r - (max - min)) / 2;
      const pt = (p, i) => [(i / (s.length - 1)) * W, H - 6 - ((p.v - lo) / r) * (H - 12)];
      const pts = s.map(pt);
      const hits = s.map((p, i) => `<rect x="${pts[i][0] - W / s.length / 2}" y="0" width="${W / s.length}" height="${H}" fill="transparent"><title>${fecha(p.d)}: ${num(p.v)} seguidores</title></rect>`).join("");
      svg = `<svg class="seg-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Seguidores de ${x.nombre} por día">
        <polygon points="0,${H} ${pts.map((p) => p.join(",")).join(" ")} ${W},${H}" fill="${x.c}" opacity=".12"/>
        <polyline fill="none" stroke="${x.c}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" points="${pts.map((p) => p.join(",")).join(" ")}"/>${hits}</svg>
        <div class="seg-ejes"><span>${fecha(s[0].d)}</span><span>mín ${num(min)} · máx ${num(max)}</span><span>${fecha(s.at(-1).d)}</span></div>`;
    }
    return `<div class="seg-fila"><div class="seg-cab"><span><i style="background:${x.c}"></i>${x.nombre}</span><b>${num(ult)}</b><em class="${signo}">${txt}</em></div>${svg}</div>`;
  }).join("")}</div>`;
}

function recomendacionesHtml(todas) {
  if (!todas.length) return `<div class="vacio">Sin recomendaciones por ahora.</div>`;
  const pend = todas.filter((r) => r.estado !== "hecho"), hechas = todas.filter((r) => r.estado === "hecho");
  return `${pend.length ? recItems(pend) : `<div class="vacio">Todo al día: no hay nada pendiente.</div>`}
    ${hechas.length ? `<details class="rec-hechas"><summary>Ver las ${hechas.length} ya hechas</summary><div class="recs">${recItems(hechas)}</div></details>` : ""}`;
}
function recItems(lista) {
  const area = { contenido: "Contenido", youtube: "YouTube", facebook: "Facebook", tiktok: "TikTok", estrategia: "Estrategia" };
  return lista.map((r) => `<div class="rec ${esc(r.estado)}">
      <label class="rec-check" title="Marcar como hecho"><input type="checkbox" data-rec="${r.id}" ${r.estado === "hecho" ? "checked" : ""} aria-label="Hecho: ${esc(r.titulo)}"><span></span></label>
      <div><b>${esc(r.titulo)}</b>
        <div class="chips"><span class="chip prio-${esc(r.prioridad)}">Prioridad ${esc(r.prioridad)}</span><span class="chip">${esc(area[r.area] || r.area)}</span>
        <span class="chip ${r.quien === "usuario" ? "tu" : "yo"}">${r.quien === "usuario" ? "Te toca a ti" : "Lo hago yo"}</span></div>
        ${r.detalle ? `<p>${esc(r.detalle)}</p>` : ""}</div></div>`).join("");
}

/* ───── Crecimiento: vistas por día, mejor horario y próximos 7 días ───── */
function vistasPorDia(serie) {
  // La serie trae vistas ACUMULADAS por día y red: lo nuevo de cada día es la diferencia con el día anterior.
  const dias = [...new Set(serie.map((s) => s.dia))].sort().slice(-15);
  if (dias.length < 2) return `<div class="vacio">El gráfico aparece al juntar 2 días de datos.</div>`;
  const fechaCorta = (d) => new Date(d + "T12:00:00").toLocaleDateString("es-EC", { day: "numeric", month: "short" });
  return `<div class="seg-lista">${Object.entries(REDES).map(([red, x]) => {
    const acum = dias.map((d) => serie.find((s) => s.dia === d && s.red === red)?.vistas ?? null);
    const nuevas = acum.slice(1).map((v, i) => (v == null || acum[i] == null ? 0 : Math.max(0, v - acum[i])));
    const ds = dias.slice(1), max = Math.max(1, ...nuevas), hoy = nuevas.at(-1), mejor = nuevas.indexOf(Math.max(...nuevas));
    const barras = nuevas.map((v, i) => `<i style="height:${Math.max(2, (v / max) * 100).toFixed(1)}%;background:${x.c}" title="${fechaCorta(ds[i])}: ${num(v)} vistas"></i>`).join("");
    return `<div class="seg-fila"><div class="seg-cab"><span><i style="background:${x.c}"></i>${x.nombre}</span><b>${num(hoy)}</b><em>último día (en curso) · récord ${num(nuevas[mejor])} (${fechaCorta(ds[mejor])})</em></div>
      <div class="barras-dia" role="img" aria-label="Vistas nuevas por día en ${x.nombre}">${barras}</div>
      <div class="seg-ejes"><span>${fechaCorta(ds[0])}</span><span>vistas nuevas por día</span><span>${fechaCorta(ds.at(-1))}</span></div></div>`;
  }).join("")}</div>`;
}

const FRANJAS = [["mañana", "8:30", 0, 11], ["mediodía", "12:30–13:00", 11, 16], ["noche", "19:00–20:00", 16, 21.5], ["noche tarde", "22:00", 21.5, 24]];
function mejorHorario(pubs) {
  const hora = (p) => { const d = new Date(new Date(p.publicado_en || p.cuando).getTime() - 5 * 36e5); return d.getUTCHours() + d.getUTCMinutes() / 60; };
  const filas = Object.entries(REDES).map(([red, x]) => {
    const l = pubs.filter((p) => p.red === red && p.tipo !== "largo");
    const datosF = FRANJAS.map(([n, h, a, b]) => { const xs = l.filter((p) => hora(p) >= a && hora(p) < b).map((p) => p.vistas); return { n, h, prom: xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : null, cant: xs.length }; });
    const max = Math.max(1, ...datosF.map((f) => f.prom || 0)), top = datosF.filter((f) => f.prom != null).sort((p, q) => q.prom - p.prom)[0];
    return `<div class="horario"><div class="seg-cab"><span><i style="background:${x.c}"></i>${x.nombre}</span>${top ? `<em class="sube">mejor: ${top.n} (${top.h})</em>` : ""}</div>
      ${datosF.map((f) => `<div class="franja"><span>${f.n} <small>${f.h}</small></span><div class="meta-barra"><i style="width:${f.prom == null ? 0 : ((f.prom / max) * 100).toFixed(1)}%;background:${x.c}"></i></div><b>${f.prom == null ? "—" : num(Math.round(f.prom))}</b><small>${f.cant ? f.cant + " videos" : "sin datos"}</small></div>`).join("")}</div>`;
  }).join("");
  return `${filas}<p class="nd">Promedio de vistas de reels, Shorts y partes según la hora en que salieron (hora de Ecuador). Los videos más nuevos todavía están sumando.</p>`;
}

function proximosDias(lista) {
  if (!lista.length) return `<div class="vacio">No hay nada programado en los próximos 7 días.</div>`;
  const dia = (iso) => fecha(iso, { weekday: "long", day: "numeric", month: "short" });
  const grupos = {};
  for (const p of lista) (grupos[dia(p.cuando)] ||= []).push(p);
  return `<div class="proximos">${Object.entries(grupos).map(([d, l]) => {
    const faltan = Object.keys(REDES).filter((r) => !l.some((p) => p.red === r));
    const porHora = {};
    for (const p of l) (porHora[fecha(p.cuando, { hour: "2-digit", minute: "2-digit", hour12: false }) + "|" + p.video_id] ||= []).push(p);
    return `<div class="dia-prox"><div class="dia-cab"><b>${esc(d)}</b>${faltan.length ? `<span class="chip aviso">sin ${faltan.map((r) => REDES[r].nombre).join(" ni ")}</span>` : `<span class="chip ok">3 redes</span>`}</div>
      ${Object.entries(porHora).map(([k, ps]) => `<div class="prox-item"><time>${esc(k.split("|")[0])}</time><span class="prox-redes">${ps.map((p) => `<i class="red-pt" style="background:${REDES[p.red].c}" title="${REDES[p.red].nombre} · ${esc(ESTADO[p.estado] || p.estado)}"></i>`).join("")}</span><span class="prox-tit">${esc(ps[0].titulo)}</span><small>${esc(TIPO[ps[0].tipo] || ps[0].tipo)} · ${esc(ps[0].historia_id)}</small></div>`).join("")}</div>`;
  }).join("")}</div>`;
}

function vistaCrecimiento() {
  const a = analizar(datos.crec);
  const seg = Object.keys(REDES).reduce((s, r) => s + (a.ultimo(r).seguidores || 0), 0);
  const seg7 = Object.keys(REDES).reduce((s, r) => s + (a.hace(r, 7).seguidores || 0), 0);
  const ritmo = Object.values(a.porRed).reduce((s, r) => s + r.ritmo, 0);
  const kpi = (n, t, sub) => `<div class="tarjeta kpi"><div class="cifra">${n}</div><span>${t}</span>${sub ? `<small>${sub}</small>` : ""}</div>`;
  const filas = [...a.pubs].sort((x, y) => y.vistas - x.vistas).map((p) => `<tr>
      <td><b>${esc(p.titulo)}</b><br><span class="nd">${TIPO[p.tipo] || esc(p.tipo)} · ${esc(p.historia_id)} · ${esc(fecha(p.publicado_en || p.cuando, { day: "numeric", month: "short" }))}</span></td>
      <td><span class="chip ${esc(p.red)}">${REDES[p.red].nombre}</span></td>
      <td class="num"><b>${num(p.vistas)}</b></td>
      <td class="num">${p.ritmo != null ? (p.ritmo > 0 ? "+" : "") + num(p.ritmo) : "—"}</td>
      <td class="num">${num(p.me_gusta ?? 0)}</td><td class="num">${num(p.comentarios ?? 0)}</td>
      <td class="num">${pct(p.engage)}</td>
      <td class="num">${p.extra?.seg_medio != null ? p.extra.seg_medio.toLocaleString("es-EC") + " s" : "—"}</td>
      <td><span class="rend ${p.estadoRend[0]}">${p.estadoRend[1]}</span></td>
      <td>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">Abrir ↗</a>` : ""}</td></tr>`).join("");
  const pend = datos.crec.recomendaciones.filter((r) => r.estado === "pendiente").length;
  return `<div class="rejilla r4">
      ${kpi(num(a.total), "vistas en total", "sumando las 3 redes")}
      ${kpi((ritmo >= 0 ? "+" : "") + num(ritmo), "vistas en 24 horas", "ritmo actual")}
      ${kpi(num(seg), "seguidores en total", seg !== seg7 ? `${seg - seg7 > 0 ? "+" : ""}${num(seg - seg7)} en 7 días` : "")}
      ${kpi(num(pend), "recomendaciones pendientes", `${num(a.pubs.length)} publicaciones medidas`)}
    </div>
    <div class="rejilla r2 seccion">
      <div class="tarjeta"><h3>Lo que dicen los números</h3><div class="hallazgos">${a.hallazgos.map(([t, x]) => `<div class="hallazgo ${t}">${x}</div>`).join("") || `<div class="vacio">Aún no hay datos suficientes.</div>`}</div></div>
      <div class="tarjeta grafico"><h3>Seguidores</h3>${graficoSeguidores(datos.crec.cuentas)}
        <h3 class="sub-h">Vistas por red</h3>
        <div class="reparto">${Object.entries(a.porRed).map(([r, x]) => `<div><span>${REDES[r].nombre}</span><div class="meta-barra"><i style="width:${a.total ? ((x.vistas / a.total) * 100).toFixed(1) : 0}%;background:${REDES[r].c}"></i></div><b>${num(x.vistas)}</b></div>`).join("")}</div></div>
    </div>
    <div class="rejilla r2 seccion">
      <div class="tarjeta grafico"><h3>Vistas por día <span class="nd">últimas 2 semanas</span></h3>${vistasPorDia(datos.crec.serie || [])}</div>
      <div class="tarjeta"><h3>Mejor hora para publicar <span class="nd">según tus propios videos</span></h3>${mejorHorario(a.pubs)}</div>
    </div>
    <div class="tarjeta seccion"><h3>Lo que sale en los próximos 7 días <span class="nd">cada punto es una red</span></h3>${proximosDias(datos.crec.proximas || [])}</div>
    <div class="tarjeta seccion"><h3>Comentarios por responder <span class="nd">responder rápido hace que las redes muestren más el video</span></h3><div id="comentarios"><div class="vacio">Buscando comentarios…</div></div></div>
    <div class="tarjeta seccion"><h3>Mi plan para crecer más rápido <span class="nd">lo reviso y actualizo cada semana</span></h3><div class="recs">${recomendacionesHtml(datos.crec.recomendaciones)}</div></div>
    <div class="seccion">${metas(a)}</div>
    <div class="tarjeta seccion"><h3>Cómo va cada publicación <span class="nd">comparada con las demás de su misma red y formato</span></h3><div class="tabla-env"><table>
      <thead><tr><th>Video</th><th>Red</th><th>Vistas</th><th>24 h</th><th>Me gusta</th><th>Coment.</th><th>Interacción</th><th>Seg. vistos</th><th>Rendimiento</th><th></th></tr></thead>
      <tbody>${filas || `<tr><td colspan="10" class="vacio">Todavía no hay publicaciones medidas.</td></tr>`}</tbody></table></div></div>`;
}

/* ───── TikTok: conectar la cuenta y aprobar cada publicación (guías de Content Posting) ───── */
const PRIVACIDAD_TT = { PUBLIC_TO_EVERYONE: "Todo el mundo", MUTUAL_FOLLOW_FRIENDS: "Amigos", FOLLOWER_OF_CREATOR: "Seguidores", SELF_ONLY: "Solo yo" };
let creadorTT = null;

async function cargarCreadorTT() {
  try { creadorTT = await api("/tiktok/creador"); } catch { creadorTT = { error: "No se pudo leer tu cuenta de TikTok." }; }
}

function bloqueTikTok() {
  const c = creadorTT;
  const cuenta = !c ? `<div class="nd">Cargando tu cuenta de TikTok…</div>`
    : c.error ? `<div class="aviso-caja">${esc(c.error)}</div>`
    : `<div class="tt-cuenta"><img src="${esc(c.creator_avatar_url)}" alt=""><div><b>${esc(c.creator_nickname)}</b><span class="nd">@${esc(c.creator_username)} · publicará en esta cuenta</span></div></div>`;
  const porAprobar = datos.pubs.filter((p) => p.red === "tiktok" && ["por-aprobar", "por-programar"].includes(p.estado));
  const lista = porAprobar.map((p) => `<div class="item tt-item">
      <div class="item-fecha"><b>${esc(fecha(p.cuando, { day: "2-digit" }))}</b>${esc(fecha(p.cuando, { month: "short" }))}<br>${esc(fecha(p.cuando, { hour: "2-digit", minute: "2-digit" }))}</div>
      <div class="item-txt"><b>${esc(p.titulo)}</b><span class="nd">${p.tipo === "parte" ? "Parte" : "Reel"} · ${esc(p.historia_id)}</span></div>
      <button class="boton-pri" data-aprobar="${esc(p.id)}">Revisar y aprobar</button></div>`).join("");
  return `<div class="tarjeta tt-panel"><div class="tt-cab"><h3>Tu cuenta de TikTok</h3><button class="boton-sec" id="tt-conectar">Continuar con TikTok</button></div>${cuenta}
    <h3 class="sub-h">Por aprobar <span class="nd">${porAprobar.length} video${porAprobar.length === 1 ? "" : "s"}</span></h3>
    <div class="lista">${lista || `<div class="vacio">No hay videos esperando tu aprobación.</div>`}</div></div>`;
}

function abrirAprobacion(id) {
  const p = datos.pubs.find((x) => x.id === id), c = creadorTT;
  if (!p || !c || c.error) return;
  const d = $("#aprobar-tt");
  const casilla = (k, t, off) => `<label class="tt-check ${off ? "off" : ""}"><input type="checkbox" name="${k}" ${off ? "disabled" : ""}><span></span>${t}${off ? " <em>(desactivado en tu cuenta)</em>" : ""}</label>`;
  d.querySelector(".tt-cuerpo").innerHTML = `
    <div class="tt-prev">${p.archivo ? `<video src="/api/medio/${encodeURIComponent(p.archivo)}" controls playsinline preload="metadata"></video>` : ""}</div>
    <form class="tt-form" data-id="${esc(id)}">
      <div class="tt-cuenta"><img src="${esc(c.creator_avatar_url)}" alt=""><div><b>${esc(c.creator_nickname)}</b><span class="nd">Se publicará en esta cuenta · ${esc(fecha(p.cuando, { dateStyle: "medium", timeStyle: "short" }))}</span></div></div>
      <label class="tt-l">Descripción</label>
      <textarea name="texto" rows="5" maxlength="2200">${esc(p.texto || "")}</textarea>
      <label class="tt-l">¿Quién puede ver este video?</label>
      <select name="privacidad" required><option value="" selected disabled>Elige una opción</option>
        ${c.privacy_level_options.map((o) => `<option value="${esc(o)}">${esc(PRIVACIDAD_TT[o] || o)}</option>`).join("")}</select>
      <label class="tt-l">Permitir a los usuarios</label>
      <div class="tt-checks">${casilla("comentarios", "Comentar", c.comment_disabled)}${casilla("duo", "Dúo", c.duet_disabled)}${casilla("stitch", "Stitch", c.stitch_disabled)}</div>
      <label class="tt-check tt-switch"><input type="checkbox" name="divulgar"><span></span>Divulgar contenido comercial</label>
      <div class="tt-divulgar" hidden>
        <p class="nd">Indica si este video promociona una marca, un producto o un servicio.</p>
        ${casilla("marca", "Tu marca: estás promocionándote a ti o a tu negocio", false)}
        ${casilla("patrocinado", "Contenido de marca: promocionas a un tercero", false)}
        <p class="tt-etiqueta" hidden></p>
      </div>
      <p class="tt-aviso">El video lleva la etiqueta de contenido generado con IA. TikTok puede tardar unos minutos en procesarlo después de publicarse.</p>
      <p class="tt-consent">Al publicar, aceptas la <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noopener">Confirmación de uso de música</a> de TikTok<span class="tt-bc" hidden> y su <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" rel="noopener">Política de contenido de marca</a></span>.</p>
      <p class="error tt-error" role="alert"></p>
      <div class="tt-botones"><button type="button" class="boton-sec" data-cerrar>Cancelar</button><button type="submit" class="boton-pri" disabled>Aprobar publicación</button></div>
    </form>`;
  d.showModal();
}

function validarAprobacion(f) {
  const div = f.divulgar.checked, marca = f.marca.checked, pat = f.patrocinado.checked;
  f.querySelector(".tt-divulgar").hidden = !div;
  f.querySelector(".tt-bc").hidden = !(div && pat);
  const et = f.querySelector(".tt-etiqueta");
  et.hidden = !(div && (marca || pat));
  et.textContent = pat ? "Tu video se etiquetará como «Colaboración pagada»." : marca ? "Tu video se etiquetará como «Contenido promocional»." : "";
  const solo = f.privacidad.querySelector('option[value="SELF_ONLY"]');
  if (solo) { solo.disabled = div && pat; if (solo.disabled && f.privacidad.value === "SELF_ONLY") f.privacidad.value = ""; }
  f.querySelector("[type=submit]").disabled = !f.privacidad.value || (div && !marca && !pat);
}

document.addEventListener("input", (e) => { const f = e.target.closest(".tt-form"); if (f) validarAprobacion(f); });
document.addEventListener("change", (e) => { const f = e.target.closest(".tt-form"); if (f) validarAprobacion(f); });
document.addEventListener("submit", async (e) => {
  const f = e.target.closest(".tt-form");
  if (!f) return;
  e.preventDefault();
  const b = f.querySelector("[type=submit]"); b.disabled = true; b.textContent = "Aprobando…";
  const div = f.divulgar.checked;
  const r = await api(`/tiktok/aprobar/${encodeURIComponent(f.dataset.id)}`, { method: "POST", body: JSON.stringify({
    texto: f.texto.value, privacidad: f.privacidad.value, comentarios: f.comentarios.checked, duo: f.duo.checked, stitch: f.stitch.checked,
    marca: div && f.marca.checked, patrocinado: div && f.patrocinado.checked }) });
  if (!r.ok) { f.querySelector(".tt-error").textContent = r.error; b.textContent = "Aprobar publicación"; validarAprobacion(f); return; }
  f.innerHTML = `<div class="tt-listo"><b>✓ Aprobado</b><p>Se publicará en TikTok a la hora programada. Cuando se envíe, TikTok puede tardar unos minutos en mostrarlo en tu perfil.</p><button type="button" class="boton-pri" data-cerrar>Listo</button></div>`;
  await cargar(); pintar();
});
document.addEventListener("click", async (e) => {
  if (e.target.closest("[data-cerrar]")) { $("#aprobar-tt").close(); return; }
  const a = e.target.closest("[data-aprobar]");
  if (a) { if (!creadorTT || creadorTT.error) await cargarCreadorTT(); abrirAprobacion(a.dataset.aprobar); return; }
  if (e.target.closest("#tt-conectar")) { const { url } = await api("/tiktok/conectar"); location.href = url; }
});

/* ───── Vistas ───── */
const VISTAS = {
  crecimiento: vistaCrecimiento,
  resumen() {
    const { resumen, pubs, serie } = datos;
    const ahora = new Date().toISOString();
    const sig = [...datos.historias].filter((h) => h.estado !== "publicado").sort((a, b) => (a.semana || "").localeCompare(b.semana || ""))[0];
    const proximas = porVideo(pubs.filter((p) => p.cuando >= ahora.slice(0, 10) && !["publicado", "privado"].includes(p.estado))).slice(0, 6);
    return `<div class="rejilla r3">${Object.keys(REDES).map((r) => tarjetaRed(r, resumen.cuentas[r])).join("")}</div>
      <div class="rejilla r2 seccion">
        <div class="tarjeta"><h3>Lo que viene</h3><div class="lista">${proximas.map(itemAgenda).join("") || `<div class="vacio">No hay publicaciones en agenda.</div>`}</div></div>
        <div class="tarjeta"><h3>Actividad reciente</h3>${eventosHtml(resumen.eventos.filter((e, i, l) => l.findIndex((x) => x.mensaje === e.mensaje) === i).slice(0, 10))}</div>
      </div>
      ${sig ? `<a class="tarjeta seccion historia red-tarjeta" href="#historias" style="--c:var(--ambar)"><span class="nd">Próxima historia · sale el ${esc(fecha(sig.semana + "T19:00:00-05:00", { weekday: "long", day: "numeric", month: "long" }))}</span><h4>${esc(sig.titulo)}</h4></a>` : ""}
      <div class="tarjeta seccion grafico"><h3>Vistas nuevas por día <span class="nd">últimas 2 semanas</span></h3>${vistasPorDia(serie)}</div>`;
  },
  agenda() {
    const grupos = porVideo(datos.pubs);
    return `<div class="tarjeta"><h3>Todas las publicaciones <span class="nd">hora de Ecuador</span></h3><div class="lista">${grupos.map(itemAgenda).join("")}</div></div>`;
  },
  videos() {
    const vids = porVideo(datos.pubs);
    return `<div class="videos">${vids.map((v) => {
      const vistas = v.redes.reduce((a, p) => a + (p.vistas || 0), 0);
      const fondo = v.miniatura ? `style="background-image:url('/api/medio/${encodeURIComponent(v.miniatura)}')"` : "";
      return `<div class="video"><button class="video-cara ${v.tipo === "largo" ? "largo" : ""}" ${fondo} ${v.archivo ? `data-video="${esc(v.archivo)}"` : ""} aria-label="Ver ${esc(v.titulo)}">
          <em>${v.tipo === "largo" ? "Video largo" : v.tipo === "parte" ? "Parte (TikTok)" : "Reel"}</em>${v.archivo ? "<span>▶</span>" : ""}</button>
        <div class="video-info"><b>${esc(v.titulo)}</b><span class="nd">${esc(fecha(v.cuando, { dateStyle: "medium", timeStyle: "short" }))} · ${num(vistas)} vistas</span>
          <div class="chips">${v.redes.map(chip).join("")}</div></div></div>`;
    }).join("")}</div>`;
  },
  red(red) {
    const c = datos.resumen.cuentas[red], r = REDES[red];
    const lista = datos.pubs.filter((p) => p.red === red);
    const avisos = {
      facebook: !lista.some((p) => p.estado === "publicado") ? `<div class="aviso-caja">Aún no hay videos publicados en Facebook. Las vistas, reacciones y comentarios aparecen aquí una hora después de cada publicación.</div>` : "",
      tiktok: lista.some((p) => p.estado === "privado") ? `<div class="aviso-caja">TikTok aún revisa la app: mientras tanto publica en <b>privado</b> y esos videos no suman vistas públicas.</div>` : "",
      youtube: lista.some((p) => p.estado === "privado") ? `<div class="aviso-caja">YouTube deja en privado los videos de apps sin auditoría de Google. Ya está pedida; mientras, se pueden pasar a públicos desde YouTube Studio.</div>` : "",
    };
    const filas = lista.map((p) => `<tr><td><b>${esc(p.titulo)}</b><br><span class="nd">${p.tipo === "largo" ? "Video largo" : p.tipo === "parte" ? "Parte (TikTok)" : "Reel"}</span></td>
      <td>${esc(fecha(p.cuando, { dateStyle: "short", timeStyle: "short" }))}</td><td>${chip(p)}</td>
      <td class="num">${p.vistas != null ? num(p.vistas) : "—"}</td><td class="num">${p.me_gusta != null ? num(p.me_gusta) : "—"}</td><td class="num">${p.comentarios != null ? num(p.comentarios) : "—"}</td>
      <td>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">Abrir ↗</a>` : ""}</td></tr>`).join("");
    return `${red === "tiktok" ? bloqueTikTok() : ""}${avisos[red]}<div class="rejilla r3">${tarjetaRed(red, c)}
        <div class="tarjeta"><h3>Me gusta</h3><div class="cifra">${c.me_gusta != null ? num(c.me_gusta) : "—"}</div><p class="nd">en todas las publicaciones</p></div>
        <div class="tarjeta"><h3>Comentarios</h3><div class="cifra">${c.comentarios != null ? num(c.comentarios) : "—"}</div><p class="nd">${num(c.fal || 0)} publicaciones con error</p></div></div>
      <div class="tarjeta seccion"><h3>Publicaciones en ${r.nombre}</h3><div class="tabla-env"><table>
        <thead><tr><th>Video</th><th>Fecha</th><th>Estado</th><th>Vistas</th><th>Me gusta</th><th>Coment.</th><th></th></tr></thead>
        <tbody>${filas || `<tr><td colspan="7" class="vacio">Sin publicaciones.</td></tr>`}</tbody></table></div></div>`;
  },
  animar() {
    const lista = datos.animaciones;
    if (!lista.length) return `<div class="tarjeta vacio">No hay escenas para animar esta semana.</div>`;
    const hechas = lista.filter((x) => x.clip).length;
    const guia = `<div class="tarjeta guia"><h3>Cómo animar en Flow <span class="chip ${hechas === lista.length ? "publicado" : ""}">${hechas} de ${lista.length} listas</span></h3>
      <ol><li>Abre <a href="https://labs.google/fx/tools/flow" target="_blank" rel="noopener">Flow ↗</a> con tu cuenta de Gemini Pro y elige <b>Fotogramas a video</b> (Frames to Video), formato <b>horizontal 16:9</b>.</li>
      <li>Descarga la imagen de la escena y súbela como primer fotograma.</li>
      <li>Pulsa <b>Copiar instrucción</b> y pégala en Flow. Genera el video.</li>
      <li>Descarga el video y súbelo aquí con <b>Subir clip</b>. Yo me encargo del resto.</li></ol></div>`;
    return guia + `<div class="animar">${lista.map((x, i) => `<div class="tarjeta anim ${x.clip ? "lista" : ""}">
        <div class="anim-img" style="background-image:url('/api/medio/${encodeURIComponent(x.imagen)}')"><em>Escena ${i + 1}</em>${x.clip ? "<span>✓ Animada</span>" : ""}</div>
        <div class="anim-txt"><span class="nd">${esc(x.titulo)}</span><p>${esc(x.descripcion)}</p>
          <div class="instruccion">${esc(x.instruccion)}</div>
          <div class="anim-botones">
            <a class="boton-sec" href="/api/medio/${encodeURIComponent(x.imagen)}" download="escena-${i + 1}-${esc(x.escena)}.jpg">⬇ Imagen</a>
            <button class="boton-sec" data-copiar="${esc(x.instruccion)}">⧉ Copiar instrucción</button>
            <label class="boton-pri">${x.clip ? "↻ Cambiar clip" : "⬆ Subir clip"}<input type="file" accept="video/mp4,video/quicktime,video/webm" data-subir="${esc(x.id)}" hidden></label>
          </div>
          ${x.clip ? `<video src="/api/medio/${encodeURIComponent(x.clip)}" controls playsinline preload="metadata"></video>` : ""}
          <div class="progreso" data-progreso="${esc(x.id)}"></div>
        </div></div>`).join("")}</div>`;
  },
  historias() {
    const pasos = ["idea", "guion", "voz", "imagenes", "render", "listo", "publicado"];
    const nombres = { idea: "Idea", guion: "Guion", voz: "Voz", imagenes: "Imágenes", render: "Render", listo: "Programada", publicado: "Publicada" };
    const lista = [...datos.historias].sort((a, b) => (a.semana || "").localeCompare(b.semana || ""));
    return `<div class="lista">${lista.map((h) => {
      const n = pasos.indexOf(h.estado);
      return `<div class="tarjeta historia">
        <div class="historia-cab"><div><span class="nd">Sale el ${esc(fecha(h.semana + "T19:00:00-05:00", { weekday: "long", day: "numeric", month: "long" }))}</span>
          <h4>${esc(h.titulo)}</h4></div><span class="chip ${h.estado === "publicado" ? "publicado" : n >= 5 ? "enviado" : ""}">${esc(nombres[h.estado] || h.estado)}</span></div>
        ${h.notas ? `<p class="historia-nota">${esc(h.notas)}</p>` : ""}
        <div class="pasos">${pasos.map((p, i) => `<span class="${i <= n ? "hecho" : ""}">${nombres[p]}</span>`).join("")}</div>
      </div>`;
    }).join("") || `<div class="vacio">Sin historias planificadas.</div>`}</div>`;
  },
  actividad() { return `<div class="tarjeta"><h3>Todo lo que hizo el sistema</h3>${eventosHtml(datos.resumen.eventos)}</div>`; },
};

function pintar() {
  const v = (location.hash || "#resumen").slice(1);
  const nombre = TITULOS[v] ? v : "resumen";
  document.querySelectorAll(".menu nav a").forEach((a) => a.classList.toggle("activo", a.dataset.vista === nombre));
  $("#titulo").textContent = TITULOS[nombre];
  const html = REDES[nombre] ? VISTAS.red(nombre) : VISTAS[nombre]();
  if (nombre === "crecimiento") cargarComentarios();
  if (nombre === "tiktok" && !creadorTT) cargarCreadorTT().then(() => { if ((location.hash || "").slice(1) === "tiktok") pintar(); });
  const cont = $("#vista");
  cont.innerHTML = html;
  cont.style.animation = "none"; void cont.offsetWidth; cont.style.animation = "";
}

let comentarios = null;
async function cargarComentarios() {
  if (!comentarios) comentarios = await api("/comentarios").catch(() => []);
  const caja = $("#comentarios");
  if (!caja) return;
  caja.innerHTML = comentarios.length
    ? `<p class="nd">${comentarios.length} sin respuesta. Pídeme "responde los comentarios" y los contesto todos con la voz del canal.</p><div class="coments">${comentarios.slice(0, 12).map((c) => `<div class="coment">
        <span class="chip ${esc(c.red)}">${REDES[c.red]?.nombre || esc(c.red)}</span>
        <div><b>${esc(c.autor)}</b> <span class="nd">· ${esc(fecha(c.cuando, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))} · ${esc(c.video)}</span><p>${esc(c.texto)}</p></div>
        <a href="${esc(c.url)}" target="_blank" rel="noopener">Abrir ↗</a></div>`).join("")}</div>`
    : `<div class="vacio">Todo respondido: no hay comentarios pendientes.</div>`;
}

/* ───── RELATOS AI GROUP: selector, panel del grupo, Gaming y seguridad ───── */
const CASA = new Set(["empresas", "grupo", "seguridad", "gaming", "presupuesto", "agentes"]);
const hashActual = () => (location.hash || "#empresas").slice(1);
let yo = null;

async function navegar() {
  const r = hashActual();
  if (CASA.has(r)) {
    $("#app").hidden = true; $("#login").hidden = true; $("#casa").hidden = false;
    document.querySelectorAll("[data-casa]").forEach((a) => a.classList.toggle("activo", a.dataset.casa === r));
    $("#casa-vista").innerHTML = `<div class="rejilla r3"><div class="cargando"></div><div class="cargando"></div><div class="cargando"></div></div>`;
    try { $("#casa-vista").innerHTML = await CASA_VISTAS[r](); } catch (e) { if (String(e).includes("sin sesión")) return; $("#casa-vista").innerHTML = `<div class="vacio">No se pudo cargar: ${esc(e.message)}</div>`; }
    return;
  }
  $("#casa").hidden = true; $("#login").hidden = true; $("#app").hidden = false;
  if (!datos.resumen) {
    $("#vista").innerHTML = `<div class="rejilla r3"><div class="cargando"></div><div class="cargando"></div><div class="cargando"></div></div>`;
    try { await cargar(); } catch { return; }
  }
  pintar();
}

const cifra = (n, etiqueta, nota = "") => `<div class="tarjeta kpi"><div class="cifra">${n}</div><small>${etiqueta}</small>${nota ? `<p class="nd">${nota}</p>` : ""}</div>`;
const pendienteFase = (txt) => `<span class="nd">${txt}</span>`;
const DIV_ESTADO = { activa: "Activa", preparacion: "En preparación", detenida: "Detenida" };

const CASA_VISTAS = {
  async empresas() {
    const g = await api("/grupo/resumen");
    const d = Object.fromEntries(g.divisiones.map((x) => [x.id, x]));
    const tarjeta = (id, destino, boton, detalle) => {
      const x = d[id];
      return `<a class="empresa ${id}" href="#${destino}">
        <span class="chip ${x.estado === "activa" ? "publicado" : ""}">${esc(DIV_ESTADO[x.estado] || x.estado)}</span>
        <h3>${esc(x.nombre)}</h3><p>${esc(x.descripcion)}</p>
        <div class="empresa-datos">${detalle(x)}</div>
        <span class="empresa-boton">${boton} →</span></a>`;
    };
    return `<section class="selector">
      <h1 class="bienvenida">Hola${yo?.nombre ? ", " + esc(yo.nombre.split(" ")[0]) : ""}. ¿A qué empresa entras?</h1>
      <div class="empresas">
        ${tarjeta("relatos", "resumen", "ENTRAR A RELATOS", (x) => `<div><b>${num(x.publicados_7d)}</b>publicados en 7 días</div><div><b>${num(x.agenda)}</b>en agenda</div><div><b>${num(x.errores_24h)}</b>errores 24 h</div>`)}
        ${tarjeta("gaming", "gaming", "ENTRAR A GAMING", () => `<div><b>0</b>redes conectadas</div><div><b>—</b>derechos verificados</div><div><b>GTA</b>especialidad</div>`)}
      </div>
      <p class="nd centro"><a href="#grupo">Ver el panel general del grupo →</a></p></section>`;
  },

  async grupo() {
    const g = await api("/grupo/resumen");
    const tot = (k) => g.divisiones.reduce((a, x) => a + (x[k] || 0), 0);
    const filas = g.divisiones.map((x) => `<tr><td><a href="#${x.id === "relatos" ? "resumen" : "gaming"}">${esc(x.nombre)}</a></td>
      <td><span class="chip ${x.estado === "activa" ? "publicado" : ""}">${esc(DIV_ESTADO[x.estado] || x.estado)}</span>${x.pausa ? ` <span class="chip fallido">En pausa</span>` : ""}</td>
      <td>${num(x.en_produccion)}</td><td>${num(x.listas)}</td><td>${num(x.agenda)}</td><td>${num(x.publicados_7d)}</td><td>${num(x.fallidos)}</td><td>${num(x.errores_24h)}</td></tr>`).join("");
    return `<h2 class="casa-titulo">${esc(g.org)} · Panel general</h2>
      <div class="rejilla r4">
        ${cifra(g.agentes ? `${g.agentes.activos}/${g.agentes.total}` : "—", "agentes activos", g.tareas ? (g.tareas.pendientes || 0) + " tareas pendientes · " + (g.tareas.en_revision || 0) + " en revisión" : "")}
        ${cifra(num(tot("en_produccion")), "producciones en curso")}
        ${cifra(num(tot("agenda")), "publicaciones en agenda")}
        ${cifra(g.presupuesto.usado != null ? `$${g.presupuesto.usado.toFixed(2)}` : "—", `de $${num(g.presupuesto.mensual)} al mes`, g.presupuesto.usado != null ? "Proyección del mes: $" + g.presupuesto.proyeccion.toFixed(2) + (g.presupuesto.estimado ? " · incluye estimados" : "") : "")}
      </div>
      <div class="tarjeta"><h3>Divisiones</h3><div class="tabla-scroll"><table class="tabla">
        <thead><tr><th>División</th><th>Estado</th><th>En producción</th><th>Listas</th><th>En agenda</th><th>Publicadas 7 d</th><th>Fallidas</th><th>Errores 24 h</th></tr></thead>
        <tbody>${filas}</tbody></table></div></div>
      <div class="rejilla r2">
        <div class="tarjeta"><h3>Alertas</h3>${g.alertas.length ? `<ul class="alertas">${g.alertas.map((a) => `<li><span class="chip">${esc(a.division)}</span> ${esc(a.texto)}</li>`).join("")}</ul>` : `<div class="vacio">Sin alertas.</div>`}
          <h3>Seguridad (24 h)</h3><p>${num(g.seguridad_24h.total)} eventos · <b>${num(g.seguridad_24h.altas)}</b> graves · ${num(g.seguridad_24h.medias)} medios. <a href="#seguridad">Ver sesiones →</a></p></div>
        <div class="tarjeta"><h3>Últimas actividades</h3><ul class="actividad">${g.actividad.map((a) => `<li class="${esc(a.nivel)}"><span class="nd">${esc(fecha(a.cuando.replace(" ", "T") + "Z", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))} · ${a.tipo === "persona" ? "persona" : esc(a.division || "sistema")}</span> ${esc(a.texto)}</li>`).join("")}</ul></div>
      </div>`;
  },

  async gaming() {
    const g = await api("/grupo/resumen");
    const x = g.divisiones.find((d) => d.id === "gaming");
    const paso = (hecho, txt, quien) => `<li class="${hecho ? "hecho" : ""}"><span>${hecho ? "✓" : "○"}</span><div>${txt}<small>${quien}</small></div></li>`;
    return `<h2 class="casa-titulo">${esc(x.nombre)}</h2>
      <p class="nd">${esc(x.descripcion)} Estado: <b>${esc(DIV_ESTADO[x.estado])}</b>. No se publica nada hasta verificar derechos e integraciones.</p>
      <div class="rejilla r4">${cifra(num(x.agenda), "en agenda")}${cifra(num(x.publicados_7d), "publicados en 7 días")}${cifra("0", "redes conectadas")}${cifra("—", "agentes", "Fase 8")}</div>
      <div class="tarjeta"><h3>Para arrancar Gaming</h3><ul class="pasos-lista">
        ${paso(true, "Espacio de la división creado y aislado de Relatos", "hecho")}
        ${paso(false, "Nombre de la marca gaming", "lo decides tú")}
        ${paso(false, "Cuentas de Facebook, YouTube y TikTok de la marca", "las creas tú; yo las conecto")}
        ${paso(false, "Política de Rockstar revisada y registro de derechos (Rights Manager)", "fase 8")}
        ${paso(false, "Registro de creadores con autorización comercial", "fase 8")}
        ${paso(false, "Plantillas de video propias de Gaming", "fase 8")}
      </ul></div>`;
  },

  async agentes() {
    const d = await api("/agentes");
    const EST = { disponible: "Disponible", investigando: "Investigando", analizando: "Analizando", escribiendo: "Escribiendo", produciendo: "Produciendo", renderizando: "Renderizando", revisando: "Revisando", coordinando: "Coordinando", pausa: "En pausa", error: "Error", "no-activado": "No activado" };
    const T_EST = { pendiente: "Pendiente", "en-curso": "En curso", "en-revision": "En revisión", hecha: "Hecha", rechazada: "Rechazada", error: "Error", bloqueada: "Bloqueada" };
    const hace = (s) => s ? fecha(s.replace(" ", "T") + "Z", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
    const tarjetas = d.agentes.map((a) => `<button class="agente ${a.activo ? "" : "apagado"} est-${esc(a.estado)}" data-agente="${esc(a.id)}">
        <span class="avatar">${esc(a.nombre.slice(0, 1))}</span>
        <span class="agente-txt"><b>${esc(a.nombre)}</b><small>${esc(a.cargo)}</small>
        <em class="estado-ag">${esc(EST[a.estado] || a.estado)}${a.tarea_titulo ? " · " + esc(a.tarea_titulo) : ""}</em></span>
        <span class="agente-num">${num(a.hechas)} hechas · ${num(a.abiertas)} abiertas</span></button>`).join("");
    const tareas = d.tareas.map((t) => `<tr data-tarea="${t.id}" class="fila-clic"><td>#${t.id}</td><td>${esc(t.agente_id)}</td><td>${esc(t.titulo)}</td>
        <td><span class="chip ${t.estado === "hecha" ? "publicado" : t.estado === "en-curso" ? "enviado" : t.estado === "error" ? "fallido" : ""}">${esc(T_EST[t.estado] || t.estado)}</span></td>
        <td>${t.calidad != null ? t.calidad + "/100" : "—"}</td><td class="nd">${esc(t.creada_por)}</td><td class="nd">${esc(hace(t.terminada || t.creada))}</td></tr>`).join("");
    const memoria = d.memoria.map((m) => `<li data-memoria="${m.id}" class="fila-clic"><span class="chip">${esc(m.tipo)}</span> <b>${esc(m.titulo)}</b> <span class="nd">· ${esc(m.autor)} · ${esc(hace(m.creado))}${m.confianza ? " · confianza " + esc(m.confianza) : ""}</span></li>`).join("");
    const exps = d.experimentos.map((e) => `<div class="exp"><div><span class="chip">${esc(e.id)}</span> <b>${esc(e.titulo)}</b> <span class="chip ${e.estado === "terminado" ? "publicado" : "enviado"}">${esc(e.estado)}</span></div>
        <p><b>Hipótesis:</b> ${esc(e.hipotesis)}</p><p class="nd"><b>Métrica:</b> ${esc(e.metrica)} · <b>Éxito si:</b> ${esc(e.criterio_exito)}</p>${e.conclusion ? `<p><b>Conclusión:</b> ${esc(e.conclusion)}</p>` : ""}</div>`).join("");
    return `<h2 class="casa-titulo">Agentes</h2>
      <p class="nd">Trabajan en jornadas programadas en la nube (con tu suscripción de Claude Code) y todo lo que ves aquí es su actividad real. No pueden publicar, gastar ni tocar la seguridad. Toca a un agente para ver su ficha y darle una instrucción.</p>
      <div class="equipo">${tarjetas}</div>
      <div class="tarjeta"><h3>Tareas</h3><div class="tabla-scroll"><table class="tabla"><thead><tr><th></th><th>Agente</th><th>Tarea</th><th>Estado</th><th>Calidad</th><th>Pidió</th><th>Fecha</th></tr></thead><tbody>${tareas || `<tr><td colspan="7" class="nd">Sin tareas.</td></tr>`}</tbody></table></div></div>
      <div class="rejilla r2">
        <div class="tarjeta"><h3>Memoria de la empresa</h3><ul class="memoria">${memoria || `<li class="nd">Vacía.</li>`}</ul></div>
        <div class="tarjeta"><h3>Experimentos</h3>${exps || `<div class="vacio">Sin experimentos.</div>`}</div>
      </div>`;
  },

  async presupuesto() {
    const p = await api("/presupuesto");
    const usd = (n) => "$" + Number(n || 0).toFixed(2);
    const barra = (usado, tope) => { const x = tope ? Math.min(100, (usado / tope) * 100) : 0; return `<div class="barra-p ${x > 90 ? "mal" : x > 70 ? "aviso" : ""}"><span style="width:${x.toFixed(1)}%"></span></div>`; };
    const grupos = Object.entries(p.limites.proveedores).map(([k, tope]) => `<tr><td>${esc(k)}</td><td>${usd(p.porGrupo[k])}</td><td>${usd(tope)}</td><td class="celda-barra">${barra(p.porGrupo[k] || 0, tope)}</td></tr>`).join("");
    const provs = Object.entries(p.porProveedor).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${usd(v.usd)}</td><td>${v.unidades != null ? num(Math.round(v.unidades)) + " " + esc(v.unidad || "") : "—"}</td></tr>`).join("");
    const divs = Object.entries(p.porDivision).map(([k, v]) => `<div><b>${usd(v)}</b>${esc(k)}</div>`).join("");
    const movs = p.ultimos.map((x) => `<tr><td class="nd">${esc(fecha(x.cuando.replace(" ", "T") + "Z", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))}</td><td>${esc(x.proveedor)}</td><td>${esc(x.concepto)}${x.unidades ? ` <span class="nd">· ${num(x.unidades)} ${esc(x.unidad || "")}</span>` : ""}</td><td>${usd(x.monto_usd)}</td><td><span class="chip ${x.tipo === "real" ? "ok" : "aviso"}">${esc(x.tipo)}</span></td><td class="nd">${esc(x.agente || "")}</td></tr>`).join("");
    return `<h2 class="casa-titulo">Presupuesto · ${esc(p.mes)}</h2>
      <p class="nd">Tope del grupo: <b>${usd(p.limites.total)}</b> al mes, compartido entre Relatos y Gaming, y ${usd(p.limites.diario)} al día en gastos variables. Si un gasto no cabe, la tarea se detiene sola. Nada compra créditos ni activa suscripciones.</p>
      <div class="rejilla r4">${cifra(usd(p.usado), "usado este mes", p.estimado ? usd(p.estimado) + " son estimados (precio de lista)" : "")}${cifra(usd(p.disponible), "disponible")}${cifra(usd(p.proyeccion), "proyección del mes")}${cifra(usd(p.hoy), "variables de hoy", "tope diario " + usd(p.limites.diario))}</div>
      <div class="tarjeta">${barra(p.usado, p.limites.total)}<div class="empresa-datos">${divs || `<div class="nd">Sin gastos este mes.</div>`}</div></div>
      <div class="rejilla r2">
        <div class="tarjeta"><h3>Topes por partida</h3><div class="tabla-scroll"><table class="tabla"><thead><tr><th>Partida</th><th>Usado</th><th>Tope</th><th></th></tr></thead><tbody>${grupos}</tbody></table></div></div>
        <div class="tarjeta"><h3>Por proveedor</h3><div class="tabla-scroll"><table class="tabla"><thead><tr><th>Proveedor</th><th>USD</th><th>Consumo</th></tr></thead><tbody>${provs || `<tr><td colspan="3" class="nd">Sin registros.</td></tr>`}</tbody></table></div>
          <p class="nd">La API de Claude no se usa: los agentes trabajan con tu suscripción de Claude Code.</p></div>
      </div>
      <div class="tarjeta"><h3>Últimos movimientos</h3><div class="tabla-scroll"><table class="tabla"><thead><tr><th>Cuándo</th><th>Proveedor</th><th>Concepto</th><th>USD</th><th>Tipo</th><th>Quién</th></tr></thead><tbody>${movs || `<tr><td colspan="6" class="nd">Sin movimientos.</td></tr>`}</tbody></table></div></div>`;
  },

  async seguridad() {
    const [s, sen, det] = await Promise.all([api("/sesiones"), api("/sentinel"), api("/detener")]);
    const ICONO = { ok: "✓", aviso: "!", grave: "✕" };
    const AMB = { grupo: ["TODA LA EMPRESA", "Para todo: publicaciones, renderizados, agentes y APIs de ambas divisiones."], relatos: ["Relatos", "Solo la división Relatos."], gaming: ["Gaming", "Solo la división Gaming."], publicaciones: ["Publicaciones", "Nada nuevo se publica ni se programa."], renderizados: ["Renderizados", "La fábrica no renderiza."], agentes: ["Agentes", "Los agentes no toman tareas."], apis: ["APIs con consumo", "Voz, imágenes e IA de pago se paran."] };
    const interruptores = Object.entries(AMB).map(([k, [n, d]]) => `<label class="interruptor-det ${k === "grupo" ? "principal" : ""}"><input type="checkbox" data-detener="${k}" ${det[k] ? "checked" : ""}><span><b>${n}</b><small>${d}</small></span><em>${det[k] ? "DETENIDO" : "en marcha"}</em></label>`).join("");
    const controles = sen.controles.map((c) => `<li class="${c.estado}"><span>${ICONO[c.estado]}</span><div><b>${esc(c.nombre)}</b><small>${esc(c.detalle)}</small></div></li>`).join("");
    const eventos = sen.eventos.map((e) => `<tr><td class="nd">${esc(fecha(e.cuando.replace(" ", "T") + "Z", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))}</td><td>${esc(e.tipo)}</td><td><span class="chip ${e.severidad === "alta" ? "fallido" : e.severidad === "media" ? "aviso" : ""}">${esc(e.severidad)}</span></td><td>${esc(e.detalle)}</td><td class="nd">${esc(e.ip || "")}</td></tr>`).join("");
    const sentinel = `<div class="tarjeta detener ${det.grupo ? "activo" : ""}"><h3>🛑 DETENER EMPRESA</h3>
        <p class="nd">Nada se borra y tú sigues entrando. Ojo: lo que ya está programado DENTRO de Facebook y YouTube sale igual; para frenarlo hay que cancelarlo en Meta Business Suite o YouTube Studio (o pedírmelo).</p>
        <div class="interruptores">${interruptores}</div>
        ${det.cambiado ? `<p class="nd">Último cambio: ${esc(fecha(det.cambiado, { dateStyle: "short", timeStyle: "short" }))} por ${esc(det.por)}</p>` : ""}</div>
      <div class="tarjeta"><h3>Controles automáticos de SENTINEL</h3><ul class="controles">${controles}</ul>
        <button class="boton-sec" id="respaldo-ahora">Hacer respaldo ahora</button> <span class="nd" id="respaldo-msg"></span></div>
      <div class="tarjeta"><h3>Eventos de seguridad</h3><div class="tabla-scroll"><table class="tabla"><thead><tr><th>Cuándo</th><th>Tipo</th><th>Gravedad</th><th>Detalle</th><th>IP</th></tr></thead><tbody>${eventos || `<tr><td colspan="5" class="nd">Sin eventos.</td></tr>`}</tbody></table></div></div>`;
    return `<h2 class="casa-titulo">Seguridad · SENTINEL</h2>${sentinel}
      <div class="tarjeta"><h3>Sesiones abiertas</h3><div class="tabla-scroll"><table class="tabla">
        <thead><tr><th>Entrada</th><th>Desde</th><th>Último uso</th><th>IP</th><th>Navegador</th></tr></thead>
        <tbody>${s.map((x) => `<tr><td>${x.actual ? "<b>Esta sesión</b>" : esc(x.ref)}</td><td>${x.origen === "portal" ? "Portal de empresas" : "Contraseña + código"}</td>
          <td>${esc(fecha(x.ultima.replace(" ", "T") + "Z", { dateStyle: "short", timeStyle: "short" }))}</td><td>${esc(x.ip)}</td><td class="nd">${esc((x.agente || "").slice(0, 60))}</td></tr>`).join("")}</tbody></table></div>
        <button class="boton-peligro" id="cerrar-todas">Cerrar sesión en todos los dispositivos</button></div>`;
  },
};

$("#casa-vista").addEventListener("change", async (e) => {
  const c = e.target.closest("[data-detener]");
  if (!c) return;
  const amb = c.dataset.detener;
  if (c.checked && !confirm(amb === "grupo" ? "¿DETENER TODA LA EMPRESA? Se paran publicaciones, renderizados, agentes y APIs." : "¿Detener " + amb + "?")) { c.checked = false; return; }
  const r = await post("/detener", { ambito: amb, valor: c.checked });
  if (r.error) alert(r.error);
  navegar();
});
$("#casa-vista").addEventListener("click", async (e) => {
  const b = e.target.closest("#respaldo-ahora");
  if (b) {
    b.disabled = true; $("#respaldo-msg").textContent = "Respaldando…";
    const r = await post("/respaldo/ahora");
    $("#respaldo-msg").textContent = r.ok ? "✓ " + num(r.filas) + " filas, " + Math.round(r.bytes / 1024) + " KB cifrados" : "Error: " + (r.error || "");
    setTimeout(navegar, 1500); return;
  }
  if (!e.target.closest("#cerrar-todas")) return;
  if (!confirm("¿Cerrar todas las sesiones, incluida esta?")) return;
  await post("/sesiones/cerrar-todas"); datos.resumen = null; mostrarLogin();
});

async function abrirDetalle(html) { const dl = $("#detalle"); dl.querySelector(".detalle-cuerpo").innerHTML = html; dl.showModal(); }
const markdown = (s) => `<div class="md">${esc(s || "").replace(/^### (.*)$/gm, "<h4>$1</h4>").replace(/^## (.*)$/gm, "<h3>$1</h3>").replace(/^# (.*)$/gm, "<h3>$1</h3>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")}</div>`;
$("#casa-vista").addEventListener("click", async (e) => {
  const ag = e.target.closest("[data-agente]");
  const ta = e.target.closest("[data-tarea]");
  const me = e.target.closest("[data-memoria]");
  if (ag) {
    const f = await api("/agentes/" + ag.dataset.agente);
    const a = f.agente;
    await abrirDetalle(`<h3>${esc(a.nombre)} · ${esc(a.cargo)}</h3>
      <p class="nd">${esc(a.departamento)} · ${esc(a.division_id || "grupo")} · estado: <b>${esc(a.estado)}</b>${a.desde ? " desde " + esc(fecha(a.desde.replace(" ", "T") + "Z", { dateStyle: "short", timeStyle: "short" })) : ""}</p>
      <p class="nd">Herramientas: ${esc(JSON.parse(a.herramientas || "[]").join(", "))}</p>
      ${a.activo ? `<form id="form-instruccion" data-id="${esc(a.id)}" class="instruccion"><label>Darle una instrucción</label>
        <input name="titulo" maxlength="200" placeholder="Ej.: Analiza qué ganchos de TikTok traen más vistas" required>
        <textarea name="descripcion" rows="3" maxlength="6000" placeholder="Detalles (opcional)"></textarea>
        <button class="boton-pri">Enviar (la toma en la próxima jornada)</button><span class="nd" id="instr-msg"></span></form>` : `<p class="nd">Todavía no está activado.</p>`}
      <h4>Tareas</h4><ul class="memoria">${f.tareas.map((t) => `<li data-tarea="${t.id}" class="fila-clic">#${t.id} ${esc(t.titulo)} <span class="nd">· ${esc(t.estado)}${t.calidad != null ? " · " + t.calidad + "/100" : ""}</span></li>`).join("") || `<li class="nd">Sin tareas.</li>`}</ul>
      <h4>Historial</h4><ul class="actividad">${f.eventos.map((v) => `<li><span class="nd">${esc(fecha(v.cuando.replace(" ", "T") + "Z", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))} · ${esc(v.estado || "")}</span> ${esc(v.mensaje)}</li>`).join("") || `<li class="nd">Aún no ha trabajado.</li>`}</ul>`);
    return;
  }
  if (ta) {
    const t = await api("/tareas/" + ta.dataset.tarea);
    await abrirDetalle(`<h3>#${t.id} · ${esc(t.titulo)}</h3><p class="nd">${esc(t.agente_id)} · ${esc(t.estado)} · pidió ${esc(t.creada_por)}${t.calidad != null ? ` · calidad <b>${t.calidad}/100</b>` : ""}</p>
      ${t.descripcion ? `<p>${esc(t.descripcion)}</p>` : ""}${t.revision ? `<div class="tarjeta"><b>Revisión de calidad:</b> ${esc(t.revision)}</div>` : ""}
      ${t.error ? `<p class="error">${esc(t.error)}</p>` : ""}${t.resultado ? `<h4>Entregable</h4>${markdown(t.resultado)}` : `<p class="nd">Sin entregable todavía.</p>`}`);
    return;
  }
  if (me) {
    const m = await api("/memoria/" + me.dataset.memoria);
    await abrirDetalle(`<h3>${esc(m.titulo)}</h3><p class="nd">${esc(m.tipo)} · ${esc(m.autor)} · ${esc(m.creado)}${m.confianza ? " · confianza " + esc(m.confianza) : ""}</p>${markdown(m.contenido)}
      ${m.fuentes ? `<h4>Fuentes</h4><ul>${JSON.parse(m.fuentes).map((x) => `<li>${esc(x.titulo || "")} <a href="${esc(/^https?:\/\//.test(x.url || "") ? x.url : "#")}" target="_blank" rel="noopener noreferrer">${esc(x.url || "")}</a> <span class="nd">${esc(x.fecha || "")}</span></li>`).join("")}</ul>` : ""}`);
  }
});
document.addEventListener("submit", async (e) => {
  const f = e.target.closest("#form-instruccion");
  if (!f) return;
  e.preventDefault();
  const r = await post(`/agentes/${f.dataset.id}/instruccion`, { titulo: f.titulo.value, descripcion: f.descripcion.value });
  $("#instr-msg").textContent = r.ok ? `✓ Tarea #${r.id} creada` : (r.error || "Error");
  if (r.ok) { f.reset(); if (hashActual() === "agentes") navegar(); }
});

async function entrar() {
  const r = await fetch("/api/yo");
  if (r.status === 401) return mostrarLogin();
  yo = await r.json();
  if (!location.hash || location.hash === "#") history.replaceState(null, "", location.pathname + "#empresas");
  navegar();
}

/* ───── Eventos ───── */
window.addEventListener("hashchange", navegar);
$("#vista").addEventListener("change", async (e) => {
  const c = e.target.closest("[data-rec]");
  if (!c) return;
  await api(`/recomendaciones/${c.dataset.rec}`, { method: "POST", body: JSON.stringify({ estado: c.checked ? "hecho" : "pendiente" }) });
  await cargar(); pintar();
});
$("#vista").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-copiar]");
  if (!b) return;
  await navigator.clipboard.writeText(b.dataset.copiar);
  const t = b.textContent; b.textContent = "✓ Copiada"; setTimeout(() => (b.textContent = t), 1500);
});
$("#vista").addEventListener("change", (e) => {
  const inp = e.target.closest("[data-subir]");
  if (!inp || !inp.files[0]) return;
  const f = inp.files[0], id = inp.dataset.subir;
  const barra = document.querySelector(`[data-progreso="${CSS.escape(id)}"]`);
  if (f.size > 95 * 1024 * 1024) { barra.textContent = "El video pesa más de 95 MB."; return; }
  const x = new XMLHttpRequest();
  x.open("POST", `/api/animaciones/${encodeURIComponent(id)}/clip`);
  x.setRequestHeader("Content-Type", f.type || "video/mp4");
  x.upload.onprogress = (ev) => { barra.textContent = `Subiendo… ${Math.round((ev.loaded / ev.total) * 100)}%`; };
  x.onload = async () => {
    let msg = "";
    try { msg = JSON.parse(x.responseText || "{}").error || ""; } catch {}
    barra.textContent = x.status === 200 ? "✓ Clip recibido" : "Error: " + (msg || x.status);
    if (x.status === 200) { await cargar(); pintar(); }
  };
  x.onerror = () => { barra.textContent = "Se cortó la conexión. Inténtalo de nuevo."; };
  x.send(f);
});
$("#vista").addEventListener("click", (e) => {
  const b = e.target.closest("[data-video]");
  if (!b) return;
  const d = $("#reproductor");
  d.querySelector("video").src = "/api/medio/" + encodeURIComponent(b.dataset.video);
  d.showModal();
  d.querySelector("video").play().catch(() => {});
});
$("#reproductor .cerrar").addEventListener("click", () => $("#reproductor").close());
$("#reproductor").addEventListener("close", () => { const v = $("#reproductor video"); v.pause(); v.removeAttribute("src"); v.load(); });
$("#pausa").addEventListener("change", async (e) => {
  await api("/pausa", { method: "POST", body: JSON.stringify({ valor: e.target.checked }) });
  await cargar(); pintar();
});
$("#btn-sync").addEventListener("click", async (e) => {
  const b = e.currentTarget; b.disabled = true; b.textContent = "Actualizando…";
  try { await api("/sincronizar", { method: "POST" }); await cargar(); pintar(); } finally { b.disabled = false; b.textContent = "↻ Actualizar"; }
});

setInterval(() => { if (!$("#app").hidden && !document.hidden) cargar().then(pintar).catch(() => {}); }, 120000);
// Entrada desde el portal de empresas: el pase llega en #sso= y se canjea por una sesión (un solo uso).
(async () => {
  if (location.hash === "#tiktok-conectado") {
    history.replaceState(null, "", location.pathname + "#tiktok");
    const r = await fetch("/api/tiktok/canjear", { method: "POST", headers: { "Content-Type": "application/json" } }).then((x) => x.json()).catch(() => ({}));
    if (!r.ok && r.error) alert(r.error);
  }
  const pase = /^#sso=(.+)$/.exec(location.hash)?.[1];
  if (pase) {
    history.replaceState(null, "", location.pathname);
    await fetch("/api/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pase: decodeURIComponent(pase) }) }).catch(() => {});
  }
  entrar();
})();
