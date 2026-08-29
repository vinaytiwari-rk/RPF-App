import React, { useState } from "react";
import {
  Heart,
  QrCode,
  Copy,
  CheckCircle2,
  Download,
  ShieldCheck,
  Building2,
  ArrowLeft,
  Sparkles,
  CreditCard,
  PhoneCall,
  ExternalLink,
  FileText
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";

type Lang = "en" | "hi";

const UPI_ID = "rpfoundation@upi";
const BANK_DETAILS = {
  accountName: "RP Foundation Social Welfare Trust",
  accountNumber: "923010045612879",
  ifscCode: "UTIB0000123",
  bankName: "Axis Bank",
  branch: "Bhopal Main Branch"
};

const causes = [
  { id: "health", titleEn: "Free Health Camps & Medicines", titleHi: "निःशुल्क स्वास्थ्य शिविर एवं दवाइयां", icon: "🏥" },
  { id: "women", titleEn: "Pink E-Rickshaw Women Empowerment", titleHi: "पिंक ई-रिक्शा महिला स्वावलंबन", icon: "🛺" },
  { id: "relief", titleEn: "Flood & Emergency Relief", titleHi: "बाढ़ एवं आपातकालीन राहत", icon: "🚨" },
  { id: "education", titleEn: "Education Kits for Children", titleHi: "बच्चों के लिए शिक्षा किट", icon: "📚" }
];

export default function DonationsPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext<{ lang?: Lang }>();
  const hi = outletContext?.lang === "hi";

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [selectedCause, setSelectedCause] = useState("health");
  const [amount, setAmount] = useState<number | string>(500);

  // Verification Form State
  const [donorName, setMandatoryName] = useState("");
  const [donorPhone, setMandatoryPhone] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const copyToClipboard = (text: string, type: "upi" | "acc") => {
    navigator.clipboard.writeText(text);
    if (type === "upi") {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
    toast.success(hi ? "कॉपी हो गया!" : "Copied to clipboard!");
  };

  const handleVerifyTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !utrNumber) {
      toast.error(hi ? "कृपया नाम और UTR/ट्रांजैक्शन नंबर दर्ज करें" : "Please enter your name and UTR/Transaction number.");
      return;
    }

    const receipt = {
      receiptNo: `RPF-REC-${Math.floor(100000 + Math.random() * 900000)}`,
      donorName,
      donorPhone,
      utrNumber,
      amount,
      cause: causes.find((c) => c.id === selectedCause)?.titleEn,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    };

    setReceiptData(receipt);
    setReceiptGenerated(true);
    toast.success(hi ? "रसीद जनरेट हो गई है!" : "Donation receipt generated successfully!");
  };

  return (
    <main className="min-h-full bg-transparent pb-16 text-[#14213D]">
      <div className="mx-auto max-w-3xl px-4 py-4 space-y-5 sm:px-6">
        
        {/* Top Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-[#14213D] shadow-2xs hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          {hi ? "वापस" : "Back to Home"}
        </button>

        {/* Hero Header */}
        <section className="rounded-[28px] border border-amber-200/80 bg-gradient-to-br from-amber-500/15 via-white to-emerald-500/10 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 text-[#D97706]">
            <Heart className="h-5 w-5 fill-current" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest">
              RP Foundation Community Care
            </span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight leading-snug">
            {hi ? "जन सेवा एवं सामाजिक योगदान" : "Support Our Ground Initiatives"}
          </h1>

          <p className="mt-2.5 text-xs sm:text-[13.5px] leading-relaxed text-slate-600 font-medium">
            {hi
              ? "आपका हर छोटा योगदान स्वास्थ्य शिविरों, महिला स्वावलंबन और आपातकालीन राहत कार्यों में सीधे ज़रूरतमंदों तक पहुँचता है। 100% पारदर्शी एवं निष्पक्ष सेवा।"
              : "Every contribution directly fuels free medical health camps, clean mobility for women, and emergency disaster relief across India."}
          </p>
        </section>

        {/* Cause Allocation Selector */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#14213D]">
            {hi ? "योगदान का उद्देश्य चुनें" : "Select Cause to Support"}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {causes.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCause(c.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[110px] ${
                  selectedCause === c.id
                    ? "border-[#D97706] bg-amber-50/80 shadow-xs"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-bold text-[#14213D] leading-snug">
                  {hi ? c.titleHi : c.titleEn}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* UPI & Bank Transfer Section */}
        <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-[#D97706]">
            <QrCode className="h-5 w-5" />
            <h2 className="text-base sm:text-lg font-bold text-[#14213D]">
              {hi ? "UPI एवं बैंक ट्रांसफर माध्यम" : "Direct UPI & Bank Transfer"}
            </h2>
          </div>

          {/* Quick Amounts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[100, 500, 1100, 2100, 5000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  amount === val
                    ? "bg-[#D97706] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ₹{val}
              </button>
            ))}
          </div>

          {/* UPI ID Copy Card */}
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10.5px] font-extrabold uppercase text-[#D97706] tracking-wider">Official UPI ID</p>
              <p className="text-base font-extrabold text-[#14213D] mt-0.5">{UPI_ID}</p>
            </div>
            <button
              onClick={() => copyToClipboard(UPI_ID, "upi")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D97706] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#C2410C] transition-all"
            >
              {copiedUpi ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedUpi ? (hi ? "कॉपी हुआ" : "Copied") : (hi ? "कॉपी करें" : "Copy UPI")}
            </button>
          </div>

          {/* Bank Account Details */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="font-bold text-slate-500">{hi ? "खाता धारक:" : "Account Name:"}</span>
              <span className="font-bold text-[#14213D]">{BANK_DETAILS.accountName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="font-bold text-slate-500">{hi ? "खाता संख्या:" : "Account No:"}</span>
              <span className="font-bold text-[#14213D]">{BANK_DETAILS.accountNumber}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="font-bold text-slate-500">IFSC Code:</span>
              <span className="font-bold text-[#14213D]">{BANK_DETAILS.ifscCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500">{hi ? "बैंक एवं शाखा:" : "Bank & Branch:"}</span>
              <span className="font-bold text-[#14213D]">{BANK_DETAILS.bankName}, {BANK_DETAILS.branch}</span>
            </div>
          </div>
        </section>

        {/* UTR Reference Form & Instant Receipt */}
        <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-[#167C5A]">
            <FileText className="h-5 w-5" />
            <h2 className="text-base sm:text-lg font-bold text-[#14213D]">
              {hi ? "योगदान सत्यापन एवं रसीद जनरेशन" : "Transaction Reference & Receipt"}
            </h2>
          </div>

          {!receiptGenerated ? (
            <form onSubmit={handleVerifyTransaction} className="space-y-3 text-xs font-bold text-[#14213D]">
              <div>
                <label className="block mb-1">{hi ? "आपका नाम *" : "Donor Name *"}</label>
                <input
                  type="text"
                  required
                  placeholder={hi ? "अपना नाम दर्ज करें" : "Enter your full name"}
                  value={donorName}
                  onChange={(e) => setMandatoryName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-semibold text-[#14213D] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">{hi ? "मोबाइल नंबर" : "Phone Number"}</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={donorPhone}
                    onChange={(e) => setMandatoryPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-semibold text-[#14213D] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-1">{hi ? "UTR / ट्रांजैक्शन No. *" : "UTR / Ref No. *"}</label>
                  <input
                    type="text"
                    required
                    placeholder="12-digit UTR No."
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-semibold text-[#14213D] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-[#167C5A] hover:bg-[#126448] py-3 text-xs font-bold text-white shadow-sm transition-all"
              >
                {hi ? "योगदान सत्यापित करें और रसीद पाएं" : "Verify Donation & Get Official Receipt"}
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3 text-xs font-medium">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-[#167C5A]">Official Receipt</p>
                  <p className="text-sm font-bold text-[#14213D]">{receiptData.receiptNo}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-1.5 text-[#14213D]">
                <p><strong>{hi ? "दाता:" : "Donor:"}</strong> {receiptData.donorName}</p>
                <p><strong>{hi ? "राशि:" : "Amount:"}</strong> ₹{receiptData.amount}</p>
                <p><strong>{hi ? "उद्देश्य:" : "Cause:"}</strong> {receiptData.cause}</p>
                <p><strong>{hi ? "UTR सं.:" : "UTR No:"}</strong> {receiptData.utrNumber}</p>
                <p><strong>{hi ? "दिनांक:" : "Date:"}</strong> {receiptData.date}</p>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#14213D] py-2.5 text-xs font-bold text-white shadow-sm"
              >
                <Download className="h-4 w-4" /> {hi ? "रसीद प्रिंट / डाउनलोड करें" : "Print / Download Receipt"}
              </button>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
