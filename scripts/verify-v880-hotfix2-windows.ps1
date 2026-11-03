# V880 Hotfix 2: run the release integrity regression before full validation.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
foreach ($command in @('npm run check:lockfile:v752', 'npm run test:v752', 'npm run test:v880', 'npm run test:v880:types', 'npm run typecheck', 'npm run build')) {
  Write-Host "RUN: $command"
  & cmd.exe /d /s /c $command
  if ($LASTEXITCODE -ne 0) { throw "Fehlgeschlagen (Exit $LASTEXITCODE): $command" }
}
Write-Host 'V880 Hotfix 2: alle Pruefungen erfolgreich.'
