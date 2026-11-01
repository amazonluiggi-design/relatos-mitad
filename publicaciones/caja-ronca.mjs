// Textos y horarios de La Caja Ronca (hora de Ecuador, UTC-5). reel1 y reel2 son AVANCES.
const YT = "https://www.youtube.com/@relatos.delamitad";
const TT = "https://www.tiktok.com/@relatosdelamitad";
const FB = "https://www.facebook.com/RelatosDeLaMitad";

export const PUBLICACION = {
  largo: {
    archivo: "out/caja-ronca-largo.mp4",
    miniatura: "out/caja-ronca-miniatura.jpg",
    titulo: "La Caja Ronca: el tambor que nadie debía ver",
    texto: `Quito, medianoche. Un tambor retumba en las calles vacías y aparece una procesión de encapuchados con velas. Un joven se asomó, recibió una vela… y amaneció con un hueso en la mano. 🕯️

¿Tú te asomarías? Responde SÍ o NO 👇

▶️ YouTube: ${YT}
🎵 TikTok: ${TT}

Imágenes: recreaciones generadas con IA. La leyenda tiene varias versiones; contamos las más conocidas.
#cajaronca #quito #leyendasdeecuador #leyendas #misterio`,
    cuando: "2026-11-20T19:00:00-05:00",
  },
  reels: [
    { archivo: "out/caja-ronca-reel1.mp4", cuando: "2026-11-18T19:30:00-05:00",
      texto: `Si a medianoche escuchas un tambor en una calle vacía de Quito… no te asomes 🥁\n\nLa leyenda completa este viernes en la página 👆 ¿La conocías? SÍ o NO\n#cajaronca #quito #leyendas #misterio #ecuador` },
    { archivo: "out/caja-ronca-reel2.mp4", cuando: "2026-11-19T19:30:00-05:00",
      texto: `Le dieron una vela en la procesión de medianoche… y amaneció con un hueso en la mano 💀\n\nEste viernes, la historia completa en la página 👆 ¿Tú la habrías tomado?\n#cajaronca #quito #leyendasdeecuador #terror #misterio` },
    { archivo: "out/caja-ronca-reel3.mp4", cuando: "2026-11-21T19:30:00-05:00",
      texto: `Encapuchados con velas, un tambor y una carreta oscura… la procesión que no es de este mundo 🕯️\n\nLa leyenda completa en la página 👆 ¿Te asomarías?\n#cajaronca #quito #leyendas #misterio #ecuador` },
    { archivo: "out/caja-ronca-reel4.mp4", cuando: "2026-11-22T19:30:00-05:00",
      texto: `Para curarse, tuvo que devolver el hueso… a la misma hora y en el mismo lugar 😨\n\nRelato completo en la página 👆 ¿Tú te atreverías?\n#cajaronca #quito #leyendasdeecuador #terror #historia` },
    { archivo: "out/caja-ronca-reel5.mp4", cuando: "2026-11-23T19:30:00-05:00",
      texto: `¿Almas en pena, penitentes de verdad… o un invento para que nadie saliera de noche? 🤔\n\nTodas las versiones en la página 👆 ¿Cuál crees tú?\n#cajaronca #quito #leyendas #misterio #ecuador` },
    { archivo: "out/caja-ronca-reel6.mp4", cuando: "2026-11-24T19:30:00-05:00",
      texto: `Cada Viernes Santo, miles de cucuruchos recorren Quito… igual que en la leyenda de la Caja Ronca 🟣\n\nLa leyenda completa en la página 👆 ¿La has visto en persona?\n#cucuruchos #quito #semanasanta #cajaronca #leyendas` },
  ],
  partes: [
    { archivo: "out/caja-ronca-parte1.mp4", cuando: "2026-11-20T22:00:00-05:00", yt: "2026-11-20T22:00:00-05:00", texto: `La Caja Ronca · Parte 1 🥁 El tambor de medianoche. ¿Alguna vez escuchaste un tambor a medianoche?\n\nSígueme para la Parte 2 👆\n#cajaronca #quito #leyendas #ecuador #parte1` },
    { archivo: "out/caja-ronca-parte2.mp4", cuando: "2026-11-21T22:00:00-05:00", yt: "2026-11-21T22:00:00-05:00", texto: `La Caja Ronca · Parte 2 🕯️ El cortejo de encapuchados… y la vela. ¿Tú habrías aceptado la vela?\n\nSígueme para la Parte 3 👆\n#cajaronca #misterio #leyendas #quito #parte2` },
    { archivo: "out/caja-ronca-parte3.mp4", cuando: "2026-11-22T22:00:00-05:00", yt: "2026-11-22T22:00:00-05:00", texto: `La Caja Ronca · Parte 3 💀 La vela que amaneció convertida en hueso. ¿Qué habrías hecho con ese hueso?\n\nSígueme para la Parte 4 👆\n#cajaronca #terror #leyendas #quito #parte3` },
    { archivo: "out/caja-ronca-parte4.mp4", cuando: "2026-11-23T22:00:00-05:00", yt: "2026-11-23T22:00:00-05:00", texto: `La Caja Ronca · Parte 4 (final) 🟣 ¿Qué era realmente? Y la procesión que todavía existe.\n\n¿Te asomarías? Comenta 👇\n#cajaronca #quito #leyendasdeecuador #misterio #final` },
  ],
};

export const YOUTUBE = {
  largo: {
    titulo: "La Caja Ronca: el tambor de medianoche que nadie debía ver (leyenda de Quito completa)",
    descripcion: (capitulos) => `En el Quito colonial, pasada la medianoche, un tambor grave retumbaba en las calles vacías. Detrás venía una procesión de encapuchados con velas y una carreta oscura. Un joven se asomó, recibió una vela… y al amanecer tenía un hueso humano en la mano.

${capitulos}

🕯️ Nuevo relato cada semana. El próximo: un oro que muchos buscaron y pocos encontraron.

Las imágenes son recreaciones generadas con IA. La leyenda tiene varias versiones; aquí contamos las más conocidas.

📘 Facebook: ${FB}
🎵 TikTok: ${TT}

#cajaronca #quito #leyendasdeecuador #leyendas #misterio #historiadeecuador`,
    etiquetas: ["caja ronca", "la caja ronca", "leyenda de la caja ronca", "leyendas de quito", "leyendas ecuatorianas", "leyendas de ecuador", "cucuruchos", "jesus del gran poder", "quito colonial", "leyendas latinoamericanas"],
  },
  reels: [
    { titulo: "Si escuchas este tambor a medianoche… no te asomes 🥁 #leyendas #shorts" },
    { titulo: "Le dieron una vela… y amaneció con un hueso 💀 #misterio #shorts" },
    { titulo: "La procesión que no es de este mundo 🕯️ #quito #shorts" },
    { titulo: "Tuvo que devolver el hueso a medianoche 😨 #terror #shorts" },
    { titulo: "¿Qué era realmente la Caja Ronca? 🤔 #leyendas #shorts" },
    { titulo: "Esta procesión todavía existe en Quito 🟣 #ecuador #shorts" },
  ],
};
