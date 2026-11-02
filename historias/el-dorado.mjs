// Relato 7: El Dorado, la laguna de oro (Guatavita, Colombia). Tema de oro/tesoro.
// Datos verificables: la ceremonia muisca del cacique cubierto de polvo de oro (crónica "El Carnero", Juan
// Rodríguez Freyle, 1636); intentos de desagüe en el siglo XVI (Antonio de Sepúlveda, hacia 1580, abrió un corte
// en el borde del cráter, bajó el nivel unos 20 m; derrumbe; parte del hallazgo enviado a Felipe II); la compañía
// inglesa de Hartley Knowles (Contractors Ltd.) la vació a inicios del siglo XX y el lodo se endureció; laguna
// protegida desde 1965; la Balsa Muisca (hallada en 1969 en Pasca) en el Museo del Oro de Bogotá; Walter Raleigh
// buscó El Dorado en la Guayana (1595 y 1617).
const ESTILO =
  "cinematic film still from an epic historical mystery documentary, ultra realistic, Andean highlands of Colombia, misty mountains, warm golden light, deep shadows, volumetric light, film grain, dramatic composition, no text, no watermark";
const CACIQUE = "young Muisca chief with long straight black hair, his whole body covered in shining gold dust, gold nose ornament and gold feather crown";
const LAGUNA = "perfectly round emerald green lake inside a forested volcanic-looking crater in the Andes, mist over the water";
const BALSA = "ceremonial reed raft decorated with torches and gold offerings floating on a misty mountain lake at dawn";

export const HISTORIA = {
  id: "el-dorado",
  titulo: "El Dorado: la laguna de oro",
  voz: "Rl2JPHsuEWSfwCD4ZHIQ", // El Faraón
  estilo: ESTILO,
  escenas: [
    // GANCHO
    { id: "g1", texto: "En lo alto de los Andes de Colombia hay una laguna perfectamente redonda, escondida dentro de un cráter.", img: `aerial view of a ${LAGUNA}, golden hour`, mov: "acercar" },
    { id: "g2", texto: "Durante siglos, miles de personas intentaron vaciarla. Algunos murieron en el intento.", img: "colonial workers digging a deep trench on the rim of a mountain crater with ropes and buckets, mud, desperation", mov: "derecha" },
    { id: "g3", texto: "Porque dicen que en el fondo de esa agua hay oro. Mucho oro. Siglos de ofrendas arrojadas por un pueblo entero.", img: "underwater view of many small shining gold figurines, gold jewelry and green emeralds scattered on the muddy bottom of a dark green lake, light rays from the surface, treasure clearly visible", mov: "acercar" },
    { id: "g4", texto: "Esta es la historia real detrás de la leyenda más famosa de América: El Dorado.", img: `${CACIQUE}, standing on a raft at dawn, arms open, glowing like the sun`, mov: "acercar" },
    // LOS MUISCAS
    { id: "m1", texto: "Antes de la llegada de los españoles, en estas montañas vivían los muiscas: agricultores, comerciantes y orfebres extraordinarios.", img: "Muisca village in the Andean highlands with round thatched huts, cultivated fields and mist, people working", mov: "derecha" },
    { id: "m2", texto: "Para ellos, el oro no era dinero. Era un material sagrado, el brillo del sol que se podía ofrecer a los dioses.", img: "Muisca goldsmith hands shaping a small gold figurine by firelight, molten gold, workshop", mov: "acercar" },
    { id: "m3", texto: "Y la laguna de Guatavita era uno de sus lugares más sagrados.", img: `${LAGUNA}, sacred atmosphere, sunrise light`, mov: "alejar" },
    // LA CEREMONIA
    { id: "c1", texto: "Un cronista del siglo diecisiete, Juan Rodríguez Freyle, contó lo que pasaba cuando un nuevo cacique tomaba el poder.", img: "17th century Spanish chronicler writing with a quill by candlelight in a colonial room, old manuscript", mov: "izquierda" },
    { id: "c2", texto: "Primero, el heredero pasaba días encerrado en una cueva, en ayuno. Luego lo llevaban hasta la orilla de la laguna.", img: "Muisca procession with torches walking down to the shore of a misty mountain lake at dawn", mov: "derecha" },
    { id: "c3", texto: "Lo desnudaban, lo untaban con una resina pegajosa… y lo cubrían de pies a cabeza con polvo de oro.", img: `priests blowing gold dust onto a man's body through tubes, ${CACIQUE}, shimmering particles in the air`, mov: "acercar" },
    { id: "c4", texto: "Subía a una balsa de juncos, con cuatro caciques más y montones de oro y esmeraldas a sus pies.", img: `${BALSA}, with the golden chief and four elders on board`, mov: "derecha" },
    { id: "c5", texto: "En el centro de la laguna, en silencio, arrojaban todo al agua. Y el cacique se sumergía hasta que el oro de su cuerpo se lavaba.", img: "golden man diving into a dark green lake, gold dust spreading in the water like a cloud, dramatic light", mov: "acercar" },
    { id: "c6", texto: "Desde la orilla, la gente tocaba flautas y tambores. El hombre dorado. En español: El Dorado.", img: "crowd of Muisca people on the shore of a lake playing flutes and drums with bonfires, celebration at dawn", mov: "alejar" },
    // LA FIEBRE
    { id: "f1", texto: "Cuando los españoles escucharon esa historia, ya no pudieron sacarla de su cabeza.", img: "Spanish conquistadors in armor listening intently around a campfire in the mountains, greedy eyes", mov: "acercar" },
    { id: "f2", texto: "Y con cada vez que se contaba, la leyenda crecía. Ya no era un hombre dorado: era una ciudad entera de oro.", img: "mythical golden city with shining towers in a misty jungle valley, fantasy vision, epic", mov: "acercar" },
    { id: "f3", texto: "Expediciones enteras se perdieron en selvas y montañas buscándola. El inglés Walter Raleigh la buscó dos veces en la Guayana… y terminó en el cadalso.", img: "exhausted expedition in old armor struggling through a dense jungle river, rain, despair", mov: "derecha" },
    // VACIAR LA LAGUNA
    { id: "v1", texto: "Pero había un lugar donde el oro sí existía: el fondo de Guatavita. Solo había que sacarle el agua.", img: `${LAGUNA}, seen from the rim, ominous clouds`, mov: "acercar" },
    { id: "v2", texto: "En 1545, los conquistadores pusieron a cientos de indígenas a sacar agua con calabazos, en cadena, durante meses.", img: "long human chain of indigenous workers passing gourds of water up a crater slope, colonial overseers, harsh labor", mov: "izquierda" },
    { id: "v3", texto: "El nivel bajó unos pocos metros. En la orilla aparecieron piezas de oro. Y la fiebre se volvió locura.", img: "gold pieces shining in the mud of a lake shore, hands reaching for them, excitement", mov: "acercar" },
    { id: "v4", texto: "Hacia 1580, un comerciante llamado Antonio de Sepúlveda fue más lejos: mandó abrir un corte enorme en el borde del cráter.", img: "colonial merchant in a dark cloak directing workers cutting a huge notch into the rim of a crater, ropes, scaffolding", mov: "derecha" },
    { id: "v5", texto: "El agua bajó unos veinte metros. Encontró oro y esmeraldas, y una parte se envió al rey de España.", img: "emerald and gold jewels in a muddy wooden box, colonial setting, candlelight", mov: "acercar" },
    { id: "v6", texto: "Pero las paredes del corte se derrumbaron sobre los trabajadores. Muchos murieron, y el proyecto se abandonó. El corte todavía se ve hoy.", img: "collapsed earth walls of a deep trench, dust and broken scaffolding, tragic, somber light", mov: "izquierda" },
    // EL ÚLTIMO INTENTO
    { id: "u1", texto: "Siglos después, una compañía inglesa lo intentó con máquinas. Abrió un túnel por debajo y, por fin, vació la laguna.", img: "early 20th century steam machinery and engineers next to a tunnel entrance in a mountain crater, black and white mood with warm light", mov: "derecha" },
    { id: "u2", texto: "Ahí estaba el fondo, a la vista. Pero era un lodo tan profundo que nadie podía caminar sobre él.", img: "empty crater lake bed of deep shiny mud, workers in hats standing at the edge unable to walk, frustration", mov: "alejar" },
    { id: "u3", texto: "Esperaron a que se secara. Y el sol lo endureció como cemento. Cuando volvieron, la laguna se había vuelto a llenar.", img: "cracked hard dried mud of a lake bed under the sun, a few gold objects stuck in it, irony", mov: "acercar" },
    { id: "u4", texto: "Sacaron algunas piezas y las vendieron en Londres. Ganaron mucho menos de lo que gastaron.", img: "early 1900s London auction room with a few gold artifacts on velvet, bidders in suits", mov: "izquierda" },
    { id: "u5", texto: "En 1965, Colombia prohibió para siempre buscar tesoros en Guatavita. Lo que quede en el fondo, ahí se quedará.", img: `${LAGUNA}, peaceful and protected, soft morning light, untouched`, mov: "alejar" },
    // LA BALSA
    { id: "b1", texto: "Pero la historia tuvo un final increíble. En 1969, en una cueva de Pasca, cerca de Bogotá, unos campesinos encontraron una pieza de oro.", img: "Colombian farmers discovering a small gold object inside a dark cave with a lantern, amazed faces, 1960s clothes", mov: "acercar" },
    { id: "b2", texto: "Era una balsa en miniatura, con un cacique en el centro rodeado de sus acompañantes. Exactamente como lo describía la crónica.", img: "the Muisca golden raft artifact: a small intricate gold raft with a central chief figure surrounded by smaller figures, museum lighting, black background", mov: "acercar" },
    { id: "b3", texto: "Hoy está en el Museo del Oro de Bogotá. Es la prueba de que el hombre dorado no era un invento.", img: "museum display case with a golden raft artifact glowing in a dark room, visitors silhouettes", mov: "alejar" },
    // CIERRE
    { id: "z1", texto: "Los españoles buscaron una ciudad de oro y nunca la encontraron. Tal vez porque El Dorado nunca fue un lugar: era una ceremonia.", img: `${CACIQUE}, standing on the raft in the center of the lake, sun rising behind him, epic`, mov: "acercar" },
    { id: "z2", texto: "Y tú, ¿crees que todavía queda oro en el fondo de Guatavita? Déjamelo en los comentarios, y suscríbete para el próximo relato.", img: "a single gold figurine resting on the dark bottom of a lake, light rays from above, mysterious", mov: "acercar" },
  ],
};

export const TITULO_CARTEL = { en: "g4", titulo: "EL DORADO", sub: "La laguna de oro" };

export const CAPITULOS = {
  m1: "Los muiscas",
  c1: "La ceremonia",
  f1: "La fiebre del oro",
  v1: "Vaciar la laguna",
  u1: "El último intento",
  b1: "La balsa de oro",
};

export const REELS = [
  { id: "reel1", gancho: "Esta laguna esconde siglos de oro en el fondo", escenas: ["g1", "g2", "g3", "g4"], cierre: "Este viernes, la historia completa" },
  { id: "reel2", gancho: "Cubrían a su rey con polvo de oro", escenas: ["c3", "c4", "c5", "c6"], cierre: "Este viernes, en el canal" },
  { id: "reel3", gancho: "Intentaron vaciar la laguna para sacar el oro", escenas: ["v2", "v3", "v4", "v5", "v6"], cierre: "La historia completa, en el canal" },
  { id: "reel4", gancho: "La vaciaron… y el lodo se volvió cemento", escenas: ["u1", "u2", "u3", "u4"], cierre: "Relato completo en el canal" },
  { id: "reel5", gancho: "Encontraron la prueba de El Dorado en una cueva", escenas: ["b1", "b2", "b3"], cierre: "¿Lo sabías? Míralo en el canal" },
  { id: "reel6", gancho: "El Dorado nunca fue una ciudad", escenas: ["f2", "f3", "z1"], cierre: "Tú, ¿qué crees? En el canal" },
  { id: "parte1", tiktok: true, gancho: "El Dorado · Parte 1: el hombre dorado", escenas: ["g1", "g2", "g3", "g4", "m1", "m2", "m3", "c1", "c2", "c3"], cierre: "Parte 2 en mi perfil · Sígueme" },
  { id: "parte2", tiktok: true, gancho: "El Dorado · Parte 2: la fiebre del oro", escenas: ["c4", "c5", "c6", "f1", "f2", "f3", "v1", "v2"], cierre: "Parte 3 en mi perfil · Sígueme" },
  { id: "parte3", tiktok: true, gancho: "El Dorado · Parte 3: vaciar la laguna", escenas: ["v3", "v4", "v5", "v6", "u1", "u2", "u3"], cierre: "Parte 4 en mi perfil · Sígueme" },
  { id: "parte4", tiktok: true, gancho: "El Dorado · Parte 4: la prueba", escenas: ["u4", "u5", "b1", "b2", "b3", "z1", "z2"], cierre: "Sígueme para el próximo relato" },
];

export const CLIPS_MAX = {};
