// Textos y horarios de El tesoro pirata de la Isla de la Plata (hora de Ecuador, UTC-5). reel1 y reel2 son AVANCES.
// Va después de La Caja Ronca (termina el 24-nov): avances 25 y 26, estreno vie 27, reels y partes 27-30.
const YT = "https://www.youtube.com/@relatos.delamitad";
const TT = "https://www.tiktok.com/@relatosdelamitad";
const FB = "https://www.facebook.com/RelatosDeLaMitad";

export const PUBLICACION = {
  largo: {
    archivo: "out/isla-plata-largo.mp4",
    miniatura: "out/isla-plata-miniatura.jpg",
    titulo: "El tesoro pirata de la Isla de la Plata",
    texto: `1579: el pirata Francis Drake captura frente a Esmeraldas el galeón más rico del Pacífico: oro, joyas y 26 toneladas de plata. La leyenda dice que escondió parte en una isla de Manabí… y por eso se llama la Isla de la Plata. ¿Verdad o leyenda?

¿Tú crees que el tesoro sigue ahí? Responde SÍ o NO 👇

▶️ YouTube: ${YT}
🎵 TikTok: ${TT}

Imágenes: recreaciones generadas con IA. Los hechos de la captura están documentados; lo del tesoro escondido es leyenda.
#isladelaplata #manabi #tesoro #piratas #leyendasdeecuador`,
    cuando: "2026-11-20T19:00:00-05:00",
  },
  reels: [
    { archivo: "out/isla-plata-reel1.mp4", cuando: "2026-11-18T19:30:00-05:00",
      texto: `Frente a Manabí hay una isla donde, dicen, un pirata inglés escondió toneladas de plata 🏝️\n\nLa historia completa este viernes en la página 👆 ¿La conocías? SÍ o NO\n#isladelaplata #manabi #tesoro #piratas #ecuador` },
    { archivo: "out/isla-plata-reel2.mp4", cuando: "2026-11-19T19:30:00-05:00",
      texto: `Oro, joyas y 26 toneladas de plata: el galeón más rico del Pacífico cayó frente a Esmeraldas en 1579 ⚓\n\nEste viernes, la historia completa en la página 👆 ¿Tú qué habrías hecho con todo eso?\n#tesoro #piratas #esmeraldas #historia #ecuador` },
    { archivo: "out/isla-plata-reel3.mp4", cuando: "2026-11-21T12:30:00-05:00",
      texto: `Prometió una cadena de oro al primero que viera el barco del tesoro… y la ganó un muchacho desde el mástil 🔭\n\nLa historia completa en la página 👆 ¿Tú lo habrías visto primero?\n#piratas #drake #tesoro #historia #ecuador` },
    { archivo: "out/isla-plata-reel4.mp4", cuando: "2026-11-21T19:30:00-05:00",
      texto: `El truco del pirata: frenó su propio barco para parecer inofensivo… y así cazó al galeón más rico del Pacífico 🏴‍☠️\n\nRelato completo en la página 👆 ¿Habrías caído en la trampa?\n#piratas #francisdrake #tesoro #historia #ecuador` },
    { archivo: "out/isla-plata-reel5.mp4", cuando: "2026-11-22T12:30:00-05:00",
      texto: `Mucho antes de los piratas, esta isla de Ecuador fue un santuario sagrado durante unos 4.000 años 🐚\n\nLa historia completa en la página 👆 ¿Lo sabías?\n#isladelaplata #arqueologia #manabi #historia #ecuador` },
    { archivo: "out/isla-plata-reel6.mp4", cuando: "2026-11-22T19:30:00-05:00",
      texto: `Durante siglos, buscadores de tesoros cavaron en la Isla de la Plata… ¿el tesoro de Drake sigue enterrado? 🪙\n\nTodas las pistas en la página 👆 ¿Tú qué crees: SÍ o NO?\n#isladelaplata #tesoro #piratas #misterio #ecuador` },
  ],
  partes: [
    { archivo: "out/isla-plata-parte1.mp4", cuando: "2026-11-20T22:00:00-05:00", yt: "2026-11-20T22:00:00-05:00", texto: `La Isla de la Plata · Parte 1 🏴‍☠️ El pirata que llegó al Mar del Sur. ¿Conocías esta historia?\n\nSígueme para la Parte 2 👆\n#isladelaplata #piratas #tesoro #ecuador #parte1` },
    { archivo: "out/isla-plata-parte2.mp4", cuando: "2026-11-21T22:00:00-05:00", yt: "2026-11-21T22:00:00-05:00", texto: `La Isla de la Plata · Parte 2 ⚓ La caza del galeón más rico del Pacífico. ¿Habrías caído en el truco?\n\nSígueme para la Parte 3 👆\n#isladelaplata #francisdrake #tesoro #historia #parte2` },
    { archivo: "out/isla-plata-parte3.mp4", cuando: "2026-11-22T22:00:00-05:00", yt: "2026-11-22T22:00:00-05:00", texto: `La Isla de la Plata · Parte 3 🗺️ La leyenda del tesoro escondido… ¿verdad o mentira? ¿Tú qué crees?\n\nSígueme para la Parte 4 👆\n#isladelaplata #leyendas #tesoro #misterio #parte3` },
    { archivo: "out/isla-plata-parte4.mp4", cuando: "2026-11-23T22:00:00-05:00", yt: "2026-11-23T22:00:00-05:00", texto: `La Isla de la Plata · Parte 4 (final) 🐚 El secreto que la isla guardaba antes de los piratas.\n\n¿Crees que el tesoro sigue ahí? Comenta 👇\n#isladelaplata #manabi #arqueologia #ecuador #final` },
  ],
};

export const YOUTUBE = {
  largo: {
    titulo: "El tesoro pirata de la Isla de la Plata: Francis Drake y las 26 toneladas de plata (historia real y leyenda)",
    descripcion: (capitulos) => `En 1579, el pirata inglés Francis Drake capturó frente a Esmeraldas el galeón Nuestra Señora de la Concepción, el "Cacafuego": oro, joyas, cofres de monedas y unas 26 toneladas de plata. La leyenda dice que escondió parte en una isla de Manabí, y que por eso se llama la Isla de la Plata. ¿Qué dicen los historiadores? ¿Y qué tesoro guardaba la isla miles de años antes de los piratas?

${capitulos}

🕯️ Nuevo relato cada semana. El próximo: otro tesoro perdido de nuestra tierra.

Las imágenes son recreaciones generadas con IA. La captura del galeón está documentada; el tesoro escondido en la isla es una leyenda.

📘 Facebook: ${FB}
🎵 TikTok: ${TT}

#isladelaplata #francisdrake #tesoro #piratas #manabi #leyendasdeecuador #historiadeecuador`,
    etiquetas: ["isla de la plata", "tesoro de la isla de la plata", "francis drake", "tesoro de drake", "cacafuego", "piratas en ecuador", "tesoros perdidos", "manabi", "puerto lopez", "parque nacional machalilla", "leyendas de ecuador", "historia de ecuador"],
  },
  reels: [
    { titulo: "Un pirata escondió su tesoro en esta isla de Ecuador 🏝️ #tesoro #shorts" },
    { titulo: "El barco con 26 toneladas de plata ⚓ #piratas #shorts" },
    { titulo: "Prometió una cadena de oro a quien viera el barco 🔭 #historia #shorts" },
    { titulo: "El truco del pirata para cazar un galeón 🏴‍☠️ #piratas #shorts" },
    { titulo: "Esta isla fue sagrada durante 4.000 años 🐚 #ecuador #shorts" },
    { titulo: "¿El tesoro de Drake sigue enterrado? 🪙 #misterio #shorts" },
  ],
};

// Episodios de 3-4 min (Facebook con anuncios + YouTube), después del estreno.
PUBLICACION.episodios = [
  { archivo: "out/isla-plata-episodio1.mp4", cuando: "2026-11-23T20:00:00-05:00", titulo: "La Isla de la Plata · Episodio 1: la caza del galeón",
    texto: `La Isla de la Plata · Episodio 1 🏴‍☠️ Francis Drake llega al Mar del Sur y caza al galeón más rico del Pacífico.\n\nMañana, el Episodio 2: el tesoro y la isla. ¿Habrías caído en su truco? SÍ o NO 👇\n#isladelaplata #francisdrake #piratas #tesoro #ecuador` },
  { archivo: "out/isla-plata-episodio2.mp4", cuando: "2026-11-24T20:00:00-05:00", titulo: "La Isla de la Plata · Episodio 2: ¿dónde está el tesoro?",
    texto: `La Isla de la Plata · Episodio 2 🪙 El botín, la leyenda del tesoro escondido y el secreto que la isla guardaba hace 4.000 años.\n\n¿Crees que la plata sigue ahí? Comenta 👇\n#isladelaplata #manabi #tesoro #leyendas #misterio` },
];
YOUTUBE.episodios = [
  { titulo: "Francis Drake y la caza del galeón más rico del Pacífico (Isla de la Plata, episodio 1)" },
  { titulo: "¿Dónde está el tesoro de la Isla de la Plata? (episodio 2)" },
];
