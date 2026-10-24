@echo off
setlocal

cd /d "%~dp0"
set "SCRIPT_DIR=%~dp0"
set "RELEASE_DIR=%SCRIPT_DIR%Release"
set "DIST_DIR=%SCRIPT_DIR%dist"
set "BUILD_DIR=%SCRIPT_DIR%build"
set "SPEC_DIR=%SCRIPT_DIR%"

title [AhBiYout] Python to Portable Single EXE Auto Builder (v1.5.0)
color 0B

echo ===============================================================================
echo   [AhBiYout] DiskCleanupAuto EXE ^& Inno Setup Installer Builder (v1.5.0)
echo   Targets: DiskCleanupAuto_v1.5.0.exe ^& WindowsDiskCleanup_Setup_v1.5.0.exe
echo   Folder : %SCRIPT_DIR%
echo ===============================================================================
echo.

REM -------------------------------------------------------------------------------
REM Check if Python-native builder build_exe.py exists
REM -------------------------------------------------------------------------------
if exist "%SCRIPT_DIR%build_exe.py" goto :RUN_PY_BUILDER

REM -------------------------------------------------------------------------------
REM [1/6] Find Python Interpreter
REM -------------------------------------------------------------------------------
echo [1/6] Searching for Python interpreter...
set "PY_CMD="

call python -V >nul 2>&1
if %errorlevel% equ 0 set "PY_CMD=python"
if defined PY_CMD goto :FOUND_PYTHON

call py -V >nul 2>&1
if %errorlevel% equ 0 set "PY_CMD=py"
if defined PY_CMD goto :FOUND_PYTHON

if exist "%LocalAppData%\Programs\Python\Python314\python.exe" set "PY_CMD=%LocalAppData%\Programs\Python\Python314\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "%LocalAppData%\Programs\Python\Python313\python.exe" set "PY_CMD=%LocalAppData%\Programs\Python\Python313\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "%LocalAppData%\Programs\Python\Python312\python.exe" set "PY_CMD=%LocalAppData%\Programs\Python\Python312\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "%LocalAppData%\Programs\Python\Python311\python.exe" set "PY_CMD=%LocalAppData%\Programs\Python\Python311\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "%LocalAppData%\Programs\Python\Python310\python.exe" set "PY_CMD=%LocalAppData%\Programs\Python\Python310\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\Program Files\Python314\python.exe" set "PY_CMD=C:\Program Files\Python314\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\Program Files\Python313\python.exe" set "PY_CMD=C:\Program Files\Python313\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\Program Files\Python312\python.exe" set "PY_CMD=C:\Program Files\Python312\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\Program Files\Python311\python.exe" set "PY_CMD=C:\Program Files\Python311\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\Python314\python.exe" set "PY_CMD=C:\Python314\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\Python313\python.exe" set "PY_CMD=C:\Python313\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\Python312\python.exe" set "PY_CMD=C:\Python312\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\Python311\python.exe" set "PY_CMD=C:\Python311\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

color 0C
echo.
echo ===============================================================================
echo [ERROR] Python is not installed or not found on this computer!
echo ===============================================================================
echo 1. Download and install Python from: https://www.python.org/downloads/
echo 2. Make sure [Add python.exe to PATH] is checked during installation!
echo ===============================================================================
echo.
pause
exit /b 1

:FOUND_PYTHON
echo [OK] Python found: %PY_CMD%
call %PY_CMD% --version
echo.

REM -------------------------------------------------------------------------------
REM [2/6] Check / Install PyInstaller
REM -------------------------------------------------------------------------------
echo [2/6] Checking PyInstaller...
call %PY_CMD% -m pyinstaller --version >nul 2>&1
if %errorlevel% equ 0 goto :PYINSTALLER_OK

call pyinstaller --version >nul 2>&1
if %errorlevel% equ 0 goto :PYINSTALLER_OK

echo [*] PyInstaller not found. Installing via pip...
call %PY_CMD% -m pip install --upgrade pip
call %PY_CMD% -m pip install pyinstaller
if %errorlevel% neq 0 goto :ERR_PIP

:PYINSTALLER_OK
echo [OK] PyInstaller is ready.
echo.

REM -------------------------------------------------------------------------------
REM [3/6] Check Target Python Source File
REM -------------------------------------------------------------------------------
echo [3/6] Finding Python source file...
set "TARGET_PY="
set "TARGET_NAME="

if exist "%SCRIPT_DIR%disk_cleanup_gui.py" set "TARGET_PY=%SCRIPT_DIR%disk_cleanup_gui.py"
if exist "%SCRIPT_DIR%disk_cleanup_gui.py" set "TARGET_NAME=disk_cleanup_gui.py"
if defined TARGET_PY goto :FOUND_SOURCE

if exist "%SCRIPT_DIR%disk_cleanup.py" set "TARGET_PY=%SCRIPT_DIR%disk_cleanup.py"
if exist "%SCRIPT_DIR%disk_cleanup.py" set "TARGET_NAME=disk_cleanup.py"
if defined TARGET_PY goto :FOUND_SOURCE

if exist "%SCRIPT_DIR%disk_cleanup_deep.py" set "TARGET_PY=%SCRIPT_DIR%disk_cleanup_deep.py"
if exist "%SCRIPT_DIR%disk_cleanup_deep.py" set "TARGET_NAME=disk_cleanup_deep.py"
if defined TARGET_PY goto :FOUND_SOURCE

if exist "%SCRIPT_DIR%disk_cleanup_cli.py" set "TARGET_PY=%SCRIPT_DIR%disk_cleanup_cli.py"
if exist "%SCRIPT_DIR%disk_cleanup_cli.py" set "TARGET_NAME=disk_cleanup_cli.py"
if defined TARGET_PY goto :FOUND_SOURCE

if exist "%SCRIPT_DIR%main.py" set "TARGET_PY=%SCRIPT_DIR%main.py"
if exist "%SCRIPT_DIR%main.py" set "TARGET_NAME=main.py"
if defined TARGET_PY goto :FOUND_SOURCE

color 0C
echo.
echo ===============================================================================
echo [ERROR] Python source file (disk_cleanup_gui.py) not found!
echo Target folder: %SCRIPT_DIR%
echo ===============================================================================
echo.
pause
exit /b 1

:FOUND_SOURCE
echo [OK] Target script: %TARGET_NAME%
echo.

REM -------------------------------------------------------------------------------
REM [4/6] Compile to Single Standalone Portable EXE
REM -------------------------------------------------------------------------------
echo [4/6] Building portable EXE (DiskCleanupAuto_v1.5.0.exe)...
echo Please wait 15-30 seconds...
echo -------------------------------------------------------------------------------

set "ICON_PARAM="
if exist "%SCRIPT_DIR%app.ico" set "ICON_PARAM=--icon=%SCRIPT_DIR%app.ico"

set "VERSION_PARAM="
if exist "%SCRIPT_DIR%version_info.txt" set "VERSION_PARAM=--version-file=%SCRIPT_DIR%version_info.txt"

call %PY_CMD% -m pyinstaller --onefile --clean --name=DiskCleanupAuto_v1.5.0 --noconsole --uac-admin %ICON_PARAM% %VERSION_PARAM% --distpath "%DIST_DIR%" --workpath "%BUILD_DIR%" --specpath "%SPEC_DIR%" "%TARGET_PY%"
if %errorlevel% equ 0 goto :BUILD_OK

echo [*] Retrying with pyinstaller CLI...
call pyinstaller --onefile --clean --name=DiskCleanupAuto_v1.5.0 --noconsole --uac-admin %ICON_PARAM% %VERSION_PARAM% --distpath "%DIST_DIR%" --workpath "%BUILD_DIR%" --specpath "%SPEC_DIR%" "%TARGET_PY%"
if %errorlevel% neq 0 goto :ERR_BUILD

:BUILD_OK
echo.
echo [OK] PyInstaller compilation completed.
echo.

REM -------------------------------------------------------------------------------
REM [5/6] Move EXE to Release Folder
REM -------------------------------------------------------------------------------
echo [5/6] Copying executable to Release folder...
if not exist "%RELEASE_DIR%" mkdir "%RELEASE_DIR%"

taskkill /F /IM DiskCleanupAuto_v1.5.0.exe >nul 2>&1
if exist "%RELEASE_DIR%\DiskCleanupAuto_v1.5.0.exe" attrib -r "%RELEASE_DIR%\DiskCleanupAuto_v1.5.0.exe" >nul 2>&1

if exist "%DIST_DIR%\DiskCleanupAuto_v1.5.0.exe" copy /y "%DIST_DIR%\DiskCleanupAuto_v1.5.0.exe" "%RELEASE_DIR%\DiskCleanupAuto_v1.5.0.exe" >nul 2>&1
if exist "%DIST_DIR%\DiskCleanupAuto_v1.5.0.exe" copy /y "%DIST_DIR%\DiskCleanupAuto_v1.5.0.exe" "%DIST_DIR%\DiskCleanupAuto.exe" >nul 2>&1
if exist "%RELEASE_DIR%\DiskCleanupAuto_v1.5.0.exe" copy /y "%RELEASE_DIR%\DiskCleanupAuto_v1.5.0.exe" "%DIST_DIR%\DiskCleanupAuto.exe" >nul 2>&1
if exist "%RELEASE_DIR%\DiskCleanupAuto_v1.5.0.exe" echo [OK] Output file: "%RELEASE_DIR%\DiskCleanupAuto_v1.5.0.exe"
echo.

REM -------------------------------------------------------------------------------
REM [7/7] Clean Temporary Artifacts
REM -------------------------------------------------------------------------------
REM -------------------------------------------------------------------------------
REM [6/7] Build Inno Setup Installer (if installer.iss exists)
REM -------------------------------------------------------------------------------
echo [6/7] Checking Inno Setup Compiler for installer packaging...
set "ISCC_EXE="
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" set "ISCC_EXE=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not defined ISCC_EXE if exist "C:\Program Files\Inno Setup 6\ISCC.exe" set "ISCC_EXE=C:\Program Files\Inno Setup 6\ISCC.exe"
if not defined ISCC_EXE if exist "C:\Inno Setup 6\ISCC.exe" set "ISCC_EXE=C:\Inno Setup 6\ISCC.exe"
if not defined ISCC_EXE (
    where iscc >nul 2>&1
    if %errorlevel% equ 0 set "ISCC_EXE=iscc"
)

if defined ISCC_EXE if exist "%SCRIPT_DIR%installer.iss" (
    echo [*] Inno Setup compiler found: "%ISCC_EXE%"
    echo [*] Compiling WindowsDiskCleanup_Setup_v1.5.0.exe...
    if not exist "%SCRIPT_DIR%Output" mkdir "%SCRIPT_DIR%Output"
    "%ISCC_EXE%" "%SCRIPT_DIR%installer.iss"
    if %errorlevel% equ 0 (
        echo [OK] Installer compilation successful!
        if exist "%SCRIPT_DIR%Output\WindowsDiskCleanup_Setup_v1.5.0.exe" (
            copy /y "%SCRIPT_DIR%Output\WindowsDiskCleanup_Setup_v1.5.0.exe" "%RELEASE_DIR%" >nul 2>&1
            echo [OK] Installer copied to Release folder: "%RELEASE_DIR%\WindowsDiskCleanup_Setup_v1.5.0.exe"
        )
    ) else (
        echo [WARN] Inno Setup compilation returned error code %errorlevel%.
    )
) else (
    echo [INFO] Inno Setup (ISCC.exe) not found on system. Skipping installer packaging.
    echo        (Download Inno Setup from: https://jrsoftware.org/isdl.php)
)
echo.

echo [7/7] Cleaning temporary build artifacts...
if exist "%BUILD_DIR%" rd /s /q "%BUILD_DIR%" >nul 2>&1
if exist "%DIST_DIR%" rd /s /q "%DIST_DIR%" >nul 2>&1
if exist "%SPEC_DIR%DiskCleanupAuto_v1.5.0.spec" del /f /q "%SPEC_DIR%DiskCleanupAuto_v1.5.0.spec" >nul 2>&1
if exist "%SCRIPT_DIR%__pycache__" rd /s /q "%SCRIPT_DIR%__pycache__" >nul 2>&1
echo [OK] Temporary artifacts cleaned.

color 0A
echo.
echo ===============================================================================
echo   [SUCCESS] Single portable EXE created successfully!
echo ===============================================================================
echo   File Location: %RELEASE_DIR%\DiskCleanupAuto_v1.5.0.exe
echo ===============================================================================
echo.

if exist "%RELEASE_DIR%\DiskCleanupAuto_v1.5.0.exe" start "" explorer.exe "%RELEASE_DIR%"

echo Press any key to exit...
pause >nul
exit /b 0

:ERR_PIP
color 0C
echo.
echo ===============================================================================
echo [ERROR] Failed to install PyInstaller via pip!
echo Please check your internet connection and try running:
echo   pip install pyinstaller
echo ===============================================================================
echo.
pause
exit /b 1

:ERR_BUILD
color 0C
echo.
echo ===============================================================================
echo [ERROR] Build failed! Check the log messages above.
echo ===============================================================================
echo.
pause
exit /b 1

:RUN_PY_BUILDER
echo [INFO] Launching Python-native builder (build_exe.py)...
echo.
call python "%SCRIPT_DIR%build_exe.py"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python builder exited with code %errorlevel%.
    pause
    exit /b %errorlevel%
)
exit /b 0
