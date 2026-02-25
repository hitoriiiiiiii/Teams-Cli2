@echo off
REM Teams CLI - NPM Publishing Quick Start Guide for Windows

setlocal enabledelayedexpansion

echo.
echo ════════════════════════════════════════════════════════
echo    Teams CLI - NPM Publishing Quick Start
echo ════════════════════════════════════════════════════════
echo.

echo [STEP 1] Update Your Information
echo ─────────────────────────────────
echo Edit package.json with:
echo   - author: Your name and email
echo   - repository: Your GitHub repository URL
echo   - homepage: Your project homepage
echo.
echo Update these lines:
echo   "author": "Your Name ^<your.email@example.com^>"
echo   "repository": { "url": "https://github.com/hitoriiiiiiii/Teams-Cli.git" }
echo   "homepage": "https://github.com/hitoriiiiiiii/Teams-Cli.git"
echo.

echo [STEP 2] Create NPM Account
echo ──────────────────────────
echo Visit: https://www.npmjs.com/signup
echo Complete email verification
echo.

echo [STEP 3] Login to NPM
echo ────────────────────
echo Run this command:
echo   npm login
echo.
echo Then enter:
echo   - Username: your npm username
echo   - Password: your npm password
echo   - Email: your npm email
echo.

echo [STEP 4] Run Pre-Publish Checks
echo ───────────────────────────────
echo Verify everything is ready:
echo   npm run precheck
echo.
echo This validates:
echo   ✓ Package name format
echo   ✓ Version format ^(semantic versioning^)
echo   ✓ Required fields present
echo   ✓ dist/ directory exists
echo   ✓ README and LICENSE files
echo.

echo [STEP 5] Update Version
echo ──────────────────────
echo Choose one of:
echo   npm run version:patch    - 1.0.0 -^> 1.0.1
echo   npm run version:minor    - 1.0.0 -^> 1.1.0
echo   npm run version:major    - 1.0.0 -^> 2.0.0
echo.

echo [STEP 6] Publish to NPM
echo ─────────────────────
echo Production release:
echo   npm run pub
echo.
echo OR Beta release:
echo   npm run pub:beta
echo.

echo [STEP 7] Verify Publication
echo ──────────────────────────
echo Check your package on:
echo   https://www.npmjs.com/package/teams-cli
echo.
echo Install and test locally:
echo   npm install -g teams-cli
echo   teams --version
echo.

echo.
echo ════════════════════════════════════════════════════════
echo           Publishing Complete! 🎉
echo ════════════════════════════════════════════════════════
echo.
echo Users can now install with:
echo   npm install -g teams-cli
echo.
echo For more info, see:
echo   - NPM_PUBLISHING_GUIDE.md
echo   - NPM_SETUP_SUMMARY.md
echo.

REM Optional: Open npm package page in browser
REM start https://www.npmjs.com/package/teams-cli

pause
