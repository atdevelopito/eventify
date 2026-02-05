# Stop all Python processes (Flask backend servers)
Write-Host "Stopping all Python processes..." -ForegroundColor Yellow

Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

Start-Sleep -Seconds 2

Write-Host "All Python processes stopped!" -ForegroundColor Green
Write-Host ""
Write-Host "Now start your backend with:" -ForegroundColor Cyan
Write-Host "  cd c:\Users\Tashin Khan\Desktop\eventify\api" -ForegroundColor White
Write-Host "  py app.py" -ForegroundColor White
