// Relato 8: La Cueva de los Tayos y la biblioteca de oro (Morona Santiago). Misterio + oro.
// Datos verificables: los tayos (guácharos) y el pueblo shuar; Juan Moricz registró ante notario en Guayaquil
// (julio de 1969) el supuesto hallazgo de una "biblioteca metálica"; Erich von Däniken lo popularizó en "El oro de
// los dioses" (1972) y luego admitió no haberla visto; la colección de placas de metal del padre Carlos Crespi en
// Cuenca (piezas que no eran antiguas); expedición británico-ecuatoriana de 1976 dirigida por Stan Hall, con Neil
// Armstrong, que exploró la cueva y no encontró ninguna biblioteca. Se cuenta como misterio sin resolver.
// GRABAR LA VOZ DESPUÉS DEL 26-NOV (créditos de ElevenLabs).
const ESTILO =
  "cinematic film still from an epic mystery documentary, ultra realistic, Amazon rainforest and deep caves of Ecuador, lantern and headlamp light, deep shadows, volumetric light, film grain, dramatic composition, no text, no watermark";
const CUEVA = "enormous dark cave in the Ecuadorian Amazon with giant geometric-looking stone blocks and smooth walls, lit by headlamps";
const MORICZ = "Hungarian-Argentine explorer in his forties in 1969, slicked dark hair, mustache, khaki shirt, intense eyes";

export const HISTORIA = {
  id: "tayos",
  titulo: "La Cueva de los Tayos y la biblioteca de oro",
  voz: "Rl2JPHsuEWSfwCD4ZHIQ", // El Faraón
  estilo: ESTILO,
  escenas: [
    // GANCHO
    { id: "g1", texto: "En la selva de Ecuador hay un agujero en la tierra por el que solo se puede bajar colgado de una cuerda.", img: "a narrow vertical cave shaft opening in the dense Amazon rainforest floor, ropes hanging into darkness, mist", mov: "acercar" },
    { id: "g2", texto: "Abajo empieza una cueva inmensa, con pasillos que parecen tallados a mano y bloques de piedra con ángulos casi perfectos.", img: `${CUEVA}, explorers small in the frame`, mov: "derecha" },
    { id: "g3", texto: "Un hombre juró que ahí dentro encontró una biblioteca entera hecha de láminas de oro, escrita por una civilización perdida.", img: "a hidden chamber full of stacked thin golden metal plates engraved with unknown symbols, lantern light, mysterious", mov: "acercar" },
    { id: "g4", texto: "Y en 1976, uno de los astronautas más famosos de la historia bajó a esa cueva a comprobarlo: Neil Armstrong.", img: "a middle-aged American man in 1970s caving overalls and a simple yellow caving helmet with a headlamp, rappelling down a rope inside a huge cave, warm lamp light on his face, no space suit", mov: "abajo" },
    { id: "g5", texto: "Hoy te cuento el misterio de la Cueva de los Tayos. Y lo que realmente encontraron ahí abajo.", img: "entrance of a huge cave in the Ecuadorian Amazon at dusk, birds flying out, mist and green jungle", mov: "acercar" },
    // LA CUEVA
    { id: "c1", texto: "La cueva está en Morona Santiago, en la Amazonía ecuatoriana, en tierras del pueblo shuar.", img: "aerial view of the Amazon rainforest of Morona Santiago Ecuador with a winding river and mist over the trees", mov: "derecha" },
    { id: "c2", texto: "Su nombre viene de unos pájaros nocturnos que viven en la oscuridad total: los tayos. Se orientan por el eco de sus propios gritos.", img: "oilbirds tayos with glowing eyes flying in a pitch dark cave, wings spread, eerie", mov: "acercar" },
    { id: "c3", texto: "Para los shuar, la cueva era un lugar de respeto. Bajaban con antorchas para recoger a los polluelos, y sabían que no todo el mundo debía entrar.", img: "Shuar indigenous men with torches descending into a cave with vine ladders, respectful, firelight", mov: "izquierda" },
    // MORICZ
    { id: "m1", texto: "En los años sesenta llegó a la zona un explorador húngaro-argentino llamado Juan Moricz.", img: `${MORICZ}, walking through the Amazon jungle with a machete and a backpack`, mov: "derecha" },
    { id: "m2", texto: "Moricz estaba obsesionado con una idea: que una civilización antiquísima había dejado su conocimiento escondido bajo tierra.", img: `${MORICZ}, studying old maps and strange symbols by lamplight in a tent at night`, mov: "acercar" },
    { id: "m3", texto: "Y en julio de 1969, el mismo mes en que el hombre llegó a la Luna, Moricz fue a una notaría de Guayaquil y registró su descubrimiento.", img: "1969 notary office in Guayaquil, a man signing an official document at a wooden desk, old typewriter, ceiling fan", mov: "acercar" },
    { id: "m4", texto: "Decía haber encontrado túneles artificiales, salas enormes… y una biblioteca de miles de láminas de metal grabadas con símbolos.", img: "thousands of thin metal plates with engraved symbols stacked on stone shelves inside a cave, golden glow", mov: "izquierda" },
    // EL ORO DE LOS DIOSES
    { id: "d1", texto: "La historia dio la vuelta al mundo gracias a un escritor suizo, Erich von Däniken, famoso por sus teorías de antiguos astronautas.", img: "a 1970s European writer holding his book in front of a crowd of journalists with camera flashes", mov: "acercar" },
    { id: "d2", texto: "En su libro El oro de los dioses describió la cueva, sus túneles y la biblioteca. Vendió millones de ejemplares.", img: "stacks of a bestselling book in a 1970s bookstore window, golden cover, people looking", mov: "derecha" },
    { id: "d3", texto: "De pronto, todo el planeta quería saber qué había en una cueva perdida de la Amazonía ecuatoriana.", img: "1970s newspapers and magazines spread on a table with headlines about a lost golden library in Ecuador", mov: "acercar" },
    { id: "d4", texto: "Pero entonces empezaron las contradicciones. Moricz dijo que Von Däniken nunca había entrado con él a la cueva.", img: `${MORICZ}, angry, speaking to reporters with microphones, 1970s`, mov: "izquierda" },
    { id: "d5", texto: "Y con los años, el propio Von Däniken admitió que la biblioteca él no la había visto con sus propios ojos.", img: "an older writer in a dim room looking down thoughtfully, shadows, 1970s interview setting", mov: "acercar" },
    // EL PADRE CRESPI
    { id: "p1", texto: "Mientras tanto, en Cuenca, un sacerdote italiano llamado Carlos Crespi guardaba algo que parecía confirmar la leyenda.", img: "old Italian priest with a long white beard in a black cassock, standing in a cluttered colonial courtyard in Cuenca", mov: "acercar" },
    { id: "p2", texto: "Durante décadas, la gente le llevaba objetos de metal: placas grabadas, figuras extrañas, láminas con símbolos que nadie entendía.", img: "a dusty room filled with strange engraved metal plates, odd figurines and sheets with unknown symbols, priest examining them", mov: "derecha" },
    { id: "p3", texto: "Muchos creyeron que venían de la Cueva de los Tayos. Pero los expertos que las estudiaron vieron que la mayoría eran recientes: hechas de cobre y latón, no de oro antiguo.", img: "close-up of a copper metal plate with crude engraved figures under a magnifying glass, expert hands", mov: "acercar" },
    // LA EXPEDICIÓN
    { id: "x1", texto: "Para salir de dudas, un ingeniero escocés llamado Stan Hall organizó en 1976 una gran expedición británico-ecuatoriana.", img: "1970s expedition camp in the Amazon jungle with tents, soldiers and scientists, equipment crates, helicopter", mov: "derecha" },
    { id: "x2", texto: "Decenas de personas: científicos, espeleólogos, soldados ecuatorianos… y como presidente honorario, Neil Armstrong.", img: "group photo of 1970s explorers, scientists and Ecuadorian soldiers in the jungle, one man in a helmet in the center", mov: "acercar" },
    { id: "x3", texto: "El primer hombre en pisar la Luna descendió por la cuerda hasta la oscuridad de la cueva.", img: "a man in 1970s caving gear descending a long rope into a deep dark cave shaft, headlamp beam, tiny figure", mov: "abajo" },
    { id: "x4", texto: "Recorrieron galerías gigantescas, midieron, fotografiaron y estudiaron cada rincón durante semanas.", img: `${CUEVA}, scientists measuring walls and taking photographs with 1970s cameras`, mov: "izquierda" },
    { id: "x5", texto: "Encontraron animales y plantas, huellas de presencia humana antigua y formaciones de roca impresionantes.", img: "ancient clay pottery fragments and a stone tool on a cave floor, 1970s archaeologist gently brushing dirt, headlamp light", mov: "acercar" },
    { id: "x6", texto: "Pero la biblioteca de oro… no apareció por ninguna parte.", img: "empty dark cave chamber with explorers lowering their lamps, disappointment, silence", mov: "alejar" },
    // EL MISTERIO SIGUE
    { id: "s1", texto: "Para la ciencia, los bloques que parecen tallados son roca natural, cortada por el agua y la presión durante miles de años.", img: "smooth natural rock formations with straight edges inside a cave, water dripping, geologist touching the wall", mov: "derecha" },
    { id: "s2", texto: "Pero los creyentes tienen su respuesta: tal vez Moricz habló de otra entrada. Una que nunca quiso revelar.", img: "a hidden secondary cave entrance covered by vines and roots in the jungle, faint light inside, secret", mov: "acercar" },
    { id: "s3", texto: "Moricz murió en 1991. Y si de verdad sabía dónde estaba la biblioteca, se llevó el secreto a la tumba.", img: "a lonely grave with a simple cross in a small cemetery at dusk, mist, a single candle", mov: "acercar" },
    // CIERRE
    { id: "z1", texto: "Y tú, ¿crees que existe una biblioteca de oro bajo la selva de Ecuador? ¿O fue el engaño más famoso del siglo? Déjamelo en los comentarios.", img: "a single golden metal plate with engraved symbols glowing faintly in the darkness of a cave, mysterious", mov: "acercar" },
    { id: "z2", texto: "Suscríbete, porque los misterios de nuestra tierra todavía tienen mucho que contar.", img: "Amazon rainforest at golden dusk seen from a hill, a cave entrance glowing with warm lantern light among the trees, birds flying, mysterious and inviting", mov: "acercar" },
  ],
};

export const TITULO_CARTEL = { en: "g5", titulo: "LA CUEVA DE LOS TAYOS", sub: "La biblioteca de oro" };

export const CAPITULOS = {
  c1: "La cueva",
  m1: "Juan Moricz",
  d1: "El oro de los dioses",
  p1: "El padre Crespi",
  x1: "La expedición de 1976",
  s1: "El misterio sigue",
};

export const REELS = [
  { id: "reel1", gancho: "Dicen que bajo la selva de Ecuador hay una biblioteca de oro", escenas: ["g1", "g2", "g3", "g5"], cierre: "Este viernes, la historia completa" },
  { id: "reel2", gancho: "Neil Armstrong bajó a esta cueva de Ecuador", escenas: ["g4", "x1", "x2", "x3"], cierre: "Este viernes, en el canal" },
  { id: "reel3", gancho: "Registró ante notario una biblioteca perdida", escenas: ["m1", "m2", "m3", "m4"], cierre: "La historia completa, en el canal" },
  { id: "reel4", gancho: "El libro que hizo famosa la cueva… y la verdad", escenas: ["d2", "d3", "d4", "d5"], cierre: "Relato completo en el canal" },
  { id: "reel5", gancho: "Qué encontró la expedición de Neil Armstrong", escenas: ["x4", "x5", "x6", "s1"], cierre: "¿Lo sabías? Míralo en el canal" },
  { id: "reel6", gancho: "¿Existe otra entrada secreta?", escenas: ["s2", "s3", "z1"], cierre: "Tú, ¿qué crees? En el canal" },
  { id: "parte1", tiktok: true, gancho: "Cueva de los Tayos · Parte 1: la cueva", escenas: ["g1", "g2", "g3", "g4", "g5", "c1", "c2", "c3"], cierre: "Parte 2 en mi perfil · Sígueme" },
  { id: "parte2", tiktok: true, gancho: "Cueva de los Tayos · Parte 2: la biblioteca", escenas: ["m1", "m2", "m3", "m4", "d1", "d2", "d3"], cierre: "Parte 3 en mi perfil · Sígueme" },
  { id: "parte3", tiktok: true, gancho: "Cueva de los Tayos · Parte 3: las dudas", escenas: ["d4", "d5", "p1", "p2", "p3", "x1", "x2"], cierre: "Parte 4 en mi perfil · Sígueme" },
  { id: "parte4", tiktok: true, gancho: "Cueva de los Tayos · Parte 4: Armstrong", escenas: ["x3", "x4", "x5", "x6", "s1", "s2", "s3", "z1"], cierre: "Sígueme para el próximo relato" },
];

export const CLIPS_MAX = {};
