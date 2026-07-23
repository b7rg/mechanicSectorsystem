$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\Gaida Alharbi\OneDrive\Desktop\MSS"

if (-not (Test-Path -LiteralPath $projectRoot)) {
  throw "لم يتم العثور على مشروع MSS في المسار المتوقع."
}

$layoutPath = Join-Path $projectRoot "app\layout.tsx"
$componentSource = Join-Path $PSScriptRoot "components\workshop\WorkshopLauncher.tsx"
$componentTarget = Join-Path $projectRoot "components\workshop\WorkshopLauncher.tsx"
$pageSource = Join-Path $PSScriptRoot "app\workshop\page.tsx"
$pageTarget = Join-Path $projectRoot "app\workshop\page.tsx"
$gameSource = Join-Path $PSScriptRoot "public\game\ali-hanish-workshop.html"
$gameTarget = Join-Path $projectRoot "public\game\ali-hanish-workshop.html"
$nextPath = Join-Path $projectRoot ".next"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Ensure-Parent([string]$Path) {
  $parent = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
}

function Read-Utf8([string]$Path) {
  return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

Write-Host ""
Write-Host "تركيب ورشة علي حنش وإظهارها للجميع..." -ForegroundColor Cyan

if (-not (Test-Path -LiteralPath $layoutPath)) {
  throw "لم يتم العثور على app\layout.tsx"
}

Ensure-Parent $componentTarget
Ensure-Parent $pageTarget
Ensure-Parent $gameTarget

Copy-Item -LiteralPath $componentSource -Destination $componentTarget -Force
Copy-Item -LiteralPath $pageSource -Destination $pageTarget -Force
Copy-Item -LiteralPath $gameSource -Destination $gameTarget -Force

$layout = Read-Utf8 $layoutPath

if ($layout -notmatch 'WorkshopLauncher') {
  Copy-Item -LiteralPath $layoutPath -Destination "$layoutPath.before-workshop-launcher.bak" -Force

  $importLine = 'import WorkshopLauncher from "@/components/workshop/WorkshopLauncher";'

  if ($layout -match '^\s*["'']use client["''];') {
    $layout = [regex]::Replace(
      $layout,
      '^(\s*["'']use client["''];\s*)',
      ('$1' + "`r`n" + $importLine + "`r`n"),
      1
    )
  } else {
    $layout = $importLine + "`r`n" + $layout
  }

  $bodyPattern = '<body\b[^>]*>'
  $bodyMatch = [regex]::Match($layout, $bodyPattern)

  if (-not $bodyMatch.Success) {
    throw "تعذر العثور على وسم body داخل app\layout.tsx"
  }

  $injectedBody = $bodyMatch.Value + "`r`n        <WorkshopLauncher />"
  $layout =
    $layout.Substring(0, $bodyMatch.Index) +
    $injectedBody +
    $layout.Substring($bodyMatch.Index + $bodyMatch.Length)

  Write-Utf8 $layoutPath $layout
  Write-Host "تم ربط زر الورشة داخل Root Layout." -ForegroundColor Green
} else {
  Write-Host "زر الورشة موجود مسبقًا داخل Root Layout." -ForegroundColor Yellow
}

$check = Read-Utf8 $layoutPath

if ($check -notmatch 'WorkshopLauncher' -or $check -notmatch '<WorkshopLauncher\s*/>') {
  throw "فشل التحقق من إضافة زر الورشة."
}

if (-not (Test-Path -LiteralPath $pageTarget)) {
  throw "فشل نسخ صفحة الورشة."
}

if (-not (Test-Path -LiteralPath $gameTarget)) {
  throw "فشل نسخ ملف اللعبة."
}

if (Test-Path -LiteralPath $nextPath) {
  Remove-Item -LiteralPath $nextPath -Recurse -Force
}

Write-Host ""
Write-Host "تم بنجاح: زر ورشة علي حنش سيظهر أسفل يسار جميع صفحات الموقع." -ForegroundColor Green
Write-Host "العموم والقيادات والمشرفون سيشاهدونه لأن Root Layout يغلف الموقع كاملًا." -ForegroundColor Green
Write-Host ""
Write-Host "شغلي الآن:" -ForegroundColor Yellow
Write-Host 'cd "C:\Users\Gaida Alharbi\OneDrive\Desktop\MSS"'
Write-Host "npm run dev"
Write-Host ""
