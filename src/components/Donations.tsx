import React, { useState } from "react";
import { DollarSign, Shield, Heart, IndianRupee, Users, ArrowUpRight, CheckCircle, TrendingUp } from "lucide-react";

interface DonationsProps {
  lang: "hi" | "en";
  onDonationComplete: (amount: number) => void;
}

export default function Donations({ lang, onDonationComplete }: DonationsProps) {
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [selectedCause, setSelectedCause] = useState("Water Service");
  const [receipt, setReceipt] = useState<any | null>(null);

  const campaigns: any[] = [];

  const recentContributions: any[] = [];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    alert(lang === "hi" ? "पेमेंट गेटवे जल्द ही आ रहा है।" : "Payment Gateway is coming soon.");
  };

  return (
    <div className="space-y-6" id="donation-section">
      <div className="bg-gradient-to-br from-slate-50 to-teal-50 rounded-md p-6 border border-slate-100">
        <h3 className="font-extrabold text-lg text-[#0f4c81] flex items-center gap-2">
          <Heart className="w-5.5 h-5.5 text-[#0f4c81] fill-[#0f4c81]" />
          {lang === "hi" ? "दान व सामाजिक सामाजिक भागीदारी" : "Donation & Social Partnerships"}
        </h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {lang === "hi" 
            ? "RP Foundation एक पूर्णतः पारदर्शी सामाजिक संस्था है। आपके द्वारा दान की गई प्रत्येक पाई सीधे लक्षित कल्याणकारी प्रोजेक्टों (जैसे स्वच्छ पेयजल, निशुल्क स्वास्थ्य शिविर एवं शिक्षा) में समाज के अंतिम व्यक्ति तक पहुंचाई जाती है।" 
            : "RP Foundation works with 100% financial transparency. Your valuable donations are put work on the ground directly supporting our clean water pipelines, rural merit awards, and remote diagnostic camps."}
        </p>
      </div>

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {campaigns.length === 0 && (
          <div className="col-span-1 md:col-span-3 border border-amber-200 bg-amber-50/40 rounded-md p-6 text-center">
            <h4 className="font-bold text-sm text-amber-900">
              {lang === "hi" ? "कोई सक्रिय अभियान नहीं" : "No Active Campaigns"}
            </h4>
            <p className="text-xs text-amber-700 mt-1">
              {lang === "hi" ? "अभियान एडमिन डैशबोर्ड से पॉप्युलेट किए जाएंगे।" : "Campaigns will be populated from Admin Dashboard."}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start" id="donation-payment-form">
        {/* Payment Form */}
        <div className="bg-white rounded-md p-5 border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-base text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Shield className="w-5 h-5 text-[#0f4c81]" />
            {lang === "hi" ? "सुरक्षित योगदान फॉर्म (UPI Integrator)" : "Secure Contribution Form"}
          </h4>

          <form onSubmit={handlePay} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "सहयोग उद्देश्य" : "Choose Welfare Cause"}</label>
              <select
                value={selectedCause}
                onChange={(e) => setSelectedCause(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF9933] outline-none"
              >
                <option value="Water Service">{lang === "hi" ? "स्वच्छ पेयजल (Water Service)" : "Clean Drinking Water Outposts"}</option>
                <option value="Education">{lang === "hi" ? "शिक्षा सहायता (Education Services)" : "Rural Highschool Scholarship"}</option>
                <option value="Health Service">{lang === "hi" ? "निशुल्क चिकित्सा शिविर (Health Camps)" : "Emergency Medical Camps"}</option>
                <option value="Afforestation">{lang === "hi" ? "पर्यावरण व वृक्षारोपण (Afforestation Drives)" : "Social Forestry & Afforestation"}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "दान राशि (₹)" : "Donation Sum (₹)"}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#FF9933] outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "आपका नाम (वैकल्पिक)" : "Your Name (Optional)"}</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder={lang === "hi" ? "उदा. सुरेश वर्मा" : "e.g. Ramesh Patel"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF9933] outline-none"
                />
              </div>
            </div>

            {/* Quick selectors for amounts */}
            <div className="flex gap-2">
              {[500, 1000, 2500, 5000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(String(val))}
                  className="bg-slate-100 hover:bg-slate-50 hover:text-[#0f4c81] text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  + ₹{val}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-[#0f4c81] hover:bg-[#0f4c81] text-white py-2.5 font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm text-sm"
            >
              <IndianRupee className="w-4 h-4" />
              {lang === "hi" ? "सुरक्षित भुगतान की ओर बढ़ें (Bhim UPI)" : "Proceed Securely via BHIM UPI"}
            </button>
          </form>

          {/* Payment receipt overlay / report */}
          {receipt && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-[#0f4c81]">
                <CheckCircle className="w-5 h-5 text-[#0f4c81]" />
                <span className="font-bold text-sm">{lang === "hi" ? "योगदान के लिए हार्दिक आभार!" : "Contribution Accomplished!"}</span>
              </div>
              <div className="border-t border-slate-200/50 pt-2 text-[11px] text-slate-600 space-y-1 font-mono">
                <div className="flex justify-between"><span>{lang === "hi" ? "भुगतानकर्ता:" : "Donor Name:"}</span><span className="font-bold">{receipt.name}</span></div>
                <div className="flex justify-between"><span>{lang === "hi" ? "सहयोग राशि:" : "Amount Funded:"}</span><span className="font-bold text-[#0f4c81]">₹{receipt.amount}</span></div>
                <div className="flex justify-between"><span>{lang === "hi" ? "उद्देश्य:" : "Cause:"}</span><span>{receipt.cause}</span></div>
                <div className="flex justify-between"><span>{lang === "hi" ? "ट्रांजैक्शन आईडी:" : "Transaction ID:"}</span><span>{receipt.txId}</span></div>
                <div className="flex justify-between"><span>{lang === "hi" ? "तारीख:" : "Timestamp:"}</span><span>{receipt.date}</span></div>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                {lang === "hi" ? "✓ 80G आयकर छूट रसीद आपके ईमेल पर भेज दी गई है।" : "✓ Your tax-deductible 80G receipt has been dispatched to your files."}
              </p>
            </div>
          )}
        </div>

        {/* transparent impacts / lists */}
        <div className="space-y-4">
          <div className="bg-white rounded-md p-5 border border-slate-100 shadow-sm space-y-3.5">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-600" />
              {lang === "hi" ? "पारदर्शी समाज सुधार आंकड़े" : "Social Trust & Impact Report"}
            </h4>

            <div className="grid grid-cols-1 gap-3.5">
              <div className="border border-amber-200 bg-amber-50/40 rounded-md p-4 text-center space-y-1">
                <p className="font-display font-black text-[11px] text-amber-950">
                  {lang === "hi" ? "डेटा आरपी फाउंडेशन एडमिन डैशबोर्ड से सिंक किया जाएगा" : "Data will be populated from RP Foundation Admin Dashboard"}
                </p>
                <p className="text-[9.5px] text-slate-500 leading-normal px-2">
                  {lang === "hi"
                    ? "कुल लाभार्थियों का विस्तृत इतिहास और वित्तीय दान विवरण सीधे प्रशासनिक पैनल से लाइव सिंक किए जाएंगे।"
                    : "Detailed beneficiary records and live financial statements are restricted to secure administrator-approved feeds."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
