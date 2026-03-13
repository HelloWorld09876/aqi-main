#!/bin/bash

echo "🚀 Starting AQI Monitoring System..."

# Start backend server in background
echo "Starting backend server..."
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start React dashboard in background
echo "Starting React dashboard..."
cd dashboard-new
npm start &
DASHBOARD_PID=$!

# Wait a moment
sleep 3

# Start sensor simulator in background
echo "Starting sensor simulator..."
cd ../hardware-simulator
source ../venv/bin/activate && python simulator.py &
SIMULATOR_PID=$!

echo "✅ All services started!"
echo "📊 Dashboard: https://$CODESPACE_NAME-3000.app.github.dev"
echo "🔧 Backend: https://$CODESPACE_NAME-5000.app.github.dev"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all processes
wait $BACKEND_PID $DASHBOARD_PID $SIMULATOR_PID