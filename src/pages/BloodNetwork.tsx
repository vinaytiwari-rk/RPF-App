import React, { useState, useEffect } from "react";
import { Activity, AlertTriangle, Droplet, Heart, Search, ChevronRight, CheckCircle, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
// import axios from 'axios';

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodNetwork() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"request" | "donate" | "find">("request");
  const [bloodType, setBloodType] = useState("");
  const [donorBloodType, setDonorBloodType] = useState("");
  const [registered, setRegistered] = useState(false);
  const [donors, setDonors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New Request Form states
  const [hospital, setHospital] = useState("");
  const [units, setUnits] = useState("");
  const [phone, setPhone] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const filteredDonors = donors.filter((d) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      d.name.toLowerCase().includes(query) ||
      d.type.toLowerCase().includes(query) ||
      (d.location && d.location.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    if (tab === "find") {
      const fetchDonors = async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/blood_donors");
          if (res.ok) {
            const d = await res.json();
            const list = (d.donors || []).map((item: any) => ({
              name: item.name || "Anonymous Donor",
              type: item.bloodGroup || item.bloodType || "O+",
              distance: item.distance || "Nearby",
              lastDonated: item.lastDonated || "Available",
              location: item.location || ""
            }));
            setDonors(list);
          } else {
            throw new Error("Failed to fetch blood donors");
          }
        } catch (error) {
          console.error("Error fetching donors from server:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDonors();
    }
  }, [tab]);

  const handleRegisterAsDonor = async () => {
    if (!donorBloodType) return;
    try {
      const donorData = {
        name: user?.name || "Verified Citizen",
        bloodGroup: donorBloodType,
        phone: user?.phone || "",
        location: "Local Area",
        verified: true,
        distance: "0.1 km away",
        lastDonated: "Available"
      };

      const resDonor = await fetch("/api/blood_donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorData)
      });
      if (!resDonor.ok) throw new Error("Failed to register donor");

      // Add to polymorphic service_submissions as well
      const resSub = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "guest",
          citizenName: user?.name || "Citizen",
          citizenPhone: user?.phone || "",
          serviceName: "Blood Network",
          submissionData: JSON.stringify({ ...donorData, type: "Donor Registration" }),
          status: "pending",
          timestamp: new Date().toISOString()
        })
      });
      if (!resSub.ok) throw new Error("Failed to submit registry");

      setRegistered(true);
    } catch (error) {
      console.error("Error registering donor on server:", error);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodType || !hospital || !units || !phone) return;

    setRequestSubmitting(true);
    try {
      const reqData = {
        bloodType,
        hospital,
        units: parseInt(units, 10) || 1,
        phone,
        type: "Emergency Blood Request"
      };

      // Add to polymorphic service_submissions
      const resSub = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "guest",
          citizenName: user?.name || "Citizen",
          citizenPhone: user?.phone || phone || "",
          serviceName: "Blood Network",
          submissionData: JSON.stringify(reqData),
          status: "pending",
          timestamp: new Date().toISOString()
        })
      });
      if (!resSub.ok) throw new Error("Failed to submit request");

      setRequestSuccess(true);
      setTimeout(() => {
        setRequestSuccess(false);
        setHospital("");
        setUnits("");
        setPhone("");
        setBloodType("");
      }, 4000);
    } catch (err) {
      console.error("Blood Request submission error:", err);
    } finally {
      setRequestSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 pt-6 pb-6 px-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-white tracking-wide">Blood Network</h2>
            <p className="text-xs text-red-100 mt-0.5">Emergency response & donor registry</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => setTab("request")}
          className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
            tab === "request" ? "border-red-600 text-red-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Request Blood
        </button>
        <button 
          onClick={() => setTab("donate")}
          className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
            tab === "donate" ? "border-red-600 text-red-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Donate
        </button>
        <button 
          onClick={() => setTab("find")}
          className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
            tab === "find" ? "border-red-600 text-red-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Find Donors
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {tab === "request" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 text-xs">Emergency Notice</h4>
                <p className="text-[10px] text-red-700/80 mt-0.5 leading-relaxed">
                  For severe life-threatening emergencies requiring immediate blood, please also call 108 or your nearest hospital directly.
                </p>
              </div>
            </div>

            <div className="glass-card bg-white/95 border-gold-soft shadow-gold-premium p-5">
              <h3 className="font-display font-bold text-slate-800 text-base mb-4">Request Blood</h3>

              {requestSuccess ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center space-y-3 shadow-sm animate-fadeIn">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-green-800 text-sm">Broadcast Sent!</h4>
                  <p className="text-[11px] text-green-700 leading-relaxed max-w-[280px] mx-auto">
                    Your blood request has been successfully transmitted to all active and verified donors of blood group <span className="font-bold text-red-600">{bloodType}</span> in your vicinity.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-2">Blood Type Needed</label>
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {BLOOD_TYPES.map(bt => (
                      <button 
                        type="button"
                        key={bt}
                        onClick={() => setBloodType(bt)}
                        className={`py-3 rounded-lg font-bold text-sm transition border ${
                          bloodType === bt 
                            ? "bg-red-50 border-red-500 text-red-700" 
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Hospital Name / Location</label>
                      <input 
                        type="text" 
                        required
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        placeholder="Where is the patient?" 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Units Required</label>
                      <input 
                        type="number" 
                        required
                        value={units}
                        onChange={(e) => setUnits(e.target.value)}
                        placeholder="e.g. 2" 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Contact Number</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Attendant's phone number" 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={!bloodType || requestSubmitting}
                    className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg shadow-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    <span>{requestSubmitting ? "Broadcasting..." : "Broadcast Request to Network"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {tab === "donate" && (
          <div className="space-y-4 animate-fadeIn">
            {registered ? (
              <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center space-y-3 shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-display font-bold text-green-800 text-lg">Registered as Donor!</h3>
                <p className="text-xs text-green-700 leading-relaxed max-w-[250px] mx-auto">
                  Thank you for stepping up. You will be alerted via push notification whenever someone nearby requests <span className="font-bold">{donorBloodType}</span> blood.
                </p>
                <div className="bg-green-100 text-green-800 font-mono text-xs py-1.5 px-3 rounded-full inline-block mt-2">
                  Status: Active Donor
                </div>
              </div>
            ) : (
              <div className="glass-card bg-white/95 border-gold-soft shadow-gold-premium p-5">
                <div className="flex justify-center mb-4">
                  <div className="bg-red-50 p-3 rounded-full">
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-center text-slate-800 text-base mb-2">Register to Donate</h3>
                <p className="text-[10px] text-center text-slate-500 mb-6 px-4">
                  Your single donation can save up to 3 lives. Join our verified donor network to receive alerts when your blood type is needed nearby.
                </p>

                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-2">Your Blood Type</label>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {BLOOD_TYPES.map(bt => (
                    <button 
                      key={bt}
                      onClick={() => setDonorBloodType(bt)}
                      className={`py-3 rounded-lg font-bold text-sm transition border ${
                        donorBloodType === bt 
                          ? "bg-red-50 border-red-500 text-red-700" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>

                 <button 
                  disabled={!donorBloodType}
                  onClick={handleRegisterAsDonor}
                  className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg shadow-md hover:bg-red-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>Register as Donor</span>
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "find" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card bg-white/95 border-gold-soft shadow-gold-premium p-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search donors by city, pin code or blood type..." 
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-display font-bold text-[11px] text-slate-800 uppercase tracking-widest mb-2 px-1">Nearby Active Donors</h4>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Fetching Active Donors...</span>
                </div>
              ) : donors.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
                  <Droplet className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No active blood donors registered</p>
                  <p className="text-[10px] text-slate-400">Be the first to step forward! Register in the "Donate" tab to save lives.</p>
                </div>
              ) : filteredDonors.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                  No donors match your search query.
                </div>
              ) : (
                filteredDonors.map((d, i) => (
                  <div key={i} className="glass-card bg-white/95 border-gold-soft shadow-gold-premium p-4 flex items-center justify-between transition hover:-translate-y-0.5 duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                        <span className="font-bold text-red-700">{d.type}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{d.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5 text-[9px] text-slate-500">
                            <MapPin className="w-3 h-3" /> {d.location || "Nearby"}
                          </span>
                          <span className="text-[8px] text-slate-300">•</span>
                          <span className="text-[9px] text-slate-500">{d.lastDonated || "Available"}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
                      Contact
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

