import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, CheckCircle, ArrowLeft, Info, Calendar, MapPin, Check, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function EducationSupport() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"books" | "tutoring" | "elibrary" | "courses" | "tests">("courses");

  // E-Learning & Library States
  const [courses, setCourses] = useState<any[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [activeBook, setActiveBook] = useState<any | null>(null);

  // Mock Tests States
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // UseEffect for data fetching
  React.useEffect(() => {
    if (activeTab === "courses" && courses.length === 0) {
      fetch("/api/edu/courses")
        .then(res => res.json())
        .then(data => { if (data.success) setCourses(data.data); })
        .catch(console.error);
    } else if (activeTab === "tests" && questions.length === 0) {
      fetch("/api/edu/tests/questions")
        .then(res => res.json())
        .then(data => { if (data.success) setQuestions(data.data); })
        .catch(console.error);
    } else if (activeTab === "elibrary" && libraryBooks.length === 0) {
      fetch("/api/edu/library")
        .then(res => res.json())
        .then(data => { if (data.success) setLibraryBooks(data.data); })
        .catch(console.error);
    }
  }, [activeTab]);

  // Digital Library external search states
  const [libQuery, setLibQuery] = useState("");
  const [libResults, setLibResults] = useState<any[]>([]);
  const [libLoading, setLibLoading] = useState(false);
  
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
        submissionData: data,
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
        submissionData: data,
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
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm shrink-0 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveTab("courses")}
          className={`shrink-0 px-4 py-3 text-[11px] font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "courses" ? "border-indigo-600 text-indigo-700 bg-indigo-50/30" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "वीडियो कक्षाएं" : "E-Learning"}
        </button>
        <button 
          onClick={() => setActiveTab("tests")}
          className={`shrink-0 px-4 py-3 text-[11px] font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "tests" ? "border-indigo-600 text-indigo-700 bg-indigo-50/30" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "मॉक टेस्ट" : "Mock Tests"}
        </button>
        <button 
          onClick={() => setActiveTab("elibrary")}
          className={`shrink-0 px-4 py-3 text-[11px] font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "elibrary" ? "border-indigo-600 text-indigo-700 bg-indigo-50/30" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "ई-लाइब्रेरी" : "Digital Library"}
        </button>
        <button 
          onClick={() => setActiveTab("books")}
          className={`shrink-0 px-4 py-3 text-[11px] font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "books" ? "border-indigo-600 text-indigo-700 bg-indigo-50/30" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "पुस्तक बैंक" : "Book Bank"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">

        {/* E-Learning (Unacademy Clone) */}
        {activeTab === "courses" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-extrabold text-[#000080] text-sm flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                {lang === "hi" ? "ई-लर्निंग पोर्टल" : "E-Learning Hub"}
              </h3>
            </div>
            
            <div className="grid gap-4">
              {courses.map(course => (
                <div key={course.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-video w-full bg-slate-900 relative">
                    <iframe 
                      className="w-full h-full absolute inset-0"
                      src={`https://www.youtube.com/embed/${course.youtube_id}?rel=0`} 
                      title={course.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                        {course.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{course.duration}</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-slate-800 leading-tight">
                      {course.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 flex items-center justify-between">
                      <span>By {course.instructor}</span>
                      <span className="text-slate-400">{course.views.toLocaleString()} views</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mock Tests (Testbook Clone) */}
        {activeTab === "tests" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 text-white shadow-md">
              <h3 className="font-display font-extrabold text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {lang === "hi" ? "मॉक टेस्ट प्रैक्टिस" : "Mock Test Practice"}
              </h3>
              <p className="text-xs text-indigo-100 mt-1 opacity-90">
                {lang === "hi" ? "परीक्षाओं की तैयारी के लिए निःशुल्क अभ्यास करें।" : "Practice for exams with free mock tests."}
              </p>
            </div>

            {testComplete ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
                <div className="w-20 h-20 bg-green-50 rounded-full flex flex-col items-center justify-center mx-auto border-4 border-green-100">
                  <span className="text-2xl font-black text-green-600">{score}/{questions.length}</span>
                </div>
                <h4 className="font-display font-extrabold text-slate-800 text-lg">Test Completed!</h4>
                <button 
                  onClick={() => {
                    setCurrentQuestion(0);
                    setScore(0);
                    setTestComplete(false);
                    setSelectedAnswer(null);
                  }}
                  className="bg-[#000080] text-white px-6 py-2.5 rounded-xl font-bold text-xs"
                >
                  Retake Test
                </button>
              </div>
            ) : questions.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Score: {score}</span>
                </div>
                
                <h4 className="text-sm font-bold text-slate-800 leading-snug">
                  {questions[currentQuestion].text}
                </h4>

                <div className="space-y-2 mt-4">
                  {questions[currentQuestion].options.map((opt: string, idx: number) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedAnswer(idx)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                        selectedAnswer === idx 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900" 
                          : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${selectedAnswer === idx ? 'border-indigo-600' : 'border-slate-400'}`}>
                        {selectedAnswer === idx && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                      </div>
                      <span className="text-xs font-semibold">{opt}</span>
                    </div>
                  ))}
                </div>

                <button 
                  disabled={selectedAnswer === null}
                  onClick={() => {
                    if (selectedAnswer === questions[currentQuestion].answer) {
                      setScore(s => s + 1);
                    }
                    if (currentQuestion < questions.length - 1) {
                      setCurrentQuestion(c => c + 1);
                      setSelectedAnswer(null);
                    } else {
                      setTestComplete(true);
                    }
                  }}
                  className="w-full bg-[#000080] hover:bg-indigo-950 text-white py-3 rounded-xl font-bold text-xs transition disabled:opacity-50 mt-4"
                >
                  {currentQuestion === questions.length - 1 ? "Submit Test" : "Next Question"}
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">Loading tests...</div>
            )}
          </div>
        )}
        
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

        {/* E-Library Tab */}
        {activeTab === "elibrary" && (
          <div className="space-y-4 animate-fadeIn">
            {activeBook ? (
              <div className="fixed inset-0 z-50 bg-[#F4ECD8] flex flex-col h-[100dvh] animate-slideUp overflow-hidden">
                <div className="bg-[#EBE0C5] border-b border-[#D8C9A3] px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
                  <button onClick={() => setActiveBook(null)} className="p-1.5 bg-[#D8C9A3]/50 rounded hover:bg-[#D8C9A3] transition text-[#5A4D32]">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-serif font-bold text-sm text-[#5A4D32] truncate max-w-[200px]">{activeBook.title}</h3>
                  <button className="p-1.5 text-[#5A4D32]">
                    <span className="font-bold text-lg leading-none">Aa</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  <div className="max-w-2xl mx-auto space-y-4 font-serif text-[#3E3524] text-lg leading-relaxed">
                    <h1 className="text-2xl font-black mb-2">{activeBook.title}</h1>
                    <h2 className="text-base text-[#756445] italic mb-6">By {activeBook.author}</h2>
                    {activeBook.content.split('\n').map((paragraph: string, i: number) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                    <p className="text-center italic text-[#756445] mt-12 py-8 border-t border-[#D8C9A3]">~ End of Preview ~</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Platform Books (Wattpad clone) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-display font-extrabold text-sm text-[#000080]">RPF Library Originals</h4>
                  </div>
                  {libraryBooks.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {libraryBooks.map(book => (
                        <div 
                          key={book.id} 
                          onClick={() => setActiveBook(book)}
                          className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm cursor-pointer hover:border-indigo-400 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mb-2">
                              <BookOpen className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h5 className="font-display font-bold text-xs text-slate-800 leading-tight mb-1">{book.title}</h5>
                            <p className="text-[10px] text-slate-500 italic">{book.author}</p>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 mt-3">{book.views} Reads</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Loading catalog...</p>
                  )}
                </div>

                {/* External Archive Search */}
                <div className="glass-card bg-white/95 p-5 border-indigo-100 shadow-sm space-y-4 rounded-2xl mt-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h4 className="font-display font-extrabold text-xs text-indigo-900 uppercase tracking-widest">
                  {lang === "hi" ? "फ्री डिजिटल लाइब्रेरी" : "Global Digital Library"}
                </h4>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                {lang === "hi" 
                  ? "लाखों मुफ्त किताबें, रिसर्च पेपर, और नोट्स खोजें। (Powered by Internet Archive)" 
                  : "Search millions of free books, historical texts, and notes. (Powered by Internet Archive)"}
              </p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={lang === "hi" ? "विषय या किताब का नाम (e.g. Mathematics, History)..." : "Subject or Book name..."}
                  value={libQuery}
                  onChange={e => setLibQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && libQuery) {
                      setLibLoading(true);
                      fetch(`/api/public/archive-search?q=${libQuery}`)
                        .then(r => r.json())
                        .then(d => {
                          if(d.success) setLibResults(d.data);
                          setLibLoading(false);
                        }).catch(() => setLibLoading(false));
                    }
                  }}
                  className="flex-1 border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-indigo-500"
                />
                <button 
                  disabled={libLoading || !libQuery}
                  onClick={() => {
                    setLibLoading(true);
                    fetch(`/api/public/archive-search?q=${libQuery}`)
                      .then(r => r.json())
                      .then(d => {
                        if(d.success) setLibResults(d.data);
                        setLibLoading(false);
                      }).catch(() => setLibLoading(false));
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-black text-xs disabled:opacity-50"
                >
                  {lang === "hi" ? "खोजें" : "Search"}
                </button>
              </div>

              {libLoading && (
                <div className="text-center py-4">
                  <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-[10px] text-slate-500 font-bold animate-pulse">{lang === "hi" ? "किताबें ढूंढी जा रही हैं..." : "Searching library..."}</p>
                </div>
              )}

              {!libLoading && libResults.length > 0 && (
                <div className="space-y-3 mt-4">
                  {libResults.map((book: any, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl relative">
                      <h5 className="font-extrabold text-xs text-indigo-950 leading-tight pr-6">{book.title}</h5>
                      <p className="text-[9px] text-slate-500 font-bold mt-1">
                        {book.creator ? `By: ${Array.isArray(book.creator) ? book.creator[0] : book.creator}` : "Unknown Author"} 
                        {book.year && ` • ${book.year}`}
                      </p>
                      
                      <a 
                        href={`https://archive.org/details/${book.identifier}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-[9.5px] font-black bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded hover:bg-indigo-200 transition"
                      >
                        {lang === "hi" ? "किताब खोलें / पढ़ें" : "Read Book"}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              
              {!libLoading && libQuery && libResults.length === 0 && (
                <p className="text-xs text-slate-500 font-bold text-center mt-4">
                  {lang === "hi" ? "कोई किताब नहीं मिली। कृपया अंग्रेजी में या दूसरा नाम खोजें।" : "No books found. Try a different query."}
                </p>
              )}

            </div>
          </>
          )}
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
