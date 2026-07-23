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

$PayloadRoot = Join-Path $Here "payload"
$NavbarPath = Join-Path $ProjectRoot "components\landing\Navbar.tsx"
$LevelStatsPath = Join-Path $ProjectRoot "components\employees\LevelCapacityStats.tsx"
$NextCache = Join-Path $ProjectRoot ".next"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Ensure-Parent([string]$Path) {
    $Parent = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $Parent)) {
        New-Item -ItemType Directory -Path $Parent -Force | Out-Null
    }
}

function Copy-Payload([string]$RelativePath) {
    $Source = Join-Path $PayloadRoot $RelativePath
    $Target = Join-Path $ProjectRoot $RelativePath

    if (-not (Test-Path -LiteralPath $Source)) {
        throw "Missing payload file: $RelativePath"
    }

    Ensure-Parent $Target
    Copy-Item -LiteralPath $Source -Destination $Target -Force
}

Write-Host ""
Write-Host "Installing public employee card and level colors..." -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot" -ForegroundColor DarkGray

if (Test-Path -LiteralPath $LevelStatsPath) {
    Copy-Item -LiteralPath $LevelStatsPath -Destination "$LevelStatsPath.before-level-colors.bak" -Force
}

Copy-Payload "app\api\public-employee\route.ts"
Copy-Payload "app\employee-card\page.tsx"
Copy-Payload "components\employees\LevelCapacityStats.tsx"

if (-not (Test-Path -LiteralPath $NavbarPath)) {
    throw "Navbar.tsx was not found."
}

$Navbar = [System.IO.File]::ReadAllText(
    $NavbarPath,
    [System.Text.Encoding]::UTF8
)

if (-not $Navbar.Contains("/employee-card")) {
    Copy-Item -LiteralPath $NavbarPath -Destination "$NavbarPath.before-public-card.bak" -Force

    $EntryBytes = [System.Convert]::FromBase64String("ICB7CiAgICB0aXRsZTogItio2LfYp9mC2KrZiiIsCiAgICBocmVmOiAiL2VtcGxveWVlLWNhcmQiLAogIH0sCg==")
    $Entry = [System.Text.Encoding]::UTF8.GetString($EntryBytes)
    $Pattern = '(?s)(const\s+links\s*=\s*\[)(.*?)(\r?\n\];)'
    $Match = [regex]::Match($Navbar, $Pattern)

    if (-not $Match.Success) {
        throw "Could not find the public navbar links array."
    }

    $Replacement =
        $Match.Groups[1].Value +
        $Match.Groups[2].Value.TrimEnd() +
        "`r`n" +
        $Entry.TrimEnd() +
        $Match.Groups[3].Value

    $Navbar =
        $Navbar.Substring(0, $Match.Index) +
        $Replacement +
        $Navbar.Substring($Match.Index + $Match.Length)

    [System.IO.File]::WriteAllText(
        $NavbarPath,
        $Navbar,
        $Utf8NoBom
    )
}

$VerifyNavbar = [System.IO.File]::ReadAllText(
    $NavbarPath,
    [System.Text.Encoding]::UTF8
)

if (-not $VerifyNavbar.Contains("/employee-card")) {
    throw "Verification failed: public card link is missing."
}

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "app\employee-card\page.tsx"))) {
    throw "Verification failed: public employee card page is missing."
}

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "app\api\public-employee\route.ts"))) {
    throw "Verification failed: public employee API is missing."
}

if (Test-Path -LiteralPath $NextCache) {
    Remove-Item -LiteralPath $NextCache -Recurse -Force
}

Write-Host ""
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host "Public card: http://localhost:3000/employee-card" -ForegroundColor Green
Write-Host "Level cards now use a different color for every level." -ForegroundColor Green
Write-Host ""
Write-Host "Run:" -ForegroundColor Yellow
Write-Host "cd `"$ProjectRoot`""
Write-Host "npm run dev"
Write-Host ""
