import React from "react";
import { useApp } from "../context/AppContext";
//, { useState } from "react";
import VolunteerRegistrationWizard from "./VolunteerRegistrationWizard";
import { ArrowLeft, Loader2, Phone, UserPlus, KeyRound, Smartphone, Mail, ShieldCheck, Heart, Users, ChevronRight, Lock, AlertTriangle, Fingerprint } from "lucide-react";
import axios from "axios";
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface LoginScreenProps {
  lang: "hi" | "en";
  onLoginSuccess: (role: "volunteer" | "guest", details?: { phone?: string; name?: string; id?: string; email?: string; role?: string }) => Promise<void>;
}

export default function LoginScreen({ lang, onLoginSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<"welcome" | "login" | "forgotPassword" | "registerForm">("welcome");
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { identifier, password });
      if (response.data.success && response.data.user) {
        if (response.data.token) localStorage.setItem("@rpf_token", response.data.token);
        const user = response.data.user;
        await finalizeLogin(user);
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || "Invalid Identifier or Password.");
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeLogin = async (userData: any) => {
    await onLoginSuccess("volunteer", { 
       id: userData.id, 
       name: userData.name || "Volunteer", 
       phone: userData.phone, 
       email: userData.email,
       role: userData.role
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await axios.post('/api/auth/forgot-password', { identifier });
      setSuccessMsg("If this account exists and has an email, a reset link was sent (valid for 15 mins).");
    } catch (err: any) {
      setError("Failed to request password reset.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminReset = async () => {
    if (!identifier) {
       setError("Please enter your identifier to request an Admin Reset.");
       return;
    }
    setIsLoading(true);
    try {
      await axios.post('/api/auth/reset-ticket', { identifier });
      setSuccessMsg("Admin Reset Ticket created successfully.");
    } catch (err: any) {
      setError("Failed to create ticket.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleRegisterBiometric = async () => {
    try {
      setIsLoading(true);
      const optRes = await axios.get(`/api/auth/webauthn/register-options?userId=${currentUserId}`);
      const attResp = await startRegistration(optRes.data);
      await axios.post('/api/auth/webauthn/register-verify', { userId: currentUserId, response: attResp });
      setSuccessMsg("Biometrics registered successfully!");
      setShowBiometricPrompt(false);
      // Wait a moment before redirecting
      setTimeout(async () => {
        const userResult = await axios.get(`/api/users/${currentUserId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('@rpf_token')}` }});
        await finalizeLogin(userResult.data);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to register biometrics.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2] animate-fadeIn relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/assets/login_bg.png")' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF9933]/20 via-[#FFFDFB]/90 to-[#138808]/15 backdrop-blur-[1px]"></div>
      </div>

      {/* Dynamic Header Block */}
      <div className="w-full pt-16 pb-4 px-6 flex flex-col items-center text-center z-10 shrink-0">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-tricolour"></div>
        <img 
          src={globalSettings?.logo_image || "/assets/logo.png"} 
          alt="RP Foundation Logo" 
          className="w-24 h-24 bg-white rounded-full p-1.5 shadow-xl border-2 border-[#FF9933]/20 mb-3 animate-float"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-black text-[#0B1E3F] tracking-widest leading-none drop-shadow-xs">
            RP FOUNDATION
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#FF9933] drop-shadow-xs">
            Rohit Pandit Foundation
          </p>
          <p className="text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 bg-white/85 backdrop-blur-md px-3.5 py-0.5 rounded-full border border-slate-200/50 w-fit mx-auto mt-2">
            <span className="text-[#FF9933]">सेवा</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">समर्पण</span>
            <span className="text-slate-400">•</span>
            <span className="text-[#138808]">संकल्प</span>
          </p>
        </div>
      </div>

      {/* Main Interactive Container */}
      <div className="w-full px-5 pb-6 pt-2 z-10 relative">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/90 relative overflow-hidden flex flex-col gap-4">
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-tricolour"></div>

          {mode === "welcome" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <h2 className="text-base font-display font-black text-[#0B1E3F]">
                  Welcome to <span className="text-gold-metallic">Jan Seva</span>
                </h2>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed px-2">
                  Join hands with us to serve the nation and empower rural communities.
                </p>
              </div>

              <div className="space-y-2.5">
                <button 
                  onClick={() => setMode("login")}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50/50 shadow-sm active:scale-[0.98] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-4 h-4 text-[#FF9933]" />
                    <span>Login to your account</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => setMode("registerForm")}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50/50 shadow-sm active:scale-[0.98] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-4 h-4 text-[#138808]" />
                    <span>Register as Volunteer</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <button onClick={() => setMode("welcome")} className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition -ml-1">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-800">Secure Login</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Use your Identifier and Password</p>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[10px] font-bold flex items-start gap-1.5 animate-fadeIn">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5 pt-1">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                      Identifier (Mobile / Email / User ID)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserPlus className="h-3.5 w-3.5 text-[#000080]" />
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#000080] outline-none text-xs font-bold text-slate-800 bg-slate-50 transition placeholder-slate-350"
                        placeholder="Mobile, Email, or User ID"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyRound className="h-3.5 w-3.5 text-[#000080]" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#000080] outline-none text-xs font-bold text-slate-800 bg-slate-50 transition placeholder-slate-350"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button type="button" onClick={() => setMode("forgotPassword")} className="text-[10px] font-bold text-[#000080] hover:underline transition">
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={!identifier || !password || isLoading} className="w-full flex justify-center items-center gap-1.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-[#000080] hover:bg-[#000066] disabled:opacity-50 transition uppercase tracking-wider">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Log In</>}
                </button>
              </form>
            </div>
          )}

          {mode === "forgotPassword" && (
            <div className="space-y-4 animate-fadeIn">
               <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <button onClick={() => setMode("login")} className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition -ml-1">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-800">Recover Account</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Reset your password</p>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[10px] font-bold flex items-start gap-1.5 animate-fadeIn">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-[10px] font-bold flex items-start gap-1.5 animate-fadeIn">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-3.5 pt-1">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                      Account Identifier
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#000080] outline-none text-xs font-bold text-slate-800 bg-slate-50 transition"
                      placeholder="Mobile, Email, or User ID"
                      required
                    />
                 </div>
                 <button type="submit" disabled={!identifier || isLoading} className="w-full flex justify-center items-center py-3 rounded-xl shadow-md text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 transition uppercase tracking-wider">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                 </button>
              </form>

              <div className="text-center pt-2">
                 <p className="text-[10px] font-bold text-slate-500 mb-1.5">No access to Email?</p>
                 <button type="button" onClick={handleAdminReset} disabled={isLoading} className="text-[10px] font-black text-[#FF9933] hover:underline uppercase tracking-wider">
                   Request Admin Reset Ticket
                 </button>
              </div>
            </div>
          )}

          {showBiometricPrompt && (
            <div className="space-y-4 animate-fadeIn text-center py-2">
              <div className="w-14 h-14 bg-[#138808]/10 rounded-full flex items-center justify-center mx-auto text-[#138808] border border-[#138808]/20">
                <Fingerprint className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-slate-800">Enable Biometric Login?</h3>
                <p className="text-[10px] font-bold text-slate-500 mt-1.5 px-4 leading-relaxed">
                  Use Face ID or Touch ID for faster, secure logins next time.
                </p>
              </div>
              <div className="space-y-2 pt-1">
                <button onClick={handleRegisterBiometric} disabled={isLoading} className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#138808] hover:bg-[#0e6606] shadow-md transition uppercase tracking-wider">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Enable Now"}
                </button>
                <button onClick={async () => await finalizeLogin({ id: currentUserId, role: 'volunteer' })} className="w-full py-2.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition uppercase tracking-wider">
                  Skip for now
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {mode === "registerForm" && (
        <div className="absolute inset-0 z-50 bg-slate-50 sm:rounded-3xl shadow-2xl">
          <VolunteerRegistrationWizard 
            onBack={() => setMode("welcome")} 
            onComplete={async (username, pass) => {
              const uid = username;
              await onLoginSuccess("volunteer", { id: uid, name: "Volunteer (" + username + ")" });
            }} 
          />
        </div>
      )}

    </div>
  );
}
