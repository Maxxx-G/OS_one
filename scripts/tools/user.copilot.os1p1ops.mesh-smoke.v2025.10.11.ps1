<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: mesh-smoke
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
Param([string]$Base = "http://localhost:4000", [string]$Out = "docs/reports/user.copilot.mesh-smoke.v2025.10.11.md")
$ErrorActionPreference = 'Stop'
try { $page = Invoke-WebRequest -UseBasicParsing -Uri "$Base/mesh" } catch { $page = $null }
$ok = ($null -ne $page)
$okStr = if ($ok) { "OK" }else { "NO" }
$lines = @("# OS One - Mesh Smoke v2025.10.11", "", "| Check | OK |", "|---|:---:|", "| /mesh reachable | $okStr |", "",
    "Note: open /mesh to view live Gabriel<->Overwatch event exchange.")
New-Item -ItemType Directory -Force -Path (Split-Path $Out) | Out-Null
Set-Content -Path $Out -Value ($lines -join "`r`n") -Encoding UTF8
Write-Host "Mesh smoke -> $Out"
