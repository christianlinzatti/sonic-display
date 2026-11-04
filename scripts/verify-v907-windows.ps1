# V907 Windows technical gates (requires online npm dependency installation)
$ErrorActionPreference = 'Stop'
$commands = @('npm ci','npm run verify:v907:focused','npm run typecheck','npm run build')
foreach ($command in $commands) {
 Write-Host "> $command"
 & cmd.exe /d /c $command
 if ($LASTEXITCODE -ne 0) { throw "V907 failed: $command (exit $LASTEXITCODE)" }
}
Write-Host 'V907 Windows technical gates complete'
