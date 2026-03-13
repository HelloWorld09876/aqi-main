import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PersonPinIcon from '@mui/icons-material/PersonPin';

// Fix for default icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Create custom user location icon
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="
    background: linear-gradient(135deg, #00d4ff 0%, #0088ff 100%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse-glow 2s ease-in-out infinite;
  ">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to recenter map
function RecenterButton({ position }) {
  const map = useMap();

  const handleRecenter = () => {
    if (position) {
      map.setView(position, 12, { animate: true });
    }
  };

  return (
    <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
      <Tooltip title="Center on my location">
        <IconButton
          onClick={handleRecenter}
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 136, 255, 0.8)',
            },
          }}
        >
          <MyLocationIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function HeatMap({ nodes, pollutionZones, userLocation, onProximityAlert }) {
  const [center, setCenter] = useState([20.5937, 78.9629]); // India center
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.lat, userLocation.lng]);
      setZoom(12);

      // Check proximity to danger zones
      if (pollutionZones && pollutionZones.zones) {
        pollutionZones.zones.forEach(zone => {
          if (zone.level === 'red' || zone.level === 'yellow') {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              zone.center[0],
              zone.center[1]
            );

            // Alert if within zone radius (convert meters to km)
            const radiusKm = zone.radius / 1000;
            if (distance <= radiusKm * 1.5) { // Alert at 1.5x radius
              if (onProximityAlert) {
                onProximityAlert({ zone, distance });
              }
            }
          }
        });
      }
    }
  }, [userLocation, pollutionZones, onProximityAlert]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getColorFromPM25 = (pm25) => {
    if (pm25 <= 12) return '#10b981'; // Green
    if (pm25 <= 35) return '#f59e0b'; // Yellow
    if (pm25 <= 55) return '#f97316'; // Orange
    if (pm25 <= 150) return '#ef4444'; // Red
    return '#8b5cf6'; // Purple
  };

  const getZoneColor = (level) => {
    if (level === 'green') return '#10b981';
    if (level === 'yellow') return '#f59e0b';
    return '#ef4444';
  };

  const getRadiusFromPM25 = (pm25) => {
    return Math.min(30, Math.max(8, pm25 / 5));
  };

  const nodeArray = Object.values(nodes);

  if (!pollutionZones) {
    return (
      <Box sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          Loading map data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 500, borderRadius: 3, overflow: 'hidden', position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pollution Zones */}
        {pollutionZones.zones && pollutionZones.zones.map((zone, index) => (
          <Circle
            key={`zone-${index}`}
            center={zone.center}
            radius={zone.radius}
            pathOptions={{
              fillColor: getZoneColor(zone.level),
              fillOpacity: 0.15,
              color: getZoneColor(zone.level),
              weight: 2,
              opacity: 0.6,
            }}
          >
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {zone.name}
                </Typography>
                <Chip
                  label={zone.level.toUpperCase()}
                  size="small"
                  sx={{
                    mb: 1,
                    bgcolor: getZoneColor(zone.level),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {zone.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Average AQI: <strong>{zone.avgAQI}</strong>
                </Typography>
                <Typography variant="caption" display="block">
                  Radius: {(zone.radius / 1000).toFixed(1)} km
                </Typography>
              </Box>
            </Popup>
          </Circle>
        ))}

        {/* Sensor Nodes */}
        {nodeArray.map((node, index) => {
          const lat = node.location?.lat || center[0];
          const lng = node.location?.lng || center[1];
          const pm25 = node.air?.pm2_5 || 0;

          return (
            <CircleMarker
              key={`node-${index}`}
              center={[lat, lng]}
              radius={getRadiusFromPM25(pm25)}
              fillColor={getColorFromPM25(pm25)}
              color="#ffffff"
              weight={2}
              opacity={0.9}
              fillOpacity={0.7}
            >
              <Popup>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    📡 {node.location?.name || node.node_id}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={`PM2.5: ${pm25.toFixed(1)}`}
                      size="small"
                      sx={{ bgcolor: getColorFromPM25(pm25), color: 'white', fontWeight: 'bold' }}
                    />
                    {pm25 > 35 && <WarningIcon color="error" fontSize="small" />}
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    🌡️ Temperature: {node.air?.temperature?.toFixed(1)}°C
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    💧 Humidity: {node.air?.humidity?.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    pH: {node.water?.ph?.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    🕐 {new Date(node.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="primary">
                  📍 Your Location
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Lat: {userLocation.lat.toFixed(4)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Lng: {userLocation.lng.toFixed(4)}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}

        <RecenterButton position={userLocation ? [userLocation.lat, userLocation.lng] : null} />
      </MapContainer>

      {/* Map Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          zIndex: 1000,
          bgcolor: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          p: 2,
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
          Pollution Zones
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Typography variant="caption">Good (0-50 AQI)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#f59e0b' }} />
            <Typography variant="caption">Moderate (51-100 AQI)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#ef4444' }} />
            <Typography variant="caption">Unhealthy (100+ AQI)</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}