# Video engine (Instagram/TikTok grammar Reels)

1. **Voice (on a Windows PC with internet):** put `uret.py`, `isler.json`, `video_sesleri.bat` in a folder and double-click the .bat. Each segment is read separately. Default: Turkish segments `tr-TR-EmelNeural` (native), English segments `en-US-AvaMultilingualNeural` (`--en andrew` for Andrew). `--tr speak` keeps one multilingual voice and only sets the SSML language to `tr-TR` for Turkish segments. Why: edge-tts hard-codes `xml:lang='en-US'`, so the multilingual voice read short Turkish segments with an English accent; a `<lang>` tag is rejected by the service and `tr-TR-AhmetNeural` currently returns no audio. `ses_test.bat` generates video 01 in two configs for a listening test. "SAT" is written "S. A. T.". Output: `ses_v2.zip`.
2. **Timeline + audio mix:** `python3 prep.py <unzipped ses folder> <out_dir> [id...]` — trims leading/trailing silence, caps inner pauses at 0.35 s, natural speed (no speed-up), short breath between TR/EN segments and clear pauses between steps, keeps captions with punctuation, adds sound effects, 3-2-1 think pause.
3. **Render:** `node render.js <out_dir>` — Playwright renders `frame.html` at 1080x1920, 30 fps, piped to ffmpeg → `<out_dir>/<id>.mp4`.

`isler.json` is generated from `src/content.js` (grammar narration). `aciklamalar.txt` has the Instagram captions for the 18 videos.
