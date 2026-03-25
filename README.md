# 🌍 AI-Powered Air & Water Quality Monitoring System

## 🚀 Quick Start Guide

### Quick Start (All Services)

**On Windows:**
```cmd
run.bat
```

**On Linux/Mac:**
```bash
./start-all.sh
```

This will start all services (backend, dashboard, and simulator) automatically.

**Expected outputs:**
- Backend: `✅ Connected to MQTT broker 🌐 Cloud backend running on port 5000`
- Dashboard: `Compiled successfully!` (React dev server)
- Simulator: `🚀 Virtual Sensor Network Started 📡 8 sensor nodes active`

Access the dashboard at: **http://localhost:3000**

**To stop all services:** Press `Ctrl+C` in the terminal (or close windows on Windows).

### Manual Startup (Running Individually)

#### Prerequisites
- Node.js (v14 or higher)
- Python 3.x
- npm or yarn

#### Installation & Running

##### 1. Start the Backend Server
```bash
npm install
node server.js
```
Expected output:
```
✅ Connected to MQTT broker
🌐 Cloud backend running on port 5000
📡 MQTT Broker: broker.hivemq.com:1883
```

##### 2. Start the React Dashboard
```bash
cd dashboard-new
npm install
npm start
```
The dashboard will open automatically at **http://localhost:3000**

##### 3. Start the Sensor Simulator
```bash
cd hardware-simulator
pip install paho-mqtt
python simulator.py
```
Expected output:
```
🚀 Virtual Sensor Network Started
📡 8 sensor nodes active
📍 Locations: Delhi, Mumbai, Bangalore, Chennai, Kolkata
```

### 4. Grant Location Permission
When the dashboard opens:
1. Your browser will request location access
2. Click **Allow** to enable proximity alerts
3. The map will center on your location

---

## ✨ Key Features

### 🗺️ Interactive Map
- **User Location Tracking** - See your position with animated marker
- **Pollution Zones** - Color-coded areas (Red/Yellow/Green)
- **8 Sensor Nodes** across major Indian cities
- **Real-time Updates** - Data refreshes every 10 seconds

### ⚠️ Proximity Alerts
- Automatic distance calculation to pollution zones
- Warnings when entering high AQI areas
- Health recommendations based on pollution level

### 🤖 AI Forecasting
- 24-hour AQI predictions
- Rush hour pollution patterns
- Trend analysis (Improving/Moderate/Worsening)
- 85-95% prediction confidence

### 📊 Real-Time Dashboard
- Live sensor data from 8 locations
- PM2.5, PM10, CO, pH monitoring
- Interactive charts and gauges
- Alert notifications

---

## 🎯 For Presentation

### Demo Flow
1. **Show the Map** - 8 sensors across India with colored zones
2. **Click Sensors** - View real-time air and water quality data
3. **Location Feature** - Demonstrate user tracking and proximity alerts
4. **AI Forecast** - Show 24-hour predictions with confidence bars
5. **Real-time Updates** - Watch live data streaming

### Impressive Features to Highlight
- ✨ Premium glassmorphism UI with smooth animations
- 🗺️ Interactive map with pollution zones
- ⚠️ Intelligent proximity alert system
- 🤖 AI-powered forecasting
- 📡 Multi-sensor real-time monitoring
- 🎨 Modern, professional design

---

## 📁 Project Structure

```
aqi-main/
├── server.js                    # Backend API & WebSocket server
├── pollutionZones.json         # Pollution zone configuration
├── hardware-simulator/
│   └── simulator.py            # 8-node sensor simulator
└── dashboard/
    ├── src/
    │   ├── App.js              # Main application
    │   ├── index.css           # Premium design system
    │   └── components/
    │       ├── HeatMap.jsx            # Interactive map
    │       ├── ProximityAlert.jsx     # Alert dialog
    │       └── AIForecastPanel.jsx    # AI predictions
    └── package.json
```

---

## 🔧 Technology Stack

- **Frontend**: React 18, Material-UI, Recharts, Leaflet
- **Backend**: Node.js, Express, Socket.IO
- **Communication**: MQTT, WebSocket
- **Maps**: React-Leaflet, OpenStreetMap
- **Sensors**: Python (paho-mqtt)

---

## 🐛 Troubleshooting

### Issue: Map not loading
- Check that port 5000 (backend) and 3000 (frontend) are available
- Ensure internet connection for map tiles

### Issue: No sensor data
- Verify simulator is running: `python simulator.py`
- Check MQTT broker connection in server logs

### Issue: Location permission denied
- Dashboard will use default location (Delhi) for demo
- You can still see all features, just without personalized proximity alerts

---

## 💡 Tips

- **For Best Experience**: Grant location permission
- **Sensor Selection**: Click node chips in left panel to view specific sensors
- **Map Interaction**: Scroll to zoom, drag to pan, click markers for details
- **Proximity Alerts**: Move map to different zones to trigger alerts

---

## 📝 Notes

- All sensor data is **simulated** for demonstration purposes
- Email alerts are in **demo mode** (logs to console)
- MQTT uses **public broker** for easy setup
- Design optimized for **desktop browsers** (Chrome, Firefox, Edge)

---

## 🎉 Ready to Present!

The system is fully functional and presentation-ready. All features work seamlessly together to demonstrate a complete IoT + AI + Cloud monitoring solution.

For questions or issues, check the [walkthrough.md](file:///C:/Users/adity/.gemini/antigravity/brain/e1d2a837-de4e-4fd1-991b-3c9a4fdfc95e/walkthrough.md) for detailed documentation.
