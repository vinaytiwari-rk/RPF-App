import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, CheckCircle, ArrowLeft, Info, Calendar, MapPin, Check, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function EducationSupport() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"books" | "tutoring">("books");
  
  // Book form states
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("Class 8");
  const [board, setBoard] = useState("MP Board");
  const [itemsList, setItemsList] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Tutoring states
  const [subject, setSubject] = useState("Mathematics");
  const [tutorGrade, setTutorGrade] = useState("");
  const [tutorAddress, setTutorAddress] = useState("");
  const [tutorSuccess, setTutorSuccess] = useState(false);

  const handleItemToggle = (item: string) => {
    if (itemsList.includes(item)) {
      setItemsList(prev => prev.filter(i => i !== item));
    } else {
      setItemsList(prev => [...prev, item]);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || itemsList.length === 0) return;

    setSubmitting(true);
    try {
      const data = {
        studentName,
        grade,
        board,
        requestedItems: itemsList
      };
      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Child Support - Book Bank",
        submissionData: JSON.stringify(data),
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setStudentName("");
          setItemsList([]);
        }, 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        subject,
        grade: tutorGrade,
        address: tutorAddress
      };
      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Child Support - Tutoring",
        submissionData: JSON.stringify(data),
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (res.ok) {
        setTutorSuccess(true);
        setTutorGrade("");
        setTutorAddress("");
        setTimeout(() => {
          setTutorSuccess(false);
        }, 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn max-w-md mx-auto">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-indigo-650 to-blue-700 pt-6 pb-6 px-5 relative overflow-hidden shrink-0 text-white shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-xl tracking-wide">
              {lang === "hi" ? "शिक्षा सहयोग केंद्र" : "Education Support Hub"}
            </h2>
            <p className="text-xs text-indigo-100 mt-0.5">
              {lang === "hi" ? "मुफ़्त किताबें, स्टेशनरी किट और ट्यूटर गाइड" : "Apply for free textbooks, study stationery kits & tutoring programs"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm shrink-0">
        <button 
          onClick={() => setActiveTab("books")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "books" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "पुस्तक बैंक व स्टेशनरी" : "Book Bank & Kits"}
        </button>
        <button 
          onClick={() => setActiveTab("tutoring")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "tutoring" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "निःशुल्क ट्यूशन / कोचिंग" : "Free Tutoring"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {activeTab === "books" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
              <h4 className="font-display font-extrabold text-xs text-slate-850 uppercase tracking-widest border-b border-slate-100 pb-2">
                {lang === "hi" ? "मुफ़्त पुस्तक व स्टेशनरी किट आवेदन" : "Register Book Bank & Kit requests"}
              </h4>

              {success ? (
                <div className="bg-green-50 border border-green-150 rounded-2xl p-5 text-center space-y-2 py-8 animate-fadeIn">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <h5 className="font-display font-extrabold text-green-905 text-sm">
                    {lang === "hi" ? "शिक्षा सामग्री अनुरोध स्वीकृत!" : "Study Kit Request Registered!"}
                  </h5>
                  <p className="text-xs text-green-700/80 leading-relaxed">
                    {lang === "hi" 
                      ? "आपका टोकन कोड जनरेट हो गया है। आगामी शनिवार राहत शिविर से अपने जन सेवा कार्ड के साथ किट प्राप्त करें।"
                      : "Book bank token generated. Pick up materials at the next relief camp showing your Jan Seva card."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Student Full Name / विद्यार्थी का नाम</label>
                    <input 
                      type="text" 
                      required 
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      placeholder="e.g. Rahul Sharma" 
                      className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-indigo-500" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Class / कक्षा</label>
                      <select 
                        value={grade}
                        onChange={e => setGrade(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                      >
                        <option>Class 5</option>
                        <option>Class 8</option>
                        <option>Class 10</option>
                        <option>Class 12</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Education Board / बोर्ड</label>
                      <select 
                        value={board}
                        onChange={e => setBoard(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                      >
                        <option>MP Board</option>
                        <option>CBSE</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-550 font-bold mb-1">
                    {lang === "hi" ? "आवश्यक सामग्री चुनें (बहुचेयन करें):" : "Select required school kits:"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {["Textbooks Kit / पुस्तकें", "School Stationery / पेन-कॉपी", "School Bag / स्कूल बैग", "School Uniform / ड्रेस"].map(item => {
                      const selected = itemsList.includes(item);
                      return (
                        <div 
                          key={item}
                          onClick={() => handleItemToggle(item)}
                          className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                            selected 
                              ? "border-indigo-600 bg-indigo-50/50 text-indigo-950" 
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <span className="text-[10px] font-bold">{item}</span>
                          {selected && <Check className="w-3.5 h-3.5 text-indigo-650" />}
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    type="submit" 
                    disabled={itemsList.length === 0 || submitting}
                    className="w-full bg-[#000080] hover:bg-indigo-950 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
                  >
                    {submitting ? "Processing Request..." : "Request Books & Study Kit"}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-black uppercase tracking-wider block">Education Drive Info</span>
                <p className="text-[10px] leading-relaxed opacity-90 font-medium">
                  {lang === "hi"
                    ? "पुस्तक बैंक आरपी फाउंडेशन का एक सामूहिक सहायता अभियान है। पुरानी पाठ्यपुस्तकें दान करने के लिए भी आप इस केंद्र पर आ सकते हैं।"
                    : "The Book Bank is powered by community book donations. You can also drop by our center to donate old textbooks."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tutoring" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
              <h4 className="font-display font-extrabold text-xs text-slate-850 uppercase tracking-widest border-b border-slate-100 pb-2">
                {lang === "hi" ? "मुफ़्त कोचिंग / ट्यूटर गाइड अनुरोध" : "Request Free Tutoring Classes"}
              </h4>

              {tutorSuccess ? (
                <div className="bg-green-50 border border-green-150 rounded-2xl p-5 text-center space-y-2 py-8 animate-fadeIn">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <h5 className="font-display font-extrabold text-green-905 text-sm">
                    {lang === "hi" ? "ट्यूशन अनुरोध दर्ज हुआ!" : "Tutoring Request Saved!"}
                  </h5>
                  <p className="text-xs text-green-700/80 leading-relaxed">
                    {lang === "hi" 
                      ? "आपके विषय के लिए स्थानीय स्वयंसेवक शिक्षक की खोज की जा रही है। २४ घंटों में शिक्षक का विवरण भेजा जाएगा।"
                      : "We are matching a nearby volunteer tutor for your child. Class details will be sent via SMS."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTutorSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Subject Needed / विषय</label>
                    <select 
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                    >
                      <option>Mathematics / गणित</option>
                      <option>Science / विज्ञान</option>
                      <option>English Language / अंग्रेजी</option>
                      <option>Digital Literacy / कंप्यूटर</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Grade Level / विद्यार्थी की कक्षा</label>
                    <input 
                      type="text" 
                      required 
                      value={tutorGrade}
                      onChange={e => setTutorGrade(e.target.value)}
                      placeholder="e.g. Class 10" 
                      className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-indigo-500" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Address / वार्ड का नाम</label>
                    <input 
                      type="text" 
                      required 
                      value={tutorAddress}
                      onChange={e => setTutorAddress(e.target.value)}
                      placeholder="e.g. Karond Ward 12, Bhopal" 
                      className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-indigo-500" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-[#000080] hover:bg-indigo-950 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
                  >
                    {submitting ? "Submitting Request..." : "Request Free Tutoring Setup"}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3 text-indigo-900 shadow-inner">
              <GraduationCap className="w-5 h-5 text-indigo-650 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-black uppercase tracking-wider block">Volunteer Tutors</span>
                <p className="text-[10px] leading-relaxed opacity-90 font-medium">
                  {lang === "hi"
                    ? "हमारे ट्यूटर वे स्वयंसेवक हैं जो अपने खाली समय में स्थानीय शिक्षा विकास के लिए श्रमदान करते हैं। कक्षाएं पूरी तरह मुफ़्त हैं।"
                    : "Classes are run by local volunteering college students and professional teachers. Absolutely zero charges."}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
