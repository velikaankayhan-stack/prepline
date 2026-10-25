# Prepline

**A free, open-source daily study plan for the SAT.** Works offline, installs on your phone, and keeps all data on your own device. Available in English and Turkish.

> Prepline is not affiliated with College Board. SAT is a trademark registered by College Board.

## Features

- **Personal plan.** You enter your test date, current score, target score, and daily time (30/60/90 min). The app builds a three-phase plan (Foundation → Volume → Rehearsal) with full practice tests every 4 weeks, then every 2 weeks.
- **Daily tasks.** Word review, grammar training, timed College Board Question Bank sets, timed modules, full Bluebook tests, and a review day after each test.
- **Grammar training.** The 18 grammar rules the SAT tests, with a narrated, animated lesson for each rule and 54 original practice questions. Rules come back for spaced review.
- **Vocabulary.** Spaced repetition, a quick-capture word box, one academic word a day, roots, and SAT math terms.
- **Question log and skill focus.** Log every Question Bank set; tasks focus on your weakest skill (below 80%).
- **Mistake log and progress.** Track why you miss questions, practice test scores, and a consistency gauge.

## Use it

Open the site and choose **Add to Home Screen** (iPhone: Share → Add to Home Screen; Android: menu → Install app).

## Live site

https://prepline.velikaankayhan.workers.dev

## Deploy your own copy (free)

1. Fork or copy this repository to your GitHub account.
2. In Cloudflare: **Workers & Pages → Create → Import a repository**, pick the repository, and deploy. `wrangler.jsonc` tells Cloudflare to serve only the `public/` folder.
3. Optional: **Web Analytics** in Cloudflare → add the site → paste the snippet where `build.py` says *Cloudflare Web Analytics*, then rebuild.
4. Put your repository URL in `SRC_URL` in `src/app1.js`.

GitHub Pages works too if you publish the `public/` folder.

## Develop

The site lives in `public/`. Its `index.html` is built from `src/`:

```
src/app.css     styles
src/body.html   markup
src/i18n.js     interface text (tr, en)
src/content.js  grammar rules, lessons, word lists, curriculum
src/app1-5.js   app logic
```

Edit files in `src/`, then run `python3 build.py` (it writes `public/index.html`). For each release, bump `APP_VER` in `src/app1.js` and `VERSION` in `public/sw.js` so phones pick up the update.

**Rename the app:** change `APP_NAME` in `src/app1.js`, the `<title>` in `build.py`, `public/manifest.json`, `public/privacy.html`, and `VERSION` in `public/sw.js`.

**Add a language:** copy the `en` block in `src/i18n.js`, translate it, and add the language to the `{tr, en}` objects in `src/content.js`. Have a native speaker check it.

## Privacy

No accounts, no cookies, no personal data. Everything is stored in the browser (IndexedDB). See [public/privacy.html](public/privacy.html).

## Credits

Built by Veli Kaan Kayhan. Grammar questions and lessons are original. Practice questions themselves come from College Board's free [Question Bank](https://satsuitequestionbank.collegeboard.org/) and [Bluebook](https://bluebook.collegeboard.org/); this app only links to them.

## License

MIT

---

## Türkçe

**SAT için ücretsiz, açık kaynak günlük çalışma programı.** Çevrimdışı çalışır, telefona yüklenir, tüm veriler senin cihazında kalır.

- Sınav tarihini, şu anki ve hedef puanını, günlük süreni girersin; uygulama sana 3 aşamalı bir program kurar.
- Her gün: kelime tekrarı, sesli ve animasyonlu gramer antrenmanı, Question Bank setleri, düzenli tam denemeler.
- Hesap yok, veri toplanmaz. Cihaz değiştirirken Ayarlar → Yedek al.
