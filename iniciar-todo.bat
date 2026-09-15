@echo off
echo ============================================================
echo   Iniciando Patagon Store (Backend Django + Frontend Vite)
echo ============================================================
echo.
echo 1. Iniciando Backend Django en http://127.0.0.1:8000 ...
start "Patagon Backend (Django)" cmd /k "call start-backend.bat"

echo 2. Iniciando Frontend Vite en http://localhost:5173 ...
start "Patagon Frontend (Vite)" cmd /k "call start-frontend.bat"

echo.
echo ============================================================
echo   Todo iniciado. Abre tu navegador en:
echo   http://localhost:5173
echo ============================================================
pause
