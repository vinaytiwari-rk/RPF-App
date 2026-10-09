export interface UtilityToolDefinition {
  id: string;
  categoryId: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  iconName: string;
  badge?: string;
  keywords: string[];
}

export interface UtilityCategoryDefinition {
  id: string;
  titleEn: string;
  titleHi: string;
  iconName: string;
  accent: string;
}

export const UTILITY_CATEGORIES: UtilityCategoryDefinition[] = [
  { id: "all", titleEn: "All Tools", titleHi: "सभी टूल्स", iconName: "LayoutGrid", accent: "from-emerald-600 to-teal-700" },
  { id: "govt_forms", titleEn: "Govt Forms & Recruitment", titleHi: "सरकारी भर्ती व फॉर्म", iconName: "BadgeCheck", accent: "from-amber-600 to-orange-700" },
  { id: "pdf_docs", titleEn: "PDF & Document Office", titleHi: "दस्तावेज व PDF ऑफिस", iconName: "FileText", accent: "from-blue-600 to-indigo-700" },
  { id: "legal_drafts", titleEn: "Legal Drafts & Notices", titleHi: "कानूनी आवेदन व प्रारूप", iconName: "Scale", accent: "from-purple-600 to-indigo-800" },
  { id: "agriculture", titleEn: "Agriculture & Farming", titleHi: "कृषि व किसान", iconName: "Sprout", accent: "from-emerald-700 to-green-800" },
  { id: "land_measure", titleEn: "Land & Measurement", titleHi: "जमीन माप व रकबा", iconName: "Maximize2", accent: "from-amber-700 to-yellow-800" },
  { id: "office_career", titleEn: "Office & Career", titleHi: "ऑफिस व करियर", iconName: "Briefcase", accent: "from-slate-700 to-slate-900" },
  { id: "education", titleEn: "School & College", titleHi: "स्कूल व कॉलेज", iconName: "GraduationCap", accent: "from-sky-600 to-blue-700" },
  { id: "small_business", titleEn: "Small Business & Khata", titleHi: "छोटा व्यापार व दुकान", iconName: "Store", accent: "from-rose-600 to-red-700" },
  { id: "banking_finance", titleEn: "Banking & Rural Finance", titleHi: "बैंकिंग व ग्रामीण वित्त", iconName: "Landmark", accent: "from-teal-600 to-cyan-700" },
  { id: "police_safety", titleEn: "Police, Safety & Citizen", titleHi: "पुलिस, सुरक्षा व कानून", iconName: "ShieldAlert", accent: "from-red-700 to-rose-800" },
  { id: "hospital_health", titleEn: "Hospital & Health Records", titleHi: "अस्पताल व स्वास्थ्य", iconName: "HeartPulse", accent: "from-rose-600 to-pink-700" },
  { id: "women_child", titleEn: "Women & Child Care", titleHi: "महिला व मातृ सुरक्षा", iconName: "HeartHandshake", accent: "from-pink-600 to-rose-600" },
  { id: "senior_citizens", titleEn: "Senior Citizens & Pension", titleHi: "वरिष्ठ नागरिक व पेंशन", iconName: "Award", accent: "from-violet-700 to-purple-800" },
  { id: "home_ration", titleEn: "Home, Family & Ration", titleHi: "घर, परिवार व राशन", iconName: "Home", accent: "from-amber-600 to-orange-600" },
  { id: "friends_travel", titleEn: "Friends & Travel", titleHi: "दोस्त, यात्रा व सामाजिक", iconName: "Compass", accent: "from-cyan-600 to-blue-700" },
  { id: "cyber_media", titleEn: "Cyber Safety & Media", titleHi: "साइबर सुरक्षा व मीडिया", iconName: "ShieldCheck", accent: "from-slate-800 to-zinc-900" },
];

export const UTILITY_TOOLS: UtilityToolDefinition[] = [
  // 1. Govt Forms & Recruitment
  {
    id: "govt_resizer",
    categoryId: "govt_forms",
    titleEn: "Govt Photo & Sign KB Resizer",
    titleHi: "सरकारी फोटो व साइन KB रीसाइज़र",
    descEn: "Strict 20KB-50KB photo and 10KB-20KB signature compressor with exact pixel dimensions.",
    descHi: "सरकारी फॉर्म्स (SSC, UPSC, Vyapam) हेतु फोटो 20-50KB व साइन 10-20KB में सटीक कंप्रेस करें।",
    iconName: "ImageDown",
    badge: "100% Offline",
    keywords: ["photo", "signature", "resizer", "compress", "kb", "ssc", "upsc", "vyapam", "size"]
  },
  {
    id: "name_date_slate",
    categoryId: "govt_forms",
    titleEn: "Passport Photo Name & Date Slate Maker",
    titleHi: "फोटो नेम व डेट स्लेट पट्टी मेकर",
    descEn: "Add official white strip with candidate Name & Date of Photo (DOP) on passport picture.",
    descHi: "सरकारी फॉर्म नियमों अनुसार फोटो के नीचे नाम व फोटो की तारीख (DOP) की सफेद पट्टी लगाएं।",
    iconName: "CalendarDays",
    badge: "Form Mandate",
    keywords: ["slate", "dop", "date of photo", "candidate name", "passport photo", "exam form"]
  },
  {
    id: "exam_age_calc",
    categoryId: "govt_forms",
    titleEn: "Govt Exam Cut-Off Age Calculator",
    titleHi: "सरकारी भर्ती कट-ऑफ आयु गणक",
    descEn: "Calculate exact age in years, months and days as on official recruitment cut-off date.",
    descHi: "भर्ती विज्ञापन की कट-ऑफ तारीख (e.g. 01/01/2026) पर अपनी सटीक आयु वर्ष, माह व दिन में निकालें।",
    iconName: "Clock",
    keywords: ["age", "cutoff", "exam age", "eligibility", "recruitment", "dob", "aayu"]
  },
  {
    id: "aadhaar_masker",
    categoryId: "govt_forms",
    titleEn: "ID Card Masker & Privacy Redactor",
    titleHi: "आधार कार्ड मास्कर व प्राइवेसी मार्कर",
    descEn: "Black out first 8 digits of Aadhaar or sensitive text before sharing documents.",
    descHi: "किसी को पहचान पत्र भेजने से पहले पहले 8 अंक या गुप्त जानकारी पर ब्लैक बार लगाकर सुरक्षित करें।",
    iconName: "ShieldCheck",
    badge: "Privacy Safe",
    keywords: ["aadhaar", "mask", "redact", "blur", "id card", "hide number", "privacy"]
  },

  // 2. PDF & Document Office
  {
    id: "doc_scanner",
    categoryId: "pdf_docs",
    titleEn: "Document Cam-Scanner to PDF",
    titleHi: "दस्तावेज़ स्कैनर (A4 PDF)",
    descEn: "Scan papers with camera, apply magic black/white contrast filter and export clean A4 PDF.",
    descHi: "कागजों की फोटो खींचकर साफ ब्लैक/व्हाइट कंट्रास्ट दें और A4 PDF फाइल डाउनलोड करें।",
    iconName: "ScanLine",
    keywords: ["scanner", "cam scanner", "document", "a4 pdf", "paper scan"]
  },
  {
    id: "images_to_pdf",
    categoryId: "pdf_docs",
    titleEn: "Images to Single PDF (फोटो से PDF)",
    titleHi: "फोटो से PDF बनाएं",
    descEn: "Combine multiple marksheet, card, or receipt photos into one ordered PDF file.",
    descHi: "मार्कशीट, आधार या रसीदों की कई फोटो जोड़कर एक व्यवस्थित PDF फाइल तैयार करें।",
    iconName: "FileImage",
    keywords: ["images to pdf", "photo to pdf", "convert", "combine images"]
  },
  {
    id: "merge_pdf",
    categoryId: "pdf_docs",
    titleEn: "PDF Merger (PDF फाइलें जोड़ें)",
    titleHi: "PDF फाइलें आपस में जोड़ें",
    descEn: "Combine two or more separate PDF documents into a single file locally on device.",
    descHi: "सरकारी पोर्टल पर अपलोड करने हेतु दो या अधिक अलग-अलग PDF को जोड़कर एक फाइल बनाएं।",
    iconName: "Files",
    keywords: ["merge pdf", "join pdf", "combine pdf", "single file"]
  },
  {
    id: "split_pdf",
    categoryId: "pdf_docs",
    titleEn: "PDF Page Splitter (पेज अलग करें)",
    titleHi: "PDF से जरूरी पेज अलग करें",
    descEn: "Extract specific pages from large PDF files directly in your phone.",
    descHi: "बड़ी PDF फाइल में से केवल अपने काम के पन्नों को अलग करके नई फाइल डाउनलोड करें।",
    iconName: "FileCode2",
    keywords: ["split pdf", "extract pages", "separate page"]
  },
  {
    id: "digital_sign",
    categoryId: "pdf_docs",
    titleEn: "Digital Signature on Document",
    titleHi: "डिजिटल हस्ताक्षर (Sign on Doc)",
    descEn: "Draw your signature on touch screen and export transparent PNG or signed letter.",
    descHi: "स्क्रीन पर उंगली से दस्तखत करें और उसे पारदर्शी PNG या सीधे दस्तावेज पर लगाएं।",
    iconName: "PenTool",
    keywords: ["signature", "sign", "digital sign", "hastakshar", "draw sign"]
  },

  // 3. Legal Drafts & Applications
  {
    id: "application_drafter",
    categoryId: "legal_drafts",
    titleEn: "Official Application Drafter (आवेदन प्रारूप)",
    titleHi: "आधिकारिक प्रार्थना पत्र व आवेदन प्रारूप",
    descEn: "Ready-made formatted applications: Ration card correction, Bank passbook loss, Electricity issue.",
    descHi: "राशन कार्ड सुधार, बैंक पासबुक खोने, बिजली बिल व नागरिक समस्याओं के प्रिंट-रेडी आवेदन पत्र।",
    iconName: "FileText",
    badge: "Print Ready",
    keywords: ["application", "prathna patra", "letter", "bank", "ration", "complaint", "nivedan"]
  },
  {
    id: "rent_cash_receipt",
    categoryId: "legal_drafts",
    titleEn: "Rent & Cash Payment Receipt Generator",
    titleHi: "मकान किराया व नकद भुगतान रसीद",
    descEn: "Generate formal HRA rent receipts or cash transaction receipts with revenue stamp outline.",
    descHi: "HRA टैक्स छूट या नकद लेनदेन के लिए कानूनी प्रारूप में तुरंत रसीद जनरेट और प्रिंट करें।",
    iconName: "Receipt",
    keywords: ["rent receipt", "hra", "kiraya", "cash receipt", "rasid"]
  },
  {
    id: "affidavit_declaration",
    categoryId: "legal_drafts",
    titleEn: "Self-Declaration & Affidavit Drafter",
    titleHi: "स्व-घोषणा पत्र व शपथ प्रारूप",
    descEn: "Draft standard self-declaration forms for govt welfare, address proof, or income declaration.",
    descHi: "सरकारी योजनाओं हेतु मानक स्व-प्रमाणन (Self-declaration) प्रारूप तैयार करें।",
    iconName: "Scroll",
    keywords: ["self declaration", "affidavit", "ghoshna patra", "shapath"]
  },
  {
    id: "rti_drafter",
    categoryId: "legal_drafts",
    titleEn: "RTI Application Drafter (सूचना का अधिकार)",
    titleHi: "RTI सूचना का अधिकार आवेदन",
    descEn: "Generate official Form-A RTI application format to seek information from any department.",
    descHi: "सरकारी विभाग से सूचना प्राप्त करने हेतु धारा 6(1) के तहत मानक आरटीआई आवेदन पत्र तैयार करें।",
    iconName: "HelpCircle",
    keywords: ["rti", "right to information", "soochna ka adhikar", "form a", "public information"]
  },

  // 4. Agriculture & Farming
  {
    id: "fertilizer_seed_calc",
    categoryId: "agriculture",
    titleEn: "Fertilizer & Seed Rate Calculator",
    titleHi: "खाद व बीज मात्रा गणक",
    descEn: "Accurate Urea, DAP, Potash and seed requirement per Bigha/Acre for Wheat, Soy, Paddy.",
    descHi: "रकबे (बीघा/एकड़) के आधार पर गेहूं, धान, सोयाबीन हेतु यूरिया, डीएपी, पोटाश व बीज की सही मात्रा।",
    iconName: "Sprout",
    keywords: ["khad", "fertilizer", "urea", "dap", "seed", "beej", "kisan", "crop"]
  },
  {
    id: "crop_profit_planner",
    categoryId: "agriculture",
    titleEn: "Crop Cost & Profit Planner (फसल लागत डायरी)",
    titleHi: "फसल लागत व शुद्ध मुनाफा डायरी",
    descEn: "Log plowing, seed, irrigation, harvesting cost vs mandi sale return for net profit.",
    descHi: "जुताई, बुवाई, खाद, दवाई और कटाई खर्च जोड़कर मंडी बिक्री पर शुद्ध बचत का ऑफलाइन हिसाब।",
    iconName: "Coins",
    keywords: ["crop cost", "profit", "fasal kharch", "kisan labh", "mandi"]
  },
  {
    id: "pesticide_spray_ratio",
    categoryId: "agriculture",
    titleEn: "Pesticide Spray Pump Dilution Calculator",
    titleHi: "कीटनाशक स्प्रे पंप घोल गणक",
    descEn: "Calculate exact ml/gram chemical dose per 15-litre/20-litre water spray pump.",
    descHi: "15 या 20 लीटर स्प्रे पंप हेतु कितने एमएल कीटनाशक या टॉनिक मिलाना है, उसका सटीक गणित।",
    iconName: "Pipette",
    keywords: ["pesticide", "spray", "pump", "kitnashak", "dawai ratio"]
  },

  // 5. Land & Measurement
  {
    id: "land_converter",
    categoryId: "land_measure",
    titleEn: "Bigha, Acre & Hectare Land Converter",
    titleHi: "बीघा, एकड़, हेक्टेयर व रकबा परिवर्तक",
    descEn: "Convert between Regional Bigha, Acre, Hectare, Square Meter, and Square Feet instantly.",
    descHi: "कच्चा-पक्का बीघा, एकड़, हेक्टेयर, वर्ग फुट और वर्ग मीटर का आपस में सटीक रूपांतरण।",
    iconName: "Maximize2",
    keywords: ["bigha", "acre", "hectare", "sq ft", "land measure", "rakba", "zameen"]
  },
  {
    id: "rupees_to_words",
    categoryId: "land_measure",
    titleEn: "Rupees to Words Converter (अंकों से शब्दों में)",
    titleHi: "राशि को शब्दों में बदलें (हिंदी व अंग्रेज़ी)",
    descEn: "Convert any numeric amount into official words for Bank Cheque, DD and Registry.",
    descHi: "चेक या रजिस्ट्री भरते समय अंकों (₹54,320) को हिंदी व अंग्रेजी शब्दों में त्रुटिहीन बदलें।",
    iconName: "FileCheck",
    keywords: ["rupees to words", "cheque words", "shabdon me", "in words", "amount"]
  },

  // 6. Office & Career
  {
    id: "resignation_letter",
    categoryId: "office_career",
    titleEn: "Formal Resignation Letter Drafter",
    titleHi: "इस्तीफा पत्र प्रारूप (Resignation Letter)",
    descEn: "Professional, polite resignation letter with custom notice period and last working day.",
    descHi: "कंपनी या संस्थान छोड़ने हेतु आधिकारिक व सम्मानजनक त्याग-पत्र 1 मिनट में तैयार करें।",
    iconName: "MailMinus",
    keywords: ["resignation", "istifa", "job exit", "notice period", "quitting"]
  },
  {
    id: "leave_wfh_request",
    categoryId: "office_career",
    titleEn: "Office Leave & WFH Request Generator",
    titleHi: "ऑफिस छुट्टी व WFH प्रार्थना पत्र",
    descEn: "Quick formatted email/text for Sick Leave, Casual Leave, or Work-From-Home requests.",
    descHi: "मैनेजर या एचआर को कैजुअल/सिक लीव या वर्क फ्रॉम होम की प्रोफेशनल रिक्वेस्ट तैयार करें।",
    iconName: "CalendarClock",
    keywords: ["leave", "chhutti", "wfh", "office request", "sick leave"]
  },
  {
    id: "invoice_bill_maker",
    categoryId: "office_career",
    titleEn: "Simple Business Invoice & Bill Maker",
    titleHi: "व्यापार बिल व इनवॉइस जनरेटर",
    descEn: "Create clean GST or non-GST bills for shopkeepers, freelancers and small services.",
    descHi: "दुकानदारों व फ्रीलांसर्स हेतु तुरंत आइटम, रेट, डिस्काउंट व कुल योग का प्रिंटेबल A4 बिल।",
    iconName: "FileSpreadsheet",
    keywords: ["invoice", "bill", "billing", "gst bill", "parchi", "payment receipt"]
  },

  // 7. School & College
  {
    id: "assignment_front_page",
    categoryId: "education",
    titleEn: "Assignment & Project Front Page Maker",
    titleHi: "असाइनमेंट व प्रोजेक्ट फ्रंट कवर पेज",
    descEn: "Design clean academic A4 cover page with College Name, Subject, Roll No and Session.",
    descHi: "कॉलेज व स्कूल प्रोजेक्ट्स हेतु कॉलेज नाम, विषय, छात्र का नाम व रोल नंबर वाला कवर पेज।",
    iconName: "BookOpen",
    keywords: ["assignment", "cover page", "front page", "project", "college", "school"]
  },
  {
    id: "cgpa_percentage_calc",
    categoryId: "education",
    titleEn: "CGPA to Percentage Converter (All Boards)",
    titleHi: "CGPA से प्रतिशत कन्वर्टर (सभी बोर्ड)",
    descEn: "Official formula conversion for CBSE (x9.5), MP Board, AICTE, and State Universities.",
    descHi: "सीबीएसई (9.5 फॉर्मूला), एमपी बोर्ड, एआईसीटीई व विश्वविद्यालय अनुसार सीजीपीए से प्रतिशत निकालें।",
    iconName: "GraduationCap",
    keywords: ["cgpa", "percentage", "sgpa", "marks", "cbse", "percent"]
  },
  {
    id: "student_leave_application",
    categoryId: "education",
    titleEn: "School / College Leave Application",
    titleHi: "प्रधानाचार्य को अवकाश प्रार्थना पत्र",
    descEn: "Standard Hindi/English formal leave letters to Principal or Class Teacher.",
    descHi: "बीमारी या आवश्यक कार्य हेतु स्कूल या कॉलेज में छुट्टी का सही व सुव्यवस्थित प्रार्थना पत्र।",
    iconName: "Mail",
    keywords: ["student leave", "school chhutti", "application to principal", "prarthana patra"]
  },

  // 8. Small Business & Khata
  {
    id: "customer_khata_book",
    categoryId: "small_business",
    titleEn: "Customer Udhar & Khata Book (उधार बहीखाता)",
    titleHi: "ग्राहक उधार व खाता डायरी (सुरक्षित ऑफलाइन)",
    descEn: "Record customer dues, payments and pending balance stored safely on your own phone.",
    descHi: "किस ग्राहक का कितना बाकी है और कितना जमा हुआ—बिना इंटरनेट का सुरक्षित बहीखाता।",
    iconName: "BookMarked",
    badge: "100% Private",
    keywords: ["khata", "udhar", "hisab", "customer ledger", "dues", "dukaan"]
  },
  {
    id: "tailor_measure_book",
    categoryId: "small_business",
    titleEn: "Tailor Measurement Book (सिलाई नाप रजिस्टर)",
    titleHi: "सिलाई नाप व ऑर्डर रजिस्टर",
    descEn: "Save customer Pant, Shirt, Kurta, Blouse dimensions and promised delivery dates.",
    descHi: "दर्जी भाइयों हेतु ग्राहक का नाम, पैंट-शर्ट-कुर्ता का सटीक नाप व डिलीवरी तारीख का डिजिटल रिकॉर्ड।",
    iconName: "Scissors",
    keywords: ["tailor", "silai", "darzi", "measurement", "pant shirt", "order"]
  },
  {
    id: "estimate_quotation_maker",
    categoryId: "small_business",
    titleEn: "Quick Estimate & Quotation Slip",
    titleHi: "कच्चा एस्टीमेट व कोटेशन पर्ची",
    descEn: "Draft professional work cost estimates for electrical, plumbing, or hardware sales.",
    descHi: "प्लंबिंग, वायरिंग, हार्डवेयर या लेबर कार्य का पक्का अनुमानित खर्च पत्र तैयार करें।",
    iconName: "ReceiptText",
    keywords: ["estimate", "quotation", "kaccha bill", "cost quote", "thekedar"]
  },

  // 9. Banking & Rural Finance
  {
    id: "cheque_fill_guide",
    categoryId: "banking_finance",
    titleEn: "Bank Cheque & Deposit Slip Drafter",
    titleHi: "बैंक चेक व जमा पर्ची गाइड",
    descEn: "Interactive visual preview to prevent cutting/mistakes in payee, date and rupees words.",
    descHi: "बैंक चेक भरते समय कटिंग से बचने हेतु पेई नाम, तारीख, अकाउंट पेई व शब्दों में राशि का विजुअल गाइड।",
    iconName: "CheckSquare",
    keywords: ["cheque", "bank check", "deposit slip", "bank guide", "draft cheque"]
  },
  {
    id: "gramin_byaj_calc",
    categoryId: "banking_finance",
    titleEn: "Gramin Monthly Interest (₹ सैकड़ा ब्याज)",
    titleHi: "ग्रामीण मासिक ब्याज गणक (₹ सैकड़ा हिसाब)",
    descEn: "Transparent calculation for 1%, 2%, 3% per month village interest with exact days.",
    descHi: "गांव-देहात में चलने वाले ₹1, ₹2, ₹3 सैकड़ा मासिक ब्याज और मूलधन का पारदर्शी दिन-वार हिसाब।",
    iconName: "Percent",
    keywords: ["byaj", "gramin byaj", "saikda", "monthly interest", "sahukari", "sood"]
  },
  {
    id: "daily_wages_slip",
    categoryId: "banking_finance",
    titleEn: "Daily Wages & Labor Attendance Register",
    titleHi: "दैनिक मजदूरी व हाजिरी हिसाब पर्ची",
    descEn: "Track working days, daily wage rate, advance paid, and pending balance for workers.",
    descHi: "मजदूरों व कारीगरों की हाजिरी, दैनिक दिहाड़ी, दिया गया एडवांस व अंतिम भुगतान पर्ची।",
    iconName: "Users",
    keywords: ["dihadi", "mazdoori", "daily wages", "hajiri", "worker payment"]
  },

  // 10. Police, Safety & Citizen
  {
    id: "lost_article_police_letter",
    categoryId: "police_safety",
    titleEn: "Lost Article / Mobile Police Intimation Letter",
    titleHi: "खोया सामान / मोबाइल गुमशुदगी सूचना पत्र",
    descEn: "Formal intimation letter for Lost Mobile, Pan Card, Driving License, or Marksheet.",
    descHi: "मोबाइल, पैन कार्ड या कागजात खो जाने पर पुलिस थाने में देने हेतु प्रिंट-रेडी सूचना पत्र।",
    iconName: "FileWarning",
    keywords: ["lost mobile", "police complaint", "gumshudgi", "lost document", "fir intimation"]
  },
  {
    id: "tenant_verification_form",
    categoryId: "police_safety",
    titleEn: "Tenant Police Verification Form Drafter",
    titleHi: "किरायेदार पुलिस सत्यापन फॉर्म प्रारूप",
    descEn: "Standard tenant detail disclosure draft for submission at local police station.",
    descHi: "मकान में किरायेदार रखने पर पुलिस थाने में जमा कराने वाला जरूरी किरायेदार विवरण प्रारूप।",
    iconName: "HomeCheck",
    keywords: ["tenant", "kirayedar", "police verification", "makan malik", "safety"]
  },
  {
    id: "vehicle_sale_receipt",
    categoryId: "police_safety",
    titleEn: "Vehicle Sale & Delivery Receipt (वाहन बिक्री रसीद)",
    titleHi: "पुरानी गाड़ी खरीद-बिक्री सुपुर्दगी रसीद",
    descEn: "Legal delivery receipt protecting seller from challans/accidents after handing over bike/car.",
    descHi: "पुरानी बाइक या कार बेचते समय कानूनी सुरक्षा हेतु वाहन सुपुर्दगी व जिम्मेदारी हस्तांतरण रसीद।",
    iconName: "Car",
    keywords: ["vehicle sale", "gadi bikri", "delivery receipt", "bike sale", "car transfer"]
  },

  // 11. Hospital & Health Records
  {
    id: "blood_donor_poster",
    categoryId: "hospital_health",
    titleEn: "Emergency Blood Requirement Poster Maker",
    titleHi: "आपातकालीन रक्तदान मांग पोस्टर मेकर",
    descEn: "Generate clean shareable WhatsApp graphic with Patient Name, Blood Group, Hospital & Contact.",
    descHi: "रक्त की आवश्यकता होने पर सोशल मीडिया/व्हाट्सएप पर शेयर करने योग्य आधिकारिक पोस्टर बनाएं।",
    iconName: "HeartPulse",
    badge: "Life Saver",
    keywords: ["blood", "raktdan", "blood donor", "emergency blood", "hospital requirement"]
  },
  {
    id: "medication_timetable",
    categoryId: "hospital_health",
    titleEn: "Daily Medication Timetable & Dosage Chart",
    titleHi: "दवा सेवन समय-सारणी व खुराक चार्ट",
    descEn: "Printable morning, afternoon, night pill routine chart for elders and patients.",
    descHi: "डॉक्टर द्वारा बताई गई दवाइयों का सुबह, दोपहर व रात का समय चार्ट बनाकर कमरे में लगाएं।",
    iconName: "Pill",
    keywords: ["dawa chart", "medicine routine", "dosage", "tablet schedule", "elder pill"]
  },
  {
    id: "bp_sugar_tracker",
    categoryId: "hospital_health",
    titleEn: "BP & Blood Sugar 30-Day Offline Log",
    titleHi: "बीपी व ब्लड शुगर 30-दिवसीय ऑफलाइन चार्ट",
    descEn: "Log daily systolic/diastolic BP and fasting sugar values stored safely on your phone.",
    descHi: "रोज का बीपी और शुगर दर्ज करें तथा डॉक्टर को दिखाने योग्य 30 दिनों का टेबल चार्ट बनाएं।",
    iconName: "Activity",
    keywords: ["bp", "blood pressure", "sugar", "diabetes", "health log", "reading"]
  },
  {
    id: "emergency_helplines",
    categoryId: "hospital_health",
    titleEn: "National Emergency Offline Helplines Directory",
    titleHi: "राष्ट्रीय आपातकालीन नंबर डायरेक्टरी",
    descEn: "One-tap direct calling to 112, 108 Ambulance, 1090 Women Helpline, 1930 Cyber Cell, 1098.",
    descHi: "बिना इंटरनेट के 112, 108 एम्बुलेंस, 1090 महिला हेल्पलाइन, 1930 साइबर सेल पर सीधे कॉल करें।",
    iconName: "PhoneCall",
    keywords: ["emergency", "helpline", "112", "108", "police number", "ambulance", "cyber crime"]
  },

  // 12. Women & Child Care
  {
    id: "pregnancy_edd_calc",
    categoryId: "women_child",
    titleEn: "Pregnancy Due Date & Week Calculator (EDD)",
    titleHi: "गर्भावस्था सप्ताह व अनुमानित प्रसव तिथि (EDD)",
    descEn: "Calculate estimated date of delivery (EDD) and current pregnancy week from Last Period (LMP).",
    descHi: "अंतिम मासिक धर्म (LMP) तारीख डालकर अनुमानित प्रसव तारीख, वर्तमान हफ्ता व जरूरी सलाह जानें।",
    iconName: "Baby",
    keywords: ["pregnancy", "edd", "due date", "garbhvastha", "delivery date", "lmp"]
  },
  {
    id: "child_vaccine_tracker",
    categoryId: "women_child",
    titleEn: "Child Vaccination Schedule (जन्म से 5 वर्ष)",
    titleHi: "शिशु टीकाकरण अनुसूची चार्ट (0 से 5 वर्ष)",
    descEn: "National immunization mission schedule for BCG, Polio, Pentavalent, MR with checklist.",
    descHi: "राष्ट्रीय टीकाकरण कार्यक्रम अनुसार बच्चे के जन्म से 5 वर्ष तक लगने वाले टीकों की पूरी डायरी।",
    iconName: "Syringe",
    keywords: ["vaccine", "tikakaran", "child health", "immunization", "polio", "bcg"]
  },

  // 13. Senior Citizens & Pension
  {
    id: "senior_medical_card",
    categoryId: "senior_citizens",
    titleEn: "Senior Citizen Pocket Emergency Card",
    titleHi: "बुजुर्ग पॉकेट आपातकालीन मेडिकल कार्ड",
    descEn: "Printable wallet card containing Blood Group, emergency phones, chronic diseases and doctors.",
    descHi: "बुजुर्गों की जेब में रखने योग्य कार्ड जिसमें ब्लड ग्रुप, आपात संपर्क, बीमारी व दवाएं लिखी हों।",
    iconName: "IdCard",
    keywords: ["senior card", "elderly wallet card", "emergency contact", "bujurg"]
  },
  {
    id: "pension_life_cert_checklist",
    categoryId: "senior_citizens",
    titleEn: "Jeevan Pramaan & Pension Tracker",
    titleHi: "जीवन प्रमाण पत्र व पेंशन चेकलिस्ट",
    descEn: "Step-by-step checklist and document reminder for annual Digital Life Certificate submission.",
    descHi: "सालाना डिजिटल लाइफ सर्टिफिकेट जमा करने हेतु PPO, आधार व बैंक से जुड़ी जरूरी चेकलिस्ट।",
    iconName: "CheckCircle",
    keywords: ["pension", "jeevan pramaan", "life certificate", "ppo", "senior citizen"]
  },

  // 14. Home, Family & Ration
  {
    id: "home_ration_planner",
    categoryId: "home_ration",
    titleEn: "Monthly Ration & Grocery Budget Planner",
    titleHi: "मासिक राशन व किराना बजट डायरी",
    descEn: "Complete checklist of monthly flour, rice, pulses, spices with offline expense total.",
    descHi: "महीने के आटा, दाल, चावल, तेल, मसाले की मात्रा, अनुमानित रेट और कुल बजट की ऑफलाइन लिस्ट।",
    iconName: "ShoppingBag",
    keywords: ["ration", "grocery", "kirana list", "home budget", "mahine ka kharch"]
  },
  {
    id: "milk_maid_register",
    categoryId: "home_ration",
    titleEn: "Daily Milk & Helper Attendance Register",
    titleHi: "दूध, कामवाली व पानी दैनिक हाजिरी रजिस्टर",
    descEn: "Calendar-based daily tick counter for milk quantity and maid leave to avoid month-end disputes.",
    descHi: "रोज के दूध (लीटर) और कामवाली बाई की छुट्टी की तारीखों का टिक-मार्क हिसाब ताकि विवाद न हो।",
    iconName: "CalendarCheck",
    keywords: ["milk register", "maid attendance", "doodh hisab", "kamwali", "daily attendance"]
  },
  {
    id: "electricity_estimator",
    categoryId: "home_ration",
    titleEn: "Electricity Appliance Watt & Unit Estimator",
    titleHi: "घरेलू बिजली उपकरण व यूनिट गणक",
    descEn: "Estimate monthly power units (kWh) consumed by AC, Fan, Refrigerator and approx cost.",
    descHi: "पंखा, एसी, फ्रिज, मोटर कितने घंटे चले = कितनी यूनिट बिजली बनी और कितना बिल आएगा, इसका आकलन।",
    iconName: "Zap",
    keywords: ["electricity", "bijli unit", "bill estimator", "watt", "power consumption"]
  },

  // 15. Friends & Travel
  {
    id: "split_bill_expense",
    categoryId: "friends_travel",
    titleEn: "Split Bill & Group Expense Calculator",
    titleHi: "दोस्तों का खर्चा बंटवारा (Split Bill)",
    descEn: "Calculate who paid what and who owes whom for parties, group travel and shared dinners.",
    descHi: "पार्टी, पिकनिक या डिनर में किसने कितना दिया, और किसे किसको कितने रुपये देने हैं (खर्चा बराबर)।",
    iconName: "Users2",
    keywords: ["split bill", "hisaab", "dost kharcha", "group expense", "party share"]
  },
  {
    id: "trip_packing_checklist",
    categoryId: "friends_travel",
    titleEn: "Smart Travel Luggage Packing Checklist",
    titleHi: "सफर व यात्रा सामान पैकिंग चेकलिस्ट",
    descEn: "Checklist for clothes, medicines, chargers, tickets, and toiletries before stepping out.",
    descHi: "सफर में निकलने से पहले जरूरी कपड़े, दवाइयां, चार्जर, टिकट व कागजात की टिक-मार्क चेकलिस्ट।",
    iconName: "Luggage",
    keywords: ["packing", "travel", "yatra", "luggage", "safar checklist"]
  },
  {
    id: "trip_fuel_mileage",
    categoryId: "friends_travel",
    titleEn: "Trip Fuel & Mileage Sharing Calculator",
    titleHi: "सफर पेट्रोल-डीजल खर्च शेयरिंग गणक",
    descEn: "Total trip kilometers, vehicle mileage and fuel rate divided among travelers.",
    descHi: "गाड़ी से कुल किमी यात्रा, माइलेज और पेट्रोल रेट डालकर प्रति व्यक्ति खर्च तुरंत निकालें।",
    iconName: "Fuel",
    keywords: ["fuel", "mileage", "petrol cost", "trip cost", "car sharing"]
  },

  // 16. Cyber Safety & Media
  {
    id: "scam_alert_checklist",
    categoryId: "cyber_media",
    titleEn: "Cyber Fraud & Scam Message Detector",
    titleHi: "साइबर फ्रॉड व फर्जी मैसेज पहचान गाइड",
    descEn: "5-point verification checklist to detect fake lottery, part-time jobs, and suspicious APK files.",
    descHi: "क्या यह लॉटरी, बैंक कॉल या पार्ट-टाइम जॉब का मैसेज असली है या फ्रॉड? 5 बिंदुओं में जांचें।",
    iconName: "AlertOctagon",
    badge: "Safety First",
    keywords: ["cyber fraud", "scam", "fake message", "lottery fraud", "apk danger", "safety"]
  },
  {
    id: "photo_metadata_cleaner",
    categoryId: "cyber_media",
    titleEn: "Photo EXIF & GPS Location Remover",
    titleHi: "फोटो से लोकेशन व गुप्त डेटा हटाएं (EXIF Clean)",
    descEn: "Strip embedded GPS camera coordinates and phone model data before sharing photos online.",
    descHi: "सोशल मीडिया पर फोटो पोस्ट करने से पहले उसमें छिपी घर की लोकेशन (GPS data) को सुरक्षित हटाएं।",
    iconName: "EyeOff",
    keywords: ["exif", "metadata", "remove location", "gps remove", "photo privacy"]
  },
  {
    id: "offline_qr_tool",
    categoryId: "cyber_media",
    titleEn: "Offline QR Code Generator & Reader",
    titleHi: "ऑफलाइन QR कोड मेकर व स्कैनर",
    descEn: "Generate and display high-contrast QR codes for UPI, Wi-Fi, Text and Phone without internet.",
    descHi: "बिना इंटरनेट के किसी भी टेक्स्ट, वाईफाई, फोन नंबर या UPI का तुरंत QR कोड बनाएं।",
    iconName: "QrCode",
    keywords: ["qr code", "qr maker", "upi qr", "wifi qr", "scanner"]
  }
];
