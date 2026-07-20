const fs = require('fs');

let file = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

// 1. Add "registerPhone", "registerOtp", "registerForm" to modes
file = file.replace(/const \[mode, setMode\] = useState<"welcome" \| "phone" \| "otp" \| "password">/, 'const [mode, setMode] = useState<"welcome" | "phone" | "otp" | "password" | "registerPhone" | "registerOtp" | "registerForm">');

// 2. Add state for registration fields
file = file.replace(/const \[userId, setUserId\] = useState\(""\);/, `const [userId, setUserId] = useState("");
  const [regName, setRegName] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPincode, setRegPincode] = useState("");
  const [regInterest, setRegInterest] = useState("Medical");`);

// 3. Add Register as Volunteer button on welcome screen
const registerButton = `
                {/* Volunteer Registration */}
                <button 
                  onClick={() => setMode("registerPhone")}
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
`;
file = file.replace(/\{\/\* Guest Account Login \*\/\}/, `${registerButton}\n                {/* Guest Account Login */}`);

// 4. Add handlers for registration OTP and Form
const handlers = `
  const handleRegPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setIsLoading(true);
      setError(null);
      try {
        await axios.post('/api/auth/login', { phone });
        setMode("registerOtp");
      } catch (err: any) {
        console.error("SMS Send Error:", err);
        setError("Failed to send verification code.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length === 6) {
      setIsLoading(true);
      setError(null);
      try {
        await axios.post('/api/auth/verify', { phone, otp: fullOtp });
        setMode("registerForm");
      } catch (err: any) {
        console.error("OTP Verification Error:", err);
        setError("Incorrect verification code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regName && phone && regAddress && regPincode && regInterest) {
      setIsLoading(true);
      try {
        const uid = "usr_" + phone;
        await onLoginSuccess("volunteer", { 
          phone, 
          name: regName,
          id: uid 
        });
      } catch (err) {
        console.error("Registration Error", err);
      } finally {
        setIsLoading(false);
      }
    }
  };
`;
file = file.replace(/const handlePasswordSubmit = async/, `${handlers}\n  const handlePasswordSubmit = async`);

// 5. Add Registration Phone Mode UI
const registerPhoneUI = `
          {mode === "registerPhone" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <button onClick={() => setMode("welcome")} className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-800">Volunteer Registration</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Step 1: Mobile Verification</p>
                </div>
              </div>
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[10px] font-bold flex items-start gap-1.5 animate-fadeIn">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleRegPhoneSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                    Active Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-3.5 w-3.5 text-[#FF9933]" />
                      <span className="ml-1.5 text-xs font-bold text-slate-400 border-r border-slate-200 pr-1.5">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\\D/g, '').slice(0, 10))}
                      className="block w-full pl-16 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#FF9933] outline-none text-xs font-bold text-slate-800 bg-slate-50 transition placeholder-slate-350"
                      placeholder="99999 99999"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={phone.length < 10 || isLoading}
                  className="w-full flex justify-center items-center gap-1.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-[#FF9933] hover:bg-[#e68a2e] disabled:opacity-50 transition uppercase tracking-wider"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send OTP</span>}
                </button>
              </form>
            </div>
          )}
`;
file = file.replace(/\{mode === "otp" && \(/, `${registerPhoneUI}\n\n          {mode === "otp" && (`);

// 6. Add Registration OTP Mode UI
const registerOtpUI = `
          {mode === "registerOtp" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <button onClick={() => setMode("registerPhone")} className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-800">Verify OTP</h3>
                  <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Sent to +91 {phone}</p>
                </div>
              </div>
              <form onSubmit={handleRegOtpSubmit} className="space-y-5">
                <div className="flex justify-between gap-1.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={\`otp-\${idx}\`}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && idx > 0) {
                          const prevInput = document.getElementById(\`otp-\${idx - 1}\`);
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
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>Verify & Continue</span>}
                </button>
              </form>
            </div>
          )}
`;
file = file.replace(/\{mode === "otp" && \(/, `${registerOtpUI}\n\n          {mode === "otp" && (`);

// 7. Add Registration Form Mode UI
const registerFormUI = `
          {mode === "registerForm" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <button onClick={() => setMode("registerPhone")} className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-800">Volunteer Details</h3>
                  <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Step 2: Profile Information</p>
                </div>
              </div>
              <form onSubmit={handleRegistrationSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Full Name</label>
                  <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 outline-none focus:border-[#000080]" placeholder="John Doe" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Active Mobile Number</label>
                  <input type="text" value={phone} disabled className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Full Address / City</label>
                  <input type="text" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 outline-none focus:border-[#000080]" placeholder="123 Street, Bhopal" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Pincode</label>
                  <input type="text" value={regPincode} onChange={(e) => setRegPincode(e.target.value)} className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 outline-none focus:border-[#000080]" placeholder="462001" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Area of Interest</label>
                  <select value={regInterest} onChange={(e) => setRegInterest(e.target.value)} className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 outline-none focus:border-[#000080]" required>
                    <option value="Medical">Medical</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Relief">Relief</option>
                  </select>
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-1.5 py-3 mt-2 rounded-xl shadow-md text-xs font-bold text-white bg-[#000080] hover:bg-[#000066] disabled:opacity-50 transition uppercase tracking-wider">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>Complete Registration</span>}
                </button>
              </form>
            </div>
          )}
`;
file = file.replace(/\{mode === "otp" && \(/, `${registerFormUI}\n\n          {mode === "otp" && (`);

fs.writeFileSync('src/components/LoginScreen.tsx', file);
