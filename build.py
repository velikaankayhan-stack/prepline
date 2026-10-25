import os,json
SITE_URL="https://prepline.velikaankayhan.workers.dev/"   # alan adı alınınca değiştir / change after buying a domain
CF_BEACON_TOKEN=""   # Cloudflare Web Analytics token
R=os.path.dirname(os.path.abspath(__file__)); src=lambda f:open(os.path.join(R,'src',f),encoding='utf-8').read()
js="\n".join(src(f) for f in ['i18n.js','content.js','app1.js','app2.js','app3.js','app4.js','app5.js'])
html='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Scorepath</title>
<meta name="description" content="A free daily SAT study plan: vocabulary, grammar lessons with narration, question log and progress tracking. Türkçe ve English.">
<meta name="theme-color" content="#2255c8">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta property="og:type" content="website">
<meta property="og:title" content="Scorepath — free SAT study plan">
<meta property="og:description" content="Daily plan, narrated grammar lessons, vocabulary and progress tracking. Free, no account. Türkçe / English.">
<meta property="og:url" content="'''+SITE_URL+'''">
<meta property="og:image" content="'''+SITE_URL+'''og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
'''+(('<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token": "'+CF_BEACON_TOKEN+'"}\'></script>\n') if CF_BEACON_TOKEN else '')+'''<style>
'''+src('app.css')+'''
</style>
</head>
<body>
'''+src('body.html')+'''
<script>
'''+js+'''
</script>
</body>
</html>
'''
open(os.path.join(R,'public','index.html'),'w',encoding='utf-8').write(html)
print(len(html))
