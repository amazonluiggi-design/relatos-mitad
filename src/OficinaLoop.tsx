// Fondo animado de la oficina virtual del panel (bucle perfecto de 12 s).
// Todo movimiento es periódico con ciclos enteros dentro del bucle → el último cuadro empalma con el primero.
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const W = 1344, H = 768; // tamaño de la imagen base
const onda = (f: number, T: number, ciclos: number, fase = 0) => Math.sin((2 * Math.PI * ciclos * f) / T + fase);

// Monitores encendidos (coordenadas en la imagen base) y la pantalla grande del fondo.
const MONITORES: [number, number, number][] = [[120, 410, 70], [228, 395, 40], [362, 385, 40], [400, 382, 30], [680, 322, 95], [955, 383, 40], [1075, 392, 50], [1190, 402, 60]];

export const OficinaLoop: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: T } = useVideoConfig();
  // Cámara: acercamiento y paneo suaves (1 ciclo por bucle).
  const escala = 1.035 + 0.025 * (0.5 - 0.5 * Math.cos((2 * Math.PI * f) / T));
  const dx = 9 * onda(f, T, 1), dy = 4 * onda(f, T, 1, Math.PI / 2);

  const polvo = Array.from({ length: 46 }, (_, i) => {
    const x0 = random(`px${i}`) * W, y0 = random(`py${i}`) * H, k = 1 + Math.floor(random(`pk${i}`) * 2); // 1-2 vueltas por bucle
    const y = (((y0 - (k * H * f) / T) % H) + H) % H;
    const x = x0 + 14 * onda(f, T, 2, i);
    const borde = Math.min(y / 120, (H - y) / 120, 1);
    return { x, y, r: 0.8 + random(`pr${i}`) * 1.6, o: (0.15 + random(`po${i}`) * 0.35) * borde };
  });
  const ciudad = Array.from({ length: 34 }, (_, i) => ({
    x: 1045 + random(`cx${i}`) * 290, y: 300 + random(`cy${i}`) * 150,
    o: 0.35 + 0.35 * onda(f, T, 1 + Math.floor(random(`cc${i}`) * 4), random(`cf${i}`) * 6),
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0a09", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${escala})`, transformOrigin: "50% 48%" }}>
        <Img src={staticFile("panel/oficina-base.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <radialGradient id="pant"><stop offset="0" stopColor="#bfe3ff" stopOpacity="0.55" /><stop offset="1" stopColor="#bfe3ff" stopOpacity="0" /></radialGradient>
            <radialGradient id="calida"><stop offset="0" stopColor="#ffb766" stopOpacity="0.5" /><stop offset="1" stopColor="#ffb766" stopOpacity="0" /></radialGradient>
            <linearGradient id="cove" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ffb05a" stopOpacity="0.35" /><stop offset="1" stopColor="#ffb05a" stopOpacity="0" /></linearGradient>
          </defs>
          {/* Luz de techo que respira */}
          <rect x="0" y="0" width={W} height="230" fill="url(#cove)" opacity={0.35 + 0.15 * onda(f, T, 2)} style={{ mixBlendMode: "screen" }} />
          {/* Repisas iluminadas */}
          <ellipse cx="478" cy="300" rx="90" ry="110" fill="url(#calida)" opacity={0.25 + 0.1 * onda(f, T, 3, 1)} style={{ mixBlendMode: "screen" }} />
          <ellipse cx="875" cy="300" rx="90" ry="110" fill="url(#calida)" opacity={0.25 + 0.1 * onda(f, T, 3, 2.4)} style={{ mixBlendMode: "screen" }} />
          {/* Monitores: cada uno late a su ritmo (trabajo en pantalla) */}
          {MONITORES.map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx={r * 1.4} ry={r} fill="url(#pant)" opacity={0.3 + 0.25 * Math.max(0, onda(f, T, 3 + (i % 4), i * 1.7))} style={{ mixBlendMode: "screen" }} />
          ))}
          {/* Ciudad por los ventanales */}
          {ciudad.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r="1.6" fill="#ffd9a0" opacity={c.o} />)}
          {/* Polvo en la luz */}
          {polvo.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#ffe2b8" opacity={p.o} />)}
        </svg>
      </AbsoluteFill>
      {/* Viñeta cinematográfica */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
