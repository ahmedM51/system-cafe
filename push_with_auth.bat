@echo off
echo ========================================
echo Pushing HUB CAFE System to GitHub
echo ========================================
echo.

REM Use full path to git
set GIT_PATH="C:\Program Files\Git\bin\git.exe"

echo Git is configured, proceeding...
echo.

echo Step 1: Adding remote (if not exists)...
%GIT_PATH% remote add origin https://github.com/ahmedM51/system-cafe.git 2>nul
echo Remote added (or already exists)
echo.

echo Step 2: Pushing to GitHub...
echo.
echo ========================================
echo IMPORTANT: You will be asked for GitHub credentials
echo ========================================
echo.
echo For username: Enter your GitHub username (ahmedM51)
echo For password: Use a Personal Access Token, NOT your password
echo.
echo To get a Personal Access Token:
echo 1. Go to GitHub Settings > Developer settings > Personal access tokens
echo 2. Create new token with 'repo' permissions
echo 3. Use the token as your password
echo.
echo ========================================
echo.

%GIT_PATH% push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ERROR: Push failed
    echo ========================================
    echo.
    echo Common issues:
    echo 1. Wrong username or token
    echo 2. Repository doesn't exist (create it first at github.com/new)
    echo 3. Network connection issues
    echo.
    echo Try these solutions:
    echo 1. Create the repository first at: https://github.com/new
    echo 2. Use GitHub Desktop for easier authentication
    echo 3. Use SSH instead of HTTPS
    echo.
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