const fs = require('fs');

let file = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

const authTabs = `
              {/* Auth Method Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setAuthMethod("phone")}
                  className={\`flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 \${
                    authMethod === "phone" 
                      ? "bg-white text-[#FF9933] shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-700"
                  }\`}
                >
                  <Smartphone className="w-3 h-3" />
                  Mobile
                </button>
                <button
                  onClick={() => setAuthMethod("email")}
                  className={\`flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 \${
                    authMethod === "email" 
                      ? "bg-white text-[#138808] shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-700"
                  }\`}
                >
                  <Mail className="w-3 h-3" />
                  Email
                </button>
                <button
                  onClick={() => setAuthMethod("password")}
                  className={\`flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 \${
                    authMethod === "password" 
                      ? "bg-white text-[#000080] shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-700"
                  }\`}
                >
                  <Lock className="w-3 h-3" />
                  User ID
                </button>
              </div>
`;

file = file.replace(/\{\/\* Auth Method Tabs \*\/\}[^]+?User ID\s+<\/button>\s+<\/div>/, authTabs);

const handleEmailSubmit = `
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setIsLoading(true);
      setError(null);
      try {
        await axios.post('/api/auth/login-email', { email });
        // Since we reuse the "phone" mode for verification layout, we'll store email in phone state for verify endpoint
        setPhone(email); 
        setMode("otp");
      } catch (err: any) {
        console.error("Email Send Error:", err);
        setError("Failed to send verification code. Please check your email address.");
      } finally {
        setIsLoading(false);
      }
    }
  };
`;

file = file.replace(/const handlePhoneSubmit = async/, handleEmailSubmit + '\n  const handlePhoneSubmit = async');

const emailForm = `
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
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <span>{lang === "hi" ? "ओटीपी प्राप्त करें" : "Get Verification OTP"}</span>
                    )}
                  </button>
                </form>
              ) : authMethod === "email" ? (
                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                      {lang === "hi" ? "अपना ईमेल" : "Enter Email Address"}
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

                  <button
                    type="submit"
                    disabled={!email.includes("@") || isLoading}
                    className="w-full flex justify-center items-center gap-1.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-[#138808] hover:bg-[#0e6606] disabled:opacity-50 transition uppercase tracking-wider"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <span>{lang === "hi" ? "ओटीपी प्राप्त करें" : "Get Verification OTP"}</span>
                    )}
                  </button>
                </form>
              ) : (
`;

file = file.replace(/\{authMethod === "phone" \? \([\s\S]*?className="w-full flex justify-center items-center gap-1\.5 py-3 rounded-xl shadow-md text-xs font-bold text-white bg-\[#FF9933\] hover:bg-\[#e68a2e\] disabled:opacity-50 transition uppercase tracking-wider"[\s\S]*?<\/button>\s+<\/form>\s+\) : \(/, emailForm);

fs.writeFileSync('src/components/LoginScreen.tsx', file);
