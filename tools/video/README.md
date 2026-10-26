# Video engine (Instagram/TikTok grammar Reels)

1. **Script:** `senaryo_en.py` writes `isler_en.json`: English narration (spoken) with a Turkish caption per sentence. Turkish narration was dropped: edge-tts Turkish voices sound artificial and the multilingual voice reads Turkish with an English accent.
2. **Voice (on a Windows PC with internet):** put `uret.py`, `isler_en.json`, `video_sesleri.bat` in a folder and double-click the .bat. It uses edge-tts with `en-US-AndrewMultilingualNeural` at natural speed, one sentence per request ("S.A.T." is spelled out, shown as "SAT"). Output: `ses_en.zip`.
3. **Timeline + audio mix:** `python3 prep.py <unzipped ses folder> <out_dir> [id...]` — trims leading/trailing silence, caps inner pauses at 0.35 s, no speed-up, clear pauses between sentences and steps; captions show the English words karaoke-style with the Turkish line below; sound effects, 3-2-1 think pause.
4. **Render:** `node render.js <out_dir>` — Playwright renders `frame.html` at 1080x1920, 30 fps, piped to ffmpeg → `<out_dir>/<id>.mp4`.

`isler.json` is generated from `src/content.js` (grammar narration). `aciklamalar.txt` has the Instagram captions for the 18 videos.
