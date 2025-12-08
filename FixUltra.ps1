Write-Host "Start UltraFix..."

$root = "C:\Users\Administrador\pecuariatech"
$app = "$root\app"

# Ensure app folder exists
if (!(Test-Path $app)) {
    Write-Host "Creating app folder..."
    New-Item -ItemType Directory -Path $app | Out-Null
}

# Enforce correct file placement
$files = @("globals.css", "layout.tsx")

foreach ($f in $files) {
    $found = Get-ChildItem -Path $root -Recurse -Filter $f | Select-Object -ExpandProperty FullName

    foreach ($p in $found) {
        if ($p -notmatch "\\app\\") {
            Write-Host "Removing duplicate: $p"
            Remove-Item -Force $p
        } else {
            Write-Host "Correct file kept: $p"
        }
    }

    if (!(Test-Path "$app\$f")) {
        Write-Host "Creating missing file: $f"
        New-Item -ItemType File -Path "$app\$f" | Out-Null
    }
}

# Fix layout import
$layout = "$app\layout.tsx"
if (Test-Path $layout) {
    $content = Get-Content $layout

    if ($content.Length -eq 0 -or $content[0] -notmatch "import `"./globals.css`";") {
        Write-Host "Injecting import into layout.tsx"
        @('import "./globals.css";', '') + $content | Set-Content $layout
    } else {
        Write-Host "Import already OK"
    }
}

Write-Host "UltraFix done."
