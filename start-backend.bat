@echo off
setlocal
if not defined DJANGO_DEBUG set "DJANGO_DEBUG=true"

echo ==============================================
echo   Iniciando Backend Django - Patagon Store
echo ==============================================

cd /d "%~dp0patagon-backend" || (
    echo ERROR: No se encontro la carpeta patagon-backend.
    pause
    exit /b 1
)

if exist ".venv\Scripts\python.exe" (
    set "BACKEND_PYTHON=.venv\Scripts\python.exe"
) else (
    echo ERROR: Falta el entorno .venv. Consulta la instalacion del backend en README.md.
    pause
    exit /b 1
)

"%BACKEND_PYTHON%" --version
if errorlevel 1 goto backend_error
"%BACKEND_PYTHON%" manage.py check
if errorlevel 1 goto backend_error
"%BACKEND_PYTHON%" manage.py migrate --noinput
if errorlevel 1 goto backend_error
"%BACKEND_PYTHON%" manage.py ensure_admin
if errorlevel 1 echo Crea tu administrador con .venv\Scripts\python.exe manage.py createsuperuser.
"%BACKEND_PYTHON%" manage.py runserver 127.0.0.1:8000
goto backend_end

:backend_error
echo ERROR: El backend no supero las comprobaciones. Revisa el mensaje anterior.
pause
exit /b 1

:backend_end

pause
