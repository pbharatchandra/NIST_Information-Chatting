@echo off
REM Start all three servers for NIST Information-Chatting

echo.
echo ==========================================
echo   NIST Information-Chatting - All Servers
echo ==========================================
echo.

REM Change to backend directory
cd backend

REM Start Auth Server (Port 3001)
echo Starting Auth Server on port 3001...
start "Auth Server (3001)" cmd /k node auth-server.js
timeout /t 2 /nobreak

REM Start Timetable Server (Port 3000)
echo Starting Timetable Server on port 3000...
start "Timetable Server (3000)" cmd /k node server.js
timeout /t 2 /nobreak

REM Start Admin Server (Port 3002)
echo Starting Admin Server on port 3002...
start "Admin Server (3002)" cmd /k node admin-server.js
timeout /t 2 /nobreak

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
