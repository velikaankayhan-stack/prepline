@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Scorepath video sesleri hazirlaniyor (18 video, birkac dakika surer)...
where python >nul 2>nul
if errorlevel 1 (set PY=py) else (set PY=python)
%PY% -m pip install --quiet --user --upgrade edge-tts
rem Turkce: emel veya speak, Ingilizce: ava veya andrew
%PY% uret.py --tr emel --en ava --out ses_v2
echo.
echo Bitti. Claude'a "hazir" yaz.
pause
