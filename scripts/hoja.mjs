import sharp from "sharp";
const [h, sal, ...ids] = process.argv.slice(2);
const W = 448, Hh = 256, cols = 4;
const tiles = await Promise.all(ids.map(async (id, i) => ({ input: await sharp(`public/${h}/h/${id}.jpg`).resize(W, Hh).jpeg().toBuffer(), left: (i % cols) * W, top: Math.floor(i / cols) * Hh })));
await sharp({ create: { width: W * cols, height: Hh * Math.ceil(ids.length / cols), channels: 3, background: "#000" } }).composite(tiles).jpeg().toFile(sal);
console.log(ids.join(" "));
