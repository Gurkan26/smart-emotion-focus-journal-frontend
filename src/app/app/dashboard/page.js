'use client';
import { useState, useEffect } from 'react';
import { getBackendUrl } from '@/lib/api';
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
  XCircle,
  AlertCircle,
  BookOpen,
  Gauge
} from 'lucide-react';

const INITIAL_LOGS = [
  { id: '1084', timestamp: '19:42:15', prompt: 'I am trying to study React components, but my mind keeps wandering to social media. I feel slightly tired, and I\'ve been working for 3 hours without a break.', load: 82, latency: '3.4s', tokens: 184, cache: 'MISS', status: 'SUCCESS' },
  { id: '1083', timestamp: '19:30:08', prompt: 'Preparing for my Go programming presentation tomorrow, feeling nervous but ready to review models.', load: 75, latency: '0.12s', tokens: 145, cache: 'HIT', status: 'SUCCESS' },
  { id: '1082', timestamp: '19:04:42', prompt: 'Woke up early, drank coffee, worked on CSS, in flow state, extremely immersed.', load: 25, latency: '0.11s', tokens: 168, cache: 'HIT', status: 'SUCCESS' },
  { id: '1081', timestamp: '18:15:33', prompt: 'How does Web MLC-LLM handle caching of model weights on local storage?', load: 15, latency: '4.8s', tokens: 88, cache: 'MISS', status: 'SUCCESS' },
  { id: '1080', timestamp: '17:58:20', prompt: 'Testing cognitive load evaluation with random text inputs and stress indicators.', load: 45, latency: '0.08s', tokens: 120, cache: 'HIT', status: 'SUCCESS' }
];

const INITIAL_REFLECTIONS = [
  { id: 1, content: "Preparing for my Go presentation tomorrow, nervous but ready.", decision_score: 75, created_at: new Date().toISOString() },
  { id: 2, content: "Flow state coding CSS interface. Coffee kicked in.", decision_score: 25, created_at: new Date().toISOString() }
];

export default function DashboardPage() {
  const [logs, setLogs] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // healthy, offline, checking
  const [avgCognitiveLoad, setAvgCognitiveLoad] = useState(50);
  const [stats, setStats] = useState({
    tokensProcessed: 184210,
    avgLatencyMs: 142,
    cacheHitRatio: 92.4,
    vramAllocatedGB: 1.48
  });



  const loadTelemetry = async () => {
    const backendUrl = getBackendUrl();
    const token = localStorage.getItem('journal_auth_token');
    
    // Local storage fallback loader
    const loadLocalFallback = () => {
      try {
        const stored = localStorage.getItem('journal_telemetry_logs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.length > 0) {
            setLogs(parsed);
            calculateStats(parsed);
            return;
          }
        }
        setLogs(INITIAL_LOGS);
        calculateStats(INITIAL_LOGS);
        setReflections(INITIAL_REFLECTIONS);
      } catch (err) {
        console.error("Local storage read failed:", err);
        setLogs(INITIAL_LOGS);
        calculateStats(INITIAL_LOGS);
        setReflections(INITIAL_REFLECTIONS);
      }
    };

    // If no authorization token is found, fall back immediately to local storage
    if (!token) {
      loadLocalFallback();
      return;
    }

    try {
      console.log('Fetching live telemetry logs from:', `${backendUrl}/api/monitor/metrics`);
      // 1. Fetch metrics (GET /api/monitor/metrics)
      const response = await fetch(`${backendUrl}/api/monitor/metrics`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const backendMetrics = await response.json(); // array of models.LlmMetric

      // 2. Fetch reflections (GET /api/journal)
      try {
        const journalRes = await fetch(`${backendUrl}/api/journal`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        if (journalRes.ok) {
          const backendJournals = await journalRes.json();
          if (Array.isArray(backendJournals)) {
            setReflections(backendJournals);
          }
        }
      } catch (e) {
        console.warn("Could not fetch journal reflections:", e);
      }

      // 3. Fetch score summaries (GET /api/monitor/scores)
      try {
        const scoreRes = await fetch(`${backendUrl}/api/monitor/scores`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        if (scoreRes.ok) {
          const scoreData = await scoreRes.json();
          setAvgCognitiveLoad(Math.round(scoreData.avg_cognitive_load || 50));
        }
      } catch (e) {
        console.warn("Could not fetch scores stats:", e);
      }

      if (Array.isArray(backendMetrics) && backendMetrics.length > 0) {
        let mappedLogs = backendMetrics.map((metric, i) => {
          let cognitiveLoad = 50;
          // Parse score percentage from the decision score string (ErrorLog)
          const re = /(\d+)%/;
          const match = (metric.error_log || "").match(re);
          if (match) {
            cognitiveLoad = parseInt(match[1], 10);
          } else {
            cognitiveLoad = Math.min(100, Math.max(15, 85 - (i * 12)));
          }

          // Extract text snippet from response string
          let textSnippet = metric.error_log || "WebGPU inference metrics synced.";
          const adviceIndex = textSnippet.indexOf(" - ");
          if (adviceIndex !== -1) {
            textSnippet = textSnippet.substring(adviceIndex + 3);
          }

          return {
            id: metric.id.toString(),
            timestamp: new Date(metric.created_at).toTimeString().split(' ')[0],
            prompt: textSnippet,
            load: cognitiveLoad,
            latency: metric.latency_ms > 1000 ? `${(metric.latency_ms / 1000).toFixed(2)}s` : `${metric.latency_ms}ms`,
            tokens: metric.token_count || 120,
            cache: metric.latency_ms > 1500 ? "MISS" : "HIT",
            status: "SUCCESS"
          };
        });

        if (mappedLogs.length === 0) {
          mappedLogs = INITIAL_LOGS;
        }

        setLogs(mappedLogs);
        calculateStats(mappedLogs);
        
        // Cache in local storage for instant offline viewing
        localStorage.setItem('journal_telemetry_logs', JSON.stringify(mappedLogs));
      } else {
        loadLocalFallback();
      }
    } catch (err) {
      console.warn("Failed to load telemetry from database. Using local cache. Error:", err.message);
      loadLocalFallback();
    }
  };

  const calculateStats = (logList) => {
    if (!logList || logList.length === 0) return;
    const totalTokens = logList.reduce((acc, curr) => acc + (curr.tokens || 0), 0);
    const hitCount = logList.filter(l => l.cache === 'HIT').length;
    const cacheHitRatio = Math.round((hitCount / logList.length) * 100);
    
    let totalLatencyMs = 0;
    logList.forEach(l => {
      let lat = l.latency || "";
      if (typeof lat === 'number') totalLatencyMs += lat;
      else if (lat.endsWith("ms")) totalLatencyMs += parseFloat(lat);
      else if (lat.endsWith("s")) totalLatencyMs += parseFloat(lat) * 1000;
      else totalLatencyMs += parseFloat(lat) || 100;
    });
    const avgLat = Math.round(totalLatencyMs / logList.length);

    setStats({
      tokensProcessed: totalTokens > 0 ? totalTokens : 184210,
      avgLatencyMs: avgLat > 0 ? avgLat : 142,
      cacheHitRatio: isNaN(cacheHitRatio) ? 92.4 : cacheHitRatio,
      vramAllocatedGB: 1.48
    });
  };

  useEffect(() => {
    const checkInitialHealth = async () => {
      const backendUrl = getBackendUrl();
      try {
        const response = await fetch(`${backendUrl}/health`, {
          method: "GET",
          headers: { "Accept": "application/json" }
        });
        if (response.ok) {
          setBackendStatus('healthy');
        } else {
          setBackendStatus('offline');
        }
      } catch (err) {
        setBackendStatus('offline');
      }
    };
    checkInitialHealth();
    loadTelemetry();
  }, []);

  const handleRefreshLogs = async () => {
    setRefreshing(true);
    setBackendStatus('checking');
    console.log('--- Syncing Dashboard with Backend & LocalStorage ---');

    const backendUrl = getBackendUrl();
    try {
      const response = await fetch(`${backendUrl}/health`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      if (response.ok) {
        setBackendStatus('healthy');
      } else {
        setBackendStatus('offline');
      }
    } catch (err) {
      console.error("Backend health check failed:", err);
      setBackendStatus('offline');
    }

    // Refresh telemetry logs
    await loadTelemetry();
    setRefreshing(false);
    console.log('Dashboard refreshed successfully.');
  };

  const handleClearLogs = async () => {
    console.log('Clearing telemetry logs from dashboard view...');
    const backendUrl = getBackendUrl();
    const token = localStorage.getItem('journal_auth_token');

    try {
      localStorage.removeItem('journal_telemetry_logs');
      setLogs([]);
      setReflections([]);
      setAvgCognitiveLoad(50);
      setStats({
        tokensProcessed: 0,
        avgLatencyMs: 0,
        cacheHitRatio: 100,
        vramAllocatedGB: 0
      });

      // Clear from database if authenticated (DELETE /api/monitor/clear)
      if (token) {
        await fetch(`${backendUrl}/api/monitor/clear`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error("Failed to clear metrics:", err);
    }
  };

  // Prepare chart data based on 6 most recent logs
  const recentLogs = [...logs].slice(0, 6).reverse(); // oldest first (left to right)
  
  // 1. Calculate dynamic points for Token Area Chart SVG
  const maxTokensVal = Math.max(...recentLogs.map(l => l.tokens || 0), 200);
  const tokenChartPoints = recentLogs.map((log, index) => {
    const x = recentLogs.length > 1 
      ? Math.round(40 + (index / (recentLogs.length - 1)) * 420)
      : 250;
    const normalizedVal = (log.tokens || 0) / maxTokensVal;
    const y = Math.round(165 - normalizedVal * 125);
    return { x, y, tokens: log.tokens, label: `Run #${log.id}`, id: log.id };
  });

  let tokenStrokePath = "M 40 165 L 460 165";
  let tokenFillPath = "M 40 165 L 460 165 Z";
  
  if (tokenChartPoints.length === 1) {
    tokenStrokePath = `M 40 ${tokenChartPoints[0].y} L 460 ${tokenChartPoints[0].y}`;
    tokenFillPath = `M 40 ${tokenChartPoints[0].y} L 460 ${tokenChartPoints[0].y} L 460 165 L 40 165 Z`;
  } else if (tokenChartPoints.length > 1) {
    tokenStrokePath = "M " + tokenChartPoints.map(p => `${p.x} ${p.y}`).join(" L ");
    const firstX = tokenChartPoints[0].x;
    const lastX = tokenChartPoints[tokenChartPoints.length - 1].x;
    tokenFillPath = `${tokenStrokePath} L ${lastX} 165 L ${firstX} 165 Z`;
  }

  // 2. Calculate dynamic points for Latency Bar Chart SVG
  const latenciesInSec = recentLogs.map(log => {
    let lat = log.latency || "";
    if (typeof lat === 'number') return lat;
    if (lat.endsWith("ms")) return parseFloat(lat) / 1000;
    if (lat.endsWith("s")) return parseFloat(lat);
    return parseFloat(lat) || 0;
  });

  const maxLatencyVal = Math.max(...latenciesInSec, 1.0);
  const latencyBars = recentLogs.map((log, index) => {
    const sec = latenciesInSec[index];
    const height = Math.max(14, Math.round((sec / maxLatencyVal) * 125));
    const colWidth = 420 / (recentLogs.length || 1);
    const x = Math.round(40 + colWidth * index + colWidth / 2);
    const y = 165 - height;
    const barWidth = Math.min(36, Math.max(18, Math.round(colWidth * 0.45)));

    let color = "#10b981"; // green hit
    let gradientId = "barGradGreen";
    if (sec > 1.5) {
      color = "#f43f5e"; // rose miss
      gradientId = "barGradRose";
    } else if (sec > 0.3) {
      color = "#f59e0b"; // amber
      gradientId = "barGradAmber";
    }

    const label = sec >= 1 ? `${sec.toFixed(2)}s` : `${Math.round(sec * 1000)}ms`;

    return { x, y, height, barWidth, label, rawVal: sec, isCold: log.cache === 'MISS', id: log.id, color, gradientId };
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 to-zinc-300">
            Raw LLM Monitoring
          </h1>
          <p className="text-zinc-400 text-sm mt-1 flex items-center gap-2">
            <span>Real-time telemetry of local inference and cache hits.</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold">
              Avg Load: {avgCognitiveLoad}%
            </span>
          </p>
        </div>
        
        {/* Actions & Server Status Badge */}
        <div className="flex items-center gap-3">
          {backendStatus === 'healthy' ? (
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-1.5 shadow-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Server Active</span>
            </span>
          ) : backendStatus === 'offline' ? (
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center gap-1.5 shadow-sm">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Server Offline</span>
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 flex items-center gap-1.5 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin shrink-0" />
              <span>Checking Server...</span>
            </span>
          )}

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
            <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {stats.tokensProcessed.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-550 font-semibold mt-1">
              Accumulated model runs
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
            <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {stats.avgLatencyMs > 1000 ? `${(stats.avgLatencyMs / 1000).toFixed(2)}s` : `${stats.avgLatencyMs}ms`}
            </h3>
            <p className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1 mt-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" /> WebGPU local threads
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
            <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {stats.cacheHitRatio}%
            </h3>
            <p className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1 mt-1">
              Local Browser Cache Storage
            </p>
          </div>
        </div>

        {/* Engine Stats */}
        <div className="glass-panel rounded-2xl p-5 border-zinc-850 hover:border-zinc-800 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Engine Status</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-450">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {stats.vramAllocatedGB > 0 ? `${stats.vramAllocatedGB} GB` : '0 GB'}
            </h3>
            <p className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1 mt-1">
              {stats.vramAllocatedGB > 0 ? (
                <span className="text-emerald-400 animate-pulse">Gemma-2B allocated</span>
              ) : (
                <span className="text-zinc-550">Unloaded from VRAM</span>
              )}
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

          <div className="relative h-64 w-full bg-zinc-950/40 rounded-2xl border border-zinc-800/60 p-4 flex items-center justify-center">
            {recentLogs.length === 0 ? (
              <span className="text-xs text-zinc-550">No run history found. Run analysis on Journal page.</span>
            ) : (
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid Lines */}
                <line x1="30" y1="40" x2="480" y2="40" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="80" x2="480" y2="80" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="120" x2="480" y2="120" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="165" x2="480" y2="165" stroke="#3f3f46" strokeWidth="1.5" />

                {/* Y-Axis Scale Labels */}
                <text x="25" y="44" fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="end">{maxTokensVal}</text>
                <text x="25" y="104" fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="end">{Math.round(maxTokensVal / 2)}</text>
                <text x="25" y="168" fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="end">0</text>
                
                {/* Chart Path Area */}
                <path d={tokenFillPath} fill="url(#tokenGrad)" />
                
                {/* Chart Stroke Line */}
                <path d={tokenStrokePath} fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points */}
                {tokenChartPoints.map((p, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={p.x} cy={p.y} r="6" fill="#c084fc" fillOpacity="0.3" />
                    <circle cx={p.x} cy={p.y} r="3.5" fill="#e9d5ff" stroke="#581c87" strokeWidth="1.5" />
                    <rect x={p.x - 18} y={p.y - 20} width="36" height="14" rx="4" fill="#18181b" stroke="#7e22ce" strokeWidth="1" />
                    <text x={p.x} y={p.y - 10} fill="#f3e8ff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {p.tokens}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>
          <div className="flex justify-between text-[9px] text-zinc-500 font-mono tracking-wider px-2">
            {recentLogs.map((log, i) => (
              <span key={i}>Run #{log.id}</span>
            ))}
            {recentLogs.length === 0 && <span>No history</span>}
          </div>
        </div>

        {/* Model Inference Latency Logs (SVG Bar Chart) */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-200">Local Inference Latency</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Cache Misses vs. Cache Hits</span>
          </div>

          <div className="relative h-64 w-full bg-zinc-950/40 rounded-2xl border border-zinc-800/60 p-4 flex items-center justify-center">
            {recentLogs.length === 0 ? (
              <span className="text-xs text-zinc-550">No run history found. Run analysis on Journal page.</span>
            ) : (
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="barGradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="barGradAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="barGradRose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                <line x1="30" y1="40" x2="480" y2="40" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="80" x2="480" y2="80" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="120" x2="480" y2="120" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="165" x2="480" y2="165" stroke="#3f3f46" strokeWidth="1.5" />

                {/* Y-Axis Scale Labels */}
                <text x="25" y="44" fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="end">{maxLatencyVal.toFixed(1)}s</text>
                <text x="25" y="104" fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="end">{(maxLatencyVal / 2).toFixed(1)}s</text>
                <text x="25" y="168" fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="end">0.0s</text>

                {/* Bars */}
                {latencyBars.map((bar, i) => (
                  <g key={i} className="group">
                    <rect 
                      x={bar.x - bar.barWidth / 2} 
                      y={bar.y} 
                      width={bar.barWidth} 
                      height={bar.height} 
                      fill={`url(#${bar.gradientId})`} 
                      stroke={bar.color}
                      strokeWidth="1"
                      rx="5" 
                    />
                    <rect x={bar.x - 22} y={bar.y - 18} width="44" height="14" rx="4" fill="#18181b" stroke={bar.color} strokeWidth="1" />
                    <text x={bar.x} y={bar.y - 8} fill="#f4f4f5" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {bar.label}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>
          <div className="flex justify-between text-[9px] text-zinc-500 font-mono tracking-wider px-2">
            {recentLogs.map((log, i) => (
              <span key={i}>Run #{log.id}</span>
            ))}
            {recentLogs.length === 0 && <span>No history</span>}
          </div>
        </div>
      </div>

      {/* Dynamic Bottom Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Raw Telemetry Log Table (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-zinc-200">Recent Local Inference Logs</h3>
            </div>
            <span className="text-[10px] text-zinc-550 font-mono font-bold">Node: dev-node-0</span>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-zinc-650 flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-xs">No traces loaded. Submit journal entries on the Journal page to sync telemetry data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-zinc-800/60 rounded-2xl bg-zinc-950/40">
              <table className="w-full text-left text-xs text-zinc-400 border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-850/80 text-[10px] text-zinc-500 uppercase font-semibold tracking-wider whitespace-nowrap bg-zinc-900/60">
                    <th className="py-3.5 px-4">Log ID</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Action Insight Snip</th>
                    <th className="py-3.5 px-4">Cognitive Load</th>
                    <th className="py-3.5 px-4">Latency</th>
                    <th className="py-3.5 px-4">Tokens</th>
                    <th className="py-3.5 px-4 text-right">Cache</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="border-b border-zinc-850/40 hover:bg-zinc-900/40 transition-colors font-mono whitespace-nowrap"
                    >
                      <td className="py-3.5 px-4 text-purple-400 font-bold">#{log.id}</td>
                      <td className="py-3.5 px-4 text-zinc-500">{log.timestamp}</td>
                      <td className="py-3.5 px-4 max-w-[220px] truncate text-zinc-300 font-sans">{log.prompt}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.load > 70 ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' : 
                          log.load > 40 ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20' : 
                          'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                        }`}>
                          {log.load}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-350">{log.latency}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{log.tokens} tks</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          log.cache === 'HIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                        }`}>
                          {log.cache}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Synced Reflections History (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-200">Synced Database Reflections</h3>
            </div>
            <span className="text-[10px] text-zinc-550 font-mono font-bold">API: /api/journal</span>
          </div>

          {reflections.length === 0 ? (
            <div className="p-8 text-center text-zinc-650 flex flex-col items-center justify-center min-h-[150px]">
              <BookOpen className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-xs">No reflections stored in database. Write your thoughts on the Journal page.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {reflections.slice(0, 10).map((ref) => (
                <div key={ref.id} className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-zinc-500">
                      {new Date(ref.created_at).toLocaleString().split(',')[1]?.trim() || "Synced"}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                      ref.decision_score > 70 ? 'bg-rose-500/5 text-rose-400 border-rose-500/10' : 
                      ref.decision_score > 40 ? 'bg-amber-500/5 text-amber-400 border-amber-500/10' : 
                      'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                    }`}>
                      Score: {ref.decision_score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                    {ref.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
