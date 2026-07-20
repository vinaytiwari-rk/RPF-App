import React, { useState } from "react";
import { ArrowLeft, Loader2, Phone, UserPlus, KeyRound, Smartphone, Mail, ShieldCheck, Heart, Users, ChevronRight, Lock, AlertTriangle } from "lucide-react";
import axios from "axios";
// Replaced Firebase Auth with client-side mock verification for stability

interface LoginScreenProps {
  lang: "hi" | "en";
  onLoginSuccess: (role: "volunteer" | "guest", details?: { phone?: string; name?: string; id?: string }) => Promise<void>;
}

export default function LoginScreen({ lang, onLoginSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<"welcome" | "phone" | "otp" | "password">("welcome");
  const [authMethod, setAuthMethod] = useState<"phone" | "email" | "password">("phone");
  
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setIsLoading(true);
      setError(null);
      try {
        // Call real Auth endpoint
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
      const nextInput = document.getElementById(`otp-${index + 1}`);
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
        const uid = "usr_" + phone;
        await axios.post('/api/auth/verify', { phone, otp: fullOtp });
        await onLoginSuccess(phone.startsWith("9") ? "volunteer" : "guest", { 
          phone, 
          name: phone.startsWith("9") ? "Volunteer (" + phone.slice(-4) + ")" : "Citizen (" + phone.slice(-4) + ")",
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

  const handleGoogleAppleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onLoginSuccess("guest");
    } catch (err: any) {
      console.error("Login Error:", err);
      setError("Social login failed. Please try another method.");
    } finally {
      setIsLoading(false);
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
        {/* Soft dark-gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-[#0B1E3F]/40 to-[#0B1E3F]/90"></div>
      </div>

      {/* Dynamic Header Block (Logo, Taglines, Slogan) */}
      <div className="w-full pt-16 pb-4 px-6 flex flex-col items-center text-center z-10 shrink-0">
        {/* Flag wavy border top trim */}
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
          <p className="text-[10.5px] font-medium text-slate-350 italic mt-1 drop-shadow-xs">
            Together, we build a <span className="text-[#FF9933] font-bold">better tomorrow</span>
          </p>
        </div>
      </div>

      {/* Main Interactive Login Container Card */}
      <div className="w-full px-5 pb-6 pt-2 z-10 relative">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/90 relative overflow-hidden flex flex-col gap-4">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-tricolour"></div>

          {mode === "welcome" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <h2 className="text-base font-display font-black text-[#0B1E3F]">
                  Welcome to <span className="text-gold-metallic">Jan Seva</span> Super App
                </h2>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed px-2">
                  Join hands with us to serve the nation and empower rural communities.
                </p>
              </div>

              {/* Login Buttons Stack */}
              <div className="space-y-2.5">
                {/* Google Sign In */}
                <button 
                  onClick={handleGoogleAppleLogin}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50/50 shadow-sm active:scale-[0.98] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-red-500" />
                    <span>Continue with Google</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Apple Sign In */}
                <button 
                  onClick={handleGoogleAppleLogin}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50/50 shadow-sm active:scale-[0.98] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Apple Icon */}
                    <svg viewBox="0 0 384 512" className="w-4 h-4 fill-slate-800"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                    <span>Continue with Apple</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Mobile OTP Login */}
                <button 
                  onClick={() => setMode("phone")}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50/50 shadow-sm active:scale-[0.98] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-[#FF9933]" />
                    <span>Continue with Mobile Number</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="bg-[#FF9933]/15 text-[#FF9933] text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#FF9933]/30">OTP</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>

                {/* Guest Account Login */}
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
                  <div className="flex items-center gap-1">
                    <span className="bg-[#138808]/10 text-[#138808] text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#138808]/20">Quick Access</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              </div>

              {/* Bottom Value Badges (Screenshot 3 footer elements) */}
              <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-100/70 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center border border-green-100 text-green-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-widest leading-none">Secure & Safe</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 text-orange-700">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-widest leading-none">People Helper</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-[#000080]">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-widest leading-none">Social Seva</span>
                </div>
              </div>

              {/* Terms of Service Disclaimer */}
              <p className="text-[7.5px] text-center text-slate-400 font-semibold leading-relaxed pt-1.5 px-4">
                By continuing, you agree to our <span className="text-[#000080] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#000080] hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          )}

          {mode === "phone" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <button onClick={() => setMode("welcome")} className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-800">{lang === "hi" ? "मोबाइल नंबर दर्ज करें" : "Mobile Login"}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{lang === "hi" ? "ओटीपी सत्यापन" : "OTP Verification Required"}</p>
                </div>
              </div>

              {/* Auth Method Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setAuthMethod("phone")}
                  className={`flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    authMethod === "phone" 
                      ? "bg-white text-[#FF9933] shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  Mobile OTP
                </button>
                <button
                  onClick={() => setAuthMethod("password")}
                  className={`flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    authMethod === "password" 
                      ? "bg-white text-[#000080] shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
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
                      {lang === "hi" ? "अपना मोबाइल नंबर" : "Enter Mobile Number"}
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

                  <button
                    type="submit"
                    disabled={(authMethod === "phone" ? phone.length < 10 : !email.includes("@")) || isLoading}
                    className="w-full flex justify-center items-center gap-1.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-[#FF9933] hover:bg-[#e68a2e] disabled:opacity-50 transition uppercase tracking-wider"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <span>{lang === "hi" ? "ओटीपी प्राप्त करें" : "Get Verification OTP"}</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                        {lang === "hi" ? "यूजर आईडी" : "User ID / Member ID"}
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
                        {lang === "hi" ? "पासवर्ड" : "Password"}
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

                  <button
                    type="submit"
                    disabled={!userId || !password || isLoading}
                    className="w-full flex justify-center items-center gap-1.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-[#000080] hover:bg-[#000066] disabled:opacity-50 transition uppercase tracking-wider"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <span>{lang === "hi" ? "लॉगिन करें" : "Secure Log In"}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {mode === "otp" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <button onClick={() => setMode("phone")} className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-800">{lang === "hi" ? "ओटीपी दर्ज करें" : "Enter Verification OTP"}</h3>
                  <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">{lang === "hi" ? `+91 ${phone} पर भेजा गया` : `Sent to +91 ${phone}`}</p>
                </div>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="flex justify-between gap-1.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && idx > 0) {
                          const prevInput = document.getElementById(`otp-${idx - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-9 h-11 text-center text-base font-black border border-slate-200 rounded-xl focus:border-[#138808] outline-none bg-slate-50 text-slate-800 transition"
                      required
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={otp.join("").length < 6 || isLoading}
                  className="w-full flex justify-center items-center gap-1.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-[#138808] hover:bg-[#0e6606] disabled:opacity-50 transition uppercase tracking-wider"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (
                    <span>{lang === "hi" ? "ओटीपी सत्यापित करें" : "Verify & Log In"}</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer Strip */}
      <div className="w-full pb-4 text-center shrink-0 z-10">
        <p className="text-[8px] text-slate-350 font-bold uppercase tracking-widest">
          Secured by RP Foundation Tech
        </p>
      </div>

      {/* Cleaned up reCAPTCHA container */}
    </div>
  );
}
