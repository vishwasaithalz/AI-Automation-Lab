<#
Creates six public standalone KARMA GitHub repos via the locally authenticated GitHub CLI.
Dry run by default. Publish requires -Publish. Does not change existing repos or Vercel.
#>
[CmdletBinding()]
param([switch]$Publish)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$Owner = 'vishwasaithalz'
$Names = @('SentinelPulse','SERPMatrix','CloudHardener','ApexVitals','ZeroAuth','SpectraUI')
$Descriptions = @{
 SentinelPulse='Application security and rate-limiting research'
 SERPMatrix='Technical SEO and structured-data auditing'
 CloudHardener='Read-only Kubernetes policy auditing'
 ApexVitals='Frontend asset and performance optimization'
 ZeroAuth='WebAuthn cryptography and passkey experiments'
 SpectraUI='Accessible UI components and contrast testing'
}
Write-Host ('KARMA GitHub standalone project publisher: ' + ($Names -join ', ')) -ForegroundColor Cyan
if (-not $Publish) {
 Write-Host 'DRY RUN: no changes made. Use -Publish to create six PUBLIC repositories.' -ForegroundColor Yellow
 return
}
foreach($tool in @('gh','git')) {
 if(-not(Get-Command $tool -ErrorAction SilentlyContinue)) {throw ('Please install '+$tool)}
}
& gh auth status --hostname github.com 1>$null 2>$null
if($LASTEXITCODE -ne 0){throw 'Please authenticate with: gh auth login --web'}
$UserName=(& gh api user --jq '.login' 2>$null)
if($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($UserName)){throw 'GitHub account verification failed.'}
if($UserName.Trim() -cne $Owner){throw ('Wrong GitHub identity: '+$UserName)}
$Work=Join-Path $HOME ('KARMA-Standalone-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
$Source=Join-Path $Work 'source'
New-Item -ItemType Directory -Path $Work -Force | Out-Null
& git clone --quiet --depth 1 ('https://github.com/'+$Owner+'/AI-Automation-Lab.git') $Source
if($LASTEXITCODE -ne 0){throw 'Could not clone the original public source.'}
$Report=New-Object System.Collections.Generic.List[object]
foreach($Name in $Names){
 $Remote=$Owner+'/'+$Name
 & gh repo view $Remote --json name --jq .name 1>$null 2>$null
 if($LASTEXITCODE -eq 0){
  $Report.Add([pscustomobject]@{Repo=$Remote;Status='EXISTS_UNCHANGED'})
  continue
 }
 $From=Join-Path $Source ('projects/'+$Name)
 if(-not(Test-Path -LiteralPath $From -PathType Container)){throw ('Missing source: '+$From)}
 $To=Join-Path $Work $Name
 New-Item -ItemType Directory -Path $To -Force | Out-Null
 Get-ChildItem -LiteralPath $From -Force | ForEach-Object{
  Copy-Item -LiteralPath $_.FullName -Destination $To -Recurse -Force
 }
 $Old='https://github.com/'+$Owner+'/AI-Automation-Lab/tree/main/projects/'+$Name
 $New='https://github.com/'+$Remote
 foreach($Path in @((Join-Path $To 'README.md'),(Join-Path $To 'web/index.html'))){
  if(Test-Path -LiteralPath $Path){
   $Text=[IO.File]::ReadAllText($Path)
   $Text=$Text.Replace($Old,$New).Replace('projects/'+$Name+'/','')
   [IO.File]::WriteAllText($Path,$Text,[Text.UTF8Encoding]::new($false))
  }
 }
 if($Name -in @('ZeroAuth','SpectraUI')){
  $Short=if($Name -eq 'ZeroAuth'){'zeroauth'}else{'spectra'}
  $TestSource=Join-Path $Source ('tests/'+$Short+'.test.mjs')
  if(-not(Test-Path -LiteralPath $TestSource)){throw ('Missing JS test: '+$TestSource)}
  $TestDir=Join-Path $To 'tests'
  New-Item -ItemType Directory -Path $TestDir -Force | Out-Null
  $TestText=[IO.File]::ReadAllText($TestSource).Replace('../projects/'+$Name+'/web/','../web/')
  [IO.File]::WriteAllText((Join-Path $TestDir ($Short+'.test.mjs')),$TestText,[Text.UTF8Encoding]::new($false))
  $Yaml=@'
name: Test standalone project
on: [push, pull_request, workflow_dispatch]
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          persist-credentials: false
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1
        with:
          node-version: '22'
      - run: node --test tests/*.test.mjs
      - run: node --check web/app.mjs
'@
 }else{
  $Yaml=@'
name: Test standalone project
on: [push, pull_request, workflow_dispatch]
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          persist-credentials: false
      - uses: actions/setup-python@6d4fd22b20465ccc0f7354476588e8df7c9ca0e0
        with:
          python-version: '3.12'
      - run: python -m unittest discover -s . -p 'test_*.py' -v
'@
 }
 $CI=Join-Path $To '.github/workflows'
 New-Item -ItemType Directory -Path $CI -Force | Out-Null
 [IO.File]::WriteAllText((Join-Path $CI 'ci.yml'),$Yaml,[Text.UTF8Encoding]::new($false))
 $Ignores=@('node_modules/','__pycache__/','*.pyc','test-results/','.env')
 [IO.File]::WriteAllText((Join-Path $To '.gitignore'),($Ignores -join [Environment]::NewLine),[Text.UTF8Encoding]::new($false))
 Add-Content -LiteralPath (Join-Path $To 'README.md') -Value @'

The existing Vercel deployment continues using AI-Automation-Lab until a separately verified Git integration cutover. This script does not change live deployments.
'@
 & git -C $To init --initial-branch=main --quiet
 if($LASTEXITCODE -ne 0){throw 'git init failed'}
 & git -C $To add .
 if($LASTEXITCODE -ne 0){throw 'git add failed'}
 & git -C $To commit -m ('Initialize standalone KARMA '+$Name+' lab')
 if($LASTEXITCODE -ne 0){throw 'git commit failed: check your git user.name and user.email.'}
 & gh repo create $Remote --public --source $To --remote origin --push --description $Descriptions[$Name]
 if($LASTEXITCODE -eq 0){
  $Report.Add([pscustomobject]@{Repo=$Remote;Status='CREATED_AND_PUSHED'})
  Write-Host ('CREATED https://github.com/'+$Remote) -ForegroundColor Green
 }else{
  $Report.Add([pscustomobject]@{Repo=$Remote;Status='CHECK_PARTIAL_FAILURE'})
  Write-Warning ('Review remote status: https://github.com/'+$Remote)
 }
}
$Report|Format-Table -AutoSize
$Csv=Join-Path $Work 'repo-result.csv'
$Report|Export-Csv -NoTypeInformation -Path $Csv
Write-Host ('Saved results: '+$Csv)
Write-Host 'Existing six Vercel domains and their Git integrations remain untouched.'
