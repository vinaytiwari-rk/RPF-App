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
      const r = await axios.post(apiUrl(endpoint), { identifier: normalized, password }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });
      if (!r.data?.success || !r.data?.user) throw new Error(r.data?.error || 'Invalid User ID or password.');
      const u = r.data.user;
      const roleCategory = u.role === 'guest' ? 'guest' : (u.role === 'admin' || u.role === 'super_admin' ? 'admin' : 'volunteer');
      await onLoginSuccess(roleCategory as any, {
        id: u.id,
        name: u.name || 'User',
        phone: u.phone,
        email: u.email,
        role: u.role,
        token: r.data.token,
        remember,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Unable to login. Please check your User ID and password.');
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
                className="w-full py-3.5 rounded-xl bg-[#000080] text-white text-xs font-black uppercase flex items-center justify-center gap-2"
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
                  Your device or password manager may offer to save the User ID and password securely after login.
                </p>
                <button
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#000080] text-white text-xs font-black uppercase flex items-center justify-center gap-2"
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
