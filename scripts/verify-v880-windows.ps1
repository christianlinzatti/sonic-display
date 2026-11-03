# Sonic Display V880 – complete Windows validation, fail on any step.
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$commands = @(
  @('ci'),
  @('run','verify:v880:focused'),
  @('run','check:architecture'),
  @('run','typecheck'),
  @('run','build')
)
foreach ($arguments in $commands) {
  Write-Host "`n==> npm $($arguments -join ' ')" -ForegroundColor Cyan
  & npm @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Prüfung fehlgeschlagen: npm $($arguments -join ' ') (Code: $LASTEXITCODE)"
  }
}
Write-Host 'V880: Alle Tests, TypeScript-Prüfung und Next.js-Build erfolgreich.' -ForegroundColor Green
