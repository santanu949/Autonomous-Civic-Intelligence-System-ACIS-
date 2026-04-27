import time
import random
import json
import requests
import math
from datetime import datetime

# Configuration
SERVER_URL = "http://localhost:8000/ingest/traffic"
SECTORS = ["Sector-A", "Sector-B", "Sector-C", "Sector-D", "Sector-E"]
H3_INDICES = ["8928308280fffff", "8928308280bffff", "89283082807ffff", "89283082803ffff", "89283082813ffff"]

def get_rush_hour_multiplier():
    hour = datetime.now().hour
    # Morning rush (8-10) and Evening rush (17-19)
    if 8 <= hour <= 10 or 17 <= hour <= 19:
        return random.uniform(1.5, 2.5)
    return 1.0

def simulate_traffic():
    print("Traffic Simulator Started...")
    while True:
        multiplier = get_rush_hour_multiplier()
        
        for sector, h3 in zip(SECTORS, H3_INDICES):
            # Base density + noise + rush hour
            base_count = random.randint(20, 100)
            count = int(base_count * multiplier + random.randint(-10, 10))
            count = max(0, count)
            
            payload = {
                "sensor_id": f"TS-{sector}-01",
                "h3_index": h3,
                "sector": sector,
                "vehicle_count": count,
                "timestamp": datetime.now().isoformat(),
                "status": "OPERATIONAL"
            }
            
            try:
                # In a real system, this would be Kafka. Here we use HTTP for simplicity.
                # requests.post(SERVER_URL, json=payload)
                # For local testing, we'll just print if the server isn't up
                print(f"[{datetime.now().strftime('%H:%M:%S')}] {sector} ({h3}): {count} vehicles")
            except Exception as e:
                pass
        
        time.sleep(2)

if __name__ == "__main__":
    simulate_traffic()
