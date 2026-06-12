@echo off
cd /d "%~dp0"
echo ============================================
echo    Envoi de Biiingo sur GitHub...
echo ============================================
git add -A
git commit -m "Mise a jour du %date% a %time%"
git push
echo.
echo ============================================
echo    Termine ! Le site se met a jour
echo    automatiquement dans 1 a 2 minutes.
echo ============================================
pause
