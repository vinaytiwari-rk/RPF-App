import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Heart, Activity, UploadCloud, CheckCircle, ArrowLeft, Info, Calendar, MapPin, Check } from "lucide-react";

interface Dispensary {
  id: string;
  nameEn: string;
  nameHi: string;
  locEn: string;
  locHi: string;
  timingEn: string;
  timingHi: string;
}

const DISPENSARIES: Dispensary[] = [
  {
    id: "1",
    nameEn: "Bhopal Civic Dispensary Center",
    nameHi: "सीहोर नागरिक औषधालय केंद्र",
    locEn: "District Hospital campus, Bhopal",
    locHi: "जिला अस्पताल परिसर, सीहोर",
    timingEn: "10:00 AM - 1:00 PM (Mon-Sat)",
    timingHi: "सुबह 10:00 से दोपहर 1:00 बजे (सोम-शनि)"
  },
  {
    id: "2",
    nameEn: "People's Hospital Medical Aid Desk",
    nameHi: "पीपुल्स अस्पताल चिकित्सा सहायता डेस्क",
    locEn: "Karond Bypass road, Bhopal",
    locHi: "करौंद बाईपास रोड, भोपाल",
    timingEn: "9:00 AM - 5:00 PM (Daily)",
    timingHi: "सुबह 9:00 से शाम 5:00 बजे (सोम-रविवार)"
  }
];

export default function MedicineSupport() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"presc" | "equip">("presc");
  
  // Prescription form states
  const [patientName, setPatientName] = useState("");
  const [hospital, setHospital] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Equipment selection states
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [equipSuccess, setEquipSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handlePrescSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !hospital) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPatientName("");
        setHospital("");
        setFileName(null);
      }, 3000);
    }, 1500);
  };

  const handleEquipToggle = (item: string) => {
    if (equipmentList.includes(item)) {
      setEquipmentList(prev => prev.filter(i => i !== item));
    } else {
      setEquipmentList(prev => [...prev, item]);
    }
  };

  const handleEquipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (equipmentList.length === 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setEquipSuccess(true);
      setTimeout(() => {
        setEquipSuccess(false);
        setEquipmentList([]);
      }, 3050);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn max-w-md mx-auto">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-red-600 to-rose-650 pt-6 pb-6 px-5 relative overflow-hidden shrink-0 text-white shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-xl tracking-wide">
              {lang === "hi" ? "दवा व उपकरण सहायता" : "Medicine & Medical Aid"}
            </h2>
            <p className="text-xs text-red-100 mt-0.5">
              {lang === "hi" ? "मुफ़्त दवाएं, व्हीलचेयर और ऑक्सीजन किट" : "Request free essential medicine kits & diagnostic equipment"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm shrink-0">
        <button 
          onClick={() => setActiveTab("presc")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "presc" ? "border-red-650 text-red-650" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "दवा सहायता" : "Get Free Medicines"}
        </button>
        <button 
          onClick={() => setActiveTab("equip")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "equip" ? "border-red-650 text-red-650" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "उपकरण सहायता" : "Request Equipment"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {activeTab === "presc" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
              <h4 className="font-display font-extrabold text-xs text-slate-850 uppercase tracking-widest border-b border-slate-100 pb-2">
                {lang === "hi" ? "मुफ़्त औषधि किट आवेदन" : "Prescription Uploader for Medicines"}
              </h4>

              {success ? (
                <div className="bg-green-50 border border-green-150 rounded-2xl p-5 text-center space-y-2 py-8 animate-fadeIn">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <h5 className="font-display font-extrabold text-green-905 text-sm">
                    {lang === "hi" ? "दवा अनुरोध स्वीकृत!" : "Prescription Approved!"}
                  </h5>
                  <p className="text-xs text-green-700/80 leading-relaxed">
                    {lang === "hi" 
                      ? "आपके पर्चे की समीक्षा पूरी हो गई है। नीचे दिए गए औषधालय से अपना जन सेवा कार्ड दिखाकर दवा किट प्राप्त करें।"
                      : "Prescription verification complete. Present your Jan Seva Card at our partner dispensary to claim the medicine kit."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePrescSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Patient Name / मरीज़ का नाम</label>
                    <input 
                      type="text" 
                      required 
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar" 
                      className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Hospital or Clinic / अस्पताल</label>
                    <input 
                      type="text" 
                      required 
                      value={hospital}
                      onChange={e => setHospital(e.target.value)}
                      placeholder="e.g. District Hospital, Bhopal" 
                      className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-red-500" 
                    />
                  </div>

                  <div className="relative">
                    <input 
                      type="file" 
                      id="presc-upload" 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileUpload} 
                    />
                    <label 
                      htmlFor="presc-upload" 
                      className="border border-dashed border-slate-350 bg-slate-50/50 p-4.5 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition"
                    >
                      {fileName ? (
                        <div className="text-center space-y-0.5">
                          <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                          <span className="text-[10.5px] font-extrabold text-slate-800 block">Prescription Attached</span>
                          <span className="text-[9.5px] font-mono text-slate-450">{fileName}</span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-[#000080] mb-1.5" />
                          <span className="text-[10.5px] font-black text-slate-700">Upload Doctor Prescription (PDF/Image)</span>
                          <span className="text-[9px] text-slate-400 mt-0.5">Max size: 2MB</span>
                        </>
                      )}
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-[#000080] hover:bg-indigo-950 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
                  >
                    {submitting ? "Uploading Prescription..." : "Verify Prescription & Generate Code"}
                  </button>
                </form>
              )}
            </div>

            {/* Dispensaries List */}
            <div className="space-y-3">
              <h4 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-widest px-1">
                {lang === "hi" ? "संबद्ध औषधालय (Claim Centers)" : "Medicine Collection Points"}
              </h4>
              {DISPENSARIES.map(disp => (
                <div 
                  key={disp.id}
                  className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2"
                >
                  <h5 className="font-bold text-xs text-slate-850">{lang === "hi" ? disp.nameHi : disp.nameEn}</h5>
                  <div className="space-y-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {lang === "hi" ? disp.locHi : disp.locEn}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {lang === "hi" ? disp.timingHi : disp.timingEn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "equip" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
              <h4 className="font-display font-extrabold text-xs text-slate-850 uppercase tracking-widest border-b border-slate-100 pb-2">
                {lang === "hi" ? "चिकित्सा उपकरण सहायता आवेदन" : "Request Medical Equipment"}
              </h4>

              {equipSuccess ? (
                <div className="bg-green-50 border border-green-150 rounded-2xl p-5 text-center space-y-2 py-8 animate-fadeIn">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <h5 className="font-display font-extrabold text-green-905 text-sm">
                    {lang === "hi" ? "उपकरण अनुरोध दर्ज हुआ!" : "Equipment Request Registered!"}
                  </h5>
                  <p className="text-xs text-green-700/80 leading-relaxed">
                    {lang === "hi" 
                      ? "आपके उपकरण के आवंटन की प्रक्रिया शुरू हो गई है। शिविर संयोजक २-३ दिनों में उपलब्धता के अनुसार आपको सूचित करेंगे।"
                      : "Medical equipment allocation processed. The camp coordinator will call you regarding availability details."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEquipSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 font-semibold mb-1">
                    {lang === "hi" ? "आवश्यकता श्रेणी चुनें (बहुचेयन करें):" : "Choose the equipment required:"}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {["Wheelchair / व्हीलचेयर", "Oxygen Cylinder", "Crutches / बैसाखी", "Clinical Glucometer"].map(item => {
                      const selected = equipmentList.includes(item);
                      return (
                        <div 
                          key={item}
                          onClick={() => handleEquipToggle(item)}
                          className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                            selected 
                              ? "border-red-650 bg-red-50/50 text-red-750" 
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <span className="text-[10px] font-bold">{item}</span>
                          {selected && <Check className="w-3.5 h-3.5 text-red-650" />}
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    type="submit" 
                    disabled={equipmentList.length === 0 || submitting}
                    className="w-full bg-[#000080] hover:bg-indigo-950 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
                  >
                    {submitting ? "Registering request..." : "Apply Free Medical Equipment"}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-blue-50/80 border border-blue-150 rounded-2xl p-4 flex gap-3 text-blue-900 shadow-inner">
              <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-black uppercase tracking-wider block">Welfare Note</span>
                <p className="text-[10px] leading-relaxed opacity-90 font-medium">
                  {lang === "hi"
                    ? "सभी उपकरण पूरी तरह निःशुल्क और जरूरतमंदों की सेवा के लिए हैं। जन सेवा कार्ड धारकों को आवंटन में वरीयता दी जाती है।"
                    : "Welfare equipment allocation operates strictly on a needs-basis. Digital Jan Seva Card active holders receive priority tags."}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
