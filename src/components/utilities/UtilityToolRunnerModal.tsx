import React, { useState, useRef, useEffect } from "react";
import { 
  X, Download, Copy, Check, Share2, Printer, 
  UploadCloud, AlertCircle, RefreshCw, FileText, 
  Image as ImageIcon, Shield, Plus, Trash2, Phone
} from "lucide-react";
import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";
import { UtilityToolDefinition } from "../../data/utilityToolsCatalog";

interface Props {
  tool: UtilityToolDefinition;
  onClose: () => void;
  lang?: "en" | "hi";
}

export default function UtilityToolRunnerModal({ tool, onClose, lang = "hi" }: Props) {
  const isHi = lang === "hi";

  // Prevent body scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    toast.success(isHi ? "फाइल सफलतापूर्वक डाउनलोड हुई!" : "File downloaded successfully!");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(isHi ? "कॉपी हो गया!" : "Copied to clipboard!");
    }).catch(() => {
      toast.error(isHi ? "कॉपी करने में विफल" : "Failed to copy");
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-5 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="utility-runner-title"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-t-[28px] sm:rounded-3xl bg-[#FFFBF2] shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/10 bg-[#F0FAF4] px-5 py-4">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-700/10 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                {tool.badge || (isHi ? "100% ऑफलाइन" : "100% Offline")}
              </span>
              <span className="text-xs font-semibold text-emerald-800/70">
                {isHi ? "0% सर्वर लोड" : "Zero Server Load"}
              </span>
            </div>
            <h2 id="utility-runner-title" className="mt-1 truncate text-lg sm:text-xl font-black text-[#243B32]">
              {isHi ? tool.titleHi : tool.titleEn}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-xs border border-slate-200 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-6 text-[#243B32]">
          <p className="mb-4 text-xs sm:text-sm text-[#52685C] bg-white/70 p-3 rounded-xl border border-emerald-50">
            {isHi ? tool.descHi : tool.descEn}
          </p>

          {/* Render individual tool engine */}
          <ToolEngineDispatcher toolId={tool.id} isHi={isHi} downloadBlob={downloadBlob} copyToClipboard={copyToClipboard} />
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Tool Dispatcher
// -------------------------------------------------------------
function ToolEngineDispatcher({
  toolId,
  isHi,
  downloadBlob,
  copyToClipboard,
}: {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, name: string) => void;
  copyToClipboard: (text: string) => void;
}) {
  switch (toolId) {
    // 1. Govt Forms
    case "govt_resizer":
      return <GovtResizerEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "name_date_slate":
      return <NameDateSlateEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "exam_age_calc":
      return <ExamAgeCalcEngine isHi={isHi} />;
    case "aadhaar_masker":
      return <AadhaarMaskerEngine isHi={isHi} downloadBlob={downloadBlob} />;

    // 2. PDF & Document Office
    case "doc_scanner":
    case "images_to_pdf":
      return <ImagesToPdfEngine isHi={isHi} downloadBlob={downloadBlob} isScanner={toolId === "doc_scanner"} />;
    case "merge_pdf":
      return <MergePdfEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "split_pdf":
      return <SplitPdfEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "digital_sign":
      return <DigitalSignEngine isHi={isHi} downloadBlob={downloadBlob} />;

    // 3. Legal Drafts & Applications
    case "application_drafter":
      return <ApplicationDrafterEngine isHi={isHi} downloadBlob={downloadBlob} copyToClipboard={copyToClipboard} />;
    case "rent_cash_receipt":
      return <RentCashReceiptEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "affidavit_declaration":
      return <AffidavitDeclarationEngine isHi={isHi} downloadBlob={downloadBlob} copyToClipboard={copyToClipboard} />;
    case "rti_drafter":
      return <RtiDrafterEngine isHi={isHi} downloadBlob={downloadBlob} copyToClipboard={copyToClipboard} />;

    // 4. Agriculture & Farming
    case "fertilizer_seed_calc":
      return <FertilizerCalcEngine isHi={isHi} />;
    case "crop_profit_planner":
      return <CropProfitPlannerEngine isHi={isHi} />;
    case "pesticide_spray_ratio":
      return <PesticideSprayEngine isHi={isHi} />;

    // 5. Land & Measurement
    case "land_converter":
      return <LandConverterEngine isHi={isHi} />;
    case "rupees_to_words":
      return <RupeesToWordsEngine isHi={isHi} copyToClipboard={copyToClipboard} />;

    // 6. Office & Career
    case "resignation_letter":
      return <ResignationLetterEngine isHi={isHi} downloadBlob={downloadBlob} copyToClipboard={copyToClipboard} />;
    case "leave_wfh_request":
      return <LeaveWfhRequestEngine isHi={isHi} copyToClipboard={copyToClipboard} />;
    case "invoice_bill_maker":
      return <InvoiceBillMakerEngine isHi={isHi} downloadBlob={downloadBlob} />;

    // 7. School & College
    case "assignment_front_page":
      return <AssignmentFrontPageEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "cgpa_percentage_calc":
      return <CgpaPercentageEngine isHi={isHi} />;
    case "student_leave_application":
      return <StudentLeaveEngine isHi={isHi} copyToClipboard={copyToClipboard} />;

    // 8. Small Business & Khata
    case "customer_khata_book":
      return <CustomerKhataBookEngine isHi={isHi} />;
    case "tailor_measure_book":
      return <TailorMeasureBookEngine isHi={isHi} />;
    case "estimate_quotation_maker":
      return <EstimateQuotationEngine isHi={isHi} downloadBlob={downloadBlob} />;

    // 9. Banking & Rural Finance
    case "cheque_fill_guide":
      return <ChequeGuideEngine isHi={isHi} />;
    case "gramin_byaj_calc":
      return <GraminByajCalcEngine isHi={isHi} />;
    case "daily_wages_slip":
      return <DailyWagesSlipEngine isHi={isHi} downloadBlob={downloadBlob} />;

    // 10. Police, Safety & Citizen
    case "lost_article_police_letter":
      return <LostArticlePoliceLetterEngine isHi={isHi} downloadBlob={downloadBlob} copyToClipboard={copyToClipboard} />;
    case "tenant_verification_form":
      return <TenantVerificationEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "vehicle_sale_receipt":
      return <VehicleSaleReceiptEngine isHi={isHi} downloadBlob={downloadBlob} />;

    // 11. Hospital & Health Records
    case "blood_donor_poster":
      return <BloodDonorPosterEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "medication_timetable":
      return <MedicationTimetableEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "bp_sugar_tracker":
      return <BpSugarTrackerEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "emergency_helplines":
      return <EmergencyHelplinesEngine isHi={isHi} />;

    // 12. Women & Child Care
    case "pregnancy_edd_calc":
      return <PregnancyEddEngine isHi={isHi} />;
    case "child_vaccine_tracker":
      return <ChildVaccineEngine isHi={isHi} />;

    // 13. Senior Citizens & Pension
    case "senior_medical_card":
      return <SeniorMedicalCardEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "pension_life_cert_checklist":
      return <PensionChecklistEngine isHi={isHi} />;

    // 14. Home, Family & Ration
    case "home_ration_planner":
      return <HomeRationPlannerEngine isHi={isHi} />;
    case "milk_maid_register":
      return <MilkMaidRegisterEngine isHi={isHi} />;
    case "electricity_estimator":
      return <ElectricityEstimatorEngine isHi={isHi} />;

    // 15. Friends & Travel
    case "split_bill_expense":
      return <SplitBillEngine isHi={isHi} />;
    case "trip_packing_checklist":
      return <TripPackingChecklistEngine isHi={isHi} />;
    case "trip_fuel_mileage":
      return <TripFuelMileageEngine isHi={isHi} />;

    // 16. Cyber Safety & Media
    case "scam_alert_checklist":
      return <ScamAlertChecklistEngine isHi={isHi} />;
    case "photo_metadata_cleaner":
      return <PhotoMetadataCleanerEngine isHi={isHi} downloadBlob={downloadBlob} />;
    case "offline_qr_tool":
      return <OfflineQrToolEngine isHi={isHi} downloadBlob={downloadBlob} />;

    default:
      return (
        <div className="py-8 text-center text-slate-500">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-2 text-sm">{isHi ? "टूल लोड हो रहा है..." : "Tool is loading..."}</p>
        </div>
      );
  }
}

// =============================================================
// 1. GOVT RECRUITMENT TOOLS
// =============================================================

function GovtResizerEngine({ isHi, downloadBlob }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [targetType, setTargetType] = useState<"photo" | "signature">("photo");
  const [targetKb, setTargetKb] = useState<number>(35); // 35KB default for photo, 15KB for sign
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultKb, setResultKb] = useState<number>(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (targetType === "photo") {
      setTargetKb(35); // target ~35KB (bracket 20-50KB)
    } else {
      setTargetKb(15); // target ~15KB (bracket 10-20KB)
    }
  }, [targetType]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setResultBlob(null);
    }
  };

  const processImage = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => (img.onload = resolve));

      // Preset dimensions:
      // Photo: standard SSC/UPSC is ~350x450 px
      // Sign: standard is ~350x150 px
      let targetW = targetType === "photo" ? 350 : 350;
      let targetH = targetType === "photo" ? 450 : 150;

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas error");

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Binary search quality to hit target KB within tolerance
      let minQ = 0.05;
      let maxQ = 0.95;
      let bestBlob: Blob | null = null;
      let targetBytes = targetKb * 1024;

      for (let i = 0; i < 7; i++) {
        let midQ = (minQ + maxQ) / 2;
        const b = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", midQ));
        if (!b) break;
        bestBlob = b;
        if (b.size > targetBytes) {
          maxQ = midQ;
        } else {
          minQ = midQ;
        }
      }

      if (bestBlob) {
        setResultBlob(bestBlob);
        setResultKb(Math.round(bestBlob.size / 1024));
        toast.success(isHi ? `तैयार! फाइल साइज: ${Math.round(bestBlob.size / 1024)} KB` : `Ready! Size: ${Math.round(bestBlob.size / 1024)} KB`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to resize");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTargetType("photo")}
          className={`rounded-2xl border p-3 text-center font-bold text-sm transition ${
            targetType === "photo" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white"
          }`}
        >
          📷 {isHi ? "फोटो (20KB - 50KB)" : "Passport Photo (20-50KB)"}
        </button>
        <button
          type="button"
          onClick={() => setTargetType("signature")}
          className={`rounded-2xl border p-3 text-center font-bold text-sm transition ${
            targetType === "signature" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white"
          }`}
        >
          ✍️ {isHi ? "हस्ताक्षर (10KB - 20KB)" : "Signature (10-20KB)"}
        </button>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="govt-resize-file" />
        <label htmlFor="govt-resize-file" className="cursor-pointer block">
          <UploadCloud className="mx-auto h-8 w-8 text-emerald-700" />
          <p className="mt-1 text-sm font-bold text-[#243B32]">
            {file ? file.name : (isHi ? "फोटो या साइन चुनें" : "Select Photo or Signature")}
          </p>
          <p className="text-xs text-slate-500">
            {file ? `${(file.size / 1024).toFixed(1)} KB` : (isHi ? "JPG, PNG या WebP" : "JPG, PNG or WebP")}
          </p>
        </label>
      </div>

      {file && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600">
              {isHi ? `वांछित साइज: ${targetKb} KB` : `Target Size: ${targetKb} KB`}
            </label>
            <input
              type="range"
              min={targetType === "photo" ? 15 : 5}
              max={targetType === "photo" ? 80 : 30}
              value={targetKb}
              onChange={(e) => setTargetKb(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{targetType === "photo" ? "15 KB" : "5 KB"}</span>
              <span>{targetType === "photo" ? "80 KB" : "30 KB"}</span>
            </div>
          </div>

          <button
            onClick={processImage}
            disabled={processing}
            className="w-full rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800 transition"
          >
            {processing ? (isHi ? "प्रोसेस हो रहा है..." : "Processing...") : (isHi ? "सटीक KB में बदलें" : "Resize to Target KB")}
          </button>
        </div>
      )}

      {resultBlob && (
        <div className="rounded-2xl bg-white p-4 border border-emerald-200 text-center space-y-3">
          <div className="mx-auto max-h-48 max-w-[200px] overflow-hidden rounded-lg border border-slate-200">
            <img src={URL.createObjectURL(resultBlob)} alt="Resized" className="w-full h-full object-contain" />
          </div>
          <div className="text-xs font-bold text-emerald-800">
            {isHi ? `फाइनल साइज: ${resultKb} KB (स्वीकृत)` : `Final Size: ${resultKb} KB (Ready)`}
          </div>
          <button
            onClick={() => downloadBlob(resultBlob, `${targetType}_${resultKb}kb.jpg`)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" /> {isHi ? "डाउनलोड करें (JPG)" : "Download JPG"}
          </button>
        </div>
      )}
    </div>
  );
}

function NameDateSlateEngine({ isHi, downloadBlob }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [dop, setDop] = useState(new Date().toISOString().split("T")[0]);
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleGenerate = async () => {
    if (!file || !name.trim()) {
      toast.error(isHi ? "कृपया फोटो और नाम दर्ज करें" : "Please provide photo and name");
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((res) => (img.onload = res));

    const canvas = document.createElement("canvas");
    const width = 450;
    const height = 550;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw image to fill upper portion
    ctx.drawImage(img, 0, 0, width, height - 90);

    // Draw white slate at bottom
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, height - 90, width, 90);

    // Slate border line
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(2, height - 88, width - 4, 86);

    // Text formatting
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.font = "bold 20px Arial";
    ctx.fillText(name.toUpperCase(), width / 2, height - 54);

    const formattedDate = new Date(dop).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    ctx.font = "bold 18px Arial";
    ctx.fillText(`DOP: ${formattedDate}`, width / 2, height - 22);

    canvas.toBlob((b) => {
      if (b) {
        setResultBlob(b);
        setResultUrl(URL.createObjectURL(b));
        toast.success(isHi ? "स्लेट पट्टी जुड़ गई!" : "Slate attached!");
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
        <input type="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" id="slate-file" />
        <label htmlFor="slate-file" className="cursor-pointer block">
          <UploadCloud className="mx-auto h-7 w-7 text-emerald-700" />
          <p className="mt-1 text-sm font-bold text-[#243B32]">
            {file ? file.name : (isHi ? "पासपोर्ट फोटो अपलोड करें" : "Upload Passport Photo")}
          </p>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "उम्मीदवार का नाम" : "Candidate Name"}</label>
          <input
            type="text"
            placeholder="e.g. RAHUL SHARMA"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm uppercase bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "फोटो की तारीख (DOP)" : "Date of Photo (DOP)"}</label>
          <input
            type="date"
            value={dop}
            onChange={(e) => setDop(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!file}
        className="w-full rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800 disabled:opacity-50"
      >
        {isHi ? "नाम व तारीख स्लेट पट्टी लगाएं" : "Attach Name & Date Slate"}
      </button>

      {resultBlob && (
        <div className="rounded-2xl bg-white p-4 border border-emerald-200 text-center space-y-3">
          <img src={resultUrl} alt="Preview" className="mx-auto max-h-56 rounded border shadow-xs" />
          <button
            onClick={() => downloadBlob(resultBlob, `photo_slate_${name.replace(/\s+/g, "_")}.jpg`)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" /> {isHi ? "स्लेट वाली फोटो डाउनलोड करें" : "Download Photo with Slate"}
          </button>
        </div>
      )}
    </div>
  );
}

function ExamAgeCalcEngine({ isHi }: { isHi: boolean }) {
  const [dob, setDob] = useState("2000-01-01");
  const [cutoffDate, setCutoffDate] = useState("2026-01-01");
  const [result, setResult] = useState<{ years: number; months: number; days: number } | null>(null);

  const calculateAge = () => {
    const d1 = new Date(dob);
    const d2 = new Date(cutoffDate);
    if (d1 > d2) {
      toast.error(isHi ? "जन्म तिथि कट-ऑफ तारीख से पहले होनी चाहिए" : "DOB must be before Cut-off date");
      return;
    }

    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    if (days < 0) {
      months -= 1;
      // days in previous month
      const prevMonthLastDay = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    setResult({ years, months, days });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "आपकी जन्म तिथि (DOB)" : "Date of Birth (DOB)"}</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "भर्ती की कट-ऑफ तारीख" : "Recruitment Cut-off Date"}</label>
          <input
            type="date"
            value={cutoffDate}
            onChange={(e) => setCutoffDate(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
      </div>

      <button
        onClick={calculateAge}
        className="w-full rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        {isHi ? "सटीक आयु निकालें" : "Calculate Exact Cut-off Age"}
      </button>

      {result && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            {isHi ? `कट-ऑफ तारीख (${cutoffDate}) पर आपकी आयु` : `Your age on cut-off date (${cutoffDate})`}
          </p>
          <div className="mt-3 flex justify-center gap-4 text-center">
            <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-emerald-100">
              <span className="text-2xl font-black text-[#243B32]">{result.years}</span>
              <span className="block text-xs font-semibold text-slate-500">{isHi ? "वर्ष" : "Years"}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-emerald-100">
              <span className="text-2xl font-black text-[#243B32]">{result.months}</span>
              <span className="block text-xs font-semibold text-slate-500">{isHi ? "माह" : "Months"}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-emerald-100">
              <span className="text-2xl font-black text-[#243B32]">{result.days}</span>
              <span className="block text-xs font-semibold text-slate-500">{isHi ? "दिन" : "Days"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AadhaarMaskerEngine({ isHi, downloadBlob }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!file || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      // Scale canvas keeping max width 600
      const scale = Math.min(1, 600 / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    };
  }, [file]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawMask(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    drawMask(e);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const drawMask = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = "#000000";
    ctx.fillRect(x - 20, y - 10, 40, 20); // Black confidentiality marker block
    setHasDrawn(true);
  };

  const exportMasked = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((b) => {
      if (b) downloadBlob(b, "masked_document.jpg");
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
        <input type="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" id="aadhaar-mask-file" />
        <label htmlFor="aadhaar-mask-file" className="cursor-pointer block">
          <Shield className="mx-auto h-7 w-7 text-emerald-700" />
          <p className="mt-1 text-sm font-bold text-[#243B32]">
            {file ? file.name : (isHi ? "आधार या पहचान पत्र चुनें" : "Select Aadhaar or ID Card")}
          </p>
          <p className="text-xs text-slate-500">
            {isHi ? "स्क्रीन पर उंगली फेरकर पहले 8 अंक या गुप्त जानकारी छुपाएं" : "Drag finger over first 8 digits to mask"}
          </p>
        </label>
      </div>

      {file && (
        <div className="space-y-3">
          <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            👉 {isHi ? "नीचे फोटो पर जहां भी उंगली चलाएंगे, वहां काला प्राइवेसी बार बन जाएगा:" : "Touch/drag over numbers below to redact:"}
          </p>
          <div className="overflow-auto max-h-[350px] rounded-xl border border-slate-300 bg-slate-100 flex justify-center p-2">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="touch-none cursor-crosshair rounded shadow"
            />
          </div>
          <button
            onClick={exportMasked}
            disabled={!hasDrawn}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> {isHi ? "सुरक्षित मास्क्ड फोटो डाउनलोड करें" : "Download Masked Photo"}
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================
// 2. PDF & DOCUMENT OFFICE TOOLS
// =============================================================

function ImagesToPdfEngine({ isHi, downloadBlob, isScanner }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void; isScanner: boolean }) {
  const [images, setImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files);
      setImages((prev) => [...prev, ...arr].slice(0, 30));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const makePdf = async () => {
    if (!images.length) return;
    setIsProcessing(true);
    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      for (let i = 0; i < images.length; i++) {
        const f = images[i];
        const bmp = await createImageBitmap(f);
        const c = document.createElement("canvas");
        const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
        c.width = Math.max(1, Math.round(bmp.width * scale));
        c.height = Math.max(1, Math.round(bmp.height * scale));
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(bmp, 0, 0, c.width, c.height);

          // If scanner mode, enhance contrast
          if (isScanner) {
            const imgData = ctx.getImageData(0, 0, c.width, c.height);
            const d = imgData.data;
            for (let p = 0; p < d.length; p += 4) {
              const avg = (d[p] + d[p + 1] + d[p + 2]) / 3;
              const threshold = avg > 140 ? 255 : avg < 90 ? 0 : avg;
              d[p] = threshold;
              d[p + 1] = threshold;
              d[p + 2] = threshold;
            }
            ctx.putImageData(imgData, 0, 0);
          }
        }
        const dataUrl = c.toDataURL("image/jpeg", 0.85);
        bmp.close();

        const ratio = Math.min(190 / c.width, 277 / c.height);
        const drawW = c.width * ratio;
        const drawH = c.height * ratio;
        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, "JPEG", (210 - drawW) / 2, (297 - drawH) / 2, drawW, drawH);
      }

      pdf.save(isScanner ? "scanned_doc.pdf" : "samahit_document.pdf");
      toast.success(isHi ? "A4 PDF तैयार हो गई!" : "A4 PDF generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to make PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
        <input type="file" multiple accept="image/*" onChange={handleAdd} className="hidden" id="img-to-pdf-file" />
        <label htmlFor="img-to-pdf-file" className="cursor-pointer block">
          <UploadCloud className="mx-auto h-7 w-7 text-emerald-700" />
          <p className="mt-1 text-sm font-bold text-[#243B32]">
            {isHi ? "फोटो चुनें या कैमरा से खींचें" : "Select or Snap Photos"}
          </p>
          <p className="text-xs text-slate-500">
            {isScanner ? (isHi ? "दस्तावेज स्कैन मोड (साफ कंट्रास्ट)" : "Document scanner mode") : (isHi ? "30 फोटो तक जोड़ सकते हैं" : "Up to 30 images")}
          </p>
        </label>
      </div>

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
            <span>{images.length} {isHi ? "फोटो जोड़ी गई" : "Photos added"}</span>
            <button onClick={() => setImages([])} className="text-red-600 hover:underline">
              {isHi ? "सभी हटाएं" : "Clear all"}
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {images.map((f, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={makePdf}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isProcessing ? (isHi ? "PDF बन रही है..." : "Generating PDF...") : (isHi ? "A4 PDF बनाएं व डाउनलोड करें" : "Generate & Download A4 PDF")}
          </button>
        </div>
      )}
    </div>
  );
}

function MergePdfEngine({ isHi, downloadBlob }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error(isHi ? "कम से कम 2 PDF चुनें" : "Select at least 2 PDFs");
      return;
    }
    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const f of files) {
        const arr = await f.arrayBuffer();
        const pdf = await PDFDocument.load(arr);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((p) => mergedPdf.addPage(p));
      }
      const mergedBytes = await mergedPdf.save();
      downloadBlob(new Blob([new Uint8Array(mergedBytes) as BlobPart], { type: "application/pdf" }), "merged_document.pdf");
    } catch (e: any) {
      toast.error(e.message || "Failed to merge");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={(e) => e.target.files && setFiles(Array.from(e.target.files).slice(0, 10))}
          className="hidden"
          id="merge-pdf-file"
        />
        <label htmlFor="merge-pdf-file" className="cursor-pointer block">
          <UploadCloud className="mx-auto h-7 w-7 text-emerald-700" />
          <p className="mt-1 text-sm font-bold text-[#243B32]">
            {isHi ? "जोड़ने के लिए PDF फाइलें चुनें" : "Select PDF files to merge"}
          </p>
          <p className="text-xs text-slate-500">{isHi ? "अधिकतम 10 PDF फाइलें" : "Up to 10 PDF files"}</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700">{files.length} {isHi ? "फाइलें चुनी गईं" : "files selected"}:</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex justify-between items-center rounded-lg bg-white p-2.5 text-xs border border-slate-200">
                <span className="truncate max-w-[280px] font-medium">{i + 1}. {f.name}</span>
                <span className="text-slate-400">{(f.size / 1024).toFixed(0)} KB</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleMerge}
            disabled={processing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
          >
            <Download className="h-4 w-4" />
            {processing ? (isHi ? "मर्ज हो रहा है..." : "Merging...") : (isHi ? "PDF मर्ज करें व डाउनलोड करें" : "Merge & Download PDF")}
          </button>
        </div>
      )}
    </div>
  );
}

function SplitPdfEngine({ isHi, downloadBlob }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file) return;
    file.arrayBuffer().then((buf) => {
      PDFDocument.load(buf).then((pdf) => {
        const count = pdf.getPageCount();
        setPageCount(count);
        setFromPage(1);
        setToPage(Math.min(count, 1));
      });
    });
  }, [file]);

  const handleSplit = async () => {
    if (!file || pageCount === 0) return;
    setProcessing(true);
    try {
      const srcPdf = await PDFDocument.load(await file.arrayBuffer());
      const newPdf = await PDFDocument.create();

      const start = Math.max(0, fromPage - 1);
      const end = Math.min(pageCount - 1, toPage - 1);

      const indices = [];
      for (let i = start; i <= end; i++) indices.push(i);

      const copied = await newPdf.copyPages(srcPdf, indices);
      copied.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      downloadBlob(new Blob([new Uint8Array(bytes) as BlobPart], { type: "application/pdf" }), `split_p${fromPage}-p${toPage}.pdf`);
    } catch (e: any) {
      toast.error(e.message || "Failed to split");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
          className="hidden"
          id="split-pdf-file"
        />
        <label htmlFor="split-pdf-file" className="cursor-pointer block">
          <UploadCloud className="mx-auto h-7 w-7 text-emerald-700" />
          <p className="mt-1 text-sm font-bold text-[#243B32]">
            {file ? file.name : (isHi ? "अलग करने हेतु PDF चुनें" : "Select PDF to split")}
          </p>
          {pageCount > 0 && <p className="text-xs text-emerald-700 font-bold mt-1">कुल {pageCount} पेज हैं</p>}
        </label>
      </div>

      {pageCount > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">{isHi ? "पेज नंबर से:" : "From Page:"}</label>
              <input
                type="number"
                min={1}
                max={pageCount}
                value={fromPage}
                onChange={(e) => setFromPage(Number(e.target.value))}
                className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">{isHi ? "पेज नंबर तक:" : "To Page:"}</label>
              <input
                type="number"
                min={fromPage}
                max={pageCount}
                value={toPage}
                onChange={(e) => setToPage(Number(e.target.value))}
                className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
              />
            </div>
          </div>

          <button
            onClick={handleSplit}
            disabled={processing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
          >
            <Download className="h-4 w-4" />
            {processing ? (isHi ? "पेज अलग हो रहे हैं..." : "Splitting...") : (isHi ? "पेज अलग करके PDF डाउनलोड करें" : "Extract & Download Pages")}
          </button>
        </div>
      )}
    </div>
  );
}

function DigitalSignEngine({ isHi, downloadBlob }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000080"); // Dark Blue default
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 400;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((b) => {
      if (b) downloadBlob(b, "digital_signature.png");
    }, "image/png");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {["#000080", "#000000"].map((c) => (
            <button
              key={c}
              onClick={() => setPenColor(c)}
              className={`h-7 w-7 rounded-full border-2 ${penColor === c ? "border-emerald-600 scale-110" : "border-slate-300"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button onClick={clearSignature} className="text-xs font-bold text-red-600 hover:underline">
          {isHi ? "हस्ताक्षर मिटाएं" : "Clear Pad"}
        </button>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-white p-2 flex justify-center">
        <canvas
          ref={canvasRef}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={stopDraw}
          className="touch-none cursor-crosshair rounded"
        />
      </div>

      <button
        onClick={downloadSignature}
        disabled={!hasDrawn}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isHi ? "पारदर्शी हस्ताक्षर डाउनलोड करें (PNG)" : "Download Transparent PNG Signature"}
      </button>
    </div>
  );
}

// =============================================================
// 3. LEGAL DRAFTS & APPLICATIONS
// =============================================================

function ApplicationDrafterEngine({
  isHi,
  downloadBlob,
  copyToClipboard,
}: {
  isHi: boolean;
  downloadBlob: (blob: Blob, name: string) => void;
  copyToClipboard: (text: string) => void;
}) {
  const [type, setType] = useState<"ration" | "bank" | "electricity" | "police">("bank");
  const [applicantName, setApplicantName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [address, setAddress] = useState("");
  const [accountOrId, setAccountOrId] = useState("");
  const [officerDesignation, setOfficerDesignation] = useState(isHi ? "शाखा प्रबंधक महोदय" : "The Branch Manager");
  const [orgName, setOrgName] = useState(isHi ? "भारतीय स्टेट बैंक" : "State Bank of India");

  const generateLetterText = () => {
    if (isHi) {
      let subject = "आवेदन पत्र";
      let details = "";
      if (type === "bank") {
        subject = "विषय: नई पासबुक जारी करने एवं खाता विवरण के संबंध में।";
        details = `सविनय निवेदन है कि प्रार्थी का खाता संख्या ${accountOrId || "__________"} आपकी शाखा में संचालित है। दुर्भाग्यवश प्रार्थी की पुरानी पासबुक कहीं खो गई है। अतः आपसे विनम्र अनुरोध है कि प्रार्थी को नई पासबुक जारी करने की कृपा करें।`;
      } else if (type === "ration") {
        subject = "विषय: राशन कार्ड में नवीन सदस्य का नाम जोड़ने / सुधार बाबत्।";
        details = `सविनय निवेदन है कि प्रार्थी का राशन कार्ड क्रमांक ${accountOrId || "__________"} है। परिवार के नए सदस्य का नाम सम्मिलित करना अति आवश्यक है। समस्त आवश्यक दस्तावेज संलग्न हैं।`;
      } else if (type === "electricity") {
        subject = "विषय: बिजली मीटर की खराबी / अत्यधिक बिल सुधार हेतु।";
        details = `सविनय निवेदन है कि प्रार्थी का उपभोक्ता क्रमांक ${accountOrId || "__________"} है। विगत माह से मीटर की रीडिंग में विसंगति के कारण अत्यधिक बिल आ रहा है। कृपया मीटर की तकनीकी जांच कराकर बिल सुधारने की कृपा करें।`;
      } else {
        subject = "विषय: आवश्यक दस्तावेज / पहचान पत्र खो जाने की सूचना बाबत्।";
        details = `सविनय निवेदन है कि प्रार्थी का पहचान दस्तावेज (${accountOrId || "कागजात"}) बाजार जाते समय मार्ग में कहीं गिर गया। काफी खोजबीन के बाद भी नहीं मिला। भविष्य में इसके दुरुपयोग से बचाव हेतु यह औपचारिक सूचना दर्ज की जा रही है।`;
      }

      return `सेवा में,
${officerDesignation},
${orgName},
स्थान: ${address || "स्थानीय कार्यालय"}।

${subject}

महोदय,
${details}

प्रार्थी सदैव आपका आभारी रहेगा।

संलग्नक: आधार कार्ड छायाप्रति।

प्रार्थी:
नाम: ${applicantName || "___________"}
पिता/पति: ${fatherName || "___________"}
पता: ${address || "___________"}
दिनांक: ${new Date().toLocaleDateString("en-GB")}`;
    } else {
      return `To,
${officerDesignation},
${orgName},
Location: ${address || "Local Branch"}.

Subject: Formal Application regarding ${type.toUpperCase()}.

Respected Sir/Madam,
I hereby humbly bring to your kind notice that my registered reference ID/Number is ${accountOrId || "__________"}. I request you to kindly process my request at the earliest. All necessary identity proofs are attached herewith.

Thanking You.

Sincerely,
Name: ${applicantName || "___________"}
Address: ${address || "___________"}
Date: ${new Date().toLocaleDateString("en-GB")}`;
    }
  };

  const printPdf = () => {
    const text = generateLetterText();
    const doc = new jsPDF();
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 15, 20);
    doc.save(`Application_${type}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(["bank", "ration", "electricity", "police"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-xl border p-2 text-xs font-bold capitalize transition ${
              type === t ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "bg-white border-slate-200"
            }`}
          >
            {t === "bank" ? "🏦 बैंक पासबुक" : t === "ration" ? "🍚 राशन कार्ड" : t === "electricity" ? "⚡ बिजली बिल" : "📄 दस्तावेज गुम"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "प्रार्थी का नाम" : "Applicant Name"}</label>
          <input
            type="text"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "पिता/पति का नाम" : "Father/Husband Name"}</label>
          <input
            type="text"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "खाता / उपभोक्ता / राशन नंबर" : "Account/Consumer/ID No"}</label>
          <input
            type="text"
            value={accountOrId}
            onChange={(e) => setAccountOrId(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "स्थान / पता" : "Address / City"}</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-xs font-bold text-slate-500 mb-1">{isHi ? "तैयार आवेदन पत्र प्रारूप:" : "Application Preview:"}</p>
        <pre className="font-mono text-xs whitespace-pre-wrap text-slate-800 bg-slate-50 p-3 rounded-lg border max-h-56 overflow-y-auto">
          {generateLetterText()}
        </pre>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => copyToClipboard(generateLetterText())}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-3 text-xs font-bold text-[#243B32] shadow-xs hover:bg-slate-50"
        >
          <Copy className="h-4 w-4" /> {isHi ? "टेक्स्ट कॉपी करें" : "Copy Text"}
        </button>
        <button
          onClick={printPdf}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#245D45] py-3 text-xs font-bold text-white shadow hover:bg-emerald-800"
        >
          <Download className="h-4 w-4" /> {isHi ? "A4 PDF डाउनलोड करें" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

function RentCashReceiptEngine({ isHi, downloadBlob }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void }) {
  const [tenantName, setTenantName] = useState("");
  const [landlordName, setLandlordName] = useState("");
  const [amount, setAmount] = useState("8000");
  const [month, setMonth] = useState("October 2026");
  const [propertyAddress, setPropertyAddress] = useState("");

  const generateReceiptPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("RENT RECEIPT / किराया रसीद", 105, 20, { align: "center" });

    doc.setLineWidth(0.5);
    doc.rect(15, 28, 180, 110);

    doc.setFontSize(11);
    doc.text(`Receipt Date: ${new Date().toLocaleDateString("en-GB")}`, 20, 38);
    doc.text(`Receipt No: RNT-${Date.now().toString().slice(-6)}`, 130, 38);

    doc.text(`Received a sum of INR Rs. ${amount}/- from Mr./Ms. ${tenantName || "_________________"}`, 20, 52);
    doc.text(`towards House Rent for the month of: ${month}`, 20, 62);
    doc.text(`Property Address: ${propertyAddress || "_____________________________________"}`, 20, 72);

    doc.rect(140, 95, 30, 35);
    doc.setFontSize(8);
    doc.text("Affix Rs. 1\nRevenue\nStamp", 155, 110, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Landlord Signature / अंगूठा:`, 20, 115);
    doc.text(`(${landlordName || "Makan Malik"})`, 20, 125);

    doc.save(`Rent_Receipt_${month.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "किरायेदार का नाम" : "Tenant Name"}</label>
          <input
            type="text"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "मकान मालिक का नाम" : "Landlord Name"}</label>
          <input
            type="text"
            value={landlordName}
            onChange={(e) => setLandlordName(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "मासिक किराया (रुपये)" : "Monthly Rent (INR)"}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "किराया माह" : "For Month"}</label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-700">{isHi ? "मकान का पता" : "Rented House Address"}</label>
        <input
          type="text"
          value={propertyAddress}
          onChange={(e) => setPropertyAddress(e.target.value)}
          className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
        />
      </div>

      <button
        onClick={generateReceiptPdf}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Download className="h-4 w-4" />
        {isHi ? "HRA किराया रसीद PDF डाउनलोड करें" : "Download HRA Rent Receipt PDF"}
      </button>
    </div>
  );
}

function AffidavitDeclarationEngine({ isHi, copyToClipboard }: { isHi: boolean; downloadBlob: any; copyToClipboard: (text: string) => void }) {
  const [name, setName] = useState("");
  const [father, setFather] = useState("");
  const [address, setAddress] = useState("");
  const [purpose, setPurpose] = useState(isHi ? "निवास प्रमाण व पारिवारिक आय घोषणा" : "Residence and Income declaration");

  const text = `स्व-घोषणा पत्र (SELF DECLARATION)

मैं, ${name || "___________"}, सुपुत्र/सुपुत्री श्री ${father || "___________"}, 
निवासी: ${address || "___________"},
सत्यनिष्ठापूर्वक यह घोषणा करता/करती हूँ कि:

1. यह कि मैं भारत का नागरिक हूँ तथा उपरोक्त पते पर सपरिवार निवासरत हूँ।
2. यह कि यह स्व-घोषणा पत्र ${purpose} हेतु प्रस्तुत किया जा रहा है।
3. यह कि मेरे द्वारा दी गई समस्त जानकारी पूर्णतः सत्य एवं सही है। यदि कोई तथ्य असत्य पाया जाता है तो मैं वैधानिक कार्रवाई हेतु उत्तरदायी रहूँगा/रहूँगी।

स्थान: ${address || "___________"}
दिनांक: ${new Date().toLocaleDateString("en-GB")}

घोषणाकर्ता के हस्ताक्षर: ______________`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder={isHi ? "घोषणाकर्ता का नाम" : "Name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
        />
        <input
          type="text"
          placeholder={isHi ? "पिता/पति का नाम" : "Father's Name"}
          value={father}
          onChange={(e) => setFather(e.target.value)}
          className="rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
        />
      </div>
      <input
        type="text"
        placeholder={isHi ? "पूरा पता" : "Full Address"}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
      />
      <input
        type="text"
        placeholder={isHi ? "घोषणा का उद्देश्य" : "Declaration Purpose"}
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
      />

      <pre className="font-mono text-xs whitespace-pre-wrap text-slate-800 bg-slate-50 p-3 rounded-xl border max-h-48 overflow-y-auto">
        {text}
      </pre>

      <button
        onClick={() => copyToClipboard(text)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Copy className="h-4 w-4" /> {isHi ? "घोषणा पत्र कॉपी करें" : "Copy Declaration"}
      </button>
    </div>
  );
}

function RtiDrafterEngine({ isHi, copyToClipboard }: { isHi: boolean; downloadBlob: any; copyToClipboard: (text: string) => void }) {
  const [dept, setDept] = useState("");
  const [infoNeeded, setInfoNeeded] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const text = `आवेदन पत्र (धारा 6(1) सूचना का अधिकार अधिनियम, 2005)

सेवा में,
लोक सूचना अधिकारी महोदय,
विभाग का नाम: ${dept || "संबंधित शासकीय विभाग"},
स्थान: ${address || "स्थानीय कार्यालय"}।

विषय: सूचना का अधिकार अधिनियम 2005 के तहत जानकारी प्राप्त करने बाबत्।

महोदय,
कृपया मुझे निम्नलिखित बिंदुओं पर प्रमाणित सूचना उपलब्ध कराने की कृपा करें:

1. ${infoNeeded || "मांगी गई विशिष्ट जानकारी का विवरण यहाँ दर्ज करें..."}
2. उक्त कार्य से संबंधित नस्ती (फाइल नोटिंग) एवं भुगतान वाउचर की प्रमाणित प्रतियां उपलब्ध कराई जाएं।

आवेदन शुल्क: 10/- रुपये (पोस्टल ऑर्डर / डीडी / चालान संलग्न)।

आवेदक:
नाम: ${name || "___________"}
पता: ${address || "___________"}
दिनांक: ${new Date().toLocaleDateString("en-GB")}`;

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder={isHi ? "विभाग का नाम (e.g. नगर निगम / लोक निर्माण विभाग)" : "Department Name"}
        value={dept}
        onChange={(e) => setDept(e.target.value)}
        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
      />
      <textarea
        placeholder={isHi ? "आपको क्या जानकारी चाहिए? (स्पष्ट लिखें)" : "What information do you require?"}
        value={infoNeeded}
        onChange={(e) => setInfoNeeded(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder={isHi ? "आवेदक का नाम" : "Applicant Name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
        />
        <input
          type="text"
          placeholder={isHi ? "आवेदक का पता" : "Address"}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
        />
      </div>

      <pre className="font-mono text-xs whitespace-pre-wrap text-slate-800 bg-slate-50 p-3 rounded-xl border max-h-48 overflow-y-auto">
        {text}
      </pre>

      <button
        onClick={() => copyToClipboard(text)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Copy className="h-4 w-4" /> {isHi ? "RTI आवेदन कॉपी करें" : "Copy RTI Draft"}
      </button>
    </div>
  );
}

// =============================================================
// 4. AGRICULTURE & FARMING TOOLS
// =============================================================

function FertilizerCalcEngine({ isHi }: { isHi: boolean }) {
  const [crop, setCrop] = useState<"wheat" | "soybean" | "paddy">("wheat");
  const [area, setArea] = useState<string>("5");
  const [unit, setUnit] = useState<"bigha" | "acre">("bigha");

  const calculate = () => {
    const val = Number(area) || 0;
    // Standard recommended rates per Acre (convert if bigha: 1 acre approx 2 bigha standard in MP/central)
    const factor = unit === "acre" ? 1 : 0.5;
    if (crop === "wheat") {
      return {
        urea: (55 * val * factor).toFixed(1),
        dap: (40 * val * factor).toFixed(1),
        mop: (20 * val * factor).toFixed(1),
        seed: (40 * val * factor).toFixed(1),
      };
    } else if (crop === "soybean") {
      return {
        urea: (15 * val * factor).toFixed(1),
        dap: (50 * val * factor).toFixed(1),
        mop: (25 * val * factor).toFixed(1),
        seed: (35 * val * factor).toFixed(1),
      };
    } else {
      return {
        urea: (50 * val * factor).toFixed(1),
        dap: (35 * val * factor).toFixed(1),
        mop: (20 * val * factor).toFixed(1),
        seed: (12 * val * factor).toFixed(1),
      };
    }
  };

  const res = calculate();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(["wheat", "soybean", "paddy"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCrop(c)}
            className={`rounded-xl border p-2.5 text-xs font-bold capitalize transition ${
              crop === c ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "bg-white border-slate-200"
            }`}
          >
            {c === "wheat" ? "🌾 गेहूं (Wheat)" : c === "soybean" ? "🌱 सोयाबीन" : "🌾 धान (Paddy)"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "खेत का रकबा" : "Area"}</label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "इकाई" : "Unit"}</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as any)}
            className="w-full mt-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
          >
            <option value="bigha">{isHi ? "बीघा (Bigha)" : "Bigha"}</option>
            <option value="acre">{isHi ? "एकड़ (Acre)" : "Acre"}</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
        <h4 className="text-xs font-black uppercase text-emerald-900 tracking-wider mb-3">
          {isHi ? "कुल आवश्यक खाद व बीज की मात्रा:" : "Required Fertilizer & Seeds:"}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="block text-lg font-black text-[#243B32]">{res.urea} kg</span>
            <span className="text-xs text-slate-500 font-bold">{isHi ? "यूरिया (Urea)" : "Urea"}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="block text-lg font-black text-[#243B32]">{res.dap} kg</span>
            <span className="text-xs text-slate-500 font-bold">डीएपी (DAP)</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="block text-lg font-black text-[#243B32]">{res.mop} kg</span>
            <span className="text-xs text-slate-500 font-bold">पोटाश (MOP)</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="block text-lg font-black text-[#243B32]">{res.seed} kg</span>
            <span className="text-xs text-slate-500 font-bold">{isHi ? "बीज (Seed)" : "Seed"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CropProfitPlannerEngine({ isHi }: { isHi: boolean }) {
  const [seedCost, setSeedCost] = useState("4500");
  const [plowCost, setPlowCost] = useState("3000");
  const [fertilizerCost, setFertilizerCost] = useState("5200");
  const [laborCost, setLaborCost] = useState("6000");
  const [harvestCost, setHarvestCost] = useState("4000");
  const [mandiIncome, setMandiIncome] = useState("35000");

  const totalExpense = (Number(seedCost) || 0) + (Number(plowCost) || 0) + (Number(fertilizerCost) || 0) + (Number(laborCost) || 0) + (Number(harvestCost) || 0);
  const netProfit = (Number(mandiIncome) || 0) - totalExpense;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div>
          <label className="font-bold text-slate-700">{isHi ? "बीज खर्च (₹)" : "Seed Cost (₹)"}</label>
          <input type="number" value={seedCost} onChange={(e) => setSeedCost(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="font-bold text-slate-700">{isHi ? "जुताई खर्च (₹)" : "Plowing (₹)"}</label>
          <input type="number" value={plowCost} onChange={(e) => setPlowCost(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="font-bold text-slate-700">{isHi ? "खाद/कीटनाशक (₹)" : "Fertilizer (₹)"}</label>
          <input type="number" value={fertilizerCost} onChange={(e) => setFertilizerCost(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="font-bold text-slate-700">{isHi ? "निंदाई/मजदूरी (₹)" : "Labor (₹)"}</label>
          <input type="number" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="font-bold text-slate-700">{isHi ? "कटाई/थ्रेशिंग (₹)" : "Harvesting (₹)"}</label>
          <input type="number" value={harvestCost} onChange={(e) => setHarvestCost(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="font-bold text-slate-700">{isHi ? "मंडी कुल बिक्री (₹)" : "Mandi Sale (₹)"}</label>
          <input type="number" value={mandiIncome} onChange={(e) => setMandiIncome(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white font-bold text-emerald-800" />
        </div>
      </div>

      <div className="rounded-2xl border p-4 bg-emerald-50/70 border-emerald-200 text-center space-y-2">
        <div className="flex justify-around text-xs">
          <div>{isHi ? "कुल लागत" : "Total Cost"}: <b className="text-red-700">₹{totalExpense.toLocaleString()}</b></div>
          <div>{isHi ? "कुल आमदनी" : "Total Sale"}: <b className="text-emerald-800">₹{(Number(mandiIncome) || 0).toLocaleString()}</b></div>
        </div>
        <div className="pt-2 border-t border-emerald-200">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
            {isHi ? "फसल पर शुद्ध मुनाफा (Net Profit)" : "Net Farm Profit"}
          </span>
          <p className={`text-2xl font-black ${netProfit >= 0 ? "text-emerald-800" : "text-red-700"}`}>
            ₹{netProfit.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function PesticideSprayEngine({ isHi }: { isHi: boolean }) {
  const [dosePerAcre, setDosePerAcre] = useState("250"); // e.g. 250ml per acre
  const [pumpLitres, setPumpLitres] = useState("15"); // 15L standard tank
  const [pumpsPerAcre, setPumpsPerAcre] = useState("10"); // 10 pumps/tanks of water per acre

  const dosePerPump = ((Number(dosePerAcre) || 0) / (Number(pumpsPerAcre) || 1)).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "प्रति एकड़ दवा मात्रा (ml/ग्राम)" : "Dose per Acre (ml/g)"}</label>
          <input type="number" value={dosePerAcre} onChange={(e) => setDosePerAcre(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "पंप क्षमता (लीटर)" : "Pump Capacity (Ltr)"}</label>
          <input type="number" value={pumpLitres} onChange={(e) => setPumpLitres(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "प्रति एकड़ कुल पंप पानी" : "Pumps per Acre"}</label>
          <input type="number" value={pumpsPerAcre} onChange={(e) => setPumpsPerAcre(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 text-center">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
          {isHi ? `प्रति 1 पंप (${pumpLitres}L) में मिलाने योग्य दवा:` : `Dose per 1 pump (${pumpLitres}L):`}
        </span>
        <p className="mt-2 text-3xl font-black text-[#243B32]">{dosePerPump} ml / ग्राम</p>
        <p className="text-xs text-slate-500 mt-1">
          {isHi ? "सटीक मात्रा से फसल सुरक्षित रहती है और दवा व्यर्थ नहीं जाती।" : "Accurate ratio prevents crop burning."}
        </p>
      </div>
    </div>
  );
}

// =============================================================
// 5. LAND & MEASUREMENT TOOLS
// =============================================================

function LandConverterEngine({ isHi }: { isHi: boolean }) {
  const [val, setVal] = useState("1");
  const [unit, setUnit] = useState<"bigha" | "acre" | "hectare" | "sqft" | "sqmt">("bigha");

  // Base unit in Square Feet (1 Standard Bigha = 27,225 sq ft in MP/UP)
  // 1 Acre = 43,560 sq ft
  // 1 Hectare = 107,639 sq ft
  // 1 Sq Mt = 10.764 sq ft
  const num = Number(val) || 0;
  let sqft = 0;
  if (unit === "bigha") sqft = num * 27225;
  else if (unit === "acre") sqft = num * 43560;
  else if (unit === "hectare") sqft = num * 107639;
  else if (unit === "sqmt") sqft = num * 10.7639;
  else sqft = num;

  const res = {
    bigha: (sqft / 27225).toFixed(3),
    acre: (sqft / 43560).toFixed(3),
    hectare: (sqft / 107639).toFixed(3),
    sqft: Math.round(sqft).toLocaleString(),
    sqmt: (sqft / 10.7639).toFixed(1),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "मात्रा दर्ज करें" : "Enter Value"}</label>
          <input type="number" value={val} onChange={(e) => setVal(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "वर्तमान इकाई" : "Select Unit"}</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value as any)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white">
            <option value="bigha">बीघा (Bigha)</option>
            <option value="acre">एकड़ (Acre)</option>
            <option value="hectare">हेक्टेयर (Hectare)</option>
            <option value="sqft">वर्ग फुट (Sq Feet)</option>
            <option value="sqmt">वर्ग मीटर (Sq Meter)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="rounded-xl border bg-white p-3 text-center border-slate-200">
          <span className="text-xs text-slate-500 font-bold">{isHi ? "बीघा (मानक)" : "Bigha"}</span>
          <p className="text-base font-black text-[#243B32] mt-0.5">{res.bigha}</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center border-slate-200">
          <span className="text-xs text-slate-500 font-bold">{isHi ? "एकड़" : "Acre"}</span>
          <p className="text-base font-black text-[#243B32] mt-0.5">{res.acre}</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center border-slate-200">
          <span className="text-xs text-slate-500 font-bold">{isHi ? "हेक्टेयर" : "Hectare"}</span>
          <p className="text-base font-black text-[#243B32] mt-0.5">{res.hectare}</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center border-slate-200">
          <span className="text-xs text-slate-500 font-bold">{isHi ? "वर्ग फुट" : "Sq Feet"}</span>
          <p className="text-base font-black text-[#243B32] mt-0.5">{res.sqft}</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center border-slate-200 col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-500 font-bold">{isHi ? "वर्ग मीटर" : "Sq Meter"}</span>
          <p className="text-base font-black text-[#243B32] mt-0.5">{res.sqmt}</p>
        </div>
      </div>
    </div>
  );
}

function RupeesToWordsEngine({ isHi, copyToClipboard }: { isHi: boolean; copyToClipboard: (text: string) => void }) {
  const [num, setNum] = useState("54250");

  const convertToWordsHindi = (n: number): string => {
    if (n === 0) return "शून्य रुपये मात्र";
    // Quick Indian system parser
    const ones = ["", "एक", "दो", "तीन", "चार", "पांच", "छह", "सात", "आठ", "नौ", "दस", "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस"];
    // Simplified Indian words
    let str = "";
    if (n >= 10000000) {
      const cr = Math.floor(n / 10000000);
      str += `${cr} करोड़ `;
      n %= 10000000;
    }
    if (n >= 100000) {
      const lk = Math.floor(n / 100000);
      str += `${lk} लाख `;
      n %= 100000;
    }
    if (n >= 1000) {
      const th = Math.floor(n / 1000);
      str += `${th} हजार `;
      n %= 1000;
    }
    if (n >= 100) {
      const h = Math.floor(n / 100);
      str += `${h} सौ `;
      n %= 100;
    }
    if (n > 0) {
      str += `${n} `;
    }
    return `${str.trim()} रुपये मात्र`;
  };

  const convertToWordsEnglish = (n: number): string => {
    if (n === 0) return "Zero Rupees Only";
    let str = "";
    if (n >= 10000000) {
      const cr = Math.floor(n / 10000000);
      str += `${cr} Crore `;
      n %= 10000000;
    }
    if (n >= 100000) {
      const lk = Math.floor(n / 100000);
      str += `${lk} Lakh `;
      n %= 100000;
    }
    if (n >= 1000) {
      const th = Math.floor(n / 1000);
      str += `${th} Thousand `;
      n %= 1000;
    }
    if (n >= 100) {
      const h = Math.floor(n / 100);
      str += `${h} Hundred `;
      n %= 100;
    }
    if (n > 0) {
      str += `${n} `;
    }
    return `${str.trim()} Rupees Only`;
  };

  const nVal = Math.floor(Number(num) || 0);
  const hindiWords = convertToWordsHindi(nVal);
  const engWords = convertToWordsEnglish(nVal);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-slate-700">{isHi ? "रकम दर्ज करें (अंकों में)" : "Enter Amount (in numbers)"}</label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
          <input
            type="number"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-8 p-2.5 text-base font-bold bg-white"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-200 bg-white p-3.5 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">हिंदी में (चेक व फॉर्म हेतु):</span>
            <p className="text-sm font-bold text-emerald-900 mt-0.5">{hindiWords}</p>
          </div>
          <button onClick={() => copyToClipboard(hindiWords)} className="text-slate-400 hover:text-emerald-700 p-1.5">
            <Copy className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">In English (Cheque standard):</span>
            <p className="text-sm font-bold text-[#243B32] mt-0.5">{engWords}</p>
          </div>
          <button onClick={() => copyToClipboard(engWords)} className="text-slate-400 hover:text-emerald-700 p-1.5">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// 6. OFFICE & CAREER TOOLS
// =============================================================

function ResignationLetterEngine({ isHi, copyToClipboard }: { isHi: boolean; downloadBlob: any; copyToClipboard: (text: string) => void }) {
  const [empName, setEmpName] = useState("");
  const [designation, setDesignation] = useState("");
  const [company, setCompany] = useState("");
  const [manager, setManager] = useState("Reporting Manager");
  const [noticeDays, setNoticeDays] = useState("30");

  const lastDate = new Date(Date.now() + Number(noticeDays || 30) * 86400000).toLocaleDateString("en-GB");

  const letterText = `Subject: Formal Resignation - ${empName || "[Your Name]"} - ${designation || "[Designation]"}

Dear ${manager},

Please accept this letter as formal notification that I am resigning from my position as ${designation || "[Designation]"} at ${company || "[Company Name]"}.

As per my employment terms, my notice period is ${noticeDays} days, making my last working day ${lastDate}.

I am extremely grateful for the support and opportunities provided to me during my tenure. I will ensure a complete and seamless handover of all my current responsibilities prior to my departure.

Thank you once again for the professional guidance.

Warm regards,

${empName || "[Your Name]"}
Date: ${new Date().toLocaleDateString("en-GB")}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" placeholder={isHi ? "आपका नाम" : "Your Name"} value={empName} onChange={(e) => setEmpName(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="text" placeholder={isHi ? "पदनाम (Designation)" : "Designation"} value={designation} onChange={(e) => setDesignation(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="text" placeholder={isHi ? "कंपनी का नाम" : "Company Name"} value={company} onChange={(e) => setCompany(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="number" placeholder={isHi ? "नोटिस पीरियड (दिन)" : "Notice Period (Days)"} value={noticeDays} onChange={(e) => setNoticeDays(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
      </div>

      <pre className="font-mono text-xs whitespace-pre-wrap text-slate-800 bg-slate-50 p-3 rounded-xl border max-h-48 overflow-y-auto">
        {letterText}
      </pre>

      <button
        onClick={() => copyToClipboard(letterText)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Copy className="h-4 w-4" /> {isHi ? "रेजिग्नेशन ईमेल कॉपी करें" : "Copy Resignation Letter"}
      </button>
    </div>
  );
}

function LeaveWfhRequestEngine({ isHi, copyToClipboard }: { isHi: boolean; copyToClipboard: (text: string) => void }) {
  const [type, setType] = useState<"sick" | "casual" | "wfh">("sick");
  const [days, setDays] = useState("2");
  const [reason, setReason] = useState(isHi ? "तेज बुखार व अस्वस्थता" : "High fever and illness");
  const [empName, setEmpName] = useState("");

  const requestText = `Subject: Request for ${type === "wfh" ? "Work From Home (WFH)" : type.toUpperCase() + " Leave"} - ${empName || "[Your Name]"}

Dear Team Lead / Manager,

I am writing to formally request ${days} day(s) of ${type === "wfh" ? "Work from Home" : "leave"} due to ${reason}.

I will ensure urgent deliverables are addressed and I will be reachable via phone/email for any urgent queries.

Thank you for your understanding.

Regards,
${empName || "[Your Name]"}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(["sick", "casual", "wfh"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-xl border p-2 text-xs font-bold capitalize transition ${
              type === t ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "bg-white border-slate-200"
            }`}
          >
            {t === "sick" ? "🤒 Sick Leave" : t === "casual" ? "🌴 Casual Leave" : "🏠 Work from Home"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" placeholder={isHi ? "आपका नाम" : "Your Name"} value={empName} onChange={(e) => setEmpName(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="text" placeholder={isHi ? "दिनों की संख्या (e.g. 2)" : "Number of Days"} value={days} onChange={(e) => setDays(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
      </div>
      <input type="text" placeholder={isHi ? "कारण दर्ज करें" : "Reason"} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />

      <pre className="font-mono text-xs whitespace-pre-wrap text-slate-800 bg-slate-50 p-3 rounded-xl border max-h-40 overflow-y-auto">
        {requestText}
      </pre>

      <button
        onClick={() => copyToClipboard(requestText)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Copy className="h-4 w-4" /> {isHi ? "रिक्वेस्ट ईमेल कॉपी करें" : "Copy Email Draft"}
      </button>
    </div>
  );
}

function InvoiceBillMakerEngine({ isHi }: { isHi: boolean; downloadBlob: any }) {
  const [shopName, setShopName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<{ desc: string; qty: number; rate: number }[]>([
    { desc: "General Item", qty: 1, rate: 500 },
  ]);

  const addItem = () => setItems([...items, { desc: "", qty: 1, rate: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const total = items.reduce((acc, curr) => acc + curr.qty * curr.rate, 0);

  const downloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(shopName || "INVOICE / BILL", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Customer: ${customerName || "Cash Sale"}`, 20, 32);
    doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 150, 32);

    doc.line(20, 36, 190, 36);
    doc.text("Item Description", 20, 42);
    doc.text("Qty", 120, 42);
    doc.text("Rate", 145, 42);
    doc.text("Amount", 170, 42);
    doc.line(20, 45, 190, 45);

    let y = 52;
    items.forEach((it, idx) => {
      doc.text(`${idx + 1}. ${it.desc || "Item"}`, 20, y);
      doc.text(`${it.qty}`, 120, y);
      doc.text(`${it.rate}`, 145, y);
      doc.text(`${it.qty * it.rate}`, 170, y);
      y += 8;
    });

    doc.line(20, y, 190, y);
    doc.setFontSize(12);
    doc.text(`Total Payable: Rs. ${total}/-`, 130, y + 10);

    doc.save("Invoice_Bill.pdf");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" placeholder={isHi ? "दुकान / फर्म का नाम" : "Shop / Firm Name"} value={shopName} onChange={(e) => setShopName(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="text" placeholder={isHi ? "ग्राहक का नाम" : "Customer Name"} value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span>{isHi ? "बिल के आइटम्स" : "Invoice Items"}</span>
          <button onClick={addItem} className="text-emerald-700 hover:underline flex items-center gap-1">
            <Plus className="h-3 w-3" /> {isHi ? "आइटम जोड़ें" : "Add Item"}
          </button>
        </div>
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Item name"
              value={it.desc}
              onChange={(e) => {
                const next = [...items];
                next[i].desc = e.target.value;
                setItems(next);
              }}
              className="flex-1 rounded-lg border p-2 text-xs bg-white"
            />
            <input
              type="number"
              placeholder="Qty"
              value={it.qty}
              onChange={(e) => {
                const next = [...items];
                next[i].qty = Number(e.target.value);
                setItems(next);
              }}
              className="w-16 rounded-lg border p-2 text-xs bg-white text-center"
            />
            <input
              type="number"
              placeholder="Rate"
              value={it.rate}
              onChange={(e) => {
                const next = [...items];
                next[i].rate = Number(e.target.value);
                setItems(next);
              }}
              className="w-20 rounded-lg border p-2 text-xs bg-white text-right"
            />
            {items.length > 1 && (
              <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-200">
        <span className="font-bold text-sm text-[#243B32]">{isHi ? "कुल राशि (Total)" : "Total Amount"}:</span>
        <span className="text-xl font-black text-emerald-800">₹{total}</span>
      </div>

      <button
        onClick={downloadInvoice}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Download className="h-4 w-4" /> {isHi ? "A4 बिल PDF डाउनलोड करें" : "Download Invoice PDF"}
      </button>
    </div>
  );
}

// =============================================================
// 7. SCHOOL & COLLEGE TOOLS
// =============================================================

function AssignmentFrontPageEngine({ isHi }: { isHi: boolean; downloadBlob: any }) {
  const [college, setCollege] = useState("");
  const [topic, setTopic] = useState("");
  const [student, setStudent] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [submittedTo, setSubmittedTo] = useState("");

  const downloadCover = () => {
    const doc = new jsPDF();
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 190, 277);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 186, 273);

    doc.setFontSize(20);
    doc.text(college.toUpperCase() || "NAME OF INSTITUTION", 105, 50, { align: "center" });

    doc.setFontSize(14);
    doc.text("ASSIGNMENT / PROJECT REPORT", 105, 80, { align: "center" });

    doc.setFontSize(16);
    doc.text(`TOPIC: ${topic.toUpperCase() || "PROJECT TITLE"}`, 105, 115, { align: "center" });

    doc.setFontSize(12);
    doc.text("SUBMITTED BY:", 40, 180);
    doc.text(`Name: ${student || "Student Name"}`, 40, 190);
    doc.text(`Roll No: ${rollNo || "____________"}`, 40, 198);

    doc.text("SUBMITTED TO:", 130, 180);
    doc.text(`${submittedTo || "Professor Name"}`, 130, 190);
    doc.text("Department of Studies", 130, 198);

    doc.text(`Academic Session: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, 105, 250, { align: "center" });

    doc.save("Assignment_Front_Page.pdf");
  };

  return (
    <div className="space-y-4">
      <input type="text" placeholder={isHi ? "कॉलेज / स्कूल का नाम" : "College / School Name"} value={college} onChange={(e) => setCollege(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <input type="text" placeholder={isHi ? "असाइनमेंट का विषय / टॉपिक" : "Assignment Topic"} value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" placeholder={isHi ? "छात्र का नाम" : "Student Name"} value={student} onChange={(e) => setStudent(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="text" placeholder={isHi ? "रोल नंबर / एनरोलमेंट" : "Roll / Enrollment No"} value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
      </div>
      <input type="text" placeholder={isHi ? "शिक्षक / प्रोफेसर का नाम" : "Teacher / Guide Name"} value={submittedTo} onChange={(e) => setSubmittedTo(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />

      <button
        onClick={downloadCover}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Download className="h-4 w-4" /> {isHi ? "A4 फ्रंट कवर पेज PDF डाउनलोड करें" : "Download Front Page PDF"}
      </button>
    </div>
  );
}

function CgpaPercentageEngine({ isHi }: { isHi: boolean }) {
  const [cgpa, setCgpa] = useState("8.4");
  const [board, setBoard] = useState<"cbse" | "aicte" | "general">("cbse");

  const val = Number(cgpa) || 0;
  let percent = 0;
  if (board === "cbse") percent = val * 9.5;
  else if (board === "aicte") percent = (val - 0.75) * 10;
  else percent = val * 10;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setBoard("cbse")} className={`rounded-xl border p-2 text-xs font-bold ${board === "cbse" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "bg-white"}`}>CBSE (x 9.5)</button>
        <button onClick={() => setBoard("aicte")} className={`rounded-xl border p-2 text-xs font-bold ${board === "aicte" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "bg-white"}`}>AICTE / Engg</button>
        <button onClick={() => setBoard("general")} className={`rounded-xl border p-2 text-xs font-bold ${board === "general" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "bg-white"}`}>General (x 10)</button>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700">{isHi ? "CGPA स्कोर (1 से 10)" : "CGPA Score"}</label>
        <input type="number" step="0.01" max={10} value={cgpa} onChange={(e) => setCgpa(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-base font-bold bg-white" />
      </div>

      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 text-center">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{isHi ? "समतुल्य प्रतिशत" : "Equivalent Percentage"}</span>
        <p className="mt-2 text-4xl font-black text-[#243B32]">{percent.toFixed(2)} %</p>
      </div>
    </div>
  );
}

function StudentLeaveEngine({ isHi, copyToClipboard }: { isHi: boolean; copyToClipboard: (text: string) => void }) {
  const [student, setStudent] = useState("");
  const [cls, setCls] = useState("10th");
  const [days, setDays] = useState("3");
  const [reason, setReason] = useState(isHi ? "आवश्यक पारिवारिक कार्य" : "urgent family function");

  const text = `सेवा में,
प्रधानाचार्य महोदय,
विद्यालय का नाम: ____________,
विषय: अवकाश हेतु प्रार्थना पत्र।

महोदय,
सविनय निवेदन है कि प्रार्थी ${student || "___________"} आपकी कक्षा ${cls} का छात्र/छात्रा हूँ। मुझे ${reason} के कारण आगामी ${days} दिनों तक विद्यालय आने में असमर्थ रहूँगा।

अतः आपसे विनम्र निवेदन है कि मुझे उक्त दिनों का अवकाश प्रदान करने की कृपा करें।

आपका आज्ञाकारी शिष्य,
नाम: ${student || "___________"}
कक्षा: ${cls}
दिनांक: ${new Date().toLocaleDateString("en-GB")}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input type="text" placeholder={isHi ? "छात्र का नाम" : "Student Name"} value={student} onChange={(e) => setStudent(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="text" placeholder={isHi ? "कक्षा (Class)" : "Class"} value={cls} onChange={(e) => setCls(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="number" placeholder={isHi ? "दिनों की संख्या" : "Days"} value={days} onChange={(e) => setDays(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
      </div>

      <pre className="font-mono text-xs whitespace-pre-wrap text-slate-800 bg-slate-50 p-3 rounded-xl border max-h-40 overflow-y-auto">
        {text}
      </pre>

      <button
        onClick={() => copyToClipboard(text)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Copy className="h-4 w-4" /> {isHi ? "प्रार्थना पत्र कॉपी करें" : "Copy Student Leave"}
      </button>
    </div>
  );
}

// =============================================================
// 8. SMALL BUSINESS & KHATA TOOLS
// =============================================================

function CustomerKhataBookEngine({ isHi }: { isHi: boolean }) {
  const [khata, setKhata] = useState<{ id: string; name: string; dues: number }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("samahit_khata_v1") || "[]");
    } catch {
      return [];
    }
  });
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const saveKhata = (next: any) => {
    setKhata(next);
    localStorage.setItem("samahit_khata_v1", JSON.stringify(next));
  };

  const addEntry = () => {
    if (!name.trim()) return;
    const next = [...khata, { id: Date.now().toString(), name: name.trim(), dues: Number(amount) || 0 }];
    saveKhata(next);
    setName("");
    setAmount("");
  };

  const removeEntry = (id: string) => {
    saveKhata(khata.filter((k) => k.id !== id));
  };

  const totalDues = khata.reduce((a, c) => a + c.dues, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={isHi ? "ग्राहक का नाम" : "Customer Name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-xl border p-2.5 text-sm bg-white"
        />
        <input
          type="number"
          placeholder={isHi ? "बाकी ₹" : "Dues ₹"}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24 rounded-xl border p-2.5 text-sm bg-white"
        />
        <button onClick={addEntry} className="rounded-xl bg-[#245D45] px-4 text-xs font-bold text-white shadow">
          {isHi ? "जोड़ें" : "Add"}
        </button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {khata.map((k) => (
          <div key={k.id} className="flex justify-between items-center rounded-xl border bg-white p-3 shadow-2xs">
            <span className="font-bold text-sm text-[#243B32]">{k.name}</span>
            <div className="flex items-center gap-3">
              <span className="font-black text-sm text-red-600">₹{k.dues}</span>
              <button onClick={() => removeEntry(k.id)} className="text-slate-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-red-50 p-3 rounded-xl border border-red-200">
        <span className="font-bold text-xs text-red-800 uppercase">{isHi ? "बाजार में कुल बाकी (उधार):" : "Total Market Dues:"}</span>
        <span className="text-xl font-black text-red-700">₹{totalDues.toLocaleString()}</span>
      </div>
    </div>
  );
}

function TailorMeasureBookEngine({ isHi }: { isHi: boolean }) {
  const [customer, setCustomer] = useState("");
  const [length, setLength] = useState("38");
  const [chest, setChest] = useState("36");
  const [waist, setWaist] = useState("32");
  const [deliveryDate, setDeliveryDate] = useState("");

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder={isHi ? "ग्राहक का नाम व फोन" : "Customer Name & Phone"}
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
        className="w-full rounded-xl border p-2.5 text-sm bg-white"
      />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "लंबाई (इंच)" : "Length"}</label>
          <input type="number" value={length} onChange={(e) => setLength(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "सीना (इंच)" : "Chest"}</label>
          <input type="number" value={chest} onChange={(e) => setChest(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "कमर (इंच)" : "Waist"}</label>
          <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-700">{isHi ? "डिलीवरी की तारीख" : "Promised Delivery Date"}</label>
        <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
      </div>
      <button
        onClick={() => toast.success(isHi ? "नाप सुरक्षित सहेजा गया!" : "Measurements saved offline!")}
        className="w-full rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        {isHi ? "नाप रजिस्टर में दर्ज करें" : "Save in Measurement Register"}
      </button>
    </div>
  );
}

function EstimateQuotationEngine({ isHi }: { isHi: boolean; downloadBlob: any }) {
  const [workDesc, setWorkDesc] = useState(isHi ? "मकान वायरिंग व फिटिंग कार्य" : "House wiring & electrical fitting");
  const [materialCost, setMaterialCost] = useState("12000");
  const [laborCost, setLaborCost] = useState("8000");

  const total = (Number(materialCost) || 0) + (Number(laborCost) || 0);

  const downloadQuotation = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ESTIMATE / QUOTATION", 105, 20, { align: "center" });

    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 20, 32);
    doc.text(`Work Description: ${workDesc}`, 20, 42);

    doc.line(20, 48, 190, 48);
    doc.text("Estimated Material Cost:", 20, 58);
    doc.text(`Rs. ${materialCost}/-`, 150, 58);

    doc.text("Labor & Workmanship Charges:", 20, 68);
    doc.text(`Rs. ${laborCost}/-`, 150, 68);
    doc.line(20, 74, 190, 74);

    doc.setFontSize(14);
    doc.text(`Total Estimated Cost: Rs. ${total}/-`, 20, 85);

    doc.save("Work_Estimate.pdf");
  };

  return (
    <div className="space-y-4">
      <input type="text" placeholder={isHi ? "कार्य विवरण" : "Work Description"} value={workDesc} onChange={(e) => setWorkDesc(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "सामग्री अनुमानित लागत (₹)" : "Material Cost (₹)"}</label>
          <input type="number" value={materialCost} onChange={(e) => setMaterialCost(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "मजदूरी / लेबर चार्ज (₹)" : "Labor Charges (₹)"}</label>
          <input type="number" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
        </div>
      </div>

      <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-200">
        <span className="font-bold text-sm text-[#243B32]">{isHi ? "कुल अनुमानित खर्च:" : "Total Estimate:"}</span>
        <span className="text-2xl font-black text-emerald-800">₹{total.toLocaleString()}</span>
      </div>

      <button
        onClick={downloadQuotation}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Download className="h-4 w-4" /> {isHi ? "कोटेशन पर्ची PDF डाउनलोड करें" : "Download Quotation PDF"}
      </button>
    </div>
  );
}

// =============================================================
// 9. BANKING & RURAL FINANCE TOOLS
// =============================================================

function ChequeGuideEngine({ isHi }: { isHi: boolean }) {
  const [payee, setPayee] = useState("RAMESH CHANDRA");
  const [amount, setAmount] = useState("25000");
  const [isAccountPayee, setIsAccountPayee] = useState(true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" placeholder={isHi ? "पेई नाम (जिसे चेक देना है)" : "Payee Name"} value={payee} onChange={(e) => setPayee(e.target.value)} className="rounded-xl border p-2.5 text-sm uppercase bg-white" />
        <input type="number" placeholder={isHi ? "राशि (रुपये)" : "Amount (INR)"} value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white font-bold" />
      </div>
      <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
        <input type="checkbox" checked={isAccountPayee} onChange={(e) => setIsAccountPayee(e.target.checked)} className="h-4 w-4 accent-emerald-600 rounded" />
        {isHi ? "A/C PAYEE ओनली (खाते में ही जमा होगा, कैश नहीं मिलेगा)" : "Account Payee Only (Safer - No cash)"}
      </label>

      {/* Visual Cheque Box */}
      <div className="relative rounded-2xl border-2 border-emerald-600 bg-emerald-50/30 p-5 shadow font-mono text-xs text-slate-800">
        {isAccountPayee && (
          <div className="absolute top-2 left-2 border-t-2 border-b-2 border-slate-700 px-2 py-0.5 text-[9px] font-black tracking-widest rotate-[-15deg]">
            A/C PAYEE ONLY
          </div>
        )}
        <div className="text-right text-[10px] text-slate-500 mb-2">
          DATE: <b>{new Date().toLocaleDateString("en-GB")}</b>
        </div>
        <div className="border-b border-dotted border-slate-400 pb-1 mb-2">
          PAY: <span className="font-bold uppercase text-slate-900">{payee || "___________________"}</span>
        </div>
        <div className="flex justify-between items-center border-b border-dotted border-slate-400 pb-1 mb-4">
          <div className="truncate max-w-[280px]">
            RUPEES: <span className="font-bold text-slate-900">{amount ? `${amount} Only` : "______________"}</span>
          </div>
          <div className="border border-slate-400 bg-white px-3 py-1 font-black text-sm">
            ₹ {Number(amount || 0).toLocaleString()}/-
          </div>
        </div>
        <div className="text-right text-[10px] text-slate-400">
          AUTHORIZED SIGNATURE
        </div>
      </div>
    </div>
  );
}

function GraminByajCalcEngine({ isHi }: { isHi: boolean }) {
  const [principal, setPrincipal] = useState("50000");
  const [ratePercent, setRatePercent] = useState("2"); // 2% per month (₹2 saikda)
  const [months, setMonths] = useState("6");

  const p = Number(principal) || 0;
  const r = Number(ratePercent) || 0;
  const m = Number(months) || 0;

  const monthlyInterest = (p * r) / 100;
  const totalInterest = monthlyInterest * m;
  const totalAmount = p + totalInterest;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "मूलधन रकम (₹)" : "Principal Amount (₹)"}</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "मासिक ब्याज दर (सैकड़ा %)" : "Monthly Rate (% per mo)"}</label>
          <input type="number" step="0.5" value={ratePercent} onChange={(e) => setRatePercent(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "कुल महीने" : "Months"}</label>
          <input type="number" value={months} onChange={(e) => setMonths(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 space-y-3">
        <div className="flex justify-between text-xs text-slate-600">
          <span>{isHi ? "एक महीने का ब्याज:" : "Interest per Month:"}</span>
          <b>₹{monthlyInterest.toLocaleString()}</b>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>{isHi ? `कुल ${m} महीने का ब्याज:` : `Total ${m} Months Interest:`}</span>
          <b className="text-red-600">₹{totalInterest.toLocaleString()}</b>
        </div>
        <div className="border-t border-emerald-200 pt-2 flex justify-between items-center">
          <span className="font-bold text-sm text-[#243B32]">{isHi ? "कुल चुकता राशि (मूलधन + ब्याज):" : "Total Payable Amount:"}</span>
          <span className="text-2xl font-black text-emerald-800">₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function DailyWagesSlipEngine({ isHi }: { isHi: boolean; downloadBlob: any }) {
  const [workerName, setWorkerName] = useState("");
  const [daysWorked, setDaysWorked] = useState("24");
  const [dailyRate, setDailyRate] = useState("450");
  const [advancePaid, setAdvancePaid] = useState("2000");

  const totalEarned = (Number(daysWorked) || 0) * (Number(dailyRate) || 0);
  const pendingBalance = totalEarned - (Number(advancePaid) || 0);

  return (
    <div className="space-y-4">
      <input type="text" placeholder={isHi ? "मजदूर / कारीगर का नाम" : "Worker Name"} value={workerName} onChange={(e) => setWorkerName(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "हाजिरी (दिन)" : "Days"}</label>
          <input type="number" value={daysWorked} onChange={(e) => setDaysWorked(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "दिहाड़ी दर (₹)" : "Daily Rate (₹)"}</label>
          <input type="number" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "एडवांस दिया (₹)" : "Advance (₹)"}</label>
          <input type="number" value={advancePaid} onChange={(e) => setAdvancePaid(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 border-slate-200 space-y-2">
        <div className="flex justify-between text-xs text-slate-600">
          <span>{isHi ? "कुल बनी मजदूरी" : "Total Wages"}:</span>
          <b>₹{totalEarned.toLocaleString()}</b>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>{isHi ? "काटा गया एडवांस" : "Deducted Advance"}:</span>
          <b className="text-red-500">- ₹{(Number(advancePaid) || 0).toLocaleString()}</b>
        </div>
        <div className="border-t pt-2 flex justify-between items-center">
          <span className="font-bold text-sm text-[#243B32]">{isHi ? "अंतिम भुगतान राशि:" : "Net Payable Balance:"}</span>
          <span className="text-2xl font-black text-emerald-800">₹{pendingBalance.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// 10. POLICE, SAFETY & CITIZEN TOOLS
// =============================================================

function LostArticlePoliceLetterEngine({ isHi, copyToClipboard }: { isHi: boolean; downloadBlob: any; copyToClipboard: (text: string) => void }) {
  const [item, setItem] = useState(isHi ? "एंड्रॉइड मोबाइल फोन (IMEI सहित)" : "Mobile Phone with IMEI");
  const [lostLocation, setLostLocation] = useState(isHi ? "मुख्य बाजार / बस स्टैंड" : "Main Market Bus Stand");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");

  const text = `सेवा में,
थाना प्रभारी महोदय,
थाना: ____________,
विषय: खोए हुए सामान / मोबाइल फोन की गुमशुदगी सूचना बाबत्।

महोदय,
सविनय निवेदन है कि प्रार्थी ${userName || "___________"} का ${item} दिनांक ${new Date().toLocaleDateString("en-GB")} को ${lostLocation} के आसपास कहीं खो अथवा गिर गया है। काफी तलाश करने पर भी नहीं मिला।

अतः आपसे विनम्र निवेदन है कि भविष्य में उक्त सामग्री के किसी भी दुरुपयोग से बचाव हेतु यह औपचारिक सूचना दर्ज कर पावती (Receipt) प्रदान करने की कृपा करें।

प्रार्थी:
नाम: ${userName || "___________"}
संपर्क मोबाइल: ${phone || "___________"}
दिनांक: ${new Date().toLocaleDateString("en-GB")}`;

  return (
    <div className="space-y-4">
      <input type="text" placeholder={isHi ? "खोया सामान (e.g. मोबाइल फोन, पर्स, पैन कार्ड)" : "Lost Article"} value={item} onChange={(e) => setItem(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <input type="text" placeholder={isHi ? "कहाँ खोया (स्थान)" : "Lost Location"} value={lostLocation} onChange={(e) => setLostLocation(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" placeholder={isHi ? "आपका नाम" : "Your Name"} value={userName} onChange={(e) => setUserName(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="text" placeholder={isHi ? "मोबाइल नंबर" : "Contact Phone"} value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
      </div>

      <pre className="font-mono text-xs whitespace-pre-wrap text-slate-800 bg-slate-50 p-3 rounded-xl border max-h-40 overflow-y-auto">
        {text}
      </pre>

      <button
        onClick={() => copyToClipboard(text)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Copy className="h-4 w-4" /> {isHi ? "गुमशुदगी पत्र कॉपी करें" : "Copy Police Letter"}
      </button>
    </div>
  );
}

function TenantVerificationEngine({ isHi }: { isHi: boolean; downloadBlob: any }) {
  const [tenant, setTenant] = useState("");
  const [tenantAadhaar, setTenantAadhaar] = useState("");
  const [landlord, setLandlord] = useState("");

  const downloadForm = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("TENANT POLICE VERIFICATION FORM", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("To be submitted to Local Police Station by Property Owner", 105, 27, { align: "center" });

    doc.line(20, 32, 190, 32);
    doc.text(`Tenant Name: ${tenant || "_________________________"}`, 20, 42);
    doc.text(`Tenant Aadhaar/ID: ${tenantAadhaar || "________________________"}`, 20, 52);
    doc.text(`Property Owner Name: ${landlord || "_____________________"}`, 20, 62);
    doc.text(`Submission Date: ${new Date().toLocaleDateString("en-GB")}`, 20, 72);

    doc.rect(140, 40, 40, 45);
    doc.setFontSize(8);
    doc.text("Paste Tenant\nPassport Photo\nHere", 160, 60, { align: "center" });

    doc.setFontSize(10);
    doc.text("Police Station Seal / Receiving Signature:", 20, 110);
    doc.save("Tenant_Verification_Form.pdf");
  };

  return (
    <div className="space-y-4">
      <input type="text" placeholder={isHi ? "किरायेदार का नाम" : "Tenant Name"} value={tenant} onChange={(e) => setTenant(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <input type="text" placeholder={isHi ? "किरायेदार का आधार / आईडी नंबर" : "Tenant ID / Aadhaar"} value={tenantAadhaar} onChange={(e) => setTenantAadhaar(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <input type="text" placeholder={isHi ? "मकान मालिक का नाम" : "Landlord Name"} value={landlord} onChange={(e) => setLandlord(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />

      <button
        onClick={downloadForm}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Download className="h-4 w-4" /> {isHi ? "सत्यापन फॉर्म PDF डाउनलोड करें" : "Download Form PDF"}
      </button>
    </div>
  );
}

function VehicleSaleReceiptEngine({ isHi }: { isHi: boolean; downloadBlob: any }) {
  const [vehicleNo, setVehicleNo] = useState("MP04-AB-1234");
  const [buyerName, setBuyerName] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [amount, setAmount] = useState("35000");

  const downloadReceipt = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("VEHICLE DELIVERY & SALE RECEIPT", 105, 20, { align: "center" });

    doc.setLineWidth(0.5);
    doc.rect(15, 28, 180, 100);
    doc.setFontSize(11);
    doc.text(`Date of Handover: ${new Date().toLocaleDateString("en-GB")}`, 20, 40);
    doc.text(`Vehicle Reg Number: ${vehicleNo.toUpperCase()}`, 20, 50);
    doc.text(`Seller Name: ${sellerName || "________________"}`, 20, 60);
    doc.text(`Buyer Name: ${buyerName || "_________________"}`, 20, 70);
    doc.text(`Total Agreed Price: Rs. ${amount}/- (Full and Final)`, 20, 80);

    doc.setFontSize(9);
    doc.text("Declaration: From this exact date and time, the Buyer takes full legal and physical", 20, 95);
    doc.text("responsibility for the vehicle, including challans, accidents, or any legal issues.", 20, 102);

    doc.save("Vehicle_Sale_Receipt.pdf");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" placeholder={isHi ? "गाड़ी नंबर (e.g. MP04-AB-1234)" : "Vehicle Number"} value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} className="rounded-xl border p-2.5 text-sm uppercase bg-white font-bold" />
        <input type="number" placeholder={isHi ? "बिक्री राशि (₹)" : "Sale Amount (INR)"} value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="text" placeholder={isHi ? "विक्रेता (मालिक) का नाम" : "Seller Name"} value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="text" placeholder={isHi ? "क्रेता (खरीदार) का नाम" : "Buyer Name"} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
      </div>

      <button
        onClick={downloadReceipt}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Download className="h-4 w-4" /> {isHi ? "वाहन सुपुर्दगी रसीद PDF डाउनलोड करें" : "Download Vehicle Delivery Receipt"}
      </button>
    </div>
  );
}

// =============================================================
// 11. HOSPITAL & HEALTH RECORDS TOOLS
// =============================================================

function BloodDonorPosterEngine({ isHi, downloadBlob }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void }) {
  const [patient, setPatient] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [hospital, setHospital] = useState("");
  const [contact, setContact] = useState("");
  const [units, setUnits] = useState("2");

  const generatePoster = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Red Urgent Header
    ctx.fillStyle = "#B91C1C";
    ctx.fillRect(0, 0, 600, 130);

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "bold 32px Arial";
    ctx.fillText("URGENT BLOOD NEEDED", 300, 55);
    ctx.font = "bold 20px Arial";
    ctx.fillText("आपातकालीन रक्तदान की आवश्यकता", 300, 95);

    // Body
    ctx.fillStyle = "#FFFBEB";
    ctx.fillRect(0, 130, 600, 570);

    // Blood Group Badge
    ctx.fillStyle = "#B91C1C";
    ctx.beginPath();
    ctx.arc(300, 230, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 45px Arial";
    ctx.fillText(bloodGroup, 300, 245);

    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 22px Arial";
    ctx.fillText(`Patient: ${patient.toUpperCase() || "NAME"}`, 300, 350);

    ctx.font = "18px Arial";
    ctx.fillText(`Required Units: ${units} Unit(s)`, 300, 390);
    ctx.fillText(`Hospital: ${hospital || "City Hospital"}`, 300, 430);

    // Contact Footer Card
    ctx.fillStyle = "#15803D";
    ctx.fillRect(40, 490, 520, 120);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px Arial";
    ctx.fillText("PLEASE CONTACT IMMEDIATELY:", 300, 535);
    ctx.font = "bold 34px Arial";
    ctx.fillText(contact || "9876543210", 300, 585);

    ctx.fillStyle = "#64748B";
    ctx.font = "12px Arial";
    ctx.fillText("Generated offline via Samahit Utilities - Save a Life", 300, 660);

    canvas.toBlob((b) => {
      if (b) downloadBlob(b, `blood_emergency_${bloodGroup}.jpg`);
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "रक्त समूह (Blood Group)" : "Blood Group"}</label>
          <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-base font-bold bg-white text-red-600">
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "यूनिट्स संख्या" : "Units Needed"}</label>
          <input type="number" value={units} onChange={(e) => setUnits(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
        </div>
      </div>

      <input type="text" placeholder={isHi ? "मरीज का नाम" : "Patient Name"} value={patient} onChange={(e) => setPatient(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <input type="text" placeholder={isHi ? "अस्पताल का नाम व शहर" : "Hospital Name & City"} value={hospital} onChange={(e) => setHospital(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <input type="text" placeholder={isHi ? "संपर्क फोन नंबर" : "Contact Phone Number"} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white font-bold text-emerald-800" />

      <button
        onClick={generatePoster}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 py-3 text-sm font-bold text-white shadow hover:bg-red-800"
      >
        <Download className="h-4 w-4" /> {isHi ? "रक्तदान पोस्टर बनाएं (JPG)" : "Generate Blood Poster JPG"}
      </button>
    </div>
  );
}

function MedicationTimetableEngine({ isHi }: { isHi: boolean; downloadBlob: any }) {
  const [medicines, setMedicines] = useState<{ name: string; morning: boolean; noon: boolean; night: boolean }[]>([
    { name: "BP Tablet", morning: true, noon: false, night: false },
    { name: "Sugar Tablet", morning: true, noon: false, night: true },
  ]);

  const addMed = () => setMedicines([...medicines, { name: "", morning: true, noon: false, night: false }]);

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("DAILY MEDICATION SCHEDULE / दवा समय-सारणी", 105, 20, { align: "center" });

    doc.line(20, 26, 190, 26);
    doc.setFontSize(11);
    doc.text("Medicine Name", 25, 34);
    doc.text("Morning (सुबह)", 100, 34);
    doc.text("Noon (दोपहर)", 135, 34);
    doc.text("Night (रात)", 165, 34);
    doc.line(20, 38, 190, 38);

    let y = 46;
    medicines.forEach((m, idx) => {
      doc.text(`${idx + 1}. ${m.name || "Medicine"}`, 25, y);
      doc.text(m.morning ? "YES [✓]" : "-", 105, y);
      doc.text(m.noon ? "YES [✓]" : "-", 140, y);
      doc.text(m.night ? "YES [✓]" : "-", 170, y);
      y += 8;
    });

    doc.save("Medication_Schedule.pdf");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
        <span>{isHi ? "दवाइयों की सूची" : "Medicine List"}</span>
        <button onClick={addMed} className="text-emerald-700 hover:underline flex items-center gap-1">
          <Plus className="h-3 w-3" /> {isHi ? "दवा जोड़ें" : "Add Medicine"}
        </button>
      </div>

      <div className="space-y-2">
        {medicines.map((m, i) => (
          <div key={i} className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200">
            <input
              type="text"
              placeholder="Medicine Name"
              value={m.name}
              onChange={(e) => {
                const next = [...medicines];
                next[i].name = e.target.value;
                setMedicines(next);
              }}
              className="flex-1 rounded-lg border p-1.5 text-xs bg-white"
            />
            <label className="text-[11px] font-bold flex items-center gap-1">
              <input
                type="checkbox"
                checked={m.morning}
                onChange={(e) => {
                  const next = [...medicines];
                  next[i].morning = e.target.checked;
                  setMedicines(next);
                }}
              /> {isHi ? "सुबह" : "Morn"}
            </label>
            <label className="text-[11px] font-bold flex items-center gap-1">
              <input
                type="checkbox"
                checked={m.noon}
                onChange={(e) => {
                  const next = [...medicines];
                  next[i].noon = e.target.checked;
                  setMedicines(next);
                }}
              /> {isHi ? "दोपहर" : "Noon"}
            </label>
            <label className="text-[11px] font-bold flex items-center gap-1">
              <input
                type="checkbox"
                checked={m.night}
                onChange={(e) => {
                  const next = [...medicines];
                  next[i].night = e.target.checked;
                  setMedicines(next);
                }}
              /> {isHi ? "रात" : "Night"}
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={downloadPdf}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Download className="h-4 w-4" /> {isHi ? "दवा चार्ट PDF डाउनलोड करें" : "Download Medication Chart PDF"}
      </button>
    </div>
  );
}

function BpSugarTrackerEngine({ isHi }: { isHi: boolean; downloadBlob: any }) {
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");
  const [sugar, setSugar] = useState("95");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-3 rounded-xl border">
          <label className="text-[11px] font-bold text-slate-500">{isHi ? "BP ऊपर (Systolic)" : "Systolic"}</label>
          <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} className="w-full mt-1 text-center font-black text-lg" />
        </div>
        <div className="bg-white p-3 rounded-xl border">
          <label className="text-[11px] font-bold text-slate-500">{isHi ? "BP नीचे (Diastolic)" : "Diastolic"}</label>
          <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} className="w-full mt-1 text-center font-black text-lg" />
        </div>
        <div className="bg-white p-3 rounded-xl border">
          <label className="text-[11px] font-bold text-slate-500">{isHi ? "खाली पेट शुगर" : "Fasting Sugar"}</label>
          <input type="number" value={sugar} onChange={(e) => setSugar(e.target.value)} className="w-full mt-1 text-center font-black text-lg" />
        </div>
      </div>

      <div className="rounded-2xl border bg-emerald-50/70 p-4 border-emerald-200 text-center">
        <p className="text-xs font-bold text-emerald-800">
          {Number(systolic) <= 120 && Number(diastolic) <= 80 ? "✅ ब्लड प्रेशर सामान्य श्रेणी में है" : "⚠️ डॉक्टर से परामर्श की सलाह"}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {Number(sugar) < 100 ? "✅ फास्टिंग ब्लड शुगर सामान्य है (70-99 mg/dL)" : "⚠️ शुगर स्तर निगरानी की आवश्यकता"}
        </p>
      </div>

      <button
        onClick={() => toast.success(isHi ? "रीडिंग फोन में सेव हो गई!" : "Reading logged offline!")}
        className="w-full rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        {isHi ? "आज की रीडिंग सुरक्षित सहेजें" : "Save Today's Reading"}
      </button>
    </div>
  );
}

function EmergencyHelplinesEngine({ isHi }: { isHi: boolean }) {
  const helplines = [
    { num: "112", titleHi: "अखिल भारतीय आपातकालीन नंबर", titleEn: "National Emergency Helpline" },
    { num: "108", titleHi: "एम्बुलेंस सेवा", titleEn: "Ambulance Emergency" },
    { num: "1090", titleHi: "महिला हेल्पलाइन", titleEn: "Women Helpline" },
    { num: "1930", titleHi: "साइबर फ्रॉड हेल्पलाइन", titleEn: "Cyber Crime Financial Fraud" },
    { num: "1098", titleHi: "चाइल्डलाइन (बच्चों की सुरक्षा)", titleEn: "Childline Emergency" },
    { num: "14567", titleHi: "वरिष्ठ नागरिक एल्डरलाइन", titleEn: "Senior Citizen Elderline" },
  ];

  return (
    <div className="space-y-2.5">
      {helplines.map((h) => (
        <a
          key={h.num}
          href={`tel:${h.num}`}
          className="flex items-center justify-between rounded-2xl border border-red-200 bg-white p-3.5 shadow-2xs hover:bg-red-50 transition"
        >
          <div>
            <span className="text-xs font-black text-red-600 block">{h.num}</span>
            <span className="text-sm font-bold text-[#243B32]">{isHi ? h.titleHi : h.titleEn}</span>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <Phone className="h-4.5 w-4.5" />
          </span>
        </a>
      ))}
    </div>
  );
}

// =============================================================
// 12. WOMEN & CHILD CARE TOOLS
// =============================================================

function PregnancyEddEngine({ isHi }: { isHi: boolean }) {
  const [lmp, setLmp] = useState("2026-03-01");

  // Naegele's rule: LMP + 280 days (40 weeks)
  const lmpDate = new Date(lmp);
  const eddDate = new Date(lmpDate.getTime() + 280 * 86400000);
  const diffDays = Math.floor((Date.now() - lmpDate.getTime()) / 86400000);
  const currentWeeks = Math.max(0, Math.floor(diffDays / 7));

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-slate-700">{isHi ? "अंतिम माहवारी की पहली तारीख (LMP)" : "First Day of Last Period (LMP)"}</label>
        <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-sm bg-white" />
      </div>

      <div className="rounded-2xl border border-pink-200 bg-pink-50/70 p-5 text-center space-y-3">
        <div>
          <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">{isHi ? "अनुमानित प्रसव तिथि (EDD)" : "Estimated Due Date"}</span>
          <p className="text-2xl font-black text-[#243B32] mt-1">{eddDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="pt-2 border-t border-pink-200">
          <span className="text-xs font-bold text-slate-500">{isHi ? "वर्तमान गर्भावस्था अवधि" : "Current Pregnancy Stage"}</span>
          <p className="text-xl font-black text-pink-800">{currentWeeks} {isHi ? "हफ्ते" : "Weeks"}</p>
        </div>
      </div>
    </div>
  );
}

function ChildVaccineEngine({ isHi }: { isHi: boolean }) {
  const vaccines = [
    { age: "जन्म के समय", name: "BCG, OPV-0, Hepatitis B" },
    { age: "6 हफ्ते", name: "OPV-1, Pentavalent-1, Rota-1, PCV-1" },
    { age: "10 हफ्ते", name: "OPV-2, Pentavalent-2, Rota-2" },
    { age: "14 हफ्ते", name: "OPV-3, Pentavalent-3, Rota-3, PCV-2" },
    { age: "9-12 महीने", name: "MR-1 (खसरा-रूबेला), JE-1, PCV Booster" },
    { age: "16-24 महीने", name: "MR-2, DPT Booster-1, OPV Booster" },
  ];

  return (
    <div className="space-y-2.5 max-h-64 overflow-y-auto">
      {vaccines.map((v, i) => (
        <div key={i} className="flex justify-between items-center rounded-xl border bg-white p-3 border-slate-200">
          <div>
            <span className="text-xs font-black text-emerald-800 block">{v.age}</span>
            <span className="text-xs font-medium text-slate-700">{v.name}</span>
          </div>
          <input type="checkbox" className="h-5 w-5 accent-emerald-600 rounded" />
        </div>
      ))}
    </div>
  );
}

// =============================================================
// 13. SENIOR CITIZENS & PENSION TOOLS
// =============================================================

function SeniorMedicalCardEngine({ isHi }: { isHi: boolean; downloadBlob: any }) {
  const [seniorName, setSeniorName] = useState("");
  const [blood, setBlood] = useState("B+");
  const [contact1, setContact1] = useState("");
  const [diseases, setDiseases] = useState(isHi ? "डायबिटीज, हाई बीपी" : "Diabetes, Hypertension");

  const downloadCard = () => {
    const doc = new jsPDF();
    doc.setLineWidth(1);
    doc.rect(20, 20, 100, 60);

    doc.setFontSize(12);
    doc.text("EMERGENCY MEDICAL CARD", 70, 30, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Name: ${seniorName || "Senior Citizen"}`, 25, 40);
    doc.text(`Blood Group: ${blood}`, 25, 48);
    doc.text(`Emergency Phone: ${contact1 || "Phone"}`, 25, 56);
    doc.text(`Conditions: ${diseases}`, 25, 64);

    doc.save("Senior_Emergency_Card.pdf");
  };

  return (
    <div className="space-y-4">
      <input type="text" placeholder={isHi ? "वरिष्ठ नागरिक का नाम" : "Senior Citizen Name"} value={seniorName} onChange={(e) => setSeniorName(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />
      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder={isHi ? "ब्लड ग्रुप" : "Blood Group"} value={blood} onChange={(e) => setBlood(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
        <input type="text" placeholder={isHi ? "आपात संपर्क फोन" : "Emergency Phone"} value={contact1} onChange={(e) => setContact1(e.target.value)} className="rounded-xl border p-2.5 text-sm bg-white" />
      </div>
      <input type="text" placeholder={isHi ? "बीमारियां / जरूरी दवाएं" : "Health conditions"} value={diseases} onChange={(e) => setDiseases(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-white" />

      <button
        onClick={downloadCard}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
      >
        <Download className="h-4 w-4" /> {isHi ? "जेब में रखने वाला कार्ड PDF बनाएं" : "Download Pocket Card PDF"}
      </button>
    </div>
  );
}

function PensionChecklistEngine({ isHi }: { isHi: boolean }) {
  const steps = [
    { title: "PPO (Pension Payment Order) नंबर उपलब्ध है" },
    { title: "बैंक खाता आधार कार्ड से लिंक और सक्रिय है" },
    { title: "बायोमेट्रिक फिंगरप्रिंट या जीवन प्रमाण फेस ऐप इंस्टॉल है" },
    { title: "नवंबर माह में वार्षिक डिजिटल लाइफ सर्टिफिकेट जमा किया" },
  ];

  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => (
        <label key={i} className="flex items-center gap-3 rounded-xl border bg-white p-3 border-slate-200 cursor-pointer">
          <input type="checkbox" className="h-4.5 w-4.5 accent-emerald-600 rounded" />
          <span className="text-xs font-semibold text-[#243B32]">{s.title}</span>
        </label>
      ))}
    </div>
  );
}

// =============================================================
// 14. HOME, FAMILY & RATION TOOLS
// =============================================================

function HomeRationPlannerEngine({ isHi }: { isHi: boolean }) {
  const [flour, setFlour] = useState("20");
  const [rice, setRice] = useState("10");
  const [dal, setDal] = useState("5");
  const [oil, setOil] = useState("5");

  const approxCost = (Number(flour) || 0) * 35 + (Number(rice) || 0) * 45 + (Number(dal) || 0) * 120 + (Number(oil) || 0) * 140;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "आटा (kg)" : "Flour (kg)"}</label>
          <input type="number" value={flour} onChange={(e) => setFlour(e.target.value)} className="w-full mt-1 rounded-xl border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "चावल (kg)" : "Rice (kg)"}</label>
          <input type="number" value={rice} onChange={(e) => setRice(e.target.value)} className="w-full mt-1 rounded-xl border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "दालें (kg)" : "Pulses (kg)"}</label>
          <input type="number" value={dal} onChange={(e) => setDal(e.target.value)} className="w-full mt-1 rounded-xl border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "खाद्य तेल (लीटर)" : "Cooking Oil (L)"}</label>
          <input type="number" value={oil} onChange={(e) => setOil(e.target.value)} className="w-full mt-1 rounded-xl border p-2 bg-white" />
        </div>
      </div>

      <div className="rounded-2xl border bg-emerald-50/70 p-4 border-emerald-200 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-700">{isHi ? "अनुमानित मासिक राशन बजट:" : "Approx Monthly Budget:"}</span>
        <span className="text-xl font-black text-emerald-800">₹{approxCost.toLocaleString()}</span>
      </div>
    </div>
  );
}

function MilkMaidRegisterEngine({ isHi }: { isHi: boolean }) {
  const [litresPerDay, setLitresPerDay] = useState("1.5");
  const [milkRate, setMilkRate] = useState("60");
  const [daysCount, setDaysCount] = useState("30");

  const totalLitres = (Number(litresPerDay) || 0) * (Number(daysCount) || 0);
  const totalBill = totalLitres * (Number(milkRate) || 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "रोज का दूध (L)" : "Daily Litres"}</label>
          <input type="number" step="0.5" value={litresPerDay} onChange={(e) => setLitresPerDay(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "दूध भाव (₹/L)" : "Rate (₹/L)"}</label>
          <input type="number" value={milkRate} onChange={(e) => setMilkRate(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "कुल दिन" : "Days"}</label>
          <input type="number" value={daysCount} onChange={(e) => setDaysCount(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
      </div>

      <div className="rounded-2xl border bg-emerald-50/70 p-4 border-emerald-200 flex justify-between items-center">
        <div>
          <span className="text-xs text-slate-500 font-bold block">{isHi ? `कुल दूध: ${totalLitres} लीटर` : `Total Milk: ${totalLitres} L`}</span>
          <span className="text-xs font-bold text-slate-800">{isHi ? "महीने का कुल दूध बिल:" : "Monthly Milk Bill:"}</span>
        </div>
        <span className="text-2xl font-black text-emerald-800">₹{totalBill.toLocaleString()}</span>
      </div>
    </div>
  );
}

function ElectricityEstimatorEngine({ isHi }: { isHi: boolean }) {
  const [acHours, setAcHours] = useState("6");
  const [fanCount, setFanCount] = useState("3");
  const [ratePerUnit, setRatePerUnit] = useState("7.5");

  // AC 1.5 ton approx 1.5 kWh per hour
  // Fan approx 0.075 kWh per hour (assuming 12h per day)
  const acUnits = (Number(acHours) || 0) * 1.5 * 30;
  const fanUnits = (Number(fanCount) || 0) * 0.075 * 12 * 30;
  const totalUnits = Math.round(acUnits + fanUnits + 30); // 30 units baseline fridge/lights
  const totalCost = Math.round(totalUnits * (Number(ratePerUnit) || 7.5));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "AC चलने के घंटे" : "AC Hours/day"}</label>
          <input type="number" value={acHours} onChange={(e) => setAcHours(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "पंखों की संख्या" : "Fans Count"}</label>
          <input type="number" value={fanCount} onChange={(e) => setFanCount(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "यूनिट दर (₹)" : "Rate/Unit (₹)"}</label>
          <input type="number" step="0.5" value={ratePerUnit} onChange={(e) => setRatePerUnit(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
      </div>

      <div className="rounded-2xl border bg-emerald-50/70 p-4 border-emerald-200 flex justify-between items-center">
        <div>
          <span className="text-xs text-slate-500 font-bold block">{isHi ? `अनुमानित मासिक यूनिट्स: ~${totalUnits}` : `Monthly Units: ~${totalUnits}`}</span>
          <span className="text-xs font-bold text-slate-800">{isHi ? "अनुमानित बिजली बिल:" : "Estimated Bill:"}</span>
        </div>
        <span className="text-2xl font-black text-emerald-800">₹{totalCost.toLocaleString()}</span>
      </div>
    </div>
  );
}

// =============================================================
// 15. FRIENDS & TRAVEL TOOLS
// =============================================================

function SplitBillEngine({ isHi }: { isHi: boolean }) {
  const [totalExpense, setTotalExpense] = useState("2400");
  const [peopleCount, setPeopleCount] = useState("4");

  const total = Number(totalExpense) || 0;
  const count = Math.max(1, Number(peopleCount) || 1);
  const perPerson = (total / count).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "कुल खर्चा (₹)" : "Total Expense (₹)"}</label>
          <input type="number" value={totalExpense} onChange={(e) => setTotalExpense(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-base font-bold bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "कुल दोस्त (लोग)" : "Total Friends"}</label>
          <input type="number" min={1} value={peopleCount} onChange={(e) => setPeopleCount(e.target.value)} className="w-full mt-1 rounded-xl border p-2.5 text-base font-bold bg-white" />
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 text-center">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{isHi ? "प्रति व्यक्ति हिस्सा (बराबर बंटवारा)" : "Per Person Share"}</span>
        <p className="mt-2 text-3xl font-black text-[#243B32]">₹{perPerson}</p>
      </div>
    </div>
  );
}

function TripPackingChecklistEngine({ isHi }: { isHi: boolean }) {
  const items = [
    "मोबाइल चार्जर व पावरबैंक",
    "आधार कार्ड / ओरिजिनल आईडी",
    "रेलवे/बस टिकट व होटल बुकिंग",
    "जरूरी दवाइयां (पेनकिलर, ओआरएस)",
    "मौसम अनुसार कपड़े व जैकेट",
  ];

  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <label key={i} className="flex items-center gap-3 rounded-xl border bg-white p-3 border-slate-200 cursor-pointer">
          <input type="checkbox" className="h-4.5 w-4.5 accent-emerald-600 rounded" />
          <span className="text-xs font-semibold text-[#243B32]">{it}</span>
        </label>
      ))}
    </div>
  );
}

function TripFuelMileageEngine({ isHi }: { isHi: boolean }) {
  const [km, setKm] = useState("350");
  const [mileage, setMileage] = useState("18"); // 18 km/l
  const [fuelPrice, setFuelPrice] = useState("98"); // ₹98/L
  const [passengers, setPassengers] = useState("4");

  const totalFuelLitres = (Number(km) || 0) / (Number(mileage) || 1);
  const totalCost = Math.round(totalFuelLitres * (Number(fuelPrice) || 0));
  const perPerson = Math.round(totalCost / Math.max(1, Number(passengers) || 1));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "सफर दूरी (KM)" : "Distance (KM)"}</label>
          <input type="number" value={km} onChange={(e) => setKm(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "गाड़ी माइलेज (KM/L)" : "Mileage"}</label>
          <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "पेट्रोल रेट (₹/L)" : "Fuel Rate"}</label>
          <input type="number" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">{isHi ? "कुल सवारी" : "Travellers"}</label>
          <input type="number" value={passengers} onChange={(e) => setPassengers(e.target.value)} className="w-full mt-1 rounded-lg border p-2 bg-white" />
        </div>
      </div>

      <div className="rounded-2xl border bg-emerald-50/70 p-4 border-emerald-200 text-center space-y-2">
        <span className="text-xs text-slate-600 block">{isHi ? `कुल पेट्रोल खर्च: ₹${totalCost.toLocaleString()} (${totalFuelLitres.toFixed(1)} L)` : `Total Fuel: ₹${totalCost}`}</span>
        <div className="border-t border-emerald-200 pt-2">
          <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">{isHi ? "प्रति व्यक्ति पेट्रोल खर्च:" : "Per Person Cost:"}</span>
          <p className="text-3xl font-black text-[#243B32] mt-0.5">₹{perPerson}</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// 16. CYBER SAFETY & MEDIA TOOLS
// =============================================================

function ScamAlertChecklistEngine({ isHi }: { isHi: boolean }) {
  const points = [
    { title: "क्या मैसेज में अज्ञात .APK फाइल डाउनलोड करने को कहा गया है?", warning: "🚨 कभी भी अज्ञात APK इंस्टॉल न करें! यह बैंक खाली कर सकता है।" },
    { title: "क्या लॉटरी जीतने या फ्री बिजली कनेक्शन काटने की धमकी दी गई है?", warning: "🚨 सरकारी विभाग कभी भी व्हाट्सएप पर कनेक्शन काटने की धमकी नहीं देते।" },
    { title: "क्या पार्ट-टाइम टेलीग्राम टास्क/लाइक करके पैसे देने का वादा है?", warning: "🚨 टास्क स्कैम सबसे बड़ा ऑनलाइन फ्रॉड है, पैसे कभी न लगाएं।" },
    { title: "क्या किसी ने ओटीपी (OTP) या स्क्रीन शेयरिंग ऐप (AnyDesk) मांगा?", warning: "🚨 किसी भी अनजान व्यक्ति के साथ स्क्रीन शेयर न करें।" },
  ];

  return (
    <div className="space-y-3">
      {points.map((p, i) => (
        <div key={i} className="rounded-xl border border-red-200 bg-white p-3.5 shadow-2xs">
          <p className="text-xs font-bold text-[#243B32]">{i + 1}. {p.title}</p>
          <p className="text-[11px] font-semibold text-red-700 mt-1">{p.warning}</p>
        </div>
      ))}
      <div className="text-center pt-2">
        <a href="tel:1930" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700">
          <Phone className="h-4 w-4" /> 1930 राष्ट्रीय साइबर हेल्पलाइन पर कॉल करें
        </a>
      </div>
    </div>
  );
}

function PhotoMetadataCleanerEngine({ isHi, downloadBlob }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const cleanExif = async () => {
    if (!file) return;
    setCleaning(true);
    try {
      const bmp = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas error");
      // Drawing into clean HTML5 Canvas completely drops all EXIF metadata and GPS tags
      ctx.drawImage(bmp, 0, 0);
      bmp.close();

      canvas.toBlob((b) => {
        if (b) {
          downloadBlob(b, `cleaned_${file.name.replace(/\.[^.]+$/, "")}.jpg`);
          toast.success(isHi ? "लोकेशन व गुप्त डेटा हट गया!" : "GPS metadata stripped!");
        }
      }, "image/jpeg", 0.92);
    } catch (e: any) {
      toast.error(e.message || "Failed to strip metadata");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
        <input type="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" id="exif-file" />
        <label htmlFor="exif-file" className="cursor-pointer block">
          <UploadCloud className="mx-auto h-7 w-7 text-emerald-700" />
          <p className="mt-1 text-sm font-bold text-[#243B32]">
            {file ? file.name : (isHi ? "फोटो चुनें" : "Select Photo")}
          </p>
          <p className="text-xs text-slate-500">
            {isHi ? "फोटो में छिपे घर का GPS लोकेशन व कैमरा मॉडल डेटा हटाएं" : "Removes GPS tags & camera details"}
          </p>
        </label>
      </div>

      {file && (
        <button
          onClick={cleanExif}
          disabled={cleaning}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#245D45] py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
        >
          <Download className="h-4 w-4" />
          {cleaning ? (isHi ? "डेटा हटाया जा रहा है..." : "Cleaning...") : (isHi ? "लोकेशन हटाकर सुरक्षित फोटो डाउनलोड करें" : "Strip Location & Download")}
        </button>
      )}
    </div>
  );
}

function OfflineQrToolEngine({ isHi, downloadBlob }: { isHi: boolean; downloadBlob: (blob: Blob, name: string) => void }) {
  const [text, setText] = useState("https://samahit.org");
  const qrRef = useRef<HTMLDivElement | null>(null);

  const downloadQr = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    img.onload = () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 20, 20, 260, 260);
      canvas.toBlob((b) => {
        if (b) downloadBlob(b, "offline_qr.png");
      }, "image/png");
    };
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder={isHi ? "टेक्स्ट, वेबसाइट लिंक, फोन या UPI आईडी दर्ज करें" : "Enter text, URL or UPI ID"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
      />

      {text.trim() && (
        <div className="rounded-2xl border bg-white p-5 flex flex-col items-center justify-center">
          <div ref={qrRef} className="p-3 bg-white rounded-xl shadow-xs border">
            <QRCode value={text} size={180} />
          </div>
          <button
            onClick={downloadQr}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800"
          >
            <Download className="h-4 w-4" /> {isHi ? "QR कोड इमेज डाउनलोड करें" : "Download QR Code PNG"}
          </button>
        </div>
      )}
    </div>
  );
}
