# V896 focused, then full production checks on a fully provisioned Windows workstation.
$ErrorActionPreference = "Stop"
$commands = @(
 "npm ci",
 "npm run verify:v896:focused",
 "npm run typecheck",
 "npm run build"
)
foreach ($command in $commands) {
 Write-Host "> $command"
 & cmd.exe /d /c $command
 if ($LASTEXITCODE -ne 0) { throw "V896 failed: $command (exit $LASTEXITCODE)" }
}
Write-Host "V896 Windows technical gates complete"
