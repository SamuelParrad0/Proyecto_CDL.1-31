[CmdletBinding()]
param(
    [string]$PublicIp = '18.209.145.233',
    [int]$BackendPort = 5000,
    [int]$HttpPort = 80
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$FrontendRoot = Join-Path $ProjectRoot 'frontend'
$BackendRoot = Join-Path $ProjectRoot 'backend\backend'
$BuildRoot = Join-Path $FrontendRoot 'build'
$BackendEnvPath = Join-Path $BackendRoot '.env'
$GatewayPath = Join-Path $PSScriptRoot 'servidor-produccion.js'
$SiteName = 'CDL'
$AppPoolName = 'CDL'

function Require-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw 'Ejecuta PowerShell como Administrador.'
    }
}

function Require-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "No se encontro '$Name'. Instala Node.js LTS y vuelve a ejecutar el script."
    }
}

Require-Administrator
Require-Command 'node'
Require-Command 'npm'

if (-not (Test-Path $BackendEnvPath)) {
  throw "No existe $BackendEnvPath. Configura el backend antes de publicar."
}
$backendEnv = Get-Content $BackendEnvPath -Raw
if ($backendEnv -notmatch "(?m)^NODE_ENV=production\s*$") {
  throw 'backend/.env debe contener NODE_ENV=production.'
}
if ($backendEnv -notmatch "(?m)^FRONTEND_URL=http://$([regex]::Escape($PublicIp))\s*$") {
  throw "backend/.env debe contener FRONTEND_URL=http://$PublicIp para CORS."
}

Write-Host 'Construyendo frontend de produccion...'
Push-Location $FrontendRoot
try {
    npm ci
    npm run build
}
finally {
    Pop-Location
}

if (-not (Test-Path (Join-Path $BuildRoot 'index.html'))) {
    throw 'La compilacion del frontend no genero frontend\build\index.html.'
}

New-NetFirewallRule -DisplayName 'CDL HTTP 80' -Direction Inbound -Protocol TCP -LocalPort $HttpPort -Action Allow -ErrorAction SilentlyContinue | Out-Null
New-NetFirewallRule -DisplayName "CDL Backend $BackendPort (local)" -Direction Inbound -Protocol TCP -LocalPort $BackendPort -Action Block -ErrorAction SilentlyContinue | Out-Null

Push-Location $BackendRoot
try {
    npm ci
    $backend = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | Where-Object { $_.CommandLine -match 'server\.js' }
    if (-not $backend) {
        Start-Process -FilePath 'node.exe' -ArgumentList 'server.js' -WorkingDirectory $BackendRoot -WindowStyle Hidden
    }
}
finally {
    Pop-Location
}

  $gateway = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | Where-Object { $_.CommandLine -match 'servidor-produccion\.js' }
  if (-not $gateway) {
    $env:HTTP_PORT = $HttpPort
    $env:BACKEND_PORT = $BackendPort
    Start-Process -FilePath 'node.exe' -ArgumentList "`"$GatewayPath`"" -WorkingDirectory $ProjectRoot -WindowStyle Hidden
  }

Write-Host ''
Write-Host "Publicacion terminada: http://$PublicIp/"
Write-Host "Prueba de la aplicacion a traves del gateway Node: http://$PublicIp/"
Write-Host "El backend permanece interno en 127.0.0.1:$BackendPort."
Write-Host 'Nota: configura el NAT/security group del proveedor para permitir TCP 80 y usa HTTPS antes de manejar credenciales reales.'