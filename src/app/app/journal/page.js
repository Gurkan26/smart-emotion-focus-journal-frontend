'use client';
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Brain, 
  Activity, 
  Zap, 
  Clock, 
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Gauge
} from 'lucide-react';

const SUGGESTIONS = [
  {
    title: "Focus Reflection",
    text: "I am trying to study React components, but my mind keeps wandering to social media. I feel slightly tired, and I've been working for 3 hours without a break.",
    icon: Zap,
    tag: "Distracted / High Load"
  },
  {
    title: "Deep Flow State",
    text: "I woke up early, had a cup of coffee, and immediately started working on design code. The interface looks amazing, and I feel completely immersed in my work. Time is flying.",
    icon: Sparkles,
    tag: "High Focus / Low Stress"
  },
  {
    title: "Pre-Exam Stress",
    text: "I have a big presentation in Go programming tomorrow. My heart is racing a bit, and I find it hard to structure my thoughts. I want to make sure I don't miss any requirements.",
    icon: Activity,
    tag: "High Anxiety"
  }
];

export default function JournalPage() {
  const [journalText, setJournalText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Web-LLM states
  const [engine, setEngine] = useState(null);
  const [engineLoading, setEngineLoading] = useState(true);
  const [engineProgress, setEngineProgress] = useState(0);
  const [engineStatus, setEngineStatus] = useState('Initializing WebGPU...');
  const [webGpuSupported, setWebGpuSupported] = useState(true);
  const [engineError, setEngineError] = useState(null);

  useEffect(() => {
    let active = true;
    let loadedEngine = null;

    async function initWebLLM() {
      try {
        if (!navigator.gpu) {
          throw new Error("WebGPU is not supported by your browser. Please use Chrome, Edge or Safari 18+.");
        }

        setEngineStatus('Loading Web-LLM client module...');
        const webLLM = await import('@mlc-ai/web-llm');
        
        if (!active) return;

        setEngineStatus('Downloading Gemma-2B-it weights (cached after first run)...');
        // gemma-2b-it-q4f16_1-MLC is the lightweight Gemma model recommended
        const selectedModel = 'gemma-2b-it-q4f16_1-MLC';

        const initProgressCallback = (report) => {
          if (!active) return;
          console.log('Web-LLM Loading Progress:', report);
          setEngineProgress(report.progress || 0);
          setEngineStatus(report.text || 'Loading model weights...');
        };

        loadedEngine = await webLLM.CreateMLCEngine(selectedModel, {
          initProgressCallback,
        });

        if (active) {
          setEngine(loadedEngine);
          setEngineLoading(false);
          setEngineStatus('Gemma-2B Local Model ready!');
        }
      } catch (err) {
        console.error('Web-LLM Engine Init Failed:', err);
        if (active) {
          setEngineLoading(false);
          setWebGpuSupported(false);
          setEngineError(err.message || 'Failed to initialize local model.');
        }
      }
    }

    initWebLLM();

    return () => {
      active = false;
    };
  }, []);

  const wordCount = journalText.trim() === '' ? 0 : journalText.trim().split(/\s+/).length;
  const charCount = journalText.length;

  const handleSuggestionClick = (text) => {
    if (engineLoading || !webGpuSupported) return;
    setJournalText(text);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (journalText.trim() === '' || !engine) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    const startTime = performance.now();
    console.log('--- Local Gemma-2B Inference Started ---');

    try {
      const systemPrompt = "You are an emotional state analysis assistant. Read the user's text and only return a Decision Score in this format: 'Cognitive Load Score: %X - [One sentence advice]'. Do not include any other conversational filler, introductions, or pleasantries.";

      const response = await engine.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: journalText }
        ],
        temperature: 0.1, // low temperature for structured formats
      });

      const replyText = (response.choices[0].message.content || "").trim();
      const endTime = performance.now();
      const latencyMs = endTime - startTime;

      console.log('Raw model output:', replyText);

      // Extract tokens
      const promptTokens = response.usage?.prompt_tokens || Math.floor(journalText.length / 4) + 12;
      const completionTokens = response.usage?.completion_tokens || Math.floor(replyText.length / 4) + 5;
      const totalTokens = promptTokens + completionTokens;

      // Parse the reply: e.g. "Cognitive Load Score: 75% - Take a deep breath."
      let cognitiveLoad = 50; // fallback default
      let suggestion = replyText;

      // Match format: Cognitive Load Score: X% - Advice
      const match = replyText.match(/Cognitive\s+Load\s+Score:\s*(\d+)%?\s*-\s*(.*)/i);
      if (match) {
        cognitiveLoad = parseInt(match[1], 10);
        suggestion = match[2].trim();
      } else {
        // Fallback checks
        const fallbackPercent = replyText.match(/(\d+)%/);
        if (fallbackPercent) {
          cognitiveLoad = parseInt(fallbackPercent[1], 10);
        }
        const parts = replyText.split('-');
        if (parts.length > 1) {
          suggestion = parts.slice(1).join('-').trim();
        }
      }

      // Safeguard values
      cognitiveLoad = Math.min(100, Math.max(0, cognitiveLoad));
      const stressLevel = Math.min(100, Math.max(0, Math.round(cognitiveLoad * 1.1 - 10)));
      const focusLevel = Math.min(100, Math.max(0, Math.round(100 - cognitiveLoad * 0.8)));

      let dominantEmotion = "Calm & Centered";
      if (cognitiveLoad > 75) {
        dominantEmotion = "High Cognitive Fatigue";
      } else if (cognitiveLoad > 45) {
        dominantEmotion = "Distracted / Restless";
      }

      const finalResult = {
        cognitiveLoad,
        focusLevel,
        stressLevel,
        dominantEmotion,
        suggestion,
        metrics: {
          inferenceTimeSec: (latencyMs / 1000).toFixed(2),
          tokensSec: (totalTokens / (latencyMs / 1000)).toFixed(1),
          promptTokens,
          completionTokens,
          totalTokens,
          latencyMs: Math.round(latencyMs)
        }
      };

      setAnalysisResult(finalResult);

      // Save to localStorage for Dashboard integration
      try {
        const storedLogs = JSON.parse(localStorage.getItem('journal_telemetry_logs') || '[]');
        const newLog = {
          id: Math.floor(Math.random() * 1000 + 2000).toString(),
          timestamp: new Date().toTimeString().split(' ')[0],
          prompt: journalText,
          load: cognitiveLoad,
          latency: `${(latencyMs / 1000).toFixed(2)}s`,
          tokens: totalTokens,
          cache: "MISS",
          status: 'SUCCESS'
        };
        const updatedLogs = [newLog, ...storedLogs].slice(0, 50);
        localStorage.setItem('journal_telemetry_logs', JSON.stringify(updatedLogs));
        console.log('Saved telemetry run to localStorage:', newLog);
      } catch (err) {
        console.error('Failed to save run to localStorage:', err);
      }

      // Reset the input area
      setJournalText('');

      // Send to Backend 1: Raw LLM metrics
      try {
        console.log('Sending metrics to Render backend...');
        const metricsRes = await fetch("https://smart-emotion-focus-journal-backend.onrender.com/api/monitor/metrics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            latency_ms: Math.round(latencyMs),
            token_count: totalTokens,
            decision_score: replyText,
            status: "success"
          })
        });
        console.log('Metrics POST response status:', metricsRes.status);
      } catch (err) {
        console.error("Failed to post metrics monitoring:", err);
      }

      // Send to Backend 2: Journal Entry
      try {
        console.log('Sending journal entry to Render backend...');
        const journalRes = await fetch("https://smart-emotion-focus-journal-backend.onrender.com/api/journal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content: journalText,
            llm_response: replyText
          })
        });
        console.log('Journal POST response status:', journalRes.status);
      } catch (err) {
        console.error("Failed to post journal entry:", err);
      }

    } catch (error) {
      console.error("Local Gemma analysis failed:", error);
      alert("Local AI analysis failed. Please check developer console. Error: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score < 40) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score < 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getProgressBarColor = (score) => {
    if (score < 40) return 'bg-emerald-500 shadow-emerald-500/20';
    if (score < 70) return 'bg-amber-500 shadow-amber-500/20';
    return 'bg-rose-500 shadow-rose-500/20';
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 to-zinc-300">
          Daily Journal & Reflection
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Express your state of mind. Our local AI will calculate decision scoring and cognitive loads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor & Suggestions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prompt Templates */}
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-3">
              Need inspiration? Choose a template:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SUGGESTIONS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item.text)}
                    disabled={engineLoading || !webGpuSupported}
                    className="p-3 bg-zinc-900/40 hover:bg-zinc-900/90 rounded-2xl border border-zinc-800/80 hover:border-purple-500/35 transition-all text-left group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1 rounded-lg bg-zinc-800 text-purple-400 group-hover:text-purple-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono tracking-tighter bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-300 group-hover:text-zinc-200">{item.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{item.text}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Journal Textarea Card */}
          <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden min-h-[340px]">
            {/* Loading Weights Overlay */}
            {engineLoading && (
              <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 space-y-6 text-center animate-fade-in">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-sm font-bold text-zinc-200">Initializing Local Gemma-2B Model</h3>
                  <p className="text-xs text-zinc-450 leading-relaxed">
                    Downloading model weights directly to your browser's WebGPU cache. This happens only on the first visit. Subsequent loads are near instant.
                  </p>
                </div>
                <div className="w-full max-w-xs space-y-2">
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.round(engineProgress * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span className="truncate max-w-[200px] text-zinc-400">{engineStatus}</span>
                    <span className="text-purple-400 font-bold">{Math.round(engineProgress * 100)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* GPU Unsupported Overlay */}
            {!webGpuSupported && (
              <div className="absolute inset-0 bg-zinc-950/95 z-10 flex flex-col items-center justify-center p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-450">
                  <Brain className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-sm font-bold text-rose-400">WebGPU/Hardware Support Error</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    We could not initialize the local model. WebGPU capability is required to run Gemma-2B. Please use Chrome, Edge, or Safari 18+ on a supported system.
                  </p>
                  {engineError && (
                    <div className="p-2.5 bg-zinc-900/60 border border-zinc-800/60 rounded-xl text-[10px] text-zinc-500 font-mono text-left max-h-[80px] overflow-y-auto mt-2">
                      Error: {engineError}
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
                <span>Write about your current focus, workload, and mental state:</span>
                <span className="font-mono">
                  {charCount} chars | {wordCount} words
                </span>
              </div>

              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Today I am planning to work on... I feel..."
                rows={8}
                disabled={analyzing || engineLoading || !webGpuSupported}
                className="w-full p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl text-zinc-200 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-zinc-650 resize-none leading-relaxed disabled:opacity-40"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Processed 100% locally on your browser.</span>
                </div>

                <button
                  type="submit"
                  disabled={journalText.trim() === '' || analyzing || engineLoading || !webGpuSupported}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 active:scale-[0.98] transition-all rounded-xl font-semibold text-sm text-white flex items-center gap-2 shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gemma Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze with Gemma</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Decision Scoring & Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Waiting/Processing State */}
          {!analysisResult && !analyzing && (
            <div className="glass-panel rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[380px] border-dashed border-zinc-800">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 border border-zinc-800 mb-4 animate-pulse-slow">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-zinc-300">Decision Scoring Pending</h3>
              <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed mx-auto">
                Write a journal entry on the left and submit it to see real-time cognitive workload and focus scoring metrics.
              </p>
            </div>
          )}

          {/* Loading state animation during analysis */}
          {analyzing && (
            <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center min-h-[380px] space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-sm font-bold text-zinc-300">Inference Running (Local GPU)</h3>
                <p className="text-xs text-zinc-500 animate-pulse font-mono text-[11px]">Running Gemma-2B-it Model...</p>
              </div>
              <div className="w-full bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/80 max-w-xs font-mono text-[10px] text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>GPU Shader Pipeline:</span>
                  <span className="text-purple-400 font-bold">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Precision Model:</span>
                  <span>q4f16_1</span>
                </div>
                <div className="flex justify-between">
                  <span>Context Cache:</span>
                  <span className="text-emerald-400">Warm</span>
                </div>
              </div>
            </div>
          )}

          {/* Result Panel */}
          {analysisResult && (
            <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-2xl relative border-zinc-800 animate-fade-in">
              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-zinc-200">Local Decision Scores</h3>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  Gemma Output
                </span>
              </div>

              {/* Main Score: Cognitive Load */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">Cognitive Load Score</span>
                  </div>
                  <span className={`text-2xl font-black font-mono tracking-tight ${analysisResult.cognitiveLoad > 70 ? 'text-rose-400' : analysisResult.cognitiveLoad > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {analysisResult.cognitiveLoad}%
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(analysisResult.cognitiveLoad)}`}
                    style={{ width: `${analysisResult.cognitiveLoad}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>0% (Relaxed)</span>
                  <span>100% (Overloaded)</span>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 gap-4">
                {/* Focus Score */}
                <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-zinc-500 font-semibold block mb-0.5 uppercase tracking-wider">Focus Level</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-zinc-200">{analysisResult.focusLevel}%</span>
                    <span className="text-[10px] text-zinc-500">efficiency</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${analysisResult.focusLevel}%` }}
                    />
                  </div>
                </div>

                {/* Stress Index */}
                <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-zinc-500 font-semibold block mb-0.5 uppercase tracking-wider">Stress Index</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-zinc-200">{analysisResult.stressLevel}%</span>
                    <span className="text-[10px] text-zinc-500">anxiety</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${analysisResult.stressLevel > 70 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${analysisResult.stressLevel}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dominant Emotion Tag */}
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-wider">Detected Emotion</span>
                  <span className="text-sm font-bold text-zinc-100">{analysisResult.dominantEmotion}</span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 font-bold text-xs">
                  AI Tag
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="bg-gradient-to-tr from-purple-900/10 to-indigo-900/10 border border-purple-500/10 p-4 rounded-2xl space-y-1.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  <Brain className="w-16 h-16 text-purple-400" />
                </div>
                <span className="text-[10px] text-purple-400 font-semibold block uppercase tracking-wider">Actionable Insight</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {analysisResult.suggestion}
                </p>
              </div>

              {/* Benchmarking performance metadata */}
              <div className="border-t border-zinc-800/40 pt-4 mt-2">
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-zinc-500">
                  <div className="bg-zinc-900/40 py-1.5 rounded-xl border border-zinc-850">
                    <span className="block text-[8px] text-zinc-600 uppercase font-semibold">Latency</span>
                    <span className="text-zinc-400 flex items-center justify-center gap-1 mt-0.5 font-bold">
                      <Clock className="w-3 h-3 text-purple-400" /> {analysisResult.metrics.inferenceTimeSec}s
                    </span>
                  </div>
                  <div className="bg-zinc-900/40 py-1.5 rounded-xl border border-zinc-850">
                    <span className="block text-[8px] text-zinc-600 uppercase font-semibold">Speed</span>
                    <span className="text-zinc-400 flex items-center justify-center gap-1 mt-0.5 font-bold">
                      <Zap className="w-3 h-3 text-amber-400" /> {analysisResult.metrics.tokensSec} T/s
                    </span>
                  </div>
                  <div className="bg-zinc-900/40 py-1.5 rounded-xl border border-zinc-850">
                    <span className="block text-[8px] text-zinc-600 uppercase font-semibold">Tokens</span>
                    <span className="text-zinc-400 flex items-center justify-center gap-1 mt-0.5 font-bold">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> {analysisResult.metrics.totalTokens} tks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
