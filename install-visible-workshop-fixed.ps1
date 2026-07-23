$ErrorActionPreference = "Stop"

$ExpectedProject = "C:\Users\Gaida Alharbi\OneDrive\Desktop\MSS"
$Here = $PSScriptRoot

if (Test-Path -LiteralPath (Join-Path $Here "app\layout.tsx")) {
    $ProjectRoot = $Here
}
elseif (Test-Path -LiteralPath (Join-Path $ExpectedProject "app\layout.tsx")) {
    $ProjectRoot = $ExpectedProject
}
else {
    throw "MSS project was not found. Put this installer inside the MSS folder."
}

$PayloadRoot = Join-Path $Here "payload"
$LayoutPath = Join-Path $ProjectRoot "app\layout.tsx"
$LauncherSource = Join-Path $PayloadRoot "components\workshop\WorkshopLauncher.tsx"
$LauncherTarget = Join-Path $ProjectRoot "components\workshop\WorkshopLauncher.tsx"
$PageSource = Join-Path $PayloadRoot "app\workshop\page.tsx"
$PageTarget = Join-Path $ProjectRoot "app\workshop\page.tsx"
$GameSource = Join-Path $PayloadRoot "public\game\ali-hanish-workshop.html"
$GameTarget = Join-Path $ProjectRoot "public\game\ali-hanish-workshop.html"
$NextCache = Join-Path $ProjectRoot ".next"

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Ensure-ParentFolder([string]$Path) {
    $Parent = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $Parent)) {
        New-Item -ItemType Directory -Path $Parent -Force | Out-Null
    }
}

function Copy-PayloadFile([string]$Source, [string]$Target) {
    if (-not (Test-Path -LiteralPath $Source)) {
        throw "Payload file is missing: $Source"
    }

    Ensure-ParentFolder $Target
    Copy-Item -LiteralPath $Source -Destination $Target -Force
}

Write-Host ""
Write-Host "Installing Ali Hanish Workshop..." -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot" -ForegroundColor DarkGray

Copy-PayloadFile $LauncherSource $LauncherTarget
Copy-PayloadFile $PageSource $PageTarget
Copy-PayloadFile $GameSource $GameTarget

$Layout = [System.IO.File]::ReadAllText(
    $LayoutPath,
    [System.Text.Encoding]::UTF8
)

$ImportLine = 'import WorkshopLauncher from "@/components/workshop/WorkshopLauncher";'
$LauncherTag = '<WorkshopLauncher />'

if (-not $Layout.Contains("WorkshopLauncher")) {
    Copy-Item -LiteralPath $LayoutPath -Destination "$LayoutPath.before-workshop.bak" -Force

    $Lines = New-Object System.Collections.Generic.List[string]
    [string[]]$OriginalLines = [System.IO.File]::ReadAllLines(
        $LayoutPath,
        [System.Text.Encoding]::UTF8
    )

    foreach ($Line in $OriginalLines) {
        $Lines.Add($Line)
    }

    $FirstCodeLine = -1

    for ($Index = 0; $Index -lt $Lines.Count; $Index++) {
        if (-not [string]::IsNullOrWhiteSpace($Lines[$Index])) {
            $FirstCodeLine = $Index
            break
        }
    }

    if ($FirstCodeLine -ge 0) {
        $FirstText = $Lines[$FirstCodeLine].Trim()

        if (
            $FirstText.StartsWith('"use client"') -or
            $FirstText.StartsWith("'use client'")
        ) {
            $Lines.Insert($FirstCodeLine + 1, $ImportLine)
        }
        else {
            $Lines.Insert(0, $ImportLine)
        }
    }
    else {
        $Lines.Add($ImportLine)
    }

    $Layout = [string]::Join([Environment]::NewLine, $Lines)

    if (-not $Layout.Contains("</body>")) {
        throw "The closing body tag was not found in app\layout.tsx."
    }

    $Layout = $Layout.Replace(
        "</body>",
        "        $LauncherTag`r`n      </body>"
    )

    [System.IO.File]::WriteAllText(
        $LayoutPath,
        $Layout,
        $Utf8NoBom
    )
}
else {
    Write-Host "Workshop launcher already exists in app\layout.tsx." -ForegroundColor Yellow
}

$VerifyLayout = [System.IO.File]::ReadAllText(
    $LayoutPath,
    [System.Text.Encoding]::UTF8
)

if (-not $VerifyLayout.Contains($ImportLine)) {
    throw "Verification failed: launcher import is missing."
}

if (-not $VerifyLayout.Contains($LauncherTag)) {
    throw "Verification failed: launcher component is missing from body."
}

if (-not (Test-Path -LiteralPath $PageTarget)) {
    throw "Verification failed: workshop page is missing."
}

if (-not (Test-Path -LiteralPath $GameTarget)) {
    throw "Verification failed: workshop game file is missing."
}

if (Test-Path -LiteralPath $NextCache) {
    Remove-Item -LiteralPath $NextCache -Recurse -Force
}

Write-Host ""
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host "The workshop button is now installed in the root layout." -ForegroundColor Green
Write-Host ""
Write-Host "Run these commands:" -ForegroundColor Yellow
Write-Host "cd `"$ProjectRoot`""
Write-Host "npm run dev"
Write-Host ""
