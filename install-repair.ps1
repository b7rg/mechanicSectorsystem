$ErrorActionPreference = "Stop"

$KnownProject = "C:\Users\Gaida Alharbi\OneDrive\Desktop\MSS"
$Here = $PSScriptRoot

if (Test-Path -LiteralPath (Join-Path $Here "app\layout.tsx")) {
    $ProjectRoot = $Here
}
elseif (Test-Path -LiteralPath (Join-Path $KnownProject "app\layout.tsx")) {
    $ProjectRoot = $KnownProject
}
else {
    throw "MSS project was not found."
}

$Payload = Join-Path $Here "payload"
$NextCache = Join-Path $ProjectRoot ".next"

$Files = @(
    "app\employee-card\page.tsx",
    "app\api\public-employee\route.ts",
    "app\dashboard\employees\add\page.tsx",
    "app\dashboard\employees\[id]\edit\page.tsx",
    "lib\administration.ts",
    "lib\employeeCodes.ts"
)

Write-Host ""
Write-Host "Installing employee card and category repair..." -ForegroundColor Cyan

foreach ($RelativePath in $Files) {
    $Source = Join-Path $Payload $RelativePath
    $Target = Join-Path $ProjectRoot $RelativePath
    $Parent = Split-Path -Parent $Target

    if (-not (Test-Path -LiteralPath $Source)) {
        throw "Missing payload file: $RelativePath"
    }

    if (-not (Test-Path -LiteralPath $Parent)) {
        New-Item -ItemType Directory -Path $Parent -Force | Out-Null
    }

    if (Test-Path -LiteralPath $Target) {
        Copy-Item -LiteralPath $Target -Destination "$Target.before-category-repair.bak" -Force
    }

    Copy-Item -LiteralPath $Source -Destination $Target -Force
    Write-Host "Installed: $RelativePath" -ForegroundColor DarkGray
}

if (Test-Path -LiteralPath $NextCache) {
    Remove-Item -LiteralPath $NextCache -Recurse -Force
}

Write-Host ""
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host "Public card repaired." -ForegroundColor Green
Write-Host "Certified Officials option added." -ForegroundColor Green
Write-Host "Senior Administration A+ role added." -ForegroundColor Green
Write-Host ""
Write-Host "Run:" -ForegroundColor Yellow
Write-Host "cd `"$ProjectRoot`""
Write-Host "npm run dev"
Write-Host ""
