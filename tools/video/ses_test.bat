@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Scorepath ses testi (1 video, 2 farkli Turkce ayari)...
where python >nul 2>nul
if errorlevel 1 (set PY=py) else (set PY=python)
%PY% -m pip install --quiet --user --upgrade edge-tts
%PY% uret.py --tr lang --out ses_test_lang 01_b1
%PY% uret.py --tr ahmet --out ses_test_ahmet 01_b1
echo.
echo Bitti. Claude'a "hazir" yaz.
pause
