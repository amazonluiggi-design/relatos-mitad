// node animar.mjs <imagen> <salida.mp4> "<prompt>" [segundos]
import { Client } from "@gradio/client";
import fs from "node:fs";
const [, , img, sal, prompt, seg = "5"] = process.argv;
const t0 = Date.now();
const c = await Client.connect("zerogpu-aoti/wan2-2-fp8da-aoti-faster", process.env.HF_TOKEN ? { hf_token: process.env.HF_TOKEN } : {});
const blob = new Blob([fs.readFileSync(img)], { type: "image/jpeg" });
const r = await c.predict("/generate_video", { input_image: blob, prompt, steps: 6, duration_seconds: +seg, guidance_scale: 1, guidance_scale_2: 1, seed: 42, randomize_seed: true });
const v = r.data[0]; const url = v?.video?.url || v?.url;
const b = Buffer.from(await (await fetch(url)).arrayBuffer());
fs.writeFileSync(sal, b);
console.log("ok", sal, b.length, ((Date.now() - t0) / 1000).toFixed(0) + "s");
process.exit(0);
