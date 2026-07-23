'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { getBackendUrl } from '@/lib/api';

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
        throw new Error(data.error || "Authentication failed. Please try again.");
      }

      if (isLogin) {
        console.log('Login successful!', data);
        // Store Session token in local storage
        if (data.token) {
          localStorage.setItem('journal_auth_token', data.token);
          localStorage.setItem('journal_auth_user', JSON.stringify(data.user || { email: formData.email }));
        }
        setSuccessMessage("Success! Redirecting to workspace...");
        setTimeout(() => {
          router.push('/app/journal');
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-grid-pattern">
      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-indigo-900/10 rounded-full blur-[90px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-md z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-purple-900/30 mb-4 border border-purple-500/30 animate-float">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 to-zinc-300 tracking-wide text-center">
            Smart Emotion & Focus Journal
          </h1>
          <p className="text-zinc-500 text-xs mt-1.5 font-medium tracking-wide">
            Next-Gen AI Journal & Performance Monitoring
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-panel glass-panel-glow-purple rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Card Border Highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 pointer-events-none rounded-3xl" />
          
          {/* Tabs */}
          <div className="flex border-b border-zinc-800/80 bg-zinc-900/40">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all border-b-2 ${
                isLogin 
                  ? 'text-purple-400 border-purple-500 bg-purple-500/5' 
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all border-b-2 ${
                !isLogin 
                  ? 'text-purple-400 border-purple-500 bg-purple-500/5' 
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              Register
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mx-8 mt-6 p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-450 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="mx-8 mt-6 p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-purple-500/60 transition-colors placeholder:text-zinc-650"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-purple-500/60 transition-colors placeholder:text-zinc-650"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-400">Password</label>
                {isLogin && (
                  <a href="#" className="text-[10px] font-semibold text-purple-400 hover:text-purple-300">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-purple-500/60 transition-colors placeholder:text-zinc-650"
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
                className="w-4 h-4 accent-purple-500 rounded border-zinc-800 bg-zinc-900 text-purple-600 focus:ring-purple-500/50"
              />
              <label htmlFor="agree" className="text-xs text-zinc-400 select-none leading-none cursor-pointer">
                {isLogin ? (
                  <span>Remember this device</span>
                ) : (
                  <span>I agree to the <a href="#" className="text-purple-400 hover:underline">Terms of Service</a></span>
                )}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 active:scale-[0.98] transition-all rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Journal' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials hint */}
        <div className="mt-6 p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 text-center">
          <p className="text-zinc-400 text-xs flex items-center justify-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Interactive APIs active: Registrations are saved in GORM/Memory.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
