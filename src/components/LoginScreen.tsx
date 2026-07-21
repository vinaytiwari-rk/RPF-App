import React, { useState, useEffect } from "react";
import VolunteerRegistrationWizard from "./VolunteerRegistrationWizard";
import { ArrowLeft, Loader2, Phone, UserPlus, KeyRound, Smartphone, Mail, ShieldCheck, Heart, Users, ChevronRight, Lock, AlertTriangle, Fingerprint } from "lucide-react";
import axios from "axios";
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface LoginScreenProps {
  lang: "hi" | "en";
  onLoginSuccess: (role: "volunteer" | "guest", details?: { phone?: string; name?: string; id?: string; email?: string }) => Promise<void>;
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
      const response = await axios.post('/api/auth/login-multi', { identifier, password });
      if (response.data.success && response.data.user) {
        const user = response.data.user;
        setCurrentUserId(user.id);
        
        // Before finalizing login, check if browser supports WebAuthn and they want to set it up
        if (window.PublicKeyCredential && await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
           setShowBiometricPrompt(true);
        } else {
           await finalizeLogin(user);
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || "Invalid Identifier or Password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!identifier) {
      setError("Please enter your identifier first to use Biometric Login.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get options from server
      const optResp = await axios.post('/api/auth/webauthn/login-options', { identifier });
      const { options, userId } = optResp.data;

      // 2. Pass options to browser authenticator
      const authResp = await startAuthentication(options);

      // 3. Verify response with server
      const verifyResp = await axios.post('/api/auth/webauthn/login-verify', {
        userId,
        response: authResp
      });

      if (verifyResp.data.success && verifyResp.data.user) {
         await finalizeLogin(verifyResp.data.user);
      }
    } catch (err: any) {
      console.error("Biometric Login Error:", err);
      setError(err.response?.data?.error || "Biometric authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterBiometric = async () => {
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      const optResp = await axios.get('/api/auth/webauthn/register-options?userId=' + currentUserId);
      const attResp = await startRegistration(optResp.data);
      const verifyResp = await axios.post('/api/auth/webauthn/register-verify', {
        userId: currentUserId,
        response: attResp
      });
      if (verifyResp.data.success) {
         alert("Biometric Login enabled successfully!");
      }
    } catch (err) {
      console.error("Biometric Setup Error:", err);
      alert("Failed to setup biometric login.");
    } finally {
      setIsLoading(false);
      setShowBiometricPrompt(false);
      // finalize login after prompt
      await finalizeLogin({ id: currentUserId, role: 'volunteer' }); // using simplified data
    }
  };

  const finalizeLogin = async (userData: any) => {
    await onLoginSuccess("volunteer", { 
       id: userData.id, 
       name: userData.name || "Volunteer", 
       phone: userData.phone, 
       email: userData.email 
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
    } catch (err) {
      setError("Failed to create ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn relative">
      
      {/* Decorative Header */}
      <div className="bg-gradient-to-br from-[#000080] via-[#051125] to-[#122A54] pt-12 pb-24 px-6 rounded-b-[40px] relative overflow-hidden shadow-lg shrink-0">
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-[#FF9933] rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-30px] left-[-30px] w-40 h-40 bg-[#138808] rounded-full blur-[70px] opacity-30 mix-blend-screen pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl mb-5 flex items-center justify-center border border-white/20 shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/0"></div>
             <img src="/assets/rpf-logo.png" alt="Logo" className="w-14 h-14 object-contain relative z-10 drop-shadow-md" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <h1 className="text-2xl font-display font-black text-white tracking-tight leading-tight">
            Jan Seva <span className="text-[#FF9933]">Super App</span>
          </h1>
          <p className="text-[#138808] font-black text-[10px] tracking-widest uppercase mt-2 bg-white/10 py-1 px-3 rounded-full border border-[#138808]/30 backdrop-blur-sm shadow-inner">
            Revolutionizing Public Service
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 px-5 -mt-16 pb-8 relative z-20">
        <div className="bg-white rounded-[32px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] p-6 border border-slate-100">
          
          {mode === "welcome" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-display font-black text-slate-800">Welcome to Jan Seva</h2>
                <p className="text-xs font-bold text-slate-400">Choose how you want to continue</p>
              </div>

              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => setMode("login")}
                  className="w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-[#000080] to-[#0A1A3A] shadow-md hover:shadow-lg active:scale-[0.98] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-200" />
                    <span>Login (Staff & Volunteers)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-white px-3 text-slate-300">or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={async () => {
                       setIsLoading(true);
                       try {
                         await onLoginSuccess("guest");
                       } catch (err) {
                         console.error("Guest Login error:", err);
                       } finally {
                         setIsLoading(false);
                       }
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-[0.98] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Continue as Citizen / Guest</span>
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
                    <div className="flex items-center gap-1">
                      <span className="bg-[#138808]/15 text-[#138808] text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#138808]/30">NEW</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === "login" && !showBiometricPrompt && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <button onClick={() => setMode("welcome")} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition -ml-1.5">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="font-display font-black text-lg text-slate-800 tracking-tight">Secure Login</h3>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-red-100">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                      Identifier
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <UserPlus className="h-4 w-4 text-indigo-400" />
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-bold text-slate-800 bg-slate-50 transition placeholder-slate-400"
                        placeholder="Mobile, Email, or User ID"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <KeyRound className="h-4 w-4 text-indigo-400" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-bold text-slate-800 bg-slate-50 transition placeholder-slate-400"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setMode("forgotPassword")} className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition">
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={!identifier || !password || isLoading} className="w-full flex justify-center items-center gap-2 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-black text-white bg-gradient-to-r from-[#000080] to-[#0A1A3A] hover:from-navy-light hover:to-[#000080] disabled:opacity-50 transition uppercase tracking-wider">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Login Securely <ChevronRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="relative py-3 mt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                  <span className="bg-white px-3 text-slate-300">Biometric Sign In</span>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleBiometricLogin} 
                className="w-full flex justify-center items-center gap-2 py-3.5 rounded-xl text-sm font-black text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition tracking-wider"
              >
                <Fingerprint className="w-5 h-5" /> Use Face ID / Touch ID
              </button>
            </div>
          )}

          {mode === "forgotPassword" && (
            <div className="space-y-4 animate-fadeIn">
               <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <button onClick={() => setMode("login")} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition -ml-1.5">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="font-display font-black text-lg text-slate-800 tracking-tight">Recover Account</h3>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold border border-red-100">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="bg-green-50 text-green-700 p-3 rounded-xl text-[10px] font-bold border border-green-100">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4 pt-1">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                      Account Identifier
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-800 bg-slate-50 transition"
                      placeholder="Mobile, Email, or User ID"
                      required
                    />
                 </div>
                 <button type="submit" disabled={!identifier || isLoading} className="w-full flex justify-center items-center py-3.5 rounded-xl shadow-md text-xs font-black text-white bg-slate-800 disabled:opacity-50 transition uppercase tracking-wider">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                 </button>
              </form>

              <div className="text-center pt-2">
                 <p className="text-[10px] font-bold text-slate-500 mb-2">No access to Email?</p>
                 <button type="button" onClick={handleAdminReset} disabled={isLoading} className="text-[10px] font-black text-indigo-600 hover:underline">
                   Request Admin Reset Ticket
                 </button>
              </div>
            </div>
          )}

          {showBiometricPrompt && (
            <div className="space-y-5 animate-fadeIn text-center py-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100">
                <Fingerprint className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-slate-800">Enable Biometric Login?</h3>
                <p className="text-xs font-bold text-slate-500 mt-2 px-4 leading-relaxed">
                  Use Face ID or Touch ID for faster, secure logins next time.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button onClick={handleRegisterBiometric} disabled={isLoading} className="w-full py-3.5 rounded-xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Enable Now"}
                </button>
                <button onClick={async () => await finalizeLogin({ id: currentUserId, role: 'volunteer' })} className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition">
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

      {/* Footer Strip */}
      <div className="w-full pb-4 text-center shrink-0 z-10 absolute bottom-0">
        <p className="text-[8px] text-slate-350 font-bold uppercase tracking-widest">
          Secured by RP Foundation Tech
        </p>
      </div>
    </div>
  );
}
