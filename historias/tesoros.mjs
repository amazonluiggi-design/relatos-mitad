// Recopilatorio: "3 tesoros que nadie ha encontrado". Escenas ya montadas de otras historias (sin voz nueva).
// Se arma con scripts/recopilar.mjs (planear.mjs lo detecta por RECOPILAR); FUENTES = historias de las que salen.
export const HISTORIA = { id: "tesoros", titulo: "Tesoros que nadie ha encontrado", escenas: [] };
export const FUENTES = ["llanganates", "isla-plata", "el-dorado"];
export const RECOPILAR = [
  {
    id: "reel1", gancho: "3 tesoros que nadie ha encontrado", cierre: "Las 3 historias completas, en el canal",
    partes: [
      { rotulo: "1 · Los Llanganates", escenas: ["llanganates:g2", "llanganates:g4"] },
      { rotulo: "2 · Isla de la Plata", escenas: ["isla-plata:g1", "isla-plata:g4"] },
      { rotulo: "3 · La laguna de El Dorado", escenas: ["el-dorado:g1", "el-dorado:g3"] },
    ],
  },
];
