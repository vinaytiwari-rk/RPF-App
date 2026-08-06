import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck, Globe, Loader2, User, Phone, MapPin, FileText, Lock } from "lucide-react";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import LocationPicker from "./LocationPicker";

interface VolunteerRegistrationWizardProps {
  onBack: () => void;
  onComplete: (username: string, pass: string) => void;
}

export default function VolunteerRegistrationWizard({ onBack, onComplete }: VolunteerRegistrationWizardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  // Global State for Country
  const [countryIso, setCountryIso] = useState("IN");
  
  // Personal
  const [fullName, setFullName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    if (dob) {
      const diff = new Date().getTime() - new Date(dob).getTime();
      const ageDate = new Date(diff);
      setAge(Math.abs(ageDate.getUTCFullYear() - 1970).toString());
    }
  }, [dob]);

  // Contact
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // Identity & Profile
  const [education, setEducation] = useState<string[]>([]);
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [skills, setSkills] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [availability, setAvailability] = useState("Weekends");
  
  // Dynamic Identity Fields
  const [nationalId1, setNationalId1] = useState("");
  const [nationalId2, setNationalId2] = useState("");

  const toggleArray = (arr: string[], setArr: any, val: string) => {
    if (arr.includes(val)) setArr(arr.filter(a => a !== val));
    else setArr([...arr, val]);
  };

  // Location & CRM
  const [stateIso, setStateIso] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  
  // Auto-filled CRM Fields (India Only)
  const [sansad, setSansad] = useState("");
  const [vidhan, setVidhan] = useState("");
  const [vidhanSabhas, setVidhanSabhas] = useState<string[]>([]);
  const [isCustomVidhan, setIsCustomVidhan] = useState(false);
  const [ward, setWard] = useState("");

  const handleVidhanChange = (val: string) => {
    if (val === "__custom__") {
      setIsCustomVidhan(true);
      setVidhan("");
    } else {
      setIsCustomVidhan(false);
      setVidhan(val);
    }
  };

  // Password
  const [password, setPassword] = useState("");

  // Pincode auto-fill effect
  useEffect(() => {
    if (pincode.length === 6) {
      axios.get(`/api/locations/pincode?p=${pincode}`)
        .then(res => {
          if (res.data.success && res.data.data) {
            const data = res.data.data;
            if (data.state) {
              const stateObj = State.getStatesOfCountry("IN").find(s => s.name === data.state);
              if (stateObj) setStateIso(stateObj.isoCode);
            }
            if (data.city) setCity(data.city);
            if (data.sansad_kshetra) setSansad(data.sansad_kshetra);
            if (data.vidhan_sabha) setVidhan(data.vidhan_sabha);
            if (data.vidhan_sabhas) setVidhanSabhas(data.vidhan_sabhas);
            if (data.areas && data.areas.length > 0) {
              // setAreaSuggestions(data.areas);
              // setShowSuggestions(true);
            }
          }
        })
        .catch(err => console.error("Pincode lookup failed", err));
    }
  }, [pincode]);

  const isIndia = countryIso === "IN";
  const countriesList = Country.getAllCountries();
  const statesList = State.getStatesOfCountry(countryIso);
  const citiesList = City.getCitiesOfState(countryIso, stateIso);

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle"|"checking"|"available"|"taken">("idle");
  const [usernameError, setUsernameError] = useState("");
  
  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus("idle");
      setUsernameError("");
      return;
    }
    
    setUsernameStatus("checking");
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
        if (res.data.available) {
          setUsernameStatus("available");
          setUsernameError("");
        } else {
          setUsernameStatus("taken");
          setUsernameError(res.data.error || "Not available");
        }
      } catch (err: any) {
        setUsernameStatus("taken");
        setUsernameError(err.response?.data?.error || "Error checking availability");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "" };
    if (password.length < 6) return { label: "Weak", color: "text-red-500" };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: "Strong", color: "text-green-500" };
    return { label: "Medium", color: "text-yellow-500" };
  };

  const handleSelectArea = (loc: any) => {
    if (typeof loc === "string") {
      setArea(loc);
    } else {
      setArea(loc.vidhan_sabha);
      setSansad(loc.sansad_kshetra);
      setVidhan(loc.vidhan_sabha);
    }
  };

  const handleCountryChange = (iso: string) => {
    setCountryIso(iso);
    setStateIso("");
    setCity("");
    setArea("");
    setNationalId1("");
    setNationalId2("");
  };

  // Post-Registration
  const [regData, setRegData] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  const submitForm = async () => {
    if (!agreed) {
       setError("Please accept the terms to proceed.");
       return;
    }
    if (!password || password.length < 6) {
       setError("Please provide a password of at least 6 characters.");
       return;
    }

    setLoading(true); setError(null);
    try {
      const countryName = Country.getCountryByCode(countryIso)?.name || countryIso;
      const stateName = State.getStateByCodeAndCountry(stateIso, countryIso)?.name || stateIso;

      const res = await axios.post("/api/auth/register-volunteer", {
        username,
        full_name: fullName, father_husband_name: fatherName, mother_name: motherName, dob,
        mobile, email, education, blood_group: bloodGroup, skills, reason_for_joining: reason,
        availability, 
        national_id_1: nationalId1, 
        national_id_2: nationalId2,
        country: countryName, state: stateName, city, address, pincode, area_locality: area,
        sansad_kshetra: sansad || null, vidhan_sabha: vidhan || null, ward_no: ward || null,
        password: password
      });
      setRegData(res.data);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to register. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted && regData) {
    return (
      <div className="flex flex-col h-full bg-white relative animate-fadeIn rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-[#0B1E3F] text-white p-4 flex items-center justify-between shrink-0 rounded-t-3xl">
          <button onClick={onBack} className="p-1.5 hover:bg-white/10 rounded-full transition"><ArrowLeft className="w-5 h-5"/></button>
          <div className="text-center">
            <h2 className="font-display font-black tracking-wider text-sm">Application Received</h2>
          </div>
          <div className="w-8"></div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="space-y-4 flex flex-col items-center pt-6 pb-2">
            <div className="w-16 h-16 bg-green-100 text-[#138808] rounded-full flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800 text-center leading-tight">Registration<br/>Successful!</h3>
            
            <div className="w-full bg-slate-800 text-white rounded-2xl p-4 shadow-xl border border-slate-700 relative overflow-hidden my-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-x-8 -translate-y-8"></div>
              
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Login Username (Mobile)</p>
              <p className="text-lg font-black text-[#FF9933] font-mono mb-4">{mobile}</p>

              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Registration No.</p>
              <p className="text-xs font-bold text-white font-mono tracking-wider">{regData.registration_number}</p>
            </div>
            
            <p className="text-xs font-bold text-slate-500 text-center px-4">Your application is now under review. You can log in using your Mobile Number and password.</p>

            <button onClick={() => onComplete(mobile, password)} className="w-full py-3.5 bg-[#000080] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow-lg mt-2 uppercase tracking-wider">
               Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative animate-fadeIn rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
      {/* Header */}
      <div className="bg-[#0B1E3F] text-white p-4 flex items-center justify-between shrink-0 rounded-t-3xl sticky top-0 z-10">
        <button onClick={onBack} className="p-1.5 hover:bg-white/10 rounded-full transition"><ArrowLeft className="w-5 h-5"/></button>
        <div className="text-center">
          <h2 className="font-display font-black tracking-wider text-sm">Volunteer Application</h2>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Body Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 pb-20">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 sticky top-0 z-10">
            <ShieldCheck className="w-4 h-4 shrink-0"/> {error}
          </div>
        )}

        {/* --- Personal Details --- */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2"><User className="w-4 h-4 text-[#0B1E3F]" /> Personal Details</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#FF9933] uppercase flex items-center gap-1.5"><Globe className="w-3 h-3"/> Citizenship / Country</label>
            <select value={countryIso} onChange={e=>handleCountryChange(e.target.value)} className="w-full p-2.5 border border-[#FF9933] rounded-lg text-xs font-black bg-orange-50 text-slate-800 outline-none shadow-inner">
              {countriesList.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
            <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" placeholder="E.g. Rahul Sharma" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Father/Husband</label>
              <input type="text" value={fatherName} onChange={e=>setFatherName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Mother Name</label>
              <input type="text" value={motherName} onChange={e=>setMotherName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Date of Birth</label>
              <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F] text-slate-700" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Age</label>
              <input type="text" value={age} disabled className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-black bg-slate-100 text-slate-500 outline-none" placeholder="Auto" />
            </div>
          </div>
        </section>

        {/* --- Contact & Identity --- */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2"><Phone className="w-4 h-4 text-[#0B1E3F]" /> Contact & Identity</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Mobile Number</label>
              <input type="tel" maxLength={15} value={mobile} onChange={e=>setMobile(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" placeholder="9876543210" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" placeholder="user@example.com" />
            </div>
          </div>
        </section>

        {/* --- Location & CRM --- */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2"><MapPin className="w-4 h-4 text-[#0B1E3F]" /> Location & Address</h3>
          
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-500 uppercase">GPS Location (Recommended)</label>
             <LocationPicker onLocationSelect={(loc) => {
               if(loc && loc !== "") {
                 // You could auto-fill or just attach to address
               }
             }} defaultLocation={""} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">State</label>
              <select value={stateIso} onChange={e=>setStateIso(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 text-slate-800 outline-none focus:border-[#0B1E3F]">
                <option value="">Select State</option>
                {statesList.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">City</label>
              <select value={city} onChange={e=>setCity(e.target.value)} disabled={!stateIso} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 text-slate-800 outline-none focus:border-[#0B1E3F] disabled:opacity-50">
                <option value="">Select City</option>
                {citiesList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Full Address</label>
            <textarea value={address} onChange={e=>setAddress(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F] min-h-[60px] resize-none" placeholder="House No, Street, Landmark..."></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Zip/Postal Code</label>
              <input type="text" maxLength={10} value={pincode} onChange={e=>setPincode(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" placeholder="Pincode" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Area/Locality</label>
              <input type="text" value={area} onChange={e=>setArea(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" placeholder="E.g. Bhopal" />
            </div>
          </div>

          {isIndia && (
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 animate-fadeIn grid grid-cols-3 gap-2 mt-2 shadow-inner">
              <div>
                <label className="text-[8px] text-slate-400 font-bold uppercase mb-0.5 block">Sansad Kshetra</label>
                <input type="text" value={sansad} onChange={e=>setSansad(e.target.value)} className="w-full bg-slate-700 text-[10px] text-white font-bold p-1.5 rounded outline-none border border-slate-600 focus:border-[#FF9933]" placeholder="Auto" />
              </div>
              <div>
                <label className="text-[8px] text-slate-400 font-bold uppercase mb-0.5 block">Vidhan Sabha</label>
                {isCustomVidhan ? (
                  <div className="flex gap-1">
                    <input 
                      type="text" 
                      value={vidhan} 
                      onChange={e => setVidhan(e.target.value)} 
                      className="flex-1 bg-slate-700 text-[10px] text-white font-bold p-1.5 rounded outline-none border border-slate-600 focus:border-[#FF9933]" 
                      placeholder="Type Constituency..." 
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setIsCustomVidhan(false);
                        setVidhan("");
                      }} 
                      className="bg-slate-600 hover:bg-slate-500 text-white text-[8px] font-bold px-1.5 py-1 rounded"
                    >
                      Reset
                    </button>
                  </div>
                ) : vidhanSabhas && vidhanSabhas.length > 0 ? (
                  <select 
                    value={vidhan} 
                    onChange={e => handleVidhanChange(e.target.value)} 
                    className="w-full bg-slate-700 text-[10px] text-white font-bold p-1.5 rounded outline-none border border-slate-600 focus:border-[#FF9933]"
                  >
                    <option value="">Select Assembly</option>
                    {vidhanSabhas.map(v => <option key={v} value={v}>{v}</option>)}
                    <option value="__custom__">✎ Other (Type manually)...</option>
                  </select>
                ) : (
                  <input type="text" value={vidhan} onChange={e=>setVidhan(e.target.value)} className="w-full bg-slate-700 text-[10px] text-white font-bold p-1.5 rounded outline-none border border-slate-600 focus:border-[#FF9933]" placeholder="Auto" />
                )}
              </div>
              <div>
                <label className="text-[8px] text-slate-400 font-bold uppercase mb-0.5 block">Ward No.</label>
                <input type="text" value={ward} onChange={e=>setWard(e.target.value)} className="w-full bg-slate-700 text-[10px] text-white font-bold p-1.5 rounded outline-none border border-slate-600 focus:border-[#FF9933]" placeholder="e.g. 42" />
              </div>
            </div>
          )}
        </section>

        {/* --- Setup Password & User ID --- */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2"><Lock className="w-4 h-4 text-[#0B1E3F]" /> Account Details</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">User ID</label>
            <div className="flex gap-2">
              <input type="text" value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} className="flex-1 p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" placeholder="e.g. john_doe" />
              <div className="w-12 flex items-center justify-center">
                {usernameStatus === 'checking' && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
                {usernameStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </div>
            {usernameStatus === 'available' && <p className="text-[10px] font-bold text-green-600">User ID is available!</p>}
            {usernameStatus === 'taken' && <p className="text-[10px] font-bold text-red-500">{usernameError}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Create Password</label>
              <span className={`text-[10px] font-bold ${getPasswordStrength().color}`}>{getPasswordStrength().label}</span>
            </div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" placeholder="At least 6 characters" />
          </div>
        </section>

        {/* --- Submission --- */}
        <section className="space-y-4">
          <label className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="mt-0.5 accent-[#138808] w-4 h-4" />
            <span className="text-[9px] font-bold text-slate-600 leading-tight">
              I hereby declare that all information provided is true and correct. I accept the Terms & Conditions.
            </span>
          </label>

          <button disabled={!agreed || loading || !password} onClick={submitForm} className="w-full py-4 bg-gradient-to-r from-[#138808] to-green-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg shadow-green-900/20 uppercase tracking-widest relative group">
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Submit Application"}
          </button>
          {(!agreed || !password) && (
            <p className="text-center text-xs text-orange-600 mt-2 font-medium">
              * Please set a password and agree to the terms to submit.
            </p>
          )}
        </section>

      </div>
    </div>
  );
}
