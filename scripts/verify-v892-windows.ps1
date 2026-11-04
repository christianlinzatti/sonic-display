$ErrorActionPreference = 'Stop'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js fehlt im PATH' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm fehlt im PATH' }
& npm.cmd ci
if ($LASTEXITCODE -ne 0) { throw 'npm ci fehlgeschlagen' }
& npm.cmd run verify:v892:focused
if ($LASTEXITCODE -ne 0) { throw 'V892 Fokustests fehlgeschlagen' }
& npm.cmd run typecheck
if ($LASTEXITCODE -ne 0) { throw 'TypeScript fehlgeschlagen' }
& npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Next Build fehlgeschlagen' }
Write-Host 'V892 Windows checks PASS'
