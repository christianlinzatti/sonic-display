@echo off
setlocal
set /p "SONIC_ORIGIN=HTTPS-Adresse der Sonic-Display-Webseite (z.B. https://example.vercel.app): "
if "%SONIC_ORIGIN%"=="" (
 echo Keine Adresse eingegeben.
 pause
 exit /b 1
)
call "%~dp0start-govee-bridge.cmd" --origin "%SONIC_ORIGIN%"
endlocal
