@echo off
setlocal
set "SCRIPTS=%~dp0scripts"
if not exist "%SCRIPTS%\govee-lan-bridge.cjs" set "SCRIPTS=%~dp0..\..\scripts"
where node.exe >nul 2>&1
if errorlevel 1 (
 echo [Sonic Display] Node.js fehlt. Installiere Node.js 24 LTS und oeffne dieses Fenster erneut.
 pause
 exit /b 1
)
if not exist "%SCRIPTS%\govee-lan-bridge.cjs" (
 echo [Sonic Display] Bridge-Script nicht gefunden.
 pause
 exit /b 1
)
echo Sonic Display Govee LAN Bridge - nur lokaler HTTP-Port 8765
node "%SCRIPTS%\govee-lan-bridge.cjs" %*
if errorlevel 1 (
 echo Die Bridge wurde mit einem Fehler beendet.
 pause
 exit /b 1
)
endlocal
