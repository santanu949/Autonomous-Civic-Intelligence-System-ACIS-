# 🚦 ACIS v2.0 - Operations & Launch Guide

To run the **Autonomous Civic Intelligence System** locally, follow these steps in order. This system requires three main components running simultaneously: the **Backend Core**, the **City Simulator**, and the **React Dashboard**.

---

### 1. Prerequisites
Ensure you have the following installed:
*   **Python 3.10+**
*   **Node.js 18+** & **npm**

---

### 2. Initial Setup
Open your terminal in the project root: `acis-v2`

#### A. Install Backend Dependencies
```bash
# Install FastAPI and support libraries
pip install fastapi uvicorn pydantic requests
```

#### B. Install Frontend Dependencies
```bash
# Navigate to dashboard and install node modules
cd dashboard
npm install
```

---

### 3. Execution Sequence (Run in 3 separate terminal windows)

#### Terminal 1: Start the ACIS Backend Core
This is the "Brain" of the city. It handles the Reasoning Engine and WebSocket broadcasts.
```bash
# From project root (acis-v2)
python server/main.py
```
*   **URL**: `http://localhost:8000`

#### Terminal 2: Start the Multi-Domain City Simulator
This feeds the "Nervous System" with live sensor data (Traffic, Environment, Waste).
```bash
# From project root (acis-v2)
python simulators/city_sensor_fusion.py
```

#### Terminal 3: Launch the React Dashboard
The visual Command Center for the operator.
```bash
# From acis-v2/dashboard directory
npm run dev
```
*   **URL**: `http://localhost:5173`

---

### 🎮 Operator Instructions
1.  **Monitor Intelligence**: The right sidebar will populate with live detections automatically.
2.  **Toggle Layers**: Use the "Map Layers" HUD to switch between Traffic, AQI, and Waste views.
3.  **Crisis Mode**: Click the pulsing red **Shield Alert** button to trigger emergency response logic.
4.  **What-If Simulation**: Click the **Simulation Mode** button to model road closures and see AI traffic redistribution.

---

### 🧩 Troubleshooting
*   **Port 8000 busy**: If you get an error that port 8000 is in use, kill existing python processes or use `netstat -ano | findstr :8000` to find the PID and kill it via Task Manager.
*   **White Map**: Ensure you have an internet connection to load the OpenStreetMap tiles.
*   **No Data**: Ensure the **Simulator** is running; otherwise, the dashboard will look empty.
