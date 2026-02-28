@echo off
echo ========================================
echo   DIPIA - Sistema de Diagnostico
echo ========================================
echo.
echo Iniciando servidor Flask (Backend)...
start "Backend Flask" cmd /k "venv\Scripts\activate && python app.py"
echo.
echo Esperando 3 segundos...
timeout /t 3 /nobreak >nul
echo.
echo Iniciando servidor Vite (Frontend)...
start "Frontend Vite" cmd /k "npm run dev"
echo.
echo ========================================
echo   Servidores iniciados!
echo   Backend: http://127.0.0.1:5000
echo   Frontend: http://localhost:3000
echo ========================================
pause


