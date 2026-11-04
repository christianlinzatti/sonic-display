# V899 technical gates: requires actual installed dependencies and a real production build.
$ErrorActionPreference = 'Stop'
$commands = @(
 'npm ci',
 'npm run verify:v899:focused',
 'npm run typecheck',
 'npm run build'
)
foreach ($command in $commands) {
 Write-Host "> $command"
 & cmd.exe /d /c $command
 if ($LASTEXITCODE -ne 0) { throw "V899 failed: $command (exit $LASTEXITCODE)" }
}
Write-Host 'V899 Windows technical gates complete'
