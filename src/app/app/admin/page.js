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
  Save,
  Search,
  CheckCircle,
  FileCode,
  Play,
  TrendingDown,
  Activity,
  Server,
  Cloud,
  GraduationCap,
  History,
  Database,
  Info
} from 'lucide-react';

export default function AdminCockpitPage() {
  const [activeAdminTab, setActiveAdminTab] = useState('users'); // 'users', 'config', 'adapters', 'telemetry', 'mcp'

  // User Management state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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

  // PEFT Fine-Tuning Launcher & Telemetry State
  const [finetuneForm, setFinetuneForm] = useState({
    adapter_name: 'gemma-journal-custom-lora',
    epochs: 5,
    lora_r: 16,
    learning_rate: 0.0002
  });
  const [finetuneStatus, setFinetuneStatus] = useState({
    status: 'IDLE',
    current_epoch: 0,
    total_epochs: 5,
    progress_pct: 0,
    loss: 0,
    vram_gb: 0,
    message: 'No fine-tuning active'
  });
  const [finetuneHistory, setFinetuneHistory] = useState([]);
  const [startingFinetune, setStartingFinetune] = useState(false);

  // MCP Suite state
  const [activeMcpTab, setActiveMcpTab] = useState('render');
  const [mcpQuery, setMcpQuery] = useState('System health and deployment status');
  const [mcpResult, setMcpResult] = useState(null);
  const [mcpLoading, setMcpLoading] = useState(false);

  useEffect(() => {
    fetchUsersList();
    fetchAdminData();
    fetchFinetuneStatus();
    fetchFinetuneHistory();

    const timer = setInterval(() => {
      fetchFinetuneStatus();
      fetchFinetuneHistory();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const fetchUsersList = async () => {
    setLoadingUsers(true);
    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`${backendUrl}/api/admin/users`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setUsersList(data);
      }
    } catch (e) {
      console.warn("Could not fetch user list:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleAdminRole = async (userId, makeAdmin) => {
    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`${backendUrl}/api/admin/users/role`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ user_id: userId, is_admin: makeAdmin })
      });
      if (res.ok) {
        fetchUsersList();
      } else {
        const err = await res.json();
        alert("Yetki güncellenemedi: " + (err.message || "Bilinmeyen hata"));
      }
    } catch (e) {
      alert("Ağ hatası: " + e.message);
    }
  };

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

  const fetchFinetuneStatus = async () => {
    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`${backendUrl}/api/admin/finetune/status`, { headers });
      if (res.ok) {
        const data = await res.json();
        setFinetuneStatus(data);
      }
    } catch (e) {
      // Quiet background polling
    }
  };

  const fetchFinetuneHistory = async () => {
    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`${backendUrl}/api/admin/finetune/history`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setFinetuneHistory(data);
      }
    } catch (e) {
      // Quiet background polling
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
        fetchAdminData();
      }
    } catch (err) {
      alert("Failed to hot-swap adapter: " + err.message);
    }
  };

  const handleStartFinetune = async (e) => {
    e.preventDefault();
    setStartingFinetune(true);

    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();

    try {
      const res = await fetch(`${backendUrl}/api/admin/finetune/start`, {
        method: "POST",
        headers,
        body: JSON.stringify(finetuneForm)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.job) setFinetuneStatus(data.job);
        fetchAdminData();
        fetchFinetuneHistory();
      }
    } catch (err) {
      alert("Failed to start fine-tuning: " + err.message);
    } finally {
      setStartingFinetune(false);
    }
  };

  const handleTestMCP = async (e) => {
    e.preventDefault();
    setMcpLoading(true);
    setMcpResult(null);

    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();

    try {
      const res = await fetch(`${backendUrl}/api/admin/mcp/suite`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          server: activeMcpTab,
          action: "inspect",
          query: mcpQuery
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMcpResult(data);
      }
    } catch (err) {
      console.error("MCP Request failed:", err);
    } finally {
      setMcpLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header (Without Stage 3 Final Boss badge as requested) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 to-zinc-300">
            Admin & LLM Control Cockpit
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            PEFT (LoRA) model eğitimi, veritabanı kayıtları, sıcak takas (hot-swap) adaptör yönetimi ve MCP denetleyicisi.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation Bar */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeAdminTab === 'users'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          👥 Kullanıcı Yönetimi
        </button>
        <button
          onClick={() => setActiveAdminTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeAdminTab === 'config'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          ⚙️ LLM Ayarları
        </button>
        <button
          onClick={() => setActiveAdminTab('adapters')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeAdminTab === 'adapters'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          🧩 PEFT Adaptörleri
        </button>
        <button
          onClick={() => setActiveAdminTab('telemetry')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeAdminTab === 'telemetry'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          📈 Model Eğitimi (Fine-Tuning)
        </button>
        <button
          onClick={() => setActiveAdminTab('mcp')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeAdminTab === 'mcp'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          🌐 MCP Suite
        </button>
      </div>

      {/* Sub-tab 1: User Management */}
      {activeAdminTab === 'users' && (
        <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100">Kayıtlı Kullanıcı Listesi ve Admin Yetkilendirme</h3>
              <p className="text-xs text-zinc-400">Sistemdeki tüm kullanıcıları görüntüleyin ve anında admin yetkisi verin/kaldırın.</p>
            </div>
            <button
              onClick={fetchUsersList}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 hover:text-white"
            >
              🔄 Yenile
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/80 text-zinc-400 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">E-Posta Adresi</th>
                  <th className="p-3">Mevcut Rol</th>
                  <th className="p-3">Kayıt Tarihi</th>
                  <th className="p-3">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {usersList.length > 0 ? (
                  usersList.map((u) => {
                    const isAdminUser = u.is_admin || u.role === 'admin';
                    return (
                      <tr key={u.id} className="hover:bg-zinc-900/40">
                        <td className="p-3 font-mono">#{u.id}</td>
                        <td className="p-3 font-medium text-zinc-100">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                            isAdminUser
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          }`}>
                            {isAdminUser ? 'ADMIN' : 'USER'}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
                        <td className="p-3">
                          {isAdminUser ? (
                            <button
                              onClick={() => handleToggleAdminRole(u.id, false)}
                              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[11px] font-semibold cursor-pointer"
                            >
                              🚫 Adminliğini Kaldır
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleAdminRole(u.id, true)}
                              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold cursor-pointer"
                            >
                              🛡️ Admin Yetkisi Ver
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-zinc-500">
                      {loadingUsers ? 'Kullanıcı listesi yükleniyor...' : 'Kullanıcı kaydı bulunamadı.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 2: LLM Config */}
      {activeAdminTab === 'config' && (
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800/50 pt-4">
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
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Konfigürasyonu Canlı Güncelle</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Sub-tab 3: Adapters */}
      {activeAdminTab === 'adapters' && (
        <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-zinc-100">PEFT (LoRA) Adaptör Sıcak Takas (Hot-Swap)</h3>
            </div>
          </div>

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
      )}

      {/* Sub-tab 4: Fine-Tuning Telemetry */}
      {activeAdminTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-zinc-100">PEFT (LoRA/QLoRA) Canlı Eğitim & Monitör</h3>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                finetuneStatus.status === 'RUNNING' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                  : finetuneStatus.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}>
                ● {finetuneStatus.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Progress</span>
                <span className="text-lg font-mono font-bold text-indigo-400">{finetuneStatus.progress_pct || 0}%</span>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-emerald-400" /> Loss
                </span>
                <span className="text-lg font-mono font-bold text-emerald-400">{finetuneStatus.loss ? finetuneStatus.loss.toFixed(4) : '0.0000'}</span>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Epoch</span>
                <span className="text-lg font-mono font-bold text-purple-400">{finetuneStatus.current_epoch || 0} / {finetuneStatus.total_epochs || 5}</span>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">GPU VRAM</span>
                <span className="text-lg font-mono font-bold text-cyan-400">{finetuneStatus.vram_gb || 0} GB</span>
              </div>
            </div>

            <form onSubmit={handleStartFinetune} className="space-y-4 pt-2 border-t border-zinc-800/50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Adaptör Adı:</label>
                  <input
                    type="text"
                    value={finetuneForm.adapter_name}
                    onChange={(e) => setFinetuneForm(prev => ({ ...prev, adapter_name: e.target.value }))}
                    className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">LoRA Rank (r):</label>
                  <input
                    type="number"
                    value={finetuneForm.lora_r}
                    onChange={(e) => setFinetuneForm(prev => ({ ...prev, lora_r: parseInt(e.target.value, 10) }))}
                    className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Epochs:</label>
                  <input
                    type="number"
                    value={finetuneForm.epochs}
                    onChange={(e) => setFinetuneForm(prev => ({ ...prev, epochs: parseInt(e.target.value, 10) }))}
                    className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={startingFinetune || finetuneStatus.status === 'RUNNING'}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {startingFinetune ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Yerel GPU PEFT Fine-Tuning Başlat</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sub-tab 5: MCP Suite */}
      {activeAdminTab === 'mcp' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-zinc-100">MCP Multi-Server Inspector & DeepWiki</h3>
              </div>
            </div>

            <form onSubmit={handleTestMCP} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={mcpQuery}
                  onChange={(e) => setMcpQuery(e.target.value)}
                  placeholder="MCP sorgusu girin..."
                  className="w-full p-3 pl-9 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              </div>

              <button
                type="submit"
                disabled={mcpLoading}
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

            {mcpResult && (
              <div className="space-y-3 pt-2 border-t border-zinc-800/50">
                <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl font-mono text-[11px] text-zinc-300 leading-relaxed overflow-x-auto">
                  <pre>{JSON.stringify(mcpResult.data || mcpResult, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
