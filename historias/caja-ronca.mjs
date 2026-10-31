// Relato 5: La Caja Ronca (Quito). Leyenda colonial con varias versiones: se narra como tradición ("cuentan").
// Datos verificables: el toque de queda nocturno de la ciudad colonial, las cofradías y penitentes, los cucuruchos
// de capirote morado y la procesión de Jesús del Gran Poder en el Viernes Santo de Quito (centro histórico).
const ESTILO =
  "cinematic film still from an epic historical mystery documentary, ultra realistic, colonial Quito Ecuador at night, narrow cobblestone streets, whitewashed walls and wooden balconies, candlelight and moonlight, light mist, deep purple and gold color grade, 35mm film grain, high detail, no text, no gore";
const JOVEN = "young mestizo man in his early twenties from colonial Quito, short black hair, simple white shirt and dark wool poncho";
const CORTEJO = "night procession of hooded penitents in long purple robes and tall pointed purple hoods covering their faces, carrying lit candles, walking slowly";

export const HISTORIA = {
  id: "caja-ronca",
  titulo: "La Caja Ronca: el tambor que nadie debía ver",
  voz: "Rl2JPHsuEWSfwCD4ZHIQ", // El Faraón
  estilo: ESTILO,
  escenas: [
    // GANCHO
    { id: "g1", texto: "Quito, hace siglos. Pasada la medianoche, en una calle vacía, se escucha un tambor. Tum… tum… tum.", img: "empty narrow cobblestone street of colonial Quito at midnight, mist, a single candle in a window, a church dome behind, ominous", mov: "acercar" },
    { id: "g2", texto: "Es un sonido grave, profundo, que retumba en las paredes. Los vecinos apagan las velas y cierran las ventanas.", img: "colonial Quito house window at night with a frightened hand closing the wooden shutter, candle being blown out, mist outside", mov: "acercar" },
    { id: "g3", texto: "Porque todos saben lo que viene detrás del sonido: la Caja Ronca.", img: `${CORTEJO}, seen far away at the end of a misty colonial street at night, faint glow of candles`, mov: "acercar" },
    { id: "g4", texto: "Una procesión que no es de este mundo. Y cuentan que quien se atreve a mirarla… se lleva algo que no puede devolver tan fácil.", img: "a young man peeking through a crack of a wooden door at night, candlelight on his frightened eye, tense", mov: "acercar" },
    { id: "g5", texto: "Hoy te cuento la leyenda de la Caja Ronca: el tambor de medianoche, el cortejo de encapuchados y la vela que amaneció convertida en hueso.", img: "an old brass lantern glowing on a cobblestone street of colonial Quito at night under a full moon, mist, church towers", mov: "alejar" },
    // QUITO DE NOCHE
    { id: "q1", texto: "En el Quito de la Colonia, la noche era otra cosa. No había luz en las calles, solo algún farol y la luna.", img: "panoramic view of colonial Quito at night under the moon, dark rooftops and many church towers, Pichincha volcano silhouette", mov: "alejar" },
    { id: "q2", texto: "A cierta hora sonaban las campanas, y la gente debía recogerse en sus casas. Las calles quedaban en manos de la oscuridad.", img: "a colonial church bell tower ringing at night, bells moving, moonlight, a quiet city below", mov: "subir" },
    { id: "q3", texto: "Y en esa oscuridad, los quiteños juraban escuchar cosas. Pasos, cadenas, rezos… y un tambor.", img: "dark colonial street at night with faint shadows on the walls, mist creeping along the cobblestones, eerie", mov: "derecha" },
    // EL SONIDO
    { id: "s1", texto: "Cuentan que en el barrio vivía un joven al que llamaban Manuel. Trabajaba de día y, como todos, escuchaba las historias de su abuela.", img: `${JOVEN}, sitting by a fire in a humble colonial kitchen listening to an old indigenous grandmother telling a story, warm light`, mov: "acercar" },
    { id: "s2", texto: "La abuela siempre le decía lo mismo: si oyes la caja ronca, no te asomes. Reza y quédate quieto.", img: "close portrait of an old indigenous grandmother with a shawl, serious eyes, warning gesture, candlelight", mov: "acercar" },
    { id: "s3", texto: "Pero una noche, Manuel no podía dormir. Y desde lejos llegó el sonido: tum… tum… tum.", img: `${JOVEN}, lying awake in bed at night, eyes open, turning his head toward the window, moonlight`, mov: "acercar" },
    { id: "s4", texto: "El tambor se acercaba. Con él, un murmullo de rezos y el arrastrar de algo pesado sobre las piedras.", img: "cobblestone street at night with the faint glow of approaching candles reflecting on wet stones, mist, ominous", mov: "derecha" },
    { id: "s5", texto: "La curiosidad pudo más que el miedo. Manuel se levantó despacio y entreabrió la puerta.", img: `${JOVEN}, slowly opening a heavy wooden door just a crack at night, candlelight from outside on his face`, mov: "acercar" },
    // EL CORTEJO
    { id: "c1", texto: "Por la calle avanzaba una procesión. Decenas de figuras con túnicas largas y capuchas puntiagudas que les tapaban la cara.", img: `${CORTEJO}, filling a narrow colonial Quito street at night, mist, candlelight on the walls`, mov: "derecha" },
    { id: "c2", texto: "Cada uno llevaba una vela. Caminaban sin hacer ruido, como si flotaran.", img: "close view of hooded penitents' hands holding tall candles, faces hidden under pointed hoods, flames flickering, eerie", mov: "acercar" },
    { id: "c3", texto: "Al frente, uno de ellos golpeaba un tambor viejo: la caja ronca. Y detrás venía una carreta oscura.", img: "a hooded figure in a purple robe beating a large old drum at the front of a night procession, a dark wooden cart behind, mist", mov: "acercar" },
    { id: "c4", texto: "Cuentan que la carreta la empujaban figuras que no tenían forma clara. Y que encima iba alguien que nadie quería mirar.", img: "a dark wooden cart pushed through a misty colonial street at night by shadowy shapes, a tall silhouette with horns barely visible on top, not gory", mov: "acercar" },
    { id: "c5", texto: "Manuel se quedó helado. Quiso cerrar la puerta, pero una de las figuras encapuchadas se detuvo frente a él.", img: `a hooded penitent in a purple robe stopping right in front of a half-open door, facing ${JOVEN} who is frozen with fear, candlelight`, mov: "acercar" },
    // LA VELA
    { id: "v1", texto: "Sin decir una palabra, le extendió una vela encendida. Y Manuel, sin saber por qué, la tomó.", img: "a gloved hand from under a purple robe handing a lit candle to a trembling young man at a doorway at night, close shot", mov: "acercar" },
    { id: "v2", texto: "La procesión siguió su camino. El tambor se fue alejando hasta desaparecer.", img: `${CORTEJO}, walking away into the mist at the end of the street, candles fading, drum sound implied`, mov: "alejar" },
    { id: "v3", texto: "Manuel cerró la puerta, temblando, con la vela todavía en la mano. Y así, sin soltarla, se quedó dormido.", img: `${JOVEN}, sitting on the floor against a closed door at night, holding a lit candle, exhausted and scared`, mov: "acercar" },
    // EL HUESO
    { id: "h1", texto: "Al amanecer, sintió algo frío y duro en la mano.", img: "early dawn light through a colonial window falling on a sleeping young man's hand, mysterious", mov: "acercar" },
    { id: "h2", texto: "Ya no era una vela. Era un hueso. Un hueso humano, largo, como el de una pierna.", img: "a young man's hand holding an old human leg bone instead of a candle, dawn light, shocking but not gory, dramatic close-up", mov: "acercar" },
    { id: "h3", texto: "Manuel gritó tan fuerte que despertó a toda la casa. La abuela llegó corriendo, vio el hueso… y supo lo que había pasado.", img: "an old indigenous grandmother entering a room at dawn, hands over her mouth in horror, a young man holding a bone in the background", mov: "derecha" },
    { id: "h4", texto: "Desde ese día, Manuel no pudo comer ni dormir. Cuentan que una fiebre extraña lo consumía.", img: `${JOVEN}, pale and sick in bed with fever, candles around, grandmother praying beside him, dark room`, mov: "acercar" },
    // DEVOLVERLO
    { id: "d1", texto: "La familia fue a buscar a un sacerdote. Y el sacerdote les dijo algo que nadie quería escuchar.", img: "an old colonial priest in black robes listening gravely to a worried family at the door of a church, dim light", mov: "acercar" },
    { id: "d2", texto: "El hueso pertenecía al cortejo. Y la única forma de librarse era devolverlo… a la misma hora y en el mismo lugar.", img: "close view of an old priest's face, serious, candle reflected in his eyes, whispering advice", mov: "acercar" },
    { id: "d3", texto: "Así que, a la noche siguiente, Manuel volvió a abrir la puerta. Con el hueso envuelto en un paño y un rosario en la otra mano.", img: `${JOVEN}, standing at an open door at midnight holding a bundle wrapped in cloth and a rosary, terrified but determined, mist`, mov: "acercar" },
    { id: "d4", texto: "A medianoche volvió el tambor. La procesión pasó frente a él, y la misma figura encapuchada estiró la mano.", img: `${CORTEJO}, passing in front of a doorway at midnight, one hooded figure stretching out a gloved hand toward the young man`, mov: "acercar" },
    { id: "d5", texto: "Manuel le entregó el hueso sin mirarle la cara. Y el cortejo se perdió en la neblina, para siempre.", img: "a cloth bundle being handed to a hooded figure at night, then the procession disappearing into thick mist, candles fading", mov: "alejar" },
    { id: "d6", texto: "Dicen que esa misma mañana, la fiebre se le fue. Pero nunca más volvió a asomarse por la ventana de noche.", img: `${JOVEN}, recovered, sitting by a sunny window in the morning, looking thoughtful and relieved`, mov: "acercar" },
    // ¿QUÉ ERA?
    { id: "x1", texto: "Pero, ¿qué era realmente la Caja Ronca? Hay varias explicaciones.", img: "a colonial Quito street crossroads at night with candlelight and mist, mysterious atmosphere", mov: "alejar" },
    { id: "x2", texto: "Para los creyentes, era un cortejo de almas en pena, o del mismo demonio, que salía a buscar a los curiosos y a los pecadores.", img: "ghostly translucent hooded figures with candles drifting through a colonial street at night, eerie and elegant", mov: "derecha" },
    { id: "x3", texto: "Otros dicen que eran personas de carne y hueso: cofradías y penitentes que salían de noche a rezar, y que preferían que nadie los viera.", img: "real colonial penitents in hooded robes praying by candlelight in a dark chapel, solemn, historical", mov: "acercar" },
    { id: "x4", texto: "Y hay quien cree que la leyenda servía para algo muy práctico: que nadie anduviera por las calles después del toque de queda.", img: "colonial Quito mother closing the door at night and putting a child to bed, candle, protective", mov: "acercar" },
    // HOY
    { id: "o1", texto: "Lo curioso es que en Quito todavía puedes ver una procesión muy parecida.", img: "modern Quito historic center during Holy Week, crowds in the streets, church domes, daylight", mov: "alejar" },
    { id: "o2", texto: "Cada Viernes Santo, en la procesión de Jesús del Gran Poder, miles de cucuruchos recorren el centro histórico con túnicas moradas y capirotes.", img: "huge Good Friday procession in Quito's historic center with many penitents in purple robes and tall pointed hoods, real, daylight", mov: "derecha" },
    { id: "o3", texto: "De día, es una de las tradiciones más impresionantes de Latinoamérica. De noche, en una calle vacía… sería otra historia.", img: "a single penitent in a purple robe and tall pointed hood standing alone in an empty cobblestone street at night, mist", mov: "acercar" },
    // CIERRE
    { id: "z1", texto: "Y tú, ¿te asomarías si escucharas la caja ronca a medianoche? Déjamelo en los comentarios.", img: "a half-open wooden door at midnight with candlelight and mist outside, the faint glow of a procession approaching", mov: "acercar" },
    { id: "z2", texto: "Suscríbete, porque en el próximo relato vamos tras un oro que muchos buscaron y pocos encontraron.", img: "glimmer of gold nuggets in a dark mountain mine tunnel lit by a lantern, mysterious", mov: "acercar" },
  ],
};

export const TITULO_CARTEL = { en: "g5", titulo: "LA CAJA RONCA", sub: "El tambor de medianoche" };

export const CAPITULOS = {
  q1: "Quito de noche",
  s1: "El sonido",
  c1: "El cortejo",
  v1: "La vela",
  h1: "El hueso",
  d1: "Devolverlo",
  x1: "¿Qué era?",
  o1: "Quito hoy",
};

export const REELS = [
  { id: "reel1", gancho: "Si escuchas este tambor a medianoche… no te asomes", escenas: ["g1", "g2", "g3", "g4"], cierre: "Este viernes, la historia completa" },
  { id: "reel2", gancho: "Le dieron una vela… y amaneció con un hueso", escenas: ["v1", "v2", "v3", "h1", "h2"], cierre: "Este viernes, en el canal" },
  { id: "reel3", gancho: "La procesión que no es de este mundo", escenas: ["c1", "c2", "c3", "c4", "c5"], cierre: "La leyenda completa, en el canal" },
  { id: "reel4", gancho: "Tuvo que devolver el hueso a medianoche", escenas: ["d1", "d2", "d3", "d4", "d5"], cierre: "Relato completo en el canal" },
  { id: "reel5", gancho: "¿Qué era realmente la Caja Ronca?", escenas: ["x1", "x2", "x3", "x4"], cierre: "Tú, ¿qué crees? Míralo en el canal" },
  { id: "reel6", gancho: "Esta procesión todavía existe en Quito", escenas: ["o1", "o2", "o3", "z1"], cierre: "¿La has visto? Cuéntame en el canal" },
  { id: "parte1", tiktok: true, gancho: "La Caja Ronca · Parte 1: el tambor", escenas: ["g1", "g2", "g3", "g4", "q1", "q2", "q3", "s1", "s2", "s3", "s4", "s5"], cierre: "Parte 2 en mi perfil · Sígueme" },
  { id: "parte2", tiktok: true, gancho: "La Caja Ronca · Parte 2: el cortejo", escenas: ["c1", "c2", "c3", "c4", "c5", "v1", "v2", "v3"], cierre: "Parte 3 en mi perfil · Sígueme" },
  { id: "parte3", tiktok: true, gancho: "La Caja Ronca · Parte 3: el hueso", escenas: ["h1", "h2", "h3", "h4", "d1", "d2", "d3", "d4", "d5", "d6"], cierre: "Parte 4 en mi perfil · Sígueme" },
  { id: "parte4", tiktok: true, gancho: "La Caja Ronca · Parte 4: ¿qué era?", escenas: ["x1", "x2", "x3", "x4", "o1", "o2", "o3", "z1"], cierre: "Sígueme para el próximo relato" },
];

export const CLIPS_MAX = {};
