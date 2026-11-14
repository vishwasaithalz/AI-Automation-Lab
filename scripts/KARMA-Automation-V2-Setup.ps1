# KARMA.EXE | Windows local-first setup
# Runs only on the owner's PC when explicitly executed.
# Default: clone the staged review branch and run read-only tests.
# Optional: -InstallNodeRed installs a pinned local Node-RED runtime, not a service.
[CmdletBinding()]
param(
  [switch]$InstallNodeRed,
  [switch]$LaunchNodeRed,
  [switch]$SkipClone
)
$ErrorActionPreference = 'Stop'
$downloadOptions = @(
  "C:\Users\vishw\Downloads",
  "C:\Users\ADMIN_vishw\Downloads",
  (Join-Path $env:USERPROFILE 'Downloads')
)
$downloads = $downloadOptions | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $downloads) {
  $downloads = Join-Path $env:USERPROFILE 'Downloads'
  New-Item -ItemType Directory -Force -Path $downloads | Out-Null
}
Write-Host "KARMA.EXE staged setup. Downloads: $downloads" -ForegroundColor Cyan

foreach ($cmd in @('git','node','npm')) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    throw "Required command missing: $cmd. Install it and rerun this setup."
  }
}
Write-Host ("Git: " + (& git --version))
Write-Host ("Node: " + (& node --version))
Write-Host ("npm: " + (& npm --version))
if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
  Write-Host ("FFmpeg: " + ((& ffmpeg -version | Select-Object -First 1) -join ''))
}
if (Get-Command python -ErrorAction SilentlyContinue) {
  Write-Host ("Python: " + (& python --version))
}

$workspace = Join-Path $downloads 'AI-Automation-Lab-V2-Review'
if (-not (Test-Path $workspace)) {
  if ($SkipClone) { throw "Missing review checkout at $workspace" }
  & git clone --depth 1 --branch review/karma-automation-v2-20261114 --single-branch https://github.com/vishwasaithalz/AI-Automation-Lab.git $workspace
  if ($LASTEXITCODE -ne 0) { throw 'Could not clone the review branch' }
} else {
  Write-Host "Existing checkout preserved: $workspace" -ForegroundColor Yellow
  Write-Host 'Run git fetch manually if you want to update it. No automatic pull or overwrite.'
}

Push-Location $workspace
try {
  & node --test tests/karma-automation-audit.test.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Policy tests failed' }
  $receipt = Join-Path $downloads 'KARMA-Automation-V2-Audit.json'
  & node src/karma-automation-audit.mjs --out $receipt
  if ($LASTEXITCODE -ne 0) { throw 'Policy audit failed' }
  Write-Host "Read-only policy audit saved: $receipt" -ForegroundColor Green
} finally {
  Pop-Location
}

if ($InstallNodeRed) {
  $typed = Read-Host 'Type INSTALL-LOCAL to install Node-RED 5.0.9 in Downloads only'
  if ($typed -cne 'INSTALL-LOCAL') {
    Write-Warning 'Node-RED installation cancelled; audit completed.'
    return
  }
  $runtime = Join-Path $downloads 'KARMA-Automation-V2\node-red'
  New-Item -ItemType Directory -Force -Path $runtime | Out-Null
  Push-Location $runtime
  try {
    if (-not (Test-Path 'package.json')) {
      & npm init -y | Out-Null
      if ($LASTEXITCODE -ne 0) { throw 'npm init failed' }
    }
    & npm install --save-exact node-red@5.0.9
    if ($LASTEXITCODE -ne 0) { throw 'Pinned local Node-RED installation failed' }
  } finally {
    Pop-Location
  }
  $settingsPath = Join-Path $runtime 'settings.js'
  $dataDir = Join-Path $runtime 'data'
  New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
  if (-not (Test-Path $settingsPath)) {
@'
module.exports = {
  uiHost: '127.0.0.1',
  uiPort: 1880,
  flowFile: 'flows.json',
  functionGlobalContext: {},
  editorTheme: { projects: { enabled: false } }
};
'@ | Set-Content -Path $settingsPath -Encoding utf8
  }
  $launcher = Join-Path $runtime 'Start-KARMA-NodeRED.ps1'
  $bin = Join-Path $runtime 'node_modules\.bin\node-red.cmd'
  $commandText = '& "' + $bin + '" --settings "' + $settingsPath + '" --userDir "' + $dataDir + '"'
  Set-Content -Path $launcher -Value $commandText -Encoding utf8
  Write-Host "Installed Node-RED 5.0.9 locally. No Windows service or task was created." -ForegroundColor Green
  Write-Host "Start manually with: & '$launcher'"
  Write-Host 'Open http://127.0.0.1:1880 while it is running. Keep it bound to loopback.'
  if ($LaunchNodeRed) { & $launcher }
} elseif ($LaunchNodeRed) {
  Write-Warning 'LaunchNodeRed requires InstallNodeRed in this script. No process launched.'
}
Write-Host 'No posts, deployments, GitHub merges or ChatGPT schedules were changed.' -ForegroundColor Cyan
