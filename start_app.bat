@echo off
title RP Foundation App Launcher
echo ===================================================
echo   RP Foundation Jan Seva App is starting...
echo ===================================================
cd /d %~dp0
if not exist node_modules (
    echo Installing dependencies (this may take a minute on first run)...
    call npm install
)
echo Starting dev server...
start /b cmd /c "npm run dev"
echo Waiting for server to initialize...
timeout /t 4 /nobreak > null
echo Opening browser...
start http://localhost:3000
echo App is running. Keep this window open.
pause
