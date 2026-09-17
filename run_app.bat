@echo off
echo ========================================================
echo Starting Activity Report Document-to-Data Automation App
echo ========================================================

start "Backend - FastAPI" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"
start "Frontend - Vite React" cmd /k "cd frontend && npm run dev"

echo App is launching:
echo - Frontend: http://localhost:5173
echo - Backend API: http://127.0.0.1:8000
echo ========================================================
pause
