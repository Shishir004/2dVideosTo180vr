@echo off
echo Installing VR 180 Platform - Express Only Version
echo.

echo [1/3] Installing root Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Installing frontend dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ All dependencies installed successfully!
echo.
echo Python service removed - using Express.js only
echo.
echo To start the platform:
echo   start_all_services.bat
echo.
echo Services will run on:
echo   - Express Backend: http://localhost:5000
echo   - React Frontend: http://localhost:3000
echo.
echo Processing features:
echo   - Fast FFmpeg video processing
echo   - Real-time depth estimation
echo   - Stereoscopic VR 180 conversion
echo.
pause
