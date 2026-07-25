import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck, Globe, Loader2, User, Phone, MapPin, FileText, Lock } from "lucide-react";
import axios from "axios";
import { Country, State, City } from "country-state-city";

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
  const [ward, setWard] = useState("");

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
              setAreaSuggestions(data.areas);
              setShowSuggestions(true);
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

  // CRM Search States
  const [areaSuggestions, setAreaSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimer, setSearchTimer] = useState<any>(null);
  const [isSearchingArea, setIsSearchingArea] = useState(false);

  // Debounced Search function
  const searchArea = (query: string) => {
    setArea(query);
    setShowSuggestions(true);
    if (query.length < 2) {
      setAreaSuggestions([]);
      return;
    }
    if (searchTimer) clearTimeout(searchTimer);
    setIsSearchingArea(true);
    setSearchTimer(setTimeout(async () => {
      try {
        const res = await axios.get(`/api/locations/search?q=${encodeURIComponent(query)}`);
        setAreaSuggestions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingArea(false);
      }
    }, 400));
  };

  const handleSelectArea = (loc: any) => {
    if (typeof loc === "string") {
      setArea(loc);
    } else {
      setArea(loc.vidhan_sabha);
      setSansad(loc.sansad_kshetra);
      setVidhan(loc.vidhan_sabha);
    }
    setShowSuggestions(false);
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
      setError("Failed to register. Please check all fields.");
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
              
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Generated Username</p>
              <p className="text-lg font-black text-[#FF9933] font-mono mb-4">{regData.username}</p>

              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Registration No.</p>
              <p className="text-xs font-bold text-white font-mono tracking-wider">{regData.registration_number}</p>
            </div>
            
            <p className="text-xs font-bold text-slate-500 text-center px-4">Your application is now under review. You can log in using your username and password.</p>

            <button onClick={() => onComplete(regData.username, password)} className="w-full py-3.5 bg-[#000080] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow-lg mt-2 uppercase tracking-wider">
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

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">{isIndia ? "Aadhaar Number" : "National ID Number"}</label>
            <input type="text" value={nationalId1} onChange={e=>setNationalId1(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F] tracking-widest" placeholder={isIndia ? "XXXX-XXXX-XXXX" : "ID Number"} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">{isIndia ? "Voter ID (Optional)" : "Secondary ID (Optional)"}</label>
            <input type="text" value={nationalId2} onChange={e=>setNationalId2(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F] tracking-widest" placeholder={isIndia ? "ABC1234567" : "ID Number"} />
          </div>
        </section>

        {/* --- Location & CRM --- */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2"><MapPin className="w-4 h-4 text-[#0B1E3F]" /> Location & Address</h3>
          
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
            <div className="space-y-1 relative">
              <label className={"text-[10px] font-bold uppercase " + (isIndia ? "text-[#FF9933]" : "text-slate-500")}>{isIndia ? "Area Search (Auto-fetch CRM)" : "Area/Locality"}</label>
              <input type="text" value={area} onChange={e=>isIndia ? searchArea(e.target.value) : setArea(e.target.value)} onFocus={() => isIndia && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" placeholder="E.g. Bhopal" />
              
              {isIndia && showSuggestions && area.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {isSearchingArea ? (
                    <div className="p-3 text-xs text-slate-500 text-center flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                    </div>
                  ) : areaSuggestions.length > 0 ? (
                    areaSuggestions.map((loc, idx) => (
                      <div key={idx} onClick={() => handleSelectArea(loc)} className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                        {typeof loc === "string" ? (
                          <p className="text-xs font-black text-slate-800">{loc}</p>
                        ) : (
                          <>
                            <p className="text-xs font-black text-slate-800">{loc.vidhan_sabha} <span className="text-[10px] text-slate-500 font-normal">({loc.district})</span></p>
                            <p className="text-[9px] font-bold text-[#FF9933] uppercase mt-0.5">Sansad: {loc.sansad_kshetra}</p>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-500 text-center">No locations found.</div>
                  )}
                </div>
              )}
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
                {vidhanSabhas && vidhanSabhas.length > 0 ? (
                  <select 
                    value={vidhan} 
                    onChange={e => setVidhan(e.target.value)} 
                    className="w-full bg-slate-700 text-[10px] text-white font-bold p-1.5 rounded outline-none border border-slate-600 focus:border-[#FF9933]"
                  >
                    <option value="">Select Assembly</option>
                    {vidhanSabhas.map(v => <option key={v} value={v}>{v}</option>)}
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

        {/* --- Setup Password --- */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2"><Lock className="w-4 h-4 text-[#0B1E3F]" /> Security</h3>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Create Password</label>
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

          <button disabled={!agreed || loading || !password} onClick={submitForm} className="w-full py-4 bg-gradient-to-r from-[#138808] to-green-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg shadow-green-900/20 uppercase tracking-widest">
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Submit Application"}
          </button>
        </section>

      </div>
    </div>
  );
}
