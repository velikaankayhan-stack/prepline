@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Scorepath ses testi (video 01, iki ayar)...
where python >nul 2>nul
if errorlevel 1 (set PY=py) else (set PY=python)
%PY% -m pip install --quiet --user --upgrade edge-tts
%PY% uret.py --tr emel --en ava --out ses_test_emel 01_b1
%PY% uret.py --tr speak --en andrew --out ses_test_speak 01_b1
echo.
echo Bitti. Claude'a "hazir" yaz.
pause
