# V897: new camera tests, inherited focused regression, full production gates.
$ErrorActionPreference = "Stop"
$commands = @(
 "npm ci",
 "npm run verify:v897:focused",
 "npm run test:v897:ui-types",
 "npm run typecheck",
 "npm run build"
)
foreach ($command in $commands) {
 Write-Host "> $command"
 & cmd.exe /d /c $command
 if ($LASTEXITCODE -ne 0) { throw "V897 failed: $command (exit $LASTEXITCODE)" }
}
Write-Host "V897 Windows technical gates complete"
