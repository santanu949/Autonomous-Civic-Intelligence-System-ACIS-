import time
import random
import requests
from datetime import datetime

# Configuration
API_BASE = "http://localhost:8000/ingest"
SECTORS = ["Sector-A", "Sector-B", "Sector-C", "Sector-D", "Sector-E"]
H3_INDICES = ["8928308280fffff", "8928308280bffff", "89283082807ffff", "89283082803ffff", "89283082813ffff"]

def simulate_all_sensors():
    print("Multi-Domain City Simulator Started...")
    
    while True:
        # 1. Simulate Traffic
        for sector, h3 in zip(SECTORS, H3_INDICES):
            traffic_payload = {
                "sensor_id": f"TS-{sector}-01",
                "h3_index": h3,
                "sector": sector,
                "vehicle_count": random.randint(30, 180),
                "timestamp": datetime.now().isoformat()
            }
            try:
                requests.post(f"{API_BASE}/traffic", json=traffic_payload, timeout=0.5)
            except: pass

        # 2. Simulate Environment (Every 5 seconds)
        for h3 in H3_INDICES[:3]: # Fewer env sensors
            env_payload = {
                "sensor_id": f"ENV-{h3[:5]}",
                "h3_index": h3,
                "pm25": random.uniform(10.0, 120.0),
                "no2": random.uniform(5.0, 45.0),
                "noise": random.uniform(50.0, 95.0), # Decibels
                "timestamp": datetime.now().isoformat()
            }
            try:
                requests.post(f"{API_BASE}/environment", json=env_payload, timeout=0.5)
            except: pass

        # 3. Simulate Waste (Every 10 seconds)
        for i, h3 in enumerate(H3_INDICES):
            waste_payload = {
                "bin_id": f"BIN-{i:03d}",
                "h3_index": h3,
                "fill_level": random.uniform(10.0, 95.0),
                "timestamp": datetime.now().isoformat()
            }
            try:
                requests.post(f"{API_BASE}/waste", json=waste_payload, timeout=0.5)
            except: pass

        print(f"[{datetime.now().strftime('%H:%M:%S')}] Pushed sensor packet for {len(SECTORS)} sectors.")
        time.sleep(3)

if __name__ == "__main__":
    simulate_all_sensors()
