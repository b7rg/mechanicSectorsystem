$ErrorActionPreference = "Stop"

$projectRoot = Get-Location
$navbarPath = Join-Path $projectRoot "components\landing\Navbar.tsx"
$sidebarPath = Join-Path $projectRoot "components\dashboard\Sidebar.tsx"
$workshopPage = Join-Path $projectRoot "app\workshop\page.tsx"
$workshopGame = Join-Path $projectRoot "public\game\ali-hanish-workshop.html"
$nextCache = Join-Path $projectRoot ".next"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Utf8([string]$Path) {
  return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Backup-Source([string]$Path) {
  $backupPath = "$Path.before-workshop-link.bak"
  Copy-Item -LiteralPath $Path -Destination $backupPath -Force
  Write-Host "Backup created: $backupPath" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Adding Ali Hanish Workshop links..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path -LiteralPath $navbarPath)) {
  throw "Navbar file was not found: components\landing\Navbar.tsx"
}

if (-not (Test-Path -LiteralPath $sidebarPath)) {
  throw "Sidebar file was not found: components\dashboard\Sidebar.tsx"
}

if (-not (Test-Path -LiteralPath $workshopPage)) {
  Write-Warning "The workshop page is missing: app\workshop\page.tsx"
}

if (-not (Test-Path -LiteralPath $workshopGame)) {
  Write-Warning "The workshop game file is missing: public\game\ali-hanish-workshop.html"
}

# Public navbar link
$navbar = Read-Utf8 $navbarPath

if ($navbar -notmatch 'href\s*:\s*"/workshop"') {
  Backup-Source $navbarPath

  $navbarEntry = @'
  {
    title: "ورشة علي حنش",
    href: "/workshop",
  },
'@

  $mapEntry = @'
  {
    title: "الخريطة الميدانية",
    href: "/map",
  },
'@

  if ($navbar.Contains($mapEntry)) {
    $navbar = $navbar.Replace($mapEntry, $navbarEntry + $mapEntry)
  }
  else {
    $navbarPattern = '(?s)(const\s+links\s*=\s*\[)(.*?)(\r?\n\];)'
    $navbarMatch = [regex]::Match($navbar, $navbarPattern)

    if (-not $navbarMatch.Success) {
      throw "Could not locate the links array inside Navbar.tsx"
    }

    $navbar = [regex]::Replace(
      $navbar,
      $navbarPattern,
      {
        param($match)

        $before = $match.Groups[1].Value
        $items = $match.Groups[2].Value.TrimEnd()
        $after = $match.Groups[3].Value

        return $before + $items + "`r`n" + $navbarEntry.TrimEnd() + $after
      },
      1
    )
  }

  Write-Utf8 $navbarPath $navbar
  Write-Host "Public navbar: added Ali Hanish Workshop." -ForegroundColor Green
}
else {
  Write-Host "Public navbar: the workshop link already exists." -ForegroundColor Yellow
}

# Dashboard sidebar link
$sidebar = Read-Utf8 $sidebarPath

if ($sidebar -notmatch 'href\s*:\s*"/workshop"') {
  Backup-Source $sidebarPath

  $sidebarEntry = @'
  {
    label: "ورشة علي حنش",
    href: "/workshop",
    permission: "dashboard",
    icon: Wrench,
  },
'@

  $settingsEntry = @'
  {
    label: "الإعدادات",
    href: "/dashboard/settings",
    permission: "settings",
    icon: Settings,
  },
'@

  if ($sidebar.Contains($settingsEntry)) {
    $sidebar = $sidebar.Replace($settingsEntry, $sidebarEntry + $settingsEntry)
  }
  else {
    $sidebarPattern = '(?s)(const\s+navigationItems\s*:\s*NavigationItem\[\]\s*=\s*\[)(.*?)(\r?\n\];)'
    $sidebarMatch = [regex]::Match($sidebar, $sidebarPattern)

    if (-not $sidebarMatch.Success) {
      throw "Could not locate navigationItems inside Sidebar.tsx"
    }

    $sidebar = [regex]::Replace(
      $sidebar,
      $sidebarPattern,
      {
        param($match)

        $before = $match.Groups[1].Value
        $items = $match.Groups[2].Value.TrimEnd()
        $after = $match.Groups[3].Value

        return $before + $items + "`r`n" + $sidebarEntry.TrimEnd() + $after
      },
      1
    )
  }

  Write-Utf8 $sidebarPath $sidebar
  Write-Host "Leadership sidebar: added Ali Hanish Workshop." -ForegroundColor Green
}
else {
  Write-Host "Leadership sidebar: the workshop link already exists." -ForegroundColor Yellow
}

if (Test-Path -LiteralPath $nextCache) {
  Remove-Item -LiteralPath $nextCache -Recurse -Force
  Write-Host "Next.js cache cleared." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "Run: npm run dev" -ForegroundColor Yellow
Write-Host "Open: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
