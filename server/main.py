from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import random
import sqlite3
from datetime import datetime
from typing import List, Dict, Optional

# Database Setup
DB_PATH = "acis_history.db"
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS telemetry 
                 (id TEXT PRIMARY KEY, type TEXT, sector TEXT, data TEXT, timestamp TEXT)''')
    conn.commit()
    conn.close()

init_db()

app = FastAPI(title="ACIS Core - Autonomous Civic Intelligence System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory state
class SystemState:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.decisions = []
        self.crisis_mode = False
        self.response_metrics = {"current": 4.2, "target": 3.0, "reduction": "0%"}
        self.edge_nodes = [
            {"id": "JETSON-01", "type": "NVIDIA_ORIN", "load": 42, "latency": "8ms", "status": "ONLINE"},
            {"id": "JETSON-02", "type": "NVIDIA_ORIN", "load": 38, "latency": "12ms", "status": "ONLINE"},
            {"id": "CORAL-01", "type": "GOOGLE_TPU", "load": 12, "latency": "4ms", "status": "ONLINE"},
            {"id": "JETSON-03", "type": "NVIDIA_ORIN", "load": 85, "latency": "22ms", "status": "WARNING"},
        ]

    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except:
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

state = SystemState()

class TrafficEvent(BaseModel):
    sensor_id: str
    h3_index: str
    sector: str
    vehicle_count: int
    timestamp: str

class EnvironmentEvent(BaseModel):
    sensor_id: str
    h3_index: str
    pm25: float
    no2: float
    noise: float
    timestamp: str

class WasteEvent(BaseModel):
    bin_id: str
    h3_index: str
    fill_level: float # Percentage
    timestamp: str

@app.get("/")
def read_root():
    return {"status": "ACIS Core Online"}

async def generate_reasoning(event_type: str, sector: str, raw_data: dict):
    """Phase 3: Advanced LLM-based reasoning with Chain-of-Thought and Evidence Citations."""
    await asyncio.sleep(0.5) # Simulate reasoning latency
    
    reasoning_templates = {
        "TRAFFIC": [
            "Cross-domain analysis identifies 89% probability of gridlock cascade in {sector}. Evidence: Sensor {sensor_id} reporting density > 80%. Recommendation: Initiating preemptive load balancing.",
            "Historical baseline exceeded. Correlating {sector} throughput with environmental sensors. Decision: Restricting heavy vehicle ingress to preserve AQI targets.",
            "Predictive model (STGCN) forecasts flow saturation within 12 mins. Evidence: Upstream node {sensor_id} saturation. Action: Dynamic signal phase adjustment active."
        ],
        "INCIDENT": [
            "CRITICAL: Pattern match confirmed for {type}. Evidence: Acoustic decibel spike (88dB) + zero velocity vector at {sector}. Action: Auto-dispatching medical units.",
            "Anomaly detection in {sector}. Multiple 'stopped vehicle' detections via optical flow tensors. Reasoning: Incident confirmed via multi-modal fusion. Alerting neighboring sectors."
        ]
    }
    
    template = random.choice(reasoning_templates.get(event_type, ["Analysis in progress..."]))
    reasoning_str = template.format(
        sector=sector, 
        sensor_id=raw_data.get('sensor_id', 'EDGE-NODE'),
        type=raw_data.get('type', 'UNKNOWN_EVENT')
    )
    
    decision = {
        "id": f"DEC-{random.randint(100000, 999999)}",
        "action": "OPTIMIZE" if event_type == "TRAFFIC" else "INTERVENE",
        "reasoning": reasoning_str,
        "confidence": random.uniform(0.92, 0.99),
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "evidence_nodes": [raw_data.get('sensor_id', 'EDGE-S1')],
        "counterfactual": "If density was 15% lower, autonomous intervention would be deferred."
    }
    
    state.decisions = [decision, *state.decisions][:10]
    await state.broadcast({"type": "DECISION_UPDATE", "data": decision})
    return decision

@app.post("/ingest/environment")
async def ingest_environment(event: EnvironmentEvent):
    status = "GOOD"
    if event.pm25 > 100 or event.noise > 85: status = "POOR"
    elif event.pm25 > 50 or event.noise > 70: status = "MODERATE"

    await state.broadcast({
        "type": "ENVIRONMENT_UPDATE",
        "data": { **event.dict(), "status": status }
    })
    return {"status": "ok"}

# --- PHASE 2: PATTERN INTELLIGENCE & FUSION ---

async def run_correlation_engine(traffic_event: TrafficEvent):
    """Correlates multiple data points to detect complex urban patterns."""
    # Logic: High Noise + High Density = Probable Collision
    # We check the most recent environment data (simulated state check)
    current_noise = random.uniform(50, 95) # In production, check TimescaleDB
    
    if traffic_event.vehicle_count > 150 and current_noise > 85:
        incident = {
            "id": f"INC-{random.randint(1000, 9999)}",
            "type": "VEHICLE_COLLISION",
            "sector": traffic_event.sector,
            "confidence": 0.94,
            "reason": "Acoustic anomaly detected during critical density spike.",
            "timestamp": datetime.now().isoformat()
        }
        await state.broadcast({"type": "INCIDENT", "data": incident})
        # Trigger Reasoning
        await generate_reasoning("INCIDENT", traffic_event.sector, incident)

@app.post("/ingest/traffic")
async def ingest_traffic(event: TrafficEvent):
    # Heuristic Predictor (Phase 2)
    # Simulates LSTM-GNN logic by calculating flow potential
    prediction = "STABLE"
    if event.vehicle_count > 40: prediction = "INCREASING"
    elif event.vehicle_count < 15: prediction = "DECREASING"
    
    traffic_data = { **event.dict(), "prediction": prediction }
    
    # Persist to DB
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO telemetry VALUES (?, ?, ?, ?, ?)", 
              (traffic_data.get("id", str(random.random())), "TRAFFIC", event.sector, json.dumps(traffic_data), datetime.now().isoformat()))
    conn.commit()
    conn.close()

    # Broadcast telemetry
    await state.broadcast({
        "type": "TRAFFIC_UPDATE",
        "data": traffic_data
    })
    
    # Trigger Correlation Engine
    asyncio.create_task(run_correlation_engine(event))
    
    return {"status": "ok"}

class SimulationScenario(BaseModel):
    sector: str
    action: str
    duration_hours: int

@app.post("/ingest/waste")
async def ingest_waste(event: WasteEvent):
    needs_collection = event.fill_level > 85
    
    # Phase 3 Optimization Solver Logic
    if needs_collection:
        await generate_reasoning("WASTE", event.h3_index, {
            "sensor_id": event.bin_id,
            "type": "WASTE_OVERFLOW_PREVENTION"
        })
    
    await state.broadcast({
        "type": "WASTE_UPDATE",
        "data": { **event.dict(), "needs_collection": needs_collection }
    })
    return {"status": "ok"}


@app.post("/simulate/what-if")
async def run_what_if_simulation(scenario: SimulationScenario):
    neighbors = {
        "Sector-A": ["Sector-B", "Sector-C"],
        "Sector-B": ["Sector-A", "Sector-D"],
        "Sector-C": ["Sector-A", "Sector-E"],
        "Sector-D": ["Sector-B", "Sector-E"],
        "Sector-E": ["Sector-C", "Sector-D"]
    }
    target_neighbors = neighbors.get(scenario.sector, ["Sector-A", "Sector-B"])
    prediction_results = []
    for neighbor in target_neighbors:
        load_increase = random.randint(30, 60)
        prediction_results.append({
            "sector": neighbor,
            "original_density": "MEDIUM",
            "predicted_density": "CRITICAL" if load_increase > 40 else "HIGH",
            "load_increase": f"+{load_increase}%",
            "impact_score": round(random.uniform(0.7, 0.95), 2)
        })

    simulation_response = {
        "type": "SIMULATION_RESULT",
        "scenario": scenario.dict(),
        "timestamp": datetime.now().isoformat(),
        "results": prediction_results,
        "recommendation": f"AI recommends pre-emptive deployment of 2 units to {target_neighbors[0]}."
    }
    await state.broadcast(simulation_response)
    return simulation_response

@app.post("/crisis/toggle")
async def toggle_crisis_mode():
    state.crisis_mode = not state.crisis_mode
    if state.crisis_mode:
        state.response_metrics["reduction"] = f"{random.randint(15, 30)}%"
    else:
        state.response_metrics["reduction"] = "0%"
    
    await state.broadcast({
        "type": "SYSTEM_STATE",
        "crisis_mode": state.crisis_mode,
        "metrics": state.response_metrics
    })
    return {"status": "ok", "crisis_mode": state.crisis_mode}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    state.active_connections.append(websocket)
    # Send initial state
    await websocket.send_json({
        "type": "SYSTEM_STATE",
        "crisis_mode": state.crisis_mode,
        "metrics": state.response_metrics,
        "edge_nodes": state.edge_nodes
    })
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in state.active_connections:
            state.active_connections.remove(websocket)

async def simulate_incidents():
    while True:
        await asyncio.sleep(random.randint(30, 60))
        incident = {
            "id": f"INC-{random.randint(100, 999)}",
            "type": random.choice(["COLLISION", "FIRE_HAZARD", "POWER_OUTAGE"]),
            "sector": random.choice(["Sector-A", "Sector-B", "Sector-C", "Sector-D"]),
            "severity": random.choice(["HIGH", "CRITICAL"]),
            "timestamp": datetime.now().isoformat()
        }
        await state.broadcast({"type": "INCIDENT", "data": incident})

async def simulate_drones():
    drones = [{"id": f"UAV-{i:03d}", "battery": 95, "status": "PATROL", "alt": 120, "mission": "Sector-A Patrol", "payload": "HEALTHY"} for i in range(50)]
    while True:
        for d in drones:
            d["battery"] = max(0, d["battery"] - 0.1)
            if d["battery"] < 20: 
                d["status"] = "RECHARGING"
                d["mission"] = "Returning to Base"
            
            d["alt"] = int(120 + (random.random() - 0.5) * 10)
            
        await state.broadcast({
            "type": "DRONE_TELEMETRY",
            "drones": drones[:10],
            "grpc_latency": round(0.3 + random.random() * 0.2, 2)
        })
        await asyncio.sleep(3)

@app.post("/swarm/launch")
async def launch_swarm():
    print("SWARM OVERRIDE: Deploying tactical units to Sector-D")
    return {"status": "LAUNCHED", "units": 15}

async def simulate_infra():
    assets = [
        {"id": "BR-01", "name": "Sector-A Skybridge", "type": "BRIDGE", "score": 92, "vibration": 1.2, "days_to_maint": 140},
        {"id": "TN-04", "name": "Downtown Sub-Tunnel", "type": "TUNNEL", "score": 84, "vibration": 2.4, "days_to_maint": 45},
        {"id": "CR-09", "name": "Transit Hub Corridor", "type": "CONCOURSE", "score": 78, "vibration": 3.1, "days_to_maint": 12}
    ]
    while True:
        for a in assets:
            # Simulate slight score decay or fluctuation
            a["score"] = max(0, min(100, a["score"] + (random.random() - 0.5) * 0.5))
            # Simulate vibration jitter (FFT amplitude)
            a["vibration"] = round(a["vibration"] + (random.random() - 0.5) * 0.2, 2)
            # Tick down maintenance days
            if random.random() > 0.95: a["days_to_maint"] = max(0, a["days_to_maint"] - 1)
            
        await state.broadcast({
            "type": "INFRA_HEALTH",
            "assets": assets
        })
        await asyncio.sleep(4)

async def simulate_energy():
    while True:
        data = {
            "load": random.randint(400, 600),
            "renewable": random.randint(60, 85),
            "v2g_active": random.randint(200, 450),
            "carbon_credits": random.randint(1000, 5000),
            "stability": round(98 + random.random() * 1.8, 2),
            "heat_mitigation": round(1.5 + random.random() * 2.5, 1)
        }
        await state.broadcast({
            "type": "ENERGY_METABOLISM",
            "data": data
        })
        await asyncio.sleep(5)

async def simulate_federated():
    agg_round = 1042
    gain = 2.4
    while True:
        agg_round += 1
        gain = round(gain + random.random() * 0.1, 2)
        data = {
            "peers": random.randint(12, 24),
            "aggregation_round": agg_round,
            "epsilon": 1.0,
            "data_contribution": random.randint(500, 2000),
            "krum_score": round(0.98 + random.random() * 0.019, 3),
            "knowledge_gain": gain
        }
        await state.broadcast({
            "type": "FEDERATED_SYNC",
            "data": data
        })
        await asyncio.sleep(8)

async def simulate_health():
    while True:
        data = {
            "viral_load": round(0.1 + random.random() * 0.4, 3),
            "hospital_occupancy": random.randint(65, 92),
            "wastewater_risk": "HIGH" if random.random() > 0.9 else "LOW",
            "medical_dispatch": random.randint(5, 25)
        }
        await state.broadcast({
            "type": "BIO_SENTINEL",
            "data": data
        })
        await asyncio.sleep(6)

@app.post("/policy/simulate")
async def simulate_policy(req: dict):
    policy = req.get("policy", "UNKNOWN")
    print(f"GOVERNANCE: Simulating impact of {policy}")
    data = {
        "active_policy": policy.replace("_", " "),
        "impact_score": random.randint(15, 35),
        "citizen_approval": random.randint(60, 80),
        "bias_index": round(random.random() * 0.05, 3),
        "compliance_audit": "PASSED" if random.random() > 0.1 else "REVIEW REQ"
    }
    await state.broadcast({"type": "POLICY_UPDATE", "data": data})
    return {"status": "SIMULATING", "policy": policy}

async def simulate_governance():
    while True:
        await state.broadcast({
            "type": "POLICY_UPDATE",
            "data": {
                "ethical_alignment": random.randint(95, 99)
            }
        })
        await asyncio.sleep(10)

async def simulate_logistics():
    while True:
        data = {
            "active_bots": random.randint(1200, 4500),
            "fulfillment_rate": random.randint(88, 97),
            "sidewalk_load": random.randint(12, 45),
            "avg_delivery_time": random.randint(8, 14)
        }
        await state.broadcast({
            "type": "LOGISTICS_SYNC",
            "data": data
        })
        await asyncio.sleep(7)

async def simulate_economy():
    gdp = 2.4
    while True:
        gdp = round(gdp + (random.random() - 0.5) * 0.05, 2)
        data = {
            "velocity": round(0.5 + random.random() * 2.5, 2),
            "volatility": round(random.random() * 8.0, 1),
            "budget_surplus": random.randint(12000000, 45000000),
            "digital_footfall": random.randint(400, 1000),
            "permits_issued": random.randint(50, 150),
            "gdp_projection": gdp
        }
        await state.broadcast({
            "type": "ECONOMY_HEARTBEAT",
            "data": data
        })
        await asyncio.sleep(6)

async def simulate_security():
    while True:
        data = {
            "did_authenticity": round(99.8 + random.random() * 0.2, 2),
            "zkp_proofs": random.randint(800, 1500),
            "mtls_status": "ENCRYPTED" if random.random() > 0.05 else "AUDITING",
            "privacy_audit": "PASSED"
        }
        await state.broadcast({
            "type": "SECURITY_SHIELD",
            "data": data
        })
        await asyncio.sleep(4)

@app.post("/execute/lockdown")
async def execute_lockdown():
    print("CRITICAL: SYSTEM-WIDE SECURITY LOCKDOWN INITIATED")
    return {"status": "LOCKDOWN_ACTIVE"}

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_incidents())
    asyncio.create_task(simulate_drones())
    asyncio.create_task(simulate_infra())
    asyncio.create_task(simulate_energy())
    asyncio.create_task(simulate_federated())
    asyncio.create_task(simulate_health())
    asyncio.create_task(simulate_governance())
    asyncio.create_task(simulate_logistics())
    asyncio.create_task(simulate_economy())
    asyncio.create_task(simulate_security())

@app.post("/command")
async def process_command(cmd: dict):
    text = cmd.get("text", "").lower()
    context = cmd.get("context", {})
    
    # Module 1: NLP Intent Recognition with Confirmation & Briefing
    response = ""
    evidence = []
    requires_confirmation = False
    action = None
    
    if "status" in text or "report" in text or "briefing" in text:
        # Simulate City Briefing (Summary of last 2 hours)
        response = "CITY BRIEFING: Over the last 120 minutes, the urban OS has autonomously resolved 14 traffic anomalies. Air quality in Sector-B improved by 12% following the dynamic lane reversal at 18:45. No high-criticality threats detected."
        evidence = [
            {"label": "Anomalies Resolved", "value": "14", "status": "OPTIMAL"},
            {"label": "Air Quality Gain", "value": "+12%", "status": "IMPROVING"}
        ]
    elif "lockdown" in text or "shutdown" in text:
        response = "CRITICAL COMMAND DETECTED. Authorization required to initiate Sector-A infrastructure lockdown. Proceed?"
        requires_confirmation = True
        action = {"type": "INFRASTRUCTURE_LOCKDOWN"}
    elif "emergency" in text or "incident" in text:
        response = "Scanning active incidents. Two ambulances have been pre-positioned near Sector-C due to elevated risk scores."
        evidence = [
            {"label": "Active Units", "value": "14", "status": "DEPLOYED"},
            {"label": "Pre-emptive", "value": "ACTIVE", "status": "HIGH"}
        ]
    else:
        response = "Command acknowledged. System is parsing your request against the Digital Twin. No immediate anomalies detected."
        evidence = [{"label": "System Check", "value": "PASS", "status": "READY"}]

    return {
        "response": response,
        "evidence": evidence,
        "requires_confirmation": requires_confirmation,
        "action": action,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/execute/{action_type}")
async def execute_action(action_type: str):
    # Log to governance audit
    print(f"EXECUTING HIGH-CONSEQUENCE ACTION: {action_type}")
    return {"status": "SUCCESS", "action": action_type}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
