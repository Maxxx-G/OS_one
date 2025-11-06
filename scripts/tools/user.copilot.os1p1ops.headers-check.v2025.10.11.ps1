<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: headers-check
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
Param(
  [string]$Base = "http://localhost:4000",
  [string]$Out = "docs/reports/user.copilot.headers-check.v2025.10.10.md"
)
$ErrorActionPreference='Stop'
function Row($k,$v){ "| $k | $v |" }
$want = @(
  "Content-Security-Policy",
  "Referrer-Policy",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Permissions-Policy",
  "Cross-Origin-Opener-Policy",
  "Cross-Origin-Embedder-Policy"
)
$opt = @("Strict-Transport-Security")

try { $r = Invoke-WebRequest -UseBasicParsing -Uri $Base } catch { $r = $null }
$lines=@("# OS One - Headers Check v2025.10.10","","Target: $Base","","## Mandatory Headers","| Header | Present |","|---|:---:|")
foreach($h in $want){
  $present = if($r -and $r.Headers[$h]){ "OK" } else { "NO" }
  $lines += (Row $h $present)
}
$lines += "","## Optional (prod only)","| Header | Present |","|---|:---:|"
foreach($h in $opt){
  $present = if($r -and $r.Headers[$h]){ "OK" } else { "-" }
  $lines += (Row $h $present)
}
New-Item -ItemType Directory -Force -Path (Split-Path $Out) | Out-Null
Set-Content -Path $Out -Value ($lines -join "`r`n") -Encoding UTF8
Write-Host "Headers report -> $Out"
