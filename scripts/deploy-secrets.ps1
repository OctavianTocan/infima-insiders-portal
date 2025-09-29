# scripts/deploy-secrets.ps1
param(
    [Parameter()]
    [string]$Environment = "production"
)

Write-Host "[DEPLOY] Deploying secrets to Cloudflare Workers ($Environment environment)" -ForegroundColor Cyan

# Determine the env file based on environment
$envFile = $(if ($Environment -eq "staging") { ".\.env.staging" } else { ".\.env.production" })

# Check if the env file exists
if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] $envFile file not found! Please create one based on .env.production.example" -ForegroundColor Red
    exit 1
}

# Read and parse the env file
$envContent = Get-Content $envFile | Where-Object { 
    $_ -match '^[^#].*=' -and $_.Trim() -ne '' 
}

$secrets = @{}
foreach ($line in $envContent) {
    $parts = $line -split '=', 2
    if ($parts.Count -eq 2) {
        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        $secrets[$key] = $value
    }
}

Write-Host "[INFO] Found $($secrets.Count) secrets to deploy" -ForegroundColor Yellow

# Deploy each secret
$failed = @()
foreach ($secret in $secrets.GetEnumerator()) {
    Write-Host "  Setting $($secret.Key)..." -NoNewline
    
    try {
        $secret.Value | npx wrangler secret put $secret.Key --env $Environment 2>$null
        Write-Host " [OK]" -ForegroundColor Green
    } catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        $failed += $secret.Key
    }
}

if ($failed.Count -gt 0) {
    Write-Host "`n[WARNING] Failed to set the following secrets:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
} else {
    Write-Host "`n[SUCCESS] All secrets deployed successfully!" -ForegroundColor Green
}