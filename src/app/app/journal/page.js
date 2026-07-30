'use client';
import { useState, useEffect } from 'react';
import { getBackendUrl, getAuthHeaders, getUserStorageKey } from '@/lib/api';
import { 
  Sparkles, 
  Send, 
  Brain, 
  Zap, 
  Clock, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Target,
  Code,
  GraduationCap,
  Sliders,
  Copy,
  Check,
  ArrowRight,
  History
} from 'lucide-react';

const TEMPLATES = [
  {
    id: 'accurate',
    name: 'En Doğru Sonuç',
    description: 'Prompt\'u en hassas, net ve eksiksiz yanıt verecek şekilde yapılandırır.',
    icon: Target,
    badge: 'High Precision',
    color: 'purple'
  },
  {
    id: 'minimal',
    name: 'Minimum Token',
    description: 'Gereksiz kelimeleri çıkartıp token tüketimini ve maliyeti en aza indirir.',
    icon: Zap,
    badge: 'Token Saver',
    color: 'emerald'
  },
  {
    id: 'creative',
    name: 'En Yaratıcı',
    description: 'Modelin zengin, hayal gücü yüksek ve detaylı çıktılar üretmesini sağlar.',
    icon: Sparkles,
    badge: 'High Creativity',
    color: 'amber'
  },
  {
    id: 'code',
    name: 'Kod Odaklı',
    description: 'Yazılım geliştirme görevleri için üretim kalitesinde kod spesifikasyonuna çevirir.',
    icon: Code,
    badge: 'Developer Pack',
    color: 'indigo'
  },
  {
    id: 'academic',
    name: 'Akademik & Araştırma',
    description: 'Resmi terminoloji ve metodolojik analiz yapısına dönüştürür.',
    icon: GraduationCap,
    badge: 'Research Grade',
    color: 'rose'
  },
  {
    id: 'custom',
    name: 'Özel Talimat',
    description: 'Sizin belirteceğiniz özel optimizasyon kuralına göre prompt\'u yeniden biçimlendirir.',
    icon: Sliders,
    badge: 'Custom Rule',
    color: 'sky'
  }
];

const SAMPLE_PROMPTS = [
  {
    title: "React Component",
    text: "Bana bir React kullanılarak yapılmış modal bileşeni yaz. İçinde animasyon olsun ve dark mode uyumlu olsun.",
    template: "code"
  },
  {
    title: "Müşteri E-postası",
    text: "Müşterimize geciken sipariş için çok özür dileyen ve %15 indirim kuponu veren bir e-posta yazabilir misin?",
    template: "accurate"
  },
  {
    title: "Veritabanı Analizi",
    text: "PostgreSQL'de yavaş çalışan sorguları nasıl tespit edip indeksleme yapabilirim? Adım adım anlat.",
    template: "code"
  }
];

export default function PromptOptimizerPage() {
  const [promptText, setPromptText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('accurate');
  const [customInstruction, setCustomInstruction] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Server Status State
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    // Check server health
    const checkServerHealth = async () => {
      const backendUrl = getBackendUrl();
      try {
        const res = await fetch(`${backendUrl}/health`, {
          method: "GET",
          headers: { "Accept": "application/json" }
        });
        if (res.ok) {
          setBackendStatus('healthy');
        } else {
          setBackendStatus('offline');
        }
      } catch (err) {
        setBackendStatus('offline');
      }
    };

    checkServerHealth();
    fetchHistory();

    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    const backendUrl = getBackendUrl();
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`${backendUrl}/api/prompt/history`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setHistory(data);
      }
    } catch (err) {
      console.warn("Could not fetch prompt history from backend:", err);
    }
  };

  const wordCount = promptText.trim() === '' ? 0 : promptText.trim().split(/\s+/).length;
  const charCount = promptText.length;
  const estTokens = Math.max(1, Math.round(charCount / 4));

  const handleSampleClick = (sample) => {
    setPromptText(sample.text);
    setSelectedTemplate(sample.template);
  };

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (promptText.trim() === '') return;

    setOptimizing(true);
    setOptimizationResult(null);
    setCopied(false);

    const backendUrl = getBackendUrl();
    const fetchHeaders = getAuthHeaders();

    try {
      const effectiveCustomInstruction = selectedTemplate === 'custom' 
        ? (customInstruction.trim() || 'Özel talimata göre promptu yapılandır ve yanıt ver.')
        : '';

      const res = await fetch(`${backendUrl}/api/prompt/optimize`, {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({ 
          prompt: promptText,
          template: selectedTemplate,
          custom_instruction: effectiveCustomInstruction,
          customInstruction: effectiveCustomInstruction
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Sunucu hatası: HTTP ${res.status}`);
      }

      const result = await res.json();
      setOptimizationResult(result);

      // Save run to local telemetry cache for dashboard
      try {
        const storageKey = getUserStorageKey('journal_telemetry_logs');
        const storedLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newLog = {
          id: Math.floor(Math.random() * 1000 + 3000).toString(),
          timestamp: new Date().toTimeString().split(' ')[0],
          prompt: `${selectedTemplate.toUpperCase()}: ${promptText.substring(0, 40)}...`,
          load: Math.abs(Math.round(result.tokenSavingsPct || 25)),
          latency: `${result.metrics.inferenceTimeSec}s`,
          tokens: result.metrics.totalTokens,
          cache: "MISS",
          status: 'SUCCESS'
        };
        const updatedLogs = [newLog, ...storedLogs].slice(0, 50);
        localStorage.setItem(storageKey, JSON.stringify(updatedLogs));
      } catch (err) {
        console.error('Failed to save run to localStorage:', err);
      }

      // Refresh history list
      fetchHistory();
    } catch (error) {
      console.error("Prompt optimization failed:", error);
      let msg = error.message;
      if (msg === "Failed to fetch") {
        msg = "Sunucuya bağlanılamadı (CORS/Ağ hatası). Lütfen backend servisinin çalıştığından ve internet bağlantınızdan emin olun.";
      }
      alert("Optimizasyon hatası: " + msg);
    } finally {
      setOptimizing(false);
    }
  };

  const handleCopy = () => {
    if (!optimizationResult) return;
    navigator.clipboard.writeText(optimizationResult.optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Title Header with Server Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Prompt Optimizer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-500" /> Gemma Engine
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Ham prompt'larınızı yapay zeka modelleri için en doğru, tasarruflu veya yaratıcı formata dönüştürün.
          </p>
        </div>

        {/* Server Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {backendStatus === 'healthy' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold shadow-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse-slow" />
              <span>Server Active</span>
            </div>
          ) : backendStatus === 'offline' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold shadow-sm">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Server Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 text-xs font-semibold shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin shrink-0" />
              <span>Checking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Input & Templates, Right Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form & Template Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Template Selection Grid */}
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-455 uppercase tracking-wider block mb-3">
              1. Optimizasyon Şablonunu Seçin:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative group cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500/15 dark:bg-purple-600/15 border-purple-550/50 dark:border-purple-500/50 text-purple-700 dark:text-purple-200 shadow-lg shadow-purple-950/10 dark:shadow-purple-950/40 ring-1 ring-purple-500/20 dark:ring-purple-500/30'
                        : 'bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-purple-550/15 dark:bg-purple-500/20 text-purple-600 dark:text-purple-350' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-450'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        isSelected ? 'bg-purple-550/15 border-purple-550/30 text-purple-600 dark:text-purple-300' : 'bg-slate-200/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-550'
                      }`}>
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className={`text-xs font-bold ${isSelected ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300'}`}>
                      {tmpl.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Instruction Box if 'custom' selected */}
          {selectedTemplate === 'custom' && (
            <div className="bg-sky-950/10 dark:bg-sky-950/20 border border-sky-500/30 rounded-2xl p-4 space-y-2 animate-fade-in">
              <label className="text-xs font-semibold text-sky-600 dark:text-sky-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Özel Optimizasyon Kuralınız:
              </label>
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Örn: Sadece JSON formatında çıktı ver, açıklama yapma..."
                className="w-full p-3 bg-slate-100/60 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
              />
            </div>
          )}

          {/* Sample Prompts */}
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider block mb-2">
              Örnek Prompt'lar:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleClick(sample)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-250 dark:border-zinc-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                  <span>{sample.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Prompt Input Box */}
          <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-550 dark:text-zinc-400 font-semibold">
              <span>2. Orijinal Prompt'unuzu Girin:</span>
              <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500">
                {charCount} karakter | ~{estTokens} token
              </span>
            </div>

            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Optimize etmek istediğiniz ham prompt'u buraya yazın..."
              rows={8}
              disabled={optimizing}
              className="w-full p-4 bg-slate-100/50 dark:bg-zinc-900/60 border border-slate-250 dark:border-zinc-800/80 rounded-2xl text-slate-800 dark:text-zinc-200 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-650 resize-none leading-relaxed disabled:opacity-40"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Ollama + Gemma ile yerel optimize edilir.</span>
              </div>

              <button
                type="submit"
                onClick={handleOptimize}
                disabled={promptText.trim() === '' || optimizing}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 active:scale-[0.98] transition-all rounded-xl font-semibold text-sm text-white flex items-center gap-2 shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {optimizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Optimize Ediliyor...</span>
                  </>
                ) : (
                  <>
                    <span>Prompt'u Optimize Et</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Optimized Result & Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Idle State */}
          {!optimizationResult && !optimizing && (
            <div className="glass-panel rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[420px] border-dashed border-slate-350 dark:border-zinc-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-400 dark:text-zinc-600 border border-slate-200 dark:border-zinc-800 mb-4 animate-pulse-slow">
                <Sparkles className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-zinc-300">Optimizasyon Bekleniyor</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2 max-w-xs leading-relaxed mx-auto">
                Soldaki alana bir prompt girip şablon seçerek optimizasyonu başlatın. Optimize edilmiş çıktı ve token analizleri burada görünecektir.
              </p>
            </div>
          )}

          {/* Optimizing Loading State */}
          {optimizing && (
            <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center min-h-[420px] space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-300">Prompt Mühendisliği Çalışıyor</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-500 animate-pulse font-mono">
                  {TEMPLATES.find(t => t.id === selectedTemplate)?.name} şablonu uygulanıyor...
                </p>
              </div>
            </div>
          )}

          {/* Result Output Panel */}
          {optimizationResult && (
            <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-2xl relative border-purple-500/30 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-250 dark:border-zinc-800/50 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Optimize Edilmiş Prompt</h3>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 dark:bg-purple-600/20 hover:bg-purple-500/20 dark:hover:bg-purple-600/30 border border-purple-550/30 dark:border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-emerald-500 dark:text-emerald-400">Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Content */}
              <div className="bg-slate-100/80 dark:bg-[#070a10] border border-slate-250 dark:border-zinc-800 rounded-2xl p-4 text-xs font-mono text-slate-800 dark:text-zinc-200 leading-relaxed max-h-[260px] overflow-y-auto whitespace-pre-wrap selection:bg-purple-500/30">
                {optimizationResult.optimizedPrompt}
              </div>

              {/* Token Savings Metric Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-100/50 dark:bg-zinc-900/60 border border-slate-250 dark:border-zinc-850 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase block">Orijinal vs Optimize</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-mono text-slate-500 dark:text-zinc-400 line-through">{optimizationResult.originalTokens} tks</span>
                    <ArrowRight className="w-3 h-3 text-purple-500 dark:text-purple-400 shrink-0" />
                    <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{optimizationResult.optimizedTokens} tks</span>
                  </div>
                </div>

                <div className="bg-slate-100/50 dark:bg-zinc-900/60 border border-slate-250 dark:border-zinc-850 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase block">Token Değişimi</span>
                  <div className="mt-1">
                    <span className={`text-base font-black font-mono ${
                      optimizationResult.tokenSavingsPct > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'
                    }`}>
                      {optimizationResult.tokenSavingsPct > 0 ? `-%${optimizationResult.tokenSavingsPct} Tasarruf` : `+%${Math.abs(optimizationResult.tokenSavingsPct)} Zenginleştirme`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Benchmarking Metadata */}
              <div className="border-t border-slate-250 dark:border-zinc-800/50 pt-4">
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-550 dark:text-zinc-500">
                  <div className="bg-slate-100/40 dark:bg-zinc-900/40 py-1.5 rounded-xl border border-slate-250 dark:border-zinc-850">
                    <span className="block text-[8px] text-slate-400 dark:text-zinc-600 uppercase font-bold">Süre</span>
                    <span className="text-slate-800 dark:text-zinc-300 flex items-center justify-center gap-1 mt-0.5 font-bold">
                      <Clock className="w-3 h-3 text-purple-500 dark:text-purple-400" /> {optimizationResult.metrics.inferenceTimeSec}s
                    </span>
                  </div>
                  <div className="bg-slate-100/40 dark:bg-zinc-900/40 py-1.5 rounded-xl border border-slate-250 dark:border-zinc-850">
                    <span className="block text-[8px] text-slate-400 dark:text-zinc-600 uppercase font-bold">Hız</span>
                    <span className="text-slate-800 dark:text-zinc-300 flex items-center justify-center gap-1 mt-0.5 font-bold">
                      <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" /> {optimizationResult.metrics.tokensSec} T/s
                    </span>
                  </div>
                  <div className="bg-slate-100/40 dark:bg-zinc-900/40 py-1.5 rounded-xl border border-slate-250 dark:border-zinc-850">
                    <span className="block text-[8px] text-slate-400 dark:text-zinc-600 uppercase font-bold">Şablon</span>
                    <span className="text-purple-600 dark:text-purple-400 uppercase font-bold mt-0.5 block truncate px-1">
                      {optimizationResult.template}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optimization History Section */}
      {history.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-250 dark:border-zinc-800/50 pb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-200">Son Optimizasyon Geçmişiniz</h3>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-550 font-mono font-bold">Toplam {history.length} işlem</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.slice(0, 6).map((item) => (
              <div 
                key={item.id} 
                className="p-4 bg-slate-100/50 dark:bg-zinc-900/50 border border-slate-250 dark:border-zinc-850 rounded-2xl space-y-2 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 uppercase font-bold">
                    {item.template}
                  </span>
                  <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-400 font-sans line-clamp-2">
                  {item.original_prompt}
                </p>
                <button
                  onClick={() => {
                    setPromptText(item.original_prompt);
                    setSelectedTemplate(item.template);
                  }}
                  className="text-[10px] text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer pt-1"
                >
                  <span>Tekrar Kullan</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
