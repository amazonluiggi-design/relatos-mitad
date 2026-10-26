import { AbsoluteFill, Img, staticFile } from "remotion";
import { AMBAR, TEXTO, TITULO } from "./marca";

// Miniatura 1280x720: cara a la izquierda, frase grande a la derecha.
export const Miniatura: React.FC<{ cara: string; fondo: string; linea1: string; linea2: string; dato: string }> = ({ cara, fondo, linea1, linea2, dato }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Img src={staticFile(fondo)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.55) saturate(1.1)" }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: 720, overflow: "hidden", maskImage: "linear-gradient(90deg, #000 70%, transparent)" }}>
      <Img src={staticFile(cara)} style={{ height: "100%", width: "auto", transform: "translateX(-26%) scale(1.25)", transformOrigin: "50% 35%", filter: "contrast(1.12) saturate(1.15)" }} />
    </div>
    <div style={{ position: "absolute", right: 50, top: 0, bottom: 0, width: 640, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", textAlign: "right" }}>
      <div style={{ fontFamily: TEXTO, fontWeight: 600, fontSize: 30, letterSpacing: 4, color: "#F5EBDD", background: "rgba(0,0,0,.55)", padding: "6px 14px", marginBottom: 18 }}>{dato}</div>
      <div style={{ fontFamily: TITULO, fontWeight: 900, fontSize: 104, lineHeight: 0.98, color: "#FFF6E6", textShadow: "0 0 30px #000, 0 6px 0 #000" }}>{linea1}</div>
      <div style={{ fontFamily: TITULO, fontWeight: 900, fontSize: 112, lineHeight: 1, color: AMBAR, textShadow: "0 0 30px #000, 0 6px 0 #000" }}>{linea2}</div>
    </div>
  </AbsoluteFill>
);
