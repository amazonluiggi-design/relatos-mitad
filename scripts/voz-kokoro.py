# Voz de respaldo gratis (Kokoro v1.0, en español) cuando ElevenLabs no tiene letras. La llama scripts/voz.mjs.
# python scripts/voz-kokoro.py <voz> <pedido.json>   pedido: [{"texto": "...", "salida": "public/<h>/voz/k-<id>.wav"}]
# Modelo en ./kokoro/ (kokoro-v1.0.int8.onnx y voices-v1.0.bin, de github.com/thewh1teagle/kokoro-onnx/releases model-files-v1.0).
import json, sys
import soundfile as sf
from kokoro_onnx import Kokoro

voz, pedido = sys.argv[1], json.load(open(sys.argv[2], encoding="utf-8"))
k = Kokoro("kokoro/kokoro-v1.0.int8.onnx", "kokoro/voices-v1.0.bin")
for p in pedido:
    audio, sr = k.create(p["texto"], voice=voz, speed=0.95, lang="es")
    sf.write(p["salida"], audio, sr)
    print(json.dumps({"salida": p["salida"], "segundos": round(len(audio) / sr, 3)}), flush=True)
