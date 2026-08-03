import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Heart, QrCode, TrendingUp, CheckCircle, Calculator, Leaf, BookOpen, Users, Coins, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

export default function CrowdfundingPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const [backed, setBacked] = useState(false);

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);

  // 1. Impact Multiplier States
  const [donateAmount, setDonateAmount] = useState(1000);

  // 2. 80G Tax Exemption States
  const [incomeSlab, setIncomeSlab] = useState(30); // tax bracket (30%, 20%, 10%)

  // 3. Campaign Run-rate States
  const [dailyDonations, setDailyDonations] = useState(2500);

  // 4. Cumulative Planner States
  const [monthlyCommitment, setMonthlyCommitment] = useState(500);
  const [commitmentMonths, setCommitmentMonths] = useState(12);

  // 5. Leaderboard Mock State (Interactive sorting demo)
  const [leaderboard, setLeaderboard] = useState([
    { name: "Aditya Sharma", amount: 15000, points: 150 },
    { name: "Rajesh Patel", amount: 5000, points: 50 },
    { name: "Priya Varma", amount: 25000, points: 250 },
    { name: "Sunita Dixit", amount: 8000, points: 80 }
  ]);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const toggleSort = () => {
    const nextOrder = sortOrder === "desc" ? "asc" : "desc";
    const sorted = [...leaderboard].sort((a, b) => {
      return nextOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
    });
    setLeaderboard(sorted);
    setSortOrder(nextOrder);
  };

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24 max-w-md mx-auto">
      {/* Campaign Details */}
      <div className="bg-white border border-slate-200 overflow-hidden rounded-2xl shadow-sm">
        <img 
          src="/assets/water_pump_camp.png" 
          alt="Campaign Banner" 
          className="w-full h-40 object-cover" 
        />
        
        <div className="p-5 space-y-4">
          <div>
            <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block">
              {lang === "hi" ? "त्वरित आवश्यकता" : "Urgent Fundraiser"}
            </span>
            <h3 className="font-display font-extrabold text-base text-[#0B1E3F] mt-2">
              {lang === "hi" ? "ग्रामीण स्कूलों में पेयजल हेतु ट्यूबवेल बोरिंग" : "Clean Drinking Water Tube Wells in Rural Schools"}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              By RP Foundation Water Aid
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            {lang === "hi"
              ? "सीहोर के ५ दूरदराज के सरकारी स्कूलों में पेयजल की भारी किल्लत है। हम वहां ट्यूबवेल और वाटर प्यूरीफायर लगाने के लिए राशि संकलित कर रहे हैं।"
              : "5 remote government schools in Sehore district have no access to clean drinking water. We are installing borewells and RO purification kits."}
          </p>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="w-[60%] bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full"></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>₹1.2L Raised (60%)</span>
              <span>Target: ₹2L</span>
            </div>
          </div>

          {backed ? (
            <div className="bg-green-50 text-green-700 border border-green-150 p-3 rounded-lg text-xs font-bold flex items-center gap-1.5 justify-center">
              <CheckCircle className="w-4.5 h-4.5" />
              <span>{lang === "hi" ? "सहयोग देने के लिए धन्यवाद!" : "Thank you for backing this cause!"}</span>
            </div>
          ) : (
            <button 
              onClick={() => navigate("/donations")}
              className="w-full bg-[#000080] hover:bg-indigo-950 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition flex justify-center items-center gap-2 uppercase tracking-wider"
            >
              <Heart className="w-4 h-4 text-white fill-white" />
              <span>{lang === "hi" ? "दान देकर सहायता करें" : "Support Project with Donation"}</span>
            </button>
          )}
        </div>
      </div>

      {/* --- SMART TOOLS & CALCULATORS DRAWER SECTION --- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>{lang === "hi" ? "दान एवं प्रभाव कैलकुलेटर" : "Impact & Tax Planners"}</span>
          <Calculator className="w-4.5 h-4.5 text-blue-500" />
        </h4>

        {/* Tools Select Grid */}
        <div className="grid grid-cols-2 gap-2 text-center">
          {[
            { key: "multiplier", title: lang === "hi" ? "दान प्रभाव कैलकुलेटर" : "Impact Multiplier" },
            { key: "tax", title: lang === "hi" ? "80G टैक्स बचत" : "80G Tax Exemption" },
            { key: "runrate", title: lang === "hi" ? "अभियान पूर्णता दर" : "Completion Run-rate" },
            { key: "projector", title: lang === "hi" ? "दीर्घकालिक दान प्लान" : "Cumulative Donation" },
            { key: "leaderboard", title: lang === "hi" ? "सक्रिय सहयोगी सूची" : "Donors Leaderboard" }
          ].map(tool => (
            <button
              key={tool.key}
              onClick={() => setActiveCalc(activeCalc === tool.key ? null : tool.key)}
              className={`p-2.5 rounded-xl text-[10.5px] font-bold border transition ${
                activeCalc === tool.key ? "bg-[#000080] text-white border-[#000080]" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tool.title}
            </button>
          ))}
        </div>

        {/* Content Container */}
        {activeCalc && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2 space-y-4 animate-fadeIn text-xs">
            
            {/* 1. Impact Multiplier */}
            {activeCalc === "multiplier" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "दान राशि प्रभाव विस्तार" : "Donation Impact Estimation"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `सहयोग राशि: ₹${donateAmount.toLocaleString()}` : `Contribution: ₹${donateAmount.toLocaleString()}`}</label>
                  <input type="range" min="100" max="10000" step="100" value={donateAmount} onChange={e => setDonateAmount(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  const filterPipes = Math.round(donateAmount / 500);
                  const plants = Math.round(donateAmount / 100);
                  const midDayMeals = Math.round(donateAmount / 50);
                  const rewardPoints = Math.round(donateAmount * 0.1);
                  return (
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-slate-800 font-bold space-y-2">
                      <p className="text-[10px] text-slate-400 font-black uppercase text-center border-b border-indigo-100 pb-1">{lang === "hi" ? "आपके योगदान का प्रभाव" : "Real-world Equivalent Impact"}</p>
                      {midDayMeals > 0 && <p className="flex items-center gap-2"><Coins className="w-4 h-4 text-amber-500" /> <span>{lang === "hi" ? `${midDayMeals} गरीब बच्चों को एक समय का भोजन` : `${midDayMeals} nutritious mid-day meals`}</span></p>}
                      {plants > 0 && <p className="flex items-center gap-2"><Leaf className="w-4 h-4 text-green-600" /> <span>{lang === "hi" ? `${plants} पर्यावरण सुरक्षित पौधे रोपण` : `${plants} tree saplings planted & maintained`}</span></p>}
                      {filterPipes > 0 && <p className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600" /> <span>{lang === "hi" ? `${filterPipes} मीटर बोरवेल पाइप फिटिंग सामग्री` : `${filterPipes} meters of pipeline for rural schools`}</span></p>}
                      
                      <div className="bg-white/80 p-2 rounded border border-indigo-200/40 text-center text-[10px]">
                        <p className="text-green-700 font-extrabold">{lang === "hi" ? `अर्जित प्रभाव अंक (Points): +${rewardPoints} pts` : `Impact Points Earned: +${rewardPoints} pts`}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. 80G Tax Exemption */}
            {activeCalc === "tax" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "Section 80G टैक्स छूट कैलकुलेटर" : "Section 80G Tax Exemptions"}</h5>
                <p className="text-[9.5px] text-slate-450 font-bold leading-normal">{lang === "hi" ? "RP Foundation के सभी दान 80G के अंतर्गत आयकर कटौती के पात्र हैं।" : "Contributions to RP Foundation qualify for 50% deduction under Section 80G."}</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `सहयोग राशि: ₹${donateAmount.toLocaleString()}` : `Donation Amount: ₹${donateAmount.toLocaleString()}`}</label>
                    <input type="range" min="500" max="50000" step="500" value={donateAmount} onChange={e => setDonateAmount(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? "आपका टैक्स ब्रैकेट" : "Your Income Tax Bracket"}</label>
                    <select value={incomeSlab} onChange={e => setIncomeSlab(Number(e.target.value))} className="w-full border border-slate-200 rounded p-2 text-xs font-bold bg-white">
                      <option value="10">10% Slab</option>
                      <option value="20">20% Slab</option>
                      <option value="30">30% Slab</option>
                    </select>
                  </div>
                </div>

                {(() => {
                  const deducBase = donateAmount * 0.5; // 50% limit standard
                  const netTaxSaved = Math.round(deducBase * (incomeSlab / 100));
                  return (
                    <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                      <p className="flex justify-between"><span>{lang === "hi" ? "कर योग्य कटौती राशि:" : "Tax Deductible Amount:"}</span><span className="text-[#000080]">₹{deducBase.toLocaleString()}</span></p>
                      <p className="flex justify-between border-t border-green-200/50 pt-1.5"><span>{lang === "hi" ? "वास्तविक कर बचत:" : "Net Taxes Saved:"}</span><span className="text-green-700">₹{netTaxSaved.toLocaleString()}</span></p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 3. Campaign Run-rate */}
            {activeCalc === "runrate" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "अभियान पूर्णता अनुमान" : "Funding Completion Run-rate"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `दैनिक औसत दान: ₹${dailyDonations.toLocaleString()}` : `Average Daily Inflow: ₹${dailyDonations.toLocaleString()}`}</label>
                  <input type="range" min="500" max="10000" step="500" value={dailyDonations} onChange={e => setDailyDonations(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  const pendingTarget = 80000; // 2L target minus 1.2L raised
                  const daysRequired = Math.ceil(pendingTarget / dailyDonations);
                  return (
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-amber-900 font-bold space-y-1">
                      <p className="flex justify-between"><span>{lang === "hi" ? "शेष लक्ष्य:" : "Remaining Goal:"}</span><span>₹{pendingTarget.toLocaleString()}</span></p>
                      <p className="flex justify-between border-t border-amber-200/50 pt-1"><span>{lang === "hi" ? "लक्ष्य प्राप्ति हेतु अनुमानित समय:" : "Projected Days to Target:"}</span><span className="text-amber-850 font-black">{daysRequired} {lang === "hi" ? "दिन" : "days"}</span></p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. Cumulative Donation Planner */}
            {activeCalc === "projector" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "पुनरावर्ती मासिक दान प्रभाव" : "Recurring Impact Planner"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `मासिक प्रतिबद्धता: ₹${monthlyCommitment.toLocaleString()}` : `Monthly Backing: ₹${monthlyCommitment.toLocaleString()}`}</label>
                    <input type="range" min="100" max="2500" step="100" value={monthlyCommitment} onChange={e => setMonthlyCommitment(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `अवधि: ${commitmentMonths} महीने` : `Duration: ${commitmentMonths} months`}</label>
                    <input type="range" min="6" max="60" step="6" value={commitmentMonths} onChange={e => setCommitmentMonths(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  const totalAccumulated = monthlyCommitment * commitmentMonths;
                  const meals = Math.round(totalAccumulated / 50);
                  return (
                    <div className="bg-blue-50 border border-blue-150 p-3 rounded-lg text-blue-800 font-bold space-y-1 text-center">
                      <p className="text-[10px] text-blue-500 uppercase">{lang === "hi" ? "कुल योगदान अनुमान" : "Total Projected Contribution"}</p>
                      <p className="text-lg font-black text-[#000080]">₹{totalAccumulated.toLocaleString()}</p>
                      <p className="text-[9.5px] text-blue-600 mt-1">{lang === "hi" ? `(लगभग ${meals} गरीब बच्चों के भोजन का सालाना दायित्व)` : `(Covers approx. ${meals} individual mid-day meals)`}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 5. Leaderboard */}
            {activeCalc === "leaderboard" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "शीर्ष दानदाता" : "Top Contributors"}</h5>
                  <button onClick={toggleSort} className="text-[10px] font-black text-blue-650 hover:underline uppercase flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{lang === "hi" ? `सॉर्ट: ${sortOrder === "desc" ? "अधिकतम" : "न्यूनतम"}` : `Sort: ${sortOrder.toUpperCase()}`}</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {leaderboard.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm font-semibold">
                      <span className="text-slate-800">{item.name}</span>
                      <div className="text-right">
                        <p className="text-[#000080] font-bold">₹{item.amount.toLocaleString()}</p>
                        <p className="text-[8.5px] text-green-600">+{item.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
