'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, CheckCircle, Shield, Key } from 'lucide-react';
import { getBackendUrl, clearAllUserStorage, getUserId } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: 'demo@masterfabric.co',
    password: 'password123',
    agree: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('journal_theme') || 'light';
      setTheme(saved);
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('journal_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleQuickAdminLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const backendUrl = getBackendUrl();
    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "gurkansenturk@admin.com",
          password: "admin123"
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Admin login failed");
      }
      localStorage.setItem('journal_auth_token', data.token);
      localStorage.setItem('journal_auth_user', JSON.stringify(data.user || { email: "gurkansenturk@admin.com", is_admin: true, role: 'admin' }));
      setSuccessMessage("Admin login successful! Redirecting...");
      setTimeout(() => {
        router.push('/app/admin');
      }, 600);
    } catch (err) {
      setError(err.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    const backendUrl = getBackendUrl();
    const endpoint = isLogin ? `${backendUrl}/login` : `${backendUrl}/register`;
    
    console.log(`--- Auth Request to ${endpoint} ---`);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = typeof data.error === 'string' ? data.error : (data.message || data.error?.message || "Authentication failed. Please check your email/password or register.");
        throw new Error(errorMsg);
      }

      if (isLogin) {
        console.log('Login successful!', data);
        const previousUserId = getUserId();
        const newUserId = data.user?.id;
        if (previousUserId && newUserId && previousUserId !== newUserId) {
          clearAllUserStorage(previousUserId);
        }
        if (data.token) {
          localStorage.setItem('journal_auth_token', data.token);
          localStorage.setItem('journal_auth_user', JSON.stringify(data.user || { email: formData.email }));
        }
        setSuccessMessage("Success! Redirecting to workspace...");
        
        const isAdminUser = data.user?.is_admin === true || data.user?.role === 'admin' || data.user?.email === 'gurkansenturk@admin.com';
        setTimeout(() => {
          if (isAdminUser) {
            router.push('/app/admin');
          } else {
            router.push('/app/journal');
          }
        }, 800);
      } else {
        console.log('Registration successful!', data);
        setSuccessMessage("Account created successfully! Auto-logging you in...");
        
        // Auto Login after successful registration
        setTimeout(async () => {
          try {
            const loginRes = await fetch(`${backendUrl}/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const loginData = await loginRes.json();
            if (loginRes.ok && loginData.token) {
              localStorage.setItem('journal_auth_token', loginData.token);
              localStorage.setItem('journal_auth_user', JSON.stringify(loginData.user));
              router.push('/app/journal');
            } else {
              // Redirect to Sign In Tab if auto-login fails
              setIsLogin(true);
              setSuccessMessage("Account registered successfully. Please sign in.");
            }
          } catch (loginErr) {
            setIsLogin(true);
            setSuccessMessage("Account registered successfully. Please sign in.");
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || "Failed to communicate with authentication servers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-grid-pattern transition-colors duration-300">
      {/* Top Right Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Decorative Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[90px] pointer-events-none -z-10 animate-float"></div>

      <div className="w-full max-w-md z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-4 border border-indigo-400/20 animate-float text-white relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-sky-500 rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
            <Brain className="w-9 h-9 z-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 dark:from-violet-400 dark:via-indigo-300 dark:to-sky-400">
            AI Prompt Optimizer
          </h1>
          <p className="text-slate-500 dark:text-slate-450 text-[10px] mt-2 font-bold tracking-widest uppercase">
            Prompt Engineering & Optimization
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative overflow-hidden transition-all duration-300">
          {/* Card Border Highlight Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-sky-500/5 pointer-events-none rounded-3xl" />
          
          {/* Sliding Pill Tabs */}
          <div className="p-2 bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="grid grid-cols-2 gap-1 bg-slate-200/50 dark:bg-slate-950/60 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  isLogin 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-250/20 dark:border-slate-700/50' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  !isLogin 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-250/20 dark:border-slate-700/50' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Kayıt Ol
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mx-6 mt-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 rounded-xl text-xs flex items-center gap-2 font-medium animate-pulse-slow">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="mx-6 mt-6 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 uppercase tracking-wider">Ad Soyad</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Adınızı girin"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-205 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 uppercase tracking-wider">E-Posta Adresi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="eposta@ornek.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-205 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 uppercase tracking-wider">Şifre</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-205 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Checkbox and Custom Switch styling */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="agree"
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleInputChange}
                className="w-4 h-4 accent-indigo-550 rounded border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="agree" className="text-xs text-slate-550 dark:text-slate-400 select-none leading-none cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                {isLogin ? (
                  <span>Beni Hatırla</span>
                ) : (
                  <span>Kullanım Koşullarını Kabul Ediyorum</span>
                )}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 hover:from-violet-500 hover:via-indigo-550 hover:to-sky-450 active:scale-[0.98] transition-all rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sisteme Giriş Yap' : 'Hesap Oluştur'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Admin Demo Helper */}
            {isLogin && (
              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-slate-100/60 dark:bg-slate-950/40 hover:bg-slate-200/80 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-650 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Hızlı Admin Demo Girişi</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Footer Hint */}
        <div className="mt-6 p-4 bg-slate-100/60 dark:bg-slate-900/30 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-850/80 text-center">
          <p className="text-slate-550 dark:text-slate-400 text-xs flex items-center justify-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-450" />
            <span>Kullanıcı kayıtları veritabanına ve belleğe kaydedilir.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
