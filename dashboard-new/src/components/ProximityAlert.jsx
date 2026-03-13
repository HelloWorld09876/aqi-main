import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    Chip,
    Stack,
    LinearProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PlaceIcon from '@mui/icons-material/Place';
import AirIcon from '@mui/icons-material/Air';

export default function ProximityAlert({ alert, onClose, open }) {
    if (!alert) return null;

    const getSeverityColor = (level) => {
        if (level === 'red') return '#ef4444';
        if (level === 'yellow') return '#f59e0b';
        return '#10b981';
    };

    const getSeverityText = (level) => {
        if (level === 'red') return 'DANGER ZONE';
        if (level === 'yellow') return 'MODERATE RISK';
        return 'SAFE ZONE';
    };

    const getRecommendations = (aqi) => {
        if (aqi > 150) {
            return [
                'Avoid outdoor activities',
                'Wear N95 mask if going outside',
                'Use air purifiers indoors',
                'Close all windows and doors',
                'Sensitive groups should stay indoors'
            ];
        } else if (aqi > 100) {
            return [
                'Limit prolonged outdoor activities',
                'Wear mask in high-traffic areas',
                'Sensitive groups should reduce exposure',
                'Monitor air quality updates'
            ];
        } else {
            return [
                'Outdoor activities are safe',
                'Air quality is acceptable',
                'Monitor for changes'
            ];
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${getSeverityColor(alert.zone.level)}`,
                    boxShadow: `0 0 40px ${getSeverityColor(alert.zone.level)}40`,
                    borderRadius: 3,
                    animation: 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            animation: 'pulse-glow 2s ease-in-out infinite',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <WarningAmberIcon
                            sx={{
                                fontSize: 48,
                                color: getSeverityColor(alert.zone.level),
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" color={getSeverityColor(alert.zone.level)}>
                            {getSeverityText(alert.zone.level)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Proximity Alert Activated
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3}>
                    {/* Zone Information */}
                    <Alert
                        severity={alert.zone.level === 'red' ? 'error' : alert.zone.level === 'yellow' ? 'warning' : 'success'}
                        icon={<PlaceIcon />}
                        sx={{
                            fontSize: '1rem',
                            '& .MuiAlert-message': { width: '100%' }
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="600">
                            {alert.zone.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {alert.zone.description}
                        </Typography>
                    </Alert>

                    {/* Distance and AQI */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Distance to Zone Center
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                            {alert.distance.toFixed(2)} km away
                        </Typography>
                    </Box>

                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Current AQI Level
                            </Typography>
                            <Chip
                                icon={<AirIcon />}
                                label={`${Math.round(alert.zone.avgAQI)} AQI`}
                                sx={{
                                    bgcolor: getSeverityColor(alert.zone.level),
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (alert.zone.avgAQI / 300) * 100)}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: getSeverityColor(alert.zone.level),
                                    borderRadius: 4,
                                }
                            }}
                        />
                    </Box>

                    {/* Recommendations */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AirIcon /> Recommended Actions
                        </Typography>
                        <Stack spacing={1}>
                            {getRecommendations(alert.zone.avgAQI).map((rec, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1.5,
                                        p: 1.5,
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            bgcolor: getSeverityColor(alert.zone.level),
                                            mt: 0.7,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {rec}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    fullWidth
                    sx={{
                        background: `linear-gradient(135deg, ${getSeverityColor(alert.zone.level)} 0%, ${getSeverityColor(alert.zone.level)}CC 100%)`,
                        fontWeight: 'bold',
                        py: 1.5,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${getSeverityColor(alert.zone.level)}DD 0%, ${getSeverityColor(alert.zone.level)}AA 100%)`,
                        }
                    }}
                >
                    Acknowledged
                </Button>
            </DialogActions>
        </Dialog>
    );
}
