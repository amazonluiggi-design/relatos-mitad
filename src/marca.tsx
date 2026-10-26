import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as cinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as inter } from "@remotion/google-fonts/Inter";

export const { fontFamily: TITULO } = cinzel("normal", { weights: ["700", "900"], subsets: ["latin"] });
export const { fontFamily: TEXTO } = inter("normal", { weights: ["400", "600"], subsets: ["latin"] });
export const AMBAR = "#F2A33A";

const Nombre: React.FC<{ escala: number }> = ({ escala }) => (
  <div style={{ textAlign: "center", color: "#F5EBDD", textShadow: "0 0 40px rgba(0,0,0,.9), 0 4px 18px rgba(0,0,0,.9)" }}>
    <div style={{ fontFamily: TITULO, fontWeight: 900, fontSize: 118 * escala, letterSpacing: 10 * escala, lineHeight: 1 }}>
      RELATOS
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22 * escala, marginTop: 10 * escala }}>
      <div style={{ height: 3 * escala, width: 120 * escala, background: AMBAR }} />
      <div style={{ fontFamily: TITULO, fontWeight: 700, fontSize: 52 * escala, letterSpacing: 8 * escala, color: AMBAR }}>
        DE LA MITAD
      </div>
      <div style={{ height: 3 * escala, width: 120 * escala, background: AMBAR }} />
    </div>
  </div>
);

const Lema: React.FC<{ escala: number; texto: string }> = ({ escala, texto }) => (
  <div style={{ fontFamily: TEXTO, fontWeight: 600, fontSize: 30 * escala, color: "#E9DFD0", letterSpacing: 1.5 * escala, marginTop: 26 * escala, textShadow: "0 2px 12px #000", textAlign: "center" }}>
    {texto}
  </div>
);

export const Perfil: React.FC = () => (
  <AbsoluteFill style={{ background: "#07090c" }}>
    <Img src={staticFile("marca/perfil-fondo2.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.22) translateY(-3%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,.85) 72%)" }} />
    <AbsoluteFill style={{ border: `14px solid ${AMBAR}`, borderRadius: "50%", opacity: 0.85, inset: 22 }} />
  </AbsoluteFill>
);

// YouTube: 2560x1440; zona segura para todo dispositivo = 1546x423 al centro.
export const PortadaYouTube: React.FC = () => (
  <AbsoluteFill style={{ background: "#05080a" }}>
    <Img src={staticFile("marca/banner-fondo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.15) 50%, rgba(0,0,0,.55))" }} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ background: "radial-gradient(ellipse, rgba(0,0,0,.55), transparent 70%)", padding: "40px 120px" }}>
        <Nombre escala={1.25} />
        <Lema escala={1.15} texto="Leyendas, misterios e historias reales de Ecuador y Latinoamérica · Nuevo relato cada semana" />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

// Facebook: 1640x624 (en celular recorta los lados, el texto va al centro).
export const PortadaFacebook: React.FC = () => (
  <AbsoluteFill style={{ background: "#05080a" }}>
    <Img src={staticFile("marca/banner-fondo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%" }} />
    <AbsoluteFill style={{ background: "rgba(0,0,0,.35)" }} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Nombre escala={1} />
      <Lema escala={0.95} texto="Leyendas, misterios e historias reales · Nuevo relato cada semana" />
    </AbsoluteFill>
  </AbsoluteFill>
);
