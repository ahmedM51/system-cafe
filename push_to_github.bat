@echo off
echo ========================================
echo Pushing HUB CAFE System to GitHub
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ========================================
    echo ERROR: Git is not installed on your system
    echo ========================================
    echo.
    echo Please install Git first:
    echo 1. Download from: https://git-scm.com/download/win
    echo 2. Run the installer with default settings
    echo 3. Restart your computer
    echo 4. Run this script again
    echo.
    echo ALTERNATIVE: Use GitHub Desktop (easier for beginners)
    echo Download from: https://desktop.github.com/
    echo.
    echo ALTERNATIVE: Upload files manually to GitHub
    echo 1. Go to: https://github.com/new
    echo 2. Create repository named: system-cafe
    echo 3. Upload all files manually
    echo.
    echo For detailed instructions, see: GITHUB_ALTERNATIVES.md
    echo.
    pause
    exit /b 1
)

echo Git is installed, proceeding...
echo.

echo Step 1: Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo Error: Git initialization failed
    pause
    exit /b 1
)
echo Git initialized successfully
echo.

echo Step 2: Adding all files...
git add .
if %errorlevel% neq 0 (
    echo Error: Failed to add files
    pause
    exit /b 1
)
echo Files added successfully
echo.

echo Step 3: Committing changes...
git commit -m "feat: HUB CAFE management system - POS, inventory, playstation, tables, shifts, reports and QA tests with unified branding system"
if %errorlevel% neq 0 (
    echo Error: Commit failed
    pause
    exit /b 1
)
echo Changes committed successfully
echo.

echo Step 4: Setting main branch...
git branch -M main
if %errorlevel% neq 0 (
    echo Error: Branch rename failed
    pause
    exit /b 1
)
echo Main branch set successfully
echo.

echo Step 5: Adding GitHub remote...
git remote add origin https://github.com/ahmedM51/system-cafe.git
if %errorlevel% neq 0 (
    echo Warning: Remote might already exist or failed
    echo Trying to remove existing remote first...
    git remote remove origin
    git remote add origin https://github.com/ahmedM51/system-cafe.git
)
echo GitHub remote added successfully
echo.

echo Step 6: Pushing to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo Error: Push failed
    echo Please check your GitHub credentials and repository access
    echo You may need to:
    echo 1. Create a Personal Access Token on GitHub
    echo 2. Use the token instead of your password
    echo 3. Or use SSH authentication
    echo.
    echo For troubleshooting, see: GITHUB_SETUP.md
    pause
    exit /b 1
)
echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub
echo ========================================
echo Repository: https://github.com/ahmedM51/system-cafe.git
echo.
pause