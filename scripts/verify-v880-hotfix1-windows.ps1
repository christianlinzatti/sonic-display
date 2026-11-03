# Sonic Display V880 Hotfix 1 validation (Windows PowerShell)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
$commands = @(
  @('npm', @('ci')),
  @('npm', @('run','test:v849')),
  @('npm', @('run','test:v849:types')),
  @('npm', @('run','test:v872')),
  @('npm', @('run','test:v872:types')),
  @('npm', @('run','test:v880')),
  @('npm', @('run','test:v880:types')),
  @('npx', @('tsc','--noEmit')),
  @('npm', @('run','build'))
)
foreach ($command in $commands) {
  $exe = $command[0]
  $cmdArgs = $command[1]
  Write-Host ("Running: " + $exe + " " + ($cmdArgs -join ' '))
  & $exe @cmdArgs
  if ($LASTEXITCODE -ne 0) { throw "Validation failed: $exe $($cmdArgs -join ' ') (exit $LASTEXITCODE)" }
}
Write-Host 'V880 Hotfix 1 validation passed.'
