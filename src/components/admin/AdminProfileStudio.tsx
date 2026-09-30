import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import {
  User,
  ShieldCheck,
  Phone,
  FileText,
  Lock,
  AlertTriangle,
  Info,
  HelpCircle,
  Save,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Award,
  Layers,
  Sparkles,
  X,
  ExternalLink
} from "lucide-react";
import { toast } from "react-hot-toast";

export interface ProfileActionItem {
  id: string;
  titleEn: string;
  titleHi: string;
  subEn: string;
  subHi: string;
  route: string;
  iconName: string;
  color?: string;
  enabled?: boolean;
}

export interface HelplineItem {
  id: string;
  nameEn: string;
  nameHi: string;
  number: string;
  category: "urgent" | "medical" | "women" | "police" | "child" | "civic";
  enabled?: boolean;
}

const DEFAULT_PROFILE_ACTIONS: ProfileActionItem[] = [
  { id: "card", titleEn: "Jan Seva Card", titleHi: "जन सेवा कार्ड", subEn: "Digital seva identity card", subHi: "डिजिटल सेवा पहचान कार्ड", route: "/jan-seva-card", iconName: "IdCard", color: "bg-[#D97706]", enabled: true },
  { id: "certificates", titleEn: "My Certificates", titleHi: "मेरे प्रमाणपत्र", subEn: "Certificates of service & impact", subHi: "सेवा एवं भागीदारी प्रमाणपत्र", route: "/my-certificates", iconName: "Award", color: "bg-purple-600", enabled: true },
  { id: "volunteer-duty", titleEn: "Volunteer Duty", titleHi: "स्वयंसेवक ड्यूटी", subEn: "Duty clock-in & reports", subHi: "ड्यूटी ट्रैकर व रिपोर्ट", route: "/volunteer-duty", iconName: "HeartHandshake", color: "bg-[#167C5A]", enabled: true },
  { id: "settings", titleEn: "App Settings", titleHi: "ऐप सेटिंग्स", subEn: "Language & preferences", subHi: "भाषा व प्राथमिकताएं", route: "/settings", iconName: "Settings", color: "bg-[#14213D]", enabled: true }
];

const DEFAULT_HELPLINES: HelplineItem[] = [
  { id: "h1", nameEn: "RP Foundation Toll Free", nameHi: "आरपी फाउंडेशन टोल फ्री", number: "1800-569-0991", category: "civic", enabled: true },
  { id: "h2", nameEn: "Emergency Response (ERSS)", nameHi: "आपातकालीन सेवा (ERSS)", number: "112", category: "urgent", enabled: true },
  { id: "h3", nameEn: "Women Helpline", nameHi: "महिला हेल्पलाइन", number: "1090", category: "women", enabled: true },
  { id: "h4", nameEn: "Ambulance Emergency", nameHi: "एम्बुलेंस सेवा", number: "108 / 102", category: "medical", enabled: true },
  { id: "h5", nameEn: "Police Control Room", nameHi: "पुलिस कंट्रोल रूम", number: "100", category: "police", enabled: true },
  { id: "h6", nameEn: "Child Helpline", nameHi: "चाइल्ड हेल्पलाइन", number: "1098", category: "child", enabled: true },
  { id: "h7", nameEn: "Madhya Pradesh CM Helpline", nameHi: "म.प्र. सीएम हेल्पलाइन", number: "181", category: "civic", enabled: true },
  { id: "h8", nameEn: "Cyber Crime Reporting", nameHi: "साइबर क्राइम हेल्पलाइन", number: "1930", category: "police", enabled: true }
];

interface AdminProfileStudioProps {
  cmsConfig: any;
  onSaveCms: (cms: any) => Promise<void>;
  isLoading?: boolean;
}

export default function AdminProfileStudio({ cmsConfig, onSaveCms, isLoading = false }: AdminProfileStudioProps) {
  const [subTab, setSubTab] = useState<"actions" | "helplines" | "policies" | "version">("actions");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Profile Actions State
  const [actions, setActions] = useState<ProfileActionItem[]>(() => {
    return Array.isArray(cmsConfig?.profileActions) && cmsConfig.profileActions.length > 0
      ? cmsConfig.profileActions
      : DEFAULT_PROFILE_ACTIONS;
  });

  // 2. Helplines State
  const [helplines, setHelplines] = useState<HelplineItem[]>(() => {
    return Array.isArray(cmsConfig?.emergencyHelplines) && cmsConfig.emergencyHelplines.length > 0
      ? cmsConfig.emergencyHelplines
      : DEFAULT_HELPLINES;
  });

  // 3. Policies & About State
  const [policies, setPolicies] = useState({
    termsEn: cmsConfig?.termsEn || "Welcome to Samahit by RP Foundation. By using this application, citizens agree to adhere to transparent, lawful civic conduct.",
    termsHi: cmsConfig?.termsHi || "आरपी फाउंडेशन के समाहित पोर्टल में आपका स्वागत है। इस एप्लिकेशन का उपयोग करने वाले सभी नागरिक निष्पक्ष व पारदर्शी सेवा नियमों का पालन करेंगे।",
    privacyEn: cmsConfig?.privacyEn || "RP Foundation prioritizes citizen privacy. All personal and Aadhaar records are encrypted under high-grade security protocols.",
    privacyHi: cmsConfig?.privacyHi || "आरपी फाउंडेशन नागरिकों की गोपनीयता का पूर्ण सम्मान करता है। सभी व्यक्तिगत पहचान डेटा सुरक्षित प्रोटोकॉल के अंतर्गत संग्रहित हैं।",
    disclaimerEn: cmsConfig?.disclaimerEn || "Jan Seva Card is a digital welfare identity provided by RP Foundation. It does not replace any statutory government documents.",
    disclaimerHi: cmsConfig?.disclaimerHi || "जन सेवा कार्ड आरपी फाउंडेशन द्वारा प्रदत्त डिजिटल कल्याण पहचान है। यह किसी भी वैधानिक सरकारी पहचान का स्थान नहीं लेता है।",
    aboutEn: cmsConfig?.aboutTextEn || "RP Foundation is committed to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.",
    aboutHi: cmsConfig?.aboutTextHi || "आरपी फाउंडेशन समाज के कमजोर वर्गों को सशक्त बनाने, शिक्षा, स्वास्थ्य और आपातकालीन नागरिक राहत प्रदान करने के लिए समर्पित है।"
  });

  // 4. Version & Certificate Settings
  const [versionConfig, setVersionConfig] = useState({
    appVersion: cmsConfig?.appVersion || "1.0.8",
    minSupportedVersion: cmsConfig?.minSupportedVersion || "1.0.0",
    forceUpdateEnabled: Boolean(cmsConfig?.forceUpdateEnabled),
    apkDownloadUrl: cmsConfig?.apkDownloadUrl || "https://appapi.therpfoundation.org/download/rpf-app.apk",
    releaseNotesEn: cmsConfig?.releaseNotesEn || "Major update with integrated Jan Seva Card sync, expanded Explore utilities, and performance boosts.",
    releaseNotesHi: cmsConfig?.releaseNotesHi || "जन सेवा कार्ड सिंक, विस्तृत एक्सप्लोर उपयोगिताओं एवं उन्नत प्रदर्शन के साथ नया अपडेट।",
    certSignatoryName: cmsConfig?.certSignatoryName || "Rohit Pandit",
    certSignatoryTitle: cmsConfig?.certSignatoryTitle || "Founder & President, RP Foundation",
    certNgoRegNo: cmsConfig?.certNgoRegNo || "01/01/01/37198/22"
  });

  // Modals
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; mode: "add" | "edit"; data: Partial<ProfileActionItem> }>({
    isOpen: false,
    mode: "add",
    data: {}
  });

  const [helplineModal, setHelplineModal] = useState<{ isOpen: boolean; mode: "add" | "edit"; data: Partial<HelplineItem> }>({
    isOpen: false,
    mode: "add",
    data: {}
  });

  // Profile Action Handlers
  const handleToggleAction = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  };

  const handleDeleteAction = (id: string) => {
    if (confirm("Delete this action button from citizen profile?")) {
      setActions((prev) => prev.filter((a) => a.id !== id));
      toast.success("Action removed");
    }
  };

  const handleSaveActionModal = () => {
    if (!actionModal.data.titleEn?.trim() || !actionModal.data.route?.trim()) {
      toast.error("Title and Route are required");
      return;
    }
    const cleanId = actionModal.data.id || `act-${Date.now()}`;
    const item: ProfileActionItem = {
      id: cleanId,
      titleEn: actionModal.data.titleEn.trim(),
      titleHi: actionModal.data.titleHi?.trim() || actionModal.data.titleEn.trim(),
      subEn: actionModal.data.subEn?.trim() || "",
      subHi: actionModal.data.subHi?.trim() || "",
      route: actionModal.data.route.trim(),
      iconName: actionModal.data.iconName || "Layers",
      color: actionModal.data.color || "bg-[#14213D]",
      enabled: actionModal.data.enabled !== false
    };

    if (actionModal.mode === "add") {
      setActions((prev) => [...prev, item]);
      toast.success("Profile action added");
    } else {
      setActions((prev) => prev.map((a) => (a.id === cleanId ? item : a)));
      toast.success("Profile action updated");
    }
    setActionModal({ isOpen: false, mode: "add", data: {} });
  };

  // Helpline Handlers
  const handleToggleHelpline = (id: string) => {
    setHelplines((prev) => prev.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h)));
  };

  const handleDeleteHelpline = (id: string) => {
    if (confirm("Delete this emergency helpline?")) {
      setHelplines((prev) => prev.filter((h) => h.id !== id));
      toast.success("Helpline removed");
    }
  };

  const handleSaveHelplineModal = () => {
    if (!helplineModal.data.nameEn?.trim() || !helplineModal.data.number?.trim()) {
      toast.error("Name and Phone Number are required");
      return;
    }
    const cleanId = helplineModal.data.id || `hl-${Date.now()}`;
    const item: HelplineItem = {
      id: cleanId,
      nameEn: helplineModal.data.nameEn.trim(),
      nameHi: helplineModal.data.nameHi?.trim() || helplineModal.data.nameEn.trim(),
      number: helplineModal.data.number.trim(),
      category: helplineModal.data.category || "civic",
      enabled: helplineModal.data.enabled !== false
    };

    if (helplineModal.mode === "add") {
      setHelplines((prev) => [...prev, item]);
      toast.success("Helpline added");
    } else {
      setHelplines((prev) => prev.map((h) => (h.id === cleanId ? item : h)));
      toast.success("Helpline updated");
    }
    setHelplineModal({ isOpen: false, mode: "add", data: {} });
  };

  // Persist all Profile Updates to CMS
  const handleSaveAllProfile = async () => {
    setIsSaving(true);
    try {
      const updatedCms = {
        ...cmsConfig,
        profileActions: actions,
        emergencyHelplines: helplines,
        termsEn: policies.termsEn,
        termsHi: policies.termsHi,
        privacyEn: policies.privacyEn,
        privacyHi: policies.privacyHi,
        disclaimerEn: policies.disclaimerEn,
        disclaimerHi: policies.disclaimerHi,
        aboutTextEn: policies.aboutEn,
        aboutTextHi: policies.aboutHi,
        appVersion: versionConfig.appVersion,
        minSupportedVersion: versionConfig.minSupportedVersion,
        forceUpdateEnabled: versionConfig.forceUpdateEnabled,
        apkDownloadUrl: versionConfig.apkDownloadUrl,
        releaseNotesEn: versionConfig.releaseNotesEn,
        releaseNotesHi: versionConfig.releaseNotesHi,
        certSignatoryName: versionConfig.certSignatoryName,
        certSignatoryTitle: versionConfig.certSignatoryTitle,
        certNgoRegNo: versionConfig.certNgoRegNo
      };
      await onSaveCms(updatedCms);
      window.dispatchEvent(new Event("samahit-admin-updated"));
      toast.success("Profile Studio published & synchronized live!");
    } catch (err: any) {
      console.error("Save Profile Studio error:", err);
      toast.error(err.message || "Failed to save profile settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#C2410C]">
              <User className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#0A192F]">Profile Studio</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-100 text-[#166534] border border-green-200">
              Identity & Compliance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure profile navigation, emergency dispatch helplines, legal policies, and app release updates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAllProfile}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Publish Profile Updates</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab("actions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "actions"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-4 h-4 text-orange-400" />
          <span>Profile Navigation ({actions.length})</span>
        </button>

        <button
          onClick={() => setSubTab("helplines")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "helplines"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Phone className="w-4 h-4 text-green-400" />
          <span>Emergency Helplines ({helplines.length})</span>
        </button>

        <button
          onClick={() => setSubTab("policies")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "policies"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4 text-amber-500" />
          <span>Legal Policies & Compliance</span>
        </button>

        <button
          onClick={() => setSubTab("version")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "version"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Version & Certificate Generator</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. PROFILE NAVIGATION ACTIONS TAB                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "actions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Navigation buttons displayed on Citizen & Volunteer Profile
            </span>
            <button
              onClick={() =>
                setActionModal({
                  isOpen: true,
                  mode: "add",
                  data: { iconName: "Layers", enabled: true }
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Profile Action</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actions.map((act) => {
              const IconComp = (LucideIcons as any)[act.iconName] || Layers;
              return (
                <div
                  key={act.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    act.enabled !== false
                      ? "bg-white border-slate-200 shadow-sm"
                      : "bg-slate-50/70 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`p-2.5 rounded-xl text-white ${act.color || "bg-[#14213D]"}`}>
                        <IconComp className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#0A192F]">{act.titleEn}</h4>
                        <p className="text-xs font-medium text-[#166534]">{act.titleHi}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAction(act.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                        act.enabled !== false
                          ? "bg-green-50 text-[#166534] border-green-200"
                          : "bg-slate-100 text-slate-500 border-slate-300"
                      }`}
                    >
                      {act.enabled !== false ? "Active" : "Disabled"}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">{act.subEn || act.subHi}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                      Route: {act.route}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActionModal({ isOpen: true, mode: "edit", data: act })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAction(act.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. EMERGENCY HELPLINES TAB                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "helplines" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              National & Regional Emergency Helplines Directory
            </span>
            <button
              onClick={() =>
                setHelplineModal({
                  isOpen: true,
                  mode: "add",
                  data: { category: "civic", enabled: true }
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Helpline</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {helplines.map((hl) => (
                <div
                  key={hl.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    hl.enabled !== false ? "" : "opacity-60 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
                      <Phone className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#0A192F]">{hl.nameEn}</h4>
                        <span className="text-xs font-medium text-[#166534]">({hl.nameHi})</span>
                      </div>
                      <a
                        href={`tel:${hl.number}`}
                        className="text-xs font-mono font-bold text-blue-600 hover:underline"
                      >
                        {hl.number}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                      {hl.category}
                    </span>
                    <button
                      onClick={() => handleToggleHelpline(hl.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                        hl.enabled !== false
                          ? "bg-green-50 text-[#166534] border-green-200"
                          : "bg-slate-100 text-slate-500 border-slate-300"
                      }`}
                    >
                      {hl.enabled !== false ? "Active" : "Disabled"}
                    </button>
                    <button
                      onClick={() => setHelplineModal({ isOpen: true, mode: "edit", data: hl })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHelpline(hl.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. LEGAL POLICIES & COMPLIANCE TAB                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "policies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {/* Terms & Conditions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0A192F] flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              <span>Terms of Service (English)</span>
            </label>
            <textarea
              rows={4}
              value={policies.termsEn}
              onChange={(e) => setPolicies({ ...policies, termsEn: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#166534] flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-700" />
              <span>नियम एवं शर्तें (Hindi)</span>
            </label>
            <textarea
              rows={4}
              value={policies.termsHi}
              onChange={(e) => setPolicies({ ...policies, termsHi: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          {/* Privacy Policy */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0A192F] flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Privacy Policy (English)</span>
            </label>
            <textarea
              rows={4}
              value={policies.privacyEn}
              onChange={(e) => setPolicies({ ...policies, privacyEn: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#166534] flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>गोपनीयता नीति (Hindi)</span>
            </label>
            <textarea
              rows={4}
              value={policies.privacyHi}
              onChange={(e) => setPolicies({ ...policies, privacyHi: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          {/* Disclaimer & Notice */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0A192F] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Jan Seva Card Welfare Disclaimer (English)</span>
            </label>
            <textarea
              rows={3}
              value={policies.disclaimerEn}
              onChange={(e) => setPolicies({ ...policies, disclaimerEn: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#166534] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>जन सेवा कार्ड अस्वीकरण (Hindi)</span>
            </label>
            <textarea
              rows={3}
              value={policies.disclaimerHi}
              onChange={(e) => setPolicies({ ...policies, disclaimerHi: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. APP VERSION & CERTIFICATE GENERATOR TAB                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "version" && (
        <div className="space-y-6">
          {/* Version and Update Control */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Download className="w-5 h-5 text-[#C2410C]" />
              <h3 className="text-sm font-bold text-[#0A192F]">App Version & Force Update Controls</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Latest Live Version</label>
                <input
                  type="text"
                  value={versionConfig.appVersion}
                  onChange={(e) => setVersionConfig({ ...versionConfig, appVersion: e.target.value })}
                  placeholder="1.0.8"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Minimum Required Version</label>
                <input
                  type="text"
                  value={versionConfig.minSupportedVersion}
                  onChange={(e) => setVersionConfig({ ...versionConfig, minSupportedVersion: e.target.value })}
                  placeholder="1.0.0"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Force Update Action</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="forceUpdate"
                    checked={versionConfig.forceUpdateEnabled}
                    onChange={(e) => setVersionConfig({ ...versionConfig, forceUpdateEnabled: e.target.checked })}
                    className="rounded text-[#C2410C] focus:ring-[#C2410C] w-4 h-4"
                  />
                  <label htmlFor="forceUpdate" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Block older app versions
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Direct APK Download URL</label>
              <input
                type="url"
                value={versionConfig.apkDownloadUrl}
                onChange={(e) => setVersionConfig({ ...versionConfig, apkDownloadUrl: e.target.value })}
                placeholder="https://appapi.therpfoundation.org/download/rpf-app.apk"
                className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Release Notes (English)</label>
                <textarea
                  rows={2}
                  value={versionConfig.releaseNotesEn}
                  onChange={(e) => setVersionConfig({ ...versionConfig, releaseNotesEn: e.target.value })}
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">नवीनतम बदलाव (Hindi)</label>
                <textarea
                  rows={2}
                  value={versionConfig.releaseNotesHi}
                  onChange={(e) => setVersionConfig({ ...versionConfig, releaseNotesHi: e.target.value })}
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Volunteer Certificate Signatory Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Award className="w-5 h-5 text-[#166534]" />
              <h3 className="text-sm font-bold text-[#0A192F]">Volunteer Certificate Generator Configuration</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Authorized Signatory Name</label>
                <input
                  type="text"
                  value={versionConfig.certSignatoryName}
                  onChange={(e) => setVersionConfig({ ...versionConfig, certSignatoryName: e.target.value })}
                  placeholder="Rohit Pandit"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Signatory Title</label>
                <input
                  type="text"
                  value={versionConfig.certSignatoryTitle}
                  onChange={(e) => setVersionConfig({ ...versionConfig, certSignatoryTitle: e.target.value })}
                  placeholder="Founder & President"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">NGO Registration Number</label>
                <input
                  type="text"
                  value={versionConfig.certNgoRegNo}
                  onChange={(e) => setVersionConfig({ ...versionConfig, certNgoRegNo: e.target.value })}
                  placeholder="01/01/01/37198/22"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ADD / EDIT PROFILE ACTION                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {actionModal.mode === "add" ? "Add Profile Action" : "Edit Action"}
              </h3>
              <button
                onClick={() => setActionModal({ isOpen: false, mode: "add", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Title (English)</label>
                <input
                  type="text"
                  value={actionModal.data.titleEn || ""}
                  onChange={(e) =>
                    setActionModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, titleEn: e.target.value }
                    }))
                  }
                  placeholder="e.g. My Certificates"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Title (Hindi)</label>
                <input
                  type="text"
                  value={actionModal.data.titleHi || ""}
                  onChange={(e) =>
                    setActionModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, titleHi: e.target.value }
                    }))
                  }
                  placeholder="e.g. मेरे प्रमाणपत्र"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">App Route</label>
                <input
                  type="text"
                  value={actionModal.data.route || ""}
                  onChange={(e) =>
                    setActionModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, route: e.target.value }
                    }))
                  }
                  placeholder="e.g. /my-certificates"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Icon Name</label>
                <input
                  type="text"
                  value={actionModal.data.iconName || ""}
                  onChange={(e) =>
                    setActionModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, iconName: e.target.value }
                    }))
                  }
                  placeholder="Award, IdCard, Settings"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setActionModal({ isOpen: false, mode: "add", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActionModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow"
              >
                Save Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: ADD / EDIT HELPLINE                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {helplineModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {helplineModal.mode === "add" ? "Add Emergency Helpline" : "Edit Helpline"}
              </h3>
              <button
                onClick={() => setHelplineModal({ isOpen: false, mode: "add", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Helpline Name (English)</label>
                <input
                  type="text"
                  value={helplineModal.data.nameEn || ""}
                  onChange={(e) =>
                    setHelplineModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, nameEn: e.target.value }
                    }))
                  }
                  placeholder="e.g. Women Helpline"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Helpline Name (Hindi)</label>
                <input
                  type="text"
                  value={helplineModal.data.nameHi || ""}
                  onChange={(e) =>
                    setHelplineModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, nameHi: e.target.value }
                    }))
                  }
                  placeholder="e.g. महिला हेल्पलाइन"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Phone Number / Code</label>
                <input
                  type="text"
                  value={helplineModal.data.number || ""}
                  onChange={(e) =>
                    setHelplineModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, number: e.target.value }
                    }))
                  }
                  placeholder="1090 or 1800-..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select
                  value={helplineModal.data.category || "civic"}
                  onChange={(e) =>
                    setHelplineModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, category: e.target.value as any }
                    }))
                  }
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="urgent">Urgent</option>
                  <option value="medical">Medical</option>
                  <option value="women">Women</option>
                  <option value="police">Police</option>
                  <option value="child">Child</option>
                  <option value="civic">Civic</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setHelplineModal({ isOpen: false, mode: "add", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHelplineModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow"
              >
                Save Helpline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
