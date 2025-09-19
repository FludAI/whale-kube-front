import { useState } from "react";

function App() {
  const [form, setForm] = useState({
    name: "whale-bank",
    region: "us-central1-a",
    numNodes: 4,
    minNodes: 3,
    maxNodes: 10
  });
  const [result, setResult] = useState("");

  async function callApi(endpoint, data = form) {
    const res = await fetch(`http://localhost:4000/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    setResult(JSON.stringify(json, null, 2));
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">kubectl-ai Dashboard</h1>
      <input className="border p-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Cluster Name" />
      <input className="border p-2" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Region/Zone" />
      <input className="border p-2" type="number" value={form.numNodes} onChange={e => setForm({ ...form, numNodes: e.target.value })} placeholder="Num Nodes" />
      <input className="border p-2" type="number" value={form.minNodes} onChange={e => setForm({ ...form, minNodes: e.target.value })} placeholder="Min Nodes" />
      <input className="border p-2" type="number" value={form.maxNodes} onChange={e => setForm({ ...form, maxNodes: e.target.value })} placeholder="Max Nodes" />

      <div className="space-x-2">
        <button className="bg-blue-500 text-white px-4 py-2" onClick={() => callApi("create-cluster")}>Create Cluster</button>
        <button className="bg-green-500 text-white px-4 py-2" onClick={() => callApi("get-credentials")}>Get Credentials</button>
        <button className="bg-purple-500 text-white px-4 py-2" onClick={() => callApi("deploy-bank")}>Deploy Bank</button>
      </div>

      <pre className="bg-gray-100 p-2">{result}</pre>
    </div>
  );
}

export default App;
