@echo off
echo Installing VR 180 Platform Dependencies...
echo.

echo Installing root dependencies...
call npm install

echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Installation complete!
echo.
echo To start the platform:
echo   npm run dev
echo.
echo The platform will be available at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
pause
