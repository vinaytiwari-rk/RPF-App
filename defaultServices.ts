export const coreServices = [
  /* ── URGENT ── */
  {
    id: "donate", titleEn: "Donate Now", titleHi: "दान सहायता",
    descEn: "Support causes & donate securely", descHi: "सुरक्षित रूप से दान करें",
    iconName: "Heart", color: "text-red-600 bg-red-50 border-red-200", category: "urgent",
    template: "ActionFormTemplate",
    features: [
      { title: "Quick-tier Amount Selector", desc: "₹500, ₹1000, ₹5000 or custom.", type: "action" },
      { title: "80G Tax Certificate", desc: "Auto-generate and download PDF.", type: "form" },
      { title: "Recurring Donation Toggle", desc: "Automated monthly subscription.", type: "action" },
    ],
  },
  {
    id: "blood", titleEn: "Blood Network", titleHi: "रक्त नेटवर्क",
    descEn: "Request or donate blood instantly", descHi: "तुरंत रक्त अनुरोध या रक्तदान करें",
    iconName: "Activity", color: "text-red-700 bg-rose-50 border-rose-200", category: "urgent",
    template: "TicketingTemplate",
    features: [
      { title: "Emergency Blood Broadcast", desc: "Post group, hospital & units needed.", type: "form" },
      { title: "Donor Registry", desc: "Submit blood type & last donation date.", type: "form" },
      { title: "Live Blood Bank Map", desc: "Locate nearby banks and donors.", type: "map" },
    ],
  },
  {
    id: "complaint", titleEn: "File Grievance", titleHi: "शिकायत पंजीकरण",
    descEn: "Register your civic grievance", descHi: "शिकायत दर्ज करें",
    iconName: "AlertTriangle", color: "text-amber-600 bg-amber-50 border-amber-200", category: "urgent",
    template: "TicketingTemplate",
    features: [
      { title: "Multi-category Description", desc: "Text & audio note attachments.", type: "form" },
      { title: "Evidence Uploader", desc: "Upload photos of civic issue.", type: "action" },
      { title: "GPS Tag & Tracker", desc: "Auto-capture location, track ticket.", type: "map" },
    ],
  },
  {
    id: "disaster", titleEn: "Disaster Management", titleHi: "आपदा प्रबंधन",
    descEn: "Emergency relief & rescue mapping", descHi: "आपातकालीन राहत एवं बचाव",
    iconName: "AlertCircle", color: "text-rose-600 bg-rose-50 border-rose-200", category: "urgent",
    template: "TicketingTemplate",
    features: [
      { title: "One-tap SOS Alert", desc: "Broadcast GPS to nearby rescue teams.", type: "action" },
      { title: "Mark Yourself Safe", desc: "Status board for family tracking.", type: "list" },
      { title: "Geo-fenced Alerts", desc: "Live disaster warnings and shelters.", type: "info" },
    ],
  },
  /* ── INVOLVED ── */
  {
    id: "jan_seva", titleEn: "Jan Seva Card", titleHi: "जन सेवा कार्ड",
    descEn: "Apply for digital Jan Seva identity pass", descHi: "जन सेवा कार्ड के लिए आवेदन करें",
    iconName: "QrCode", color: "text-blue-700 bg-blue-50 border-blue-200", category: "involved",
    template: "ActionFormTemplate",
    features: [
      { title: "Multi-step Digital KYC", desc: "Fill name, DOB, upload ID docs.", type: "form" },
      { title: "Instant QR Pass", desc: "Download secure digital pass.", type: "action" },
      { title: "Benefit Dashboard", desc: "Local discounts & subsidies.", type: "list" },
    ],
  },
  {
    id: "volunteer", titleEn: "Volunteer Opportunities", titleHi: "स्वयंसेवक अवसर",
    descEn: "Join social initiatives & log hours", descHi: "स्वयंसेवक बनें और बदलाव लाएं",
    iconName: "Users", color: "text-purple-600 bg-purple-50 border-purple-200", category: "involved",
    template: "TicketingTemplate",
    features: [
      { title: "Skill-based Matching", desc: "Teaching, IT, Fieldwork etc.", type: "list" },
      { title: "Event Calendar Signup", desc: "Weekend drives & food camps.", type: "action" },
      { title: "Hours Logger", desc: "Log volunteer hours, download certificates.", type: "form" },
    ],
  },
  /* ── WELFARE ── */
  {
    id: "women", titleEn: "Women Support", titleHi: "महिला सहायता",
    descEn: "Safe-house registries & counseling", descHi: "महिलाओं के लिए सुरक्षा और कल्याण",
    iconName: "Shield", color: "text-pink-600 bg-pink-50 border-pink-200", category: "welfare",
    template: "ContentFeedTemplate",
    features: [
      { title: "Encrypted Counseling Chat", desc: "Private helpline with expert aids.", type: "chat" },
      { title: "Hidden Panic Exit", desc: "Instantly clears cache, returns to home.", type: "action" },
      { title: "Safe Houses Directory", desc: "Map of immediate shelter spots.", type: "map" },
    ],
  },
  {
    id: "seniors", titleEn: "Senior Citizens", titleHi: "वरिष्ठ नागरिक",
    descEn: "Doorstep checkups & elder care", descHi: "वरिष्ठ नागरिकों के लिए सहायता",
    iconName: "HandHelping", color: "text-orange-600 bg-orange-50 border-orange-200", category: "welfare",
    template: "ActionFormTemplate",
    features: [
      { title: "Doorstep Medical Scheduler", desc: "Book diagnostics at home.", type: "form" },
      { title: "Medication Alerts", desc: "Customized reminder board.", type: "list" },
      { title: "Digital Literacy", desc: "Weekly mobile/internet training.", type: "action" },
    ],
  },
  {
    id: "children", titleEn: "Children Welfare", titleHi: "बाल कल्याण",
    descEn: "Scholarships & abuse reporting", descHi: "बाल पोषण एवं सहायता",
    iconName: "Info", color: "text-amber-500 bg-amber-50 border-amber-100", category: "welfare",
    template: "TicketingTemplate",
    features: [
      { title: "Anonymous Abuse Reporter", desc: "Securely report child abuse.", type: "form" },
      { title: "Adoption Guide", desc: "Counselor booking & document flow.", type: "list" },
      { title: "Scholarship Tracker", desc: "Real-time academic grant updates.", type: "list" },
    ],
  },
  {
    id: "animals", titleEn: "Animal Welfare", titleHi: "पशु कल्याण",
    descEn: "Stray rescue & adoption registry", descHi: "बेसहारा पशुओं की सहायता",
    iconName: "Compass", color: "text-emerald-700 bg-emerald-50 border-emerald-200", category: "welfare",
    template: "TicketingTemplate",
    features: [
      { title: "Stray Distress Reporter", desc: "Photo + location for rescue teams.", type: "form" },
      { title: "Adoption Catalog", desc: "Browse shelter stray profiles.", type: "list" },
      { title: "Feeding Volunteer Registry", desc: "Match feeders with coordinates.", type: "map" },
    ],
  },
  {
    id: "farmer", titleEn: "Farmer Support", titleHi: "किसान सहयोग",
    descEn: "Crop diagnostic & market pricing", descHi: "कृषि सहायता और प्रशिक्षण",
    iconName: "Compass", color: "text-green-700 bg-green-50 border-green-200", category: "welfare",
    template: "ContentFeedTemplate",
    features: [
      { title: "Local APMC Mandi Rates", desc: "Live prices for local crops.", type: "list" },
      { title: "Crop Disease Diagnostics", desc: "Upload image for expert analysis.", type: "form" },
      { title: "Agrarian Weather Advisory", desc: "Soil-based localized updates.", type: "info" },
    ],
  },
  {
    id: "youth", titleEn: "Youth Support", titleHi: "युवा विकास",
    descEn: "Career counseling & test prep", descHi: "युवा नेतृत्व एवं रोजगार",
    iconName: "Users", color: "text-indigo-600 bg-indigo-50 border-indigo-200", category: "welfare",
    template: "ContentFeedTemplate",
    features: [
      { title: "Career Counseling Matrix", desc: "Book 1-on-1 virtual mentoring.", type: "action" },
      { title: "Exams Prep Portal", desc: "Free syllabus & mock papers.", type: "list" },
      { title: "Peer Support Forum", desc: "Anonymous sharing dashboard.", type: "chat" },
    ],
  },
  /* ── EMPOWERMENT ── */
  {
    id: "education", titleEn: "Education Support", titleHi: "शिक्षा सहयोग",
    descEn: "Free textbooks & scholarship portals", descHi: "छात्रवृत्ति और पुस्तक सहायता",
    iconName: "BookOpen", color: "text-blue-600 bg-blue-50 border-blue-200", category: "empowerment",
    template: "ContentFeedTemplate",
    features: [
      { title: "Digital Textbook Library", desc: "Download NCERT guides & video lessons.", type: "list" },
      { title: "BPL Scholarship Entry", desc: "Apply for private center sponsorships.", type: "form" },
      { title: "Literacy Map Finder", desc: "Locate nearest study groups.", type: "map" },
    ],
  },
  {
    id: "health", titleEn: "Health Services", titleHi: "स्वास्थ्य सेवाएं",
    descEn: "Clinic appointment & medicine", descHi: "स्वास्थ्य शिविर और चिकित्सा",
    iconName: "Heart", color: "text-green-600 bg-emerald-50 border-emerald-200", category: "empowerment",
    template: "ContentFeedTemplate",
    features: [
      { title: "Teleconsultation Scheduler", desc: "Book at RP Seva centers.", type: "form" },
      { title: "Medicine Finder", desc: "Generic medicine availability.", type: "list" },
      { title: "Health Metrics Checker", desc: "BMI and wellness tracker.", type: "form" },
    ],
  },
  {
    id: "skills", titleEn: "Skills Training", titleHi: "कौशल प्रशिक्षण",
    descEn: "Tailoring, coding & mechanical courses", descHi: "निशुल्क प्रशिक्षण कोर्स",
    iconName: "GraduationCap", color: "text-purple-700 bg-purple-50 border-purple-200", category: "empowerment",
    template: "ContentFeedTemplate",
    features: [
      { title: "VOD Certification Courses", desc: "Tailoring, repairs, coding videos.", type: "list" },
      { title: "Automated Testing Hub", desc: "Submit tests & download certificates.", type: "action" },
      { title: "Job Vacancy Board", desc: "Recruitment links for trainees.", type: "list" },
    ],
  },
  {
    id: "schemes", titleEn: "Government Schemes", titleHi: "सरकारी योजनाएं",
    descEn: "Eligibility calculator & guides", descHi: "आधार, राशन एवं PM आवास सहायता",
    iconName: "Info", color: "text-teal-700 bg-teal-50 border-teal-200", category: "empowerment",
    template: "ContentFeedTemplate",
    features: [
      { title: "Scheme Eligibility Calculator", desc: "Ayushman, PMAY eligibility check.", type: "form" },
      { title: "How-To Breakdown", desc: "Document checklist for govt aid.", type: "list" },
      { title: "Direct PDF Download Hub", desc: "Official registration forms archive.", type: "action" },
    ],
  },
  /* ── CIVIC ── */

  {
    id: "consumer", titleEn: "Consumer Protection", titleHi: "उपभोक्ता संरक्षण",
    descEn: "Billing frauds & barcode checks", descHi: "उपभोक्ता शिकायत निवारण",
    iconName: "FileText", color: "text-amber-700 bg-amber-50 border-amber-200", category: "civic",
    template: "TicketingTemplate",
    features: [
      { title: "Court File Generator", desc: "Auto-compile consumer court docs.", type: "form" },
      { title: "Barcode Cert Scan", desc: "AI verifying product quality.", type: "action" },
      { title: "Scam Alerts Board", desc: "Live local business fraud warnings.", type: "list" },
    ],
  },
  {
    id: "environment", titleEn: "Environment", titleHi: "पर्यावरण विकास",
    descEn: "Plantation drives & waste reporting", descHi: "वृक्षारोपण एवं हरित विकास",
    iconName: "Trees", color: "text-emerald-700 bg-emerald-50 border-emerald-200", category: "civic",
    template: "TicketingTemplate",
    features: [
      { title: "Plantation Drive Signup", desc: "Register for seed planting events.", type: "action" },
      { title: "Waste Dump Reporter", desc: "Geo-tag illegal dump coordinates.", type: "form" },
      { title: "Footprint Questionnaire", desc: "Assess household carbon score.", type: "form" },
    ],
  },
  {
    id: "culture", titleEn: "Culture & Heritage", titleHi: "संस्कृति व धरोहर",
    descEn: "Walking tours & folk art archives", descHi: "धरोहर संरक्षण एवं राष्ट्रीय गौरव",
    iconName: "Landmark", color: "text-amber-800 bg-amber-50 border-amber-200", category: "civic",
    template: "ContentFeedTemplate",
    features: [
      { title: "Heritage Walking Tour", desc: "Book weekly historic site tours.", type: "form" },
      { title: "Folk Art Repository", desc: "Tribal art videos & profiles.", type: "list" },
      { title: "Artisan Exhibition App", desc: "Traditional creators apply for booths.", type: "action" },
    ],
  },
  {
    id: "fitness", titleEn: "Fitness & Sports", titleHi: "फिटनेस और खेल",
    descEn: "Open gym directories & tournaments", descHi: "सामुदायिक जिम एवं खेल प्रतियोगिता",
    iconName: "Dumbbell", color: "text-slate-700 bg-slate-50 border-slate-200", category: "civic",
    template: "ContentFeedTemplate",
    features: [
      { title: "Free Open Gym Locator", desc: "Closest parks and playgrounds.", type: "map" },
      { title: "Tournament Signup", desc: "Register teams for local cups.", type: "form" },
      { title: "Daily Workout Tracker", desc: "Gender & age-based routine.", type: "list" },
    ],
  },
];
