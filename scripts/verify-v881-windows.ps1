# Sonic Display V881 – full Windows quality gate.
# Locating node.exe before npm commands avoids the recurring npm-child PATH issue.
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$nodeExe = (Get-Command node.exe -ErrorAction Stop).Source
$npmCmd = (Get-Command npm.cmd -ErrorAction Stop).Source
$nodeDir = Split-Path -Parent $nodeExe
$npmDir = Split-Path -Parent $npmCmd
$env:PATH = "$nodeDir;$npmDir;$env:PATH"
Write-Host "Node: $nodeExe" -ForegroundColor Cyan
& $nodeExe --version
if ($LASTEXITCODE -ne 0) { throw 'Node.js kann nicht gestartet werden.' }
$commands = @(
 @('ci'),
 @('run','verify:v881:focused'),
 @('run','check:architecture'),
 @('run','typecheck'),
 @('run','build')
)
foreach ($arguments in $commands) {
 Write-Host "`n==> npm $($arguments -join ' ')" -ForegroundColor Cyan
 & $npmCmd @arguments
 if ($LASTEXITCODE -ne 0) {
  throw "V881-Prüfung fehlgeschlagen: npm $($arguments -join ' ') (Code: $LASTEXITCODE)"
 }
}
Write-Host 'V881: fokussierte Tests, TypeScript und Next.js-Produktion erfolgreich.' -ForegroundColor Green
