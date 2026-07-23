$ErrorActionPreference = "Stop"

$defaultProject = "C:\Users\Gaida Alharbi\OneDrive\Desktop\MSS"
$projectRoot = if (Test-Path -LiteralPath $defaultProject) {
  $defaultProject
} else {
  (Get-Location).Path
}

$navbarPath = Join-Path $projectRoot "components\landing\Navbar.tsx"
$sidebarPath = Join-Path $projectRoot "components\dashboard\Sidebar.tsx"
$workshopPage = Join-Path $projectRoot "app\workshop\page.tsx"
$workshopHtml = Join-Path $projectRoot "public\game\ali-hanish-workshop.html"
$nextPath = Join-Path $projectRoot ".next"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Text([string]$Path) {
  return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Write-Text([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Backup-File([string]$Path) {
  $backup = "$Path.workshop-backup"
  Copy-Item -LiteralPath $Path -Destination $backup -Force
  Write-Host "Backup: $backup" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Project: $projectRoot" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path -LiteralPath $workshopPage)) {
  throw "Missing workshop page: app\workshop\page.tsx"
}

if (-not (Test-Path -LiteralPath $workshopHtml)) {
  throw "Missing workshop game file: public\game\ali-hanish-workshop.html"
}

if (-not (Test-Path -LiteralPath $navbarPath)) {
  throw "Missing Navbar.tsx at components\landing\Navbar.tsx"
}

if (-not (Test-Path -LiteralPath $sidebarPath)) {
  throw "Missing Sidebar.tsx at components\dashboard\Sidebar.tsx"
}

# ---------------- Public navbar ----------------
$navbar = Read-Text $navbarPath

if ($navbar -notmatch 'href\s*:\s*["'']/workshop["'']') {
  Backup-File $navbarPath

  $entry = @'
  {
    title: "ورشة علي حنش",
    href: "/workshop",
  },
'@

  $pattern = '(?s)(const\s+links\s*=\s*\[)(.*?)(\r?\n\];)'
  $match = [regex]::Match($navbar, $pattern)

  if (-not $match.Success) {
    throw "Could not find const links = [...] inside Navbar.tsx"
  }

  $replacement =
    $match.Groups[1].Value +
    $match.Groups[2].Value.TrimEnd() +
    "`r`n" +
    $entry.TrimEnd() +
    $match.Groups[3].Value

  $navbar =
    $navbar.Substring(0, $match.Index) +
    $replacement +
    $navbar.Substring($match.Index + $match.Length)

  Write-Text $navbarPath $navbar
  Write-Host "Added workshop to the PUBLIC navbar." -ForegroundColor Green
} else {
  Write-Host "Public navbar link already exists." -ForegroundColor Yellow
}

# ---------------- Dashboard sidebar ----------------
$sidebar = Read-Text $sidebarPath

if ($sidebar -notmatch 'href\s*:\s*["'']/workshop["'']') {
  Backup-File $sidebarPath

  $entry = @'
  {
    label: "ورشة علي حنش",
    href: "/workshop",
    permission: "dashboard",
    icon: Wrench,
  },
'@

  $pattern = '(?s)(const\s+navigationItems\s*:\s*NavigationItem\[\]\s*=\s*\[)(.*?)(\r?\n\];)'
  $match = [regex]::Match($sidebar, $pattern)

  if (-not $match.Success) {
    throw "Could not find navigationItems inside Sidebar.tsx"
  }

  $replacement =
    $match.Groups[1].Value +
    $match.Groups[2].Value.TrimEnd() +
    "`r`n" +
    $entry.TrimEnd() +
    $match.Groups[3].Value

  $sidebar =
    $sidebar.Substring(0, $match.Index) +
    $replacement +
    $sidebar.Substring($match.Index + $match.Length)

  Write-Text $sidebarPath $sidebar
  Write-Host "Added workshop to the LEADERSHIP sidebar." -ForegroundColor Green
} else {
  Write-Host "Leadership sidebar link already exists." -ForegroundColor Yellow
}

# ---------------- Verification ----------------
$navbarCheck = Read-Text $navbarPath
$sidebarCheck = Read-Text $sidebarPath

if ($navbarCheck -notmatch 'href\s*:\s*["'']/workshop["'']') {
  throw "Verification failed: public navbar link was not added."
}

if ($sidebarCheck -notmatch 'href\s*:\s*["'']/workshop["'']') {
  throw "Verification failed: dashboard sidebar link was not added."
}

if (Test-Path -LiteralPath $nextPath) {
  Remove-Item -LiteralPath $nextPath -Recurse -Force
  Write-Host "Cleared .next cache." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "SUCCESS: Workshop is linked for public visitors and leadership." -ForegroundColor Green
Write-Host "Now run:" -ForegroundColor Yellow
Write-Host "cd `"$projectRoot`""
Write-Host "npm run dev"
Write-Host ""
Write-Host "Open:" -ForegroundColor Yellow
Write-Host "http://localhost:3000"
Write-Host "http://localhost:3000/workshop"
Write-Host ""
