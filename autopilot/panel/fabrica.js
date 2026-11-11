// Fábrica y tendencias: los videos que el equipo mandó a producir, qué funciona en cada red (medianas reales)
// y qué está de moda afuera (Google Trends Ecuador + los videos del nicho que más se ven en YouTube).
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const num = (n) => Number(n || 0).toLocaleString("es-EC");
const cuando = (s, op = { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) => s ? new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z").toLocaleString("es-EC", { timeZone: "America/Guayaquil", ...op }) : "";
const RED = { youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook" };
const PASOS = ["pedida", "produciendo", "renderizando", "lista"];
const PASO_N = { pedida: "Pedida", produciendo: "Voz e imágenes", renderizando: "Render", lista: "Programada" };
const FORMATO = { reel: "Reels", parte: "Partes", largo: "Largos", episodio: "Episodios" };

function produccion(p) {
  const n = PASOS.indexOf(p.estado);
  return `<div class="tarjeta historia rev">
    <div class="historia-cab"><div><span class="nd">Pedida por ${esc(p.pedida_por)} · ${esc(cuando(p.creada))}</span><h4>${esc(p.titulo || p.id)}</h4></div>
      <span class="chip ${p.estado === "lista" ? "publicado" : p.estado === "error" ? "fallido" : "enviado"}">${p.estado === "error" ? "Error" : esc(PASO_N[p.estado] || p.estado)}</span></div>
    <p class="historia-nota">${num(p.escenas)} escenas · ${num(p.reels)} reels${p.largo ? ` · largo el ${esc(cuando(p.largo, { day: "numeric", month: "long" }))}` : " · sin video largo"}${p.detalle ? `<br>${esc(p.detalle)}` : ""}</p>
    ${p.estado === "error" ? "" : `<div class="pasos">${PASOS.map((x, i) => `<span class="${i <= n ? "hecho" : ""}">${PASO_N[x]}</span>`).join("")}</div>`}
  </div>`;
}

function red(id, d) {
  const u = d.ultimos_7_dias, a = d.los_7_dias_anteriores;
  const cambio = a.n >= 3 && a.mediana ? Math.round((u.mediana / a.mediana - 1) * 100) : null;
  const lista = (titulo, filas, nombre = (g) => g) => filas.length ? `<p class="nd fab-sub">${titulo}</p><ul class="fab-barras">${filas.slice(0, 5).map((g) =>
    `<li><span>${esc(nombre(g.grupo))}</span><i style="--w:${Math.max(3, Math.round(g.mediana / Math.max(1, filas[0].mediana) * 100))}%"></i><b>${num(g.mediana)}</b><small>${g.n} videos${g.muestra_chica ? " · pocos datos" : ""}</small></li>`).join("")}</ul>` : "";
  const oro = d.tema_oro_y_tesoros;
  return `<div class="tarjeta rev"><h3><span class="chip ${id}">${RED[id]}</span> ${num(d.mediana)} vistas por video <span class="nd">(mediana de ${d.n})</span></h3>
    <p class="nd">Últimos 7 días: <b>${num(u.mediana)}</b> por video (${u.n})${cambio == null ? "" : ` · <b class="${cambio < 0 ? "baja" : "sube"}">${cambio > 0 ? "+" : ""}${cambio} %</b> frente a los 7 anteriores`}</p>
    ${lista("Por historia", d.por_historia)}${lista("Por formato", d.por_formato, (g) => FORMATO[g] || g)}${lista("Por hora de Ecuador", d.por_hora_ecuador)}
    ${oro.con.n >= 3 && oro.sin.n >= 3 ? `<p class="nd fab-sub">Con oro o tesoros en el título: <b>${num(oro.con.mediana)}</b> · sin eso: <b>${num(oro.sin.mediana)}</b></p>` : ""}
  </div>`;
}

export function fabricaHtml(d) {
  const t = d.tendencias, yt = Object.entries(t.youtube_nicho || {}).sort((a, b) => b[1].dia.localeCompare(a[1].dia));
  return `<h2 class="casa-titulo">Fábrica y tendencias</h2>
    ${d.analisis.alertas.map((a) => `<div class="tarjeta fab-alerta rev">⚠ ${esc(a)}</div>`).join("")}
    <h3 class="fab-t">🎬 Videos que el equipo mandó a producir</h3>
    <div class="rejilla r2">${d.producciones.map(produccion).join("") || `<div class="vacio">Todavía no hay pedidos. Ryan escribe el guion, Dwight lo aprueba con 85 o más y Michael lo manda aquí.</div>`}</div>
    <h3 class="fab-t">📊 Qué funciona de verdad <span class="nd">· ${esc(d.analisis.nota)}</span></h3>
    <div class="rejilla r3">${Object.entries(d.analisis.por_red).map(([k, v]) => red(k, v)).join("")}</div>
    <h3 class="fab-t">🔥 Qué está de moda afuera <span class="nd">· se actualiza una vez al día · el equipo lo lee antes de elegir temas</span></h3>
    <div class="rejilla r2">
      <div class="tarjeta rev"><h3>Lo más buscado hoy en Ecuador <span class="nd">(Google)</span></h3>
        ${t.google_ecuador?.length ? `<ol class="fab-temas">${t.google_ecuador.slice(0, 12).map((x) => `<li>${esc(x.tema)} <span class="nd">${esc(x.busquedas)}</span></li>`).join("")}</ol>` : `<div class="vacio">Sin datos de Google hoy.</div>`}</div>
      <div class="tarjeta rev"><h3>Videos del nicho que más se vieron <span class="nd">(YouTube, 30 días)</span></h3>
        ${yt.length ? yt.map(([q, r]) => `<p class="nd fab-sub">Búsqueda «${esc(q)}» · ${esc(r.dia)}</p><ul class="memoria">${r.videos.slice(0, 5).map((v) =>
          `<li><a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.titulo)}</a><br><span class="nd">${esc(v.canal)} · ${num(v.vistas)} vistas · ${esc(v.duracion)} · ${esc(v.publicado)}</span></li>`).join("")}</ul>`).join("") : `<div class="vacio">Sin datos de YouTube todavía.</div>`}</div>
    </div>
    ${t.errores?.length ? `<p class="nd">Fuentes con problema hoy: ${esc(t.errores.join(" · "))}</p>` : ""}`;
}
