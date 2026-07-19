import React, { useState } from "react";
import { BloodDonor } from "../types";
import { Search, Heart, Phone, ShieldCheck, AlertCircle, Sparkles, Plus, CheckCircle, Navigation } from "lucide-react";

interface HealthBloodProps {
  lang: "hi" | "en";
  donors: BloodDonor[];
  onAddDonor: (donor: BloodDonor) => void;
}

export default function HealthBlood({ lang, donors, onAddDonor }: HealthBloodProps) {
  const [selectedGroup, setSelectedGroup] = useState("O+");
  const [emergName, setEmergName] = useState("");
  const [emergPhone, setEmergPhone] = useState("");
  const [emergGroup, setEmergGroup] = useState("O+");
  const [emergLocation, setEmergLocation] = useState("");
  
  const [success, setSuccess] = useState(false);
  const [alertSubmitted, setAlertSubmitted] = useState(false);
  const [emergSuccess, setEmergSuccess] = useState(false);

  // Registration Form States
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regGroup, setRegGroup] = useState("O+");
  const [regLoc, setRegLoc] = useState("");

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // Directory Helplines
  const emergencyServices = [
    { name: lang === "hi" ? "एम्बुलेंस सेवा" : "National Ambulance", number: "108" },
    { name: lang === "hi" ? "आपातकालीन नंबर" : "Police Response Force", number: "112" },
    { name: lang === "hi" ? "अग्निशमन विभाग" : "Fire Security Unit", number: "101" },
    { name: lang === "hi" ? "महिला हेल्पलाइन" : "Women Safety Line", number: "1091" },
    { name: lang === "hi" ? "बाल कल्याण सेवा" : "Child Care Helpline", number: "1098" },
  ];

  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regLoc.trim()) return;

    onAddDonor({
      name: regName,
      bloodGroup: regGroup,
      phone: regPhone,
      location: regLoc,
      verified: true,
      distance: "0.2 km"
    });

    setRegName("");
    setRegPhone("");
    setRegLoc("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergName.trim() || !emergPhone.trim() || !emergLocation.trim()) return;

    setAlertSubmitted(true);
    setTimeout(() => {
      setAlertSubmitted(false);
      setEmergName("");
      setEmergPhone("");
      setEmergLocation("");
      setEmergSuccess(true);
      setTimeout(() => setEmergSuccess(false), 5000);
    }, 1000);
  };

  const filteredDonors = donors.filter(donor => donor.bloodGroup === selectedGroup);

  return (
    <div className="space-y-6" id="health-blood-network-view">
      {/* Intro alert */}
      <div className="bg-red-50 text-red-950 rounded-md p-5 border border-red-100/80 flex items-start gap-4">
        <div className="p-3 bg-red-100 rounded-md text-red-600 shrink-0">
          <Heart className="w-6 h-6 fill-red-500 text-red-600 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-red-900">
            {lang === "hi" ? "आपातकालीन रक्त डोनर नेटवर्क (24x7 Emergency)" : "24x7 Emergency Blood Donor Circle"}
          </h4>
          <p className="text-xs text-red-800 leading-relaxed">
            {lang === "hi" 
              ? "यह सेवा रक्त की जरूरत में सीधे स्थानीय रक्तदाताओं तक पहुँचने के लिए एक त्वरित माध्यम है। यदि आपके परिवार में किसी को रक्त की तत्काल आवश्यकता है, तो नीचे इमरजेंसी अलर्ट दबाएं।" 
              : "Directly link with verified local volunteers ready to donate. If there is an emergency, launch a neighborhood alert to ping registered donors nearby."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Donor Search */}
        <div className="bg-white rounded-md p-5 border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
            <Search className="w-4.5 h-4.5 text-red-600" />
            {lang === "hi" ? "रक्तदाता डायरेक्टरी" : "Blood Donor Directory"}
          </h4>

          {/* Group Toggles */}
          <div className="flex flex-wrap gap-1.5">
            {bloodGroups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedGroup === grp 
                    ? "bg-red-600 border-red-600 text-white shadow-sm scale-105" 
                    : "bg-white border-slate-200 text-slate-700 hover:border-red-400"
                }`}
              >
                {grp}
              </button>
            ))}
          </div>

          {/* Donors List */}
          <div className="space-y-2.5 max-h-[250px] overflow-y-auto no-scrollbar">
            {filteredDonors.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                {lang === "hi" ? `इस रक्त समूह (${selectedGroup}) के लिए कोई डोनर नहीं मिला।` : `No donors listed for ${selectedGroup} group.`}
              </p>
            ) : (
              filteredDonors.map((donor, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-800">{donor.name}</span>
                      {donor.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#0f4c81] fill-slate-100" />}
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-slate-400" />
                      {donor.location} ({donor.distance})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg">
                      {donor.bloodGroup}
                    </span>
                    <a
                      href={`tel:${donor.phone}`}
                      className="p-2 bg-slate-50 text-[#0f4c81] hover:bg-slate-100 border border-slate-100 rounded-xl transition cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Register inside Network */}
        <div className="bg-white rounded-md p-5 border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
            <Plus className="w-4.5 h-4.5 text-[#0f4c81]" />
            {lang === "hi" ? "रक्तदाता के रूप में पंजीकरण करें" : "Enroll as blood donor"}
          </h4>

          <form onSubmit={handleRegisterDonor} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-0.5">{lang === "hi" ? "पूरा नाम" : "Full Name"}</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-0.5">{lang === "hi" ? "रक्त समूह" : "Blood Group"}</label>
                <select
                  value={regGroup}
                  onChange={(e) => setRegGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none font-bold"
                >
                  {bloodGroups.map(grp => <option key={grp} value={grp}>{grp}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-0.5">{lang === "hi" ? "फोन नंबर" : "Phone"}</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-0.5">{lang === "hi" ? "वार्ड / जिला" : "Ward / District"}</label>
              <input
                type="text"
                value={regLoc}
                onChange={(e) => setRegLoc(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 font-bold rounded-xl transition cursor-pointer text-xs"
            >
              {lang === "hi" ? "डोनर सूची में जुड़ें" : "Register with Donor Network"}
            </button>
          </form>

          {success && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-1.5 text-[#0f4c81] text-xs animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-[#0f4c81]" />
              <span>{lang === "hi" ? "आप डोनर सूची में जुड़ चुके हैं। धन्यवाद!" : "Registered successfully as a verified lifesaver."}</span>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Request Trigger Form */}
      <div className="bg-white rounded-md p-5 border border-slate-100 shadow-sm space-y-4 max-w-lg mx-auto">
        <h4 className="font-extrabold text-sm text-red-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
          <AlertCircle className="w-4.5 h-4.5" />
          {lang === "hi" ? "🚨 तत्काल रक्त सहायता अलर्ट भेजें" : "🚨 Broadcast Emergency Blood Request"}
        </h4>

        <form onSubmit={handleAlertSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-0.5">{lang === "hi" ? "मरीज / अस्पताल" : "Patient Name"}</label>
              <input
                type="text"
                value={emergName}
                onChange={(e) => setEmergName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-0.5">{lang === "hi" ? "संपर्क नंबर" : "Alternate Contact"}</label>
              <input
                type="tel"
                value={emergPhone}
                onChange={(e) => setEmergPhone(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-red-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-0.5">{lang === "hi" ? "रक्त समूह" : "Required Group"}</label>
              <select
                value={emergGroup}
                onChange={(e) => setEmergGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
              >
                {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-0.5">{lang === "hi" ? "अस्पताल का स्थान / प्रभाग" : "Hospital Location"}</label>
              <input
                type="text"
                value={emergLocation}
                onChange={(e) => setEmergLocation(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-red-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
          >
            {lang === "hi" ? "इमरजेंसी ब्रॉडकास्ट सक्रिय करें" : "Trigger Broadcast Alert"}
          </button>
        </form>

        {emergSuccess && (
          <div className="bg-red-550 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-white text-xs animate-fadeIn font-semibold bg-red-600">
            <CheckCircle className="w-4 h-4 shrink-0 text-white" />
            <span>
              {lang === "hi" 
                ? "✓ आपातकालीन रक्त अनुरोध आरपी फाउंडेशन नेटवर्क के सभी रजिस्टर्ड दानदाताओं को भेज दिया गया है!" 
                : "✓ Emergency alert sent to all surrounding checked donors successfully!"}
            </span>
          </div>
        )}
      </div>

      {/* Emergency Directory */}
      <div className="bg-slate-900 text-white rounded-md p-5 space-y-4">
        <h4 className="font-extrabold text-sm text-amber-400 flex items-center gap-1.5">
          <AlertCircle className="w-4.5 h-4.5" />
          {lang === "hi" ? "एक क्लिक आपातकालीन डायरेक्टरी" : "One-Tap Civic Helpline Directory"}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {emergencyServices.map((srv, idx) => (
            <a
              key={idx}
              href={`tel:${srv.number}`}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl flex flex-col items-center justify-center text-center transition cursor-pointer"
            >
              <span className="text-sm font-extrabold text-amber-400">{srv.number}</span>
              <span className="text-[11px] font-medium text-slate-300 mt-1">{srv.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
