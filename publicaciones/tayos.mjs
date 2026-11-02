// Textos y horarios de La Cueva de los Tayos y la biblioteca de oro (hora de Ecuador, UTC-5). reel1 y reel2 son AVANCES.
// Va después de El Dorado (termina el 8-dic): avances 9 y 10, estreno vie 11-dic, un reel diario 19:30 (12-15) y partes 22:00 (11-14).
const YT = "https://www.youtube.com/@relatos.delamitad";
const TT = "https://www.tiktok.com/@relatosdelamitad";
const FB = "https://www.facebook.com/RelatosDeLaMitad";

export const PUBLICACION = {
  largo: {
    archivo: "out/tayos-largo.mp4",
    miniatura: "out/tayos-miniatura.jpg",
    titulo: "La Cueva de los Tayos y la biblioteca de oro",
    texto: `Un explorador juró haber encontrado bajo la selva de Ecuador una biblioteca hecha de láminas de metal. Un libro la hizo famosa en todo el mundo… y en 1976 Neil Armstrong bajó a la Cueva de los Tayos a comprobarlo. ¿Qué encontraron?

¿Crees que la biblioteca existe? SÍ o NO 👇

▶️ YouTube: ${YT}
🎵 TikTok: ${TT}

Imágenes: recreaciones generadas con IA. La expedición de 1976 y el registro de 1969 están documentados; la biblioteca nunca se ha encontrado.
#cuevadelostayos #morona #misterio #neilarmstrong #leyendasdeecuador`,
    cuando: "2026-12-11T19:00:00-05:00",
  },
  reels: [
    { archivo: "out/tayos-reel1.mp4", cuando: "2026-12-09T19:30:00-05:00",
      texto: `Dicen que bajo la selva de Ecuador hay una biblioteca entera hecha de láminas de oro 📜\n\nLa historia completa este viernes en la página 👆 ¿La conocías? SÍ o NO\n#cuevadelostayos #misterio #ecuador #amazonia #oro` },
    { archivo: "out/tayos-reel2.mp4", cuando: "2026-12-10T19:30:00-05:00",
      texto: `En 1976, Neil Armstrong bajó colgado de una cuerda a una cueva de la Amazonía ecuatoriana 🧗\n\nEste viernes, la historia completa en la página 👆 ¿Sabías esto?\n#neilarmstrong #cuevadelostayos #ecuador #misterio #historia` },
    { archivo: "out/tayos-reel3.mp4", cuando: "2026-12-12T19:30:00-05:00",
      texto: `En julio de 1969 un explorador fue a una notaría de Guayaquil a registrar una biblioteca perdida bajo tierra 🗝️\n\nLa historia completa en la página 👆 ¿Tú le habrías creído?\n#cuevadelostayos #misterio #guayaquil #ecuador #historia` },
    { archivo: "out/tayos-reel4.mp4", cuando: "2026-12-13T19:30:00-05:00",
      texto: `Un libro hizo famosa en todo el mundo a una cueva de Ecuador… y después llegaron las contradicciones 📖\n\nRelato completo en la página 👆 ¿Verdad o engaño?\n#elorodelosdioses #cuevadelostayos #misterio #ecuador` },
    { archivo: "out/tayos-reel5.mp4", cuando: "2026-12-14T19:30:00-05:00",
      texto: `Esto es lo que encontró la expedición de Neil Armstrong en la Cueva de los Tayos 🔦\n\nLa historia completa en la página 👆 ¿Te lo esperabas?\n#neilarmstrong #cuevadelostayos #ecuador #ciencia #misterio` },
    { archivo: "out/tayos-reel6.mp4", cuando: "2026-12-15T19:30:00-05:00",
      texto: `¿Y si la biblioteca de oro está detrás de otra entrada que nadie conoce? 🌿\n\nToda la historia en la página 👆 ¿Tú qué crees?\n#cuevadelostayos #misterio #leyendas #amazonia #ecuador` },
  ],
  partes: [
    { archivo: "out/tayos-parte1.mp4", cuando: "2026-12-11T22:00:00-05:00", yt: "2026-12-11T22:00:00-05:00", texto: `Cueva de los Tayos · Parte 1 🦇 La cueva a la que solo se baja colgado de una cuerda. ¿Te atreverías a bajar?\n\nSígueme para la Parte 2 👆\n#cuevadelostayos #misterio #ecuador #amazonia #parte1` },
    { archivo: "out/tayos-parte2.mp4", cuando: "2026-12-12T22:00:00-05:00", yt: "2026-12-12T22:00:00-05:00", texto: `Cueva de los Tayos · Parte 2 📜 La biblioteca de metal registrada ante notario. ¿Tú le habrías creído?\n\nSígueme para la Parte 3 👆\n#cuevadelostayos #misterio #historia #ecuador #parte2` },
    { archivo: "out/tayos-parte3.mp4", cuando: "2026-12-13T22:00:00-05:00", yt: "2026-12-13T22:00:00-05:00", texto: `Cueva de los Tayos · Parte 3 🤔 Las contradicciones y las placas del padre Crespi. ¿Verdad o engaño?\n\nSígueme para la Parte 4 👆\n#cuevadelostayos #misterio #cuenca #ecuador #parte3` },
    { archivo: "out/tayos-parte4.mp4", cuando: "2026-12-14T22:00:00-05:00", yt: "2026-12-14T22:00:00-05:00", texto: `Cueva de los Tayos · Parte 4 (final) 🔦 Neil Armstrong baja a la cueva… y lo que encontró.\n\n¿Crees que la biblioteca existe? Comenta 👇\n#neilarmstrong #cuevadelostayos #misterio #ecuador #final` },
  ],
};

export const YOUTUBE = {
  largo: {
    titulo: "La Cueva de los Tayos: la biblioteca de oro y la expedición de Neil Armstrong (misterio de Ecuador)",
    descripcion: (capitulos) => `En 1969, el explorador Juan Moricz registró ante notario en Guayaquil el hallazgo de una biblioteca de láminas de metal en la Cueva de los Tayos, en la Amazonía ecuatoriana. El libro "El oro de los dioses" la hizo famosa en todo el mundo, y en 1976 una expedición británico-ecuatoriana con Neil Armstrong bajó a comprobarlo. ¿Qué encontraron?

${capitulos}

🕯️ Nuevo relato cada semana sobre leyendas, misterios y tesoros de Ecuador y Latinoamérica.

Las imágenes son recreaciones generadas con IA. El registro de 1969 y la expedición de 1976 están documentados; la biblioteca de oro nunca se ha encontrado.

📘 Facebook: ${FB}
🎵 TikTok: ${TT}

#cuevadelostayos #neilarmstrong #misterio #ecuador #amazonia #leyendasdeecuador`,
    etiquetas: ["cueva de los tayos", "biblioteca de oro", "biblioteca metalica", "neil armstrong ecuador", "juan moricz", "el oro de los dioses", "von daniken", "padre crespi", "misterios de ecuador", "amazonia ecuatoriana", "morona santiago", "leyendas de ecuador"],
  },
  reels: [
    { titulo: "Dicen que bajo la selva de Ecuador hay una biblioteca de oro 📜 #misterio #shorts" },
    { titulo: "Neil Armstrong bajó a esta cueva de Ecuador 🧗 #historia #shorts" },
    { titulo: "Registró ante notario una biblioteca perdida 🗝️ #misterio #shorts" },
    { titulo: "El libro que hizo famosa la cueva… y la verdad 📖 #ecuador #shorts" },
    { titulo: "Qué encontró la expedición de Neil Armstrong 🔦 #ciencia #shorts" },
    { titulo: "¿Existe otra entrada secreta? 🌿 #misterio #shorts" },
  ],
};
