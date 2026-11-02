// Textos y horarios de El Dorado: la laguna de oro (hora de Ecuador, UTC-5). reel1 y reel2 son AVANCES.
// Va después de la Isla de la Plata (termina el 1-dic): avances 2 y 3, estreno vie 4-dic, un reel diario 19:30 (5-8) y partes 22:00 (4-7).
const YT = "https://www.youtube.com/@relatos.delamitad";
const TT = "https://www.tiktok.com/@relatosdelamitad";
const FB = "https://www.facebook.com/RelatosDeLaMitad";

export const PUBLICACION = {
  largo: {
    archivo: "out/el-dorado-largo.mp4",
    miniatura: "out/el-dorado-miniatura.jpg",
    titulo: "El Dorado: la laguna de oro",
    texto: `Cubrían a su nuevo rey con polvo de oro y lo llevaban en una balsa al centro de una laguna sagrada, donde arrojaban oro y esmeraldas. Así nació la leyenda de El Dorado… y siglos de intentos por vaciar la laguna de Guatavita.

¿Crees que todavía queda oro en el fondo? SÍ o NO 👇

▶️ YouTube: ${YT}
🎵 TikTok: ${TT}

Imágenes: recreaciones generadas con IA. La ceremonia y los intentos de desagüe están documentados; la ciudad de oro es leyenda.
#eldorado #guatavita #muiscas #tesoro #leyendaslatinoamericanas`,
    cuando: "2026-12-04T19:00:00-05:00",
  },
  reels: [
    { archivo: "out/el-dorado-reel1.mp4", cuando: "2026-12-02T19:30:00-05:00",
      texto: `En los Andes hay una laguna redonda que miles intentaron vaciar… porque en el fondo hay siglos de oro 🌕\n\nLa historia completa este viernes en la página 👆 ¿La conocías? SÍ o NO\n#eldorado #guatavita #tesoro #leyendas #colombia` },
    { archivo: "out/el-dorado-reel2.mp4", cuando: "2026-12-03T19:30:00-05:00",
      texto: `Cubrían a su rey con polvo de oro y lo llevaban al centro de la laguna sagrada ✨ Así nació El Dorado.\n\nEste viernes, la historia completa en la página 👆 ¿Tú lo sabías?\n#eldorado #muiscas #oro #historia #latinoamerica` },
    { archivo: "out/el-dorado-reel3.mp4", cuando: "2026-12-05T19:30:00-05:00",
      texto: `Cavaron un corte gigante en el cráter para sacar el oro de la laguna… y las paredes se vinieron abajo ⛏️\n\nLa historia completa en la página 👆 ¿Tú lo habrías intentado?\n#eldorado #guatavita #tesoro #historia #colombia` },
    { archivo: "out/el-dorado-reel4.mp4", cuando: "2026-12-06T19:30:00-05:00",
      texto: `Por fin vaciaron la laguna de El Dorado… y el lodo del fondo se endureció como cemento 😳\n\nRelato completo en la página 👆 ¿Mala suerte o maldición?\n#eldorado #guatavita #misterio #tesoro #historia` },
    { archivo: "out/el-dorado-reel5.mp4", cuando: "2026-12-07T19:30:00-05:00",
      texto: `En 1969, unos campesinos encontraron en una cueva la prueba de que El Dorado existió 🛶\n\nLa historia completa en la página 👆 ¿La has visto en el Museo del Oro?\n#eldorado #museodeloro #muiscas #arqueologia #colombia` },
    { archivo: "out/el-dorado-reel6.mp4", cuando: "2026-12-08T19:30:00-05:00",
      texto: `Buscaron una ciudad de oro durante siglos… pero El Dorado nunca fue una ciudad 🤔\n\nToda la historia en la página 👆 ¿Tú qué crees?\n#eldorado #leyendas #tesoro #misterio #latinoamerica` },
  ],
  partes: [
    { archivo: "out/el-dorado-parte1.mp4", cuando: "2026-12-04T22:00:00-05:00", yt: "2026-12-04T22:00:00-05:00", texto: `El Dorado · Parte 1 ✨ El hombre cubierto de oro. ¿Conocías el origen de la leyenda?\n\nSígueme para la Parte 2 👆\n#eldorado #muiscas #leyendas #tesoro #parte1` },
    { archivo: "out/el-dorado-parte2.mp4", cuando: "2026-12-05T22:00:00-05:00", yt: "2026-12-05T22:00:00-05:00", texto: `El Dorado · Parte 2 🌕 La fiebre del oro que enloqueció a los conquistadores. ¿Tú la habrías buscado?\n\nSígueme para la Parte 3 👆\n#eldorado #conquista #tesoro #historia #parte2` },
    { archivo: "out/el-dorado-parte3.mp4", cuando: "2026-12-06T22:00:00-05:00", yt: "2026-12-06T22:00:00-05:00", texto: `El Dorado · Parte 3 ⛏️ Los que intentaron vaciar la laguna… y lo que pasó. ¿Mala suerte o maldición?\n\nSígueme para la Parte 4 👆\n#eldorado #guatavita #misterio #tesoro #parte3` },
    { archivo: "out/el-dorado-parte4.mp4", cuando: "2026-12-07T22:00:00-05:00", yt: "2026-12-07T22:00:00-05:00", texto: `El Dorado · Parte 4 (final) 🛶 La prueba de oro que apareció en una cueva.\n\n¿Crees que queda oro en el fondo? Comenta 👇\n#eldorado #museodeloro #muiscas #colombia #final` },
  ],
};

export const YOUTUBE = {
  largo: {
    titulo: "El Dorado: la laguna de oro que nadie pudo vaciar (la historia real de Guatavita)",
    descripcion: (capitulos) => `Los muiscas cubrían a su nuevo cacique con polvo de oro y lo llevaban en una balsa al centro de la laguna sagrada de Guatavita, donde arrojaban oro y esmeraldas. Esa ceremonia dio origen a la leyenda de El Dorado, que llevó a conquistadores y aventureros a intentar vaciar la laguna durante siglos. ¿Qué encontraron? ¿Y qué prueba apareció en 1969?

${capitulos}

🕯️ Nuevo relato cada semana sobre leyendas, misterios y tesoros de Ecuador y Latinoamérica.

Las imágenes son recreaciones generadas con IA. La ceremonia y los intentos de desagüe están documentados; la ciudad de oro es una leyenda.

📘 Facebook: ${FB}
🎵 TikTok: ${TT}

#eldorado #guatavita #muiscas #tesoro #leyendaslatinoamericanas #historia`,
    etiquetas: ["el dorado", "leyenda de el dorado", "laguna de guatavita", "muiscas", "balsa muisca", "museo del oro", "tesoros perdidos", "ciudad de oro", "leyendas latinoamericanas", "historia de colombia", "oro de los andes", "conquistadores"],
  },
  reels: [
    { titulo: "Esta laguna esconde siglos de oro en el fondo 🌕 #tesoro #shorts" },
    { titulo: "Cubrían a su rey con polvo de oro ✨ #historia #shorts" },
    { titulo: "Intentaron vaciar la laguna para sacar el oro ⛏️ #eldorado #shorts" },
    { titulo: "La vaciaron… y el lodo se volvió cemento 😳 #misterio #shorts" },
    { titulo: "Encontraron la prueba de El Dorado en una cueva 🛶 #arqueologia #shorts" },
    { titulo: "El Dorado nunca fue una ciudad 🤔 #leyendas #shorts" },
  ],
};
