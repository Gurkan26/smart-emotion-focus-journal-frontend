'use client';
import { useState, useEffect } from 'react';
import { getBackendUrl, getAuthHeaders } from '@/lib/api';
import { 
  Cpu, 
  Sliders, 
  BookOpen, 
  Zap, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Save,
  Search,
  CheckCircle,
  Database,
  SlidersHorizontal,
  FileCode
} from 'lucide-react';

export default function AdminCockpitPage() {
  // LLM Config state
  const [llmConfig, setLlmConfig] = useState({
    system_prompt: 'You are an expert AI prompt optimizer and cognitive load analyst.',
    max_tokens: 2048,
    temperature: 0.2,
    top_p: 0.9,
    active_adapter: 'gemma-default-lora'
  });

  // Adapters state
  const [adapters, setAdapters] = useState([]);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // DeepWiki MCP state
  const [mcpQuery, setMcpQuery] = useState('React component state optimization');
  const [mcpResult, setMcpResult] = useState(null);
  const [mcpLoading, setMcpLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();

    // 1. Fetch LLM Config
    try {
      const res = await fetch(`${backendUrl}/api/admin/config`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLlmConfig(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.warn("Could not fetch admin config:", e);
    }

    // 2. Fetch PEFT Adapters
    try {
      const res = await fetch(`${backendUrl}/api/admin/adapters`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdapters(data);
      }
    } catch (e) {
      console.warn("Could not fetch adapters:", e);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigSuccess(false);

    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();

    try {
      const res = await fetch(`${backendUrl}/api/admin/config`, {
        method: "PUT",
        headers,
        body: JSON.stringify(llmConfig)
      });
      if (res.ok) {
        setConfigSuccess(true);
        setTimeout(() => setConfigSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to update config: " + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleActivateAdapter = async (adapterName) => {
    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();

    try {
      const res = await fetch(`${backendUrl}/api/admin/adapters/activate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: adapterName })
      });
      if (res.ok) {
        setLlmConfig(prev => ({ ...prev, active_adapter: adapterName }));
        setAdapters(prev => prev.map(a => ({
          ...a,
          is_active: a.name === adapterName
        })));
      }
    } catch (err) {
      alert("Failed to hot-swap adapter: " + err.message);
    }
  };

  const handleTestMCP = async (e) => {
    e.preventDefault();
    if (!mcpQuery.trim()) return;

    setMcpLoading(true);
    setMcpResult(null);

    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();

    try {
      const res = await fetch(`${backendUrl}/api/admin/mcp/deepwiki`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: mcpQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setMcpResult(data);
      }
    } catch (err) {
      console.error("MCP Query failed:", err);
    } finally {
      setMcpLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 to-zinc-300">
              Admin & LLM Modify Cockpit
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Enterprise AI Control Engine
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            PEFT (LoRA) adaptörlerini sıcak takas (hot-swap) yapın, System Prompt düzenleyin ve DeepWiki MCP protokolünü test edin.
          </p>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: PEFT LoRA Adapter Management & System Prompt (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* PEFT Adapter Hot-Swap Panel */}
          <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-zinc-100">PEFT (LoRA) Adaptör Yönetimi</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Hot-Swap Live
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Modeli yeniden başlatmadan seçilen LoRA ağırlıklarını canlı olarak yükleyin veya değiştirin.
            </p>

            <div className="space-y-3">
              {adapters.map((adapter) => (
                <div
                  key={adapter.id || adapter.name}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    adapter.is_active || adapter.name === llmConfig.active_adapter
                      ? 'bg-purple-600/10 border-purple-500/40 text-zinc-100 shadow-md'
                      : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-xs font-bold text-zinc-200 truncate">{adapter.name}</span>
                      {(adapter.is_active || adapter.name === llmConfig.active_adapter) && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                          Aktif Adaptör
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{adapter.description}</p>
                    <span className="text-[9px] font-mono text-zinc-600 block mt-0.5">{adapter.file_path}</span>
                  </div>

                  <button
                    onClick={() => handleActivateAdapter(adapter.name)}
                    disabled={adapter.is_active || adapter.name === llmConfig.active_adapter}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      adapter.is_active || adapter.name === llmConfig.active_adapter
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-default'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                    }`}
                  >
                    {adapter.is_active || adapter.name === llmConfig.active_adapter ? 'Yüklü' : 'Yükle & Aktif Et'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Prompt & Parameter Controls Form */}
          <form onSubmit={handleSaveConfig} className="glass-panel rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-zinc-100">Sistem Promptu & Hyperparameters</h3>
              </div>
              {configSuccess && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                  <Check className="w-3.5 h-3.5" /> Kaydedildi!
                </span>
              )}
            </div>

            {/* System Prompt Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Canlı System Prompt (LLM Temel Karakteri):
              </label>
              <textarea
                value={llmConfig.system_prompt}
                onChange={(e) => setLlmConfig(prev => ({ ...prev, system_prompt: e.target.value }))}
                rows={4}
                className="w-full p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            {/* Hyperparameter Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800/50 pt-4">
              {/* Temperature Slider */}
              <div className="bg-zinc-900/50 border border-zinc-850 p-3.5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-semibold">Temperature:</span>
                  <span className="font-mono font-bold text-purple-400">{llmConfig.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={llmConfig.temperature}
                  onChange={(e) => setLlmConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Max Tokens Slider */}
              <div className="bg-zinc-900/50 border border-zinc-850 p-3.5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-semibold">Max Tokens:</span>
                  <span className="font-mono font-bold text-purple-400">{llmConfig.max_tokens}</span>
                </div>
                <input
                  type="range"
                  min="512"
                  max="8192"
                  step="256"
                  value={llmConfig.max_tokens}
                  onChange={(e) => setLlmConfig(prev => ({ ...prev, max_tokens: parseInt(e.target.value, 10) }))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Top-P Slider */}
              <div className="bg-zinc-900/50 border border-zinc-850 p-3.5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-semibold">Top-P:</span>
                  <span className="font-mono font-bold text-purple-400">{llmConfig.top_p}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={llmConfig.top_p}
                  onChange={(e) => setLlmConfig(prev => ({ ...prev, top_p: parseFloat(e.target.value) }))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {savingConfig ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Konfigürasyonu Canlı Güncelle</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: DeepWiki MCP Protocol Tester (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-zinc-100">DeepWiki MCP Inspector</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                WebMCP Protocol
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Model Context Protocol (MCP) standartlaştırılmış veri akışı ile DeepWiki bilgi bankasını sorgulayın.
            </p>

            <form onSubmit={handleTestMCP} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={mcpQuery}
                  onChange={(e) => setMcpQuery(e.target.value)}
                  placeholder="DeepWiki sorgusu girin..."
                  className="w-full p-3 pl-9 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              </div>

              <button
                type="submit"
                disabled={mcpLoading || !mcpQuery.trim()}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-750 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {mcpLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>MCP Sorgusu Gönder</span>
                  </>
                )}
              </button>
            </form>

            {/* MCP Result View */}
            {mcpResult && (
              <div className="space-y-3 pt-2 border-t border-zinc-800/50 animate-fade-in">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> MCP Handshake Success
                  </span>
                  <span>{mcpResult.latencyMs} ms</span>
                </div>

                <div className="bg-zinc-950/70 border border-zinc-800 p-3 rounded-2xl font-mono text-xs text-zinc-300 leading-relaxed">
                  {mcpResult.queryResult}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Kaynaklar (Sources):</span>
                  {mcpResult.sources?.map((src, i) => (
                    <div key={i} className="text-[10px] font-mono text-purple-400 bg-purple-950/20 px-2.5 py-1 rounded-lg border border-purple-800/30">
                      {src}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
