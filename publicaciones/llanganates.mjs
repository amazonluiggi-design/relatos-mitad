// Textos y horarios de publicación de Llanganates (hora de Ecuador, UTC-5).
const YT = "https://www.youtube.com/@relatos.delamitad";
const TT = "https://www.tiktok.com/@relatosdelamitad";
const FB = "https://www.facebook.com/RelatosDeLaMitad";

export const PUBLICACION = {
  largo: {
    archivo: "out/llanganates-largo.mp4",
    miniatura: "out/llanganates-miniatura.jpg",
    titulo: "El tesoro de los Llanganates: el oro maldito de Rumiñahui",
    texto: `Un soldado español pobre se casó con una joven indígena… y su suegro lo llevó a la cueva donde Rumiñahui escondió el oro de Atahualpa. 🏔️✨

Antes de morir, dejó al rey de España el camino exacto. Desde entonces, muchos lo siguieron. Algunos nunca regresaron.

¿Crees que el oro sigue en los Llanganates? Te leo en los comentarios 👇

▶️ YouTube: ${YT}
🎵 TikTok: ${TT}

Imágenes y animaciones: recreaciones generadas con IA. La leyenda tiene varias versiones; contamos las más conocidas.
#llanganates #rumiñahui #tesoroinca #leyendasdeecuador #misterio`,
    cuando: "2026-10-30T19:00:00-05:00",
  },
  reels: [
    { archivo: "out/llanganates-reel1.mp4", cuando: "2026-10-31T19:30:00-05:00",
      texto: `Hay un tesoro inca escondido en una montaña del Ecuador… y nadie lo ha encontrado 🏔️✨\n\nRelato completo en la página 👆\n#llanganates #incas #tesoro #ecuador #misterio` },
    { archivo: "out/llanganates-reel2.mp4", cuando: "2026-11-01T19:30:00-05:00",
      texto: `Un soldado pobre se casó con una indígena… y de un día para otro se volvió millonario 😳\n\nLo que escribió antes de morir, en la página 👆\n#leyendas #ecuador #historia #tesoroinca #misterio` },
    { archivo: "out/llanganates-reel3.mp4", cuando: "2026-11-02T19:30:00-05:00",
      texto: `Un fraile siguió el mapa del tesoro… y una noche desapareció en la niebla 🕯️\n\nLa historia completa en la página 👆\n#leyendas #llanganates #misterio #historiasreales #ecuador` },
    { archivo: "out/llanganates-reel4.mp4", cuando: "2026-11-03T19:30:00-05:00",
      texto: `Dos marineros dijeron que encontraron la cueva de oro… y ninguno volvió por el resto 🌊\n\n¿Verdad o mentira? Relato completo en la página 👆\n#tesoro #misterio #llanganates #leyendas #ecuador` },
  ],
  // Solo TikTok: la historia completa en vertical, por partes.
  partes: [
    { archivo: "out/llanganates-parte1.mp4", cuando: "2026-10-30T21:00:00-05:00", texto: `El tesoro de los Llanganates · Parte 1 🏔️ El oro que Rumiñahui escondió de los conquistadores.\n\nSígueme para la Parte 2 👆\n#llanganates #rumiñahui #incas #leyendas #parte1` },
    { archivo: "out/llanganates-parte2.mp4", cuando: "2026-10-31T13:00:00-05:00", texto: `El tesoro de los Llanganates · Parte 2 ✨ El soldado Valverde y el mapa que le dejó al rey.\n\nSígueme para la Parte 3 👆\n#llanganates #tesoro #leyendas #ecuador #parte2` },
    { archivo: "out/llanganates-parte3.mp4", cuando: "2026-11-01T13:00:00-05:00", texto: `El tesoro de los Llanganates · Parte 3 🕯️ Los que siguieron el mapa… y desaparecieron.\n\nSígueme para la Parte 4 👆\n#llanganates #misterio #leyendas #ecuador #parte3` },
    { archivo: "out/llanganates-parte4.mp4", cuando: "2026-11-02T13:00:00-05:00", texto: `El tesoro de los Llanganates · Parte 4 (final) 🌊 La cueva de oro de los marineros ingleses.\n\n¿Existe el tesoro? Comenta 👇\n#llanganates #tesoroinca #leyendas #ecuador #final` },
  ],
};

export const YOUTUBE = {
  largo: {
    titulo: "El tesoro de los Llanganates: el oro maldito de Rumiñahui (la historia completa)",
    descripcion: (capitulos) => `En lo profundo de los Llanganates, según la tradición, está escondido el oro que Rumiñahui le quitó a los conquistadores. Un soldado español lo encontró, se volvió rico y dejó al rey el camino exacto: el Derrotero de Valverde. Desde entonces, frailes, mineros y marineros ingleses lo siguieron… y muchos no volvieron.

${capitulos}

🕯️ Nuevo relato cada semana. El próximo: la Dama Tapada de Guayaquil.

Las imágenes y animaciones son recreaciones generadas con IA. La leyenda tiene varias versiones; aquí contamos las más conocidas.

📘 Facebook: ${FB}
🎵 TikTok: ${TT}

#llanganates #rumiñahui #tesoroinca #leyendasdeecuador #misterio #historiadeecuador`,
    etiquetas: ["llanganates", "tesoro de los llanganates", "derrotero de valverde", "rumiñahui", "oro de atahualpa", "tesoro inca", "leyendas ecuatorianas", "leyendas de ecuador", "misterios de ecuador", "historia de ecuador", "barth blake"],
  },
  reels: [
    { titulo: "Hay un tesoro inca que nadie ha encontrado 🏔️ #leyendas #shorts" },
    { titulo: "Un soldado pobre se casó… y se volvió millonario 😳 #ecuador #shorts" },
    { titulo: "El fraile que desapareció buscando oro 🕯️ #misterio #shorts" },
    { titulo: "Dijeron que encontraron el oro… y murieron 🌊 #tesoro #shorts" },
  ],
};

// ── Ritmo alto (nov 2026): reels cortos de "un dato" a las 12:30 y episodios de 3-5 min a las 20:00 (Facebook con anuncios + YouTube).
PUBLICACION.reels.push(
  { archivo: "out/llanganates-reel5.mp4", cuando: "2026-11-03T12:30:00-05:00", texto: `Antes de morir, le dejó al rey de España el camino exacto al tesoro 📜\n\nLa historia completa en la página 👆 ¿Lo seguirías?\n#llanganates #derrotero #tesoroinca #leyendas #ecuador` },
  { archivo: "out/llanganates-reel6.mp4", cuando: "2026-11-05T12:30:00-05:00", texto: `Un minero hizo el mapa del tesoro de los Llanganates… y murió antes de reclamarlo 🗺️\n\nRelato completo en la página 👆 ¿Maldición o casualidad?\n#llanganates #tesoro #misterio #ecuador #leyendas` },
  { archivo: "out/llanganates-reel7.mp4", cuando: "2026-11-07T12:30:00-05:00", texto: `Dos marineros ingleses dijeron que encontraron una cueva llena de oro inca ✨\n\n¿Verdad o mentira? La historia en la página 👆\n#llanganates #tesoroinca #misterio #historia #leyendas` },
  { archivo: "out/llanganates-reel8.mp4", cuando: "2026-11-09T12:30:00-05:00", texto: `En los Llanganates la niebla cae en minutos… y algunos exploradores nunca volvieron 🌫️\n\nLa historia completa en la página 👆 ¿Irías?\n#llanganates #ecuador #misterio #aventura #leyendas` },
  { archivo: "out/llanganates-reel9.mp4", cuando: "2026-11-01T12:30:00-05:00", texto: `Atahualpa prometió una habitación llena de oro para salvar su vida… y una parte nunca llegó 👑\n\n¿Dónde está ese oro? En la página 👆\n#atahualpa #oroinca #historia #misterio #ecuador` },
);
YOUTUBE.reels.push(
  { titulo: "El mapa del tesoro que le dejó al rey 📜 #tesoro #shorts" },
  { titulo: "Hizo el mapa del tesoro… y murió 🗺️ #misterio #shorts" },
  { titulo: "Encontraron una cueva llena de oro inca ✨ #tesoro #shorts" },
  { titulo: "El parque donde la niebla se traga a la gente 🌫️ #ecuador #shorts" },
  { titulo: "Prometió una habitación llena de oro 👑 #atahualpa #shorts" },
);
PUBLICACION.episodios = [
  { archivo: "out/llanganates-episodio1.mp4", cuando: "2026-11-03T20:00:00-05:00", titulo: "Llanganates · Episodio 1: el oro de Rumiñahui",
    texto: `Llanganates · Episodio 1 🏔️ El oro que Rumiñahui escondió, el soldado Valverde y el mapa que le dejó al rey.\n\nMañana, el Episodio 2: los que siguieron el mapa. ¿Lo seguirías tú? 👇\n#llanganates #rumiñahui #tesoroinca #leyendasdeecuador #misterio` },
  { archivo: "out/llanganates-episodio2.mp4", cuando: "2026-11-04T20:00:00-05:00", titulo: "Llanganates · Episodio 2: los que siguieron el mapa",
    texto: `Llanganates · Episodio 2 🌫️ El fraile que desapareció, el minero del mapa y la cueva de oro de los marineros ingleses.\n\n¿Crees que el oro sigue ahí? Comenta 👇\n#llanganates #tesoroinca #misterio #ecuador #leyendas` },
];
YOUTUBE.episodios = [
  { titulo: "Llanganates | Episodio 1: el oro de Rumiñahui y el derrotero de Valverde" },
  { titulo: "Llanganates | Episodio 2: el fraile, el minero y la cueva de oro" },
];
