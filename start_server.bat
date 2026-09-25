@echo off
echo ========================================
echo Starting HUB CAFE Development Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error: npm install failed
        pause
        exit /b 1
    )
    echo Dependencies installed successfully
    echo.
)

echo Starting development server...
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ERROR: Server failed to start
    echo ========================================
    echo.
    echo Possible solutions:
    echo 1. Run: npm install --legacy-peer-deps
    echo 2. Check if Node.js is installed: node --version
    echo 3. Delete node_modules folder and reinstall
    echo.
    pause
    exit /b 1
)

pause