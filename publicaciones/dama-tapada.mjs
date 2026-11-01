// Textos y horarios de publicación de La Dama Tapada (hora de Ecuador, UTC-5).
// reel1 y reel2 son AVANCES (miércoles y jueves antes del estreno del viernes).
const YT = "https://www.youtube.com/@relatos.delamitad";
const TT = "https://www.tiktok.com/@relatosdelamitad";
const FB = "https://www.facebook.com/RelatosDeLaMitad";

export const PUBLICACION = {
  largo: {
    archivo: "out/dama-tapada-largo.mp4",
    miniatura: "out/dama-tapada-miniatura.jpg",
    titulo: "La Dama Tapada: la mujer que nadie debía seguir",
    texto: `Guayaquil, hace más de 200 años. A medianoche, un perfume de flores… y una mujer elegante con el rostro cubierto. Los hombres que la siguieron no volvieron a ser los mismos. 🕯️

¿Quién era la Dama Tapada? Te cuento la leyenda completa y todas sus versiones.

¿Tú la seguirías? Responde SÍ o NO 👇

▶️ YouTube: ${YT}
🎵 TikTok: ${TT}

Imágenes y animaciones: recreaciones generadas con IA. La leyenda tiene varias versiones; contamos las más conocidas.
#damatapada #guayaquil #leyendasdeecuador #leyendas #misterio`,
    cuando: "2026-11-06T19:00:00-05:00",
  },
  reels: [
    { archivo: "out/dama-tapada-reel1.mp4", cuando: "2026-11-04T19:30:00-05:00",
      texto: `Si a medianoche hueles flores en una calle vacía… no sigas a la mujer del velo 🕯️\n\nLa leyenda completa este viernes en la página 👆 ¿Tú la seguirías? SÍ o NO\n#damatapada #guayaquil #leyendas #misterio #ecuador` },
    { archivo: "out/dama-tapada-reel2.mp4", cuando: "2026-11-05T19:30:00-05:00",
      texto: `Por más que corrían, nadie lograba alcanzarla 😳 Siempre a la misma distancia…\n\nEste viernes, la historia completa en la página 👆 ¿Conocías esta leyenda?\n#damatapada #guayaquil #leyendasdeecuador #misterio #terror` },
    { archivo: "out/dama-tapada-reel3.mp4", cuando: "2026-11-07T19:30:00-05:00",
      texto: `Se detuvo frente al cementerio, levantó el velo… y no tenía rostro 💀\n\nLa leyenda completa en la página 👆 ¿Tú te habrías acercado?\n#damatapada #guayaquil #leyendas #misterio #ecuador` },
    { archivo: "out/dama-tapada-reel4.mp4", cuando: "2026-11-08T19:30:00-05:00",
      texto: `Hasta los guardias nocturnos de Guayaquil evitaban ciertas calles por ella 🏮\n\nRelato completo en la página 👆 ¿En tu ciudad hay una leyenda así?\n#damatapada #guayaquil #leyendasdeecuador #misterio #historia` },
    { archivo: "out/dama-tapada-reel5.mp4", cuando: "2026-11-09T19:30:00-05:00",
      texto: `¿Alma en pena, espíritu antiguo… o un invento de las esposas de Guayaquil? 🤔\n\nTodas las versiones en la página 👆 ¿Cuál crees tú?\n#damatapada #leyendas #guayaquil #misterio #ecuador` },
    { archivo: "out/dama-tapada-reel6.mp4", cuando: "2026-11-10T12:30:00-05:00",
      texto: `Ecuador tiene a la Dama Tapada, Lima a las tapadas y Venezuela a la Sayona 👻 ¿Coincidencia?\n\nLa historia completa en la página 👆 ¿De qué país me escribes?\n#leyendaslatinoamericanas #damatapada #lasayona #misterio #leyendas` },
  ],
  // Solo TikTok: la historia completa en vertical, por partes.
  partes: [
    { archivo: "out/dama-tapada-parte1.mp4", cuando: "2026-11-06T21:00:00-05:00", texto: `La Dama Tapada · Parte 1 🕯️ El Guayaquil de la Colonia, donde todo empezó.\n\nSígueme para la Parte 2 👆\n#damatapada #guayaquil #leyendas #ecuador #parte1` },
    { archivo: "out/dama-tapada-parte2.mp4", cuando: "2026-11-07T13:00:00-05:00", texto: `La Dama Tapada · Parte 2 💀 La aparición… y el rostro bajo el velo.\n\nSígueme para la Parte 3 👆\n#damatapada #misterio #leyendas #guayaquil #parte2` },
    { archivo: "out/dama-tapada-parte3.mp4", cuando: "2026-11-08T13:00:00-05:00", texto: `La Dama Tapada · Parte 3 🤔 Los que la vieron, y quién era en realidad.\n\nSígueme para la Parte 4 👆\n#damatapada #leyendasdeecuador #misterio #guayaquil #parte3` },
    { archivo: "out/dama-tapada-parte4.mp4", cuando: "2026-11-09T13:00:00-05:00", texto: `La Dama Tapada · Parte 4 (final) 👻 No está sola: la misma leyenda en toda Latinoamérica.\n\n¿Tú la seguirías? Comenta 👇\n#damatapada #leyendas #latinoamerica #misterio #final` },
  ],
};

export const YOUTUBE = {
  largo: {
    titulo: "La Dama Tapada de Guayaquil: la mujer que nadie debía seguir (leyenda completa)",
    descripcion: (capitulos) => `En el Guayaquil de la Colonia, a medianoche, aparecía una mujer elegante con el rostro cubierto por un velo. Primero llegaba un perfume de flores; después, la silueta. Los hombres que la siguieron hasta las afueras de la ciudad vieron lo que había debajo del velo… y no volvieron a ser los mismos.

${capitulos}

🕯️ Nuevo relato cada semana. El próximo: el Padre Almeida de Quito.

Las imágenes y animaciones son recreaciones generadas con IA. La leyenda tiene varias versiones; aquí contamos las más conocidas.

📘 Facebook: ${FB}
🎵 TikTok: ${TT}

#damatapada #guayaquil #leyendasdeecuador #leyendas #misterio #historiadeecuador`,
    etiquetas: ["dama tapada", "la dama tapada", "leyenda de la dama tapada", "dama tapada guayaquil", "leyendas de guayaquil", "leyendas ecuatorianas", "leyendas de ecuador", "tapadas limeñas", "la sayona", "leyendas latinoamericanas", "historia de guayaquil"],
  },
  reels: [
    { titulo: "Si hueles flores a medianoche… no la sigas 🕯️ #leyendas #shorts" },
    { titulo: "La mujer que nadie lograba alcanzar 😳 #guayaquil #shorts" },
    { titulo: "Levantó el velo… y no tenía rostro 💀 #misterio #shorts" },
    { titulo: "Hasta los guardias le tenían miedo 🏮 #ecuador #shorts" },
    { titulo: "¿Quién era la Dama Tapada? 🤔 #leyendas #shorts" },
    { titulo: "La misma leyenda en toda Latinoamérica 👻 #misterio #shorts" },
  ],
};

// Episodios de 3-5 min (Facebook con anuncios + YouTube), después del estreno.
PUBLICACION.episodios = [
  { archivo: "out/dama-tapada-episodio1.mp4", cuando: "2026-11-11T20:00:00-05:00", titulo: "La Dama Tapada · Episodio 1: la aparición",
    texto: `La Dama Tapada · Episodio 1 🕯️ El Guayaquil colonial, la aparición… y el rostro bajo el velo.\n\nMañana, el Episodio 2: ¿quién era? ¿Tú la seguirías? SÍ o NO 👇\n#damatapada #guayaquil #leyendasdeecuador #misterio #leyendas` },
  { archivo: "out/dama-tapada-episodio2.mp4", cuando: "2026-11-12T20:00:00-05:00", titulo: "La Dama Tapada · Episodio 2: ¿quién era?",
    texto: `La Dama Tapada · Episodio 2 👻 Los que la vieron, quién era en realidad y por qué está en toda Latinoamérica.\n\n¿En tu ciudad hay una leyenda así? Comenta 👇\n#damatapada #leyendas #latinoamerica #misterio #guayaquil` },
];
YOUTUBE.episodios = [
  { titulo: "La Dama Tapada | Episodio 1: la aparición en el Guayaquil colonial" },
  { titulo: "La Dama Tapada | Episodio 2: ¿quién era la mujer del velo?" },
];

// Reels cortos de "un dato" a las 12:30.
PUBLICACION.reels.push(
  { archivo: "out/dama-tapada-reel7.mp4", cuando: "2026-11-10T19:30:00-05:00", texto: `En Lima, durante siglos, las mujeres salían a la calle tapadas con un manto que solo dejaba ver un ojo 👁️ ¡Y eran reales!

La leyenda de la Dama Tapada en la página 👆 ¿Lo sabías?
#tapadaslimeñas #lima #historia #damatapada #leyendas` },
  { archivo: "out/dama-tapada-reel8.mp4", cuando: "2026-11-11T12:30:00-05:00", texto: `En Venezuela y Colombia la llaman la Sayona 👻 y castiga a los hombres infieles en los caminos.

La versión ecuatoriana, en la página 👆 ¿De qué país me escribes?
#lasayona #leyendas #venezuela #colombia #misterio` },
  { archivo: "out/dama-tapada-reel9.mp4", cuando: "2026-11-11T19:30:00-05:00", texto: `En 1896 el Fuego Grande consumió buena parte del Guayaquil de madera 🔥 Pero la leyenda sobrevivió.

La historia completa en la página 👆
#guayaquil #historia #fuegogrande #damatapada #ecuador` },
  { archivo: "out/dama-tapada-reel10.mp4", cuando: "2026-11-12T12:30:00-05:00", texto: `Si a medianoche hueles nardos o violetas en una calle vacía… no sigas a nadie 🌸

La leyenda completa en la página 👆 ¿Tú la seguirías?
#damatapada #guayaquil #leyendas #misterio #terror` },
);
YOUTUBE.reels.push(
  { titulo: "Las mujeres tapadas de Lima eran reales 👁️ #historia #shorts" },
  { titulo: "La Sayona: la versión venezolana 👻 #leyendas #shorts" },
  { titulo: "El incendio que borró el Guayaquil colonial 🔥 #guayaquil #shorts" },
  { titulo: "Primero llegaba el perfume… 🌸 #misterio #shorts" },
);

// Relleno del mismo día (sáb 31-oct): más publicaciones desde hoy.
PUBLICACION.reels.push({"archivo":"out/dama-tapada-reel11.mp4","cuando":"2026-10-31T21:30:00-05:00","texto":"Los encontraban al amanecer, tirados en el barro, con la cara llena de espanto… 😱 Esto les pasaba a los que seguían a la Dama Tapada.\n\nLa leyenda completa en la página 👆 ¿Tú la seguirías? SÍ o NO\n#damatapada #guayaquil #leyendas #misterio #terror"});
YOUTUBE.reels.push({"titulo":"Lo que les pasó a los que la siguieron 😱 #misterio #shorts"});
