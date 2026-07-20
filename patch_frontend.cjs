const fs = require('fs');

let content = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

// 1. Auth Method State
content = content.replace(
  'const [authMethod, setAuthMethod] = useState<"phone" | "password">("phone");',
  'const [authMethod, setAuthMethod] = useState<"phone" | "email" | "password">("phone");'
);

// 2. Email State
if (!content.includes('const [email, setEmail]')) {
  content = content.replace(
    'const [phone, setPhone] = useState("");',
    'const [phone, setPhone] = useState("");\n  const [email, setEmail] = useState("");'
  );
}

// 3. handlePhoneSubmit -> handleAuthSubmit
const oldHandlePhone = `  const handlePhoneSubmit = async (e: React.FormEvent) => {
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
  };`;

const newHandleAuth = `  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = authMethod === "phone" ? phone : email;
    if ((authMethod === "phone" && phone.length === 10) || (authMethod === "email" && email.includes("@"))) {
      setIsLoading(true);
      setError(null);
      try {
        // Call real Auth endpoint for OTP
        await axios.post('/api/auth/send-otp', { identifier });
        setMode("otp");
        // Simulated Toast notification
        alert("OTP Sent successfully!");
      } catch (err: any) {
        console.error("OTP Send Error:", err);
        setError("Failed to send verification code. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    }
  };`;
content = content.replace(oldHandlePhone, newHandleAuth);

// 4. handleOtpSubmit -> /api/auth/login
const oldHandleOtp = `        const uid = "usr_" + phone;
        await axios.post('/api/auth/verify', { phone, otp: fullOtp });
        await onLoginSuccess(phone.startsWith("9") ? "volunteer" : "guest", { 
          phone, `;
          
const newHandleOtp = `        const identifier = authMethod === "phone" ? phone : email;
        const uid = "usr_" + identifier;
        await axios.post('/api/auth/login', { identifier, otp: fullOtp });
        await onLoginSuccess(identifier.startsWith("9") ? "volunteer" : "guest", { 
          phone: authMethod === "phone" ? phone : undefined, 
          email: authMethod === "email" ? email : undefined,`;
          
content = content.replace(oldHandleOtp, newHandleOtp);

// 5. Auth Method Tabs
const oldTabs = `{/* Auth Method Tabs */}
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
                  Mobile OTP
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
              </div>`;

const newTabs = `{/* Auth Method Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setAuthMethod("phone")}
                  className={\`flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 \${
                    authMethod === "phone" ? "bg-white text-[#FF9933] shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                  }\`}
                >
                  <Smartphone className="w-3 h-3" /> Mobile
                </button>
                <button
                  onClick={() => setAuthMethod("email")}
                  className={\`flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 \${
                    authMethod === "email" ? "bg-white text-[#138808] shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                  }\`}
                >
                  <Mail className="w-3 h-3" /> Email
                </button>
                <button
                  onClick={() => setAuthMethod("password")}
                  className={\`flex-1 py-1.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 \${
                    authMethod === "password" ? "bg-white text-[#000080] shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                  }\`}
                >
                  <Lock className="w-3 h-3" /> ID
                </button>
              </div>`;

content = content.replace(oldTabs, newTabs);

// 6. Form rendering
const oldPhoneFormStart = `{authMethod === "phone" ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-3.5">`;

const newPhoneFormStart = `{(authMethod === "phone" || authMethod === "email") ? (
                <form onSubmit={handleAuthSubmit} className="space-y-3.5">`;

content = content.replace(oldPhoneFormStart, newPhoneFormStart);

const oldPhoneInput = `<div className="space-y-1.5">
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
                  </div>`;

const newPhoneInput = `<div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
                      {lang === "hi" ? "संपर्क जानकारी" : (authMethod === "phone" ? "Enter Mobile Number" : "Enter Email Address")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {authMethod === "phone" ? <Phone className="h-3.5 w-3.5 text-[#FF9933]" /> : <Mail className="h-3.5 w-3.5 text-[#138808]" />}
                        {authMethod === "phone" && <span className="ml-1.5 text-xs font-bold text-slate-400 border-r border-slate-200 pr-1.5">+91</span>}
                      </div>
                      {authMethod === "phone" ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\\D/g, '').slice(0, 10))}
                          className="block w-full pl-16 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#FF9933] outline-none text-xs font-bold text-slate-800 bg-slate-50 transition placeholder-slate-350"
                          placeholder="99999 99999"
                          required
                        />
                      ) : (
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#138808] outline-none text-xs font-bold text-slate-800 bg-slate-50 transition placeholder-slate-350"
                          placeholder="you@example.com"
                          required
                        />
                      )}
                    </div>
                  </div>`;

content = content.replace(oldPhoneInput, newPhoneInput);

// Ensure the button disabled state works for email
const oldButtonDisabled = `disabled={phone.length < 10 || isLoading}`;
const newButtonDisabled = `disabled={(authMethod === "phone" ? phone.length < 10 : !email.includes("@")) || isLoading}`;

content = content.replace(oldButtonDisabled, newButtonDisabled);

fs.writeFileSync('src/components/LoginScreen.tsx', content);
