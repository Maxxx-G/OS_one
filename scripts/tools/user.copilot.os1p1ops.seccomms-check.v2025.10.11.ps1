<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: seccomms-check
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
Param([string]$Base="http://localhost:4000",[string]$Out="docs/reports/user.copilot.seccomms-check.v2025.10.10.md")
$ErrorActionPreference='Stop'
try { $r=Invoke-WebRequest -UseBasicParsing -Uri $Base } catch { $r=$null }
$mode=$null; if($r){$mode=$r.Headers["X-SEC-COMMS-MODE"]}
$lines=@(
"# OS One - SEC-COMMS Check v2025.10.10",
"",
"Mode: $mode",
"",
"## Expected Behavior",
"- mode=local_only -> remote origins 403",
"- mode=seccomms_on -> peer-approved CORS"
)
New-Item -ItemType Directory -Force -Path (Split-Path $Out)|Out-Null
Set-Content -Path $Out -Value ($lines -join "`r`n") -Encoding UTF8
Write-Host "SEC-COMMS report -> $Out"
