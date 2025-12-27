@echo off
REM Kill all Node.js processes and start fresh

echo.
echo ==========================================
echo   Cleaning up existing processes...
echo ==========================================
echo.

REM Kill all node processes
taskkill /F /IM node.exe 2>nul
if errorlevel 1 (
    echo No Node processes found running.
) else (
    echo Killed all Node.js processes.
)

timeout /t 2 /nobreak

echo.
echo ==========================================
echo   Starting all servers...
echo ==========================================
echo.

REM Change to backend directory
cd backend

REM Start Auth Server (Port 3001)
echo Starting Auth Server on port 3001...
start "Auth Server (3001)" cmd /k node auth-server.js
timeout /t 3 /nobreak

REM Start Timetable Server (Port 3000)
echo Starting Timetable Server on port 3000...
start "Timetable Server (3000)" cmd /k node server.js
timeout /t 3 /nobreak

REM Start Admin Server (Port 3002)
echo Starting Admin Server on port 3002...
start "Admin Server (3002)" cmd /k node admin-server.js
timeout /t 3 /nobreak

echo.
echo ==========================================
echo   All servers started!
echo ==========================================
echo.
echo Access your application:
echo   - Main:  http://localhost:3000
echo   - Admin: http://localhost:3000/admin_dashboard/admin.html
echo   - Auth API: http://localhost:3001
echo   - Admin API: http://localhost:3002
echo.
echo All three terminal windows should be open above.
echo.
pause
