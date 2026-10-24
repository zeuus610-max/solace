#!/bin/bash
# SOLACE All-in-One Launcher
# Runs both Backend (8001) and Frontend (8000)

cd "$(dirname "$0")"

# Kill any existing processes on 8000 and 8001
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

echo "Starting SOLACE Backend API on port 8001..."
if [ ! -d .venv ]; then python3 -m venv .venv; fi
.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 &
BACKEND_PID=$!

echo "Starting SOLACE Frontend on port 8000..."
python3 -m http.server 8000 --bind 127.0.0.1 --directory frontend &
FRONTEND_PID=$!

echo ""
echo "======================================================"
echo "  SOLACE IS RUNNING!"
echo "  Frontend Web:  http://127.0.0.1:8000"
echo "  Backend API:   http://127.0.0.1:8001"
echo "  API Docs:      http://127.0.0.1:8001/docs"
echo "======================================================"
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
