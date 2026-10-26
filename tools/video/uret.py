# Scorepath - video seslerini uretir (Andrew Multilingual). Her parca ayri okunur, sonra ses_paketi.zip olusturulur.
import asyncio, json, os, zipfile
import edge_tts

VOICE = "en-US-AndrewMultilingualNeural"
RATE = "+8%"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "ses")

async def one(text, path_mp3, path_json):
    try:
        com = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    except TypeError:
        com = edge_tts.Communicate(text, VOICE, rate=RATE)
    words = []
    with open(path_mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] in ("WordBoundary", "SentenceBoundary"):
                words.append({"o": ch["offset"] / 1e4, "d": ch["duration"] / 1e4, "t": ch["text"], "k": ch["type"]})
    with open(path_json, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)

async def main():
    jobs = json.load(open(os.path.join(HERE, "isler.json"), encoding="utf-8"))
    total = sum(len(j["seg"]) for j in jobs); n = 0
    for j in jobs:
        d = os.path.join(OUT, j["id"]); os.makedirs(d, exist_ok=True)
        for i, s in enumerate(j["seg"]):
            n += 1
            mp3 = os.path.join(d, "%02d.mp3" % i); js = os.path.join(d, "%02d.json" % i)
            if os.path.exists(mp3) and os.path.getsize(mp3) > 0 and os.path.exists(js):
                continue
            for attempt in range(3):
                try:
                    await one(s["t"], mp3, js); break
                except Exception as e:
                    print("  tekrar deneniyor:", e)
                    await asyncio.sleep(2)
            print("[%d/%d] %s %02d" % (n, total, j["id"], i))
    z = os.path.join(HERE, "ses_paketi.zip")
    with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(OUT):
            for fn in files:
                p = os.path.join(root, fn); zf.write(p, os.path.relpath(p, HERE))
    print("Bitti:", z)

asyncio.run(main())
