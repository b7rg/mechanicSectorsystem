$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Installing Ali Hanish Workshop..." -ForegroundColor Cyan

$project = Get-Location

$oldPaths = @(
  "app\challenge",
  "app\challenge-tow",
  "components\game\AliHanishChallenge.tsx",
  "components\game\EngineWorkshop3D.tsx",
  "public\game\ali-hanish-engine-bay.png",
  "public\game\ali-hanish-tow-prototype.html",
  "public\models\ali-hanish-engine.glb"
)

foreach ($path in $oldPaths) {
  $full = Join-Path $project $path
  if (Test-Path $full) {
    Remove-Item $full -Recurse -Force
    Write-Host "Removed: $path" -ForegroundColor DarkGray
  }
}

Write-Host ""
Write-Host "The new workshop files are already in place." -ForegroundColor Green
Write-Host "Run: npm run dev" -ForegroundColor Yellow
Write-Host "Open: http://localhost:3000/workshop" -ForegroundColor Yellow
