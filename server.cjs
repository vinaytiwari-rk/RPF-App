var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_multer = __toESM(require("multer"), 1);

// src/routes/adminHqRoutes.ts
var import_express = require("express");

// src/controllers/adminHqController.ts
var pool2;
var getServiceContent = async (req, res) => {
  const { serviceId } = req.params;
  try {
    const result = await pool2.query("SELECT * FROM service_cms_content WHERE service_id = $1", [serviceId]);
    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error("Error fetching service content:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
var updateServiceContent = async (req, res) => {
  const { serviceId } = req.params;
  const { content_blocks, resources, action_buttons, form_config } = req.body;
  try {
    await pool2.query(
      `INSERT INTO service_cms_content (service_id, content_blocks, resources, action_buttons, form_config)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (service_id) DO UPDATE SET
         content_blocks = $2,
         resources = $3,
         action_buttons = $4,
         form_config = $5`,
      [
        serviceId,
        JSON.stringify(content_blocks || {}),
        JSON.stringify(resources || []),
        JSON.stringify(action_buttons || {}),
        JSON.stringify(form_config || {})
      ]
    );
    res.json({ success: true, message: "Service content updated successfully." });
  } catch (error) {
    console.error("Error updating service content:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// src/routes/adminHqRoutes.ts
var router = (0, import_express.Router)();
router.get("/services/:serviceId/content", getServiceContent);
router.post("/services/:serviceId/content", updateServiceContent);
var adminHqRoutes_default = router;

// defaultServices.ts
var coreServices = [
  /* ── URGENT ── */
  {
    id: "donate",
    titleEn: "Donate Now",
    titleHi: "\u0926\u093E\u0928 \u0938\u0939\u093E\u092F\u0924\u093E",
    descEn: "Support causes & donate securely",
    descHi: "\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0930\u0942\u092A \u0938\u0947 \u0926\u093E\u0928 \u0915\u0930\u0947\u0902",
    iconName: "Heart",
    color: "text-red-600 bg-red-50 border-red-200",
    category: "urgent",
    template: "ActionFormTemplate",
    features: [
      { title: "Quick-tier Amount Selector", desc: "\u20B9500, \u20B91000, \u20B95000 or custom.", type: "action" },
      { title: "80G Tax Certificate", desc: "Auto-generate and download PDF.", type: "form" },
      { title: "Recurring Donation Toggle", desc: "Automated monthly subscription.", type: "action" }
    ]
  },
  {
    id: "blood",
    titleEn: "Blood Network",
    titleHi: "\u0930\u0915\u094D\u0924 \u0928\u0947\u091F\u0935\u0930\u094D\u0915",
    descEn: "Request or donate blood instantly",
    descHi: "\u0924\u0941\u0930\u0902\u0924 \u0930\u0915\u094D\u0924 \u0905\u0928\u0941\u0930\u094B\u0927 \u092F\u093E \u0930\u0915\u094D\u0924\u0926\u093E\u0928 \u0915\u0930\u0947\u0902",
    iconName: "Activity",
    color: "text-red-700 bg-rose-50 border-rose-200",
    category: "urgent",
    template: "TicketingTemplate",
    features: [
      { title: "Emergency Blood Broadcast", desc: "Post group, hospital & units needed.", type: "form" },
      { title: "Donor Registry", desc: "Submit blood type & last donation date.", type: "form" },
      { title: "Live Blood Bank Map", desc: "Locate nearby banks and donors.", type: "map" }
    ]
  },
  {
    id: "complaint",
    titleEn: "File Grievance",
    titleHi: "\u0936\u093F\u0915\u093E\u092F\u0924 \u092A\u0902\u091C\u0940\u0915\u0930\u0923",
    descEn: "Register your civic grievance",
    descHi: "\u0936\u093F\u0915\u093E\u092F\u0924 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902",
    iconName: "AlertTriangle",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    category: "urgent",
    template: "TicketingTemplate",
    features: [
      { title: "Multi-category Description", desc: "Text & audio note attachments.", type: "form" },
      { title: "Evidence Uploader", desc: "Upload photos of civic issue.", type: "action" },
      { title: "GPS Tag & Tracker", desc: "Auto-capture location, track ticket.", type: "map" }
    ]
  },
  {
    id: "disaster",
    titleEn: "Disaster Management",
    titleHi: "\u0906\u092A\u0926\u093E \u092A\u094D\u0930\u092C\u0902\u0927\u0928",
    descEn: "Emergency relief & rescue mapping",
    descHi: "\u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0930\u093E\u0939\u0924 \u090F\u0935\u0902 \u092C\u091A\u093E\u0935",
    iconName: "AlertCircle",
    color: "text-rose-600 bg-rose-50 border-rose-200",
    category: "urgent",
    template: "TicketingTemplate",
    features: [
      { title: "One-tap SOS Alert", desc: "Broadcast GPS to nearby rescue teams.", type: "action" },
      { title: "Mark Yourself Safe", desc: "Status board for family tracking.", type: "list" },
      { title: "Geo-fenced Alerts", desc: "Live disaster warnings and shelters.", type: "info" }
    ]
  },
  /* ── INVOLVED ── */
  {
    id: "jan_seva",
    titleEn: "Jan Seva Card",
    titleHi: "\u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921",
    descEn: "Apply for digital Jan Seva identity pass",
    descHi: "\u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921 \u0915\u0947 \u0932\u093F\u090F \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902",
    iconName: "QrCode",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    category: "involved",
    template: "ActionFormTemplate",
    features: [
      { title: "Multi-step Digital KYC", desc: "Fill name, DOB, upload ID docs.", type: "form" },
      { title: "Instant QR Pass", desc: "Download secure digital pass.", type: "action" },
      { title: "Benefit Dashboard", desc: "Local discounts & subsidies.", type: "list" }
    ]
  },
  {
    id: "volunteer",
    titleEn: "Volunteer Opportunities",
    titleHi: "\u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915 \u0905\u0935\u0938\u0930",
    descEn: "Join social initiatives & log hours",
    descHi: "\u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915 \u092C\u0928\u0947\u0902 \u0914\u0930 \u092C\u0926\u0932\u093E\u0935 \u0932\u093E\u090F\u0902",
    iconName: "Users",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    category: "involved",
    template: "TicketingTemplate",
    features: [
      { title: "Skill-based Matching", desc: "Teaching, IT, Fieldwork etc.", type: "list" },
      { title: "Event Calendar Signup", desc: "Weekend drives & food camps.", type: "action" },
      { title: "Hours Logger", desc: "Log volunteer hours, download certificates.", type: "form" }
    ]
  },
  /* ── WELFARE ── */
  {
    id: "women",
    titleEn: "Women Support",
    titleHi: "\u092E\u0939\u093F\u0932\u093E \u0938\u0939\u093E\u092F\u0924\u093E",
    descEn: "Safe-house registries & counseling",
    descHi: "\u092E\u0939\u093F\u0932\u093E\u0913\u0902 \u0915\u0947 \u0932\u093F\u090F \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0914\u0930 \u0915\u0932\u094D\u092F\u093E\u0923",
    iconName: "Shield",
    color: "text-pink-600 bg-pink-50 border-pink-200",
    category: "welfare",
    template: "ContentFeedTemplate",
    features: [
      { title: "Encrypted Counseling Chat", desc: "Private helpline with expert aids.", type: "chat" },
      { title: "Hidden Panic Exit", desc: "Instantly clears cache, returns to home.", type: "action" },
      { title: "Safe Houses Directory", desc: "Map of immediate shelter spots.", type: "map" }
    ]
  },
  {
    id: "seniors",
    titleEn: "Senior Citizens",
    titleHi: "\u0935\u0930\u093F\u0937\u094D\u0920 \u0928\u093E\u0917\u0930\u093F\u0915",
    descEn: "Doorstep checkups & elder care",
    descHi: "\u0935\u0930\u093F\u0937\u094D\u0920 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0938\u0939\u093E\u092F\u0924\u093E",
    iconName: "HandHelping",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    category: "welfare",
    template: "ActionFormTemplate",
    features: [
      { title: "Doorstep Medical Scheduler", desc: "Book diagnostics at home.", type: "form" },
      { title: "Medication Alerts", desc: "Customized reminder board.", type: "list" },
      { title: "Digital Literacy", desc: "Weekly mobile/internet training.", type: "action" }
    ]
  },
  {
    id: "children",
    titleEn: "Children Welfare",
    titleHi: "\u092C\u093E\u0932 \u0915\u0932\u094D\u092F\u093E\u0923",
    descEn: "Scholarships & abuse reporting",
    descHi: "\u092C\u093E\u0932 \u092A\u094B\u0937\u0923 \u090F\u0935\u0902 \u0938\u0939\u093E\u092F\u0924\u093E",
    iconName: "Info",
    color: "text-amber-500 bg-amber-50 border-amber-100",
    category: "welfare",
    template: "TicketingTemplate",
    features: [
      { title: "Anonymous Abuse Reporter", desc: "Securely report child abuse.", type: "form" },
      { title: "Adoption Guide", desc: "Counselor booking & document flow.", type: "list" },
      { title: "Scholarship Tracker", desc: "Real-time academic grant updates.", type: "list" }
    ]
  },
  {
    id: "animals",
    titleEn: "Animal Welfare",
    titleHi: "\u092A\u0936\u0941 \u0915\u0932\u094D\u092F\u093E\u0923",
    descEn: "Stray rescue & adoption registry",
    descHi: "\u092C\u0947\u0938\u0939\u093E\u0930\u093E \u092A\u0936\u0941\u0913\u0902 \u0915\u0940 \u0938\u0939\u093E\u092F\u0924\u093E",
    iconName: "Compass",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    category: "welfare",
    template: "TicketingTemplate",
    features: [
      { title: "Stray Distress Reporter", desc: "Photo + location for rescue teams.", type: "form" },
      { title: "Adoption Catalog", desc: "Browse shelter stray profiles.", type: "list" },
      { title: "Feeding Volunteer Registry", desc: "Match feeders with coordinates.", type: "map" }
    ]
  },
  {
    id: "farmer",
    titleEn: "Farmer Support",
    titleHi: "\u0915\u093F\u0938\u093E\u0928 \u0938\u0939\u092F\u094B\u0917",
    descEn: "Crop diagnostic & market pricing",
    descHi: "\u0915\u0943\u0937\u093F \u0938\u0939\u093E\u092F\u0924\u093E \u0914\u0930 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923",
    iconName: "Compass",
    color: "text-green-700 bg-green-50 border-green-200",
    category: "welfare",
    template: "ContentFeedTemplate",
    features: [
      { title: "Local APMC Mandi Rates", desc: "Live prices for local crops.", type: "list" },
      { title: "Crop Disease Diagnostics", desc: "Upload image for expert analysis.", type: "form" },
      { title: "Agrarian Weather Advisory", desc: "Soil-based localized updates.", type: "info" }
    ]
  },
  {
    id: "youth",
    titleEn: "Youth Support",
    titleHi: "\u092F\u0941\u0935\u093E \u0935\u093F\u0915\u093E\u0938",
    descEn: "Career counseling & test prep",
    descHi: "\u092F\u0941\u0935\u093E \u0928\u0947\u0924\u0943\u0924\u094D\u0935 \u090F\u0935\u0902 \u0930\u094B\u091C\u0917\u093E\u0930",
    iconName: "Users",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    category: "welfare",
    template: "ContentFeedTemplate",
    features: [
      { title: "Career Counseling Matrix", desc: "Book 1-on-1 virtual mentoring.", type: "action" },
      { title: "Exams Prep Portal", desc: "Free syllabus & mock papers.", type: "list" },
      { title: "Peer Support Forum", desc: "Anonymous sharing dashboard.", type: "chat" }
    ]
  },
  /* ── EMPOWERMENT ── */
  {
    id: "education",
    titleEn: "Education Support",
    titleHi: "\u0936\u093F\u0915\u094D\u0937\u093E \u0938\u0939\u092F\u094B\u0917",
    descEn: "Free textbooks & scholarship portals",
    descHi: "\u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u0914\u0930 \u092A\u0941\u0938\u094D\u0924\u0915 \u0938\u0939\u093E\u092F\u0924\u093E",
    iconName: "BookOpen",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    category: "empowerment",
    template: "ContentFeedTemplate",
    features: [
      { title: "Digital Textbook Library", desc: "Download NCERT guides & video lessons.", type: "list" },
      { title: "BPL Scholarship Entry", desc: "Apply for private center sponsorships.", type: "form" },
      { title: "Literacy Map Finder", desc: "Locate nearest study groups.", type: "map" }
    ]
  },
  {
    id: "health",
    titleEn: "Health Services",
    titleHi: "\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u0947\u0935\u093E\u090F\u0902",
    descEn: "Clinic appointment & medicine",
    descHi: "\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0936\u093F\u0935\u093F\u0930 \u0914\u0930 \u091A\u093F\u0915\u093F\u0924\u094D\u0938\u093E",
    iconName: "Heart",
    color: "text-green-600 bg-emerald-50 border-emerald-200",
    category: "empowerment",
    template: "ContentFeedTemplate",
    features: [
      { title: "Teleconsultation Scheduler", desc: "Book at RP Seva centers.", type: "form" },
      { title: "Medicine Finder", desc: "Generic medicine availability.", type: "list" },
      { title: "Health Metrics Checker", desc: "BMI and wellness tracker.", type: "form" }
    ]
  },
  {
    id: "skills",
    titleEn: "Skills Training",
    titleHi: "\u0915\u094C\u0936\u0932 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923",
    descEn: "Tailoring, coding & mechanical courses",
    descHi: "\u0928\u093F\u0936\u0941\u0932\u094D\u0915 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923 \u0915\u094B\u0930\u094D\u0938",
    iconName: "GraduationCap",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    category: "empowerment",
    template: "ContentFeedTemplate",
    features: [
      { title: "VOD Certification Courses", desc: "Tailoring, repairs, coding videos.", type: "list" },
      { title: "Automated Testing Hub", desc: "Submit tests & download certificates.", type: "action" },
      { title: "Job Vacancy Board", desc: "Recruitment links for trainees.", type: "list" }
    ]
  },
  {
    id: "schemes",
    titleEn: "Government Schemes",
    titleHi: "\u0938\u0930\u0915\u093E\u0930\u0940 \u092F\u094B\u091C\u0928\u093E\u090F\u0902",
    descEn: "Eligibility calculator & guides",
    descHi: "\u0906\u0927\u093E\u0930, \u0930\u093E\u0936\u0928 \u090F\u0935\u0902 PM \u0906\u0935\u093E\u0938 \u0938\u0939\u093E\u092F\u0924\u093E",
    iconName: "Info",
    color: "text-teal-700 bg-teal-50 border-teal-200",
    category: "empowerment",
    template: "ContentFeedTemplate",
    features: [
      { title: "Scheme Eligibility Calculator", desc: "Ayushman, PMAY eligibility check.", type: "form" },
      { title: "How-To Breakdown", desc: "Document checklist for govt aid.", type: "list" },
      { title: "Direct PDF Download Hub", desc: "Official registration forms archive.", type: "action" }
    ]
  },
  /* ── CIVIC ── */
  {
    id: "human_rights",
    titleEn: "Human Rights",
    titleHi: "\u092E\u093E\u0928\u0935\u093E\u0927\u093F\u0915\u093E\u0930",
    descEn: "Legal aid registry & rights guide",
    descHi: "\u0915\u093E\u0928\u0942\u0928\u0940 \u091C\u093E\u0917\u0930\u0942\u0915\u0924\u093E \u0939\u0947\u0932\u094D\u092A\u0932\u093E\u0907\u0928",
    iconName: "Scale",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    category: "civic",
    template: "TicketingTemplate",
    features: [
      { title: "Legal Aid Application", desc: "Apply for wage theft or abuse cases.", type: "form" },
      { title: "Multilingual Rights Guide", desc: "Know your constitutional guarantees.", type: "list" },
      { title: "Petition Forum", desc: "Sign collective civic letters.", type: "action" }
    ]
  },
  {
    id: "consumer",
    titleEn: "Consumer Protection",
    titleHi: "\u0909\u092A\u092D\u094B\u0915\u094D\u0924\u093E \u0938\u0902\u0930\u0915\u094D\u0937\u0923",
    descEn: "Billing frauds & barcode checks",
    descHi: "\u0909\u092A\u092D\u094B\u0915\u094D\u0924\u093E \u0936\u093F\u0915\u093E\u092F\u0924 \u0928\u093F\u0935\u093E\u0930\u0923",
    iconName: "FileText",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    category: "civic",
    template: "TicketingTemplate",
    features: [
      { title: "Court File Generator", desc: "Auto-compile consumer court docs.", type: "form" },
      { title: "Barcode Cert Scan", desc: "AI verifying product quality.", type: "action" },
      { title: "Scam Alerts Board", desc: "Live local business fraud warnings.", type: "list" }
    ]
  },
  {
    id: "environment",
    titleEn: "Environment",
    titleHi: "\u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0935\u093F\u0915\u093E\u0938",
    descEn: "Plantation drives & waste reporting",
    descHi: "\u0935\u0943\u0915\u094D\u0937\u093E\u0930\u094B\u092A\u0923 \u090F\u0935\u0902 \u0939\u0930\u093F\u0924 \u0935\u093F\u0915\u093E\u0938",
    iconName: "Trees",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    category: "civic",
    template: "TicketingTemplate",
    features: [
      { title: "Plantation Drive Signup", desc: "Register for seed planting events.", type: "action" },
      { title: "Waste Dump Reporter", desc: "Geo-tag illegal dump coordinates.", type: "form" },
      { title: "Footprint Questionnaire", desc: "Assess household carbon score.", type: "form" }
    ]
  },
  {
    id: "culture",
    titleEn: "Culture & Heritage",
    titleHi: "\u0938\u0902\u0938\u094D\u0915\u0943\u0924\u093F \u0935 \u0927\u0930\u094B\u0939\u0930",
    descEn: "Walking tours & folk art archives",
    descHi: "\u0927\u0930\u094B\u0939\u0930 \u0938\u0902\u0930\u0915\u094D\u0937\u0923 \u090F\u0935\u0902 \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0917\u094C\u0930\u0935",
    iconName: "Landmark",
    color: "text-amber-800 bg-amber-50 border-amber-200",
    category: "civic",
    template: "ContentFeedTemplate",
    features: [
      { title: "Heritage Walking Tour", desc: "Book weekly historic site tours.", type: "form" },
      { title: "Folk Art Repository", desc: "Tribal art videos & profiles.", type: "list" },
      { title: "Artisan Exhibition App", desc: "Traditional creators apply for booths.", type: "action" }
    ]
  },
  {
    id: "fitness",
    titleEn: "Fitness & Sports",
    titleHi: "\u092B\u093F\u091F\u0928\u0947\u0938 \u0914\u0930 \u0916\u0947\u0932",
    descEn: "Open gym directories & tournaments",
    descHi: "\u0938\u093E\u092E\u0941\u0926\u093E\u092F\u093F\u0915 \u091C\u093F\u092E \u090F\u0935\u0902 \u0916\u0947\u0932 \u092A\u094D\u0930\u0924\u093F\u092F\u094B\u0917\u093F\u0924\u093E",
    iconName: "Dumbbell",
    color: "text-slate-700 bg-slate-50 border-slate-200",
    category: "civic",
    template: "ContentFeedTemplate",
    features: [
      { title: "Free Open Gym Locator", desc: "Closest parks and playgrounds.", type: "map" },
      { title: "Tournament Signup", desc: "Register teams for local cups.", type: "form" },
      { title: "Daily Workout Tracker", desc: "Gender & age-based routine.", type: "list" }
    ]
  }
];

// server.ts
import_dotenv.default.config();
var app = (0, import_express2.default)();
app.post("/api/auth/login-multi", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: "Missing fields" });
    if (identifier === "admin" && password === "admin") {
      return res.json({ success: true, user: { id: "usr_staff_admin", name: "System Administrator", role: "super_admin" } });
    }
    const result = await pool.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`,
      [identifier]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ success: true, user: { id: user.id, name: user.full_name, phone: user.mobile, email: user.email, role: "volunteer" } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/register-volunteer", async (req, res) => {
  try {
    const data = req.body;
    const id = require("crypto").randomUUID();
    const regNumber = "RPF-" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + Math.floor(1e3 + Math.random() * 9e3);
    const username = data.full_name.split(" ")[0].toLowerCase() + Math.floor(100 + Math.random() * 900);
    const bcrypt = require("bcryptjs");
    const hash = data.password ? await bcrypt.hash(data.password, 10) : "";
    await pool.query(`
      INSERT INTO volunteers (
        id, username, registration_number, password_hash, full_name, father_husband_name, mother_name,
        dob, mobile, email, education, blood_group, skills, reason_for_joining, availability,
        national_id_1, national_id_2, country, state, city, address, pincode, area_locality,
        sansad_kshetra, vidhan_sabha, ward_no
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    `, [
      id,
      username,
      regNumber,
      hash,
      data.full_name,
      data.father_husband_name,
      data.mother_name,
      data.dob,
      data.mobile,
      data.email,
      JSON.stringify(data.education),
      data.blood_group,
      JSON.stringify(data.skills),
      data.reason_for_joining,
      data.availability,
      data.national_id_1,
      data.national_id_2,
      data.country,
      data.state,
      data.city,
      data.address,
      data.pincode,
      data.area_locality,
      data.sansad_kshetra,
      data.vidhan_sabha,
      data.ward_no
    ]);
    res.json({ success: true, user: { id, username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body;
    const userResult = await pool.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`,
      [identifier]
    );
    if (userResult.rows.length === 0) return res.json({ success: true });
    const user = userResult.rows[0];
    if (user.email) {
      const crypto2 = require("crypto");
      const token = crypto2.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 6e4);
      await pool.query(
        `INSERT INTO password_reset_tokens ("userId", token, expires_at) VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt.toISOString()]
      );
      const nodemailer = require("nodemailer");
      const transp = nodemailer.createTransport({ host: process.env.SMTP_HOST || "appapi.therpfoundation.org", port: 465, secure: true, auth: { user: process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org", pass: process.env.SMTP_PASSWORD || "therpfoundation@321" } });
      const origin = process.env.NODE_ENV === "production" ? "https://therpfoundation.org" : "http://localhost:5173";
      const resetLink = origin + `/reset-password?token=${token}`;
      await transp.sendMail({
        from: '"RP Foundation" <' + (process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org") + ">",
        to: user.email,
        subject: "Password Reset Request",
        text: `Click here to reset your password. This link is valid for 15 minutes: ${resetLink}`
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/reset-ticket", async (req, res) => {
  try {
    const { identifier } = req.body;
    await pool.query(
      `INSERT INTO grievances (title, description, category, urgency, location, "reportedBy", status, "createdAt")
       VALUES ($1, $2, 'Account Support', 'Medium', 'Online', $3, 'Pending', NOW())`,
      ["Admin Reset Request", "User requested an admin password reset", identifier]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require("@simplewebauthn/server");
var webAuthnChallengeStore = /* @__PURE__ */ new Map();
app.get("/api/auth/webauthn/register-options", async (req, res) => {
  try {
    const { userId } = req.query;
    const userResult = await pool.query("SELECT * FROM volunteers WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = userResult.rows[0];
    const userPasskeys = await pool.query('SELECT * FROM passkeys WHERE "userId" = $1', [userId]);
    const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
    const options = await generateRegistrationOptions({
      rpName: "RP Foundation App",
      rpID,
      userID: user.id,
      userName: user.username || user.email || user.mobile,
      attestationType: "none",
      excludeCredentials: userPasskeys.rows.map((pk) => ({
        id: pk.credentialID,
        type: "public-key",
        transports: pk.transports ? JSON.parse(pk.transports) : ["internal"]
      }))
    });
    webAuthnChallengeStore.set(user.id, options.challenge);
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/webauthn/register-verify", async (req, res) => {
  try {
    const { userId, response } = req.body;
    const expectedChallenge = webAuthnChallengeStore.get(userId);
    if (!expectedChallenge) return res.status(400).json({ error: "Challenge expired" });
    const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
    const origin = process.env.NODE_ENV === "production" ? `https://${rpID}` : "http://localhost:5173";
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID
    });
    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;
      const publicKeyBase64 = Buffer.from(credentialPublicKey).toString("base64");
      const credentialIDBase64 = Buffer.from(credentialID).toString("base64");
      await pool.query(
        `INSERT INTO passkeys ("credentialID", "publicKey", "counter", "transports", "userId") VALUES ($1, $2, $3, $4, $5)`,
        [credentialIDBase64, publicKeyBase64, counter, JSON.stringify(response.response.transports || []), userId]
      );
      webAuthnChallengeStore.delete(userId);
      return res.json({ success: true, verified: true });
    }
    return res.status(400).json({ error: "Verification failed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/webauthn/login-options", async (req, res) => {
  try {
    const { identifier } = req.body;
    const userResult = await pool.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`,
      [identifier]
    );
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = userResult.rows[0];
    const passkeysResult = await pool.query('SELECT * FROM passkeys WHERE "userId" = $1', [user.id]);
    if (passkeysResult.rows.length === 0) return res.status(400).json({ error: "No passkeys registered" });
    const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: passkeysResult.rows.map((pk) => ({
        id: Buffer.from(pk.credentialID, "base64"),
        type: "public-key",
        transports: pk.transports ? JSON.parse(pk.transports) : ["internal"]
      })),
      userVerification: "preferred"
    });
    webAuthnChallengeStore.set(user.id, options.challenge);
    res.json({ options, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/webauthn/login-verify", async (req, res) => {
  try {
    const { userId, response } = req.body;
    const expectedChallenge = webAuthnChallengeStore.get(userId);
    if (!expectedChallenge) return res.status(400).json({ error: "Challenge expired" });
    const passkeyResult = await pool.query('SELECT * FROM passkeys WHERE "credentialID" = $1', [response.id]);
    if (passkeyResult.rows.length === 0) return res.status(404).json({ error: "Passkey not found" });
    const passkey = passkeyResult.rows[0];
    const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
    const origin = process.env.NODE_ENV === "production" ? `https://${rpID}` : "http://localhost:5173";
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(passkey.credentialID, "base64"),
        credentialPublicKey: Buffer.from(passkey.publicKey, "base64"),
        counter: Number(passkey.counter)
      }
    });
    if (verification.verified) {
      await pool.query('UPDATE passkeys SET counter = $1 WHERE "credentialID" = $2', [verification.authenticationInfo.newCounter, passkey.credentialID]);
      webAuthnChallengeStore.delete(userId);
      const userResult = await pool.query("SELECT * FROM volunteers WHERE id = $1", [userId]);
      const user = userResult.rows[0];
      return res.json({ success: true, user: { id: user.id, name: user.full_name, phone: user.mobile, email: user.email, role: "volunteer" } });
    }
    return res.status(400).json({ error: "Verification failed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/jobs", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "company", "locEn", "locHi", "salary", "typeEn", "typeHi", "postedAt" FROM jobs ORDER BY "postedAt" DESC'
    );
    res.json({ jobs: result.rows });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/jobs", async (req, res) => {
  try {
    const { titleEn, titleHi, locEn, locHi, salary, typeEn, typeHi, company } = req.body;
    const id = import_crypto.default.randomUUID();
    const result = await pool.query(
      `INSERT INTO jobs 
       (id, "titleEn", "titleHi", "company", "locEn", "locHi", "salary", "typeEn", "typeHi", "postedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id`,
      [
        id,
        titleEn,
        titleHi,
        company,
        locEn,
        locHi,
        salary,
        typeEn,
        typeHi,
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM jobs WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/jobs/:id/edit", async (req, res) => {
  try {
    const { titleEn, titleHi, company, locEn, locHi, salary, typeEn, typeHi } = req.body;
    await pool.query(
      `UPDATE jobs SET 
       "titleEn" = $1, "titleHi" = $2, company = $3, "locEn" = $4, "locHi" = $5, 
       salary = $6, "typeEn" = $7, "typeHi" = $8 
       WHERE id = $9`,
      [titleEn, titleHi, company, locEn, locHi, salary, typeEn, typeHi, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/grievances", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "createdAt" FROM grievances ORDER BY "createdAt" DESC'
    );
    res.json({ grievances: result.rows });
  } catch (error) {
    console.error("Error fetching grievances:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/grievances", async (req, res) => {
  try {
    const { title, description, category, urgency, location, reportedBy, status, date, aiSummary } = req.body;
    const id = import_crypto.default.randomUUID();
    const result = await pool.query(
      `INSERT INTO grievances 
       (id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id`,
      [
        id,
        title,
        description,
        category,
        urgency,
        location,
        reportedBy,
        status || "Pending",
        date || (/* @__PURE__ */ new Date()).toLocaleDateString(),
        aiSummary || "",
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error creating grievance:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/grievances/status", async (req, res) => {
  try {
    const { id, status } = req.body;
    await pool.query("UPDATE grievances SET status = $1 WHERE id = $2", [status, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/grievances/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM grievances WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/cards", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications'
    );
    res.json({ applications: result.rows });
  } catch (error) {
    console.error("Error fetching card applications:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/cards", async (req, res) => {
  try {
    const { userId, name, gender, dob, address, idType, idNumber, status } = req.body;
    const submittedAt = (/* @__PURE__ */ new Date()).toISOString();
    await pool.query(
      `INSERT INTO card_applications 
       ("userId", name, gender, dob, address, "idType", "idNumber", status, "submittedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       ON CONFLICT ("userId") DO UPDATE SET 
       name = $2, gender = $3, dob = $4, address = $5, "idType" = $6, "idNumber" = $7, status = $8, "submittedAt" = $9`,
      [
        userId,
        name,
        gender,
        dob,
        address,
        idType,
        idNumber,
        status || "pending",
        submittedAt
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving card application:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/cards/approve", async (req, res) => {
  try {
    const { userId } = req.body;
    const cardNo = `JSC-${Math.floor(1e7 + Math.random() * 9e7)}`;
    await pool.query(
      'UPDATE card_applications SET status = $1, "cardNo" = $2 WHERE "userId" = $3',
      ["approved", cardNo, userId]
    );
    await pool.query(
      'UPDATE users SET "janSevaCardStatus" = $1, "janSevaCardNo" = $2 WHERE id = $3',
      ["approved", cardNo, userId]
    );
    res.json({ success: true, cardNo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/cards/reject", async (req, res) => {
  try {
    const { userId } = req.body;
    await pool.query(
      'UPDATE card_applications SET status = $1 WHERE "userId" = $2',
      ["rejected", userId]
    );
    await pool.query(
      'UPDATE users SET "janSevaCardStatus" = $1 WHERE id = $2',
      ["rejected", userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/cards/:userId", async (req, res) => {
  try {
    await pool.query('DELETE FROM card_applications WHERE "userId" = $1', [req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.use("/api/admin/hq", adminHqRoutes_default);
app.get("/api/settings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["general"]);
    if (result.rows.length > 0) {
      res.json({ settings: result.rows[0] });
    } else {
      const defaults = {
        id: "general",
        tollFree: "1800 - 569 - 0991",
        webUrl: "www.therpfoundation.org",
        email: "info@therpfoundation.org",
        founderMessageEn: "Our mission is simple \u2013 to serve humanity with sincerity, build strong communities, and create a better tomorrow for India.",
        founderMessageHi: "\u0939\u092E\u093E\u0930\u093E \u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F \u0938\u0930\u0932 \u0939\u0948 - \u0928\u093F\u0937\u094D\u0920\u093E \u0915\u0947 \u0938\u093E\u0925 \u092E\u093E\u0928\u0935\u0924\u093E \u0915\u0940 \u0938\u0947\u0935\u093E \u0915\u0930\u0928\u093E, \u092E\u091C\u092C\u0942\u0924 \u0938\u092E\u0941\u0926\u093E\u092F\u094B\u0902 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0928\u093E \u0914\u0930 \u092D\u093E\u0930\u0924 \u0915\u0947 \u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0928\u093E\u0917\u0930\u093F\u0915 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092C\u0947\u0939\u0924\u0930 \u0915\u0932 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0928\u093E\u0964"
      };
      await pool.query(
        'INSERT INTO settings (id, "tollFree", "webUrl", email, "founderMessageEn", "founderMessageHi") VALUES ($1, $2, $3, $4, $5, $6)',
        [defaults.id, defaults.tollFree, defaults.webUrl, defaults.email, defaults.founderMessageEn, defaults.founderMessageHi]
      );
      res.json({ settings: defaults });
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/settings", async (req, res) => {
  try {
    const { tollFree, webUrl, email, founderMessageEn, founderMessageHi } = req.body;
    await pool.query(
      `INSERT INTO settings (id, "tollFree", "webUrl", email, "founderMessageEn", "founderMessageHi") 
       VALUES ('general', $1, $2, $3, $4, $5) 
       ON CONFLICT (id) DO UPDATE SET 
       "tollFree" = $1, "webUrl" = $2, email = $3, "founderMessageEn" = $4, "founderMessageHi" = $5`,
      [tollFree, webUrl, email, founderMessageEn, founderMessageHi]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/public/services", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    let customServices = [];
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      if (parsed.customServices) {
        customServices = parsed.customServices;
      }
    }
    const allServices = [...coreServices, ...customServices];
    res.json({ success: true, data: allServices });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/public/services/:serviceId/content", getServiceContent);
app.get("/api/cms", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      let parsed = JSON.parse(result.rows[0].founderMessageEn);
      let modified = false;
      if (!parsed.faqs) {
        parsed.faqs = [
          {
            id: "faq-1",
            questionEn: "What is the Jan Seva Smart ID Card?",
            questionHi: "\u091C\u0928 \u0938\u0947\u0935\u093E \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0906\u0908\u0921\u0940 \u0915\u093E\u0930\u094D\u0921 \u0915\u094D\u092F\u093E \u0939\u0948?",
            answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
            answerHi: "\u092F\u0939 \u092E\u0927\u094D\u092F \u092A\u094D\u0930\u0926\u0947\u0936 \u0915\u0947 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0926\u094D\u0935\u093E\u0930\u093E \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u093F\u092F\u093E \u091C\u093E\u0928\u0947 \u0935\u093E\u0932\u093E \u090F\u0915 \u0921\u093F\u091C\u093F\u091F\u0932 \u0915\u093E\u0930\u094D\u0921 \u0939\u0948, \u091C\u093F\u0938\u0915\u0947 \u092E\u093E\u0927\u094D\u092F\u092E \u0938\u0947 \u0906\u092A \u0938\u092D\u0940 21 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0938\u0947\u0935\u093E\u0913\u0902 \u0915\u093E \u0932\u093E\u092D \u0938\u0930\u0932\u0924\u093E \u0938\u0947 \u0909\u0920\u093E \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964"
          },
          {
            id: "faq-2",
            questionEn: "How long does card approval take?",
            questionHi: "\u0915\u093E\u0930\u094D\u0921 \u0938\u094D\u0935\u0940\u0915\u0943\u0924\u093F \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
            answerHi: "\u0906\u0935\u0947\u0926\u0928 \u091C\u092E\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926, \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u091F\u0940\u092E \u0906\u092A\u0915\u0947 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u094B\u0902 \u0915\u0940 \u091C\u093E\u0902\u091A \u0915\u0930\u0924\u0940 \u0939\u0948 \u0914\u0930 \u0938\u093E\u0927\u093E\u0930\u0923\u0924\u0903 2 \u0938\u0947 3 \u0915\u093E\u0930\u094D\u092F \u0926\u093F\u0935\u0938\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0947 \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0926\u093F\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964"
          },
          {
            id: "faq-3",
            questionEn: "How long does grievance resolution take?",
            questionHi: "\u0936\u093F\u0915\u093E\u092F\u0924 \u0928\u093F\u0935\u093E\u0930\u0923 \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
            answerHi: "\u0938\u092D\u0940 \u0928\u093E\u0917\u0930\u093F\u0915 \u0936\u093F\u0915\u093E\u092F\u0924\u094B\u0902 \u0915\u094B \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926 \u0938\u0940\u0927\u0947 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u092A\u094D\u0930\u0936\u093E\u0938\u0915\u094B\u0902 \u0915\u094B \u092D\u0947\u091C\u093E \u091C\u093E\u0924\u093E \u0939\u0948, \u091C\u094B 48 \u0938\u0947 72 \u0918\u0902\u091F\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0915\u093E \u0938\u092E\u093E\u0927\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u093E \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964"
          }
        ];
        modified = true;
      }
      if (!parsed.aboutTextEn) {
        parsed.aboutTextEn = "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.";
        parsed.aboutTextHi = "\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u090F\u0915 \u0917\u0948\u0930-\u0932\u093E\u092D\u0915\u093E\u0930\u0940 \u0938\u0902\u0917\u0920\u0928 \u0939\u0948 \u091C\u094B \u0938\u092E\u093E\u091C \u0915\u0947 \u0915\u092E\u091C\u094B\u0930 \u0935\u0930\u094D\u0917\u094B\u0902 \u0915\u094B \u0938\u0936\u0915\u094D\u0924 \u092C\u0928\u093E\u0928\u0947, \u0936\u093F\u0915\u094D\u0937\u093E, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F, \u0914\u0930 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0928\u093E\u0917\u0930\u093F\u0915 \u0930\u093E\u0939\u0924 \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927 \u0939\u0948\u0964";
        parsed.logoImgUrl = "/assets/logo.png";
        modified = true;
      }
      if (modified) {
        await pool.query(
          'UPDATE settings SET "founderMessageEn" = $1 WHERE id = $2',
          [JSON.stringify(parsed), "cms_data"]
        );
      }
      return res.json({ success: true, cms: parsed });
    } else {
      const defaults = {
        alertBannerEn: "",
        alertBannerHi: "",
        founderName: "Rohit Pandit",
        founderDesignation: "Founder, RP Foundation",
        founderImgUrl: "/assets/founder.png",
        aboutTextEn: "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.",
        aboutTextHi: "\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u090F\u0915 \u0917\u0948\u0930-\u0932\u093E\u092D\u0915\u093E\u0930\u0940 \u0938\u0902\u0917\u0920\u0928 \u0939\u0948 \u091C\u094B \u0938\u092E\u093E\u091C \u0915\u0947 \u0915\u092E\u091C\u094B\u0930 \u0935\u0930\u094D\u0917\u094B\u0902 \u0915\u094B \u0938\u0936\u0915\u094D\u0924 \u092C\u0928\u093E\u0928\u0947, \u0936\u093F\u0915\u094D\u0937\u093E, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F, \u0914\u0930 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0928\u093E\u0917\u0930\u093F\u0915 \u0930\u093E\u0939\u0924 \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927 \u0939\u0948\u0964",
        logoImgUrl: "/assets/logo.png",
        faqs: [
          {
            id: "faq-1",
            questionEn: "What is the Jan Seva Smart ID Card?",
            questionHi: "\u091C\u0928 \u0938\u0947\u0935\u093E \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0906\u0908\u0921\u0940 \u0915\u093E\u0930\u094D\u0921 \u0915\u094D\u092F\u093E \u0939\u0948?",
            answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
            answerHi: "\u092F\u0939 \u092E\u0927\u094D\u092F \u092A\u094D\u0930\u0926\u0947\u0936 \u0915\u0947 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0926\u094D\u0935\u093E\u0930\u093E \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u093F\u092F\u093E \u091C\u093E\u0928\u0947 \u0935\u093E\u0932\u093E \u090F\u0915 \u0921\u093F\u091C\u093F\u091F\u0932 \u0915\u093E\u0930\u094D\u0921 \u0939\u0948, \u091C\u093F\u0938\u0915\u0947 \u092E\u093E\u0927\u094D\u092F\u092E \u0938\u0947 \u0906\u092A \u0938\u092D\u0940 21 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0938\u0947\u0935\u093E\u0913\u0902 \u0915\u093E \u0932\u093E\u092D \u0938\u0930\u0932\u0924\u093E \u0938\u0947 \u0909\u0920\u093E \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964"
          },
          {
            id: "faq-2",
            questionEn: "How long does card approval take?",
            questionHi: "\u0915\u093E\u0930\u094D\u0921 \u0938\u094D\u0935\u0940\u0915\u0943\u0924\u093F \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
            answerHi: "\u0906\u0935\u0947\u0926\u0928 \u091C\u092E\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926, \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u091F\u0940\u092E \u0906\u092A\u0915\u0947 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u094B\u0902 \u0915\u0940 \u091C\u093E\u0902\u091A \u0915\u0930\u0924\u0940 \u0939\u0948 \u0914\u0930 \u0938\u093E\u0927\u093E\u0930\u0923\u0924\u0903 2 \u0938\u0947 3 \u0915\u093E\u0930\u094D\u092F \u0926\u093F\u0935\u0938\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0947 \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0926\u093F\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964"
          },
          {
            id: "faq-3",
            questionEn: "How long does grievance resolution take?",
            questionHi: "\u0936\u093F\u0915\u093E\u092F\u0924 \u0928\u093F\u0935\u093E\u0930\u0923 \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
            answerHi: "\u0938\u092D\u0940 \u0928\u093E\u0917\u0930\u093F\u0915 \u0936\u093F\u0915\u093E\u092F\u0924\u094B\u0902 \u0915\u094B \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926 \u0938\u0940\u0927\u0947 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u092A\u094D\u0930\u0936\u093E\u0938\u0915\u094B\u0902 \u0915\u094B \u092D\u0947\u091C\u093E \u091C\u093E\u0924\u093E \u0939\u0948, \u091C\u094B 48 \u0938\u0947 72 \u0918\u0902\u091F\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0915\u093E \u0938\u092E\u093E\u0927\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u093E \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964"
          }
        ],
        carouselSlides: [
          {
            titleEn: "Together, We Build a Better Tomorrow",
            titleHi: "\u090F\u0915 \u092C\u0947\u0939\u0924\u0930 \u0915\u0932 \u0915\u0947 \u0932\u093F\u090F \u0938\u093E\u0925 \u092E\u093F\u0932\u0915\u0930 \u0906\u0917\u0947 \u092C\u095D\u0947\u0902",
            subEn: "Empowering lives. Strengthening communities.",
            subHi: "\u091C\u0940\u0935\u0928 \u0915\u094B \u0938\u0936\u0915\u094D\u0924 \u092C\u0928\u093E\u0928\u093E\u0964 \u0938\u092E\u0941\u0926\u093E\u092F\u094B\u0902 \u0915\u094B \u0938\u0941\u0926\u0943\u095D \u0915\u0930\u0928\u093E\u0964",
            image: "/assets/mega_camp_banner.png"
          },
          {
            titleEn: "Building a Better Tomorrow for Every Citizen",
            titleHi: "\u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0928\u093E\u0917\u0930\u093F\u0915 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092C\u0947\u0939\u0924\u0930 \u0915\u0932 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923",
            subEn: "We create healthier, stronger, and empowered communities.",
            subHi: "\u0939\u092E \u0938\u094D\u0935\u0938\u094D\u0925, \u0938\u0936\u0915\u094D\u0924 \u0914\u0930 \u0905\u0927\u093F\u0915 \u0938\u092E\u0943\u0926\u094D\u0927 \u0938\u092E\u093E\u091C \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964",
            image: "/assets/water_pump_camp.png"
          }
        ],
        customServices: [],
        socialDirectory: [
          {
            name: "RP Foundation (Official)",
            platform: "instagram",
            handle: "@rpfoundationofficial",
            url: "https://www.instagram.com/rpfoundationofficial/",
            descEn: "Latest photos, videos & daily campaign highlights.",
            descHi: "\u0928\u0935\u0940\u0928\u0924\u092E \u092B\u094B\u091F\u094B, \u0935\u0940\u0921\u093F\u092F\u094B \u0914\u0930 \u0926\u0948\u0928\u093F\u0915 \u0905\u092D\u093F\u092F\u093E\u0928 \u0915\u0940 \u091D\u0932\u0915\u093F\u092F\u093E\u0901\u0964"
          },
          {
            name: "Rohit Pandit (Founder)",
            platform: "instagram",
            handle: "@therohitpandit",
            url: "https://www.instagram.com/therohitpandit/",
            descEn: "Founder Rohit Pandit's personal social updates.",
            descHi: "\u0938\u0902\u0938\u094D\u0925\u093E\u092A\u0915 \u0930\u094B\u0939\u093F\u0924 \u092A\u0902\u0921\u093F\u0924 \u0915\u093E \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u091C\u0928\u0938\u0947\u0935\u093E \u092C\u094D\u0932\u0949\u0917\u0964"
          },
          {
            name: "RP Foundation Facebook",
            platform: "facebook",
            handle: "@rpfofficial",
            url: "https://www.facebook.com/rpfofficial",
            descEn: "Facebook community feeds and welfare program updates.",
            descHi: "\u092B\u0947\u0938\u092C\u0941\u0915 \u0938\u092E\u0941\u0926\u093E\u092F \u0914\u0930 \u091C\u0928 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E\u094B\u0902 \u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940\u0964"
          },
          {
            name: "RP Foundation on X",
            platform: "x",
            handle: "@rpfoundation15",
            url: "https://x.com/rpfoundation15",
            descEn: "Real-time updates, announcements & relief requests.",
            descHi: "\u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0918\u094B\u0937\u0923\u093E\u090F\u0902 \u0914\u0930 \u0924\u094D\u0935\u0930\u093F\u0924 \u0930\u093E\u0939\u0924 \u0905\u0932\u0930\u094D\u091F \u091F\u094D\u0935\u093F\u091F\u0930 \u092A\u0930\u0964"
          },
          {
            name: "RP Foundation YouTube",
            platform: "youtube",
            handle: "RP Foundation Official",
            url: "https://www.youtube.com/@rpfoundationofficial",
            descEn: "Public awareness tutorials & campaign video reports.",
            descHi: "\u091C\u0928 \u091C\u093E\u0917\u0930\u0942\u0915\u0924\u093E \u091F\u094D\u092F\u0942\u091F\u094B\u0930\u093F\u092F\u0932 & \u0905\u092D\u093F\u092F\u093E\u0928 \u0915\u0940 \u0935\u0940\u0921\u093F\u092F\u094B \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u094D\u0938\u0964"
          }
        ],
        notifications: [
          {
            id: "1",
            type: "urgent",
            titleEn: "Urgent Blood Need: O+",
            titleHi: "\u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0930\u0915\u094D\u0924 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E: O+",
            bodyEn: "Critical patient at Sehore Hospital requires 2 units of O+ blood.",
            bodyHi: "\u0938\u0940\u0939\u094B\u0930 \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u092E\u0947\u0902 \u0917\u0902\u092D\u0940\u0930 \u092E\u0930\u0940\u091C \u0915\u094B O+ \u0930\u0915\u094D\u0924 \u0915\u0940 2 \u092F\u0942\u0928\u093F\u091F \u0915\u0940 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E \u0939\u0948\u0964",
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false
          },
          {
            id: "2",
            type: "warning",
            titleEn: "Heatwave Alert - Madhya Pradesh",
            titleHi: "\u0932\u0942 \u0915\u0940 \u091A\u0947\u0924\u093E\u0935\u0928\u0940 - \u092E\u0927\u094D\u092F \u092A\u094D\u0930\u0926\u0947\u0936",
            bodyEn: "Temperatures expected to exceed 43\xB0C. Stay hydrated and avoid outdoor activity.",
            bodyHi: "\u0924\u093E\u092A\u092E\u093E\u0928 43 \u0921\u093F\u0917\u094D\u0930\u0940 \u0938\u0947\u0932\u094D\u0938\u093F\u092F\u0938 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0939\u094B\u0928\u0947 \u0915\u0940 \u0938\u0902\u092D\u093E\u0935\u0928\u093E \u0939\u0948\u0964 \u0939\u093E\u0907\u0921\u094D\u0930\u0947\u091F\u0947\u0921 \u0930\u0939\u0947\u0902 \u0914\u0930 \u092C\u093E\u0939\u0930\u0940 \u0917\u0924\u093F\u0935\u093F\u0927\u093F\u092F\u094B\u0902 \u0938\u0947 \u092C\u091A\u0947\u0902\u0964",
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false
          }
        ],
        testimonials: [
          {
            id: "t1",
            nameEn: "Satyendra Thakur",
            nameHi: "\u0938\u0924\u094D\u092F\u0947\u0902\u0926\u094D\u0930 \u0920\u093E\u0915\u0941\u0930",
            villageEn: "Karond Ward 5, Bhopal",
            villageHi: "\u0915\u0930\u094C\u0902\u0926 \u0935\u093E\u0930\u094D\u0921 5, \u092D\u094B\u092A\u093E\u0932",
            quoteEn: "My daughter received the Saraswati Scholarship directly in her bank account within 2 weeks of applying. This support is helping her pursue college education. Gratitude to Rohit Sir!",
            quoteHi: "\u092E\u0947\u0930\u0940 \u092C\u0947\u091F\u0940 \u0915\u094B \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0968 \u0938\u092A\u094D\u0924\u093E\u0939 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0938\u0940\u0927\u0947 \u0909\u0938\u0915\u0947 \u092C\u0948\u0902\u0915 \u0916\u093E\u0924\u0947 \u092E\u0947\u0902 \u0938\u0930\u0938\u094D\u0935\u0924\u0940 \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0939\u0941\u0908\u0964 \u092F\u0939 \u0938\u0939\u093E\u092F\u0924\u093E \u0909\u0938\u0947 \u0915\u0949\u0932\u0947\u091C \u0915\u0940 \u0936\u093F\u0915\u094D\u0937\u093E \u091C\u093E\u0930\u0940 \u0930\u0916\u0928\u0947 \u092E\u0947\u0902 \u092E\u0926\u0926 \u0915\u0930 \u0930\u0939\u0940 \u0939\u0948\u0964 \u0930\u094B\u0939\u093F\u0924 \u0938\u0930 \u0915\u094B \u0927\u0928\u094D\u092F\u0935\u093E\u0926!"
          },
          {
            id: "t2",
            nameEn: "Shanti Devi",
            nameHi: "\u0936\u093E\u0928\u094D\u0924\u093F \u0926\u0947\u0935\u0940",
            villageEn: "Sehore Block, MP",
            villageHi: "\u0938\u0940\u0939\u094B\u0930 \u092C\u094D\u0932\u0949\u0915, \u092E.\u092A\u094D\u0930.",
            quoteEn: "During my husband's eye surgery, RP Foundation volunteers did everything from hospital registration to arranging blood donors. They treated us like family members.",
            quoteHi: "\u092E\u0947\u0930\u0947 \u092A\u0924\u093F \u0915\u0947 \u0928\u0947\u0924\u094D\u0930 \u0911\u092A\u0930\u0947\u0936\u0928 \u0915\u0947 \u0926\u094C\u0930\u093E\u0928, \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0915\u0947 \u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915\u094B\u0902 \u0928\u0947 \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0938\u0947 \u0932\u0947\u0915\u0930 \u0930\u0915\u094D\u0924\u0926\u093E\u0924\u093E\u0913\u0902 \u0915\u0940 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u0915\u0930\u0928\u0947 \u0924\u0915 \u0938\u092C \u0915\u0941\u091B \u0915\u093F\u092F\u093E\u0964 \u0909\u0928\u094D\u0939\u094B\u0902\u0928\u0947 \u0939\u092E\u093E\u0930\u0947 \u0938\u093E\u0925 \u092A\u0930\u093F\u0935\u093E\u0930 \u0915\u0947 \u0938\u0926\u0938\u094D\u092F\u094B\u0902 \u091C\u0948\u0938\u093E \u0935\u094D\u092F\u0935\u0939\u093E\u0930 \u0915\u093F\u092F\u093E\u0964"
          }
        ]
      };
      await pool.query(
        `INSERT INTO settings (id, "founderMessageEn") VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $2`,
        ["cms_data", JSON.stringify(defaults)]
      );
      return res.json({ success: true, cms: defaults });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/cms", async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1) 
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/campaigns", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "imageUrl" AS "coverImgUrl", urgent, "createdAt" FROM campaigns ORDER BY "createdAt" DESC'
    );
    res.json({ campaigns: result.rows });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/campaigns", async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    const id = import_crypto.default.randomUUID();
    await pool.query(
      `INSERT INTO campaigns 
       (id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "coverImgUrl", urgent, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        titleEn,
        titleHi,
        Number(goalAmount) || 0,
        Number(raisedAmount) || 0,
        imageUrl || "",
        imageUrl || "",
        !!urgent,
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/campaigns/:id/edit", async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    await pool.query(
      `UPDATE campaigns SET 
       "titleEn" = $1, "titleHi" = $2, "goalAmount" = $3, "raisedAmount" = $4, 
       "imageUrl" = $5, "coverImgUrl" = $6, urgent = $7 
       WHERE id = $8`,
      [
        titleEn,
        titleHi,
        Number(goalAmount) || 0,
        Number(raisedAmount) || 0,
        imageUrl || "",
        imageUrl || "",
        !!urgent,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error editing campaign:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/campaigns/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM campaigns WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/social", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link, "createdAt" FROM social_posts ORDER BY "createdAt" DESC'
    );
    res.json({ posts: result.rows });
  } catch (error) {
    console.error("Error fetching social posts:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/social", async (req, res) => {
  try {
    const { author, role, avatar, textEn, textHi, image, platform, link } = req.body;
    const id = import_crypto.default.randomUUID();
    await pool.query(
      `INSERT INTO social_posts 
       (id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, false, $8, $9, $10)`,
      [
        id,
        author,
        role,
        avatar || "",
        textEn,
        textHi,
        image || "",
        platform || "instagram",
        link || "",
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true, id });
  } catch (error) {
    console.error("Error creating social post:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/social/like", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await pool.query("SELECT liked, likes FROM social_posts WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      const post = result.rows[0];
      const liked = !post.liked;
      const likes = liked ? post.likes + 1 : Math.max(0, post.likes - 1);
      await pool.query("UPDATE social_posts SET liked = $1, likes = $2 WHERE id = $3", [liked, likes, id]);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/social/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM social_posts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/social/:id/edit", async (req, res) => {
  try {
    const { author, role, avatar, textEn, textHi, image, platform, link } = req.body;
    await pool.query(
      `UPDATE social_posts SET 
       author = $1, role = $2, avatar = $3, "textEn" = $4, "textHi" = $5, 
       image = $6, platform = $7, link = $8 
       WHERE id = $9`,
      [author, role, avatar, textEn, textHi, image, platform, link, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/volunteers", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, points, "registeredAt" FROM volunteers ORDER BY "registeredAt" DESC'
    );
    res.json({ volunteers: result.rows });
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/volunteers/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM volunteers WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/volunteers/:id/points", async (req, res) => {
  try {
    const { points } = req.body;
    await pool.query("UPDATE users SET points = $1 WHERE id = $2", [points, req.params.id]);
    await pool.query("UPDATE volunteers SET points = $1 WHERE id = $2", [points, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/submissions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, "userId", "serviceNameEn", "serviceName", "citizenName", "citizenPhone", "submissionData", status, latitude, longitude, "createdAt", timestamp 
       FROM service_submissions 
       ORDER BY timestamp DESC`
    );
    res.json({ submissions: result.rows });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/submissions", async (req, res) => {
  try {
    let body = req.body;
    if (Array.isArray(body)) {
      body = body[0];
    }
    const { userId, citizenName, citizenPhone, serviceName, submissionData, status, latitude, longitude, timestamp } = body;
    const id = import_crypto.default.randomUUID();
    const result = await pool.query(
      `INSERT INTO service_submissions 
       (id, "userId", "serviceNameEn", "serviceName", "citizenName", "citizenPhone", "submissionData", status, latitude, longitude, "createdAt", timestamp) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING id`,
      [
        id,
        userId || "guest",
        serviceName,
        serviceName,
        citizenName || "Citizen",
        citizenPhone || "",
        submissionData || "{}",
        status || "pending",
        latitude || null,
        longitude || null,
        (/* @__PURE__ */ new Date()).toISOString(),
        timestamp || (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Error creating submission:", err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/submissions/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE service_submissions SET status = $1 WHERE id = $2", [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/submissions/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM service_submissions WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/users/:id", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, points, badges, "janSevaCardStatus", "janSevaCardNo", "isVolunteer", "isDonor", "onboardingCompleted", "registeredAt" FROM users WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/users/:id/update", async (req, res) => {
  try {
    const fields = Object.keys(req.body);
    if (fields.length === 0) {
      return res.json({ success: true });
    }
    const setClause = fields.map((field, idx) => `"${field}" = $${idx + 1}`).join(", ");
    const values = fields.map((field) => req.body[field]);
    values.push(req.params.id);
    await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${values.length}`,
      values
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/health_camps", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "createdAt" FROM health_camps ORDER BY "createdAt" DESC'
    );
    res.json({ camps: result.rows });
  } catch (error) {
    console.error("Error fetching health camps:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/health_camps", async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body;
    const id = import_crypto.default.randomUUID();
    await pool.query(
      `INSERT INTO health_camps 
       (id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        titleEn,
        titleHi,
        dateEn,
        dateHi,
        locationEn,
        locationHi,
        contact || "",
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating health camp:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/health_camps/:id/edit", async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body;
    await pool.query(
      `UPDATE health_camps SET 
       "titleEn" = $1, "titleHi" = $2, "dateEn" = $3, "dateHi" = $4, 
       "locationEn" = $5, "locationHi" = $6, contact = $7 
       WHERE id = $8`,
      [titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error editing health camp:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/health_camps/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM health_camps WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting health camp:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/blood_donors", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, "bloodGroup", phone, location, verified, distance, "lastDonated" FROM blood_donors ORDER BY "createdAt" DESC'
    );
    res.json({ donors: result.rows });
  } catch (error) {
    console.error("Error fetching blood donors:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/blood_donors", async (req, res) => {
  try {
    const { name, bloodGroup, phone, location, verified, distance, lastDonated } = req.body;
    const id = import_crypto.default.randomUUID();
    await pool.query(
      `INSERT INTO blood_donors 
       (id, name, "bloodGroup", phone, location, verified, distance, "lastDonated", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        name,
        bloodGroup,
        phone,
        location || "Local Area",
        verified !== false,
        distance || "0.1 km away",
        lastDonated || "Available",
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating blood donor:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/job_applications", async (req, res) => {
  try {
    const { jobId, jobTitle, fullName, phone, resume } = req.body;
    const id = import_crypto.default.randomUUID();
    await pool.query(
      `INSERT INTO job_applications (id, "jobId", "jobTitle", "fullName", phone, resume, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, jobId, jobTitle, fullName, phone, resume || "", (/* @__PURE__ */ new Date()).toISOString()]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving job application:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/notifications", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ notifications: parsed.notifications || [] });
    }
    res.json({ notifications: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/testimonials", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ testimonials: parsed.testimonials || [] });
    }
    res.json({ testimonials: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/stats", async (req, res) => {
  let beneficiaries = 0;
  let volunteers = 0;
  let healthCamps = 0;
  let scholarships = 0;
  try {
    const bRes = await pool.query("SELECT COUNT(*) FROM card_applications");
    beneficiaries = parseInt(bRes.rows[0].count, 10);
  } catch (e) {
  }
  try {
    const vRes = await pool.query("SELECT COUNT(*) FROM volunteers");
    volunteers = parseInt(vRes.rows[0].count, 10);
  } catch (e) {
  }
  try {
    const hRes = await pool.query("SELECT COUNT(*) FROM health_camps");
    healthCamps = parseInt(hRes.rows[0].count, 10);
  } catch (e) {
  }
  try {
    const sRes = await pool.query(`
      SELECT COUNT(*) FROM service_submissions 
      WHERE "serviceName" = 'Scholarships Support' OR "serviceNameEn" = 'Scholarships Support'
    `);
    scholarships = parseInt(sRes.rows[0].count, 10);
  } catch (e) {
  }
  res.json({
    beneficiaries,
    volunteers,
    healthCamps,
    scholarships
  });
});
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  }
});
async function saveFileLocally(file) {
  const fileExt = import_path.default.extname(file.originalname) || ".jpg";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e5)}${fileExt}`;
  const destDir = import_path.default.join(process.cwd(), "appapi.therpfoundation.org", "public", "uploads");
  if (!import_fs.default.existsSync(destDir)) {
    import_fs.default.mkdirSync(destDir, { recursive: true });
  }
  const destFilePath = import_path.default.join(destDir, filename);
  await import_fs.default.promises.writeFile(destFilePath, file.buffer);
  return `https://appapi.therpfoundation.org/uploads/${filename}`;
}
app.post("/api/upload/founder", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Founder image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/upload/broadcast", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Broadcast image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/upload/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Generic image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});
app.use("/uploads", import_express2.default.static(import_path.default.join(process.cwd(), "appapi.therpfoundation.org", "public", "uploads")));
app.get("/api/volunteer_tasks", async (req, res) => {
  try {
    const { volunteerId } = req.query;
    let query = 'SELECT * FROM volunteer_tasks ORDER BY "createdAt" DESC';
    let params = [];
    if (volunteerId) {
      query = 'SELECT * FROM volunteer_tasks WHERE "volunteerId" = $1 ORDER BY "createdAt" DESC';
      params = [volunteerId];
    }
    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (error) {
    console.error("Error fetching volunteer tasks:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/volunteer_tasks", async (req, res) => {
  try {
    const { volunteerId, titleEn, titleHi, descriptionEn, descriptionHi, points } = req.body;
    const result = await pool.query(
      `INSERT INTO volunteer_tasks ("volunteerId", "titleEn", "titleHi", "descriptionEn", "descriptionHi", "points", "status", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
       RETURNING *`,
      [volunteerId, titleEn, titleHi, descriptionEn, descriptionHi, points || 10]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error("Error creating volunteer task:", error);
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/volunteer_tasks/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const completedAt = status === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : null;
    const result = await pool.query(
      `UPDATE volunteer_tasks SET "status" = $1, "completedAt" = $2 WHERE id = $3 RETURNING *`,
      [status, completedAt, req.params.id]
    );
    if (result.rows.length > 0 && status === "completed") {
      const task = result.rows[0];
      await pool.query("UPDATE users SET points = points + $1 WHERE id = $2", [task.points, task.volunteerId]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.use("/app", import_express2.default.static(import_path.default.join(process.cwd(), "public", "app")));
app.get("/app", (req, res) => {
  res.redirect("/app/");
});
async function startServer() {
  await initDatabase();
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
