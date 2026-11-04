# V908 Windows gates – npm dependencies must be installed online.
$ErrorActionPreference = 'Stop'
$commands = @('npm ci','npm run verify:v908:focused','npm run typecheck','npm run build')
foreach ($command in $commands) {
 Write-Host "> $command"
 & cmd.exe /d /c $command
 if ($LASTEXITCODE -ne 0) { throw "V908 failed: $command (exit $LASTEXITCODE)" }
}
Write-Host 'V908 Windows technical gates complete'
