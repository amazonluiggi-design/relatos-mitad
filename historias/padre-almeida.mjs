// Relato 4: El Padre Almeida (Quito). Leyenda colonial muy conocida, con tono de misterio y algo de humor.
// Se narra como tradición ("cuentan"). Datos verificables: convento franciscano de San Diego en Quito (fines del
// siglo XVI), la estatua de Cristo que la tradición asocia a la leyenda, la frase "¿Hasta cuándo, Padre Almeida?".
const ESTILO =
  "cinematic film still from an epic historical mystery documentary, ultra realistic, colonial Quito Ecuador in the 18th century, moody candlelight and moonlight, light mist, warm gold and deep teal color grade, 35mm film grain, high detail, no text, no gore";
const ALMEIDA = "young mestizo Franciscan friar in his late twenties with tan skin, short dark beard and a mischievous smile, wearing a brown hooded friar habit with a white rope belt";
const CRISTO = "life-size colonial polychrome wooden statue of Christ on the cross in the Quito school style, solemn and beautiful, softly lit by candles";

export const HISTORIA = {
  id: "padre-almeida",
  titulo: "El Padre Almeida: el fraile que se escapaba de noche",
  voz: "Rl2JPHsuEWSfwCD4ZHIQ", // El Faraón
  estilo: ESTILO,
  escenas: [
    // GANCHO
    { id: "g1", texto: "Quito, hace casi trescientos años. Medianoche en un convento. Todos los frailes duermen… menos uno.", img: "colonial Franciscan convent in Quito at midnight under a full moon, whitewashed walls and a bell tower, mountains behind, mist", mov: "acercar" },
    { id: "g2", texto: "Ese fraile sube en silencio a la torre, se apoya en una estatua de Cristo… y se escapa por la ventana.", img: `${ALMEIDA}, climbing carefully by candlelight in a dark church tower near a ${CRISTO}, a small open window behind with the moon`, mov: "subir" },
    { id: "g3", texto: "Lo hacía casi todas las noches. Hasta que una noche, la estatua le habló.", img: `close view of the face of a ${CRISTO}, eyes seeming to look down, candle flames trembling, mysterious`, mov: "acercar" },
    { id: "g4", texto: "«¿Hasta cuándo, Padre Almeida?». Y lo que él respondió se volvió una de las frases más famosas de Quito.", img: `${ALMEIDA}, frozen in surprise halfway out of a tower window at night, turning back toward a crucifix statue, moonlight`, mov: "acercar" },
    { id: "g5", texto: "Hoy te cuento la leyenda completa del Padre Almeida: sus escapadas, la voz en la torre… y el cortejo fúnebre que le cambió la vida.", img: "an old brass lantern glowing on the cobblestones of a narrow colonial Quito street at night, a church dome in the background, mist", mov: "alejar" },
    // EL CONVENTO
    { id: "c1", texto: "Para entender esta historia hay que imaginar el Quito del siglo dieciocho: una ciudad de iglesias, campanas y calles empinadas.", img: "panoramic view of colonial Quito in the 18th century at dusk, many church towers and domes, red tile roofs, Pichincha volcano behind", mov: "alejar" },
    { id: "c2", texto: "Al sur del centro estaba, y todavía está, el convento franciscano de San Diego. Un lugar de silencio, oración y disciplina.", img: "quiet cloister of a colonial Franciscan convent with white arches, a stone fountain and a garden, late afternoon light", mov: "derecha" },
    { id: "c3", texto: "Los frailes se levantaban de madrugada, rezaban, trabajaban y a la noche las puertas se cerraban con llave. Nadie salía.", img: "row of hooded Franciscan friars walking in silence through a candlelit colonial corridor at dawn, devout atmosphere", mov: "derecha" },
    { id: "c4", texto: "Bueno… casi nadie.", img: `${ALMEIDA}, peeking out from behind a stone column in a dark convent corridor with a sly smile, candlelight`, mov: "acercar" },
    // EL FRAILE
    { id: "f1", texto: "Cuentan que entre esos frailes había uno joven, alegre, de buena familia, llamado Manuel de Almeida.", img: `portrait of a ${ALMEIDA}, standing in a colonial convent garden, warm light, charming expression`, mov: "acercar" },
    { id: "f2", texto: "Dicen que no había entrado al convento por vocación, sino porque así lo había decidido su familia.", img: "a wealthy colonial family in elegant 18th century clothes leaving a young man at the heavy wooden door of a convent, serious faces", mov: "derecha" },
    { id: "f3", texto: "Y a Almeida la vida del convento se le hacía larga. Extrañaba la música, las fiestas, las risas de la ciudad.", img: `${ALMEIDA}, sitting bored by a convent window at night, looking longingly at the distant lights of the city, chin on his hand`, mov: "acercar" },
    { id: "f4", texto: "Así que encontró una salida. Literalmente.", img: "a small high window in a colonial church tower open to the night sky, moonlight pouring in, rope hanging, mysterious", mov: "subir" },
    // LAS ESCAPADAS
    { id: "e1", texto: "En el coro de la iglesia había una gran estatua de Cristo crucificado, junto a una ventana alta que daba a la calle.", img: `${CRISTO} in the choir of a colonial church next to a high window, dim candlelight, golden altarpiece behind`, mov: "subir" },
    { id: "e2", texto: "Cada noche, cuando el convento dormía, Almeida subía al coro, pisaba con cuidado la estatua para alcanzar la ventana… y saltaba a la calle.", img: `${ALMEIDA}, carefully stepping up beside a large crucifix statue to reach a high window at night, candle in hand, tense and comic`, mov: "subir" },
    { id: "e3", texto: "Cuentan que iba a las fiestas de la ciudad, a las chicherías y a las reuniones donde había música y guitarras hasta el amanecer.", img: "lively colonial Quito tavern at night with guitars, dancing couples, clay cups of chicha and candles, warm and joyful", mov: "derecha" },
    { id: "e4", texto: "Antes de que salieran los frailes a rezar, volvía por el mismo camino: la ventana, la estatua, el coro. Y nadie se daba cuenta.", img: `${ALMEIDA}, sneaking back through a high church window at dawn, dawn light, looking around nervously`, mov: "acercar" },
    { id: "e5", texto: "Bueno, nadie… menos uno.", img: `close view of the solemn face of a ${CRISTO} in the dark, a single candle, as if watching`, mov: "acercar" },
    // LA VOZ
    { id: "v1", texto: "Una noche, cuando Almeida ya tenía un pie en la estatua y otro en la ventana, escuchó una voz grave que llenó todo el coro.", img: `${ALMEIDA}, frozen with one foot on a crucifix statue and one at a high window, eyes wide with fear, candle flame bending`, mov: "acercar" },
    { id: "v2", texto: "«¿Hasta cuándo, Padre Almeida?».", img: `dramatic low angle of a ${CRISTO} lit by a beam of moonlight in a dark church choir, dust in the air`, mov: "acercar" },
    { id: "v3", texto: "Cualquiera habría caído de rodillas. Pero cuentan que Almeida, sin pensarlo mucho, respondió:", img: `${ALMEIDA}, swallowing nervously in the dark, half smiling, moonlight on his face`, mov: "acercar" },
    { id: "v4", texto: "«¡Hasta la vuelta, Señor!». Y saltó a la calle.", img: `silhouette of a ${ALMEIDA} jumping from a church window into a moonlit colonial street, habit flying, comic and dramatic`, mov: "derecha" },
    { id: "v5", texto: "Y no fue una sola noche. Dicen que la pregunta se repitió muchas veces… y la respuesta siempre fue la misma.", img: "a moonlit colonial church tower window seen from the street at night, a rope swinging, mist, mysterious", mov: "alejar" },
    // EL CORTEJO
    { id: "k1", texto: "Hasta que llegó la noche que le cambió la vida.", img: "a dark empty colonial Quito street at 3am, wet cobblestones, a single lantern, thick mist, ominous", mov: "acercar" },
    { id: "k2", texto: "Almeida volvía de madrugada, cansado y algo mareado, por una calle oscura cerca del convento.", img: `${ALMEIDA}, walking tipsy along a dark misty colonial street at night, holding the wall, lantern light`, mov: "derecha" },
    { id: "k3", texto: "De pronto escuchó pasos lentos y un canto en voz baja. Por la calle venía un cortejo fúnebre.", img: "a slow funeral procession of hooded figures in dark robes carrying candles and a coffin through a misty colonial street at night", mov: "acercar" },
    { id: "k4", texto: "Hombres encapuchados, con velas en las manos, cargaban un ataúd. Nadie hablaba. Nadie le miraba la cara.", img: "close view of hooded mourners in a night procession, faces hidden in shadow, candles glowing, coffin carried on shoulders, eerie", mov: "derecha" },
    { id: "k5", texto: "Almeida, curioso, se acercó a ver quién era el muerto. Levantó la vista hacia el ataúd abierto…", img: `${ALMEIDA}, slowly approaching an open wooden coffin carried by hooded figures at night, candlelight on his face, tension`, mov: "acercar" },
    { id: "k6", texto: "Y se vio a sí mismo. Pálido, con el hábito puesto, con las manos cruzadas sobre el pecho.", img: "an open colonial wooden coffin at night with a pale young friar lying inside in a brown habit, hands crossed, candles around, solemn and eerie, not gory", mov: "acercar" },
    { id: "k7", texto: "Cuentan que salió corriendo como nunca en su vida, y que esa noche no subió por la ventana: golpeó la puerta del convento hasta que le abrieron.", img: `${ALMEIDA}, running in terror through a misty colonial street at dawn toward a convent door, habit flying`, mov: "derecha" },
    // EL CAMBIO
    { id: "m1", texto: "Desde ese día, el Padre Almeida no volvió a escaparse.", img: `${ALMEIDA}, kneeling in prayer before a ${CRISTO} in a candlelit church, humble and repentant, warm light`, mov: "acercar" },
    { id: "m2", texto: "Dicen que se convirtió en uno de los frailes más dedicados de Quito: rezaba, ayunaba y ayudaba a los pobres de la ciudad.", img: "a kind Franciscan friar giving bread to poor families at the door of a colonial convent, morning light, compassionate", mov: "derecha" },
    { id: "m3", texto: "Y cuando alguien le preguntaba por sus noches de fiesta, dicen que solo sonreía y miraba hacia la torre.", img: `older ${ALMEIDA} with some grey hair smiling softly and looking up at a church tower at sunset`, mov: "subir" },
    { id: "m4", texto: "Algunos cuentan que el cortejo fue un aviso del cielo. Otros, que todo fue efecto de la chicha. Él nunca lo explicó.", img: "a single candle burning in a dark convent cell, a rosary on a wooden table, quiet and mysterious", mov: "acercar" },
    // HOY
    { id: "h1", texto: "Hoy, el convento de San Diego sigue en pie en Quito, y es uno de los lugares más tranquilos del centro histórico.", img: "the colonial San Diego Franciscan convent in Quito today, white facade and bell tower, blue sky, quiet plaza", mov: "alejar" },
    { id: "h2", texto: "Los guías todavía cuentan la leyenda frente a la estatua del Cristo, y muchos visitantes buscan la ventana por donde se escapaba.", img: "tourists listening to a guide in front of an old crucifix inside a colonial church, warm light, respectful", mov: "derecha" },
    { id: "h3", texto: "Y en Quito, cuando alguien sale de fiesta muy seguido, todavía le preguntan: «¿Hasta cuándo, Padre Almeida?».", img: "modern Quito historic center street at night with people walking and old church towers lit, festive atmosphere", mov: "alejar" },
    // CIERRE
    { id: "z1", texto: "Y tú, ¿qué le habrías respondido a la estatua? Déjamelo en los comentarios.", img: `${CRISTO} lit by a single candle in a dark choir, a high window with moonlight beside it`, mov: "acercar" },
    { id: "z2", texto: "Suscríbete, porque en el próximo relato bajamos a las calles de Quito a escuchar un sonido que nadie quiere oír de noche: la Caja Ronca.", img: "a dark colonial Quito street at midnight with a faint glow and shadows of a ghostly procession with a drum in the distance, mist", mov: "acercar" },
  ],
};

export const TITULO_CARTEL = { en: "g5", titulo: "EL PADRE ALMEIDA", sub: "¿Hasta cuándo?" };

export const CAPITULOS = {
  c1: "El convento",
  f1: "El fraile",
  e1: "Las escapadas",
  v1: "La voz en la torre",
  k1: "El cortejo",
  m1: "El cambio",
  h1: "San Diego hoy",
};

// Avances (viernes y sábado) + estreno domingo + reels (lunes y martes), 35-45 s, y PARTES solo para TikTok.
export const REELS = [
  { id: "reel1", gancho: "La estatua le habló… y él le respondió", escenas: ["g1", "g2", "v1", "v2", "v3", "v4"], cierre: "Este domingo, la historia completa" },
  { id: "reel2", gancho: "El fraile que se escapaba a las fiestas", escenas: ["f3", "e2", "e3", "e4", "e5"], cierre: "Este domingo, en el canal" },
  { id: "reel3", gancho: "Abrió el ataúd… y se vio a sí mismo", escenas: ["k1", "k3", "k4", "k5", "k6"], cierre: "La leyenda completa, en el canal" },
  { id: "reel4", gancho: "«¿Hasta cuándo, Padre Almeida?»", escenas: ["v1", "v2", "v3", "v4", "v5"], cierre: "Relato completo en el canal" },
  { id: "reel5", gancho: "Lo que pasó después del cortejo", escenas: ["k7", "m1", "m2", "m3", "m4"], cierre: "La historia completa, en el canal" },
  { id: "reel6", gancho: "La ventana todavía existe", escenas: ["h1", "h2", "h3", "z1"], cierre: "¿La has visto? Cuéntame en el canal" },
  { id: "parte1", tiktok: true, gancho: "Padre Almeida · Parte 1: el fraile", escenas: ["g1", "g2", "g3", "g4", "c1", "c2", "c3", "c4", "f1", "f2", "f3", "f4"], cierre: "Parte 2 en mi perfil · Sígueme" },
  { id: "parte2", tiktok: true, gancho: "Padre Almeida · Parte 2: la voz en la torre", escenas: ["e1", "e2", "e3", "e4", "e5", "v1", "v2", "v3", "v4", "v5"], cierre: "Parte 3 en mi perfil · Sígueme" },
  { id: "parte3", tiktok: true, gancho: "Padre Almeida · Parte 3: el cortejo", escenas: ["k1", "k2", "k3", "k4", "k5", "k6", "k7"], cierre: "Parte 4 en mi perfil · Sígueme" },
  { id: "parte4", tiktok: true, gancho: "Padre Almeida · Parte 4: el cambio", escenas: ["m1", "m2", "m3", "m4", "h1", "h2", "h3", "z1"], cierre: "Sígueme para el próximo relato" },
];

export const CLIPS_MAX = {};
