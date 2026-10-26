import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, Easing, random, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { AMBAR, TEXTO, TITULO } from "./marca";

export type Palabra = { texto: string; desde: number; hasta: number };
export type Escena = {
  id: string; mov: string; h: string | null; v: string | null; desde: number; cuadros: number;
  clip?: { src: string; dur: number } | null; // video animado (Flow/Veo) que reemplaza la imagen
  audio: { archivo: string; recorte: number; duracion: number };
  palabras: Palabra[]; capitulo: string | null;
};
export type Plan = {
  fps: number; total: number; titulo: string; escenas: Escena[];
  cartel: { en: string; titulo: string; sub: string } | null;
  reels: (Omit<Plan, "reels" | "titulo" | "cartel"> & { id: string; gancho: string; cierre: string })[];
};

const ENTRA = 14; // cuadros de fundido entre imágenes
const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// Movimiento de cámara lento (Ken Burns) según la escena.
const KenBurns: React.FC<{ src: string; mov: string; dur: number; fondo?: boolean }> = ({ src, mov, dur, fondo }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const m: Record<string, [number, number, number, number, number, number]> = {
    // escala inicial, final, x inicial, x final, y inicial, y final (en %)
    acercar: [1.04, 1.16, 0, 0, 0, 0],
    alejar: [1.18, 1.05, 0, 0, 0, 0],
    derecha: [1.12, 1.12, -3.5, 3.5, 0, 0],
    izquierda: [1.12, 1.12, 3.5, -3.5, 0, 0],
    subir: [1.14, 1.1, 0, 0, 3, -3],
  };
  const [s0, s1, x0, x1, y0, y1] = m[mov] || m.acercar;
  const s = s0 + (s1 - s0) * p;
  return (
    <Img
      src={staticFile(src)}
      style={{
        width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${s}) translate(${x0 + (x1 - x0) * p}%, ${y0 + (y1 - y0) * p}%)`,
        filter: fondo ? "blur(28px) brightness(.55)" : undefined,
      }}
    />
  );
};

// Clip animado sobre la imagen: arranca con la escena, acerca un poco la cámara y, si se acaba
// antes que la escena, se funde de vuelta a la imagen. Va mudo (la narración manda).
const Clip: React.FC<{ clip: NonNullable<Escena["clip"]>; dur: number; fondo?: boolean }> = ({ clip, dur, fondo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const largo = Math.min(dur, Math.floor(clip.dur * fps) - 2);
  const opacidad = interpolate(f, [largo - 12, largo], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = interpolate(f, [0, dur], [1.02, 1.08]);
  return (
    <Sequence durationInFrames={largo} layout="none">
      <AbsoluteFill style={{ opacity: opacidad }}>
        <OffthreadVideo src={staticFile(clip.src)} muted style={{
          width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s})`,
          // Iguala el color al resto del relato (sombras frías, luces cálidas).
          filter: fondo ? "blur(28px) brightness(.55)" : "saturate(1.08) contrast(1.06) sepia(.12) hue-rotate(-8deg)",
        }} />
      </AbsoluteFill>
    </Sequence>
  );
};

const Fondo: React.FC<{ e: Escena; dur: number }> = ({ e, dur }) => (
  <AbsoluteFill>
    <KenBurns src={e.h!} mov={e.mov} dur={dur} />
    {e.clip && <Clip clip={e.clip} dur={dur} />}
  </AbsoluteFill>
);

// Imagen vertical: si no hay versión 9:16, la horizontal va al centro sobre su propio fondo desenfocado.
// Con clip (siempre 16:9) se usa el mismo recurso: clip al centro y su versión desenfocada de fondo.
const CuadroVertical: React.FC<{ e: Escena; dur: number }> = ({ e, dur }) => {
  if (e.clip) {
    return (
      <AbsoluteFill>
        {e.v ? <KenBurns src={e.v} mov={e.mov} dur={dur} /> : <KenBurns src={e.h!} mov="acercar" dur={dur} fondo />}
        <Clip clip={e.clip} dur={dur} fondo />
        <AbsoluteFill style={{ justifyContent: "center" }}>
          <div style={{ width: "100%", aspectRatio: "16 / 9", overflow: "hidden", transform: "scale(1.45)" }}>
            <Clip clip={e.clip} dur={dur} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (e.v) return <KenBurns src={e.v} mov={e.mov} dur={dur} />;
  return (
    <AbsoluteFill>
      <KenBurns src={e.h!} mov="acercar" dur={dur} fondo />
      <AbsoluteFill style={{ justifyContent: "center" }}>
        <div style={{ width: "100%", aspectRatio: "16 / 9", overflow: "hidden", transform: "scale(1.45)" }}>
          <KenBurns src={e.h!} mov={e.mov} dur={dur} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Fundido: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, ENTRA], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};

// Subtítulos por grupos de hasta 6 palabras; la palabra que suena va en ámbar.
const Subtitulos: React.FC<{ palabras: Palabra[]; vertical?: boolean }> = ({ palabras, vertical }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const grupos: Palabra[][] = [];
  for (const p of palabras) {
    const g = grupos.at(-1);
    if (!g || g.length >= (vertical ? 4 : 7) || /[.?!…»,]$/.test(g.at(-1)!.texto)) grupos.push([p]);
    else g.push(p);
  }
  const g = grupos.find((x, i) => t < (grupos[i + 1]?.[0].desde ?? Infinity)) ?? grupos.at(-1)!;
  if (t < g[0].desde - 0.15) return null;
  return (
    <AbsoluteFill style={{ justifyContent: vertical ? "center" : "flex-end", alignItems: "center", paddingBottom: vertical ? 0 : 70, top: vertical ? 520 : 0 }}>
      <div style={{
        fontFamily: TEXTO, fontWeight: 600, fontSize: vertical ? 64 : 50, lineHeight: 1.25, textAlign: "center",
        maxWidth: vertical ? 900 : 1500, color: "#F5EBDD",
        textShadow: "0 0 6px #000, 0 3px 14px rgba(0,0,0,.95), 0 0 30px rgba(0,0,0,.8)",
      }}>
        {g.map((p, i) => {
          const activa = t >= p.desde - 0.05 && t < p.hasta + 0.05;
          return (
            <span key={i} style={{ color: activa ? AMBAR : undefined, transition: "none" }}>
              {p.texto.replace(/[«»]/g, "")}{i < g.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Grano: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,.72) 100%)" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(random(f) * 1000)} /></filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

const Capitulo: React.FC<{ n: number; nombre: string }> = ({ n, nombre }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 12, 100, 120], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(f, [0, 18], [-30, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 90, top: 80, opacity: a, transform: `translateX(${x}px)`, textShadow: "0 2px 12px #000" }}>
      <div style={{ fontFamily: TITULO, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: AMBAR }}>CAPÍTULO {ROMANOS[n]}</div>
      <div style={{ height: 2, width: 80, background: AMBAR, margin: "10px 0 12px" }} />
      <div style={{ fontFamily: TITULO, fontWeight: 700, fontSize: 46, color: "#F5EBDD" }}>{nombre}</div>
    </div>
  );
};

const Cartel: React.FC<{ titulo: string; sub: string; escala?: number }> = ({ titulo, sub, escala = 1 }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 20, 130, 150], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const esp = interpolate(f, [0, 150], [26, 14]) * escala;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: a, background: "rgba(0,0,0,.35)" }}>
      <div style={{ fontFamily: TITULO, fontWeight: 900, fontSize: 150 * escala, letterSpacing: esp, color: "#F5EBDD", textShadow: "0 0 50px rgba(0,0,0,.9)" }}>{titulo}</div>
      <div style={{ height: 3, width: 260 * escala, background: AMBAR, margin: `${18 * escala}px 0` }} />
      <div style={{ fontFamily: TITULO, fontWeight: 700, fontSize: 44 * escala, letterSpacing: 4 * escala, color: AMBAR, textAlign: "center" }}>{sub}</div>
    </AbsoluteFill>
  );
};

const Firma: React.FC<{ escala?: number; texto?: string }> = ({ escala = 1, texto = "Suscríbete para el próximo relato" }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: a, background: "rgba(0,0,0,.6)" }}>
      <div style={{ fontFamily: TITULO, fontWeight: 900, fontSize: 110 * escala, letterSpacing: 10 * escala, color: "#F5EBDD" }}>RELATOS</div>
      <div style={{ fontFamily: TITULO, fontWeight: 700, fontSize: 48 * escala, letterSpacing: 8 * escala, color: AMBAR }}>DE LA MITAD</div>
      <div style={{ fontFamily: TEXTO, fontWeight: 600, fontSize: 34 * escala, color: "#E9DFD0", marginTop: 34 * escala, textAlign: "center", maxWidth: 900 }}>{texto}</div>
    </AbsoluteFill>
  );
};

const Voz: React.FC<{ e: Escena }> = ({ e }) => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      src={staticFile(e.audio.archivo)}
      trimBefore={Math.round(e.audio.recorte * fps)}
      trimAfter={Math.round((e.audio.recorte + e.audio.duracion) * fps)}
    />
  );
};

const Musica: React.FC<{ total: number; src?: string }> = ({ total, src }) => {
  if (!src) return null;
  return <Audio src={staticFile(src)} loop volume={(f) => interpolate(f, [0, 60, total - 90, total], [0, 0.13, 0.13, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />;
};

export const Relato: React.FC<{ plan: Plan; musica?: string }> = ({ plan, musica }) => {
  let cap = -1;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {plan.escenas.map((e) => (
        <Sequence key={e.id} from={Math.max(0, e.desde - ENTRA)} durationInFrames={e.cuadros + ENTRA * 2}>
          <Fundido><Fondo e={e} dur={e.cuadros + ENTRA * 2} /></Fundido>
        </Sequence>
      ))}
      <Grano />
      {plan.escenas.map((e) => {
        if (e.capitulo) cap++;
        const n = cap;
        return (
          <Sequence key={e.id} from={e.desde} durationInFrames={e.cuadros}>
            <Voz e={e} />
            <Subtitulos palabras={e.palabras} />
            {e.capitulo && <Capitulo n={n} nombre={e.capitulo} />}
            {plan.cartel?.en === e.id && <Cartel titulo={plan.cartel.titulo} sub={plan.cartel.sub} />}
          </Sequence>
        );
      })}
      <Sequence from={plan.total - 75}><Firma /></Sequence>
      <Musica total={plan.total} src={musica} />
    </AbsoluteFill>
  );
};

// Reel vertical 9:16: gancho escrito arriba al inicio y cierre que manda al canal.
export const Reel: React.FC<{ reel: Plan["reels"][number]; musica?: string }> = ({ reel, musica }) => {
  const f = useCurrentFrame();
  const gancho = interpolate(f, [0, 8, 75, 90], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {reel.escenas.map((e) => (
        <Sequence key={e.id} from={Math.max(0, e.desde - ENTRA)} durationInFrames={e.cuadros + ENTRA * 2}>
          <Fundido><CuadroVertical e={e} dur={e.cuadros + ENTRA * 2} /></Fundido>
        </Sequence>
      ))}
      <Grano />
      {reel.escenas.map((e) => (
        <Sequence key={e.id} from={e.desde} durationInFrames={e.cuadros}>
          <Voz e={e} />
          <Subtitulos palabras={e.palabras} vertical />
        </Sequence>
      ))}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 300, opacity: gancho }}>
        <div style={{
          fontFamily: TITULO, fontWeight: 900, fontSize: 76, lineHeight: 1.12, color: "#F5EBDD", textAlign: "center",
          maxWidth: 940, textShadow: "0 0 30px #000, 0 4px 16px #000",
        }}>{reel.gancho}</div>
      </AbsoluteFill>
      <Sequence from={reel.total - 96}><Firma escala={1.1} texto={reel.cierre} /></Sequence>
      <Musica total={reel.total} src={musica} />
    </AbsoluteFill>
  );
};
