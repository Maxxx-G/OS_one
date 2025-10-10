<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: seccomms-p2p-smoke
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
Param([string]$Base = "http://localhost:4000", [string]$Out = "docs/reports/user.copilot.seccomms-p2p-smoke.v2025.10.10.md")
$ErrorActionPreference = 'Stop'
# Basic reachability + CSP presence + page load
try { $root = Invoke-WebRequest -UseBasicParsing -Uri $Base } catch { $root = $null }
try { $page = Invoke-WebRequest -UseBasicParsing -Uri "$Base/seccomms" } catch { $page = $null }
$okRoot = ($null -ne $root); $okPage = ($null -ne $page)
$csp = $root -and $root.Headers["Content-Security-Policy"]
$rootOK = if ($okRoot) { "OK" }else { "NO" }
$pageOK = if ($okPage) { "OK" }else { "NO" }
$cspOK = if ($csp) { "OK" }else { "NO" }
$lines = @("# SEC-COMMS beta - P2P Smoke v2025.10.10", "", "| Check | OK |", "|---|:---:|",
    "| Root reachable | $rootOK |",
    "| /seccomms reachable | $pageOK |",
    "| CSP header present | $cspOK |",
    "", "Note: Insertable Streams functional state is visible in page logs; automate via E2E later.")
New-Item -ItemType Directory -Force -Path (Split-Path $Out) | Out-Null
Set-Content -Path $Out -Value ($lines -join "`r`n") -Encoding UTF8
Write-Host "P2P smoke -> $Out"
