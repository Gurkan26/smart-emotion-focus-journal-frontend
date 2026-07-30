'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-grid-pattern transition-colors">
      {/* Top Right Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-[90px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-md z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-xl shadow-sky-500/20 mb-4 border border-sky-400/30 animate-float text-white">
            <Brain className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide text-center">
            AI Prompt Optimizer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 font-medium tracking-wide">
            AI Engineering & Prompt Optimization Platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl relative border border-sky-500/20 bg-white dark:bg-slate-900">
          {/* Card Border Highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-teal-500/5 pointer-events-none rounded-3xl" />
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/40">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all border-b-2 ${
                isLogin 
                  ? 'text-sky-600 dark:text-sky-400 border-sky-500 bg-sky-500/10' 
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Giriş Yap (Sign In)
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all border-b-2 ${
                !isLogin 
                  ? 'text-sky-600 dark:text-sky-400 border-sky-500 bg-sky-500/10' 
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kayıt Ol (Register)
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mx-8 mt-6 p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="mx-8 mt-6 p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ad Soyad (Full Name)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Adınızı girin"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">E-Posta Adresi (Email)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="eposta@ornek.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Şifre (Password)</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="agree"
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleInputChange}
                className="w-4 h-4 accent-sky-500 rounded border-slate-300 bg-slate-100 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="agree" className="text-xs text-slate-600 dark:text-slate-400 select-none leading-none cursor-pointer">
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
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 active:scale-[0.98] transition-all rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
          </form>
        </div>

        {/* Footer Hint */}
        <div className="mt-6 p-4 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl border border-slate-300 dark:border-slate-800 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-xs flex items-center justify-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Kullanıcı kayıtları aktif veritabanına ve belleğe kaydedilir.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
