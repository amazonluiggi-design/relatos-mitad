import { Composition, Folder } from "remotion";
import { Perfil, PortadaFacebook, PortadaYouTube } from "./marca";
import { Plan, Reel, Relato } from "./Relato";
import { Miniatura } from "./Miniatura";
import cantuna from "./datos/cantuna-plan.json";
import llanganates from "./datos/llanganates-plan.json";
import damaTapada from "./datos/dama-tapada-plan.json";
import padreAlmeida from "./datos/padre-almeida-plan.json";

// Mientras falten imágenes, se usa la portada como relleno para revisar el montaje.
const relleno = (p: Plan): Plan => {
  const f = (e: Plan["escenas"][number]) => ({ ...e, h: e.h ?? "marca/banner-fondo.jpg" });
  return { ...p, escenas: p.escenas.map(f), reels: p.reels.map((r) => ({ ...r, escenas: r.escenas.map(f) })) };
};
const HISTORIAS: Record<string, Plan> = { cantuna: relleno(cantuna as Plan), llanganates: relleno(llanganates as Plan), "dama-tapada": relleno(damaTapada as Plan), "padre-almeida": relleno(padreAlmeida as Plan) };
const MINIATURAS: Record<string, React.ComponentProps<typeof Miniatura>> = {
  "padre-almeida": { cara: "padre-almeida/h/f1.jpg", fondo: "padre-almeida/h/c1.jpg", linea1: "¿HASTA", linea2: "CUÁNDO?", dato: "QUITO · SIGLO XVIII" },
  "dama-tapada": { cara: "dama-tapada/h/g3.jpg", fondo: "dama-tapada/h/g1.jpg", linea1: "NO LA", linea2: "SIGAS", dato: "GUAYAQUIL · LEYENDA COLONIAL" },
  llanganates: { cara: "llanganates/h/v3.jpg", fondo: "llanganates/h/i4.jpg", linea1: "EL ORO", linea2: "MALDITO", dato: "LLANGANATES · ECUADOR" },
  cantuna: { cara: "cantuna/h/c3.jpg", fondo: "cantuna/h/x4.jpg", linea1: "LE GANÓ", linea2: "AL DIABLO", dato: "QUITO · SIGLO XVI" },
};
const MUSICA = "musica/fondo.mp3";

export const Root: React.FC = () => (
  <>
    <Folder name="Marca">
      <Composition id="Perfil" component={Perfil} width={1080} height={1080} fps={30} durationInFrames={1} />
      <Composition id="PortadaYouTube" component={PortadaYouTube} width={2560} height={1440} fps={30} durationInFrames={1} />
      <Composition id="PortadaFacebook" component={PortadaFacebook} width={1640} height={624} fps={30} durationInFrames={1} />
    </Folder>
    {Object.entries(HISTORIAS).map(([id, plan]) => (
      <Folder key={id} name={id}>
        <Composition id={`${id}-miniatura`} component={Miniatura} width={1280} height={720} fps={30} durationInFrames={1} defaultProps={MINIATURAS[id]} />
        <Composition id={`${id}-largo`} component={Relato} width={1920} height={1080} fps={30} durationInFrames={plan.total} defaultProps={{ plan, musica: MUSICA }} />
        {(plan.episodios || []).map((e, i) => (
          <Composition key={e.id} id={`${id}-${e.id}`} component={Relato} width={1920} height={1080} fps={30} durationInFrames={e.total}
            defaultProps={{ plan: { ...plan, escenas: e.escenas, total: e.total, cartel: i === 0 ? plan.cartel : null, capInicial: e.capInicial, reels: [], episodios: [] }, musica: MUSICA }} />
        ))}
        {plan.reels.map((r) => (
          <Composition key={r.id} id={`${id}-${r.id}`} component={Reel} width={1080} height={1920} fps={30} durationInFrames={r.total} defaultProps={{ reel: r, musica: "musica/reel.mp3" }} />
        ))}
      </Folder>
    ))}
  </>
);
