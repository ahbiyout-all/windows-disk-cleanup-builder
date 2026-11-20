@echo off
setlocal

:: ===============================================================================
:: Windows Disk Cleanup Auto Scheduler Registration Script (v1.5.0)
:: Developer: AhBiYout | Copyright (c) 2026 AhBiYout. All rights reserved.
:: Official Blog: https://ahbiyoutvibe.blogspot.com/
:: ===============================================================================

title [AhBiYout] Disk Cleanup Auto Scheduler Registration

:: Check Administrator Privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Administrator privileges are required.
    echo Please right-click this script and select 'Run as administrator'.
    pause
    exit /b 1
)

set "TASK_NAME=DiskCleanupAuto"
set "APP_DIR=%~dp0"
set "EXE_PATH=%APP_DIR%DiskCleanupAuto.exe"

if not exist "%EXE_PATH%" (
    if exist "%APP_DIR%DiskCleanupAuto_v1.5.0.exe" (
        set "EXE_PATH=%APP_DIR%DiskCleanupAuto_v1.5.0.exe"
    ) else if exist "%APP_DIR%Release\DiskCleanupAuto_v1.5.0.exe" (
        set "EXE_PATH=%APP_DIR%Release\DiskCleanupAuto_v1.5.0.exe"
    ) else if exist "%APP_DIR%dist\DiskCleanupAuto.exe" (
        set "EXE_PATH=%APP_DIR%dist\DiskCleanupAuto.exe"
    )
)

if not exist "%EXE_PATH%" (
    echo [ERROR] DiskCleanupAuto executable not found!
    echo Checked: "%APP_DIR%DiskCleanupAuto.exe" and "%APP_DIR%Release\DiskCleanupAuto_v1.5.0.exe"
    pause
    exit /b 1
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
