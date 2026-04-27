import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  AlertCircle, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  BarChart3, 
  Navigation,
  Layers,
  Search,
  Bell,
  Settings,
  BrainCircuit,
  Play,
  RotateCcw,
  ShieldAlert,
  X,
  Globe,
  Leaf,
  Thermometer,
  Sparkles,
  Plane,
  ArrowRight,
  Mic,
  Image,
  Scale,
  Package,
  Lock,
  Terminal
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, LayerGroup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_HISTORICAL_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: `${12 + Math.floor(i/4)}:${(i%4)*15 || '00'}`,
  density: 40 + Math.random() * 40,
  prediction: 45 + Math.random() * 45
}));

// Helper to fix Leaflet size issues
const ResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [map]);
  return null;
};

// Sub-component to handle map resizing and node display
// Sub-component to handle map resizing and node display
const DigitalTwinMap = React.memo(({ center, zoom, telemetry, envData, wasteData, emergencyUnits, activeLayers, publicHealth, infraHealth, droneFleet }) => {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true} 
      style={{ height: "100%", width: "100%", background: "#050608" }}
      zoomControl={false}
    >
      <ResizeHandler />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {activeLayers.environment && envData.map((e, i) => (
        <CircleMarker 
          key={`env-${i}`} 
          center={[40.7128 + (i*0.01), -74.0060 + (i*0.01)]} 
          radius={60} 
          pathOptions={{ 
            color: e.status === 'POOR' ? '#ef4444' : '#10b981', 
            fillColor: e.status === 'POOR' ? '#ef4444' : '#10b981', 
            fillOpacity: 0.05, 
            weight: 0 
          }} 
          className="pollution-heatmap"
        />
      ))}

      {activeLayers.waste && wasteData.map((w, i) => (
        <CircleMarker 
          key={`bin-${w.bin_id}`} 
          center={[40.7300 + (i*0.005), -73.9900 + (i*0.005)]} 
          radius={w.needs_collection ? 10 : 5} 
          pathOptions={{ color: w.needs_collection ? '#f97316' : '#94a3b8', fillColor: w.needs_collection ? '#f97316' : '#94a3b8', fillOpacity: 0.8 }} 
        >
          <Popup>Bin {w.bin_id}: {w.fill_level.toFixed(0)}% full</Popup>
        </CircleMarker>
      ))}

      {activeLayers.traffic && (
        <>
          <CircleMarker center={[40.7128, -74.0060]} radius={12} pathOptions={{ color: '#00e5ff', fillColor: '#00e5ff', fillOpacity: 0.4, weight: 2 }}>
            <Popup className="dark-popup">
              <div className="p-2" style={{ color: '#fff' }}>
                <h4 className="text-sm font-bold mb-1">Times Square Node</h4>
                <p className="text-xs text-zinc-400">Density: 82% (High)</p>
                <p className="text-xs text-cyan-400 font-bold">AI Rerouting Active</p>
              </div>
            </Popup>
          </CircleMarker>

          {telemetry.map(t => (
            <CircleMarker 
              key={t.id} 
              center={[40.7128 + (Math.random()-0.5)*0.05, -74.0060 + (Math.random()-0.5)*0.05]} 
              radius={4} 
              pathOptions={{ color: t.density === 'CRITICAL' ? '#ff4444' : '#00e5ff', fillColor: t.density === 'CRITICAL' ? '#ff4444' : '#00e5ff', fillOpacity: 0.8 }} 
            />
          ))}
        </>
      )}

      {activeLayers.emergency && emergencyUnits.map(unit => (
        <CircleMarker 
          key={unit.id} 
          center={unit.pos} 
          radius={8} 
          pathOptions={{ 
            color: unit.type === 'FIRE' ? '#ef4444' : '#ffffff', 
            fillColor: unit.type === 'FIRE' ? '#ef4444' : '#3b82f6', 
            fillOpacity: 1, 
            weight: 3 
          }} 
          className="emergency-unit-marker"
        >
          <Popup>
            <div className="text-[10px] font-bold">
              {unit.type} DISPATCH {unit.id}<br/>
              Target: {unit.target}
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {activeLayers.noise && envData.map((e, i) => (
        <CircleMarker 
          key={`noise-${i}`} 
          center={[40.7128 + (i*0.01) - 0.005, -74.0060 + (i*0.01) + 0.005]} 
          radius={e.noise / 2} 
          pathOptions={{ color: e.noise > 80 ? '#fbbf24' : '#6366f1', fillColor: e.noise > 80 ? '#fbbf24' : '#6366f1', fillOpacity: 0.15, weight: 0 }} 
        />
      ))}
      {activeLayers.emergency && (
        <LayerGroup>
          {/* Medical Dispatch Hotspots */}
          <CircleMarker 
             center={[40.7128 + (Math.random()-0.5)*0.08, -74.0060 + (Math.random()-0.5)*0.08]}
             radius={publicHealth.viral_load * 100}
             pathOptions={{ 
               color: 'transparent', 
               fillColor: '#ef4444', 
               fillOpacity: 0.2,
               className: 'pathogen-heatmap'
             }}
          />
        </LayerGroup>
      )}
      {activeLayers.waste && wasteData.map((bin, i) => (
        <CircleMarker 
          key={`bin-${i}`} 
          center={[40.7128 + (i*0.008) - 0.004, -74.0060 + (i*0.008) + 0.004]} 
          radius={4} 
          pathOptions={{ color: bin.needs_collection ? '#f97316' : '#71717a', fillColor: bin.needs_collection ? '#f97316' : '#71717a', fillOpacity: 0.6 }} 
        />
      ))}
      {activeLayers.traffic && infraHealth.map((asset, i) => (
        <CircleMarker 
          key={`infra-${i}`} 
          center={[40.7128 + (i*0.015) - 0.01, -74.0060 + (i*0.015) + 0.01]} 
          radius={6} 
          pathOptions={{ 
            color: asset.score < 80 ? '#fbbf24' : '#10b981', 
            fillColor: asset.score < 80 ? '#fbbf24' : '#10b981', 
            fillOpacity: 0.4,
            weight: 2,
            dashArray: '5, 5'
          }} 
        >
          <Popup>
             <div className="text-[10px] font-bold">{asset.name}</div>
             <div className="text-[9px]">Status: {asset.score.toFixed(1)}% RUL</div>
          </Popup>
        </CircleMarker>
      ))}
      {activeLayers.v2x && droneFleet.map((drone, i) => (
        <CircleMarker 
          key={`drone-${i}`} 
          center={[40.7128 + (Math.random()-0.5)*0.1, -74.0060 + (Math.random()-0.5)*0.1]} 
          radius={3} 
          pathOptions={{ 
            color: 'white', 
            fillColor: drone.status === 'MISSION' ? '#a855f7' : '#22d3ee', 
            fillOpacity: 0.9, 
            weight: 0.5 
          }} 
        />
      ))}
    </MapContainer>
  );
});

function App() {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(13);
  const [telemetry, setTelemetry] = useState([]);
  const [envData, setEnvData] = useState([]);
  const [wasteData, setWasteData] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [activeLayers, setActiveLayers] = useState({ traffic: true, environment: false, waste: false, noise: false, emergency: true, v2x: false });
  const [crisisMode, setCrisisMode] = useState(false);
  const [crisisMetrics, setCrisisMetrics] = useState({ current: 4.2, target: 3.0, reduction: "0%" });
  const [edgeNodes, setEdgeNodes] = useState([]);
  const [emergencyUnits, setEmergencyUnits] = useState([]);
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [infraStats, setInfraStats] = useState({
    brokerLag: "4ms",
    throughput: "1.2GB/s",
    activeShards: 42,
    security: "mTLS ACTIVE"
  });
  const [rawEvents, setRawEvents] = useState([]);
  const [latencyTrace, setLatencyTrace] = useState({ ingest: 4, perceive: 12, stream: 2, predict: 24, total: 42 });
  const [citizenAlerts, setCitizenAlerts] = useState([]);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [droneFleet, setDroneFleet] = useState([]);
  const [infraHealth, setInfraHealth] = useState([]);
  const [energyGrid, setEnergyGrid] = useState({ load: 0, renewable: 0, v2g_active: 0, carbon_credits: 0, stability: 99, island_mode: false });
  const [federatedNet, setFederatedNet] = useState({ peers: 0, aggregation_round: 0, epsilon: 1.0, data_contribution: 0, krum_score: 0.99, knowledge_gain: 0 });
  const [publicHealth, setPublicHealth] = useState({ viral_load: 0, hospital_occupancy: 0, wastewater_risk: 'LOW', medical_dispatch: 0 });
  const [policySim, setPolicySim] = useState({ 
    active_policy: 'NONE', 
    impact_score: 0, 
    ethical_alignment: 99, 
    citizen_approval: 82,
    bias_index: 0.02,
    compliance_audit: 'PASSED'
  });
  const [logisticsSwarm, setLogisticsSwarm] = useState({ active_bots: 0, fulfillment_rate: 0, sidewalk_load: 0, avg_delivery_time: 0 });
  const [urbanEconomy, setUrbanEconomy] = useState({ 
    velocity: 0, 
    volatility: 0, 
    budget_surplus: 0, 
    digital_footfall: 0,
    permits_issued: 0,
    gdp_projection: 2.4
  });
  const [urbanShield, setUrbanShield] = useState({ did_authenticity: 99.9, zkp_proofs: 0, mtls_status: 'ENCRYPTED', privacy_audit: 'PASSED' });
  const [showPeerMap, setShowPeerMap] = useState(false);
  const [heatMitigation, setHeatMitigation] = useState(0);
  const [cityBriefing, setCityBriefing] = useState(null);
  const [shadowMode, setShadowMode] = useState(false);
  const [stats, setStats] = useState({
    throughput: "88%",
    efficiency: "+24.2%",
    uptime: "99.999%",
    riskLevel: "Low"
  });
  const [simConfig, setSimConfig] = useState({ sector: "Sector-A", action: "CLOSE", duration: 2 });

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        // Phase 4: Observability Tracking
        if (msg.type?.includes("_UPDATE")) {
          setRawEvents(prev => [msg, ...prev].slice(0, 10));
          setLatencyTrace({
            ingest: 2 + Math.random() * 4,
            perceive: 8 + Math.random() * 10,
            stream: 1 + Math.random() * 2,
            predict: 20 + Math.random() * 15,
            total: 31 + Math.random() * 31
          });
        }

        if (msg.type === "TRAFFIC_UPDATE") {
          setTelemetry(prev => [msg.data, ...prev].slice(0, 10));
          if (msg.data.decision) {
            setDecisions(prev => [msg.data.decision, ...prev].slice(0, 5));
          }
        } else if (msg.type === "ENVIRONMENT_UPDATE") {
          setEnvData(prev => [msg.data, ...prev].slice(0, 5));
        } else if (msg.type === "WASTE_UPDATE") {
          setWasteData(prev => {
            const filtered = prev.filter(b => b.bin_id !== msg.data.bin_id);
            return [msg.data, ...filtered].slice(0, 10);
          });
        } else if (msg.type === "SYSTEM_STATE") {
          setCrisisMode(msg.crisis_mode);
          setCrisisMetrics(msg.metrics);
          setEdgeNodes(msg.edge_nodes || []);
        } else if (msg.type === "INCIDENT") {
          setIncidents(prev => [msg.data, ...prev].slice(0, 5));
          
          const newAlert = {
            id: `ALRT-${Math.floor(Math.random()*900)+100}`,
            message: `⚠️ EMERGENCY: ${msg.data.type} detected in ${msg.data.sector}. Seek alternate routes.`,
            timestamp: new Date().toLocaleTimeString()
          };
          setCitizenAlerts(prev => [newAlert, ...prev].slice(0, 3));
          // Auto-spawn emergency unit
          const newUnit = {
            id: `UNIT-${Math.floor(Math.random()*900)+100}`,
            type: msg.data.type === 'FIRE_HAZARD' ? 'FIRE' : 'MEDICAL',
            pos: [40.7128 + (Math.random()-0.5)*0.1, -74.0060 + (Math.random()-0.5)*0.1],
            target: msg.data.sector
          };
          setEmergencyUnits(prev => [...prev, newUnit].slice(-3));
        } else if (msg.type === "DRONE_TELEMETRY") {
          setDroneFleet(msg.drones);
          setLatencyTrace(prev => ({ ...prev, gRPC: msg.grpc_latency }));
        } else if (msg.type === "INFRA_HEALTH") {
          setInfraHealth(msg.assets);
        } else if (msg.type === "SECURITY_SHIELD") {
          setUrbanShield(msg.data);
        } else if (msg.type === "ECONOMY_HEARTBEAT") {
          setUrbanEconomy(msg.data);
        } else if (msg.type === "LOGISTICS_SYNC") {
          setLogisticsSwarm(msg.data);
        } else if (msg.type === "POLICY_UPDATE") {
          setPolicySim(prev => ({ ...prev, ...msg.data }));
        } else if (msg.type === "BIO_SENTINEL") {
          setPublicHealth(msg.data);
        } else if (msg.type === "FEDERATED_SYNC") {
          setFederatedNet(msg.data);
        } else if (msg.type === "ENERGY_METABOLISM") {
          setEnergyGrid(prev => ({ ...prev, ...msg.data }));
          setHeatMitigation(msg.data.heat_mitigation);
        } else if (msg.type === "SIMULATION_RESULT") {
          setSimResult(msg);
        }
      } catch (e) {
        console.error("WS Parse error", e);
      }
    };
    return () => ws.close();
  }, []);

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimResult(null);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const res = await fetch("http://localhost:8000/simulate/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector: simConfig.sector,
          action: simConfig.action,
          duration_hours: simConfig.duration
        })
      });
      const data = await res.json();
      setSimResult(data);
    } catch (e) {
      console.error("Simulation failed", e);
    } finally {
      setIsSimulating(false);
    }
  };

  const submitCommand = async () => {
    if (!command.trim()) return;
    const userMsg = { role: 'operator', text: command, timestamp: new Date().toLocaleTimeString() };
    setCommandHistory(prev => [...prev, userMsg]);
    const currentCmd = command;
    setCommand("");
    
    try {
      // Phase 6: High-Consequence Confirmation Logic
      if (pendingAction && (currentCmd.toLowerCase().includes("yes") || currentCmd.toLowerCase().includes("confirm"))) {
         const resp = await fetch(`http://localhost:8000/execute/${pendingAction.type}`, { method: 'POST' });
         setCommandHistory(prev => [...prev, { role: 'acis', text: `Authorized. ${pendingAction.type} has been executed.`, timestamp: new Date().toLocaleTimeString() }]);
         setPendingAction(null);
         return;
      }

      const resp = await fetch('http://localhost:8000/command', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ text: currentCmd, context: { crisisMode, stats, pendingAction } })
      });
      const data = await resp.json();
      
      if (data.requires_confirmation) {
         setPendingAction(data.action);
      }

      setCommandHistory(prev => [...prev, { 
        role: 'acis', 
        text: data.response, 
        evidence: data.evidence,
        timestamp: new Date().toLocaleTimeString() 
      }]);
      
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.response.substring(0, 100));
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error(e);
    }
  };


  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Top Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight gradient-text">ACIS COMMAND</h1>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Autonomous Civic Intelligence System v2.0</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
           <div className="w-full max-w-2xl relative group">
              <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full"></div>
              <div className="relative flex items-center bg-white/5 border border-white/10 focus-within:border-cyan-500/50 rounded-2xl p-1 backdrop-blur-xl transition-all">
                 <button 
                   onClick={() => setIsListening(!isListening)}
                   className={`p-2.5 rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-500 hover:text-white'}`}
                 >
                    <Mic size={18} />
                 </button>
                 <input 
                    type="text" 
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitCommand()}
                    placeholder="Command the city... (e.g. 'Status report', 'Emergency in Sector B')"
                    className="flex-1 bg-transparent border-none outline-none px-3 text-xs text-white placeholder:text-zinc-600"
                 />
                 <div className="flex items-center gap-1 pr-1">
                    <button className="p-1.5 text-zinc-500 hover:text-cyan-400"><Image size={16} /></button>
                    <button 
                      onClick={submitCommand}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black p-1.5 rounded-xl transition-all"
                    >
                       <ArrowRight size={18} />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Network Status</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="status-pulse"></span> OPERATIONAL
              </span>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Decision Mode</span>
              <span className="text-xs font-semibold text-cyan-400">AUTONOMOUS</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                await fetch("http://localhost:8000/crisis/toggle", { method: "POST" });
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${crisisMode ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
            >
              <ShieldAlert size={14} /> CRISIS MODE
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400"><Search size={20} /></button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400"><Bell size={20} /></button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400"><Settings size={20} /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Sidebar - Metrics */}
        <aside className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar p-1">
          <section className="glass-panel p-4">
            <div className="card-title">City Health Scorecard</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Throughput", val: stats.throughput, icon: Zap, color: "text-yellow-400" },
                { label: "Efficiency", val: stats.efficiency, icon: BarChart3, color: "text-cyan-400" },
                { label: "Uptime", val: stats.uptime, icon: ShieldCheck, color: "text-emerald-400" },
                { label: "Risk Level", val: crisisMode ? "CRITICAL" : stats.riskLevel, icon: AlertCircle, color: crisisMode ? "text-red-500" : "text-blue-400" }
              ].map((item, idx) => (
                <div key={idx} className={`bg-white/5 rounded-lg p-3 border ${item.label === 'Risk Level' && crisisMode ? 'border-red-500/50 bg-red-500/10' : 'border-white/5'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon size={12} className={item.color} />
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">{item.label}</span>
                  </div>
                  <div className="text-xl font-bold data-number">{item.val}</div>
                </div>
              ))}
            </div>
          </section>

          {crisisMode && (
            <section className="glass-panel p-4 border-red-500/30 bg-red-500/5 animate-pulse">
              <div className="card-title text-red-400 flex items-center gap-2">
                <Zap size={14} /> Emergency Efficiency
              </div>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <div className="text-3xl font-bold data-number text-white">{crisisMetrics.current}m</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Current Response Time</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-400">-{crisisMetrics.reduction}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">AI Latency Gain</div>
                </div>
              </div>
            </section>
          )}

          <section className="glass-panel p-4">
            <div className="card-title flex items-center gap-2">
              <Cpu size={14} className="text-emerald-400" /> Edge Intelligence
            </div>
            <div className="space-y-3 mt-2">
               {edgeNodes.map(node => (
                 <div key={node.id} className="flex flex-col gap-1.5 p-2 bg-white/5 rounded border border-white/5">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-zinc-300">{node.id}</span>
                       <span className={`text-[8px] px-1 rounded font-bold ${node.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {node.status}
                       </span>
                    </div>
                    <div className="flex justify-between items-end">
                       <span className="text-[8px] text-zinc-500 uppercase">{node.type}</span>
                       <span className="text-[10px] font-mono text-zinc-400">{node.latency}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${node.load > 80 ? 'bg-red-500' : node.load > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
                         style={{ width: `${node.load}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="glass-panel p-4 flex flex-col min-h-0 border-cyan-500/20 bg-cyan-500/5">
            <div className="card-title flex items-center gap-2">
               <BrainCircuit size={14} className="text-cyan-400" /> 
               <span>Neural Command Center (Module 1)</span>
            </div>
            <div className="flex-1 overflow-y-auto mt-2 space-y-3 pr-1">
               {commandHistory.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 opacity-50">
                    <Terminal size={32} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Awaiting Command...</span>
                 </div>
               ) : (
                 commandHistory.map((msg, i) => (
                   <div key={i} className={`flex flex-col ${msg.role === 'operator' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[90%] p-2 rounded-xl text-[10px] leading-relaxed ${msg.role === 'operator' ? 'bg-cyan-500 text-black font-bold' : 'bg-white/10 text-zinc-200 border border-white/5'}`}>
                         {msg.text}
                      </div>
                      <span className="text-[8px] text-zinc-600 mt-1 uppercase font-bold">{msg.role} • {msg.timestamp}</span>
                      
                      {msg.evidence && (
                        <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                           {msg.evidence.map((ev, j) => (
                             <div key={j} className="bg-black/40 border border-white/5 p-1.5 rounded-lg flex justify-between items-center">
                                <span className="text-[8px] text-zinc-500 uppercase font-bold">{ev.label}</span>
                                <span className={`text-[9px] font-bold ${ev.status === 'ALERT' ? 'text-red-400' : 'text-cyan-400'}`}>{ev.value}</span>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                 ))
               )}
            </div>
          </section>
        </aside>

        {/* Center - 3D Digital Twin Map */}
        <section className="flex-1 glass-panel relative overflow-hidden group">
          <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
            <button className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded flex items-center gap-2 text-xs font-bold hover:bg-black/80 transition-all">
              <Layers size={14} className="text-cyan-400" /> MAP LAYERS
            </button>
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded flex flex-col gap-2">
              <div 
                onClick={() => setActiveLayers(p => ({...p, traffic: !p.traffic}))}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${activeLayers.traffic ? 'opacity-100' : 'opacity-40'}`}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <span className="text-[10px] font-bold text-zinc-300 uppercase">Traffic Flow</span>
                <div 
                onClick={() => setActiveLayers(p => ({...p, v2x: !p.v2x}))}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${activeLayers.v2x ? 'opacity-100' : 'opacity-40'}`}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <span className="text-[10px] font-bold text-zinc-300 uppercase">V2X Telemetry</span>
              </div>
            </div>
              <div 
                onClick={() => setActiveLayers(p => ({...p, environment: !p.environment}))}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${activeLayers.environment ? 'opacity-100' : 'opacity-40'}`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-zinc-300 uppercase">Air Quality</span>
              </div>
              <div 
                onClick={() => setActiveLayers(p => ({...p, waste: !p.waste}))}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${activeLayers.waste ? 'opacity-100' : 'opacity-40'}`}
              >
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-[10px] font-bold text-zinc-300 uppercase">Waste Logistics</span>
              </div>
              <div 
                onClick={() => setActiveLayers(p => ({...p, noise: !p.noise}))}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${activeLayers.noise ? 'opacity-100' : 'opacity-40'}`}
              >
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-[10px] font-bold text-zinc-300 uppercase">Acoustic Load</span>
              </div>
              <div className="h-px bg-white/5 my-2"></div>
              <div 
                onClick={() => setShadowMode(!shadowMode)}
                className={`flex items-center gap-2 cursor-pointer transition-all ${shadowMode ? 'text-purple-400 font-bold' : 'text-zinc-500 opacity-40'}`}
              >
                <Sparkles size={12} className={shadowMode ? 'animate-spin' : ''} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Shadow Mode (T+15m)</span>
              </div>
            </div>
          </div>

          <div className={`w-full h-full transition-all duration-700 ${privacyMode ? 'privacy-filter' : ''} ${shadowMode ? 'shadow-mode-glow' : ''}`}>
            <DigitalTwinMap 
              center={mapCenter} 
              zoom={mapZoom} 
              telemetry={telemetry} 
              envData={envData}
              wasteData={wasteData}
              emergencyUnits={emergencyUnits}
              activeLayers={activeLayers}
              publicHealth={publicHealth}
              infraHealth={infraHealth}
              droneFleet={droneFleet}
            />
          </div>

          {/* Simulation Overlay HUD */}
          <AnimatePresence>
            {!simResult ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-20 right-4 z-[1000] w-64 glass-panel p-4"
              >
                <div className="card-title">What-If Simulator</div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Target Sector</label>
                    <select 
                      value={simConfig.sector}
                      onChange={(e) => setSimConfig({...simConfig, sector: e.target.value})}
                      className="w-full bg-[#111318] border border-white/10 rounded p-1.5 text-xs text-zinc-200 outline-none"
                    >
                      {["Sector-A", "Sector-B", "Sector-C", "Sector-D", "Sector-E"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Action</label>
                    <select 
                      value={simConfig.action}
                      onChange={(e) => setSimConfig({...simConfig, action: e.target.value})}
                      className="w-full bg-[#111318] border border-white/10 rounded p-1.5 text-xs text-zinc-200 outline-none"
                    >
                      <option value="CLOSE">Full Closure</option>
                      <option value="RESTRICT">Heavy Restriction</option>
                    </select>
                  </div>
                  <button 
                    disabled={isSimulating}
                    onClick={runSimulation}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    {isSimulating ? <Activity size={14} className="animate-spin" /> : <Play size={14} />}
                    {isSimulating ? "PROCESSING..." : "RUN PREDICTION"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-20 right-4 z-[1000] w-80 glass-panel p-4 border-purple-500/30"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="card-title text-purple-400 mb-0">Simulation Result</div>
                  <button onClick={() => setSimResult(null)} className="text-zinc-500 hover:text-white"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-[10px] text-zinc-400 italic leading-relaxed">"{simResult.recommendation}"</p>
                  </div>
                  <div className="space-y-2">
                    {simResult.results.map((res, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded">
                        <div>
                          <div className="text-xs font-bold text-zinc-200">{res.sector} Impact</div>
                          <div className="text-[10px] text-zinc-500">{res.original_density} → <span className="text-red-400">{res.predicted_density}</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-red-400">{res.load_increase}</div>
                          <div className="text-[9px] text-zinc-500">ACCURACY: {res.impact_score * 100}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-2/3 max-w-xl">
             <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Navigation size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Current Optimization</div>
                    <div className="text-xs font-bold text-zinc-200">Corridor NYC-S7 Flow Maximization</div>
                  </div>
                </div>
                <div className="flex gap-4">
                   <div className="text-right">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">Latency</div>
                      <div className="text-xs font-mono text-emerald-400">14ms</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">Precision</div>
                      <div className="text-xs font-mono text-purple-400">99.2%</div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Right Sidebar - Activity & Decisions */}
        <aside className="w-96 flex flex-col gap-4 overflow-y-auto custom-scrollbar p-1">
          <section className="glass-panel p-4 flex flex-col">
            <div className="card-title flex justify-between">
               <span>Live Intelligence Stream</span>
               <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">YOLOv10 ACTIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
              <AnimatePresence initial={false}>
                {telemetry.map((item, idx) => (
                  <motion.div
                    key={item.id || `${item.sensor_id}-${idx}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-start gap-3"
                  >
                    <div className={`mt-1 p-1.5 rounded ${item.density === 'CRITICAL' ? 'bg-red-500/20' : 'bg-cyan-500/10'}`}>
                      <Activity size={14} className={item.density === 'CRITICAL' ? 'text-red-400' : 'text-cyan-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="text-xs font-bold text-zinc-200">{item.sector}</span>
                        <span className="text-[9px] text-zinc-500">{item.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">Detection: {item.vehicle_count} units | {item.density} DENSITY</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.prediction === 'INCREASING' ? 'text-yellow-400 bg-yellow-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                          TREND: {item.prediction}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <section className="glass-panel p-4">
            <div className="card-title flex items-center gap-2">
               <Activity size={14} className="text-cyan-400" /> 
               <span>Infrastructure Performance (v4)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
               <div className="bg-white/5 p-2 rounded border border-white/5">
                  <div className="text-[8px] text-zinc-500 uppercase font-bold">Broker Lag</div>
                  <div className="text-xs font-mono text-emerald-400">{infraStats.brokerLag}</div>
               </div>
               <div className="bg-white/5 p-2 rounded border border-white/5">
                  <div className="text-[8px] text-zinc-500 uppercase font-bold">Throughput</div>
                  <div className="text-xs font-mono text-cyan-400">{infraStats.throughput}</div>
               </div>
               <div className="bg-white/5 p-2 rounded border border-white/5">
                  <div className="text-[8px] text-zinc-500 uppercase font-bold">Active Shards</div>
                  <div className="text-xs font-mono text-purple-400">{infraStats.activeShards}</div>
               </div>
               <div className="bg-white/5 p-2 rounded border border-white/5">
                  <div className="text-[8px] text-zinc-500 uppercase font-bold">Security</div>
                  <div className="text-[10px] font-bold text-emerald-500/80">{infraStats.security}</div>
               </div>
            </div>
            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-500/50 animate-pulse" style={{ width: '85%' }}></div>
            </div>
          </section>

          <section className="glass-panel p-4 flex flex-col min-h-0 border-cyan-500/10">
            <div className="card-title flex items-center gap-2">
               <Activity size={14} className="text-cyan-400" /> 
               <span>Live Kafka Event Stream (Geo-Sharded)</span>
            </div>
            <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
               {rawEvents.map((ev, i) => (
                 <div key={i} className="p-1.5 bg-black/40 rounded border border-white/5 font-mono text-[8px] text-cyan-500/70 overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="text-zinc-500">[{new Date().toLocaleTimeString()}]</span> {JSON.stringify(ev.data)}
                 </div>
               ))}
            </div>
            <div className="mt-2 border-t border-white/5 pt-2">
               <div className="flex justify-between text-[8px] text-zinc-500 uppercase font-bold mb-1">
                  <span>Distributed Trace</span>
                  <span className="text-cyan-400">{latencyTrace.total.toFixed(0)}ms TOTAL</span>
               </div>
               <div className="flex gap-1 h-1">
                  <div className="bg-blue-500" style={{ width: '10%' }}></div>
                  <div className="bg-cyan-500" style={{ width: '25%' }}></div>
                  <div className="bg-purple-500" style={{ width: '15%' }}></div>
                  <div className="bg-pink-500" style={{ width: '50%' }}></div>
               </div>
            </div>
          </section>

          <section className="glass-panel p-4 flex flex-col border-amber-500/20 bg-amber-500/5">
            <div className="card-title flex items-center gap-2">
               <Bell size={14} className="text-amber-400" /> 
               <span>Citizen Communication (Public Alerts)</span>
            </div>
            <div className="space-y-2 mt-2">
               {citizenAlerts.length === 0 ? (
                 <div className="text-[9px] text-zinc-600 italic">No active geofenced alerts.</div>
               ) : (
                 citizenAlerts.map(alert => (
                   <div key={alert.id} className="p-2 bg-black/40 rounded border border-amber-500/30 animate-pulse">
                      <div className="text-[10px] text-amber-400 font-bold mb-1">GEOFENCED BROADCAST</div>
                      <p className="text-[10px] text-zinc-300 leading-tight">{alert.message}</p>
                      <div className="text-[8px] text-zinc-500 mt-1">{alert.timestamp} • SMS/PUSH/APP</div>
                   </div>
                 ))
               )}
            </div>
          </section>
          {/* Module 3: Perfected Drone Swarm OS HUD */}
          <section className="glass-panel p-4 border-purple-500/20 bg-purple-500/5">
            <div className="card-title flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <Plane size={14} className="text-purple-400" />
                  <span>UAV Swarm Intelligence (v6)</span>
               </div>
               <div className="flex gap-2">
                  <span className="text-[8px] text-purple-400 font-bold bg-purple-500/10 px-1 rounded border border-purple-500/20">gRPC: {latencyTrace.gRPC || '0.4'}ms</span>
                  <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-1.5 rounded border border-purple-500/20">{droneFleet.length} UNITS</span>
               </div>
            </div>
            <div className="mt-3 space-y-2 overflow-y-auto max-h-48 pr-1">
               {droneFleet.length === 0 ? (
                 <div className="h-20 flex flex-col items-center justify-center text-zinc-700 gap-2 opacity-50">
                    <Plane size={24} />
                    <span className="text-[9px] uppercase font-bold tracking-widest">Awaiting Swarm Sync...</span>
                 </div>
               ) : (
                 droneFleet.map(drone => (
                   <div key={drone.id} className="bg-black/40 border border-white/5 p-2 rounded-lg flex flex-col gap-1.5 transition-all hover:border-purple-500/30">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-zinc-300">{drone.id}</span>
                            <span className="text-[7px] text-zinc-600 font-bold">PLD: {drone.payload || 'HEALTHY'}</span>
                         </div>
                         <span className={`text-[8px] px-1 rounded font-bold ${drone.status === 'MISSION' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {drone.status}
                         </span>
                      </div>
                      <div className="flex justify-between items-center">
                         <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${drone.battery < 20 ? 'bg-red-500' : 'bg-purple-500'}`} 
                              style={{ width: `${drone.battery}%` }}
                            ></div>
                         </div>
                         <span className="text-[8px] font-mono text-zinc-500 ml-2">{drone.battery}%</span>
                      </div>
                      <div className="text-[8px] text-zinc-500 uppercase flex justify-between">
                         <span>ALT: {drone.alt}m</span>
                         <span className="text-purple-400 font-bold">TASK: {drone.mission || 'PATROL'}</span>
                      </div>
                   </div>
                 ))
               )}
            </div>
            <button 
              onClick={async () => {
                await fetch('http://localhost:8000/swarm/launch', { method: 'POST' });
              }}
              className="w-full mt-2 py-2 border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-[9px] font-bold text-purple-400 rounded-lg transition-all uppercase tracking-widest flex items-center justify-center gap-1 active:scale-95"
            >
               <Zap size={10} /> Initiate Tactical Swarm Deployment
            </button>
          </section>

          {/* Module 4: Infrastructure Health & RUL HUD */}
          <section className="glass-panel p-4 border-emerald-500/20 bg-emerald-500/5">
            <div className="card-title flex items-center gap-2">
               <ShieldCheck size={14} className="text-emerald-400" /> 
               <span>Infrastructure Integrity & RUL</span>
            </div>
            <div className="mt-3 space-y-3">
               {infraHealth.length === 0 ? (
                 <div className="h-20 flex flex-col items-center justify-center text-zinc-700 gap-2 opacity-50">
                    <Zap size={24} />
                    <span className="text-[9px] uppercase font-bold tracking-widest">Scanning Foundations...</span>
                 </div>
               ) : (
                 infraHealth.map(asset => (
                   <div key={asset.id} className="bg-black/40 border border-white/5 p-2.5 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <div className="text-[9px] font-bold text-zinc-300">{asset.name}</div>
                            <div className="text-[7px] text-zinc-500 uppercase tracking-tighter">{asset.type} • ID: {asset.id}</div>
                         </div>
                         <div className={`text-[10px] font-bold ${asset.score > 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {asset.score}% RUL
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="flex-1">
                            <div className="flex justify-between text-[7px] text-zinc-500 mb-1">
                               <span>VIBRATION SPECTRUM (FFT) • CONF: {((asset.score + 10)/1.1).toFixed(1)}%</span>
                               <span>{asset.vibration}Hz</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                               {[...Array(12)].map((_, i) => (
                                 <div 
                                   key={i} 
                                   className={`h-full flex-1 ${asset.score < 85 && i > 8 ? 'bg-red-500/50' : 'bg-emerald-500/50'}`}
                                   style={{ height: `${Math.random() * 100}%` }}
                                 ></div>
                               ))}
                            </div>
                         </div>
                         <div className="text-right">
                            <button 
                              onClick={async () => {
                                await fetch('http://localhost:8000/command', {
                                  method: 'POST',
                                  headers: {'Content-Type': 'application/json'},
                                  body: JSON.stringify({ text: `Dispatch drone for inspection of ${asset.name}` })
                                });
                              }}
                              className="text-[8px] bg-purple-500/20 text-purple-400 font-bold px-1.5 py-1 rounded border border-purple-500/30 hover:bg-purple-500/30 transition-all uppercase"
                            >
                               Inspect
                            </button>
                            <div className="text-[9px] font-bold text-white mt-1">{asset.days_to_maint}D</div>
                         </div>
                      </div>
                   </div>
                 ))
               )}
            </div>
            <button className="w-full mt-3 py-1.5 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-[9px] font-bold text-emerald-400 rounded-lg transition-all uppercase tracking-widest">
               Generate Maintenance Roadmap
            </button>
          </section>

          {/* Module 5: Energy Grid AI HUD */}
          <section className="glass-panel p-4 border-yellow-500/20 bg-yellow-500/5">
            <div className="card-title flex items-center gap-2">
               <Zap size={14} className="text-yellow-400" /> 
               <span>Urban Energy Metabolism</span>
            </div>
            <div className="mt-3 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Grid Load</div>
                     <div className="text-sm font-bold text-white">{energyGrid.load} MW</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Renewable Mix</div>
                     <div className="text-sm font-bold text-emerald-400">{energyGrid.renewable}%</div>
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] text-zinc-400 font-bold uppercase">V2G (Vehicle-to-Grid) Feed</span>
                     <span className="text-[9px] text-cyan-400 font-bold">+{energyGrid.v2g_active} UNITS</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-cyan-500 transition-all duration-1000" 
                       style={{ width: `${(energyGrid.v2g_active / 500) * 100}%` }}
                     ></div>
                  </div>
               </div>

               <div className="bg-white/5 p-2 rounded flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-2">
                     <Thermometer size={12} className="text-orange-400" />
                     <span className="text-[9px] text-zinc-300 font-bold uppercase">Thermal Mitigation</span>
                  </div>
                  <span className="text-[10px] font-mono text-orange-400">-{heatMitigation}°C</span>
               </div>
            </div>
            
            <div className="mt-3 flex gap-2">
               <button 
                 onClick={() => setEnergyGrid(prev => ({ ...prev, island_mode: !prev.island_mode }))}
                 className={`flex-1 py-1.5 border rounded-lg text-[9px] font-bold transition-all uppercase tracking-widest ${energyGrid.island_mode ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 animate-pulse' : 'bg-white/5 border-white/10 text-zinc-500'}`}
               >
                  Island Mode
               </button>
               <button className="flex-1 py-1.5 border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 text-[9px] font-bold text-yellow-400 rounded-lg transition-all uppercase tracking-widest">
                  Optimize
               </button>
            </div>
          </section>

          {/* Module 6: Federated City Net HUD */}
          <section className="glass-panel p-4 border-blue-500/20 bg-blue-500/5">
            <div className="card-title flex items-center gap-2 text-blue-400">
               <Globe size={14} /> 
               <span>Federated Urban Intelligence Net</span>
            </div>
            <div className="mt-3 space-y-3">
               <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
                  <div className="flex flex-col">
                     <span className="text-[8px] text-zinc-500 uppercase font-bold">Active Peer Nodes</span>
                     <span className="text-xs font-bold text-white">{federatedNet.peers} GLOBAL CITIES</span>
                  </div>
                  <div className="flex -space-x-2">
                     {['TKY', 'LDN', 'SGP'].map(city => (
                        <div key={city} className="w-6 h-6 rounded-full bg-blue-600 border-2 border-black flex items-center justify-center text-[7px] font-bold text-white">{city}</div>
                     ))}
                  </div>
               </div>

               <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px]">
                     <span className="text-zinc-400 font-bold uppercase">Weight Aggregation (Round {federatedNet.aggregation_round})</span>
                     <span className="text-blue-400 font-mono">{(federatedNet.data_contribution / 1024).toFixed(1)}MB</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-blue-500 transition-all duration-700" 
                       style={{ width: `${(federatedNet.aggregation_round % 100)}%` }}
                     ></div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 p-2 rounded border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Privacy Noise</div>
                     <div className="text-[10px] font-bold text-blue-400">ε = {federatedNet.epsilon.toFixed(1)}</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded border border-white/5 text-right">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Krum Consensus</div>
                     <div className="text-[10px] font-bold text-emerald-500">{(federatedNet.krum_score * 100).toFixed(1)}%</div>
                  </div>
               </div>

               <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded flex justify-between items-center">
                  <span className="text-[9px] text-blue-400 font-bold uppercase">Collective Knowledge Gain</span>
                  <span className="text-[10px] font-mono text-white">+{federatedNet.knowledge_gain}%</span>
               </div>
            </div>
            
            <div className="mt-3 flex gap-2">
               <button 
                 onClick={() => setShowPeerMap(true)}
                 className="flex-1 py-1.5 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-[9px] font-bold text-blue-400 rounded-lg transition-all uppercase tracking-widest"
               >
                  Peer Map
               </button>
               <button className="flex-1 py-1.5 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-[9px] font-bold text-blue-400 rounded-lg transition-all uppercase tracking-widest">
                  Sync
               </button>
            </div>
          </section>

          {showPeerMap && (
            <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-20">
               <div className="w-full max-w-5xl h-full glass-panel relative p-8 flex flex-col">
                  <button 
                    onClick={() => setShowPeerMap(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400"
                  >
                     <X size={24} />
                  </button>
                  <div className="flex items-center gap-3 mb-8">
                     <Globe size={32} className="text-blue-400" />
                     <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Global Federated Peer Network</h2>
                        <p className="text-sm text-zinc-500 uppercase font-bold tracking-widest">Real-time ACIS Node Synchronization</p>
                     </div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                     {/* Simulating a world map with peer dots */}
                     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                     <div className="relative w-full h-full flex items-center justify-center">
                        {['NYC', 'TKY', 'LDN', 'SGP', 'BER', 'SYD'].map((city, i) => (
                           <div key={city} className="absolute flex flex-col items-center group" style={{ left: `${15 + i*15}%`, top: `${30 + (i%3)*20}%` }}>
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                              <span className="text-[10px] font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">{city}-NODE</span>
                              <div className="text-[8px] text-zinc-500 font-mono">LAT: 0.{i}4ms</div>
                           </div>
                        ))}
                        {/* Connecting lines sim */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                           <line x1="15%" y1="30%" x2="30%" y2="50%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5" />
                           <line x1="30%" y1="50%" x2="45%" y2="30%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5" />
                           <line x1="45%" y1="30%" x2="60%" y2="50%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5" />
                        </svg>
                     </div>
                  </div>
                  <div className="mt-8 flex justify-between items-end">
                     <div className="flex gap-8">
                        <div>
                           <div className="text-[10px] text-zinc-500 uppercase font-bold">Collective Epsilon</div>
                           <div className="text-xl font-bold text-blue-400">ε = 1.0</div>
                        </div>
                        <div>
                           <div className="text-[10px] text-zinc-500 uppercase font-bold">Total Network Shards</div>
                           <div className="text-xl font-bold text-white">2,842</div>
                        </div>
                     </div>
                     <button className="bg-blue-500 text-black px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-400 transition-all">Re-optimize Global Weights</button>
                  </div>
               </div>
            </div>
          )}

          {/* Module 7: Public Health & Bio-Sentinel HUD */}
          <section className="glass-panel p-4 border-red-500/20 bg-red-500/5">
            <div className="card-title flex items-center gap-2 text-red-400">
               <Activity size={14} /> 
               <span>Public Health & Bio-Sentinel</span>
            </div>
            <div className="mt-3 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Viral Load Index</div>
                     <div className="text-sm font-bold text-white">{publicHealth.viral_load.toFixed(2)} λ</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Hospital Load</div>
                     <div className="text-sm font-bold text-red-400">{publicHealth.hospital_occupancy}%</div>
                  </div>
               </div>

               <div className="bg-white/5 p-2 rounded border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[9px] text-zinc-400 font-bold uppercase">Wastewater Pathogen Risk</span>
                     <span className={`text-[9px] font-bold ${publicHealth.wastewater_risk === 'HIGH' ? 'text-red-500' : 'text-emerald-500'}`}>{publicHealth.wastewater_risk}</span>
                  </div>
                  <div className="flex gap-0.5 h-1">
                     {[...Array(20)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 ${i < 5 ? 'bg-red-500/50' : 'bg-emerald-500/20'}`}
                        ></div>
                     ))}
                  </div>
               </div>

               <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                     <ShieldAlert size={12} className="text-red-400" />
                     <span className="text-[9px] text-zinc-300 font-bold uppercase">Med-Units Dispatched</span>
                  </div>
                  <span className="text-[10px] font-mono text-white">{publicHealth.medical_dispatch} UNITS</span>
               </div>
            </div>
            <button className="w-full mt-3 py-1.5 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-[9px] font-bold text-red-400 rounded-lg transition-all uppercase tracking-widest">
               Deploy Preventive Screen
            </button>
          </section>

          {/* Module 8: AI Governance & Policy Simulation HUD */}
          <section className="glass-panel p-4 border-zinc-500/20 bg-zinc-500/5">
            <div className="card-title flex items-center gap-2 text-zinc-400">
               <Scale size={14} /> 
               <span>AI Governance & Policy Playground</span>
            </div>
            <div className="mt-3 space-y-3">
               <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] text-zinc-500 font-bold uppercase">Active Simulation</span>
                     <span className="text-[10px] text-white font-bold">{policySim.active_policy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] text-zinc-500 font-bold uppercase">Ethical Alignment</span>
                     <span className="text-[10px] text-emerald-400 font-bold">{policySim.ethical_alignment}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-emerald-500" 
                       style={{ width: `${policySim.ethical_alignment}%` }}
                     ></div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 p-2 rounded border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Economic Impact</div>
                     <div className="text-xs font-bold text-white">+{policySim.impact_score}%</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Social Equity</div>
                     <div className="text-xs font-bold text-blue-400">{(100 - policySim.bias_index*100).toFixed(1)}%</div>
                  </div>
               </div>

               <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${policySim.compliance_audit === 'PASSED' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                     <span className="text-[9px] text-emerald-400 font-bold uppercase">Regulatory Compliance Audit</span>
                  </div>
                  <span className="text-[10px] font-mono text-white">{policySim.compliance_audit}</span>
               </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2">
               <button 
                 onClick={async () => {
                   await fetch('http://localhost:8000/policy/simulate', {
                     method: 'POST',
                     headers: {'Content-Type': 'application/json'},
                     body: JSON.stringify({ policy: 'CONGESTION_PRICING' })
                   });
                 }}
                 className="py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-bold text-zinc-400 rounded-lg transition-all uppercase tracking-widest"
               >
                  Draft Policy
               </button>
               <button className="py-1.5 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-[9px] font-bold text-emerald-400 rounded-lg transition-all uppercase tracking-widest">
                  Referendum
               </button>
            </div>
          </section>

          {/* Module 9: Hyper-Local Logistics Swarm HUD */}
          <section className="glass-panel p-4 border-cyan-500/20 bg-cyan-500/5">
            <div className="card-title flex items-center gap-2 text-cyan-400">
               <Package size={14} /> 
               <span>Hyper-Local Logistics Swarm</span>
            </div>
            <div className="mt-3 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Active Bots</div>
                     <div className="text-sm font-bold text-white">{logisticsSwarm.active_bots} UNITS</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Sidewalk Load</div>
                     <div className="text-sm font-bold text-cyan-400">{logisticsSwarm.sidewalk_load}%</div>
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] text-zinc-400 font-bold uppercase">Fulfillment Efficiency</span>
                     <span className="text-[9px] text-emerald-400 font-bold">{logisticsSwarm.fulfillment_rate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-emerald-500 transition-all duration-1000" 
                       style={{ width: `${logisticsSwarm.fulfillment_rate}%` }}
                     ></div>
                  </div>
               </div>

               <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                     <Activity size={12} className="text-cyan-400" />
                     <span className="text-[9px] text-zinc-300 font-bold uppercase">Avg Delivery Velocity</span>
                  </div>
                  <span className="text-[10px] font-mono text-white">{logisticsSwarm.avg_delivery_time} MIN</span>
               </div>
            </div>
            <button className="w-full mt-3 py-1.5 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-[9px] font-bold text-cyan-400 rounded-lg transition-all uppercase tracking-widest">
               Optimize Swarm Routing
            </button>
          </section>

          {/* Module 10: Multi-Agent Economic Simulation HUD */}
          <section className="glass-panel p-4 border-amber-500/20 bg-amber-500/5">
            <div className="card-title flex items-center gap-2 text-amber-400">
               <BarChart3 size={14} /> 
               <span>Urban Economy Heartbeat</span>
            </div>
            <div className="mt-3 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Commerce Velocity</div>
                     <div className="text-sm font-bold text-white">{urbanEconomy.velocity.toFixed(2)}v</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-right">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Volatility</div>
                     <div className={`text-sm font-bold ${urbanEconomy.volatility < 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        ±{urbanEconomy.volatility}%
                     </div>
                  </div>
               </div>

               <div className="bg-white/5 p-2 rounded border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[9px] text-zinc-400 font-bold uppercase">Municipal Budget Surplus</span>
                     <span className="text-[9px] text-emerald-400 font-bold">+${(urbanEconomy.budget_surplus / 1e6).toFixed(1)}M</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-amber-500 transition-all duration-1000" 
                       style={{ width: `${(urbanEconomy.digital_footfall / 1000) * 100}%` }}
                     ></div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 p-2 rounded border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Business Permits</div>
                     <div className="text-[10px] font-bold text-white">+{urbanEconomy.permits_issued} ISSUED</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded border border-white/5 text-right">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">Heat Correlation</div>
                     <div className="text-[10px] font-bold text-amber-400">-{heatMitigation}°C SYNC</div>
                  </div>
               </div>

               <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded flex justify-between items-center">
                  <span className="text-[9px] text-amber-400 font-bold uppercase">Projected Quarterly GDP</span>
                  <span className="text-[10px] font-mono text-white">+{urbanEconomy.gdp_projection}%</span>
               </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
               <button className="py-1.5 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-[9px] font-bold text-amber-400 rounded-lg transition-all uppercase tracking-widest">
                  Stimulate
               </button>
               <button className="py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-bold text-zinc-500 rounded-lg transition-all uppercase tracking-widest">
                  Budget Report
               </button>
            </div>
          </section>

          {/* Module 11: Privacy-Preserving Security & Sovereign Identity HUD */}
          <section className="glass-panel p-4 border-white/20 bg-white/5">
            <div className="card-title flex items-center gap-2 text-white">
               <ShieldAlert size={14} /> 
               <span>Urban Security & Privacy Shield</span>
            </div>
            <div className="mt-3 space-y-4">
               <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                  <div className="flex flex-col">
                     <span className="text-[8px] text-zinc-500 uppercase font-bold">DID Authenticity</span>
                     <span className="text-sm font-bold text-white">{urbanShield.did_authenticity}%</span>
                  </div>
                  <div className="flex gap-1">
                     {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-1 h-3 bg-emerald-500/40 rounded-full"></div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-2 rounded border border-white/5">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">ZKP Proofs (sec)</div>
                     <div className="text-xs font-bold text-white">+{urbanShield.zkp_proofs} PROOFS</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded border border-white/5 text-right">
                     <div className="text-[8px] text-zinc-500 uppercase font-bold">mTLS Integrity</div>
                     <div className="text-xs font-bold text-emerald-400">{urbanShield.mtls_status}</div>
                  </div>
               </div>

               <div className="bg-white/5 p-2 rounded flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-2">
                     <Lock size={12} className="text-zinc-400" />
                     <span className="text-[9px] text-zinc-300 font-bold uppercase">Privacy Audit (ISO/IEC 27701)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">{urbanShield.privacy_audit}</span>
               </div>
            </div>
            <div className="mt-4 flex gap-2">
               <button className="flex-1 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-bold text-zinc-400 rounded-lg transition-all uppercase tracking-widest">
                  Audit Log
               </button>
               <button 
                 onClick={async () => {
                   if (confirm("INITIATE SYSTEM-WIDE SECURITY LOCKDOWN?")) {
                     await fetch('http://localhost:8000/execute/lockdown', { method: 'POST' });
                   }
                 }}
                 className="flex-1 py-2 border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-[9px] font-bold text-red-500 rounded-lg transition-all uppercase tracking-widest animate-pulse"
               >
                  Emergency Lockdown
               </button>
            </div>
          </section>

          <section className="glass-panel p-4 flex flex-col min-h-0">
            <div className="card-title flex items-center gap-2">
               <Cpu size={14} className="text-purple-400" /> 
               <span>Explainable AI - Decision Logs</span>
            </div>
            <div className="flex-1 overflow-y-auto mt-2 space-y-3">
               {decisions.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                    <BrainCircuit size={32} className="mb-2 opacity-20" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Awaiting Critical Event</span>
                 </div>
               ) : (
                 decisions.map((dec) => (
                   <div key={dec.id} className="border-l-2 border-purple-500/50 pl-3 py-1">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{dec.action}</span>
                         <span className="text-[9px] text-zinc-500">{dec.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed italic">"{dec.reasoning}"</p>
                      {dec.counterfactual && (
                        <p className="text-[9px] text-zinc-500 mt-1 border-t border-white/5 pt-1">
                          <span className="text-purple-400/60 font-bold uppercase">Counterfactual:</span> {dec.counterfactual}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                         <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${dec.confidence * 100}%` }}></div>
                         </div>
                         <span className="text-[9px] text-zinc-500 font-mono">{(dec.confidence * 100).toFixed(1)}% CONF</span>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default App;
