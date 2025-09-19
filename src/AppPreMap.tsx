import { useState } from "react";
import "./App.css";

interface ClusterForm {
  name: string;
  region: string;
  numNodes: number;
  minNodes: number;
  maxNodes: number;
}

interface StatusState {
  [key: string]: 'success' | 'error' | undefined;
}

function App() {
  const [form, setForm] = useState<ClusterForm>({
    name: "whale-bank",
    region: "us-central1-a",
    numNodes: 4,
    minNodes: 3,
    maxNodes: 10
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusState>({});

  async function callApi(endpoint: string, data: ClusterForm = form) {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
      
      setStatus({
        ...status,
        [endpoint]: res.ok ? 'success' : 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <div className="dashboard">
        <h1 className="title">
          <span className="whale-icon">🐋</span>
          Whale-Kube Dashboard
        </h1>
        
        <div className="config-section">
          <h2>Cluster Configuration</h2>
          <div className="form-grid">
            <div>
              <label>Cluster Name</label>
              <input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            <div>
              <label>Region/Zone</label>
              <input 
                value={form.region}
                onChange={e => setForm({...form, region: e.target.value})}
              />
            </div>
            <div>
              <label>Initial Nodes</label>
              <input 
                type="number"
                value={form.numNodes}
                onChange={e => setForm({...form, numNodes: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label>Min Nodes</label>
              <input 
                type="number"
                value={form.minNodes}
                onChange={e => setForm({...form, minNodes: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        <div className="actions-section">
          <h2>Deployment Steps</h2>
          <div className="button-grid">
            <button 
              className={`action-btn ${status['create-cluster'] === 'success' ? 'success' : ''}`}
              onClick={() => callApi("create-cluster")}
              disabled={loading}
            >
              🚀 Create Cluster
            </button>
            
            <button 
              className={`action-btn ${status['get-credentials'] === 'success' ? 'success' : ''}`}
              onClick={() => callApi("get-credentials")}
              disabled={loading}
            >
              🔑 Get Credentials
            </button>
            
            <button 
              className={`action-btn ${status['deploy-bank'] === 'success' ? 'success' : ''}`}
              onClick={() => callApi("deploy-bank")}
              disabled={loading}
            >
              🏦 Deploy Bank of Anthos
            </button>
            
            <button 
              className={`action-btn ${status['deploy-orbital'] === 'success' ? 'success' : ''}`}
              onClick={() => callApi("deploy-orbital")}
              disabled={loading}
            >
              🦄 Deploy Orbital Agent
            </button>
            
            <button 
              className="action-btn"
              onClick={() => callApi("check-status")}
              disabled={loading}
            >
              📊 Check Status
            </button>
            
            <button 
              className="action-btn danger"
              onClick={() => {
                if (confirm('Delete cluster?')) callApi("delete-cluster");
              }}
              disabled={loading}
            >
              🗑️ Delete Cluster
            </button>
          </div>
        </div>

        <div className="console-section">
          <h2>Output Console</h2>
          <pre>{result || "Ready to deploy..."}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;