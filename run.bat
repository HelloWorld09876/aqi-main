@echo off
cd /d "%~dp0"
echo ====================================================
echo      Starting AQI Monitoring System (Windows)
echo ====================================================

echo.
echo [1/4] Starting backend server in a new window...
start "AQI Backend Server" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo.
echo [2/4] Starting React dashboard in a new window...
start "AQI React Dashboard" /D "%~dp0dashboard-new" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo.
echo [3/4] Starting sensor simulator in a new window...
start "AQI Sensor Simulator" /D "%~dp0hardware-simulator" cmd /k "if exist ..\venv\Scripts\activate.bat (call ..\venv\Scripts\activate.bat) & python simulator.py"

timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting AI service in a new window...
start "AQI Edge AI Service" /D "%~dp0edge-ai" cmd /k "if exist ..\venv\Scripts\activate.bat (call ..\venv\Scripts\activate.bat) & python ai_service.py"

echo.
echo ====================================================
echo      All services launched! 
echo      Close the individual command windows to stop them.
echo ====================================================
