Write-Host "Installing 3D game packages..." -ForegroundColor Cyan
npm install three @react-three/fiber @react-three/drei
if ($LASTEXITCODE -ne 0) {
  Write-Host "Installation failed." -ForegroundColor Red
  exit $LASTEXITCODE
}
Write-Host "3D packages installed successfully." -ForegroundColor Green
Write-Host "Now run: npm run build" -ForegroundColor Yellow
