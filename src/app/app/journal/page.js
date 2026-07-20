'use client';
import { useState } from 'react';
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

  const wordCount = journalText.trim() === '' ? 0 : journalText.trim().split(/\s+/).length;
  const charCount = journalText.length;

  const handleSuggestionClick = (text) => {
    setJournalText(text);
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (journalText.trim() === '') return;

    setAnalyzing(true);
    setAnalysisResult(null);

    // Mock Web MLC-LLM Decision Scoring Engine
    console.log('--- Web MLC-LLM Inference Started ---');
    console.log('Analyzing entry text:', journalText);

    setTimeout(() => {
      // Determine score dynamically based on keywords for a lifelike experience
      const textLower = journalText.toLowerCase();
      let cognitiveLoad = 40;
      let focusLevel = 75;
      let stressLevel = 30;
      let dominantEmotion = "Calm & Ready";
      let suggestion = "Excellent alignment. Maintain your current workspace clean and take a light stretch in 45 minutes.";

      if (textLower.includes('tired') || textLower.includes('wandering') || textLower.includes('distracted') || textLower.includes('break')) {
        cognitiveLoad = 82;
        focusLevel = 35;
        stressLevel = 55;
        dominantEmotion = "Cognitive Fatigue";
        suggestion = "High cognitive load detected. We recommend taking an immediate 10-minute walk or a Pomodoro break. Avoid screen time during the break.";
      } else if (textLower.includes('stress') || textLower.includes('exam') || textLower.includes('presentation') || textLower.includes('anxious')) {
        cognitiveLoad = 75;
        focusLevel = 50;
        stressLevel = 85;
        dominantEmotion = "High Anxiety / Alertness";
        suggestion = "Stress index is elevated. Try taking three deep box-breaths (4s inhale, 4s hold, 4s exhale, 4s hold). Break down your presentation into 3 micro-goals.";
      } else if (textLower.includes('flow') || textLower.includes('immersed') || textLower.includes('coffee') || textLower.includes('early')) {
        cognitiveLoad = 25;
        focusLevel = 92;
        stressLevel = 15;
        dominantEmotion = "Focused Flow State";
        suggestion = "You are in an optimal state of cognitive flow. Keep working in this setting. Ensure you stay hydrated to prolong this focus window.";
      }

      const mockResult = {
        cognitiveLoad,
        focusLevel,
        stressLevel,
        dominantEmotion,
        suggestion,
        metrics: {
          loadTimeMs: 120, // Cache loading
          inferenceTimeSec: 3.4,
          tokensSec: 42.6,
          promptTokens: Math.floor(journalText.length / 4) + 15,
          completionTokens: 145,
        }
      };

      setAnalysisResult(mockResult);
      setAnalyzing(false);

      console.log('Web MLC-LLM Inference Completed successfully!');
      console.log('Decision Scores:', {
        'Bilişsel Yük Skoru': `${cognitiveLoad}%`,
        'Odak Seviyesi': `${focusLevel}%`,
        'Stres Endeksi': `${stressLevel}%`,
        'Emotion': dominantEmotion
      });
      console.log('Performance Metrics:', mockResult.metrics);
    }, 2500); // Latency simulator
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
                    className="p-3 bg-zinc-900/40 hover:bg-zinc-900/90 rounded-2xl border border-zinc-800/80 hover:border-purple-500/35 transition-all text-left group cursor-pointer"
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
          <div className="glass-panel rounded-3xl p-6 shadow-xl relative">
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
                disabled={analyzing}
                className="w-full p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl text-zinc-200 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600 resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Processed 100% locally on your browser.</span>
                </div>

                <button
                  type="submit"
                  disabled={journalText.trim() === '' || analyzing}
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

          {/* Loading state animation */}
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
                <p className="text-xs text-zinc-500 animate-pulse">Running Gemma-2B Decision Model...</p>
              </div>
              <div className="w-full bg-zinc-900 rounded-xl p-3 border border-zinc-800/80 max-w-xs font-mono text-[10px] text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Loading weights:</span>
                  <span className="text-emerald-400">Cached (100%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Shader compilations:</span>
                  <span className="text-purple-400">Ready</span>
                </div>
                <div className="flex justify-between">
                  <span>Allocated GPU Memory:</span>
                  <span>1.48 GB</span>
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

              {/* Main Score: Cognitive Load (Bilişsel Yük Skoru) */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Cognitive Load Score</span>
                    <h4 className="text-xs text-zinc-500 font-medium">Bilişsel Yük Skoru</h4>
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
                    <span className="block text-[8px] text-zinc-600 uppercase font-semibold">Prompt</span>
                    <span className="text-zinc-400 flex items-center justify-center gap-1 mt-0.5 font-bold">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> {analysisResult.metrics.promptTokens} tks
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
