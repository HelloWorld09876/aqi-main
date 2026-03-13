import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Paper, Typography, Box, Alert, Chip, Card, CardContent, Stack, Snackbar, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import io from 'socket.io-client';
import axios from 'axios';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterIcon from '@mui/icons-material/Water';
import WarningIcon from '@mui/icons-material/Warning';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import custom components
import HeatMap from './components/HeatMap';
import ProximityAlert from './components/ProximityAlert';
import AIForecastPanel from './components/AIForecastPanel';

const API_URL = 'http://localhost:5000';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
    },
    secondary: {
      main: '#ff6b6b',
    },
    background: {
      default: '#0a1929',
      paper: '#1e293b',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});

// AQI Gauge Component
function AQIGauge({ value }) {
  return (
    <Box className="animate-bounce-in" sx={{ position: 'relative', width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ position: 'relative' }}>
        <Box sx={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: '12px solid',
          borderColor: value <= 50 ? '#10b981' :
            value <= 100 ? '#f59e0b' :
              value <= 150 ? '#f97316' :
                value <= 200 ? '#ef4444' : '#8b5cf6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `conic-gradient(from 0deg, ${value <= 50 ? '#10b981' :
            value <= 100 ? '#f59e0b' :
              value <= 150 ? '#f97316' :
                value <= 200 ? '#ef4444' : '#8b5cf6'
            } ${(value / 300) * 100}%, rgba(255,255,255,0.1) 0)`,
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}>
          <Box sx={{
            width: 150,
            height: 150,
            borderRadius: '50%',
            bgcolor: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <Typography variant="h2" fontWeight="bold">{Math.round(value)}</Typography>
            <Typography variant="caption" color="text.secondary">AQI</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// Node Status Component
function NodeStatus({ nodes, selectedNode, onSelectNode }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="600">Connected Sensor Nodes</Typography>
      <Stack spacing={1}>
        {Object.keys(nodes).slice(0, 8).map((nodeId, idx) => {
          const node = nodes[nodeId];
          return (
            <Chip
              key={nodeId}
              label={node.location?.name || nodeId}
              onClick={() => onSelectNode(nodeId)}
              color={selectedNode === nodeId ? "primary" : "default"}
              variant={selectedNode === nodeId ? "filled" : "outlined"}
              sx={{
                justifyContent: 'flex-start',
                animation: `slide-in-right ${idx * 0.1}s ease-out`,
                '&:hover': {
                  transform: 'translateX(5px)',
                  boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
                }
              }}
            />
          );
        })}
        {Object.keys(nodes).length > 8 && (
          <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
            +{Object.keys(nodes).length - 8} more nodes
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

// Alert Panel Component
function AlertPanel({ alerts }) {
  return (
    <Stack spacing={1}>
      {alerts.slice(0, 5).map((alert, index) => (
        <Alert
          key={index}
          severity={alert.severity === 'CRITICAL' ? 'error' : 'warning'}
          sx={{
            mb: 1,
            animation: `slide-in-up ${index * 0.1}s ease-out`,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Typography variant="body2" fontWeight="600">{alert.message}</Typography>
          {alert.value && (
            <Typography variant="caption" color="text.secondary">
              Value: {alert.value.toFixed(1)} (Threshold: {alert.threshold})
            </Typography>
          )}
        </Alert>
      ))}
      {alerts.length === 0 && (
        <Alert severity="success" className="animate-fade-in">All systems normal</Alert>
      )}
    </Stack>
  );
}

// Real Time Chart Component
function RealTimeChart({ data }) {
  return (
    <Box sx={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }} />
          <Legend />
          <Line type="monotone" dataKey="pm2_5" stroke="#00d4ff" strokeWidth={3} name="PM2.5" dot={{ fill: '#00d4ff' }} />
          <Line type="monotone" dataKey="ph" stroke="#10b981" strokeWidth={2} name="pH" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

// Main App Component
function App() {
  const [nodes, setNodes] = useState({});
  const [recentData, setRecentData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [pollutionZones, setPollutionZones] = useState(null);
  const [proximityAlert, setProximityAlert] = useState(null);
  const [openProximityDialog, setOpenProximityDialog] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [showLocationSnackbar, setShowLocationSnackbar] = useState(false);

  // Fetch pollution zones
  useEffect(() => {
    axios.get(`${API_URL}/api/pollution-zones`)
      .then(response => {
        setPollutionZones(response.data);
        console.log('✅ Pollution zones loaded:', response.data.zones.length);
      })
      .catch(error => {
        console.error('❌ Failed to load pollution zones:', error);
      });
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationPermission('granted');
          console.log('📍 User location:', location);
        },
        (error) => {
          console.warn('⚠️ Location permission denied:', error);
          setLocationPermission('denied');
          setShowLocationSnackbar(true);
          // Fallback to Delhi for demo
          setUserLocation({ lat: 28.7041, lng: 77.1025 });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.error('❌ Geolocation not supported');
      setUserLocation({ lat: 28.7041, lng: 77.1025 });
    }
  }, []);

  // Socket.IO connection
  useEffect(() => {
    const socket = io(API_URL);

    socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    socket.on('initial_data', (data) => {
      console.log('📊 Initial data received');
      setNodes(data.nodes || {});
      setAlerts(data.recentAlerts || []);

      if (Object.keys(data.nodes).length > 0 && !selectedNode) {
        setSelectedNode(Object.keys(data.nodes)[0]);
      }

      // Generate chart data
      if (data.recentData && data.recentData.length > 0) {
        const chartData = data.recentData.slice(0, 20).reverse().map((d, i) => ({
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pm2_5: d.air?.pm2_5 || 0,
          ph: d.water?.ph || 7,
          temperature: d.air?.temperature || 25
        }));
        setRecentData(chartData);
      }
    });

    socket.on('sensor_update', (data) => {
      setNodes(prev => ({
        ...prev,
        [data.node_id]: {
          ...data,
          lastSeen: new Date(),
          status: 'online'
        }
      }));

      // Update chart data
      const newDataPoint = {
        time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pm2_5: data.air?.pm2_5 || 0,
        ph: data.water?.ph || 7,
        temperature: data.air?.temperature || 25
      };

      setRecentData(prev => [...prev.slice(-19), newDataPoint]);
    });

    socket.on('new_alerts', (newAlerts) => {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 20));
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedNode]);

  // Proximity alert handler (from map component)
  const handleProximityAlert = useCallback((alert) => {
    if (!proximityAlert || proximityAlert.zone.id !== alert.zone.id) {
      setProximityAlert(alert);
      setOpenProximityDialog(true);
    }
  }, [proximityAlert]);

  const currentData = selectedNode ? nodes[selectedNode] : null;
  const aqi = currentData ? Math.round(currentData.air.pm2_5 * 2) : 50;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <Box
          component="header"
          sx={{
            p: 3,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #00d4ff 30%, #0088ff 60%, #8b5cf6 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                🌍 FUTURE MONITORING SYSTEM
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                AI-Powered Air & Water Quality Monitoring
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Chip
                icon={<NetworkCheckIcon />}
                label={`${Object.keys(nodes).length} Nodes Active`}
                color="success"
                variant="outlined"
                className="animate-fade-in"
              />
              <Chip
                icon={<WarningIcon />}
                label={`${alerts.length} Alerts`}
                color={alerts.filter(a => a.severity === 'CRITICAL').length > 0 ? "error" : "warning"}
                className="animate-fade-in"
              />
              {userLocation && (
                <Chip
                  icon={<MyLocationIcon />}
                  label="Location Tracked"
                  color="primary"
                  className="animate-fade-in"
                />
              )}
            </Stack>
          </Box>
        </Box>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
          <Grid container spacing={3}>
            {/* Left Column - Gauges & Status */}
            <Grid item xs={12} md={3}>
              <Paper className="glass animate-slide-up" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WbSunnyIcon /> Air Quality
                </Typography>
                <AQIGauge value={aqi} />

                <Typography variant="h6" sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WaterIcon /> Water Quality
                </Typography>
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h1" color="success.main" fontWeight="bold">
                    {currentData?.water?.ph?.toFixed(1) || '7.2'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">pH Level</Typography>
                </Box>

                <NodeStatus nodes={nodes} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
              </Paper>
            </Grid>

            {/* Middle Column - Charts & AI Forecast */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* Real-time Data Chart */}
                <Paper className="glass animate-slide-up" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>📊 Real-time Sensor Data</Typography>
                  <RealTimeChart data={recentData} />
                </Paper>

                {/* AI Forecast Panel */}
                <Box className="animate-slide-up" sx={{ animationDelay: '0.2s' }}>
                  <AIForecastPanel />
                </Box>

                {/* Parameter Bar Chart */}
                <Paper className="glass animate-slide-up" sx={{ p: 3, borderRadius: 3, animationDelay: '0.3s' }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>📈 Recent Measurements</Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={recentData.slice(-5)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }} />
                        <Legend />
                        <Bar dataKey="pm2_5" name="PM2.5" fill="#00d4ff" />
                        <Bar dataKey="temperature" name="Temp (°C)" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Stack>
            </Grid>

            {/* Right Column - Alerts & Details */}
            <Grid item xs={12} md={3}>
              <Paper className="glass animate-slide-up" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon /> Active Alerts
                </Typography>
                <AlertPanel alerts={alerts} />

                {currentData && (
                  <>
                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>📍 Node Details</Typography>
                    <Card variant="outlined" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
                      <CardContent>
                        <Stack spacing={1.5}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">Location:</Typography>
                            <Chip size="small" icon={<GpsFixedIcon />} label={currentData.location?.name || 'Unknown'} />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">Battery:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BatteryFullIcon fontSize="small" color="success" />
                              <Typography variant="body2">{currentData.battery?.toFixed(2) || '3.8'}V</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Last Update:</Typography>
                            <Typography variant="body2">{new Date(currentData.timestamp).toLocaleTimeString()}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>🔬 Current Readings</Typography>
                    <Grid container spacing={1}>
                      {[
                        { label: 'PM2.5', value: currentData.air.pm2_5.toFixed(1), unit: 'μg/m³', color: currentData.air.pm2_5 > 35 ? 'error' : 'success' },
                        { label: 'PM10', value: currentData.air.pm10?.toFixed(1), unit: 'μg/m³', color: 'info' },
                        { label: 'CO', value: currentData.air.co?.toFixed(2), unit: 'ppm', color: currentData.air.co > 9 ? 'error' : 'success' },
                        { label: 'pH', value: currentData.water.ph.toFixed(1), unit: '', color: currentData.water.ph < 6.5 || currentData.water.ph > 8.5 ? 'error' : 'success' },
                      ].map((item, idx) => (
                        <Grid item xs={6} key={idx}>
                          <Card variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                            <CardContent sx={{ p: 1.5 }}>
                              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                              <Typography variant="h6" color={`${item.color}.main`} fontWeight="bold">
                                {item.value}
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                  {item.unit}
                                </Typography>
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Paper>
            </Grid>

            {/* Full Width - Interactive Map */}
            <Grid item xs={12}>
              <Paper className="glass animate-slide-up" sx={{ p: 3, borderRadius: 3, animationDelay: '0.4s' }}>
                <Typography variant="h6" sx={{ mb: 3 }}>🗺️ Live Pollution Map</Typography>
                <HeatMap
                  nodes={nodes}
                  pollutionZones={pollutionZones}
                  userLocation={userLocation}
                  onProximityAlert={handleProximityAlert}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            p: 2,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            bgcolor: 'rgba(15, 23, 42, 0.5)',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            🤖 Edge AI + IoT + Cloud Dashboard | Real-time updates via MQTT & WebSocket | Built with React & Node.js
          </Typography>
        </Box>
      </Box>

      {/* Proximity Alert Dialog */}
      <ProximityAlert
        alert={proximityAlert}
        open={openProximityDialog}
        onClose={() => setOpenProximityDialog(false)}
      />

      {/* Location Permission Snackbar */}
      <Snackbar
        open={showLocationSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowLocationSnackbar(false)}
        message="Location access denied. Using default location for demo."
        action={
          <Button color="primary" size="small" onClick={() => setShowLocationSnackbar(false)}>
            OK
          </Button>
        }
      />
    </ThemeProvider>
  );
}

export default App;