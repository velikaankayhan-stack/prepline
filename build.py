import os,json
R=os.path.dirname(os.path.abspath(__file__)); src=lambda f:open(os.path.join(R,'src',f),encoding='utf-8').read()
js="\n".join(src(f) for f in ['i18n.js','content.js','app1.js','app2.js','app3.js','app4.js','app5.js'])
html='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Prepline</title>
<meta name="description" content="A free daily SAT study plan: vocabulary, grammar lessons with narration, question log and progress tracking. Türkçe ve English.">
<meta name="theme-color" content="#2255c8">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<!-- Cloudflare Web Analytics: paste the snippet from the Cloudflare dashboard here (no cookies, no personal data). -->
<style>
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
open(os.path.join(R,'index.html'),'w',encoding='utf-8').write(html)
print(len(html))
