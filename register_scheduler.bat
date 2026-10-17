@echo off
setlocal

:: ===============================================================================
:: Windows Disk Cleanup Auto Scheduler Registration Script (v1.5.0)
:: CISNET CORPORATION | Developer: AhBiYout
:: Website: http://www.cisnet.co.kr | Official: https://ahbiyoutvibe.blogspot.com/
:: ===============================================================================

title [CISNET] Disk Cleanup Auto Scheduler Registration

:: Check Administrator Privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Administrator privileges are required.
    echo Please right-click this script and select 'Run as administrator'.
    pause
    exit /b 1
)

set "TASK_NAME=CISNET_DiskCleanupAuto"
set "APP_DIR=%~dp0"
set "EXE_PATH=%APP_DIR%DiskCleanupAuto.exe"

if not exist "%EXE_PATH%" (
    set "EXE_PATH=%APP_DIR%dist\DiskCleanupAuto.exe"
)

echo ===============================================================================
echo   Registering Windows Task Scheduler Auto Cleanup Task
echo   Task Name : %TASK_NAME%
echo   Frequency : Weekly (Every Sunday at 03:00 AM)
echo ===============================================================================
echo.

:: Delete existing task if present
schtasks /query /tn "%TASK_NAME%" >nul 2>&1
if %errorlevel% equ 0 (
    echo [*] Removing previous scheduled task...
    schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1
)

:: Register new weekly scheduled task with Highest RunLevel (Admin)
schtasks /create /tn "%TASK_NAME%" /tr "\"%EXE_PATH%\"" /sc weekly /d SUN /st 03:00 /rl HIGHEST /f

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Scheduled task successfully registered!
    echo Task will automatically execute weekly on Sunday at 03:00 AM.
) else (
    echo.
    echo [WARNING] Failed to register scheduled task. Error code: %errorlevel%
)

echo.
pause
exit /b 0
