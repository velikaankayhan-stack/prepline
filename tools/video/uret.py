# Scorepath - video seslerini uretir. Her parca ayri okunur, sonra zip olusturulur.
# Kullanim: python uret.py [--tr emel|speak] [--en ava|andrew] [--out klasor] [id ...]
#   --tr emel  : Turkce parcalari tr-TR-EmelNeural okur (varsayilan; ana dili Turkce)
#   --tr speak : Turkce parcalari da Ingilizce ses okur, SSML dili tr-TR yapilir
#   --en       : Ingilizce parcalarin sesi (ava = AvaMultilingual, andrew = AndrewMultilingual)
# Not: tr-TR-AhmetNeural su an ses dondurmuyor; <lang> etiketi de servis tarafindan reddediliyor.
import argparse, asyncio, json, os, zipfile
import edge_tts
import edge_tts.communicate as ecom

VOICE_EN = {"ava": "en-US-AvaMultilingualNeural", "andrew": "en-US-AndrewMultilingualNeural"}
VOICE_TR = "tr-TR-EmelNeural"
RATE = "+0%"   # hizlandirma yok; tempo prep.py'de ayarlanir
LOCALE = {"tr": "tr-TR", "en": "en-US"}
HERE = os.path.dirname(os.path.abspath(__file__))

# edge-tts SSML'i her zaman xml:lang='en-US' ile kurar. Multilingual ses dili kendisi tahmin eder ve
# kisa Turkce parcalari ("ise", "denir ve", "Kisaca:") Ingilizce sanip Ingilizce aksanla okur.
# --tr speak modunda her parcanin dilini SSML'e yaziyoruz.
_orig_mkssml = ecom.mkssml
_lang = {"v": None}

def _mkssml(tc, escaped_text):
    s = _orig_mkssml(tc, escaped_text)
    loc = _lang["v"]
    if not loc:
        return s
    return s.replace("xml:lang='en-US'", "xml:lang='%s'" % loc, 1)

ecom.mkssml = _mkssml

async def one(text, voice, loc, path_mp3, path_json):
    _lang["v"] = loc
    try:
        com = edge_tts.Communicate(text, voice, rate=RATE, boundary="WordBoundary")
    except TypeError:
        com = edge_tts.Communicate(text, voice, rate=RATE)
    words = []
    with open(path_mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] in ("WordBoundary", "SentenceBoundary"):
                words.append({"o": ch["offset"] / 1e4, "d": ch["duration"] / 1e4, "t": ch["text"], "k": ch["type"]})
    if os.path.getsize(path_mp3) == 0:
        raise RuntimeError("bos ses dosyasi")
    with open(path_json, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)

async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tr", choices=["emel", "speak"], default="emel")
    ap.add_argument("--en", choices=["ava", "andrew"], default="ava")
    ap.add_argument("--out", default="ses_v2")
    ap.add_argument("ids", nargs="*")
    a = ap.parse_args()
    out = os.path.join(HERE, a.out)
    jobs = json.load(open(os.path.join(HERE, "isler.json"), encoding="utf-8"))
    if a.ids:
        jobs = [j for j in jobs if j["id"] in a.ids or j["id"][:2] in a.ids]
    total = sum(len(j["seg"]) for j in jobs); n = 0; bad = 0
    for j in jobs:
        d = os.path.join(out, j["id"]); os.makedirs(d, exist_ok=True)
        for i, s in enumerate(j["seg"]):
            n += 1
            mp3 = os.path.join(d, "%02d.mp3" % i); js = os.path.join(d, "%02d.json" % i)
            if os.path.exists(mp3) and os.path.getsize(mp3) > 0 and os.path.exists(js):
                continue
            tr = s["l"] == "tr"
            voice = VOICE_TR if (tr and a.tr == "emel") else VOICE_EN[a.en]
            loc = LOCALE[s["l"]] if a.tr == "speak" else None
            for attempt in range(3):
                try:
                    await one(s["t"], voice, loc, mp3, js); break
                except Exception as e:
                    print("  tekrar deneniyor:", e)
                    await asyncio.sleep(2)
            else:
                bad += 1; print("  HATA:", j["id"], i, s["t"])
            print("[%d/%d] %s %02d" % (n, total, j["id"], i))
    z = os.path.join(HERE, a.out + ".zip")
    with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(out):
            for fn in files:
                p = os.path.join(root, fn); zf.write(p, os.path.relpath(p, out))
    print("Bitti:", z, "(%d hata)" % bad if bad else "")

asyncio.run(main())
