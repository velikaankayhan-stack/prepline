@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Scorepath video sesleri hazirlaniyor (18 video, birkac dakika surer)...
where python >nul 2>nul
if errorlevel 1 (set PY=py) else (set PY=python)
%PY% -m pip install --quiet --user --upgrade edge-tts
%PY% uret.py
echo.
echo Bitti. Claude'a "hazir" yaz.
pause
