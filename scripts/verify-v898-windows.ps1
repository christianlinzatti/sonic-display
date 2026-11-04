# V898 technical gates: requires actual installed dependencies and a real production build.
$ErrorActionPreference = 'Stop'
$commands = @(
 'npm ci',
 'npm run verify:v898:focused',
 'npm run typecheck',
 'npm run build'
)
foreach ($command in $commands) {
 Write-Host "> $command"
 & cmd.exe /d /c $command
 if ($LASTEXITCODE -ne 0) { throw "V898 failed: $command (exit $LASTEXITCODE)" }
}
Write-Host 'V898 Windows technical gates complete'
