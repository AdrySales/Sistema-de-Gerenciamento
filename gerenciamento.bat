@echo off
:loop
cd /d "C:\Users\luisa\Downloads\Sistema-de-Gerenciamento"

echo Realizando git add...
git add .

rem Espera 1 minuto (60 segundos)
timeout /t 60 /nobreak >nul

echo Realizando git commit...
git commit -m "sistema"

rem Espera 1 minuto (60 segundos)
timeout /t 60 /nobreak >nul

echo Realizando git push...
git push origin main

rem Espera 20 minutos (1200 segundos)
timeout /t 1200 /nobreak >nul

rem Retorna ao início do loop
goto loop
