'use client';
import { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  Clock, 
  TrendingUp, 
  Terminal, 
  RefreshCw, 
  PlusCircle, 
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const INITIAL_LOGS = [
  { id: '1084', timestamp: '19:42:15', prompt: 'I am trying to study React components, but my mind keeps...', load: 82, latency: '3.4s', tokens: 184, cache: 'MISS', status: 'SUCCESS' },
  { id: '1083', timestamp: '19:30:08', prompt: 'Preparing for my Go programming exam tomorrow, feeling...', load: 75, latency: '0.12s', tokens: 145, cache: 'HIT', status: 'SUCCESS' },
  { id: '1082', timestamp: '19:04:42', prompt: 'Woke up early, drank coffee, worked on CSS, in flow state...', load: 25, latency: '0.11s', tokens: 168, cache: 'HIT', status: 'SUCCESS' },
  { id: '1081', timestamp: '18:15:33', prompt: 'How does Web MLC-LLM handle caching of model weights?', load: 15, latency: '4.8s', tokens: 88, cache: 'MISS', status: 'SUCCESS' },
  { id: '1080', timestamp: '17:58:20', prompt: 'Testing cognitive load evaluation with random text inputs...', load: 45, latency: '0.08s', tokens: 120, cache: 'HIT', status: 'SUCCESS' }
];

export default function DashboardPage() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshLogs = () => {
    setRefreshing(true);
    console.log('--- Fetching Latest LLM Telemetry Logs ---');
    setTimeout(() => {
      // Add a mock new log item at the top
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0];
      const newLog = {
        id: Math.floor(Math.random() * 1000 + 2000).toString(),
        timestamp: timeString,
        prompt: 'Triggered manual telemetry sync check for scoring node...',
        load: Math.floor(Math.random() * 60 + 20),
        latency: (Math.random() > 0.6 ? '3.1s' : '0.11s'),
        tokens: Math.floor(Math.random() * 100 + 100),
        cache: Math.random() > 0.6 ? 'MISS' : 'HIT',
        status: 'SUCCESS'
      };
      
      setLogs(prev => [newLog, ...prev.slice(0, 5)]);
      setRefreshing(false);
      console.log('Telemetry Sync Completed. New trace loaded:', newLog);
    }, 800);
  };

  const handleClearLogs = () => {
    console.log('Clearing telemetry logs from dashboard view...');
    setLogs([]);
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 to-zinc-300">
            Raw LLM Monitoring
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time telemetry of Web MLC-LLM local inference, memory consumption, and cache hits.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClearLogs}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear History
          </button>
          
          <button 
            onClick={handleRefreshLogs}
            disabled={refreshing}
            className="px-4 py-2 bg-purple-600/10 hover:bg-purple-600/25 border border-purple-500/20 text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Stats Cards GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Token Count */}
        <div className="glass-panel rounded-2xl p-5 border-zinc-850 hover:border-zinc-800 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Tokens Processed</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">184,210</h3>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs last hour
            </p>
          </div>
        </div>

        {/* Latency */}
        <div className="glass-panel rounded-2xl p-5 border-zinc-850 hover:border-zinc-800 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Avg Latency</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">142ms</h3>
            <p className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1 mt-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" /> Warm cache hits
            </p>
          </div>
        </div>

        {/* Cache Hit Ratio */}
        <div className="glass-panel rounded-2xl p-5 border-zinc-850 hover:border-zinc-800 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Weight Cache Hit</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">92.4%</h3>
            <p className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1 mt-1">
              Local VRAM pinning
            </p>
          </div>
        </div>

        {/* GPU Temperature */}
        <div className="glass-panel rounded-2xl p-5 border-zinc-850 hover:border-zinc-800 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Engine Stats</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">64°C</h3>
            <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mt-1">
              VRAM: 1.48 GB allocated
            </p>
          </div>
        </div>
      </div>

      {/* SVG CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Token Consumption Over Time (SVG Area Chart) */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
              <h3 className="text-sm font-bold text-zinc-200">Token Consumption History</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Last 6 Runs (Tokens/s)</span>
          </div>

          <div className="relative h-60 w-full bg-zinc-900/20 rounded-2xl border border-zinc-900/60 p-4 flex items-center justify-center">
            {/* SVG Area Chart */}
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="500" y2="160" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Chart Path Area */}
              <path 
                d="M 10 180 L 10 120 Q 100 60, 110 80 T 210 140 T 310 50 T 410 90 L 490 60 L 490 180 Z" 
                fill="url(#tokenGrad)" 
              />
              
              {/* Chart Stroke Line */}
              <path 
                d="M 10 120 Q 100 60, 110 80 T 210 140 T 310 50 T 410 90 L 490 60" 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              {/* Data Points / Tooltips */}
              <circle cx="10" cy="120" r="4.5" fill="#a78bfa" stroke="#09090b" strokeWidth="1.5" />
              <circle cx="110" cy="80" r="4.5" fill="#a78bfa" stroke="#09090b" strokeWidth="1.5" />
              <circle cx="210" cy="140" r="4.5" fill="#a78bfa" stroke="#09090b" strokeWidth="1.5" />
              <circle cx="310" cy="50" r="4.5" fill="#a78bfa" stroke="#09090b" strokeWidth="1.5" />
              <circle cx="410" cy="90" r="4.5" fill="#a78bfa" stroke="#09090b" strokeWidth="1.5" />
              <circle cx="490" cy="60" r="4.5" fill="#a78bfa" stroke="#09090b" strokeWidth="1.5" />

              {/* Tooltip Label */}
              <text x="310" y="32" fill="#a78bfa" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                184 tokens
              </text>
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-zinc-550 font-mono tracking-wider">
            <span>Run 1079</span>
            <span>Run 1080</span>
            <span>Run 1081 (Cold)</span>
            <span>Run 1082</span>
            <span>Run 1083</span>
            <span>Run 1084</span>
          </div>
        </div>

        {/* Model Inference Latency Logs (SVG Bar Chart) */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-200">Local Inference Latency</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Cold Misses vs. Cache Hits</span>
          </div>

          <div className="relative h-60 w-full bg-zinc-900/20 rounded-2xl border border-zinc-900/60 p-4 flex items-center justify-center">
            {/* SVG Bar/Line Chart */}
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <line x1="0" y1="40" x2="500" y2="40" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="500" y2="160" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />

              {/* Bar 1 (Run 1080 - Hit) */}
              <rect x="40" y="165" width="25" height="15" fill="#10b981" fillOpacity="0.8" rx="3" />
              <text x="52" y="155" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle">0.08s</text>

              {/* Bar 2 (Run 1081 - Cold Miss) */}
              <rect x="120" y="30" width="25" height="150" fill="#f43f5e" fillOpacity="0.8" rx="3" />
              <text x="132" y="20" fill="#f43f5e" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">4.8s (Cold)</text>

              {/* Bar 3 (Run 1082 - Hit) */}
              <rect x="200" y="160" width="25" height="20" fill="#10b981" fillOpacity="0.8" rx="3" />
              <text x="212" y="150" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle">0.11s</text>

              {/* Bar 4 (Run 1083 - Hit) */}
              <rect x="280" y="158" width="25" height="22" fill="#10b981" fillOpacity="0.8" rx="3" />
              <text x="292" y="148" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle">0.12s</text>

              {/* Bar 5 (Run 1084 - Cold Miss) */}
              <rect x="360" y="65" width="25" height="115" fill="#f59e0b" fillOpacity="0.8" rx="3" />
              <text x="372" y="55" fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="middle">3.4s</text>

              {/* Bar 6 (Average Warm Hit) */}
              <rect x="440" y="162" width="25" height="18" fill="#8b5cf6" fillOpacity="0.8" rx="3" />
              <text x="452" y="152" fill="#8b5cf6" fontSize="8" fontFamily="monospace" textAnchor="middle">0.1s</text>
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-zinc-550 font-mono tracking-wider">
            <span>R-1080</span>
            <span>R-1081</span>
            <span>R-1082</span>
            <span>R-1083</span>
            <span>R-1084</span>
            <span className="text-purple-400 font-bold">WARM AVG</span>
          </div>
        </div>
      </div>

      {/* Raw Telemetry Log Logs Table */}
      <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-zinc-200">Recent Local Inference Logs</h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Telemetry Node: dev-node-0</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-zinc-650 flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-xs">No traces loaded. Click "Refresh Telemetry" to pull mock telemetry blocks.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400 border-collapse">
              <thead>
                <tr className="border-b border-zinc-850/80 text-[10px] text-zinc-500 uppercase font-semibold">
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Input Prompt Snip</th>
                  <th className="py-3 px-4">Cognitive Load</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Tokens</th>
                  <th className="py-3 px-4">Cache</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="border-b border-zinc-850/40 hover:bg-zinc-900/20 transition-colors font-mono"
                  >
                    <td className="py-3 px-4 text-purple-400 font-bold">#{log.id}</td>
                    <td className="py-3 px-4 text-zinc-500">{log.timestamp}</td>
                    <td className="py-3 px-4 max-w-[200px] truncate text-zinc-300 font-sans">{log.prompt}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.load > 70 ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' : 
                        log.load > 40 ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20' : 
                        'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                      }`}>
                        {log.load}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-350">{log.latency}</td>
                    <td className="py-3 px-4 text-zinc-400">{log.tokens} tks</td>
                    <td className="py-3 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        log.cache === 'HIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                      }`}>
                        {log.cache}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-400 font-bold text-[10px] flex items-center justify-end gap-1 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
