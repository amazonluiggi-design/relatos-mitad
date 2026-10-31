// Textos y horarios de publicación de Cantuña (hora de Ecuador, UTC-5).
const YT = "https://www.youtube.com/@relatos.delamitad";
const TT = "https://www.tiktok.com/@relatosdelamitad";
export const PUBLICACION = {
  largo: {
    archivo: "out/cantuna-largo.mp4",
    miniatura: "out/miniatura.jpg",
    titulo: "Cantuña: el indígena que le ganó al diablo en Quito",
    texto: `A la iglesia de San Francisco, en Quito, le falta una piedra. Una sola. Y según la leyenda, esa piedra salvó el alma de un hombre que hizo un pacto con el diablo... y le ganó. 🕯️

Pero Cantuña sí existió. ¿De dónde salió su fortuna? La respuesta podría estar en el oro perdido de Rumiñahui.

¿Tú qué crees: engañó al diablo o a toda una ciudad? Te leo en los comentarios 👇

▶️ YouTube: ${YT}
🎵 TikTok: ${TT}

Imágenes: recreaciones artísticas generadas con IA.
#leyendasdeecuador #cantuña #quito #misterio #historiadeecuador`,
    cuando: "2026-10-26T19:00:00-05:00",
  },
  reels: [
    { archivo: "out/cantuna-reel1.mp4", cuando: "2026-10-26T20:00:00-05:00",
      texto: `Una iglesia de Quito tiene una piedra que falta... y detrás hay un pacto con el diablo 😳🕯️ ¿Conocías esta leyenda?\n\nRelato completo en la página 👆\n#leyendas #quito #ecuador #misterio #cantuña` },
    { archivo: "out/cantuna-reel2.mp4", cuando: "2026-10-27T19:30:00-05:00",
      texto: `Cientos de sombras construyeron esta iglesia en una sola noche... pero al amanecer faltaba una piedra 🔥\n\nEl final completo en la página 👆\n#leyendas #ecuador #misterio #historiasreales #quito` },
    { archivo: "out/cantuna-reel3.mp4", cuando: "2026-10-28T19:30:00-05:00",
      texto: `Una caravana llena de oro inca desapareció en los Andes. ¿Dónde está el tesoro de Rumiñahui? 🏔️✨\n\n#atahualpa #incas #tesoro #ecuador #historia #misterio` },
    { archivo: "out/cantuna-reel4.mp4", cuando: "2026-10-29T19:30:00-05:00",
      texto: `Cantuña sí existió. Y su fortuna sigue siendo un misterio... 🕯️ ¿Pacto con el diablo o el oro de Rumiñahui?\n\n#cantuña #quito #leyendasecuatorianas #misterio #ecuador` },
  ],
};

export const YOUTUBE = {
  largo: {
    titulo: "Cantuña: el indígena que le ganó al diablo en Quito (y la verdad detrás de la leyenda)",
    descripcion: (capitulos) => `A la iglesia de San Francisco, en Quito, le falta una piedra. Una sola. Y según la leyenda, esa piedra salvó el alma de un hombre que hizo un pacto con el diablo... y le ganó.

Pero Cantuña no es un personaje inventado: existió, fue rico, pagó su propia capilla, y su fortuna podría estar ligada al oro perdido de Rumiñahui.

${capitulos}

🕯️ Nuevo relato cada semana. Suscríbete para no perderte el próximo: el tesoro de los Llanganates.

Las imágenes son recreaciones artísticas generadas con IA. La leyenda tiene varias versiones; aquí contamos las más conocidas.

📘 Facebook: https://www.facebook.com/RelatosDeLaMitad
🎵 TikTok: https://www.tiktok.com/@relatosdelamitad

#leyendasdeecuador #cantuña #quito #leyendas #misterio #historiadeecuador`,
    etiquetas: ["cantuña", "leyenda de cantuña", "leyendas de quito", "leyendas ecuatorianas", "iglesia de san francisco quito", "pacto con el diablo", "rumiñahui", "tesoro de atahualpa", "leyendas latinoamericanas", "historia de ecuador", "misterios de ecuador"],
  },
  reels: [
    { titulo: "A esta iglesia de Quito le falta UNA piedra 😳 #leyendas #shorts" },
    { titulo: "Hizo un pacto con el diablo… y le ganó 🔥 #leyendas #shorts" },
    { titulo: "El oro de Atahualpa nunca llegó 🏔️ #incas #shorts" },
    { titulo: "La verdad que nadie te cuenta de Cantuña 🕯️ #quito #shorts" },
  ],
};

// ── Ritmo alto (nov 2026): reels cortos de "un dato" a las 12:30 y episodios de 3-5 min a las 20:00 (Facebook con anuncios + YouTube).
PUBLICACION.reels.push(
  { archivo: "out/cantuna-reel5.mp4", cuando: "2026-11-02T12:30:00-05:00", texto: `La noche que cientos de sombras construyeron una iglesia en Quito 🔥\n\nLa leyenda completa en la página 👆 ¿La conocías? SÍ o NO\n#cantuña #quito #leyendas #misterio #ecuador` },
  { archivo: "out/cantuna-reel6.mp4", cuando: "2026-11-04T12:30:00-05:00", texto: `Cantuña sí existió… y fue tan rico que pagó su propia capilla 😳 ¿De dónde salió su oro?\n\nRelato completo en la página 👆 ¿Tú qué crees?\n#cantuña #historia #quito #misterio #leyendas` },
  { archivo: "out/cantuna-reel7.mp4", cuando: "2026-11-06T12:30:00-05:00", texto: `¿Y si el pacto con el diablo fue una mentira para esconder un tesoro? 🤫\n\nLa historia completa en la página 👆 ¿Diablo o tesoro? Comenta\n#cantuña #tesoroinca #misterio #quito #leyendas` },
  { archivo: "out/cantuna-reel8.mp4", cuando: "2026-11-08T12:30:00-05:00", texto: `Todavía hay gente que busca la piedra que falta en San Francisco 👀 ¿Tú ya la buscaste?\n\nLa leyenda completa en la página 👆\n#cantuña #quito #sanfrancisco #leyendas #ecuador` },
);
YOUTUBE.reels.push(
  { titulo: "La noche que los demonios construyeron una iglesia 🔥 #leyendas #shorts" },
  { titulo: "Cantuña sí existió… y era millonario 😳 #historia #shorts" },
  { titulo: "La mentira perfecta de Cantuña 🤫 #misterio #shorts" },
  { titulo: "¿Ya buscaste la piedra que falta? 👀 #quito #shorts" },
);
PUBLICACION.episodios = [
  { archivo: "out/cantuna-episodio1.mp4", cuando: "2026-11-01T20:00:00-05:00", titulo: "Cantuña · Episodio 1: el oro perdido de Atahualpa",
    texto: `Cantuña · Episodio 1 🕯️ El oro perdido de Atahualpa y el atrio imposible de San Francisco.\n\nMañana, el Episodio 2: el pacto con el diablo. ¿Lo conocías? Comenta 👇\n#cantuña #quito #leyendasdeecuador #misterio #historia` },
  { archivo: "out/cantuna-episodio2.mp4", cuando: "2026-11-02T20:00:00-05:00", titulo: "Cantuña · Episodio 2: el pacto con el diablo",
    texto: `Cantuña · Episodio 2 🔥 El pacto, la noche de las sombras y la piedra que falta… y lo que casi nadie te cuenta.\n\n¿Engañó al diablo o engañó a todos? Comenta 👇\n#cantuña #quito #leyendasdeecuador #misterio #pactoconeldiablo` },
];
YOUTUBE.episodios = [
  { titulo: "Cantuña | Episodio 1: el oro perdido de Atahualpa (leyenda de Quito)" },
  { titulo: "Cantuña | Episodio 2: el pacto con el diablo y la piedra que falta" },
];

// Relleno del mismo día (sáb 31-oct): más publicaciones desde hoy.
PUBLICACION.reels.push({"archivo":"out/cantuna-reel9.mp4","cuando":"2026-10-31T12:30:00-05:00","texto":"Antes de que llegaran los españoles, un niño vio dónde escondieron el oro de Atahualpa 👀 Ese niño era Cantuña.\n\nLa leyenda completa en la página 👆 ¿La conocías? SÍ o NO\n#cantuña #atahualpa #oroinca #leyendas #ecuador"});
YOUTUBE.reels.push({"titulo":"Un niño vio dónde escondieron el oro 👀 #leyendas #shorts"});
