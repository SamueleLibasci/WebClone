@echo off
title Installazione dipendenze Node.js

cd /d "%~dp0"

echo.
echo ==============================
echo INSTALLAZIONE GATEWAY
echo ==============================
cd backend\gateway
call npm install
cd /d "%~dp0"

echo.
echo ==============================
echo INSTALLAZIONE AUTH-SERVICE
echo ==============================
cd backend\auth-service
call npm install
cd /d "%~dp0"

echo.
echo ==============================
echo INSTALLAZIONE SERVICE
echo ==============================
cd backend\service
call npm install
cd /d "%~dp0"

echo.
echo ==============================
echo INSTALLAZIONE COMPLETATA
echo ==============================
echo.

pause
