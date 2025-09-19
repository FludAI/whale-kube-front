import { useState, useEffect } from 'react';
import './SystemMap.css';

interface Node {
  id: string;
  label: string;
  type: 'core' | 'ai' | 'database' | 'external';
  status: 'running' | 'pending' | 'error';
  x?: number;
  y?: number;
}

interface Edge {
  from: string;
  to: string;
  type: 'data' | 'ai' | 'api';
}

function SystemMap() {
  const [nodes] = useState<Node[]>([
    // Bank of Anthos Core Services
    { id: 'frontend', label: 'Frontend', type: 'core', status: 'running', x: 400, y: 50 },
    { id: 'loadgen', label: 'Load Generator', type: 'external', status: 'running', x: 100, y: 50 },
    { id: 'userservice', label: 'User Service', type: 'core', status: 'running', x: 200, y: 200 },
    { id: 'contacts', label: 'Contacts', type: 'core', status: 'running', x: 350, y: 200 },
    { id: 'ledgerwriter', label: 'Ledger Writer', type: 'core', status: 'running', x: 500, y: 200 },
    { id: 'balancereader', label: 'Balance Reader', type: 'core', status: 'running', x: 650, y: 200 },
    { id: 'transactionhistory', label: 'Transaction History', type: 'core', status: 'running', x: 800, y: 200 },
    
    // Databases
    { id: 'accountsdb', label: 'Accounts DB', type: 'database', status: 'running', x: 275, y: 350 },
    { id: 'ledgerdb', label: 'Ledger DB', type: 'database', status: 'running', x: 650, y: 350 },
    
    // Orbital AI Components
    { id: 'orbital', label: 'Orbital Agent', type: 'ai', status: 'pending', x: 950, y: 100 },
    { id: 'gemini', label: 'Gemini AI', type: 'ai', status: 'pending', x: 950, y: 200 },
    { id: 'whalebox', label: 'WhaleBox UI', type: 'ai', status: 'pending', x: 950, y: 300 },
  ]);

  const [edges] = useState<Edge[]>([
    // Core connections
    { from: 'loadgen', to: 'frontend', type: 'api' },
    { from: 'frontend', to: 'userservice', type: 'api' },
    { from: 'frontend', to: 'contacts', type: 'api' },
    { from: 'frontend', to: 'ledgerwriter', type: 'api' },
    { from: 'frontend', to: 'balancereader', type: 'api' },
    { from: 'frontend', to: 'transactionhistory', type: 'api' },
    { from: 'userservice', to: 'accountsdb', type: 'data' },
    { from: 'contacts', to: 'accountsdb', type: 'data' },
    { from: 'ledgerwriter', to: 'ledgerdb', type: 'data' },
    { from: 'balancereader', to: 'ledgerdb', type: 'data' },
    { from: 'transactionhistory', to: 'ledgerdb', type: 'data' },
    
    // AI connections
    { from: 'orbital', to: 'balancereader', type: 'ai' },
    { from: 'orbital', to: 'transactionhistory', type: 'ai' },
    { from: 'orbital', to: 'gemini', type: 'ai' },
    { from: 'whalebox', to: 'frontend', type: 'ai' },
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Simulate pod status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In real implementation, fetch from k8s API
      console.log('Checking pod statuses...');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getNodeColor = (node: Node) => {
    if (node.type === 'ai') return '#9b5de5';
    if (node.type === 'database') return '#4A90E2';
    if (node.type === 'external') return '#666';
    return '#27AE60';
  };

  const getNodeDetails = (nodeId: string) => {
    const details: { [key: string]: string } = {
      frontend: 'Python Flask app serving the web interface',
      userservice: 'Manages user accounts and JWT authentication',
      balancereader: 'Provides efficient cache of user balances',
      orbital: 'AI agent monitoring high-value accounts for growth opportunities',
      gemini: 'Google Gemini AI for business analysis',
      whalebox: 'React overlay UI for SME transformation',
    };
    return details[nodeId] || 'Service component';
  };

  return (
    <div className="system-map-container">
      <h2>System Architecture Map</h2>
      
      <div className="legend">
        <span className="legend-item">
          <div className="legend-box core"></div> Core Services
        </span>
        <span className="legend-item">
          <div className="legend-box ai"></div> AI Components
        </span>
        <span className="legend-item">
          <div className="legend-box database"></div> Databases
        </span>
      </div>

      <svg className="architecture-svg" viewBox="0 0 1100 450">
        {/* Draw edges first */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          
          return (
            <line
              key={i}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={edge.type === 'ai' ? '#9b5de5' : '#666'}
              strokeWidth="2"
              strokeDasharray={edge.type === 'ai' ? '5,5' : '0'}
              opacity="0.5"
            />
          );
        })}

        {/* Draw nodes */}
        {nodes.map(node => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="40"
              fill={getNodeColor(node)}
              stroke={selectedNode === node.id ? '#fff' : 'none'}
              strokeWidth="3"
              className="node-circle"
              onClick={() => setSelectedNode(node.id)}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dy=".3em"
              fill="white"
              fontSize="12"
              pointerEvents="none"
            >
              {node.label}
            </text>
            {/* Status indicator */}
            <circle
              cx={node.x! + 30}
              cy={node.y! - 30}
              r="5"
              fill={node.status === 'running' ? '#27AE60' : '#FFA500'}
            />
          </g>
        ))}
      </svg>

      {selectedNode && (
        <div className="node-details">
          <h3>{nodes.find(n => n.id === selectedNode)?.label}</h3>
          <p>{getNodeDetails(selectedNode)}</p>
          <button onClick={() => setSelectedNode(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default SystemMap;