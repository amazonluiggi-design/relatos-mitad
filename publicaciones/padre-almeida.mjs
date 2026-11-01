// Textos y horarios de El Padre Almeida (hora de Ecuador, UTC-5). reel1 y reel2 son AVANCES.
const YT = "https://www.youtube.com/@relatos.delamitad";
const TT = "https://www.tiktok.com/@relatosdelamitad";
const FB = "https://www.facebook.com/RelatosDeLaMitad";

export const PUBLICACION = {
  largo: {
    archivo: "out/padre-almeida-largo.mp4",
    miniatura: "out/padre-almeida-miniatura.jpg",
    titulo: "El Padre Almeida: el fraile que se escapaba de noche",
    texto: `Quito, siglo XVIII. Un joven fraile se escapaba cada noche por la ventana de la torre, apoyándose en una estatua de Cristo… hasta que la estatua le habló. 🕯️

«¿Hasta cuándo, Padre Almeida?» — «¡Hasta la vuelta, Señor!»

¿Tú qué le habrías respondido? Comenta 👇

▶️ YouTube: ${YT}
🎵 TikTok: ${TT}

Imágenes: recreaciones generadas con IA. La leyenda tiene varias versiones; contamos las más conocidas.
#padrealmeida #quito #leyendasdeecuador #leyendas #misterio`,
    cuando: "2026-11-15T19:00:00-05:00",
  },
  reels: [
    { archivo: "out/padre-almeida-reel1.mp4", cuando: "2026-11-13T19:30:00-05:00",
      texto: `Se escapaba cada noche por la torre del convento… hasta que la estatua de Cristo le habló 😳\n\nLa leyenda completa este viernes en la página 👆 ¿La conocías? SÍ o NO\n#padrealmeida #quito #leyendas #misterio #ecuador` },
    { archivo: "out/padre-almeida-reel2.mp4", cuando: "2026-11-14T19:30:00-05:00",
      texto: `El fraile de Quito que se escapaba a las fiestas 🎸 y volvía antes del amanecer.\n\nEste viernes, la historia completa en la página 👆 ¿Tú lo habrías descubierto?\n#padrealmeida #quito #leyendasdeecuador #humor #historia` },
    { archivo: "out/padre-almeida-reel3.mp4", cuando: "2026-11-16T12:30:00-05:00",
      texto: `Se acercó al ataúd para ver quién era el muerto… y se vio a sí mismo ⚰️\n\nLa leyenda completa en la página 👆 ¿Aviso del cielo o efecto de la chicha?\n#padrealmeida #quito #leyendas #misterio #ecuador` },
    { archivo: "out/padre-almeida-reel4.mp4", cuando: "2026-11-16T19:30:00-05:00",
      texto: `«¿Hasta cuándo, Padre Almeida?» — «¡Hasta la vuelta, Señor!» 😂 La respuesta más famosa de Quito.\n\nRelato completo en la página 👆 ¿Tú qué le responderías?\n#padrealmeida #quito #leyendas #ecuador #humor` },
    { archivo: "out/padre-almeida-reel5.mp4", cuando: "2026-11-17T12:30:00-05:00",
      texto: `Después de esa noche, el fraile más fiestero de Quito nunca más se escapó 🙏\n\nLa historia completa en la página 👆 ¿Crees en las segundas oportunidades?\n#padrealmeida #quito #leyendasdeecuador #historia #misterio` },
    { archivo: "out/padre-almeida-reel6.mp4", cuando: "2026-11-17T19:30:00-05:00",
      texto: `El convento y la estatua del Padre Almeida todavía existen en Quito 📍 ¿Ya los visitaste?\n\nLa leyenda completa en la página 👆\n#padrealmeida #quito #sandiego #turismo #leyendas` },
  ],
  partes: [
    { archivo: "out/padre-almeida-parte1.mp4", cuando: "2026-11-15T21:00:00-05:00", texto: `El Padre Almeida · Parte 1 🕯️ El fraile que no quería ser fraile.\n\nSígueme para la Parte 2 👆\n#padrealmeida #quito #leyendas #ecuador #parte1` },
    { archivo: "out/padre-almeida-parte2.mp4", cuando: "2026-11-16T13:00:00-05:00", texto: `El Padre Almeida · Parte 2 😳 La noche que la estatua le habló.\n\nSígueme para la Parte 3 👆\n#padrealmeida #quito #misterio #leyendas #parte2` },
    { archivo: "out/padre-almeida-parte3.mp4", cuando: "2026-11-17T13:00:00-05:00", texto: `El Padre Almeida · Parte 3 ⚰️ El cortejo fúnebre… y el muerto era él.\n\nSígueme para la Parte 4 👆\n#padrealmeida #quito #leyendas #misterio #parte3` },
    { archivo: "out/padre-almeida-parte4.mp4", cuando: "2026-11-17T21:00:00-05:00", texto: `El Padre Almeida · Parte 4 (final) 🙏 Lo que cambió después de esa noche.\n\n¿Tú qué le habrías respondido? Comenta 👇\n#padrealmeida #quito #leyendasdeecuador #historia #final` },
  ],
};

export const YOUTUBE = {
  largo: {
    titulo: "El Padre Almeida: el fraile que se escapaba de noche (leyenda de Quito completa)",
    descripcion: (capitulos) => `En el convento de San Diego, en Quito, un joven fraile se escapaba cada noche por la ventana de la torre apoyándose en una estatua de Cristo. Una noche, la estatua le preguntó: «¿Hasta cuándo, Padre Almeida?». Él respondió: «¡Hasta la vuelta, Señor!»… hasta la madrugada en que se cruzó con un cortejo fúnebre y vio quién iba en el ataúd.

${capitulos}

🕯️ Nuevo relato cada semana. El próximo: la Caja Ronca.

Las imágenes son recreaciones generadas con IA. La leyenda tiene varias versiones; aquí contamos las más conocidas.

📘 Facebook: ${FB}
🎵 TikTok: ${TT}

#padrealmeida #quito #leyendasdeecuador #leyendas #misterio #historiadeecuador`,
    etiquetas: ["padre almeida", "leyenda del padre almeida", "hasta cuando padre almeida", "convento de san diego", "leyendas de quito", "leyendas ecuatorianas", "leyendas de ecuador", "quito colonial", "historia de quito", "leyendas latinoamericanas"],
  },
  reels: [
    { titulo: "La estatua le habló… y él le respondió 😳 #leyendas #shorts" },
    { titulo: "El fraile que se escapaba a las fiestas 🎸 #quito #shorts" },
    { titulo: "Abrió el ataúd… y se vio a sí mismo ⚰️ #misterio #shorts" },
    { titulo: "«¿Hasta cuándo, Padre Almeida?» 😂 #ecuador #shorts" },
    { titulo: "Lo que pasó después del cortejo 🙏 #leyendas #shorts" },
    { titulo: "La ventana del Padre Almeida todavía existe 📍 #quito #shorts" },
  ],
};
