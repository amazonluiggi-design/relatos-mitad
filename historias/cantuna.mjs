// Relato 1: Cantuña. Cada escena = una frase de voz + una imagen.
// "img" es el prompt (inglés) para Lucid Origin; "mov" el movimiento de cámara.
const ESTILO =
  "cinematic film still from an epic historical documentary, ultra realistic, 16th century colonial Quito Ecuador, warm golden candlelight and cool moonlight, volumetric fog, rich teal and gold color grade, 35mm film grain, high detail, no text, no gore";

export const HISTORIA = {
  id: "cantuna",
  titulo: "Cantuña: el hombre que engañó al diablo en Quito",
  voz: "Rl2JPHsuEWSfwCD4ZHIQ", // El Faraón (biblioteca ElevenLabs, plan Starter)
  estilo: ESTILO,
  escenas: [
    // GANCHO
    { id: "g1", texto: "En el corazón de Quito hay una iglesia a la que le falta una piedra.", img: "close-up of an ancient stone wall of a colonial church atrium at night with one single stone missing, a dark empty gap, candlelight", mov: "acercar" },
    { id: "g2", texto: "Una sola. Y dicen que esa piedra que falta salvó el alma de un hombre.", img: "an indigenous Andean man in a poncho seen from behind looking at a huge unfinished stone atrium under the moon", mov: "subir" },
    { id: "g3", texto: "Porque ese hombre hizo un pacto con el diablo… y le ganó.", img: "silhouette of a tall elegant figure in a long black cloak and hat standing in fog at the end of a candlelit colonial plaza, an Andean man facing it, mysterious, no monster", mov: "acercar" },
    { id: "g4", texto: "Esta es la leyenda de Cantuña. Y lo más extraño es que Cantuña sí existió.", img: "old colonial manuscript on a wooden table lit by a candle, quill and ink, dust in the light", mov: "derecha" },
    { id: "g5", texto: "Pero para entender su historia, primero hay que entender el oro. Mucho oro. Un tesoro que, según dicen, sigue escondido en algún lugar de los Andes.", img: "glimmer of ancient Inca gold treasure half buried in a dark mountain cave, a single ray of light, dust", mov: "acercar" },
    // ANTES: EL ORO DE ATAHUALPA
    { id: "a1", texto: "Año mil quinientos treinta y dos. El emperador inca Atahualpa es capturado por los españoles en Cajamarca.", img: "Inca emperor Atahualpa in golden regalia surrounded by Spanish conquistadors with armor and halberds, tense standoff, torchlight, epic historical painting realism", mov: "acercar" },
    { id: "a2", texto: "Para salvar su vida, promete algo que nadie había visto jamás: llenar una habitación entera de oro, y dos de plata.", img: "a stone Inca room being filled with golden objects, vases, idols and plates, piled up high, warm golden glow", mov: "subir" },
    { id: "a3", texto: "Desde todo el imperio empiezan a llegar caravanas cargadas de tesoros. Pero los españoles no cumplen su palabra. Atahualpa es ejecutado.", img: "long caravan of llamas and Inca porters carrying golden treasures along a mountain trail in the Andes, dramatic clouds", mov: "derecha" },
    { id: "a4", texto: "Y una de esas caravanas, la que venía del norte, nunca llegó a su destino.", img: "empty mountain trail in the Andes at dusk, fog rolling in, a few llama footprints in the mud, mysterious", mov: "alejar" },
    { id: "a5", texto: "Al frente estaba Rumiñahui, el general más leal de Atahualpa. Cuando supo que su emperador había muerto, escondió el oro en las montañas.", img: "fierce Inca general Rumiñahui, brown skin, large golden ear spools, woven Inca tunic with geometric tocapu patterns, simple woven headband, holding a bronze star-headed mace, standing on an Andean mountain ridge at dusk looking at the horizon, wind, epic", mov: "acercar" },
    { id: "a6", texto: "Y antes de que llegaran los conquistadores, mandó a quemar la antigua Quito, para que no encontraran nada.", img: "an ancient Andean city burning at night, flames and smoke rising toward a volcano, silhouettes of people fleeing, epic wide shot", mov: "alejar" },
    { id: "a7", texto: "Cuenta la tradición que entre los pocos que conocían el escondite estaba un hombre llamado Hualca. Y que Hualca tenía un hijo.", img: "an older Andean man whispering a secret to a young boy by a fire inside a stone hut, faces lit by embers", mov: "acercar" },
    { id: "a8", texto: "Ese niño se llamaba Cantuña.", img: "close-up portrait of an Andean boy with intense dark eyes looking at fire, smoke, warm light", mov: "acercar" },
    // CONTEXTO
    { id: "c1", texto: "Pasan los años. Sobre las cenizas, los españoles fundan San Francisco de Quito, y empiezan a levantar iglesias por todas partes.", img: "wide aerial view of a small 1500s colonial town being built in an Andean valley, volcano Pichincha behind, adobe houses and construction scaffolds, dawn", mov: "alejar" },
    { id: "c2", texto: "Los frailes franciscanos quieren levantar el templo más grande de la ciudad, y para eso necesitan miles de piedras, y miles de manos.", img: "Franciscan friars in brown robes supervising indigenous workers carrying heavy stones up wooden ramps, massive church foundations", mov: "derecha" },
    { id: "c3", texto: "Entre los constructores hay un indígena que todos conocen por su habilidad con la piedra. Es aquel niño, ya convertido en hombre: Cantuña.", img: "chest-up portrait of a strong indigenous Quechua man in his thirties with brown skin, high cheekbones and long straight black hair, woven Andean poncho, stone dust on his face, determined look, warm torchlight, colonial construction site behind", mov: "acercar" },
    { id: "c4", texto: "Y los frailes le encargan algo casi imposible: terminar el gran atrio de la iglesia en un plazo muy corto.", img: "a friar handing a rolled parchment contract to an Andean mason in front of an unfinished stone plaza, overcast sky", mov: "izquierda" },
    { id: "c5", texto: "Si no lo termina a tiempo, no le pagarán… y, según algunas versiones, terminará en la cárcel.", img: "dark colonial jail cell with iron bars, a single beam of light, chains on the stone floor", mov: "acercar" },
    // TENSIÓN
    { id: "t1", texto: "Cantuña trabaja de día y de noche. Pero las semanas pasan, y la obra apenas avanza.", img: "exhausted indigenous Quechua man with brown skin, high cheekbones and long straight black hair (a mason) working alone at night by torchlight, chiseling a large stone block, sweat, sparks", mov: "derecha" },
    { id: "t1b", texto: "Cada piedra hay que bajarla de las canteras del Pichincha, tallarla a mano, y subirla con cuerdas. Una sola puede tardar días.", img: "Andean workers pulling a huge stone block with ropes down a steep mountain slope near a volcano, mist, epic", mov: "derecha" },
    { id: "t2", texto: "Faltan piedras, faltan hombres, y el tiempo se acaba.", img: "an hourglass with sand almost run out on a stone ledge, unfinished church atrium blurred behind, moonlight", mov: "acercar" },
    { id: "t2b", texto: "Los frailes empiezan a mirarlo con desconfianza. En la ciudad ya se comenta que el indio Cantuña no va a cumplir.", img: "two Franciscan friars whispering in a candlelit cloister, glancing suspiciously, arches and shadows", mov: "izquierda" },
    { id: "t3", texto: "La última noche, Cantuña se sienta frente al atrio sin terminar. Sabe que al amanecer lo perderá todo.", img: "lonely Andean man sitting on a stone with head in his hands in front of a half built church atrium, full moon, fog", mov: "alejar" },
    { id: "t4", texto: "Y entonces, en medio del silencio, escucha unos pasos detrás de él.", img: "cobblestone street in colonial Quito at midnight, fog, a long dark shadow of a tall figure stretching across the ground", mov: "acercar" },
    // EL PACTO
    { id: "p1", texto: "Un hombre alto, vestido de negro, con una voz que parece salir de todas partes a la vez.", img: "tall elegant man in a black 16th century cloak and wide hat standing in fog under a street lantern, face hidden in shadow, mysterious and calm", mov: "subir" },
    { id: "p2", texto: "«Sé lo que necesitas», le dice. «Puedo terminar tu atrio esta misma noche, antes de que cante el gallo».", img: "close-up of a faint enigmatic smile half hidden in shadow under a black wide brimmed hat, candlelight", mov: "acercar" },
    { id: "p3", texto: "Cantuña entiende enseguida con quién está hablando. Y entiende también el precio.", img: "close-up of the frightened face of an indigenous Quechua man with brown skin, high cheekbones and long straight black hair, eyes wide, fire reflected in his pupils", mov: "acercar" },
    { id: "p4", texto: "«A cambio», dice el diablo, «me darás tu alma».", img: "a gloved hand in a black velvet sleeve reaching out of the shadows offering a handshake, golden candlelight, mysterious", mov: "acercar" },
    { id: "p5", texto: "Cantuña lo piensa. Mira la obra. Piensa en la cárcel, en su familia, en su nombre.", img: "Andean man standing between the unfinished stone church and a dark figure, split lighting, half warm half cold, fog", mov: "izquierda" },
    { id: "p6", texto: "Y acepta. Pero pone una condición: si al amanecer falta una sola piedra, el trato se rompe… y su alma seguirá siendo suya.", img: "two hands shaking in candlelight, one rough indigenous hand and one in a black leather glove, golden embers floating", mov: "acercar" },
    { id: "p7", texto: "El diablo sonríe. Una piedra. ¿Qué es una piedra para él? Acepta sin dudar.", img: "silhouette of a cloaked figure standing on a colonial rooftop under the full moon above Quito, church domes, mysterious", mov: "alejar" },
    // LA NOCHE
    { id: "n1", texto: "Lo que pasó esa noche, nadie en Quito lo pudo ver. Pero muchos dicen que lo escucharon.", img: "colonial Quito houses at night with shuttered windows, frightened face peeking through a crack of a wooden window", mov: "derecha" },
    { id: "n2", texto: "Golpes de piedra contra piedra. Martillos. Gritos que no eran humanos.", img: "hundreds of shadowy silhouettes carrying huge stone blocks through fog and golden torchlight, building a church atrium at night, epic", mov: "derecha" },
    { id: "n3", texto: "Cientos de figuras oscuras cargaban bloques que ningún hombre podría levantar.", img: "silhouettes of workers made of shadow lifting an enormous carved stone block with ease, embers, fog, dramatic low angle, epic", mov: "subir" },
    { id: "n4", texto: "El atrio crecía con una velocidad imposible. Arcos, escalinatas, muros… todo aparecía en la oscuridad.", img: "a grand stone church atrium with arches and staircase rising out of the darkness surrounded by glowing golden fog, epic", mov: "alejar" },
    { id: "n5", texto: "Y Cantuña, escondido, miraba cómo su alma se le escapaba piedra por piedra.", img: "indigenous Quechua man with brown skin, high cheekbones and long straight black hair hiding behind a stone column watching a supernatural construction, his face lit by golden firelight, amazed and afraid", mov: "acercar" },
    { id: "n6", texto: "En un momento, una de esas sombras pasó tan cerca de él que sintió el calor del fuego en la cara. Contuvo la respiración. Porque esa noche, Cantuña tenía algo que esconder.", img: "extreme close-up of an indigenous Quechua man with brown skin, high cheekbones and long straight black hair holding his breath in the dark, a passing shadow and golden embers reflected on his sweating face", mov: "acercar" },
    { id: "n7", texto: "Las horas pasaban. Y en el horizonte, sobre el Pichincha, el cielo empezaba a ponerse azul.", img: "the silhouette of Pichincha volcano with the first deep blue light before dawn, colonial rooftops and fog below", mov: "subir" },
    // GIRO
    { id: "x1", texto: "Poco antes del amanecer, el diablo coloca la última piedra y se vuelve hacia Cantuña, triunfante.", img: "cloaked figure seen from behind in front of a completed majestic church atrium, first blue light of dawn, epic wide shot", mov: "acercar" },
    { id: "x2", texto: "«Está terminado. Tu alma es mía».", img: "close-up of a shadowed face under a black hat, only a glint of light in the eyes, darkness", mov: "acercar" },
    { id: "x3", texto: "Pero Cantuña, tranquilo, le pide que cuente las piedras.", img: "calm indigenous Quechua man with brown skin, high cheekbones and long straight black hair, wearing a woven poncho, no hat, pointing at the stone atrium, faint smile, dawn light on his face", mov: "derecha" },
    { id: "x4", texto: "El diablo revisa el muro… y ahí está. Un hueco. Falta una piedra.", img: "close-up of a single empty gap in a perfect stone wall, first sunlight hitting it, dust in the air", mov: "acercar" },
    { id: "x5", texto: "Porque esa noche, mientras los demonios trabajaban, Cantuña había escondido una de las piedras.", img: "hands of an Andean man hiding a carved stone block under a poncho in the shadows at night, red light behind", mov: "izquierda" },
    { id: "x6", texto: "El gallo canta. Amanece sobre Quito. Y el trato se rompe.", img: "a rooster crowing on a colonial rooftop at sunrise, Quito church domes and volcano behind, golden light", mov: "alejar" },
    { id: "x7", texto: "Furioso, el diablo desaparece entre el humo, y Cantuña se queda con su atrio terminado, y con su alma.", img: "a cloaked figure dissolving into smoke and golden embers at sunrise in front of a church, an Andean man standing victorious", mov: "alejar" },
    { id: "m1", texto: "Si llegaste hasta aquí, ya eres parte de Relatos de la Mitad. Suscríbete, porque lo que viene ahora cambia toda la historia.", img: "an old brass lantern glowing on a stone line at night under a full moon, fog, mysterious and elegant", mov: "acercar" },
    // LO REAL
    { id: "r1", texto: "Hasta aquí la leyenda. Pero ahora viene lo que casi nadie te cuenta.", img: "the facade of the San Francisco church in Quito at blue hour, grand stone atrium and staircase, real architecture, modern day photo", mov: "subir" },
    { id: "r2", texto: "Cantuña no es un personaje inventado. En los registros de la época aparece un indígena llamado Francisco Cantuña.", img: "aged colonial parchment document with Spanish handwriting and a wax seal, magnifying glass, candlelight", mov: "derecha" },
    { id: "r3", texto: "Y fue tan rico, que pudo pagar la construcción de una capilla junto al convento de San Francisco. Una capilla que hasta hoy lleva su nombre.", img: "interior of an ornate baroque colonial chapel with gold leaf altar, candles, soft light through a window, Quito", mov: "alejar" },
    { id: "r4", texto: "La pregunta es: ¿de dónde sacó tanto dinero un indígena en plena colonia?", img: "pile of ancient Inca gold objects and coins glowing in the darkness of a cave", mov: "acercar" },
    { id: "r5", texto: "¿Recuerdas a Hualca, el hombre que conocía el escondite del oro de Rumiñahui? Aquí es donde todo encaja.", img: "the old Andean man and the boy by the fire again, now seen from far away, small figures in a dark stone hut, nostalgic", mov: "alejar" },
    { id: "r5b", texto: "Otra versión de la historia cuenta que Cantuña, ya adulto, aparecía de pronto con piezas de oro que nadie sabía de dónde venían.", img: "an indigenous Quechua man with brown skin, high cheekbones and long straight black hair in a poncho secretly placing a small gold Inca figurine on a wooden table in a dim colonial room, a Spanish merchant staring amazed", mov: "acercar" },
    { id: "r5c", texto: "Las autoridades sospecharon. Lo interrogaron. Y para no revelar el secreto de su padre, Cantuña habría dado una sola explicación: «Tengo un pacto con el diablo».", img: "colonial interrogation room, Spanish officials in black at a table, an indigenous Quechua man with brown skin, high cheekbones and long straight black hair in a poncho standing calm in candlelight, tense", mov: "derecha" },
    { id: "r6", texto: "Una mentira perfecta. Porque en esa época, nadie se atrevía a meterse con un hombre que tenía tratos con el demonio.", img: "Spanish colonial officials whispering in a dark candlelit room, suspicious looks, one pointing at a window", mov: "derecha" },
    // HOY
    { id: "r7", texto: "Así que tal vez no hubo demonio, ni noche de fuego. Tal vez solo hubo un hombre muy inteligente, guardando el último tesoro de su pueblo.", img: "Andean man standing alone on a mountain ridge at sunrise looking at the distant city of Quito, poncho in the wind, epic and noble", mov: "alejar" },
    { id: "r8", texto: "Y si eso es verdad… el oro de Rumiñahui sigue escondido. Nadie lo ha encontrado. Hasta hoy.", img: "mysterious dark mountain lake in the Andes with fog, a faint golden glow under the water, moonlight", mov: "acercar" },
    { id: "h1", texto: "Hoy, quienes visitan el atrio de San Francisco todavía buscan la piedra que falta.", img: "tourists walking on the large stone atrium of San Francisco church in Quito at golden hour, pigeons, mountains", mov: "alejar" },
    { id: "h2", texto: "Y algunos guías te dirán, en voz baja, que si la encuentras… mejor no la toques.", img: "close-up of a hand about to touch an old stone wall with a gap, shallow depth of field, mysterious light", mov: "acercar" },
    { id: "h3", texto: "La capilla de Cantuña sigue en pie, dentro del convento de San Francisco, en pleno centro histórico de Quito. Si algún día vas, entra en silencio. Y al salir, mira bien las piedras del atrio.", img: "the historic center of Quito at night, San Francisco church and plaza illuminated in warm light, old lanterns, fog, real architecture", mov: "alejar" },
    // CIERRE
    { id: "f1", texto: "¿Tú qué crees? ¿Cantuña engañó al diablo… o engañó a toda una ciudad? Déjamelo en los comentarios.", img: "silhouette of an Andean man walking away into fog at dawn on a cobblestone street, church towers behind", mov: "alejar" },
    { id: "f2", texto: "Y si te gustó este relato, suscríbete. En el próximo te cuento la historia de un tesoro inca que nadie ha podido encontrar en los Llanganates.", img: "misty Andean mountains of Llanganates with a hidden cave entrance glowing with gold light, dramatic clouds", mov: "acercar" },
  ],
};

// Reels: escenas elegidas (no hace falta que sean seguidas), con gancho escrito y final abierto.
export const REELS = [
  { id: "reel1", gancho: "A esta iglesia de Quito le falta UNA piedra", escenas: ["g1", "g2", "g3", "g4", "t3", "t4", "p1", "p2", "p4", "p6"], cierre: "¿Qué pasó al amanecer? Relato completo en el canal" },
  { id: "reel2", gancho: "Hizo un pacto con el diablo… y le ganó", escenas: ["p6", "p7", "n2", "n3", "n5", "x1", "x2", "x3", "x4"], cierre: "¿Cómo lo engañó? El final, en el canal" },
  { id: "reel3", gancho: "El oro de Atahualpa nunca llegó", escenas: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"], cierre: "La historia de ese niño, completa en el canal" },
  { id: "reel4", gancho: "La verdad que nadie te cuenta de Cantuña", escenas: ["r1", "r2", "r3", "r4", "r5b", "r5c", "r6", "r8"], cierre: "Mira el relato completo en el canal" },
  // Reels cortos de "un dato" (25-40 s), para publicar más seguido.
  { id: "reel5", gancho: "La noche que los demonios construyeron una iglesia", escenas: ["n1", "n2", "n3", "n4", "n5"], cierre: "La leyenda completa, en el canal" },
  { id: "reel6", gancho: "Cantuña sí existió… y era millonario", escenas: ["r2", "r3", "r4", "r5b"], cierre: "¿De dónde salió su oro? En el canal" },
  { id: "reel7", gancho: "La mentira perfecta de Cantuña", escenas: ["r5c", "r6", "r7", "r8"], cierre: "La historia completa, en el canal" },
  { id: "reel8", gancho: "¿Ya buscaste la piedra que falta?", escenas: ["h1", "h2", "h3"], cierre: "La leyenda completa, en el canal" },
];

export const TITULO_CARTEL = { en: "g5", titulo: "CANTUÑA", sub: "El hombre que engañó al diablo" };

export const CAPITULOS = {
  a1: "El oro perdido de Atahualpa",
  c1: "El atrio imposible",
  p1: "El pacto",
  n1: "La noche de las sombras",
  x1: "La piedra que falta",
  r1: "Lo que nadie te cuenta",
  h1: "Cantuña hoy",
};
