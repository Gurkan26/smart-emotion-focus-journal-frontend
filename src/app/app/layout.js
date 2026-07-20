'use client';
import { useState } from 'react';
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
  Sparkles
} from 'lucide-react';

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    console.log('Logging out user...');
    router.push('/auth');
  };

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

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/20">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-850">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <User className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">Academy User</p>
                <p className="text-[10px] text-zinc-500">demo@masterfabric.co</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
            {/* Live Model Badge for Mobile */}
            <div className="bg-zinc-900/80 rounded-lg py-1 px-2 border border-zinc-800 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-mono text-zinc-400">Gemma Ready</span>
            </div>
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
          <div className="md:hidden fixed inset-0 top-[65px] z-50 glass-panel border-t border-zinc-800 flex flex-col justify-between">
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
                    <p className="text-[10px] text-zinc-500">demo@masterfabric.co</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
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
    </div>
  );
}
