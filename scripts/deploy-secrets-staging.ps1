# scripts/deploy-secrets-staging.ps1
# This is a convenience wrapper for the staging environment
& "$PSScriptRoot\deploy-secrets.ps1" -Environment "staging"