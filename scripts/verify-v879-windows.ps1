# V879 validation. Run from the project root in PowerShell.
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$commands = @(
  @('ci'),
  @('run','verify:v879:focused'),
  @('run','typecheck'),
  @('run','build')
)
foreach ($arguments in $commands) {
  Write-Host "`n==> npm $($arguments -join ' ')" -ForegroundColor Cyan
  & npm @arguments
  if ($LASTEXITCODE -ne 0) { throw "Prüfung fehlgeschlagen: npm $($arguments -join ' ') (Code: $LASTEXITCODE)" }
}
Write-Host "V879 Tests, TypeScript und Produktionsbuild erfolgreich." -ForegroundColor Green
