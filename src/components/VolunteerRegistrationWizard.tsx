import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Mail, Phone, MapPin, User, FileText, Loader2, Globe } from "lucide-react";
import axios from "axios";
import { Country, State, City } from "country-state-city";

// Mock Data for CRM Locality Auto-fill in India
const CRM_MAPPING = {
  "Bhopal": {
    "Arera Colony": { sansad: "Bhopal (Alok Sharma)", vidhan: "Bhopal South-West", ward: "Ward 45" },
    "Kolar Road": { sansad: "Bhopal (Alok Sharma)", vidhan: "Huzur", ward: "Ward 80" },
    "Bairagarh": { sansad: "Bhopal (Alok Sharma)", vidhan: "Huzur", ward: "Ward 1" },
    "MP Nagar": { sansad: "Bhopal (Alok Sharma)", vidhan: "Bhopal Central", ward: "Ward 47" },
    "Govindpura": { sansad: "Bhopal (Alok Sharma)", vidhan: "Govindpura", ward: "Ward 55" }
  },
  "Indore": {
    "Vijay Nagar": { sansad: "Indore (Shankar Lalwani)", vidhan: "Indore-2", ward: "Ward 35" },
    "Palasia": { sansad: "Indore (Shankar Lalwani)", vidhan: "Indore-5", ward: "Ward 43" }
  }
};

interface VolunteerRegistrationWizardProps {
  onBack: () => void;
  onComplete: (username: string, pass: string) => void;
}

export default function VolunteerRegistrationWizard({ onBack, onComplete }: VolunteerRegistrationWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global State for Country so Step 3 can react to it
  // We ask for Country in Step 1 to make Step 3 dynamic properly without confusion
  const [countryIso, setCountryIso] = useState("IN");
  
  // Step 1: Personal
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

  // Step 2: Contact
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // Step 3: Identity & Profile
  const [education, setEducation] = useState<string[]>([]);
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [skills, setSkills] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [availability, setAvailability] = useState("Weekends");
  
  // Dynamic Identity Fields
  const [nationalId1, setNationalId1] = useState(""); // Aadhaar or National ID
  const [nationalId2, setNationalId2] = useState(""); // Voter ID or Passport

  const toggleArray = (arr: string[], setArr: any, val: string) => {
    if (arr.includes(val)) setArr(arr.filter(a => a !== val));
    else setArr([...arr, val]);
  };

  // Step 4: Location & CRM
  const [stateIso, setStateIso] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState(""); // For generic or dropdown
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  
  // Auto-filled CRM Fields (India Only)
  const [sansad, setSansad] = useState("");
  const [vidhan, setVidhan] = useState("");
  const [ward, setWard] = useState("");

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
    setArea(loc.vidhan_sabha);
    setSansad(loc.sansad_kshetra);
    setVidhan(loc.vidhan_sabha);
    setShowSuggestions(false);
  };

  // Handle Country Change gracefully
  const handleCountryChange = (iso: string) => {
    setCountryIso(iso);
    setStateIso("");
    setCity("");
    setArea("");
    setNationalId1("");
    setNationalId2("");
  };

  // Step 5: Submission
  const [agreed, setAgreed] = useState(false);
  
  // Post-Registration
  const [regData, setRegData] = useState<any>(null);
  const [password, setPassword] = useState("");

  const submitForm = async () => {
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
        sansad_kshetra: sansad || null, vidhan_sabha: vidhan || null, ward_no: ward || null
      });
      setRegData(res.data);
      setStep(6);
    } catch (err: any) {
      setError("Failed to register. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const setSecurePassword = async () => {
    setLoading(true); setError(null);
    try {
      await axios.post("/api/auth/set-password", { username: regData.username, password });
      onComplete(regData.username, password);
    } catch (err: any) {
      setError("Failed to set password.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-full bg-white relative animate-fadeIn rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
      {/* Header */}
      <div className="bg-[#0B1E3F] text-white p-4 flex items-center justify-between shrink-0 rounded-t-3xl">
        <button onClick={onBack} className="p-1.5 hover:bg-white/10 rounded-full transition"><ArrowLeft className="w-5 h-5"/></button>
        <div className="text-center">
          <h2 className="font-display font-black tracking-wider text-sm">Volunteer Application</h2>
          <p className="text-[9px] text-[#FF9933] uppercase font-bold tracking-widest">{step <= 5 ? "Step " + step + " of 5" : 'Complete'}</p>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Progress Bar */}
      {step <= 5 && (
        <div className="h-1.5 w-full bg-slate-100 flex">
          <div className="h-full bg-gradient-to-r from-[#FF9933] to-[#138808] transition-all duration-500 ease-out" style={{ width: ((step / 5) * 100) + "%" }}></div>
        </div>
      )}

      {/* Body Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0"/> {error}
          </div>
        )}

        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2"><User className="w-4 h-4 text-[#0B1E3F]" /> Personal Details</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#FF9933] uppercase flex items-center gap-1.5"><Globe className="w-3 h-3"/> Citizenship / Country</label>
              <select value={countryIso} onChange={e=>handleCountryChange(e.target.value)} className="w-full p-2.5 border border-[#FF9933] rounded-lg text-xs font-black bg-orange-50 text-slate-800 outline-none shadow-inner">
                {countriesList.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
              </select>
              <p className="text-[8px] text-slate-400 font-bold uppercase leading-tight mt-0.5">Note: Identity documents requested in Step 3 will depend on your country.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
              <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" placeholder="E.g. Rahul Sharma" />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Father/Husband Name</label>
              <input type="text" value={fatherName} onChange={e=>setFatherName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Mother Name</label>
              <input type="text" value={motherName} onChange={e=>setMotherName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Date of Birth</label>
                <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Age (Auto)</label>
                <input type="text" value={age} disabled className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-100 text-slate-400" placeholder="0 yrs" />
              </div>
            </div>

            <button disabled={!fullName || !dob || !countryIso} onClick={()=>setStep(2)} className="w-full mt-4 py-3 bg-[#0B1E3F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition">Next <ArrowRight className="w-4 h-4"/></button>
          </div>
        )}

        {/* Step 2: Contact & Dual Verification */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2"><Phone className="w-4 h-4 text-[#FF9933]" /> Contact & Security</h3>
            <p className="text-[10px] font-bold text-slate-400 leading-tight">Verify both Mobile and Email to proceed. This ensures full access to your digital profile.</p>

            {/* Mobile Block */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1.5"><Phone className="w-3 h-3 text-[#FF9933]"/> Mobile No.</label>
              </div>
              <div className="flex gap-2">
                <input type="tel" value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g, '').slice(0, 15))} className="flex-1 p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none" placeholder={isIndia ? "10-digit number" : "Mobile Number"} />
              </div>
            </div>

            {/* Email Block */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1.5"><Mail className="w-3 h-3 text-[#138808]"/> Email ID</label>
              </div>
              <div className="flex gap-2">
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="flex-1 p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none" placeholder="name@example.com" />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={()=>setStep(1)} className="p-3 bg-slate-100 text-slate-600 rounded-xl transition hover:bg-slate-200"><ArrowLeft className="w-4 h-4"/></button>
              <button disabled={mobile.length < 8 || !email.includes('@')} onClick={()=>setStep(3)} className="flex-1 py-3 bg-[#0B1E3F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition">Next <ArrowRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}

        {/* Step 3: Identity & Profile */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2"><FileText className="w-4 h-4 text-[#000080]" /> Identity & Profile</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Education Qualification (Select Multiple)</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["10th", "12th", "Graduate", "Post-Graduate", "Diploma"].map(eq => (
                  <button key={eq} onClick={()=>toggleArray(education, setEducation, eq)} className={"px-2 py-1 text-[10px] font-bold rounded-md border " + (education.includes(eq) ? 'bg-[#000080] text-white border-[#000080]' : 'bg-white text-slate-600 border-slate-200')}>{eq}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Blood Group</label>
                <select value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none">
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Availability</label>
                <select value={availability} onChange={e=>setAvailability(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none">
                  <option>Weekends</option><option>Weekdays</option><option>Anytime (Emergency)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Skills & Interests</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Medical", "Teaching", "IT/Tech", "Social Work", "Management"].map(sk => (
                  <button key={sk} onClick={()=>toggleArray(skills, setSkills, sk)} className={"px-2 py-1 text-[10px] font-bold rounded-md border " + (skills.includes(sk) ? 'bg-[#138808] text-white border-[#138808]' : 'bg-white text-slate-600 border-slate-200')}>{sk}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">{isIndia ? "Aadhaar Number" : "National ID"}</label>
                <input type="text" maxLength={25} value={nationalId1} onChange={e=>setNationalId1(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#000080]" placeholder={isIndia ? "12 Digits" : "ID Number"} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">{isIndia ? "Voter ID" : "Passport Number"}</label>
                <input type="text" maxLength={25} value={nationalId2} onChange={e=>setNationalId2(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#000080]" placeholder={isIndia ? "ABC1234567" : "Optional"} />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={()=>setStep(2)} className="p-3 bg-slate-100 text-slate-600 rounded-xl transition hover:bg-slate-200"><ArrowLeft className="w-4 h-4"/></button>
              <button disabled={education.length===0 || !nationalId1} onClick={()=>setStep(4)} className="flex-1 py-3 bg-[#0B1E3F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition">Next <ArrowRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}

        {/* Step 4: Location & CRM Automation */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2"><MapPin className="w-4 h-4 text-red-500" /> Location & Automation</h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">State/Province</label>
                  <select value={stateIso} onChange={e=>{setStateIso(e.target.value); setCity(""); setArea("");}} className="w-full p-2 border border-slate-200 rounded-lg text-[10px] font-bold bg-white outline-none">
                    <option value="">Select State...</option>
                    {statesList.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">City</label>
                  <select value={city} onChange={e=>{setCity(e.target.value); setArea("");}} disabled={!stateIso} className="w-full p-2 border border-slate-200 rounded-lg text-[10px] font-bold bg-white outline-none disabled:bg-slate-100">
                    <option value="">Select City...</option>
                    {citiesList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Street Address / House No.</label>
                <input type="text" value={address} onChange={e=>setAddress(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" placeholder="E.g. Flat 101, Om Sai Appt" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Zip/Postal Code</label>
                  <input type="text" maxLength={10} value={pincode} onChange={e=>setPincode(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none focus:border-[#0B1E3F]" />
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
                            <p className="text-xs font-black text-slate-800">{loc.vidhan_sabha} <span className="text-[10px] text-slate-500 font-normal">({loc.district})</span></p>
                            <p className="text-[9px] font-bold text-[#FF9933] uppercase mt-0.5">Sansad: {loc.sansad_kshetra}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-xs text-slate-500 text-center">No locations found. You can type manually.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Smart CRM Mapping Result (Only for India) */}
            {isIndia && (
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 animate-fadeIn grid grid-cols-3 gap-2 mt-2 shadow-inner">
                <div>
                  <label className="text-[8px] text-slate-400 font-bold uppercase mb-0.5 block">Sansad Kshetra</label>
                  <input type="text" value={sansad} onChange={e=>setSansad(e.target.value)} className="w-full bg-slate-700 text-[10px] text-white font-bold p-1.5 rounded outline-none border border-slate-600 focus:border-[#FF9933]" placeholder="Manual entry" />
                </div>
                <div>
                  <label className="text-[8px] text-slate-400 font-bold uppercase mb-0.5 block">Vidhan Sabha</label>
                  <input type="text" value={vidhan} onChange={e=>setVidhan(e.target.value)} className="w-full bg-slate-700 text-[10px] text-white font-bold p-1.5 rounded outline-none border border-slate-600 focus:border-[#FF9933]" placeholder="Manual entry" />
                </div>
                <div>
                  <label className="text-[8px] text-slate-400 font-bold uppercase mb-0.5 block">Ward No.</label>
                  <input type="text" value={ward} onChange={e=>setWard(e.target.value)} className="w-full bg-slate-700 text-[10px] text-white font-bold p-1.5 rounded outline-none border border-slate-600 focus:border-[#FF9933]" placeholder="e.g. 42" />
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={()=>setStep(3)} className="p-3 bg-slate-100 text-slate-600 rounded-xl transition hover:bg-slate-200"><ArrowLeft className="w-4 h-4"/></button>
              <button disabled={!stateIso || !city || !address || !pincode || !area} onClick={()=>setStep(5)} className="flex-1 py-3 bg-[#0B1E3F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition">Next <ArrowRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}

        {/* Step 5: Submission */}
        {step === 5 && (
          <div className="space-y-4 animate-fadeIn flex flex-col items-center justify-center h-full pt-10">
            <div className="w-16 h-16 bg-blue-50 text-[#000080] rounded-full flex items-center justify-center mb-2 shadow-inner border border-blue-100">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-800 text-center">Ready to Submit</h3>
            <p className="text-[10px] font-bold text-slate-500 text-center px-4 leading-relaxed">
              By submitting, you agree to become a volunteer for the RP Foundation and adhere to our strict data privacy and community service guidelines.
            </p>

            <label className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="mt-0.5 accent-[#138808] w-4 h-4" />
              <span className="text-[9px] font-bold text-slate-600 leading-tight">
                I hereby declare that all information provided is true and correct. I accept the Terms & Conditions.
              </span>
            </label>

            <div className="flex gap-2 w-full mt-6">
              <button disabled={loading} onClick={()=>setStep(4)} className="p-3 bg-slate-100 text-slate-600 rounded-xl transition hover:bg-slate-200"><ArrowLeft className="w-4 h-4"/></button>
              <button disabled={!agreed || loading} onClick={submitForm} className="flex-1 py-3 bg-gradient-to-r from-[#138808] to-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg shadow-green-900/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Submit Application"}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Success & Set Password */}
        {step === 6 && regData && (
          <div className="space-y-4 animate-fadeIn flex flex-col items-center pt-6 pb-2">
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

            <div className="w-full space-y-2 pt-2">
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center mb-3 border-b border-slate-100 pb-2">Final Step: Secure Your Account</h4>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Create Password</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-xs font-black bg-slate-50 outline-none focus:border-[#000080]" placeholder="••••••••" />
              </div>
              <button disabled={password.length < 6 || loading} onClick={setSecurePassword} className="w-full py-3.5 bg-[#000080] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg mt-2 uppercase tracking-wider">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Set Password & Login"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
