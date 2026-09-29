import React,{useState,useEffect} from 'react';
import {ArrowLeft,AlertTriangle,KeyRound,Loader2,UserPlus} from 'lucide-react';
import axios from 'axios';
import VolunteerRegistrationWizard from './VolunteerRegistrationWizard';
import { requestPermission } from '../lib/permissions';
import { Capacitor } from '@capacitor/core';

const API_BASE = Capacitor.isNativePlatform() ? 'https://appapi.therpfoundation.org' : '';
const apiUrl = (path: string) => `${API_BASE}${path}`;

interface LoginScreenProps {
  lang: 'hi' | 'en';
  onLoginSuccess: (
    role: 'volunteer' | 'guest' | 'admin' | 'user' | string,
    details?: {
      phone?: string;
      name?: string;
      id?: string;
      email?: string;
      role?: string;
      token?: string;
      remember?: boolean;
    }
  ) => Promise<void>;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      void (async () => {
        try {
          await requestPermission('geolocation');
          await requestPermission('notifications');
          await requestPermission('camera');
        } catch (e) {
          console.error('Native permissions request error:', e);
        }
      })();
    }
  }, []);

  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingLogin, setPendingLogin] = useState<{ role: string; details: { id: string; name: string; phone?: string; email?: string; role: string; token?: string; remember: boolean } } | null>(null);
  const [savedUserId, setSavedUserId] = useState(() => { try { return localStorage.getItem('@rpf_saved_login_id') || ''; } catch { return ''; } });
  useEffect(() => { if (savedUserId) setIdentifier(savedUserId); }, []);

  const finishLogin = async (saveId: boolean) => {
    if (!pendingLogin) return;
    setLoading(true);
    try {
      if (saveId) { localStorage.setItem('@rpf_saved_login_id', identifier.trim()); setSavedUserId(identifier.trim()); }
      else { localStorage.removeItem('@rpf_saved_login_id'); setSavedUserId(''); }
      await onLoginSuccess(pendingLogin.role, pendingLogin.details);
      setPendingLogin(null);
      setPassword('');
    } catch (err: any) { setError(err?.message || 'Could not complete login. Please retry.'); }
    finally { setLoading(false); }
  };

  const clear = () => setError('');

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    clear();
    if (!identifier.trim()) return setError('User ID is empty. Please enter your User ID.');
    if (!password) return setError('Password is empty. Please enter your password.');
    setLoading(true);
    try {
      const normalized = identifier.trim();
      const endpoint = normalized.toLowerCase() === 'admin' ? '/api/auth/admin-login' : '/api/auth/login';
      const targetUrl = apiUrl(endpoint);

      let responseData: any = null;
      try {
        const r = await axios.post(targetUrl, { identifier: normalized, password }, {
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          timeout: 20000,
        });
        responseData = r.data;
      } catch (axiosErr: any) {
        // Resilient fallback with native fetch if axios XHR encounters transport or CORS issues
        try {
          const fetchRes = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ identifier: normalized, password }),
          });
          responseData = await fetchRes.json();
        } catch {
          throw axiosErr;
        }
      }

      if (!responseData?.success || !responseData?.user) {
        throw new Error(responseData?.error || 'Invalid User ID or password.');
      }
      const u = responseData.user;
      const roleCategory = u.role === 'guest' ? 'guest' : (u.role === 'admin' || u.role === 'super_admin' ? 'admin' : 'volunteer');
      const details = {
        id: String(u.id),
        name: u.name || 'User',
        phone: u.phone,
        email: u.email,
        role: u.role,
        token: responseData.token,
        remember,
      };
      // Keep passwords out of app storage. Let the Android password manager
      // offer credential saving; this prompt only remembers the User ID.
      if (remember && normalized !== savedUserId) {
        setPendingLogin({ role: roleCategory, details });
      } else {
        await onLoginSuccess(roleCategory, details);
        setPassword('');
      }
    } catch (err: any) {
      const rawMsg = err.response?.data?.error || err.message || '';
      if (rawMsg.toLowerCase().includes('network error') || rawMsg.toLowerCase().includes('failed to fetch')) {
        setError('सर्वर से संपर्क नहीं हो पा रहा है (Network Error). कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।');
      } else {
        setError(rawMsg || 'Unable to login. Please check your User ID and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'register') {
    return (
      <VolunteerRegistrationWizard
        onBack={() => setMode('welcome')}
        onComplete={(u, p) => {
          setIdentifier(u);
          setPassword(p);
          setMode('login');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white relative overflow-hidden px-5 py-8">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/assets/login_bg.png")' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF9933]/10 via-white/95 to-[#138808]/10" />
      </div>
      
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-black tracking-wide text-[#0B1E3F]">RP Foundation</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#FF9933] mt-1">Rohit Pandit Foundation</p>
          <img
            src="/assets/rpf-samahit-icon.png"
            alt="RPF Samahit Logo"
            className="w-28 h-28 object-contain drop-shadow-xl mt-4"
          />
          <p className="mt-3 max-w-xs text-[11px] font-semibold leading-relaxed text-slate-600">
            One platform that brings people, services, communities and opportunities together.
          </p>
        </div>

        <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/90">
          {mode === 'welcome' && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-base font-black text-[#0B1E3F]">Welcome to RPF समाहित</h2>
                <p className="text-[10px] text-slate-500 mt-1">Connect. Serve. Empower. Grow together.</p>
              </div>
              <button
                onClick={() => {
                  clear();
                  setMode('login');
                }}
                className="w-full py-3.5 rounded-xl bg-[#167C5A] text-white text-xs font-black uppercase flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Login with User ID
              </button>
              <button
                onClick={() => {
                  clear();
                  setMode('register');
                }}
                className="w-full py-3.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-black uppercase flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-green-700" />
                Register as Volunteer
              </button>
            </div>
          )}

          {pendingLogin && (
            <div role="dialog" aria-modal="true" aria-labelledby="save-id-title" className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <h3 id="save-id-title" className="text-sm font-black text-emerald-950">Save User ID on this device?</h3>
              <p className="mt-2 text-xs leading-relaxed text-emerald-900">
                Next time, your User ID will be filled automatically. Your password will not be saved by this app; use Android Password Manager for secure password autofill.
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" disabled={loading} onClick={() => void finishLogin(true)}
                  className="flex-1 rounded-xl bg-[#167C5A] px-3 py-2 text-xs font-black text-white">Save User ID</button>
                <button type="button" disabled={loading} onClick={() => void finishLogin(false)}
                  className="flex-1 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-black text-emerald-950">Not now</button>
              </div>
            </div>
          )}
          {mode === 'login' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setMode('welcome')} className="p-1">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-black text-sm text-slate-800">Login to RPF समाहित</h3>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">
                    Keep this device signed in and save credentials securely
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[10px] font-bold flex gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={login} autoComplete="on" noValidate className="space-y-3">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  User ID
                  <input
                    name="username"
                    autoComplete="username"
                    id="rpf-login-username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value.replace(/\s/g, ''))}
                    className="mt-1 w-full p-3 border rounded-xl text-xs font-bold"
                    required
                  />
                </label>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Password
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    id="rpf-login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full p-3 border rounded-xl text-xs font-bold"
                    required
                  />
                </label>
                <label className="flex items-center gap-2 px-1 text-[11px] font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Keep me logged in on this device
                </label>
                <p className="px-1 text-[9px] leading-relaxed text-slate-400">
                  Keep me logged in saves your session. Android Password Manager controls secure password saving; the app can separately remember your User ID.
                </p>
                <button
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#167C5A] text-white text-xs font-black uppercase flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
