@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo    Verification avant publication Biiingo
echo ============================================

for /f "delims=" %%B in ('git branch --show-current') do set "BRANCH=%%B"
if not "%BRANCH%"=="main" (
  echo ERREUR : la publication est autorisee uniquement depuis main.
  echo Branche actuelle : %BRANCH%
  exit /b 1
)

git diff --quiet
if errorlevel 1 (
  echo ERREUR : des modifications non enregistrees sont presentes.
  exit /b 1
)

git diff --cached --quiet
if errorlevel 1 (
  echo ERREUR : des modifications sont encore en attente de commit.
  exit /b 1
)

call npm.cmd run check
if errorlevel 1 exit /b 1

call npm.cmd test
if errorlevel 1 exit /b 1

git fetch origin main
if errorlevel 1 exit /b 1

for /f "delims=" %%C in ('git rev-list --count HEAD..origin/main') do set "BEHIND=%%C"
if not "%BEHIND%"=="0" (
  echo ERREUR : main local est en retard sur origin/main.
  echo Recupere les changements avant de publier.
  exit /b 1
)

git push origin main
if errorlevel 1 exit /b 1

echo ============================================
echo    Publication envoyee avec succes.
echo ============================================
endlocal
