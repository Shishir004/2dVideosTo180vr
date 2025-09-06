@echo off
echo Starting VR 180 Platform - Express Only Version
echo.

echo [1/2] Starting Express Backend (Port 5000)...
start "VR180 Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo [2/2] Starting React Frontend (Port 3000)...
start "VR180 Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services started!
echo.
echo Services running:
echo   - Express Backend: http://localhost:5000
echo   - React Frontend: http://localhost:3000 (or 3001)
echo.
echo Python service removed - all processing now in Express.js
echo Processing will be faster with direct FFmpeg integration
echo.
pause
