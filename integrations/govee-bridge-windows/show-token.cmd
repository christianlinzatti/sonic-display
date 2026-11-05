@echo off
setlocal
set "SCRIPTS=%~dp0scripts"
if not exist "%SCRIPTS%\print-govee-token-v971.cjs" set "SCRIPTS=%~dp0..\..\scripts"
where node.exe >nul 2>&1
if errorlevel 1 (echo Node.js nicht gefunden.& pause& exit /b 1)
echo Das Token nur in deinem eigenen Sonic-Display-Govee-Tab verwenden.
node "%SCRIPTS%\print-govee-token-v971.cjs"
pause
endlocal
