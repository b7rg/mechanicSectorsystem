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
$ApiTarget = Join-Path $ProjectRoot "app\api\public-employee\route.ts"
$PageTarget = Join-Path $ProjectRoot "app\employee-card\page.tsx"
$CodesPath = Join-Path $ProjectRoot "lib\employeeCodes.ts"
$NextCache = Join-Path $ProjectRoot ".next"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Ensure-Parent([string]$Path) {
    $Parent = Split-Path -Parent $Path

    if (-not (Test-Path -LiteralPath $Parent)) {
        New-Item -ItemType Directory -Path $Parent -Force | Out-Null
    }
}

function Copy-Payload([string]$RelativePath, [string]$Target) {
    $Source = Join-Path $PayloadRoot $RelativePath

    if (-not (Test-Path -LiteralPath $Source)) {
        throw "Missing payload file: $RelativePath"
    }

    Ensure-Parent $Target
    Copy-Item -LiteralPath $Source -Destination $Target -Force
}

Write-Host ""
Write-Host "Installing employee classification update..." -ForegroundColor Cyan

if (Test-Path -LiteralPath $ApiTarget) {
    Copy-Item -LiteralPath $ApiTarget -Destination "$ApiTarget.before-classification-fix.bak" -Force
}

if (Test-Path -LiteralPath $PageTarget) {
    Copy-Item -LiteralPath $PageTarget -Destination "$PageTarget.before-classification-fix.bak" -Force
}

Copy-Payload "app\api\public-employee\route.ts" $ApiTarget
Copy-Payload "app\employee-card\page.tsx" $PageTarget

if (Test-Path -LiteralPath $CodesPath) {
    $Codes = [System.IO.File]::ReadAllText(
        $CodesPath,
        [System.Text.Encoding]::UTF8
    )

    $OldLabel = [System.Text.Encoding]::UTF8.GetString(
        [System.Convert]::FromBase64String("2YLZitin2K/YqSDZhdi52KrZhdiv2Kk=")
    )

    $NewLabel = [System.Text.Encoding]::UTF8.GetString(
        [System.Convert]::FromBase64String("2YXYs9ik2YjZhNmIINin2YTZhdi52KrZhdiv")
    )

    if ($Codes.Contains($OldLabel)) {
        Copy-Item -LiteralPath $CodesPath -Destination "$CodesPath.before-classification-fix.bak" -Force
        $Codes = $Codes.Replace($OldLabel, $NewLabel)

        [System.IO.File]::WriteAllText(
            $CodesPath,
            $Codes,
            $Utf8NoBom
        )
    }
}

if (Test-Path -LiteralPath $NextCache) {
    Remove-Item -LiteralPath $NextCache -Recurse -Force
}

Write-Host ""
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host "Certified code now displays with the main sector." -ForegroundColor Green
Write-Host "Certified leadership is labeled as Certified Officials." -ForegroundColor Green
Write-Host "A+ administration is labeled as Senior Administration." -ForegroundColor Green
Write-Host ""
Write-Host "Run:" -ForegroundColor Yellow
Write-Host "cd `"$ProjectRoot`""
Write-Host "npm run dev"
Write-Host ""
