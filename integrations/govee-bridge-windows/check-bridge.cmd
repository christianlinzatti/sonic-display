@echo off
setlocal
set "SCRIPTS=%~dp0scripts"
if not exist "%SCRIPTS%\govee-bridge-check-v971.cjs" set "SCRIPTS=%~dp0..\..\scripts"
where node.exe >nul 2>&1
if errorlevel 1 (echo Node.js nicht gefunden.& pause& exit /b 1)
node "%SCRIPTS%\govee-bridge-check-v971.cjs"
pause
endlocal
