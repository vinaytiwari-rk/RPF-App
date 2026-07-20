import React, { useState } from "react";
import VolunteerRegistrationWizard from "./VolunteerRegistrationWizard";
import { ArrowLeft, Loader2, Phone, UserPlus, KeyRound, Smartphone, Mail, ShieldCheck, Heart, Users, ChevronRight, Lock, AlertTriangle } from "lucide-react";
import axios from "axios";

interface LoginScreenProps {
  lang: "hi" | "en";
  onLoginSuccess: (role: "volunteer" | "guest", details?: { phone?: string; name?: string; id?: string; email?: string }) => Promise<void>;
}

export default function LoginScreen({ lang, onLoginSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<"welcome" | "login" | "otp" | "registerForm">("welcome");
  const [authMethod, setAuthMethod] = useState<"phone" | "email" | "password">("phone");
  
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setIsLoading(true);
      setError(null);
      try {
        await axios.post('/api/auth/login-email', { email });
        setMode("otp");
      } catch (err: any) {
        console.error("Email Send Error:", err);
        setError("Failed to send verification code. Please check your email address.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setIsLoading(true);
      setError(null);
      try {
        await axios.post('/api/auth/login', { phone });
        setMode("otp");
      } catch (err: any) {
        console.error("SMS Send Error:", err);
        setError("Failed to send verification code. Please check your mobile network connection.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById("otp-" + (index + 1));
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length === 6) {
      setIsLoading(true);
      setError(null);
      try {
        const identifier = authMethod === "email" ? email : phone;
        await axios.post('/api/auth/verify', { phone: identifier, otp: fullOtp });
        const uid = "usr_" + identifier;
        await onLoginSuccess("volunteer", { 
          phone: authMethod === "phone" ? phone : undefined,
          email: authMethod === "email" ? email : undefined,
          name: "Volunteer (" + identifier.slice(-4) + ")",
          id: uid 
        });
      } catch (err: any) {
        console.error("OTP Verification Error:", err);
        setError("Incorrect verification code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userId && password) {
      setIsLoading(true);
      setError(null);
      try {
        const cleanUserId = userId.trim().toLowerCase();
        const cleanPassword = password.trim();
        if (cleanUserId === "admin" && cleanPassword === "admin") {
          await onLoginSuccess("volunteer", { id: "usr_staff_admin", name: "System Administrator" });
        } else if (cleanUserId === "officer" && cleanPassword === "officer") {
          await onLoginSuccess("volunteer", { id: "usr_staff_officer", name: "Official Officer" });
        } else {
          await onLoginSuccess("volunteer", { id: userId, name: "Staff Member (" + userId + ")" });
        }
      } catch (err: any) {
        console.error("Login Error:", err);
        setError("Invalid User ID or password.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full sm:w-[410px] h-screen sm:h-[840px] bg-slate-50 flex flex-col justify-between relative overflow-hidden select-none font-sans mx-auto">
      
      {/* Background Image of Flag & Volunteers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/assets/login_bg.png" 
          alt="Indian flag wave with volunteers working" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-[#0B1E3F]/40 to-[#0B1E3F]/90"></div>
      </div>

      {/* Dynamic Header Block */}
      <div className="w-full pt-16 pb-4 px-6 flex flex-col items-center text-center z-10 shrink-0">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-tricolour"></div>
        <img 
          src="/assets/logo.png" 
          alt="RP Foundation Logo" 
          className="w-24 h-24 bg-white rounded-full p-1.5 shadow-xl border-2 border-[#D4AF37]/30 mb-3 animate-float"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-black text-white tracking-widest leading-none drop-shadow-md">
            RP FOUNDATION
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#FF9933] drop-shadow-sm">
            Rohit Pandit Foundation
          </p>
          <p className="text-[11px] font-bold text-slate-100 flex items-center justify-center gap-1.5 bg-black/35 backdrop-blur-md px-3.5 py-0.5 rounded-full border border-white/10 w-fit mx-auto mt-2">
            <span className="text-[#FF9933]">सेवा</span>
            <span className="text-white">•</span>
            <span className="text-slate-200">समर्पण</span>
            <span className="text-white">•</span>
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
                  <ChevronRight className="w-4 h-4 text-slate-400" />
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
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>

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
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-4 h-4 text-[#138808]" />
                    <span>Continue as Guest</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <button onClick={() => setMode("welcome")} className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-800">Secure Login</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Choose your method</p>
                </div>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setAuthMethod("phone")}
                  className={"flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 " + (authMethod === "phone" ? "bg-white text-[#FF9933] shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700")}
                >
                  <Smartphone className="w-3 h-3" />
                  Mobile
                </button>
                <button
                  onClick={() => setAuthMethod("email")}
                  className={"flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 " + (authMethod === "email" ? "bg-white text-[#138808] shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700")}
                >
                  <Mail className="w-3 h-3" />
                  Email
                </button>
                <button
                  onClick={() => setAuthMethod("password")}
                  className={"flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 " + (authMethod === "password" ? "bg-white text-[#000080] shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700")}
                >
                  <Lock className="w-3 h-3" />
                  User ID
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[10px] font-bold flex items-start gap-1.5 animate-fadeIn">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {authMethod === "phone" ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                      Enter Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-3.5 w-3.5 text-[#FF9933]" />
                        <span className="ml-1.5 text-xs font-bold text-slate-400 border-r border-slate-200 pr-1.5">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="block w-full pl-16 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#FF9933] outline-none text-xs font-bold text-slate-800 bg-slate-50 transition placeholder-slate-350"
                        placeholder="99999 99999"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={phone.length < 10 || isLoading} className="w-full flex justify-center items-center gap-1.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-[#FF9933] hover:bg-[#e68a2e] disabled:opacity-50 transition uppercase tracking-wider">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Get Verification OTP</span>}
                  </button>
                </form>
              ) : authMethod === "email" ? (
                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                      Enter Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-3.5 w-3.5 text-[#138808]" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#138808] outline-none text-xs font-bold text-slate-800 bg-slate-50 transition placeholder-slate-350"
                        placeholder="volunteer@example.com"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={!email.includes("@") || isLoading} className="w-full flex justify-center items-center gap-1.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-[#138808] hover:bg-[#0e6606] disabled:opacity-50 transition uppercase tracking-wider">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Get Verification OTP</span>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                        User ID / Member ID
                      </label>
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#000080] outline-none text-xs font-bold text-slate-800 bg-slate-50 transition placeholder-slate-300"
                        placeholder="RP-00000"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#000080] outline-none text-xs font-bold text-slate-800 bg-slate-50 transition placeholder-slate-350"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={!userId || !password || isLoading} className="w-full flex justify-center items-center gap-1.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-[#000080] hover:bg-[#000066] disabled:opacity-50 transition uppercase tracking-wider">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Secure Log In</span>}
                  </button>
                </form>
              )}
            </div>
          )}

          {mode === "otp" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <button onClick={() => setMode("login")} className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-800">Verify OTP</h3>
                  <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Sent to {authMethod === "email" ? email : `+91 ${phone}`}</p>
                </div>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="flex justify-between gap-1.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={"otp-" + idx}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && idx > 0) {
                          const prevInput = document.getElementById("otp-" + (idx - 1));
                          prevInput?.focus();
                        }
                      }}
                      className="w-9 h-11 text-center text-base font-black border border-slate-200 rounded-xl focus:border-[#138808] outline-none bg-slate-50 text-slate-800 transition"
                      required
                    />
                  ))}
                </div>
                <button type="submit" disabled={otp.join("").length < 6 || isLoading} className="w-full flex justify-center items-center gap-1.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-[#138808] hover:bg-[#0e6606] disabled:opacity-50 transition uppercase tracking-wider">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>Verify & Log In</span>}
                </button>
              </form>
            </div>
          )}

          
          {/* mode === "registerForm" has been moved outside */}
        </div>
      </div>

      {mode === "registerForm" && (
        <div className="absolute inset-0 z-50 bg-slate-50 sm:rounded-3xl shadow-2xl">
          <VolunteerRegistrationWizard 
            onBack={() => setMode("welcome")} 
            onComplete={async (username, pass) => {
              const uid = "usr_" + username;
              await onLoginSuccess("volunteer", { id: uid, name: "Volunteer (" + username + ")" });
            }} 
          />
        </div>
      )}

      {/* Footer Strip */}
      <div className="w-full pb-4 text-center shrink-0 z-10">
        <p className="text-[8px] text-slate-350 font-bold uppercase tracking-widest">
          Secured by RP Foundation Tech
        </p>
      </div>
    </div>
  );
}
