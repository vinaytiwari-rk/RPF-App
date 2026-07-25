import React, { useState, useEffect } from "react";
import { 
  Activity, AlertTriangle, Droplet, Heart, Search, ChevronRight, 
  CheckCircle, MapPin, Loader2, Calendar, Clock, User, FileText, 
  Check, X, Award, TrendingUp, Printer, Map
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const COMPONENT_TYPES = ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets", "Cryoprecipitate"];

export default function BloodNetwork() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"request" | "donate" | "find" | "donors">("request");
  
  // Requests Tab states
  const [bloodType, setBloodType] = useState("A+");
  const [componentType, setComponentType] = useState("Whole Blood");
  const [hospital, setHospital] = useState("");
  const [units, setUnits] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [selectedSlipRequest, setSelectedSlipRequest] = useState<any | null>(null);

  // Donate Tab states
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({
    weight: "",
    health: "",
    surgery: "",
    meds: ""
  });
  
  // Appointment Form states
  const [selectedBankId, setSelectedBankId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [apptNotes, setApptNotes] = useState("");
  const [apptSubmitting, setApptSubmitting] = useState(false);
  const [apptSuccess, setApptSuccess] = useState(false);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);

  // Find Banks Tab states
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [selectedBankStock, setSelectedBankStock] = useState<any | null>(null);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [mapSearchLocation, setMapSearchLocation] = useState("Bhopal");
  const [generalMapUrl, setGeneralMapUrl] = useState("https://maps.google.com/maps?q=blood%20banks%20in%20Bhopal&t=&z=13&ie=UTF8&iwloc=&output=embed");

  // Donors Tab states
  const [activeDonors, setActiveDonors] = useState<any[]>([]);
  const [donorSearchQuery, setDonorSearchQuery] = useState("");
  const [loadingDonors, setLoadingDonors] = useState(false);

  // Fetch requests & appointments on load
  const fetchMyPortalData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch requests
      const reqRes = await fetch("/api/blood-requests/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (reqRes.ok) {
        const data = await reqRes.json();
        setMyRequests(data);
      }

      // Fetch appointments
      const apptRes = await fetch("/api/appointments/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (apptRes.ok) {
        const data = await apptRes.json();
        setMyAppointments(data);
      }
    } catch (e) {
      console.error("Error fetching portal data:", e);
    }
  };

  // Fetch Blood Banks
  const fetchBloodBanks = async (query = "") => {
    setLoadingBanks(true);
    try {
      const url = query ? `/api/blood-banks?search=${encodeURIComponent(query)}` : "/api/blood-banks";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBloodBanks(data);
        if (data.length > 0) setSelectedBankId(data[0].id);
      }
    } catch (e) {
      console.error("Error fetching blood banks:", e);
    } finally {
      setLoadingBanks(false);
    }
  };

  // Fetch Active Donors
  const fetchActiveDonors = async () => {
    setLoadingDonors(true);
    try {
      const res = await fetch("/api/blood_donors");
      if (res.ok) {
        const data = await res.json();
        setActiveDonors(data.donors || []);
      }
    } catch (e) {
      console.error("Error fetching active donors:", e);
    } finally {
      setLoadingDonors(false);
    }
  };

  useEffect(() => {
    fetchMyPortalData();
    fetchBloodBanks();
    fetchActiveDonors();
  }, []);

  // Handle Eligibility Quiz
  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { weight, health, surgery, meds } = quizAnswers;
    if (weight === "yes" && health === "yes" && surgery === "no" && meds === "no") {
      setIsEligible(true);
    } else {
      setIsEligible(false);
    }
  };

  // Submit Blood Request
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital || !units) return;

    setRequestSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodGroup: bloodType,
          componentType,
          quantity: parseInt(units, 10),
          urgency,
          doctorName,
          notes: `${hospital} - ${notes}`
        })
      });

      if (res.ok) {
        setRequestSuccess(true);
        fetchMyPortalData();
        setTimeout(() => {
          setRequestSuccess(false);
          setHospital("");
          setUnits("");
          setDoctorName("");
          setNotes("");
        }, 3000);
      }
    } catch (err) {
      console.error("Error creating blood request:", err);
    } finally {
      setRequestSubmitting(false);
    }
  };

  // Book Appointment
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId || !appointmentDate) return;

    setApptSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodBankId: selectedBankId,
          appointmentDate,
          bloodGroup: user?.blood_group || "O+",
          notes: apptNotes
        })
      });

      if (res.ok) {
        setApptSuccess(true);
        fetchMyPortalData();
        setTimeout(() => {
          setApptSuccess(false);
          setAppointmentDate("");
          setApptNotes("");
          setShowQuiz(false);
          setIsEligible(null);
        }, 3000);
      }
    } catch (err) {
      console.error("Error booking appointment:", err);
    } finally {
      setApptSubmitting(false);
    }
  };

  // Filter Banks
  const filteredBanks = bloodBanks.filter(b => 
    (b.name || "").toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
    (b.city || "").toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
    (b.pincode || "").includes(bankSearchQuery)
  );

  // Filter Donors
  const filteredDonors = activeDonors.filter(d => 
    (d.name || "").toLowerCase().includes(donorSearchQuery.toLowerCase()) ||
    (d.bloodGroup || d.blood_group || "").toLowerCase().includes(donorSearchQuery.toLowerCase()) ||
    (d.location || "").toLowerCase().includes(donorSearchQuery.toLowerCase())
  );

  // Print slip helper
  const triggerPrintSlip = (req: any) => {
    setSelectedSlipRequest(req);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn min-h-screen">
      
      {/* Printable Requisition Slip Modal */}
      {selectedSlipRequest && (
        <div className="hidden print:block fixed inset-0 bg-white z-50 p-10 font-sans">
          <div className="border-4 border-double border-red-600 p-8 space-y-6">
            <div className="text-center border-b pb-4 border-red-200">
              <span className="text-4xl">🩸</span>
              <h1 className="text-2xl font-extrabold text-red-700 tracking-wide uppercase mt-2">Jan Seva Blood Network</h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">EMERGENCY BLOOD REQUISITION SLIP</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div><strong>Slip Reference:</strong> {selectedSlipRequest.id}</div>
              <div><strong>Date Generated:</strong> {new Date(selectedSlipRequest.created_at).toLocaleDateString()}</div>
              <div><strong>Requested By:</strong> {user?.name || "Verified Citizen"}</div>
              <div><strong>Hospital / Center:</strong> {selectedSlipRequest.notes?.split(" - ")[0] || "N/A"}</div>
            </div>
            <hr className="border-red-100" />
            <div className="bg-red-50 p-6 rounded-lg border border-red-200 space-y-4">
              <div className="grid grid-cols-2 gap-y-3">
                <span className="text-slate-600">Blood Group:</span>
                <span className="font-bold text-lg text-red-700">{selectedSlipRequest.blood_group}</span>

                <span className="text-slate-600">Component Needed:</span>
                <span className="font-semibold text-slate-800">{selectedSlipRequest.component_type}</span>

                <span className="text-slate-600">Required Quantity:</span>
                <span className="font-bold text-slate-800">{selectedSlipRequest.quantity} Unit(s)</span>

                <span className="text-slate-600">Urgency Level:</span>
                <span className={`font-extrabold uppercase ${selectedSlipRequest.urgency === 'Emergency' ? 'text-red-600' : 'text-slate-800'}`}>
                  {selectedSlipRequest.urgency}
                </span>

                <span className="text-slate-600">Attending Doctor:</span>
                <span className="font-medium text-slate-800">{selectedSlipRequest.doctor_name || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-500 italic mt-8 border-t pt-4">
              <p>* Please present this slip at your assigned Blood Bank along with the patient’s clinical records.</p>
              <p>* Generated verified via Jan Seva Digital Network Portal.</p>
            </div>
            <div className="flex justify-between items-center pt-10 text-xs text-slate-400">
              <span>Signature of Issuing Officer</span>
              <span>Hospital Seal & Sign</span>
            </div>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 pt-6 pb-6 px-5 relative overflow-hidden shrink-0 print:hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm shadow-inner">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-white tracking-wide">Blood Network</h2>
            <p className="text-xs text-red-100 mt-0.5 font-medium">Emergency Requisition, Donation & Live Stocks</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm print:hidden">
        <button 
          onClick={() => setTab("request")}
          className={`flex-1 py-3.5 text-xs font-bold transition-all border-b-2 ${
            tab === "request" ? "border-red-600 text-red-700 font-extrabold bg-red-50/20" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Request Blood
        </button>
        <button 
          onClick={() => setTab("donate")}
          className={`flex-1 py-3.5 text-xs font-bold transition-all border-b-2 ${
            tab === "donate" ? "border-red-600 text-red-700 font-extrabold bg-red-50/20" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Donate & Schedule
        </button>
        <button 
          onClick={() => setTab("find")}
          className={`flex-1 py-3.5 text-xs font-bold transition-all border-b-2 ${
            tab === "find" ? "border-red-600 text-red-700 font-extrabold bg-red-50/20" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Live Inventories
        </button>
        <button 
          onClick={() => setTab("donors")}
          className={`flex-1 py-3.5 text-xs font-bold transition-all border-b-2 ${
            tab === "donors" ? "border-red-600 text-red-700 font-extrabold bg-red-50/20" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Active Donors
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 print:hidden">
        
        {/* TAB 1: REQUEST BLOOD */}
        {tab === "request" && (
          <div className="space-y-4 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 text-xs">Emergency Requisition Guidelines</h4>
                <p className="text-[10px] text-red-700/80 mt-0.5 leading-relaxed">
                  For immediate severe life-threatening emergencies, directly contact our helpline or your nearest ICU. Requisitions made here broadcast instantly to matching local donors.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-5">
              <h3 className="font-display font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <span>Hospital Blood Requisition</span>
              </h3>

              {requestSuccess ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center space-y-3 shadow-sm animate-fadeIn">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-green-800 text-sm font-display">Broadcast & Slip Generated!</h4>
                  <p className="text-[11px] text-green-700 leading-relaxed max-w-[280px] mx-auto">
                    Your request for <span className="font-bold text-red-600">{bloodType}</span> has been dispatched to local donors. You can print the requisition slip below.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group Needed</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_TYPES.map(bt => (
                        <button 
                          type="button"
                          key={bt}
                          onClick={() => setBloodType(bt)}
                          className={`py-2 rounded-xl font-bold text-xs transition border ${
                            bloodType === bt 
                              ? "bg-red-50 border-red-500 text-red-700 shadow-sm" 
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Component Type</label>
                      <select 
                        value={componentType} 
                        onChange={(e) => setComponentType(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-red-500/20"
                      >
                        {COMPONENT_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Units Required</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={units}
                        onChange={(e) => setUnits(e.target.value)}
                        placeholder="e.g. 2" 
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-red-500/20" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hospital Name / Center</label>
                      <input 
                        type="text" 
                        required
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        placeholder="e.g. Bhopal Red Cross Hospital" 
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-red-500/20" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Attending Doctor (Optional)</label>
                      <input 
                        type="text" 
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        placeholder="Dr. Verma / Dr. Joshi" 
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-red-500/20" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Urgency Level</label>
                    <div className="flex gap-4">
                      {["Normal", "Urgent", "Emergency"].map(l => (
                        <label key={l} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input 
                            type="radio" 
                            name="urgency"
                            value={l}
                            checked={urgency === l}
                            onChange={() => setUrgency(l)}
                            className="text-red-600 focus:ring-red-500" 
                          />
                          <span>{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Clinical Remarks / Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify diagnosis or urgent delivery requirements..." 
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={requestSubmitting}
                    className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:from-red-800 hover:to-red-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {requestSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    <span>Submit Requisition</span>
                  </button>
                </form>
              )}
            </div>

            {/* My Requisitions List */}
            <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-5">
              <h3 className="font-display font-extrabold text-slate-800 text-sm mb-4">Requisition History</h3>
              {myRequests.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No requisition records found.</p>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((req, idx) => (
                    <div key={idx} className="border border-slate-100 p-4 rounded-xl flex items-center justify-between hover:bg-slate-50/50 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">{req.blood_group}</span>
                          <span className="text-xs font-semibold text-slate-800">{req.component_type}</span>
                          <span className="text-[10px] text-slate-400 font-medium">• {req.quantity} Unit(s)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">{req.notes}</p>
                        <p className="text-[9px] text-slate-400 font-medium">Created: {new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          req.status === 'Fulfilled' ? 'bg-green-50 text-green-700 border border-green-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {req.status}
                        </span>
                        <button 
                          onClick={() => triggerPrintSlip(req)}
                          title="Print Requisition Slip"
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-slate-500 hover:text-slate-800 transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DONATE & SCHEDULE */}
        {tab === "donate" && (
          <div className="space-y-4 animate-fadeIn max-w-4xl mx-auto">
            {/* Gamification Card */}
            <div className="bg-gradient-to-r from-red-800 to-rose-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-100">Hero Level Status</span>
                  </div>
                  <h3 className="text-xl font-extrabold font-display">
                    {user?.points && user.points >= 200 ? "Gold Hero" : user?.points && user.points >= 50 ? "Silver Hero" : "Bronze Donor"}
                  </h3>
                  <p className="text-[10px] text-red-100/80">Every donation rewards 50 points, saving up to 3 lives.</p>
                </div>
                <div className="text-center bg-white/10 px-5 py-3 rounded-xl backdrop-blur-sm border border-white/10">
                  <span className="block text-[10px] font-bold text-red-100 uppercase tracking-widest">Donation Score</span>
                  <span className="text-2xl font-black font-display text-amber-300">{user?.points || 0} pts</span>
                </div>
              </div>
            </div>

            {/* Donor Portal Flow */}
            {!showQuiz && !isEligible && (
              <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7 text-red-500 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="font-display font-extrabold text-slate-800 text-base">Schedule a Donation Appointment</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Check your eligibility and choose a nearby blood bank to schedule your blood donation.
                  </p>
                </div>
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition shadow-md inline-flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Check Donor Eligibility</span>
                </button>
              </div>
            )}

            {/* Eligibility Questionnaire */}
            {showQuiz && isEligible === null && (
              <form onSubmit={handleQuizSubmit} className="bg-white border border-slate-200 shadow-md rounded-2xl p-5 space-y-4">
                <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-slate-800 text-sm">Eligibility Questionnaire</h3>
                  <button type="button" onClick={() => setShowQuiz(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 p-3 border border-slate-100 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700">1. Do you weigh 50kg (110 lbs) or more?</span>
                    <div className="flex gap-2">
                      {["yes", "no"].map(o => (
                        <button 
                          key={o} type="button" 
                          onClick={() => setQuizAnswers(prev => ({ ...prev, weight: o }))}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase transition ${
                            quizAnswers.weight === o ? "bg-red-50 border-red-500 text-red-600" : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-3 border border-slate-100 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700">2. Are you in good general health and feeling well today?</span>
                    <div className="flex gap-2">
                      {["yes", "no"].map(o => (
                        <button 
                          key={o} type="button" 
                          onClick={() => setQuizAnswers(prev => ({ ...prev, health: o }))}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase transition ${
                            quizAnswers.health === o ? "bg-red-50 border-red-500 text-red-600" : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-3 border border-slate-100 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700">3. Have you had a surgery or major dental work in the last 6 months?</span>
                    <div className="flex gap-2">
                      {["yes", "no"].map(o => (
                        <button 
                          key={o} type="button" 
                          onClick={() => setQuizAnswers(prev => ({ ...prev, surgery: o }))}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase transition ${
                            quizAnswers.surgery === o ? "bg-red-50 border-red-500 text-red-600" : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-3 border border-slate-100 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700">4. Are you currently taking any heavy antibiotics or steroid medications?</span>
                    <div className="flex gap-2">
                      {["yes", "no"].map(o => (
                        <button 
                          key={o} type="button" 
                          onClick={() => setQuizAnswers(prev => ({ ...prev, meds: o }))}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase transition ${
                            quizAnswers.meds === o ? "bg-red-50 border-red-500 text-red-600" : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!quizAnswers.weight || !quizAnswers.health || !quizAnswers.surgery || !quizAnswers.meds}
                  className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md hover:bg-slate-900 transition disabled:opacity-50"
                >
                  Verify Answers
                </button>
              </form>
            )}

            {/* Eligibility Outcomes */}
            {isEligible === false && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center space-y-3 shadow-sm animate-fadeIn">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-bold text-red-800 text-sm font-display">Ineligible at this time</h4>
                <p className="text-[11px] text-red-700 leading-relaxed max-w-[280px] mx-auto">
                  Based on your responses, you do not meet the criteria to donate blood today. Please consult a health professional or try again in a few months.
                </p>
                <button onClick={() => { setIsEligible(null); setQuizAnswers({ weight: "", health: "", surgery: "", meds: "" }); }} className="text-xs font-bold text-red-700 underline mt-2">Retry Questionnaire</button>
              </div>
            )}

            {/* Scheduler Form if eligible */}
            {isEligible === true && (
              <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-5 space-y-4 animate-fadeIn">
                <h3 className="font-display font-extrabold text-slate-800 text-base mb-2">Book Donation Appointment</h3>
                {apptSuccess ? (
                  <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center space-y-3 shadow-sm">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                    <h4 className="font-bold text-green-800 text-sm">Appointment Booked!</h4>
                    <p className="text-[11px] text-green-700">Your donation slot has been scheduled. You received +50 points!</p>
                  </div>
                ) : (
                  <form onSubmit={handleBookAppointment} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Blood Bank</label>
                      <select 
                        value={selectedBankId}
                        onChange={(e) => setSelectedBankId(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-red-500/20"
                      >
                        {bloodBanks.map(b => <option key={b.id} value={b.id}>{b.name} ({b.city})</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Appointment Date & Time</label>
                        <input 
                          type="datetime-local" 
                          required
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-red-500/20" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                        <input 
                          type="text" 
                          value={apptNotes}
                          onChange={(e) => setApptNotes(e.target.value)}
                          placeholder="e.g. Prefer afternoon slot" 
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-red-500/20" 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={apptSubmitting}
                      className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-3 rounded-xl shadow-md hover:from-red-800 hover:to-red-700 transition"
                    >
                      {apptSubmitting ? "Scheduling slot..." : "Confirm Appointment Slot"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* My Scheduled Appointments */}
            <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-5">
              <h3 className="font-display font-extrabold text-slate-800 text-sm mb-4">My Donation Schedules</h3>
              {myAppointments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No scheduled appointments found.</p>
              ) : (
                <div className="space-y-3">
                  {myAppointments.map((appt, idx) => (
                    <div key={idx} className="border border-slate-100 p-4 rounded-xl flex items-center justify-between hover:bg-slate-50/50 transition">
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-slate-800">{appt.bloodBankName}</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> 
                          {new Date(appt.appointment_date).toLocaleDateString()} at {new Date(appt.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">Location: {appt.bloodBankAddress}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        appt.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        appt.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FIND BANKS & LIVE STOCK */}
        {tab === "find" && (
          <div className="space-y-4 animate-fadeIn max-w-4xl mx-auto">
            
            {/* Interactive Map Search Card */}
            <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Map className="w-5 h-5 text-red-600" />
                <span>Search Blood Banks on Live Map</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Enter a city name or pincode to discover matching blood bank centers interactively.</p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (mapSearchLocation.trim()) {
                  setGeneralMapUrl(`https://maps.google.com/maps?q=blood%20banks%20in%20${encodeURIComponent(mapSearchLocation.trim())}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
                }
              }} className="flex gap-2">
                <input 
                  type="text" 
                  value={mapSearchLocation}
                  onChange={(e) => setMapSearchLocation(e.target.value)}
                  placeholder="e.g., Indore, Sehore, Bhopal..." 
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md">
                  Search Map
                </button>
              </form>

              <div className="relative overflow-hidden rounded-xl h-64 shadow-inner border border-slate-200">
                <iframe
                  src={generalMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Live Blood Bank Map"
                ></iframe>
              </div>
            </div>

            {/* List Search location bar */}
            <form onSubmit={(e) => {
              e.preventDefault();
              fetchBloodBanks(bankSearchQuery);
            }} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={bankSearchQuery}
                onChange={(e) => setBankSearchQuery(e.target.value)}
                placeholder="Search blood banks by name, city, or pincode..." 
                className="flex-1 text-xs outline-none bg-transparent font-medium"
              />
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md">
                Search
              </button>
            </form>

            {loadingBanks ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Loading Inventories...</span>
              </div>
            ) : filteredBanks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                No matching blood banks found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBanks.map((bank, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 shadow-md rounded-2xl p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 font-display">{bank.name}</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {bank.address}, {bank.city}, {bank.state} ({bank.pincode})
                        </p>
                      </div>

                      {/* Contact for Stock Inventory */}
                      <div className="border-t pt-3 border-slate-100">
                        <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Blood Stock Inventory</span>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-slate-600 font-bold">
                            {lang === "hi" ? "लाइव स्टॉक स्थिति के लिए सीधे कॉल करें या ई-रक्तकोष (eraktkosh.in) पर जाएं।" : "Contact blood bank directly or visit eRaktKosh (eraktkosh.in) for live stock status."}
                          </p>
                          <a 
                            href={`tel:${bank.phone}`}
                            className="inline-block mt-2 px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-red-100 transition decoration-none"
                          >
                            📞 Call: {bank.phone}
                          </a>
                        </div>
                      </div>

                      {/* Embedded Map */}
                      <div className="relative overflow-hidden rounded-xl h-44 shadow-inner border border-slate-200 mt-2">
                        <iframe
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(bank.name + " " + bank.city)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          title={`Map of ${bank.name}`}
                        ></iframe>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <a href={`tel:${bank.phone}`} className="flex-1 bg-slate-50 text-center font-bold text-[10px] uppercase text-slate-700 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                        Call Bank
                      </a>
                      <button 
                        onClick={() => {
                          setTab("donate");
                          setSelectedBankId(bank.id);
                          setIsEligible(true);
                        }}
                        className="flex-1 bg-red-600 text-center font-bold text-[10px] uppercase text-white py-2.5 rounded-xl hover:bg-red-700 transition"
                      >
                        Donate Here
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACTIVE DONORS */}
        {tab === "donors" && (
          <div className="space-y-4 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={donorSearchQuery}
                onChange={(e) => setDonorSearchQuery(e.target.value)}
                placeholder="Search donors by location or blood type (e.g. O+)..." 
                className="flex-1 text-xs outline-none bg-transparent font-medium"
              />
            </div>

            {loadingDonors ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Loading Active Donors...</span>
              </div>
            ) : filteredDonors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                No active donors found matching the query.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDonors.map((d, i) => (
                  <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center justify-between transition hover:-translate-y-0.5 duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
                        <span className="font-black text-red-700 text-xs">{d.bloodGroup}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{d.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5 text-[9px] text-slate-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {d.location || "Nearby"}
                          </span>
                          <span className="text-[8px] text-slate-300">•</span>
                          <span className="text-[9px] text-slate-500 font-semibold text-green-600">{d.lastDonated || "Available"}</span>
                        </div>
                      </div>
                    </div>
                    <a 
                      href={`tel:${d.phone}`}
                      className="text-[10px] font-bold text-red-600 border border-red-200 bg-red-50/50 px-3.5 py-2 rounded-xl hover:bg-red-100 transition shadow-inner"
                    >
                      Call Donor
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
