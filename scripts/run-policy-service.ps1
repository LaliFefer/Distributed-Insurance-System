# Terminal 1 — Policy service (port 8081, Swagger at http://localhost:8081/swagger-ui.html)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$javaExe = (Get-Command java -ErrorAction Stop).Source
$env:JAVA_HOME = Split-Path (Split-Path $javaExe)

Write-Host "JAVA_HOME=$env:JAVA_HOME" -ForegroundColor Cyan
& .\mvnw.cmd -pl policy-service spring-boot:run
