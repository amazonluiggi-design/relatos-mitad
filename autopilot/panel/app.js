// Panel de Relatos Autopilot. Todo el texto que viene de la base se escapa antes de pintarse.
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const ZONA = "America/Guayaquil";
const fecha = (iso, op) => new Date(iso).toLocaleString("es-EC", { timeZone: ZONA, ...op });
const num = (n) => (n === null || n === undefined ? null : Number(n).toLocaleString("es-EC"));
const REDES = { facebook: { nombre: "Facebook", c: "var(--fb)", i: "f" }, youtube: { nombre: "YouTube", c: "var(--yt)", i: "▶" }, tiktok: { nombre: "TikTok", c: "var(--tt)", i: "♪" } };
const ESTADO = { pendiente: "En agenda", programado: "Programado", enviado: "Enviando", publicado: "Publicado", privado: "Privado", fallido: "Falló" };
const TITULOS = { resumen: "Resumen", historias: "Historias", animar: "Animar", agenda: "Agenda", videos: "Videos", facebook: "Facebook", youtube: "YouTube", tiktok: "TikTok", actividad: "Actividad" };

async function api(ruta, op = {}) {
  const r = await fetch("/api" + ruta, { ...op, headers: { "Content-Type": "application/json", ...(op.headers || {}) } });
  if (r.status === 401) { mostrarLogin(); throw new Error("sin sesión"); }
  return r.json();
}

/* ───── Sesión ───── */
function mostrarLogin() { $("#app").hidden = true; $("#login").hidden = false; $("#clave").focus(); }
$("#form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#login-error").textContent = "";
  const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clave: $("#clave").value }) });
  const j = await r.json();
  if (!r.ok) { $("#login-error").textContent = j.error; return; }
  $("#clave").value = "";
  iniciar();
});
$("#salir").addEventListener("click", async () => { await fetch("/api/salir", { method: "POST" }); mostrarLogin(); });

/* ───── Datos ───── */
let datos = { resumen: null, pubs: [], serie: [], historias: [], animaciones: [] };
async function cargar() {
  const [resumen, pubs, serie, historias, animaciones] = await Promise.all([api("/resumen"), api("/publicaciones"), api("/serie"), api("/historias"), api("/animaciones")]);
  datos = { resumen, pubs, serie, historias, animaciones };
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
    <div class="item-txt"><b>${esc(v.titulo)}</b><span class="nd">${v.tipo === "largo" ? "Video largo" : "Reel"} · ${esc(v.historia_id)}</span>
      <div class="chips">${v.redes.map(chip).join("")}</div></div></div>`;
}

function grafico(serie) {
  if (!serie.some((s) => s.vistas > 0)) return `<div class="vacio">El gráfico aparece cuando las redes empiecen a reportar vistas (se revisa cada hora).</div>`;
  const dias = [...new Set(serie.map((s) => s.dia))];
  const max = Math.max(1, ...serie.map((s) => s.vistas || 0));
  const W = 600, H = 200, x = (i) => (dias.length === 1 ? W / 2 : (i / (dias.length - 1)) * W), y = (v) => H - 10 - (v / max) * (H - 30);
  const lineas = Object.keys(REDES).map((red) => {
    const pts = dias.map((d, i) => { const s = serie.find((z) => z.dia === d && z.red === red); return s ? `${x(i)},${y(s.vistas || 0)}` : null; }).filter(Boolean);
    return pts.length ? `<polyline fill="none" stroke="${REDES[red].c}" stroke-width="3" stroke-linejoin="round" points="${pts.join(" ")}"/>${pts.map((p) => `<circle cx="${p.split(",")[0]}" cy="${p.split(",")[1]}" r="4" fill="${REDES[red].c}"/>`).join("")}` : "";
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Vistas por día">
      <line x1="0" y1="${H - 10}" x2="${W}" y2="${H - 10}" stroke="var(--borde)"/>${lineas}</svg>
    <div class="leyenda">${Object.values(REDES).map((r) => `<span><i style="background:${r.c}"></i>${r.nombre}</span>`).join("")}<span>Máx. ${num(max)} vistas/día</span></div>`;
}

const eventosHtml = (ev) => ev.length ? ev.map((e) => `<div class="evento"><span class="punto ${esc(e.nivel)}"></span><div>${esc(e.mensaje)}<time>${esc(fecha(e.cuando.replace(" ", "T") + "Z", { dateStyle: "short", timeStyle: "short" }))}${e.red ? " · " + esc(REDES[e.red]?.nombre || e.red) : ""}</time></div></div>`).join("") : `<div class="vacio">Sin actividad todavía.</div>`;

/* ───── Vistas ───── */
const VISTAS = {
  resumen() {
    const { resumen, pubs, serie } = datos;
    const ahora = new Date().toISOString();
    const sig = [...datos.historias].filter((h) => h.estado !== "publicado").sort((a, b) => (a.semana || "").localeCompare(b.semana || ""))[0];
    const proximas = porVideo(pubs.filter((p) => p.cuando >= ahora.slice(0, 10) && !["publicado", "privado"].includes(p.estado))).slice(0, 6);
    return `<div class="rejilla r3">${Object.keys(REDES).map((r) => tarjetaRed(r, resumen.cuentas[r])).join("")}</div>
      <div class="rejilla r2 seccion">
        <div class="tarjeta"><h3>Lo que viene</h3><div class="lista">${proximas.map(itemAgenda).join("") || `<div class="vacio">No hay publicaciones en agenda.</div>`}</div></div>
        <div class="tarjeta"><h3>Actividad reciente</h3>${eventosHtml(resumen.eventos.slice(0, 10))}</div>
      </div>
      ${sig ? `<a class="tarjeta seccion historia red-tarjeta" href="#historias" style="--c:var(--ambar)"><span class="nd">Próxima historia · sale el ${esc(fecha(sig.semana + "T19:00:00-05:00", { weekday: "long", day: "numeric", month: "long" }))}</span><h4>${esc(sig.titulo)}</h4></a>` : ""}
      <div class="tarjeta seccion grafico"><h3>Vistas por día</h3>${grafico(serie)}</div>`;
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
          <em>${v.tipo === "largo" ? "Video largo" : "Reel"}</em>${v.archivo ? "<span>▶</span>" : ""}</button>
        <div class="video-info"><b>${esc(v.titulo)}</b><span class="nd">${esc(fecha(v.cuando, { dateStyle: "medium", timeStyle: "short" }))} · ${num(vistas)} vistas</span>
          <div class="chips">${v.redes.map(chip).join("")}</div></div></div>`;
    }).join("")}</div>`;
  },
  red(red) {
    const c = datos.resumen.cuentas[red], r = REDES[red];
    const lista = datos.pubs.filter((p) => p.red === red);
    const avisos = {
      facebook: c.vistas == null ? `<div class="aviso-caja">Las vistas de Facebook aparecerán cuando la app de Meta tenga el permiso <b>read_insights</b>. Mientras, el panel sigue el estado de cada publicación.</div>` : "",
      tiktok: lista.some((p) => p.estado === "privado") ? `<div class="aviso-caja">TikTok aún revisa la app: mientras tanto publica en <b>privado</b> y esos videos no suman vistas públicas.</div>` : "",
      youtube: lista.some((p) => p.estado === "privado") ? `<div class="aviso-caja">YouTube deja en privado los videos de apps sin auditoría de Google. Ya está pedida; mientras, se pueden pasar a públicos desde YouTube Studio.</div>` : "",
    };
    const filas = lista.map((p) => `<tr><td><b>${esc(p.titulo)}</b><br><span class="nd">${p.tipo === "largo" ? "Video largo" : "Reel"}</span></td>
      <td>${esc(fecha(p.cuando, { dateStyle: "short", timeStyle: "short" }))}</td><td>${chip(p)}</td>
      <td class="num">${p.vistas != null ? num(p.vistas) : "—"}</td><td class="num">${p.me_gusta != null ? num(p.me_gusta) : "—"}</td><td class="num">${p.comentarios != null ? num(p.comentarios) : "—"}</td>
      <td>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">Abrir ↗</a>` : ""}</td></tr>`).join("");
    return `${avisos[red]}<div class="rejilla r3">${tarjetaRed(red, c)}
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
  const cont = $("#vista");
  cont.innerHTML = html;
  cont.style.animation = "none"; void cont.offsetWidth; cont.style.animation = "";
}

/* ───── Eventos ───── */
window.addEventListener("hashchange", pintar);
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

async function iniciar() {
  $("#login").hidden = true; $("#app").hidden = false;
  $("#vista").innerHTML = `<div class="rejilla r3"><div class="cargando"></div><div class="cargando"></div><div class="cargando"></div></div>`;
  try { await cargar(); pintar(); } catch {}
}
setInterval(() => { if (!$("#app").hidden && !document.hidden) cargar().then(pintar).catch(() => {}); }, 120000);
iniciar();
