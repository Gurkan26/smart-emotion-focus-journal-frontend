'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Brain, 
  BookOpen, 
  Activity, 
  LogOut, 
  Cpu,
  User, 
  Menu, 
  X,
  Sparkles,
  Settings,
  MessageSquare,
  Trash2,
  Star,
  Sliders
} from 'lucide-react';
import { getBackendUrl } from '@/lib/api';

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Settings Panel States
  const [showSettings, setShowSettings] = useState(false);
  const [userEmail, setUserEmail] = useState('demo@masterfabric.co');
  const [apiVersion, setApiVersion] = useState('loading...');
  const [configSettings, setConfigSettings] = useState({ theme: 'dark', notifications: true });
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [feedbackStatus, setFeedbackStatus] = useState(null); // null, success, error
  const [actionStatus, setActionStatus] = useState(null);

  const fetchVersionAndConfig = async () => {
    const backendUrl = getBackendUrl();
    const token = localStorage.getItem('journal_auth_token');
    
    // 1. Fetch version info (GET /version)
    try {
      const res = await fetch(`${backendUrl}/version`);
      if (res.ok) {
        const data = await res.json();
        setApiVersion(`v${data.version || '1.0.0'}`);
      }
    } catch (err) {
      console.warn("Could not fetch API version:", err);
      setApiVersion('v1.2.5 (local)');
    }

    // 2. Fetch User Config info (GET /config)
    if (token) {
      try {
        const res = await fetch(`${backendUrl}/config`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConfigSettings({
            theme: data.theme || 'dark',
            notifications: data.notifications !== false
          });
        }
      } catch (err) {
        console.warn("Could not fetch user config preferences:", err);
      }
    }
  };

  useEffect(() => {
    // Read User Profile info from Storage
    const storedUser = localStorage.getItem('journal_auth_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.email) setUserEmail(parsed.email);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }

    // Load Version info and Config preferences from backend
    fetchVersionAndConfig();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (configSettings.theme === 'light') {
        root.classList.add('light');
      } else {
        root.classList.remove('light');
      }
    }
  }, [configSettings.theme]);

  const handleUpdateConfig = async (updated) => {
    setConfigSettings(updated);
    const backendUrl = getBackendUrl();
    const token = localStorage.getItem('journal_auth_token');
    
    if (token) {
      try {
        // PUT /config
        await fetch(`${backendUrl}/config`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updated)
        });
        console.log("Config updated successfully on backend.");
      } catch (err) {
        console.error("Failed to update config on backend:", err);
      }
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackStatus('loading');
    const backendUrl = getBackendUrl();
    
    try {
      // POST /feedback
      const res = await fetch(`${backendUrl}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback)
      });
      if (res.ok) {
        setFeedbackStatus('success');
        setFeedback({ rating: 5, comment: '' });
        setTimeout(() => setFeedbackStatus(null), 3000);
      } else {
        throw new Error("Bad response");
      }
    } catch (err) {
      setFeedbackStatus('error');
      setTimeout(() => setFeedbackStatus(null), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("WARNING: Are you absolutely sure you want to delete your account? This action is permanent!")) return;
    
    const backendUrl = getBackendUrl();
    const token = localStorage.getItem('journal_auth_token');
    setActionStatus('deleting');

    try {
      // DELETE /delete (backend handles account deletion)
      if (token) {
        await fetch(`${backendUrl}/delete`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
      
      localStorage.removeItem('journal_auth_token');
      localStorage.removeItem('journal_auth_user');
      localStorage.removeItem('journal_telemetry_logs');
      
      setActionStatus(null);
      setShowSettings(false);
      router.push('/auth');
    } catch (err) {
      console.error("Failed to delete account:", err);
      alert("Error deleting account. Wiping local session.");
      localStorage.clear();
      router.push('/auth');
    }
  };

  const handleLogout = async () => {
    console.log('Logging out user...');
    const backendUrl = getBackendUrl();
    const token = localStorage.getItem('journal_auth_token');
    
    try {
      // POST /logout
      if (token) {
        await fetch(`${backendUrl}/logout`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.warn("Logout request failed:", err);
    }

    localStorage.removeItem('journal_auth_token');
    localStorage.removeItem('journal_auth_user');
    router.push('/auth');
  };

  const navItems = [
    {
      name: 'Journal Entry',
      href: '/app/journal',
      icon: BookOpen,
      description: 'Write & analyze emotion/focus'
    },
    {
      name: 'Monitoring Dashboard',
      href: '/app/dashboard',
      icon: Activity,
      description: 'Raw LLM performance logs'
    }
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-950/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-80 glass-panel border-r border-zinc-800/80 shrink-0">
        {/* Header/Branding */}
        <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Brain className="w-6 h-6 text-white animate-float" />
            </div>
            <div>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 to-zinc-300 tracking-wide text-base">
                Smart Journal
              </span>
              <p className="text-[10px] text-zinc-400 font-medium">Emotion & Focus AI</p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
        </div>

        {/* Local LLM Status Badge */}
        <div className="px-6 py-4 border-b border-zinc-800/30">
          <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800 flex items-center gap-3">
            <div className="relative flex h-3.5 w-3.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-200">Gemma-2B (Local)</p>
              <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                <Cpu className="w-3 h-3 text-purple-400" /> Web MLC-LLM Ready
              </p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-start gap-4 p-3.5 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-purple-600/10 border border-purple-500/20 text-purple-300 shadow-inner'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-purple-500/20 text-purple-300' : 'bg-zinc-900/60 text-zinc-500 group-hover:text-zinc-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-[11px] text-zinc-500 font-medium group-hover:text-zinc-400 mt-0.5">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer API version & stats */}
        <div className="px-6 py-2 text-center border-t border-zinc-800/10">
          <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest">
            Backend API Version: {apiVersion}
          </span>
        </div>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/20">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-850">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0">
                <User className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">Academy Account</p>
                <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                title="Settings & Feedback"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-450 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header / Navigation */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Brain className="w-5 h-5 text-white animate-float" />
            </div>
            <div>
              <span className="font-bold tracking-wide text-sm bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 to-zinc-300">
                Smart Journal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Settings button on mobile header */}
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[65px] z-40 glass-panel border-t border-zinc-800 flex flex-col justify-between">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-purple-600/10 border border-purple-500/20 text-purple-300'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-[11px] text-zinc-500 font-medium">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </nav>
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-850 flex items-center justify-center border border-zinc-700">
                    <User className="w-5 h-5 text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">Academy User</p>
                    <p className="text-[10px] text-zinc-500 truncate max-w-[120px]">{userEmail}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-grid-pattern p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Dynamic Popover/Modal Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel glass-panel-glow-purple max-w-md w-full rounded-3xl p-6 relative border border-zinc-800 shadow-2xl space-y-6">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-4">
              <Settings className="w-5 h-5 text-purple-400 animate-spin-slow" />
              <h2 className="text-lg font-bold text-zinc-100">Preferences & Feedback</h2>
            </div>

            {/* Config options */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> <span>User Preferences (Config)</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Theme switch (Mocked UI toggle, saved in GET/PUT /config) */}
                <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-850 flex flex-col justify-between gap-2">
                  <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider block">Interface Mode</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleUpdateConfig({ ...configSettings, theme: 'dark' })}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold ${configSettings.theme === 'dark' ? 'bg-purple-600/20 border border-purple-500/20 text-purple-300' : 'bg-zinc-950 border border-zinc-850 text-zinc-500'}`}
                    >
                      Dark
                    </button>
                    <button 
                      onClick={() => handleUpdateConfig({ ...configSettings, theme: 'light' })}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold ${configSettings.theme === 'light' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-zinc-950 border border-zinc-850 text-zinc-500'}`}
                    >
                      Light
                    </button>
                  </div>
                </div>

                {/* Notifications toggle */}
                <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-850 flex flex-col justify-between gap-2">
                  <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider block">Sync Notifications</span>
                  <button 
                    onClick={() => handleUpdateConfig({ ...configSettings, notifications: !configSettings.notifications })}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${configSettings.notifications ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-950 border-zinc-850 text-zinc-500'}`}
                  >
                    {configSettings.notifications ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback section (POST /feedback) */}
            <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> <span>Send Feedback to Backend</span>
              </h3>

              {feedbackStatus === 'success' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[11px] font-semibold text-center">
                  Feedback logged successfully! Thanks for supporting.
                </div>
              )}
              {feedbackStatus === 'error' && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-[11px] font-semibold text-center">
                  Failed to send feedback.
                </div>
              )}

              <div className="space-y-2">
                {/* Star rating selection */}
                <div className="flex gap-1.5 justify-center py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`w-5 h-5 ${feedback.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
                    </button>
                  ))}
                </div>

                <textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Tell us what you think of this Next.js + WebGPU + Go REST API app..."
                  required
                  rows={2}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs placeholder:text-zinc-650 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all leading-normal"
                />
                
                <button
                  type="submit"
                  disabled={feedbackStatus === 'loading' || feedback.comment.trim() === ''}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {feedbackStatus === 'loading' ? 'Sending Feedback...' : 'Submit Feedback'}
                </button>
              </div>
            </form>

            {/* Dangerous actions zone */}
            <div className="border-t border-zinc-800/80 pt-4 space-y-3">
              <span className="text-[10px] font-mono text-zinc-550 block">Connected Account: {userEmail}</span>
              <button
                onClick={handleDeleteAccount}
                disabled={actionStatus === 'deleting'}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-450 hover:text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{actionStatus === 'deleting' ? 'Deleting Account...' : 'Permanently Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
