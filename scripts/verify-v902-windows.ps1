# V902 technical gates: requires actual installed dependencies and a real production build.
$ErrorActionPreference = 'Stop'
$commands = @(
 'npm ci',
 'npm run verify:v902:focused',
 'npm run typecheck',
 'npm run build'
)
foreach ($command in $commands) {
 Write-Host "> $command"
 & cmd.exe /d /c $command
 if ($LASTEXITCODE -ne 0) { throw "V902 failed: $command (exit $LASTEXITCODE)" }
}
Write-Host 'V902 Windows technical gates complete'
