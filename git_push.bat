@echo off
setlocal enabledelayedexpansion

REM 1. Set working directory to script location
cd /d "%~dp0"

REM 2. Set console code page to UTF-8
chcp 65001 >nul 2>&1

title [AhBiYout] GitHub Auto Sync and Push Script (v1.5.0)

REM -----------------------------------------------------------------------------
REM 3. Determine Execution Mode (Root Web Workspace vs Core Dedicated Folder)
REM -----------------------------------------------------------------------------
if exist "%~dp0package.json" goto :MENU_ROOT_MODE
goto :RUN_CORE_ISOLATED_PUSH

:MENU_ROOT_MODE
echo ===============================================================================
echo  GitHub Repository Push Mode Selection
echo  Repository: https://github.com/AhBiYout-all/windows-disk-cleanup-builder
echo  Developer:  AhBiYout [GitHub: AhBiYout-all]
echo  Version:    v1.5.0
echo ===============================================================================
echo.
echo  [1] Push pure DiskCleanupAuto desktop app only [RECOMMENDED]
echo      Target: DiskCleanupAuto_v1.5.0_Core folder contents
echo      Result: Root of GitHub repo contains only desktop GUI and builder files
echo.
echo  [2] Push full integrated project
echo      Target: Entire project [React and Vite web source included]
echo.
set "PUSH_CHOICE=1"
set /p "PUSH_CHOICE=Enter choice [Default: 1]: "
if "!PUSH_CHOICE!"=="" set "PUSH_CHOICE=1"

if "!PUSH_CHOICE!"=="1" goto :ENTER_CORE_MODE
goto :RUN_FULL_PROJECT_PUSH

:ENTER_CORE_MODE
echo.
echo [INFO] Entering DiskCleanupAuto_v1.5.0_Core dedicated push mode...
if exist "%~dp0export_core_files.py" (
    echo  - Syncing core files...
    call python "%~dp0export_core_files.py" >nul 2>&1
)
if exist "%~dp0DiskCleanupAuto_v1.5.0_Core" goto :CD_CORE_FOLDER
echo [ERROR] DiskCleanupAuto_v1.5.0_Core folder not found!
pause
exit /b 1

:CD_CORE_FOLDER
cd /d "%~dp0DiskCleanupAuto_v1.5.0_Core"
goto :RUN_CORE_ISOLATED_PUSH

REM -----------------------------------------------------------------------------
REM Mode 2: Full Integrated Project Push
REM -----------------------------------------------------------------------------
:RUN_FULL_PROJECT_PUSH
echo.
echo ===============================================================================
echo  [Integrated Mode] Pushing full project to GitHub...
echo ===============================================================================
where git >nul 2>&1
if errorlevel 1 goto :GIT_NOT_FOUND

if not exist "%~dp0.git" (
    echo [INFO] Initializing Git repository...
    git init
    if errorlevel 1 goto :GIT_INIT_FAILED
)

git config user.name "AhBiYout"
git config user.email "AhBiYout-all@users.noreply.github.com"

git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin https://github.com/AhBiYout-all/windows-disk-cleanup-builder.git
) else (
    git remote set-url origin https://github.com/AhBiYout-all/windows-disk-cleanup-builder.git
)

if exist "%~dp0export_core_files.py" (
    call python "%~dp0export_core_files.py" >nul 2>&1
)

git add .
git status --short

git diff --cached -- ":(exclude)*.bat" ":(exclude)*codeGenerators.ts" ":(exclude)*export_core_files.py" | findstr /v /i /c:"findstr" | findstr /i /c:"@gmail.com" /c:"@naver.com" /c:"@daum.net" /c:"@kakao.com" >nul 2>&1
if errorlevel 1 goto :SKIP_FULL_EMAIL_ALERT
color 0C
echo [WARNING] Private email pattern detected in staged changes! Aborting push.
pause
exit /b 1

:SKIP_FULL_EMAIL_ALERT
set "DEFAULT_MSG=chore(release): v1.5.0 full project sync"
set /p "USER_MSG=Enter commit message [Default: %DEFAULT_MSG%]: "
if "!USER_MSG!"=="" set "USER_MSG=%DEFAULT_MSG%"
git commit -m "!USER_MSG!"
git tag -fa "v1.5.0" -m "Release v1.5.0"
git branch -M main 2>nul
git push -u origin main
if errorlevel 1 git push -u origin master
git push origin "v1.5.0" --force

color 0A
echo [SUCCESS] Full project pushed to GitHub!
pause
exit /b 0

REM -----------------------------------------------------------------------------
REM Mode 1: Pure Desktop App Core Isolated Push Mode (Option B)
REM -----------------------------------------------------------------------------
:RUN_CORE_ISOLATED_PUSH
echo ===============================================================================
echo  DiskCleanupAuto v1.5.0 Core Dedicated GitHub Push Utility
echo  [Option B] Pure Desktop App Dedicated Repository Deployment
echo.
echo  Working Folder: %CD%
echo  Repository:     https://github.com/AhBiYout-all/windows-disk-cleanup-builder
echo  Developer:      AhBiYout
echo  Version:        v1.5.0
echo ===============================================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :GIT_NOT_FOUND

if exist .git goto :CORE_GIT_READY
echo [INFO] Initializing dedicated Git repository in core folder...
git init
if errorlevel 1 goto :GIT_INIT_FAILED
echo  - [OK] Dedicated Git repository initialized.
echo.

:CORE_GIT_READY
echo [1/5] Verifying GitHub author settings...
git config user.name "AhBiYout"
git config user.email "AhBiYout-all@users.noreply.github.com"
echo  - Author: AhBiYout
echo  - Email:  AhBiYout-all@users.noreply.github.com
echo.

echo [2/5] Checking remote origin...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin https://github.com/AhBiYout-all/windows-disk-cleanup-builder.git
) else (
    git remote set-url origin https://github.com/AhBiYout-all/windows-disk-cleanup-builder.git
)
echo  - Remote: https://github.com/AhBiYout-all/windows-disk-cleanup-builder.git
echo.

echo [3/5] Staging core desktop files only...
git add .
git status --short
echo.

echo [4/5] Pre-scanning for sensitive data...
git diff --cached -- ":(exclude)*.bat" | findstr /v /i /c:"findstr" | findstr /i /c:"@gmail.com" /c:"@naver.com" /c:"@daum.net" /c:"@kakao.com" >nul 2>&1
if errorlevel 1 goto :SKIP_CORE_EMAIL_ALERT
color 0C
echo ===============================================================================
echo [WARNING] Private email pattern detected in staged files! Aborting push.
echo ===============================================================================
pause
exit /b 1

:SKIP_CORE_EMAIL_ALERT
echo  - Pre-scan passed: No sensitive email found.
echo.

echo [5/5] Creating commit...
set "DEFAULT_MSG=feat(core): DiskCleanupAuto v1.5.0 pure desktop app deployment"
set /p "USER_MSG=Enter commit message [Default: %DEFAULT_MSG%]: "
if "!USER_MSG!"=="" set "USER_MSG=%DEFAULT_MSG%"

git commit -m "!USER_MSG!"
if errorlevel 1 echo [INFO] Working tree clean or already committed.

git tag -fa "v1.5.0" -m "Release v1.5.0 DiskCleanupAuto Core"
echo  - Version tag v1.5.0 updated.
echo.

echo ===============================================================================
echo  Force-pushing core desktop files to replace remote repository...
echo  - Note: Remote top-level web files will be replaced cleanly with core files
echo ===============================================================================
git branch -M main 2>nul
git push -u origin main --force
if errorlevel 1 goto :TRY_MASTER_PUSH
goto :PUSH_TAG_RELEASE

:TRY_MASTER_PUSH
color 0E
echo [INFO] main branch push returned status, trying master branch...
git push -u origin master --force

:PUSH_TAG_RELEASE
echo.
echo  - Force-pushing version tag v1.5.0 to trigger GitHub Actions release...
git push origin "v1.5.0" --force
echo.

color 0A
echo ===============================================================================
echo [SUCCESS] Pure DiskCleanupAuto desktop files pushed to GitHub repository root!
echo Repository: https://github.com/AhBiYout-all/windows-disk-cleanup-builder
echo Actions:    https://github.com/AhBiYout-all/windows-disk-cleanup-builder/actions
echo Releases:   https://github.com/AhBiYout-all/windows-disk-cleanup-builder/releases
echo ===============================================================================
echo.
pause
exit /b 0

REM -----------------------------------------------------------------------------
REM Error Handling Labels
REM -----------------------------------------------------------------------------
:GIT_NOT_FOUND
color 0C
echo [ERROR] Git is not installed or not found in PATH!
echo Please download and install Git from https://git-scm.com/
pause
exit /b 1

:GIT_INIT_FAILED
color 0C
echo [ERROR] git init command failed!
pause
exit /b 1
