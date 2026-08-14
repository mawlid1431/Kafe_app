# Run as Administrator to allow Metro Bundler through Windows Firewall
# Right-click PowerShell → Run as Administrator, then run this script

$ports = @(8081, 8082, 19000, 19001, 19002)
$ruleName = "Expo Metro Bundler"

Write-Host "Adding Windows Firewall rules for Expo/Metro..." -ForegroundColor Cyan

foreach ($port in $ports) {
    $inboundRule = "$ruleName - Port $port (Inbound)"
    
    # Remove existing rules
    Remove-NetFirewallRule -DisplayName $inboundRule -ErrorAction SilentlyContinue
    
    # Add new rule
    New-NetFirewallRule -DisplayName $inboundRule `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $port `
        -Action Allow `
        -Profile Any `
        -Enabled True
    
    Write-Host "✓ Allowed port $port (Inbound)" -ForegroundColor Green
}

Write-Host "`nFirewall rules created successfully!" -ForegroundColor Green
Write-Host "Restart your dev server: bun run dev" -ForegroundColor Yellow
