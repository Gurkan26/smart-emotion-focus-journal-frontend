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
import { getBackendUrl, clearAllUserStorage } from '@/lib/api';

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

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
    // Auth Guard: Redirect unauthenticated visitors to /auth immediately
    const token = localStorage.getItem('journal_auth_token');
    const storedUser = localStorage.getItem('journal_auth_user');

    if (!token || !storedUser) {
      router.replace('/auth');
      return;
    }

    let adminFlag = false;
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.email) setUserEmail(parsed.email);
      adminFlag = parsed.is_admin === true || parsed.role === 'admin' || parsed.email === 'gurkansenturk@admin.com';
      setIsAdmin(adminFlag);

      // Route Guard for Normal Users: Only restrict /app/admin
      if (!adminFlag && pathname === '/app/admin') {
        router.replace('/app/journal');
        return;
      }
    } catch (e) {
      console.error("Failed to parse stored user:", e);
    }

    setCheckingAuth(false);
    fetchVersionAndConfig();
  }, [router, pathname]);

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
      let deleteSuccess = true;
      // DELETE /delete (backend handles account deletion)
      if (token) {
        const res = await fetch(`${backendUrl}/delete`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          deleteSuccess = false;
          setActionStatus(null);
          alert(`Failed to delete account: ${errData.message || 'Server error'}`);
          return;
        }
      }
      
      if (deleteSuccess) {
        // Clear all user-specific storage
        clearAllUserStorage();
        localStorage.removeItem('journal_auth_token');
        localStorage.removeItem('journal_auth_user');
        localStorage.removeItem('journal_telemetry_logs');
        
        setActionStatus(null);
        setShowSettings(false);
        router.push('/auth');
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
      alert("Error deleting account. Please try again.");
      setActionStatus(null);
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

    // Clear all user-specific cached data
    clearAllUserStorage();
    localStorage.removeItem('journal_auth_token');
    localStorage.removeItem('journal_auth_user');
    router.push('/auth');
  };

  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('journal_theme') || 'light';
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      localStorage.setItem('journal_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const allNavItems = [
    {
      name: 'Prompt Optimizer',
      href: '/app/journal',
      icon: Sparkles,
      description: 'Prompt atma ve yanıt ekranı',
      adminOnly: false
    },
    {
      name: 'Metrics',
      href: '/app/dashboard',
      icon: Activity,
      description: 'Metrik ve sistem performansı',
      adminOnly: false
    },
    {
      name: 'Admin Control Panel',
      href: '/app/admin',
      icon: Cpu,
      description: 'Kullanıcı yönetimi, PEFT & MCP',
      adminOnly: true
    }
  ];

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin"></div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 animate-pulse">Oturum Doğrulanıyor...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
      {/* Top Header & Tabbed Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-sky-500/20 px-6 py-3 flex items-center justify-between shadow-sm">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-md text-white font-bold">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-base text-slate-900 dark:text-white">
              AI Prompt Optimizer
            </span>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 ml-2 font-medium">AI Hub</span>
          </div>
        </div>

        {/* Center Tabbed Navigation Bar */}
        <nav className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800/70 p-1.5 rounded-2xl border border-sky-500/20">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right User Controls & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* User Info Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-sky-500/20 text-xs">
            <User className="w-3.5 h-3.5 text-sky-500" />
            <span className="font-medium text-slate-700 dark:text-slate-200 text-[11px]">{userEmail}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              isAdmin
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30'
            }`}>
              {isAdmin ? 'ADMIN' : 'USER'}
            </span>
          </div>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 border border-sky-500/20 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all text-xs flex items-center gap-1 font-semibold"
            title={theme === 'light' ? 'Koyu Temaya Geç (Dark Mode)' : 'Açık Temaya Geç (Light Mode)'}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 border border-sky-500/20 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all"
            title="Ayarlar & Geri Bildirim"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 transition-all"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>

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
