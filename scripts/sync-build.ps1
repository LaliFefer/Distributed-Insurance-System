# Run from anywhere: .\scripts\sync-build.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$javaExe = (Get-Command java -ErrorAction Stop).Source
$env:JAVA_HOME = Split-Path (Split-Path $javaExe)

Write-Host "JAVA_HOME=$env:JAVA_HOME" -ForegroundColor Cyan
Write-Host "Building from: $(Get-Location)" -ForegroundColor Cyan
& .\mvnw.cmd clean install -DskipTests
