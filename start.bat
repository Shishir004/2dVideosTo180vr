@echo off
echo Starting VR 180 Platform...
echo.

echo Starting backend server...
start "VR 180 Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting frontend development server (Vite)...
start "VR 180 Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo VR 180 Platform is starting up...
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5000
echo.
echo Press any key to close this window...
pause > nul
