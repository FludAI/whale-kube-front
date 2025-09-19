import { useState, useEffect, useRef } from "react";
import SystemMap from "./components/SystemMap";
import "./App.css";

interface ClusterForm {
  name: string;
  region: string;
  numNodes: number;
  minNodes: number;
  maxNodes: number;
}

interface StatusState {
  [key: string]: 'success' | 'error' | 'running' | undefined;
}

interface Timer {
  operation: string;
  startTime: number;
  endTime?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'system-map'>('dashboard');
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
  const [timers, setTimers] = useState<Timer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showGeminiChat, setShowGeminiChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Timer management
  const startTimer = (operation: string) => {
    setTimers(prev => [...prev, { operation, startTime: Date.now() }]);
  };

  const endTimer = (operation: string) => {
    setTimers(prev => 
      prev.map(t => 
        t.operation === operation && !t.endTime 
          ? { ...t, endTime: Date.now() } 
          : t
      )
    );
  };

  // Update running timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => [...prev]); // Force re-render
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function callApi(endpoint: string, data: ClusterForm = form) {
    setLoading(true);
    startTimer(endpoint);
    setStatus({ ...status, [endpoint]: 'running' });
    
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
      endTimer(endpoint);
    }
  }

  // Gemini chat functionality
  async function sendGeminiMessage() {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    
    try {
      const response = await fetch('http://localhost:4000/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: chatInput,
          context: 'Bank of Anthos deployment assistant'
        })
      });
      
      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || "I can help you with deploying Bank of Anthos and setting up AI agents.",
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Gemini chat error:', error);
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formatTime = (timer: Timer) => {
    const elapsed = (timer.endTime || Date.now()) - timer.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getOperationName = (endpoint: string) => {
    const names: { [key: string]: string } = {
      'create-cluster': 'Create Cluster',
      'get-credentials': 'Get Credentials',
      'deploy-bank': 'Deploy Bank of Anthos',
      'deploy-orbital': 'Deploy Orbital Agent',
      'check-status': 'Check Status',
      'delete-cluster': 'Delete Cluster'
    };
    return names[endpoint] || endpoint;
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="dashboard">
          <h1 className="title">
            <span className="whale-icon">🐋</span>
            Whale-Kube Dashboard
          </h1>
          
          <nav className="tab-nav">
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={activeTab === 'system-map' ? 'active' : ''}
              onClick={() => setActiveTab('system-map')}
            >
              System Map
            </button>
          </nav>

          {activeTab === 'dashboard' ? (
            <>
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

              {/* Operation Timers */}
              {timers.length > 0 && (
                <div className="timers-section">
                  <h3>Operation Timers</h3>
                  <div className="timers-grid">
                    {timers.map((timer, idx) => (
                      <div key={idx} className={`timer ${timer.endTime ? 'completed' : 'running'}`}>
                        <span className="timer-name">{getOperationName(timer.operation)}</span>
                        <span className="timer-time">{formatTime(timer)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="actions-section">
                <h2>Deployment Steps</h2>
                <div className="button-grid">
                  <button 
                    className={`action-btn ${
                      status['create-cluster'] === 'success' ? 'success' : 
                      status['create-cluster'] === 'running' ? 'running' : ''
                    }`}
                    onClick={() => callApi("create-cluster")}
                    disabled={loading}
                  >
                    🚀 Create Cluster
                  </button>
                  
                  <button 
                    className={`action-btn ${
                      status['get-credentials'] === 'success' ? 'success' : 
                      status['get-credentials'] === 'running' ? 'running' : ''
                    }`}
                    onClick={() => callApi("get-credentials")}
                    disabled={loading}
                  >
                    🔑 Get Credentials
                  </button>
                  
                  <button 
                    className={`action-btn ${
                      status['deploy-bank'] === 'success' ? 'success' : 
                      status['deploy-bank'] === 'running' ? 'running' : ''
                    }`}
                    onClick={() => callApi("deploy-bank")}
                    disabled={loading}
                  >
                    🏦 Deploy Bank of Anthos
                  </button>
                  
                  <button 
                    className={`action-btn ${
                      status['deploy-orbital'] === 'success' ? 'success' : 
                      status['deploy-orbital'] === 'running' ? 'running' : ''
                    }`}
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
            </>
          ) : (
            <SystemMap />
          )}
        </div>

        {/* Gemini Chat Sidebar */}
        <div className={`gemini-chat ${showGeminiChat ? 'open' : ''}`}>
          <button 
            className="chat-toggle"
            onClick={() => setShowGeminiChat(!showGeminiChat)}
          >
            {showGeminiChat ? '✕' : '💬'}
          </button>
          
          {showGeminiChat && (
            <>
              <div className="chat-header">
                <h3>🤖 Gemini Assistant</h3>
              </div>
              
              <div className="chat-messages">
                {chatMessages.length === 0 && (
                  <div className="chat-placeholder">
                    Ask me about Bank of Anthos deployment, Kubernetes, or AI agents!
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="chat-input">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendGeminiMessage()}
                  placeholder="Ask Gemini..."
                />
                <button onClick={sendGeminiMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;