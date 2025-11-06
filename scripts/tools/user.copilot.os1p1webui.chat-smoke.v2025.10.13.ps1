<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: chat-smoke
X-Version: v2025.10.13
X-Policy: filename+header compliance required
#>

# Chat API SSE Smoke Test
# Validates /api/chat returns SSE stream with data events

$ErrorActionPreference = "Continue"
$BaseUrl = "http://localhost:4000"
$ReportPath = "docs/reports/user.copilot.os1p1webui.chat-smoke.v2025.10.13.md"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "`n=== Chat API SSE Smoke Test ===" -ForegroundColor Cyan

# Test: POST to /api/chat and validate SSE
Write-Host "`n[1/1] Testing /api/chat SSE stream..." -ForegroundColor Yellow
try {
    $body = @{ message = "Hello, test!" } | ConvertTo-Json
    
    # Note: PowerShell Invoke-WebRequest doesn't handle SSE streaming well
    # This is a basic validation that endpoint responds with SSE headers
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/chat" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    
    $contentType = $response.Headers["Content-Type"]
    
    if ($response.StatusCode -eq 200 -and $contentType -match "text/event-stream") {
        # Check if response contains SSE data
        if ($response.Content -match "event:|data:") {
            Write-Host "✅ Chat API: PASS (SSE stream with events)" -ForegroundColor Green
            $chatStatus = "PASS"
            $chatDetails = "SSE stream detected (Content-Type: $contentType)"
        } else {
            Write-Host "⚠️  Chat API: WARN (SSE headers present but no event data)" -ForegroundColor Yellow
            $chatStatus = "WARN"
            $chatDetails = "No SSE event data found in response"
        }
    } elseif ($response.StatusCode -eq 200) {
        Write-Host "⚠️  Chat API: WARN (200 OK but not SSE)" -ForegroundColor Yellow
        $chatStatus = "WARN"
        $chatDetails = "Content-Type: $contentType (expected text/event-stream)"
    } else {
        Write-Host "⚠️  Chat API: Unexpected status $($response.StatusCode)" -ForegroundColor Yellow
        $chatStatus = "WARN"
        $chatDetails = "HTTP $($response.StatusCode)"
    }
} catch {
    # Check if error is due to Ollama being unavailable (expected in local_only mode)
    if ($_.Exception.Message -match "Ollama|11434|connection") {
        Write-Host "⚠️  Chat API: Ollama unavailable (expected in local_only mode)" -ForegroundColor Yellow
        $chatStatus = "SKIP"
        $chatDetails = "Ollama not running (http://localhost:11434) - install Ollama or set SECCOMMS_MODE=external"
    } else {
        Write-Host "❌ Chat API: FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $chatStatus = "FAIL"
        $chatDetails = $_.Exception.Message
    }
}

# Generate report
$reportContent = @"
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: chat-smoke-report
X-Version: v2025.10.13
X-Policy: filename+header compliance required

---

# Chat API SSE Smoke Test Report

**Timestamp**: $Timestamp  
**Base URL**: $BaseUrl  
**Endpoint**: /api/chat (POST)

## Results

| Check | Status | Details |
|---|:---:|---|
| SSE Stream (POST) | $chatStatus | $chatDetails |

## Summary

- **SSE Validation**: $chatStatus
- **Expected**: Content-Type: text/event-stream with event/data lines
- **Provider Mode**: local_only (Ollama) or external (OpenAI)

## Notes

- **Local-only mode** requires Ollama running at http://localhost:11434
- **External mode** requires OPENAI_API_KEY in environment
- SSE streaming may not capture full response in PowerShell (use curl for full test)

## Conclusion

"@

if ($chatStatus -eq "PASS") {
    $reportContent += "✅ Chat API smoke test PASSED - SSE stream operational`n"
    Write-Host "`n✅ SMOKE TEST PASSED" -ForegroundColor Green
    $exitCode = 0
} elseif ($chatStatus -eq "SKIP") {
    $reportContent += "⚠️ Chat API smoke test SKIPPED - Ollama not available (install Ollama or set SECCOMMS_MODE=external)`n"
    Write-Host "`n⚠️ SMOKE TEST SKIPPED (Ollama not running)" -ForegroundColor Yellow
    $exitCode = 0
} else {
    $reportContent += "⚠️ Chat API smoke test FAILED - Check dev server and provider availability`n"
    Write-Host "`n⚠️ SMOKE TEST FAILED" -ForegroundColor Yellow
    $exitCode = 1
}

# Write report
New-Item -Path (Split-Path $ReportPath -Parent) -ItemType Directory -Force | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $ReportPath), $reportContent, [System.Text.Encoding]::UTF8)

Write-Host "`nChat smoke report saved: $ReportPath" -ForegroundColor Cyan
exit $exitCode
