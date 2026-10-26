# Video engine (Instagram/TikTok grammar Reels)

1. **Voice (on a Windows PC with internet):** put `uret.py`, `isler.json`, `video_sesleri.bat` in a folder and double-click the .bat. It uses edge-tts with `en-US-AndrewMultilingualNeural`; each segment is read separately so Turkish and English are pronounced correctly ("SAT" is written "S. A. T."). Output: `ses_paketi.zip`.
2. **Timeline + audio mix:** `python3 prep.py <unzipped ses folder> <out_dir>` — trims silences, speeds up 1.10x, keeps captions with punctuation, adds sound effects, 3-2-1 think pause.
3. **Render:** `node render.js <out_dir>` — Playwright renders `frame.html` at 1080x1920, 30 fps, piped to ffmpeg → `<out_dir>/<id>.mp4`.

`isler.json` is generated from `src/content.js` (grammar narration). `aciklamalar.txt` has the Instagram captions for the 18 videos.
