# V906 – Windows release gates: actual dependencies and production build required.
$ErrorActionPreference = 'Stop'
$commands = @(
 'npm ci',
 'npm run verify:v906:focused',
 'npm run typecheck',
 'npm run build'
)
foreach ($command in $commands) {
 Write-Host "> $command"
 & cmd.exe /d /c $command
 if ($LASTEXITCODE -ne 0) { throw "V906 failed: $command (exit $LASTEXITCODE)" }
}
Write-Host 'V906 Windows technical gates complete'
