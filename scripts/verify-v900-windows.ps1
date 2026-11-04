# V900 technical gates: requires actual installed dependencies and a real production build.
$ErrorActionPreference = 'Stop'
$commands = @(
 'npm ci',
 'npm run verify:v900:focused',
 'npm run typecheck',
 'npm run build'
)
foreach ($command in $commands) {
 Write-Host "> $command"
 & cmd.exe /d /c $command
 if ($LASTEXITCODE -ne 0) { throw "V900 failed: $command (exit $LASTEXITCODE)" }
}
Write-Host 'V900 Windows technical gates complete'
