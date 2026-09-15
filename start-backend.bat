@echo off
setlocal

echo ==============================================
echo   Iniciando Backend Django - Patagon Store
echo ==============================================

cd /d "%~dp0patagon-backend" || (
    echo ERROR: No se encontro la carpeta patagon-backend.
    pause
    exit /b 1
)

echo Verificando puerto 8000...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$con = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue; if ($con) { foreach ($c in $con) { Write-Host ('Liberando puerto 8000 previo (PID ' + $c.OwningProcess + ')...'); Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }"

if exist "venv\Scripts\python.exe" (
    echo Usando entorno virtual...
    call venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
) else (
    where py >nul 2>nul
    if "%ERRORLEVEL%" == "0" (
        echo Python no encontrado en venv. Usando py -3...
        py -3 manage.py runserver 127.0.0.1:8000
    ) else (
        echo ERROR: No se encontro Python ni un entorno virtual valido.
        pause
        exit /b 1
    )
)

pause
