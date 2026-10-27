// Relato 3: La Dama Tapada de Guayaquil. Leyenda colonial con muchas versiones: se narra como tradición
// ("cuentan", "según los relatos"). Datos históricos verificables: Guayaquil puerto y astillero colonial,
// casas de madera con portales y balcones, incendios (el Fuego Grande de 1896), barrio Las Peñas y el
// cerro Santa Ana (444 escalones hoy), las tapadas limeñas (saya y manto) y la Sayona venezolana.
const ESTILO =
  "cinematic film still from an epic historical mystery documentary, ultra realistic, colonial port city of Guayaquil Ecuador, humid tropical night, moody dramatic lighting, light mist, warm lantern glow against deep teal shadows, 35mm film grain, high detail, no text, no gore";
const DAMA = "tall elegant woman in a long black 18th century colonial gown, her whole face hidden under a heavy black lace veil and mantle, gloved hands";
const CABALLERO = "mestizo gentleman in his thirties with tan skin and a thin moustache, 18th century colonial frock coat and tricorn hat";

export const HISTORIA = {
  id: "dama-tapada",
  titulo: "La Dama Tapada: la mujer que nadie debía seguir",
  voz: "Rl2JPHsuEWSfwCD4ZHIQ", // El Faraón
  estilo: ESTILO,
  escenas: [
    // GANCHO
    { id: "g1", texto: "Guayaquil, hace más de doscientos años. Es casi medianoche y en las calles de madera ya no queda nadie.", img: "empty muddy street of colonial Guayaquil at midnight, wooden houses with balconies and arcades, a single oil lantern, light mist", mov: "acercar" },
    { id: "g2", texto: "De pronto, el aire se llena de un perfume de flores. Y al fondo de la calle aparece una mujer.", img: `${DAMA}, standing far away at the end of a misty colonial street at night, lantern light behind her`, mov: "acercar" },
    { id: "g3", texto: "Es alta, elegante, con un vestido largo. Pero tiene el rostro completamente cubierto por un velo.", img: `close portrait of a ${DAMA}, standing still under a lantern, mysterious and elegant, no face visible`, mov: "subir" },
    { id: "g4", texto: "Los hombres que la vieron dicen que no podían dejar de seguirla. Los que lograron alcanzarla… no volvieron a ser los mismos.", img: "silhouette of a colonial gentleman walking after a veiled woman down a long foggy street of wooden houses at night", mov: "derecha" },
    { id: "g5", texto: "Hoy te voy a contar la leyenda de la Dama Tapada: quién era, a quién buscaba, y por qué en Guayaquil todavía se dice que es mejor llegar temprano a casa.", img: "an old brass lantern glowing on a wooden pier by a wide dark river at night under a full moon, mist, mysterious and elegant", mov: "alejar" },
    // EL PUERTO
    { id: "p1", texto: "Para entender esta historia hay que imaginar el Guayaquil de la Colonia. Un puerto caliente y húmedo, a orillas del inmenso río Guayas.", img: "aerial view of colonial Guayaquil port at dusk, wooden houses along the wide Guayas river, sailing ships at anchor, tropical humid haze", mov: "alejar" },
    { id: "p2", texto: "Tenía uno de los astilleros más importantes del Pacífico. Ahí se construían barcos con maderas finas traídas de la selva.", img: "colonial shipyard on a tropical riverbank, a large wooden sailing ship under construction, workers and timber, golden late afternoon light", mov: "derecha" },
    { id: "p3", texto: "Las casas eran de madera, con portales para cubrirse de la lluvia y balcones que daban a la calle. Por eso los incendios eran el gran miedo de la ciudad.", img: "row of colonial wooden houses with arcades and carved balconies on a rainy street of Guayaquil, warm windows, wet ground reflecting light", mov: "derecha" },
    { id: "p4", texto: "De día, el puerto era puro movimiento: marineros, comerciantes, cacao, gritos y campanas.", img: "busy colonial port market by the river in daylight, sacks of cacao beans, sailors and merchants, sailing ships behind, vibrant but historical", mov: "acercar" },
    { id: "p5", texto: "Pero cuando caía la noche, todo cambiaba. Las calles se quedaban a oscuras, y solo los faroles y las tabernas seguían encendidos.", img: "dark colonial street at night with a glowing tavern doorway spilling warm light, a few lanterns, mist rising from the river", mov: "acercar" },
    { id: "p6", texto: "Y era justo a esa hora, entre las once y la medianoche, cuando empezaba a aparecer ella.", img: `${DAMA}, emerging slowly from the mist at the corner of a dark wooden arcade, lantern light, midnight`, mov: "subir" },
    // LA APARICIÓN
    { id: "a1", texto: "Cuentan que siempre se le aparecía a un mismo tipo de hombre: los que salían tarde de las tabernas, los mujeriegos, los que dejaban a su familia esperando.", img: `${CABALLERO}, slightly drunk, stepping out of a lively colonial tavern at night, laughing, lantern light`, mov: "derecha" },
    { id: "a2", texto: "Primero llegaba el perfume. Un olor dulce, como de nardos o de violetas, que no se sabía de dónde venía.", img: "a colonial gentleman stopping in a dark street, turning his head as if smelling something, delicate white flower petals floating in the mist", mov: "acercar" },
    { id: "a3", texto: "Después la veía: una silueta de mujer, a unos pasos, caminando despacio. Sin hacer ningún ruido.", img: `${DAMA}, seen from behind, walking slowly away on a wet colonial street at night, her long gown and mantle flowing, no footsteps`, mov: "derecha" },
    { id: "a4", texto: "El hombre la llamaba. Le decía piropos, le pedía que se diera la vuelta. Pero ella nunca respondía.", img: `${CABALLERO}, calling out and gesturing to a veiled woman ahead of him on a dark street, playful smile, lantern light`, mov: "acercar" },
    { id: "a5", texto: "Y aquí está lo extraño: por más que él apurara el paso, nunca lograba alcanzarla. Ella siempre estaba a la misma distancia.", img: "long perspective of a foggy colonial street at night, a man hurrying, a veiled woman always ahead at the same distance, eerie", mov: "acercar" },
    { id: "a6", texto: "Así lo iba llevando. Calle por calle. Lejos de las casas, lejos de los faroles, lejos de cualquiera que pudiera ayudarlo.", img: "a veiled woman leading a man along a dark muddy path out of the colonial city, last lanterns far behind, mangroves and mist", mov: "derecha" },
    // EL ROSTRO
    { id: "r1", texto: "Hasta que, de repente, ella se detenía.", img: `${DAMA}, standing completely still in the middle of a dark misty path at night, seen from behind, moonlight`, mov: "acercar" },
    { id: "r2", texto: "Muchos dicen que era frente a las puertas del cementerio. Otros, a la orilla del estero, entre los manglares.", img: "old iron gates of a colonial cemetery at night with mist, crosses and stone tombs behind, moonlight, a veiled woman standing before them", mov: "subir" },
    { id: "r3", texto: "El hombre, feliz, se acercaba por fin. Y ella, muy despacio, se daba la vuelta.", img: `${CABALLERO}, approaching hopefully a veiled woman who is slowly turning around, moonlit cemetery gate, tense`, mov: "acercar" },
    { id: "r4", texto: "Levantaba el velo con sus manos enguantadas… y debajo no había un rostro.", img: "gloved hands slowly lifting a black lace veil, the face beneath completely lost in deep darkness, only shadow, moonlight on the lace", mov: "acercar" },
    { id: "r5", texto: "Había una calavera. Con los ojos vacíos. Y el perfume de flores se convertía en un olor a tumba.", img: "dramatic silhouette of a veiled colonial woman against moonlight, the lifted veil revealing only the faint pale outline of a skull in deep shadow, elegant and haunting, not gory", mov: "acercar" },
    { id: "r6", texto: "Cuentan que algunos hombres se desmayaban ahí mismo. Los encontraban al amanecer, tirados en el barro, con la cara llena de espanto.", img: "dawn light over a misty colonial cemetery gate, a man's hat and a dropped lantern lying in the mud, no body visible", mov: "alejar" },
    { id: "r7", texto: "Otros se volvían locos, o pasaban semanas con una fiebre que ningún médico sabía curar. Y algunos, dicen, nunca despertaron.", img: "a pale colonial man lying in bed with fever, candlelight, a worried old woman praying beside him, dark wooden room", mov: "acercar" },
    // LOS QUE LA VIERON
    { id: "t1", texto: "Con el tiempo, la Dama Tapada se volvió la conversación de todo Guayaquil.", img: "group of colonial townspeople whispering in a wooden arcade by daylight, women with fans and men in hats, gossip", mov: "derecha" },
    { id: "t2", texto: "Se hablaba de un caballero muy respetado que, después de verla, nunca más volvió a salir de noche.", img: `${CABALLERO}, older and shaken, sitting by a window at home looking out at the night street with fear, candlelight`, mov: "acercar" },
    { id: "t3", texto: "De jóvenes que apostaban quién se atrevía a buscarla, y que regresaban pálidos y sin querer contar nada.", img: "young colonial men in a tavern daring each other with raised cups, candlelight, one looks nervous", mov: "derecha" },
    { id: "t4", texto: "Hasta de los serenos, los guardias que vigilaban la ciudad de noche, que preferían no pasar por ciertas calles.", img: "colonial night watchman with a lantern and a spear standing nervously at a dark street corner, mist, looking over his shoulder", mov: "acercar" },
    { id: "t5", texto: "Y en las casas, las esposas y las madres repetían lo mismo: si sales de noche, no sigas a ninguna mujer que no conozcas.", img: "colonial mother warning her grown son at the door of a wooden house at night, candle in hand, serious expression", mov: "acercar" },
    // ¿QUIÉN ERA?
    { id: "q1", texto: "Pero, ¿quién era la Dama Tapada? Aquí las versiones se separan.", img: `${DAMA}, standing at the center of a crossroads of three dark streets in the mist, lantern light, mysterious`, mov: "alejar" },
    { id: "q2", texto: "Una de las más contadas dice que fue una joven guayaquileña que se enamoró de un hombre que le prometió matrimonio… y la dejó esperando.", img: "young colonial woman in a beautiful light dress waiting alone on a balcony at dusk, looking at the river, sad, holding a letter", mov: "acercar" },
    { id: "q3", texto: "Ella murió de tristeza. Y desde entonces su espíritu regresa a castigar a los hombres que engañan.", img: "a white wedding veil lying on an empty wooden chair in a dark colonial room, moonlight through the window, melancholic", mov: "acercar" },
    { id: "q4", texto: "Otros creen que no era un alma en pena, sino algo más antiguo: un espíritu que tomaba la forma de lo que el hombre más deseaba, para llevarlo a la perdición.", img: "a shadowy feminine silhouette made of mist and moonlight floating over a dark river among mangroves, mysterious and elegant", mov: "subir" },
    { id: "q5", texto: "Y hay quienes piensan que la leyenda la inventaron las propias mujeres de Guayaquil, para que sus maridos volvieran temprano a casa.", img: "colonial women sharing a knowing smile while sewing together in a candlelit room, warm and intimate", mov: "derecha" },
    { id: "q6", texto: "Si fue así… funcionó durante generaciones.", img: "a colonial man hurrying home at night carrying a lantern, glancing nervously behind him, empty street", mov: "acercar" },
    // NO ESTÁ SOLA
    { id: "l1", texto: "Lo curioso es que la Dama Tapada no está sola. En otros países de América Latina existen historias muy parecidas.", img: "an old map of South America on parchment lit by candlelight, colonial cartography, mysterious mood", mov: "alejar" },
    { id: "l2", texto: "En Lima, durante siglos, existieron las tapadas limeñas: mujeres reales que salían a la calle cubiertas con un manto que solo dejaba ver un ojo.", img: "historical Lima colonial street, elegant women wearing saya skirt and manto shawl covering the face except one eye, daylight, balconies", mov: "derecha" },
    { id: "l3", texto: "En Venezuela y Colombia se cuenta la de la Sayona, una mujer de blanco que se les aparece a los hombres infieles en los caminos.", img: "a tall woman in a long white dress standing on a lonely moonlit country road among tall grass, face hidden by long black hair, mist", mov: "acercar" },
    { id: "l4", texto: "Distintos lugares, la misma advertencia: una mujer hermosa, en la noche, que no es lo que parece.", img: `${DAMA}, standing between two other ghostly veiled women in a misty moonlit plaza, three silhouettes, elegant and eerie`, mov: "alejar" },
    // HOY
    { id: "h1", texto: "El Guayaquil de la Colonia ya no existe. El Fuego Grande de mil ochocientos noventa y seis consumió buena parte de la ciudad de madera.", img: "historical great fire consuming a wooden colonial city at night, flames and smoke over the river, people watching from boats, epic", mov: "subir" },
    { id: "h2", texto: "Hoy, de esa época quedan pocos rincones, como el barrio Las Peñas, al pie del cerro Santa Ana, con sus casas de colores y sus escalones.", img: "colorful historic houses of Las Peñas neighborhood climbing Santa Ana hill in Guayaquil at night, stairs with lanterns, river view", mov: "subir" },
    { id: "h3", texto: "Ahora hay luces, malecón y edificios. Pero cuando cae la noche y sube la neblina del río, todavía hay quien baja la voz para hablar de ella.", img: "modern Guayaquil riverside boardwalk at night with mist rising from the Guayas river, city lights, a lone figure in a dark veil in the distance", mov: "alejar" },
    { id: "h4", texto: "Y quién sabe. Tal vez la Dama Tapada sigue caminando por ahí, buscando al próximo que se atreva a seguirla.", img: `${DAMA}, walking away slowly up old stone stairs with lanterns in a historic hillside neighborhood at night, mist`, mov: "subir" },
    // CIERRE
    { id: "c1", texto: "¿Tú la seguirías? ¿O conoces a alguien que dice haberla visto? Cuéntamelo en los comentarios.", img: `${DAMA}, standing under a single lantern at the end of a misty street, looking toward the viewer, inviting and mysterious`, mov: "acercar" },
    { id: "c2", texto: "Y suscríbete, porque en el próximo relato volvemos a Quito, a la historia del cura que se escapaba de noche… y del Cristo que le habló: el Padre Almeida.", img: "a colonial monk in a brown habit climbing down from a church tower window at night in Quito, moonlight, playful but mysterious", mov: "acercar" },
  ],
};

export const TITULO_CARTEL = { en: "g5", titulo: "LA DAMA TAPADA", sub: "La mujer que nadie debía seguir" };

export const CAPITULOS = {
  p1: "El puerto",
  a1: "La aparición",
  r1: "El rostro",
  t1: "Los que la vieron",
  q1: "¿Quién era?",
  l1: "No está sola",
  h1: "Guayaquil hoy",
};

// Avances (miércoles y jueves antes del estreno) + reels (sábado a martes) para las 3 redes,
// y PARTES solo para TikTok (la historia completa en vertical).
export const REELS = [
  { id: "reel1", gancho: "Si hueles flores a medianoche… no la sigas", escenas: ["g1", "g2", "g3", "a2", "a3", "a5", "r1"], cierre: "Este viernes, la historia completa" },
  { id: "reel2", gancho: "La mujer que nadie lograba alcanzar", escenas: ["a1", "a3", "a4", "a5", "a6", "r1", "r3"], cierre: "Este viernes, en el canal" },
  { id: "reel3", gancho: "Levantó el velo… y no tenía rostro", escenas: ["r1", "r2", "r3", "r4", "r5", "r6", "r7"], cierre: "La leyenda completa, en el canal" },
  { id: "reel4", gancho: "Hasta los guardias le tenían miedo", escenas: ["t1", "t2", "t3", "t4", "t5", "q6"], cierre: "Relato completo en el canal" },
  { id: "reel5", gancho: "¿Quién era la Dama Tapada?", escenas: ["q1", "q2", "q3", "q4", "q5", "q6"], cierre: "Tú, ¿qué crees? Míralo en el canal" },
  { id: "reel6", gancho: "No solo en Guayaquil: está en toda Latinoamérica", escenas: ["l1", "l2", "l3", "l4", "h3", "h4"], cierre: "La historia completa, en el canal" },
  { id: "parte1", tiktok: true, gancho: "La Dama Tapada · Parte 1: el puerto", escenas: ["g1", "g2", "g3", "g4", "p1", "p2", "p3", "p4", "p5", "p6"], cierre: "Parte 2 en mi perfil · Sígueme" },
  { id: "parte2", tiktok: true, gancho: "La Dama Tapada · Parte 2: la aparición", escenas: ["a1", "a2", "a3", "a4", "a5", "a6", "r1", "r2", "r3", "r4", "r5", "r6", "r7"], cierre: "Parte 3 en mi perfil · Sígueme" },
  { id: "parte3", tiktok: true, gancho: "La Dama Tapada · Parte 3: ¿quién era?", escenas: ["t1", "t2", "t3", "t4", "t5", "q1", "q2", "q3", "q4", "q5", "q6"], cierre: "Parte 4 en mi perfil · Sígueme" },
  { id: "parte4", tiktok: true, gancho: "La Dama Tapada · Parte 4: no está sola", escenas: ["l1", "l2", "l3", "l4", "h1", "h2", "h3", "h4", "c1"], cierre: "Sígueme para el próximo relato" },
];

export const MINIATURA = { cara: "r5", fondo: "g1", linea1: "NO LA", linea2: "SIGAS", dato: "GUAYAQUIL · LEYENDA COLONIAL" };

export const CLIPS_MAX = {};
