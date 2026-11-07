// Mensaje que vuela de Michael a cada trabajador en la oficina virtual: sobre dorado sellado con brillo y chispas.
// Fondo transparente (WebM VP9 con canal alfa) y bucle perfecto de 1 s.
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";

export const MensajeVuela: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: T, width: W } = useVideoConfig();
  const fase = (2 * Math.PI * f) / T;
  const brillo = 0.55 + 0.45 * Math.sin(fase);
  const chispas = Array.from({ length: 14 }, (_, i) => {
    const a = random(`a${i}`) * Math.PI * 2 + fase * (random(`v${i}`) > 0.5 ? 1 : -1);
    const r = W * (0.3 + 0.12 * random(`r${i}`));
    return { x: W / 2 + Math.cos(a) * r, y: W / 2 + Math.sin(a) * r * 0.7, s: 2 + 3 * random(`s${i}`), o: 0.4 + 0.6 * Math.abs(Math.sin(fase * 2 + i)) };
  });
  const flota = Math.sin(fase) * 4;
  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <svg viewBox={`0 0 ${W} ${W}`} width={W} height={W}>
        <defs>
          <radialGradient id="halo"><stop offset="0" stopColor="#ffd98a" stopOpacity={0.75 * brillo} /><stop offset="1" stopColor="#ffb347" stopOpacity="0" /></radialGradient>
          <linearGradient id="sobre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff1c9" /><stop offset="1" stopColor="#e2b25a" /></linearGradient>
          <linearGradient id="solapa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6d38b" /><stop offset="1" stopColor="#c99337" /></linearGradient>
        </defs>
        <circle cx={W / 2} cy={W / 2} r={W * 0.46} fill="url(#halo)" />
        {chispas.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.s} fill="#fff4d6" opacity={c.o} />)}
        <g transform={`translate(${W / 2} ${W / 2 + flota}) rotate(${Math.sin(fase) * 4})`}>
          <rect x={-W * 0.24} y={-W * 0.16} width={W * 0.48} height={W * 0.32} rx={W * 0.03} fill="url(#sobre)" stroke="#9c6b21" strokeWidth={2} />
          <path d={`M ${-W * 0.24} ${-W * 0.16} L 0 ${W * 0.03} L ${W * 0.24} ${-W * 0.16} Z`} fill="url(#solapa)" stroke="#9c6b21" strokeWidth={2} strokeLinejoin="round" />
          <circle cx={0} cy={W * 0.03} r={W * 0.055} fill="#8e1f1f" stroke="#5e1010" strokeWidth={2} />
          <text x={0} y={W * 0.052} textAnchor="middle" fontSize={W * 0.06} fontFamily="Georgia, serif" fontWeight={700} fill="#f6d38b">R</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
