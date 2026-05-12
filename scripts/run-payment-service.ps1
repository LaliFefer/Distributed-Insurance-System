# Terminal 2 — Payment service (port 8082, Swagger at http://localhost:8082/swagger-ui.html)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$javaExe = (Get-Command java -ErrorAction Stop).Source
$env:JAVA_HOME = Split-Path (Split-Path $javaExe)

Write-Host "JAVA_HOME=$env:JAVA_HOME" -ForegroundColor Cyan
& .\mvnw.cmd -pl payment-service spring-boot:run
