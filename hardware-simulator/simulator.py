# -*- coding: utf-8 -*-
import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime

MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
TOPIC = "future-monitoring/sensor-data"

# Multiple sensor nodes with different locations and baseline pollution levels
SENSOR_NODES = [
    {
        "node_id": "node_delhi_001",
        "location": {"lat": 28.7041, "lng": 77.1025, "name": "Delhi Central"},
        "baseline_pm25": 180,  # High pollution
        "baseline_ph": 6.8
    },
    {
        "node_id": "node_delhi_002",
        "location": {"lat": 28.5355, "lng": 77.2490, "name": "South Delhi"},
        "baseline_pm25": 85,  # Moderate pollution
        "baseline_ph": 7.1
    },
    {
        "node_id": "node_mumbai_001",
        "location": {"lat": 19.0760, "lng": 72.8777, "name": "Mumbai Downtown"},
        "baseline_pm25": 160,  # High pollution
        "baseline_ph": 7.0
    },
    {
        "node_id": "node_mumbai_002",
        "location": {"lat": 19.1136, "lng": 72.8697, "name": "Mumbai Coastal"},
        "baseline_pm25": 35,  # Good air quality
        "baseline_ph": 7.4
    },
    {
        "node_id": "node_bangalore_001",
        "location": {"lat": 12.9716, "lng": 77.5946, "name": "Bangalore Tech Park"},
        "baseline_pm25": 75,  # Moderate pollution
        "baseline_ph": 7.2
    },
    {
        "node_id": "node_bangalore_002",
        "location": {"lat": 12.9352, "lng": 77.6245, "name": "Bangalore Green Belt"},
        "baseline_pm25": 28,  # Good air quality
        "baseline_ph": 7.3
    },
    {
        "node_id": "node_chennai_001",
        "location": {"lat": 13.0827, "lng": 80.2707, "name": "Chennai Industrial"},
        "baseline_pm25": 170,  # High pollution
        "baseline_ph": 6.9
    },
    {
        "node_id": "node_kolkata_001",
        "location": {"lat": 22.5726, "lng": 88.3639, "name": "Kolkata Central"},
        "baseline_pm25": 95,  # Moderate pollution
        "baseline_ph": 7.0
    }
]

class VirtualSensorNode:
    def __init__(self, config):
        self.node_id = config["node_id"]
        self.location = config["location"]
        self.baseline_pm25 = config["baseline_pm25"]
        self.baseline_ph = config["baseline_ph"]
        
    def generate_air_data(self):
        """Generate realistic air quality data with variation around baseline"""
        # Add time-based variation (worse in morning/evening rush hours)
        hour = datetime.now().hour
        rush_hour_multiplier = 1.3 if hour in [7, 8, 9, 18, 19, 20] else 1.0
        
        pm25_variation = random.uniform(-20, 30) * rush_hour_multiplier
        pm25 = max(10, self.baseline_pm25 + pm25_variation)
        
        return {
            "pm2_5": pm25,
            "pm10": pm25 * random.uniform(1.5, 2.0),
            "no2": random.uniform(0.01, 0.5),
            "co": random.uniform(0.1, 10) if pm25 > 100 else random.uniform(0.1, 2),
            "o3": random.uniform(0.01, 0.2),
            "voc": random.uniform(100, 1000) if pm25 > 80 else random.uniform(50, 400),
            "temperature": random.uniform(15, 45),
            "humidity": random.uniform(20, 95),
            "pressure": random.uniform(980, 1030)
        }
    
    def generate_water_data(self):
        """Generate realistic water quality data"""
        ph_variation = random.uniform(-0.3, 0.3)
        return {
            "ph": max(4.0, min(9.0, self.baseline_ph + ph_variation)),
            "turbidity": random.uniform(0, 100),
            "tds": random.uniform(100, 1000),
            "conductivity": random.uniform(100, 1500),
            "temperature": random.uniform(10, 35),
            "orp": random.uniform(-500, 500),
            "do": random.uniform(2, 12)
        }
    
    def generate_payload(self):
        """Create complete sensor payload"""
        return {
            "node_id": self.node_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "location": self.location,
            "air": self.generate_air_data(),
            "water": self.generate_water_data(),
            "battery": random.uniform(3.2, 4.2),
            "signal_strength": random.uniform(-90, -50)
        }

# Initialize MQTT client
client = mqtt.Client()
client.connect(MQTT_BROKER, MQTT_PORT)

# Create sensor instances
sensors = [VirtualSensorNode(config) for config in SENSOR_NODES]

print("[*] Virtual Sensor Network Started")
print(f"[*] {len(sensors)} sensor nodes active")
print("[*] Locations: Delhi, Mumbai, Bangalore, Chennai, Kolkata")
print(f"[*] Publishing to {MQTT_BROKER}:{MQTT_PORT}")
print("=" * 60)

iteration = 0
while True:
    iteration += 1
    print(f"\n[DATA] Iteration {iteration} - {datetime.now().strftime('%H:%M:%S')}")
    
    for sensor in sensors:
        data = sensor.generate_payload()
        
        # Occasionally spike pollution for demonstration
        if random.random() < 0.08:  # 8% chance
            data["air"]["pm2_5"] = random.uniform(250, 400)
            print(f"[WARNING] {sensor.node_id} - ANOMALY: PM2.5 spike = {data['air']['pm2_5']:.1f}")
        
        client.publish(TOPIC, json.dumps(data))
        print(f"[OK] {sensor.node_id} ({sensor.location['name']}): PM2.5={data['air']['pm2_5']:.1f}, pH={data['water']['ph']:.1f}")
    
    print("-" * 60)
    time.sleep(10)  # Publish every 10 seconds
  