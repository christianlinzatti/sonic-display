# V905 – Windows release gates: actual dependencies and production build required.
$ErrorActionPreference = 'Stop'
$commands = @(
 'npm ci',
 'npm run verify:v905:focused',
 'npm run typecheck',
 'npm run build'
)
foreach ($command in $commands) {
 Write-Host "> $command"
 & cmd.exe /d /c $command
 if ($LASTEXITCODE -ne 0) { throw "V905 failed: $command (exit $LASTEXITCODE)" }
}
Write-Host 'V905 Windows technical gates complete'
