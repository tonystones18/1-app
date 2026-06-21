$ErrorActionPreference = "Stop"

$requiredPaths = @(
  "apps/backoffice",
  "apps/operator-portal",
  "apps/agent-portal",
  "apps/affiliate-portal",
  "apps/player-web",
  "apps/mobile-app",
  "apps/white-label-builder",
  "apps/media-center",
  "apps/ai-copilot",
  "services/api-gateway",
  "services/aggregator-service",
  "services/routing-service",
  "services/identity-service",
  "services/media-service",
  "packages/shared-types",
  "packages/permissions",
  "packages/audit",
  "packages/auth",
  "infrastructure/kubernetes/base",
  "infrastructure/terraform",
  "infrastructure/cloudflare",
  "database/prisma",
  "docs/architecture",
  "tests/unit",
  "tools"
)

$missing = @()
foreach ($path in $requiredPaths) {
  if (-not (Test-Path -LiteralPath $path)) {
    $missing += $path
  }
}

if ($missing.Count -gt 0) {
  Write-Error ("Missing required Phase 0 paths:`n" + ($missing -join "`n"))
}

Write-Host "Phase 0 workspace structure OK"
