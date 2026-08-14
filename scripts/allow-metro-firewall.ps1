# Run once in PowerShell as Administrator if Expo Go times out on LAN.
# Allows inbound TCP 8081 (Metro bundler) on private networks.
$ruleName = 'Expo Metro 8081'
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Firewall rule already exists: $ruleName"
  exit 0
}
New-NetFirewallRule -DisplayName $ruleName `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 8081 `
  -Profile Private,Domain
Write-Host "Added firewall rule: $ruleName (Private + Domain networks)"
