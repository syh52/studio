@echo off
title Lexicon App
echo Starting...

cd /d "%~dp0\studio"

echo Current dir: %CD%

node --version
if %errorlevel% neq 0 (
    echo Node.js not found
    echo Download from: https://nodejs.org
    pause
    exit
)

echo Starting server...
echo http://localhost:9002

start "" cmd /c "timeout /t 5 >nul & start http://localhost:9002"

npm run dev

pause 