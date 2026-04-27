import subprocess
import time
import os
import sys

def launch_acis():
    print("🚀 Initializing ACIS v2.0 Global Launch...")
    
    # 1. Start Backend
    print("🧠 Starting Backend Core [Port 8000]...")
    backend = subprocess.Popen([sys.executable, "server/main.py"], 
                               stdout=subprocess.PIPE, 
                               stderr=subprocess.STDOUT,
                               text=True)
    
    time.sleep(2) # Wait for backend to bind port
    
    # 2. Start Simulator
    print("📡 Starting Multi-Domain Simulator...")
    simulator = subprocess.Popen([sys.executable, "simulators/city_sensor_fusion.py"],
                                 stdout=subprocess.PIPE,
                                 stderr=subprocess.STDOUT,
                                 text=True)
    
    # 3. Start Dashboard
    print("🖥️ Starting React Dashboard [Vite]...")
    os.chdir("dashboard")
    dashboard = subprocess.Popen(["npm", "run", "dev"], 
                                 shell=True,
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.STDOUT,
                                 text=True)
    
    print("\n✅ SYSTEM ONLINE")
    print("👉 Dashboard: http://localhost:5173")
    print("👉 Backend API: http://localhost:8000")
    print("\nMonitoring logs (Ctrl+C to stop all)...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down all components...")
        backend.terminate()
        simulator.terminate()
        dashboard.terminate()
        print("Done.")

if __name__ == "__main__":
    launch_acis()
