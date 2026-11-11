// Qué funciona y qué no, calculado sobre las publicaciones propias. Los agentes lo reciben ya hecho en el contexto
// (antes cada uno lo recalculaba a mano y casi nunca miraba el tema de la historia). Sin dependencias: se prueba con node.
export type PubA = { red: string; cuando: string; titulo: string; gancho?: string | null; tipo: string; historia_id: string; vistas: number | null };

const ORO = /\boro\b|tesoro|plata|mapa|riquez|mina\b|bot[ií]n|millon/i;
const mediana = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};
const resumen = (l: PubA[]) => ({ n: l.length, mediana: mediana(l.map((p) => p.vistas || 0)) });

/** Agrupa y ordena por mediana. Con menos de 3 publicaciones el grupo no se muestra; con menos de 5 se marca como muestra chica. */
function grupos(l: PubA[], clave: (p: PubA) => string) {
  const g: Record<string, PubA[]> = {};
  for (const p of l) (g[clave(p)] ??= []).push(p);
  return Object.entries(g).filter(([, v]) => v.length >= 3)
    .map(([k, v]) => ({ grupo: k, ...resumen(v), ...(v.length < 5 ? { muestra_chica: true } : {}) })).sort((a, b) => b.mediana - a.mediana);
}

export function analizar(pubs: PubA[], ahora = Date.now()) {
  const DIA = 86400e3;
  // Lo que salió hace menos de 24 h todavía está sumando vistas: no se compara.
  const ok = pubs.filter((p) => p.vistas != null && Date.parse(p.cuando) < ahora - DIA);
  const horaEc = (c: string) => `${String((new Date(c).getUTCHours() + 19) % 24).padStart(2, "0")} h`;
  const ficha = (p: PubA) => ({ titulo: p.titulo, gancho: p.gancho || null, formato: p.tipo, historia: p.historia_id, vistas: p.vistas, salio: p.cuando.slice(0, 10), hora: horaEc(p.cuando) });
  const alertas: string[] = [];
  const por_red: Record<string, unknown> = {};
  for (const red of ["youtube", "tiktok", "facebook"]) {
    const l = ok.filter((p) => p.red === red);
    if (!l.length) continue;
    const edad = (p: PubA) => (ahora - Date.parse(p.cuando)) / DIA;
    const ult = l.filter((p) => edad(p) <= 8), prev = l.filter((p) => edad(p) > 8 && edad(p) <= 15);
    const u = resumen(ult), a = resumen(prev);
    if (u.n >= 5 && a.n >= 5 && a.mediana >= 20 && u.mediana < a.mediana * 0.4)
      alertas.push(`${red}: caída fuerte. La mediana por video pasó de ${a.mediana} a ${u.mediana} vistas (últimos 7 días contra los 7 anteriores). Antes de producir más para esta red, hay que entender por qué.`);
    const oro = l.filter((p) => ORO.test(`${p.titulo} ${p.gancho || ""}`)), sinOro = l.filter((p) => !ORO.test(`${p.titulo} ${p.gancho || ""}`));
    const orden = [...l].sort((x, y) => (y.vistas || 0) - (x.vistas || 0));
    por_red[red] = {
      ...resumen(l), ultimos_7_dias: u, los_7_dias_anteriores: a,
      por_historia: grupos(l, (p) => p.historia_id), por_formato: grupos(l, (p) => p.tipo), por_hora_ecuador: grupos(l, (p) => horaEc(p.cuando)),
      tema_oro_y_tesoros: { con: resumen(oro), sin: resumen(sinOro) },
      mejores: orden.slice(0, 5).map(ficha), peores_recientes: [...ult].sort((x, y) => (x.vistas || 0) - (y.vistas || 0)).slice(0, 3).map(ficha),
    };
  }
  return { nota: "Medianas de vistas por video (solo videos con más de 24 h). Un grupo con muestra_chica es una pista, no una prueba.", alertas, por_red };
}
