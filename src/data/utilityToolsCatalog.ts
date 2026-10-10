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
  { id: "all", titleEn: "All Tools", titleHi: "सभी टूल्स", iconName: "LayoutGrid", accent: "from-slate-600 to-slate-800" },
  { id: "pdf_tools", titleEn: "PDF Tools", titleHi: "PDF टूल्स", iconName: "FileText", accent: "from-red-600 to-rose-700" },
  { id: "image_tools", titleEn: "Image Tools", titleHi: "इमेज टूल्स", iconName: "Image", accent: "from-violet-600 to-purple-700" },
  { id: "excel_tools", titleEn: "Excel Tools", titleHi: "एक्सेल टूल्स", iconName: "FileSpreadsheet", accent: "from-emerald-600 to-green-700" },
  { id: "word_tools", titleEn: "Word Tools", titleHi: "वर्ड टूल्स", iconName: "FileType", accent: "from-blue-600 to-indigo-700" },
  { id: "video_tools", titleEn: "Video Tools", titleHi: "वीडियो टूल्स", iconName: "Video", accent: "from-orange-600 to-red-700" },
  { id: "audio_tools", titleEn: "Audio Tools", titleHi: "ऑडियो टूल्स", iconName: "Music", accent: "from-cyan-600 to-teal-700" },
];

export const UTILITY_TOOLS: UtilityToolDefinition[] = [
  // 1. Govt Forms & Recruitment
  {
    id: "govt_resizer",
    categoryId: "image_tools",
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
    categoryId: "image_tools",
    titleEn: "Passport Photo Name & Date Slate Maker",
    titleHi: "फोटो नेम व डेट स्लेट पट्टी मेकर",
    descEn: "Add official white strip with candidate Name & Date of Photo (DOP) on passport picture.",
    descHi: "सरकारी फॉर्म नियमों अनुसार फोटो के नीचे नाम व फोटो की तारीख (DOP) की सफेद पट्टी लगाएं।",
    iconName: "CalendarDays",
    badge: "Form Mandate",
    keywords: ["slate", "dop", "date of photo", "candidate name", "passport photo", "exam form"]
  },
    {
    id: "aadhaar_masker",
    categoryId: "image_tools",
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
    categoryId: "pdf_tools",
    titleEn: "Document Cam-Scanner to PDF",
    titleHi: "दस्तावेज़ स्कैनर (A4 PDF)",
    descEn: "Scan papers with camera, apply magic black/white contrast filter and export clean A4 PDF.",
    descHi: "कागजों की फोटो खींचकर साफ ब्लैक/व्हाइट कंट्रास्ट दें और A4 PDF फाइल डाउनलोड करें।",
    iconName: "ScanLine",
    keywords: ["scanner", "cam scanner", "document", "a4 pdf", "paper scan"]
  },
  {
    id: "images_to_pdf",
    categoryId: "pdf_tools",
    titleEn: "Images to Single PDF (फोटो से PDF)",
    titleHi: "फोटो से PDF बनाएं",
    descEn: "Combine multiple marksheet, card, or receipt photos into one ordered PDF file.",
    descHi: "मार्कशीट, आधार या रसीदों की कई फोटो जोड़कर एक व्यवस्थित PDF फाइल तैयार करें।",
    iconName: "FileImage",
    keywords: ["images to pdf", "photo to pdf", "convert", "combine images"]
  },
  {
    id: "merge_pdf",
    categoryId: "pdf_tools",
    titleEn: "PDF Merger (PDF फाइलें जोड़ें)",
    titleHi: "PDF फाइलें आपस में जोड़ें",
    descEn: "Combine two or more separate PDF documents into a single file locally on device.",
    descHi: "सरकारी पोर्टल पर अपलोड करने हेतु दो या अधिक अलग-अलग PDF को जोड़कर एक फाइल बनाएं।",
    iconName: "Files",
    keywords: ["merge pdf", "join pdf", "combine pdf", "single file"]
  },
  {
    id: "split_pdf",
    categoryId: "pdf_tools",
    titleEn: "PDF Page Splitter (पेज अलग करें)",
    titleHi: "PDF से जरूरी पेज अलग करें",
    descEn: "Extract specific pages from large PDF files directly in your phone.",
    descHi: "बड़ी PDF फाइल में से केवल अपने काम के पन्नों को अलग करके नई फाइल डाउनलोड करें।",
    iconName: "FileCode2",
    keywords: ["split pdf", "extract pages", "separate page"]
  },
  {
    id: "digital_sign",
    categoryId: "pdf_tools",
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
    categoryId: "excel_tools",
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
    categoryId: "pdf_tools",
    titleEn: "Rent & Cash Payment Receipt Generator",
    titleHi: "मकान किराया व नकद भुगतान रसीद",
    descEn: "Generate formal HRA rent receipts or cash transaction receipts with revenue stamp outline.",
    descHi: "HRA टैक्स छूट या नकद लेनदेन के लिए कानूनी प्रारूप में तुरंत रसीद जनरेट और प्रिंट करें।",
    iconName: "Receipt",
    keywords: ["rent receipt", "hra", "kiraya", "cash receipt", "rasid"]
  },
  {
    id: "affidavit_declaration",
    categoryId: "pdf_tools",
    titleEn: "Self-Declaration & Affidavit Drafter",
    titleHi: "स्व-घोषणा पत्र व शपथ प्रारूप",
    descEn: "Draft standard self-declaration forms for govt welfare, address proof, or income declaration.",
    descHi: "सरकारी योजनाओं हेतु मानक स्व-प्रमाणन (Self-declaration) प्रारूप तैयार करें।",
    iconName: "Scroll",
    keywords: ["self declaration", "affidavit", "ghoshna patra", "shapath"]
  },
  {
    id: "rti_drafter",
    categoryId: "pdf_tools",
    titleEn: "RTI Application Drafter (सूचना का अधिकार)",
    titleHi: "RTI सूचना का अधिकार आवेदन",
    descEn: "Generate official Form-A RTI application format to seek information from any department.",
    descHi: "सरकारी विभाग से सूचना प्राप्त करने हेतु धारा 6(1) के तहत मानक आरटीआई आवेदन पत्र तैयार करें।",
    iconName: "HelpCircle",
    keywords: ["rti", "right to information", "soochna ka adhikar", "form a", "public information"]
  },

  // 4. Agriculture & Farming
      
  // 5. Land & Measurement
    {
    id: "rupees_to_words",
    categoryId: "word_tools",
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
    categoryId: "word_tools",
    titleEn: "Formal Resignation Letter Drafter",
    titleHi: "इस्तीफा पत्र प्रारूप (Resignation Letter)",
    descEn: "Professional, polite resignation letter with custom notice period and last working day.",
    descHi: "कंपनी या संस्थान छोड़ने हेतु आधिकारिक व सम्मानजनक त्याग-पत्र 1 मिनट में तैयार करें।",
    iconName: "MailMinus",
    keywords: ["resignation", "istifa", "job exit", "notice period", "quitting"]
  },
  {
    id: "leave_wfh_request",
    categoryId: "word_tools",
    titleEn: "Office Leave & WFH Request Generator",
    titleHi: "ऑफिस छुट्टी व WFH प्रार्थना पत्र",
    descEn: "Quick formatted email/text for Sick Leave, Casual Leave, or Work-From-Home requests.",
    descHi: "मैनेजर या एचआर को कैजुअल/सिक लीव या वर्क फ्रॉम होम की प्रोफेशनल रिक्वेस्ट तैयार करें।",
    iconName: "CalendarClock",
    keywords: ["leave", "chhutti", "wfh", "office request", "sick leave"]
  },
  {
    id: "invoice_bill_maker",
    categoryId: "pdf_tools",
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
    categoryId: "word_tools",
    titleEn: "Assignment & Project Front Page Maker",
    titleHi: "असाइनमेंट व प्रोजेक्ट फ्रंट कवर पेज",
    descEn: "Design clean academic A4 cover page with College Name, Subject, Roll No and Session.",
    descHi: "कॉलेज व स्कूल प्रोजेक्ट्स हेतु कॉलेज नाम, विषय, छात्र का नाम व रोल नंबर वाला कवर पेज।",
    iconName: "BookOpen",
    keywords: ["assignment", "cover page", "front page", "project", "college", "school"]
  },
    {
    id: "student_leave_application",
    categoryId: "word_tools",
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
    categoryId: "excel_tools",
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
    categoryId: "word_tools",
    titleEn: "Tailor Measurement Book (सिलाई नाप रजिस्टर)",
    titleHi: "सिलाई नाप व ऑर्डर रजिस्टर",
    descEn: "Save customer Pant, Shirt, Kurta, Blouse dimensions and promised delivery dates.",
    descHi: "दर्जी भाइयों हेतु ग्राहक का नाम, पैंट-शर्ट-कुर्ता का सटीक नाप व डिलीवरी तारीख का डिजिटल रिकॉर्ड।",
    iconName: "Scissors",
    keywords: ["tailor", "silai", "darzi", "measurement", "pant shirt", "order"]
  },
  {
    id: "estimate_quotation_maker",
    categoryId: "pdf_tools",
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
    categoryId: "image_tools",
    titleEn: "Bank Cheque & Deposit Slip Drafter",
    titleHi: "बैंक चेक व जमा पर्ची गाइड",
    descEn: "Interactive visual preview to prevent cutting/mistakes in payee, date and rupees words.",
    descHi: "बैंक चेक भरते समय कटिंग से बचने हेतु पेई नाम, तारीख, अकाउंट पेई व शब्दों में राशि का विजुअल गाइड।",
    iconName: "CheckSquare",
    keywords: ["cheque", "bank check", "deposit slip", "bank guide", "draft cheque"]
  },
    {
    id: "daily_wages_slip",
    categoryId: "excel_tools",
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
    categoryId: "word_tools",
    titleEn: "Lost Article / Mobile Police Intimation Letter",
    titleHi: "खोया सामान / मोबाइल गुमशुदगी सूचना पत्र",
    descEn: "Formal intimation letter for Lost Mobile, Pan Card, Driving License, or Marksheet.",
    descHi: "मोबाइल, पैन कार्ड या कागजात खो जाने पर पुलिस थाने में देने हेतु प्रिंट-रेडी सूचना पत्र।",
    iconName: "FileWarning",
    keywords: ["lost mobile", "police complaint", "gumshudgi", "lost document", "fir intimation"]
  },
  {
    id: "tenant_verification_form",
    categoryId: "word_tools",
    titleEn: "Tenant Police Verification Form Drafter",
    titleHi: "किरायेदार पुलिस सत्यापन फॉर्म प्रारूप",
    descEn: "Standard tenant detail disclosure draft for submission at local police station.",
    descHi: "मकान में किरायेदार रखने पर पुलिस थाने में जमा कराने वाला जरूरी किरायेदार विवरण प्रारूप।",
    iconName: "HomeCheck",
    keywords: ["tenant", "kirayedar", "police verification", "makan malik", "safety"]
  },
  {
    id: "vehicle_sale_receipt",
    categoryId: "pdf_tools",
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
    categoryId: "word_tools",
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
    categoryId: "word_tools",
    titleEn: "Daily Medication Timetable & Dosage Chart",
    titleHi: "दवा सेवन समय-सारणी व खुराक चार्ट",
    descEn: "Printable morning, afternoon, night pill routine chart for elders and patients.",
    descHi: "डॉक्टर द्वारा बताई गई दवाइयों का सुबह, दोपहर व रात का समय चार्ट बनाकर कमरे में लगाएं।",
    iconName: "Pill",
    keywords: ["dawa chart", "medicine routine", "dosage", "tablet schedule", "elder pill"]
  },
  {
    id: "bp_sugar_tracker",
    categoryId: "word_tools",
    titleEn: "BP & Blood Sugar 30-Day Offline Log",
    titleHi: "बीपी व ब्लड शुगर 30-दिवसीय ऑफलाइन चार्ट",
    descEn: "Log daily systolic/diastolic BP and fasting sugar values stored safely on your phone.",
    descHi: "रोज का बीपी और शुगर दर्ज करें तथा डॉक्टर को दिखाने योग्य 30 दिनों का टेबल चार्ट बनाएं।",
    iconName: "Activity",
    keywords: ["bp", "blood pressure", "sugar", "diabetes", "health log", "reading"]
  },
  {
    id: "emergency_helplines",
    categoryId: "word_tools",
    titleEn: "National Emergency Offline Helplines Directory",
    titleHi: "राष्ट्रीय आपातकालीन नंबर डायरेक्टरी",
    descEn: "One-tap direct calling to 112, 108 Ambulance, 1090 Women Helpline, 1930 Cyber Cell, 1098.",
    descHi: "बिना इंटरनेट के 112, 108 एम्बुलेंस, 1090 महिला हेल्पलाइन, 1930 साइबर सेल पर सीधे कॉल करें।",
    iconName: "PhoneCall",
    keywords: ["emergency", "helpline", "112", "108", "police number", "ambulance", "cyber crime"]
  },

  // 12. Women & Child Care
    {
    id: "child_vaccine_tracker",
    categoryId: "word_tools",
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
    categoryId: "word_tools",
    titleEn: "Senior Citizen Pocket Emergency Card",
    titleHi: "बुजुर्ग पॉकेट आपातकालीन मेडिकल कार्ड",
    descEn: "Printable wallet card containing Blood Group, emergency phones, chronic diseases and doctors.",
    descHi: "बुजुर्गों की जेब में रखने योग्य कार्ड जिसमें ब्लड ग्रुप, आपात संपर्क, बीमारी व दवाएं लिखी हों।",
    iconName: "IdCard",
    keywords: ["senior card", "elderly wallet card", "emergency contact", "bujurg"]
  },
  {
    id: "pension_life_cert_checklist",
    categoryId: "word_tools",
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
    categoryId: "excel_tools",
    titleEn: "Monthly Ration & Grocery Budget Planner",
    titleHi: "मासिक राशन व किराना बजट डायरी",
    descEn: "Complete checklist of monthly flour, rice, pulses, spices with offline expense total.",
    descHi: "महीने के आटा, दाल, चावल, तेल, मसाले की मात्रा, अनुमानित रेट और कुल बजट की ऑफलाइन लिस्ट।",
    iconName: "ShoppingBag",
    keywords: ["ration", "grocery", "kirana list", "home budget", "mahine ka kharch"]
  },
  {
    id: "milk_maid_register",
    categoryId: "excel_tools",
    titleEn: "Daily Milk & Helper Attendance Register",
    titleHi: "दूध, कामवाली व पानी दैनिक हाजिरी रजिस्टर",
    descEn: "Calendar-based daily tick counter for milk quantity and maid leave to avoid month-end disputes.",
    descHi: "रोज के दूध (लीटर) और कामवाली बाई की छुट्टी की तारीखों का टिक-मार्क हिसाब ताकि विवाद न हो।",
    iconName: "CalendarCheck",
    keywords: ["milk register", "maid attendance", "doodh hisab", "kamwali", "daily attendance"]
  },
  
  // 15. Friends & Travel
    {
    id: "trip_packing_checklist",
    categoryId: "word_tools",
    titleEn: "Smart Travel Luggage Packing Checklist",
    titleHi: "सफर व यात्रा सामान पैकिंग चेकलिस्ट",
    descEn: "Checklist for clothes, medicines, chargers, tickets, and toiletries before stepping out.",
    descHi: "सफर में निकलने से पहले जरूरी कपड़े, दवाइयां, चार्जर, टिकट व कागजात की टिक-मार्क चेकलिस्ट।",
    iconName: "Luggage",
    keywords: ["packing", "travel", "yatra", "luggage", "safar checklist"]
  },
  
  // 16. Cyber Safety & Media
  {
    id: "scam_alert_checklist",
    categoryId: "word_tools",
    titleEn: "Scam Message Safety Checklist",
    titleHi: "साइबर धोखाधड़ी जाँच सूची",
    descEn: "5-point verification checklist to detect fake lottery, part-time jobs, and suspicious APK files.",
    descHi: "क्या यह लॉटरी, बैंक कॉल या पार्ट-टाइम जॉब का मैसेज असली है या फ्रॉड? 5 बिंदुओं में जांचें।",
    iconName: "AlertOctagon",
    badge: "Safety First",
    keywords: ["cyber fraud", "scam", "fake message", "lottery fraud", "apk danger", "safety"]
  },
  {
    id: "photo_metadata_cleaner",
    categoryId: "image_tools",
    titleEn: "Photo EXIF & GPS Location Remover",
    titleHi: "फोटो से लोकेशन व गुप्त डेटा हटाएं (EXIF Clean)",
    descEn: "Strip embedded GPS camera coordinates and phone model data before sharing photos online.",
    descHi: "सोशल मीडिया पर फोटो पोस्ट करने से पहले उसमें छिपी घर की लोकेशन (GPS data) को सुरक्षित हटाएं।",
    iconName: "EyeOff",
    keywords: ["exif", "metadata", "remove location", "gps remove", "photo privacy"]
  },
  {
    id: "offline_qr_tool",
    categoryId: "image_tools",
    titleEn: "Offline QR Code Generator & Reader",
    titleHi: "ऑफलाइन QR कोड मेकर व स्कैनर",
    descEn: "Generate and display high-contrast QR codes for UPI, Wi-Fi, Text and Phone without internet.",
    descHi: "बिना इंटरनेट के किसी भी टेक्स्ट, वाईफाई, फोन नंबर या UPI का तुरंत QR कोड बनाएं।",
    iconName: "QrCode",
    keywords: ["qr code", "qr maker", "upi qr", "wifi qr", "scanner"]
  },
  {
    id: "text_toolkit",
    categoryId: "word_tools",
    titleEn: "Text Toolkit & Cleaner",
    titleHi: "टेक्स्ट टूलकिट व क्लीनर",
    descEn: "Count words and characters, change letter case, clean extra spaces, sort lines and remove duplicates offline.",
    descHi: "शब्द/अक्षर गिनें, अंग्रेज़ी अक्षर बदलें, अतिरिक्त स्पेस हटाएं, लाइनें क्रम में लगाएं और डुप्लिकेट हटाएं—बिना इंटरनेट।",
    iconName: "FileText",
    badge: "100% Offline",
    keywords: ["text", "word count", "character count", "uppercase", "lowercase", "sort lines", "duplicate lines", "clean text", "space remover"]
  },
  {
    id: "json_formatter",
    categoryId: "excel_tools",
    titleEn: "JSON Formatter & Validator",
    titleHi: "JSON फॉर्मेटर व वैलिडेटर",
    descEn: "Format, minify and validate JSON locally without uploading private data.",
    descHi: "निजी डेटा अपलोड किए बिना JSON को फॉर्मेट, छोटा और validate करें।",
    iconName: "Braces",
    badge: "100% Offline",
    keywords: ["json", "formatter", "validator", "minify", "developer", "api response", "pretty print", "syntax"]
  
  },
  {
    id: "url_encoder",
    categoryId: "word_tools",
    titleEn: "URL Encoder / Decoder",
    titleHi: "URL एन्कोडर / डिकोडर",
    descEn: "Encode or decode URL components locally.",
    descHi: "URL टेक्स्ट को स्थानीय रूप से encode या decode करें।",
    iconName: "Link",
    badge: "100% Offline",
    keywords: ["url", "encode url", "decode url", "percent encoding", "web developer"]
  },
  {
    id: "base64_converter",
    categoryId: "word_tools",
    titleEn: "Base64 Converter",
    titleHi: "Base64 कन्वर्टर",
    descEn: "Encode and decode UTF-8 text to Base64 without uploading data.",
    descHi: "डेटा अपलोड किए बिना UTF-8 टेक्स्ट को Base64 में बदलें और वापस decode करें।",
    iconName: "Binary",
    badge: "100% Offline",
    keywords: ["base64", "encode", "decode", "developer", "utf8"]
  },
  {
    id: "html_entity_tool",
    categoryId: "word_tools",
    titleEn: "HTML Entity Encoder / Decoder",
    titleHi: "HTML Entity एन्कोडर / डिकोडर",
    descEn: "Escape HTML special characters and decode common entities locally.",
    descHi: "HTML के विशेष अक्षरों को encode करें और आम entities को स्थानीय रूप से decode करें।",
    iconName: "Code",
    badge: "100% Offline",
    keywords: ["html", "entity", "escape html", "unescape html", "web developer"]
  },
  {
    id: "uuid_generator",
    categoryId: "word_tools",
    titleEn: "UUID Generator",
    titleHi: "UUID जनरेटर",
    descEn: "Generate five random UUID v4 identifiers locally.",
    descHi: "स्थानीय रूप से पाँच random UUID v4 पहचानकर्ता बनाएँ।",
    iconName: "Fingerprint",
    badge: "100% Offline",
    keywords: ["uuid", "guid", "random id", "developer tools", "identifier"]
  },
  {
    id: "case_converter", categoryId: "word_tools", titleEn: "Text Case Converter", titleHi: "टेक्स्ट केस कन्वर्टर",
    descEn: "Change text case locally.", descHi: "टेक्स्ट का केस बदलें।", iconName: "Type", badge: "Offline",
    keywords: ["case converter", "utility", "offline"]
  },
  {
    id: "whitespace_cleaner", categoryId: "word_tools", titleEn: "Whitespace Cleaner", titleHi: "स्पेस क्लीनर",
    descEn: "Normalize repeated spaces and blank lines.", descHi: "अतिरिक्त स्पेस साफ करें।", iconName: "Text", badge: "Offline",
    keywords: ["whitespace cleaner", "utility", "offline"]
  },
  {
    id: "line_sorter", categoryId: "word_tools", titleEn: "Line Sorter", titleHi: "लाइन क्रमबद्ध करें",
    descEn: "Sort lines ascending or descending.", descHi: "लाइनें क्रम में लगाएँ।", iconName: "List", badge: "Offline",
    keywords: ["line sorter", "utility", "offline"]
  },
  {
    id: "duplicate_line_remover", categoryId: "word_tools", titleEn: "Duplicate Line Remover", titleHi: "डुप्लिकेट लाइन हटाएँ",
    descEn: "Remove repeated lines.", descHi: "दोहराई लाइनें हटाएँ।", iconName: "List", badge: "Offline",
    keywords: ["duplicate line remover", "utility", "offline"]
  },
  {
    id: "text_reverse", categoryId: "word_tools", titleEn: "Text Reverser", titleHi: "टेक्स्ट उल्टा करें",
    descEn: "Reverse Unicode text.", descHi: "टेक्स्ट उल्टा करें।", iconName: "Repeat", badge: "Offline",
    keywords: ["text reverse", "utility", "offline"]
  },
  {
    id: "slug_generator", categoryId: "word_tools", titleEn: "URL Slug Generator", titleHi: "URL स्लग जनरेटर",
    descEn: "Create a URL-safe slug.", descHi: "URL slug बनाएँ।", iconName: "Link", badge: "Offline",
    keywords: ["slug generator", "utility", "offline"]
  },
  {
    id: "url_parser", categoryId: "word_tools", titleEn: "URL Parser", titleHi: "URL पार्सर",
    descEn: "Parse URL parts locally.", descHi: "URL के हिस्से निकालें।", iconName: "Globe", badge: "Offline",
    keywords: ["url parser", "utility", "offline"]
  },
  {
    id: "query_string_parser", categoryId: "word_tools", titleEn: "Query String Parser", titleHi: "Query String पार्सर",
    descEn: "Convert query parameters to JSON.", descHi: "Query parameters को JSON करें।", iconName: "Braces", badge: "Offline",
    keywords: ["query string parser", "utility", "offline"]
  },
  {
    id: "regex_tester", categoryId: "word_tools", titleEn: "Regular Expression Tester", titleHi: "Regex टेस्टर",
    descEn: "Test a regular expression locally.", descHi: "Regular expression जाँचें।", iconName: "Search", badge: "Offline",
    keywords: ["regex tester", "utility", "offline"]
  },
  {
    id: "timestamp_converter", categoryId: "word_tools", titleEn: "Unix Timestamp Converter", titleHi: "Unix Timestamp कन्वर्टर",
    descEn: "Convert Unix seconds or milliseconds to a date.", descHi: "Unix timestamp को तारीख में बदलें।", iconName: "Clock", badge: "Offline",
    keywords: ["timestamp converter", "utility", "offline"]
  },
  {
    id: "date_to_timestamp", categoryId: "word_tools", titleEn: "Date to Unix Timestamp", titleHi: "तारीख से Unix Timestamp",
    descEn: "Convert date/time to Unix timestamps.", descHi: "तारीख को Unix timestamp में बदलें।", iconName: "Calendar", badge: "Offline",
    keywords: ["date to timestamp", "utility", "offline"]
  },
  {
    id: "color_converter", categoryId: "image_tools", titleEn: "HEX/RGB Color Converter", titleHi: "HEX/RGB रंग कन्वर्टर",
    descEn: "Convert HEX and RGB colors.", descHi: "HEX और RGB रंग बदलें।", iconName: "Palette", badge: "Offline",
    keywords: ["color converter", "utility", "offline"]
  },
  {
    id: "password_generator", categoryId: "word_tools", titleEn: "Secure Password Generator", titleHi: "पासवर्ड जनरेटर",
    descEn: "Generate a secure random password.", descHi: "सुरक्षित random पासवर्ड बनाएँ।", iconName: "KeyRound", badge: "Offline",
    keywords: ["password generator", "utility", "offline"]
  },
  {
    id: "hash_generator", categoryId: "word_tools", titleEn: "SHA Hash Generator", titleHi: "SHA Hash जनरेटर",
    descEn: "Generate SHA-256 and SHA-1 hashes.", descHi: "SHA hash बनाएँ।", iconName: "Fingerprint", badge: "Offline",
    keywords: ["hash generator", "utility", "offline"]
  },
  {
    id: "csv_json_converter", categoryId: "excel_tools", titleEn: "CSV to JSON Converter", titleHi: "CSV से JSON",
    descEn: "Convert CSV records into JSON.", descHi: "CSV को JSON में बदलें।", iconName: "FileJson", badge: "Offline",
    keywords: ["csv json converter", "utility", "offline"]
  },
  {
    id: "json_csv_converter", categoryId: "excel_tools", titleEn: "JSON to CSV Converter", titleHi: "JSON से CSV",
    descEn: "Convert JSON object arrays into CSV.", descHi: "JSON को CSV में बदलें।", iconName: "FileSpreadsheet", badge: "Offline",
    keywords: ["json csv converter", "utility", "offline"]
  },
  {
    id: "xml_escape", categoryId: "word_tools", titleEn: "XML Escape/Unescape", titleHi: "XML एस्केप टूल",
    descEn: "Escape or decode XML entities.", descHi: "XML entities encode/decode करें।", iconName: "Code", badge: "Offline",
    keywords: ["xml escape", "utility", "offline"]
  },
  {
    id: "unicode_inspector", categoryId: "word_tools", titleEn: "Unicode Inspector", titleHi: "Unicode निरीक्षक",
    descEn: "Show Unicode code points for characters.", descHi: "Unicode code points दिखाएँ।", iconName: "Binary", badge: "Offline",
    keywords: ["unicode inspector", "utility", "offline"]
  },
  {
    id: "number_base_converter", categoryId: "word_tools", titleEn: "Number Base Converter", titleHi: "Number Base कन्वर्टर",
    descEn: "Convert integers between binary, octal, decimal and hex.", descHi: "Number bases बदलें।", iconName: "Calculator", badge: "Offline",
    keywords: ["number base converter", "utility", "offline"]
  },
            {
    id: "unit_length_converter", categoryId: "word_tools", titleEn: "Length Unit Converter", titleHi: "लंबाई इकाई कन्वर्टर",
    descEn: "Convert common length units.", descHi: "लंबाई की इकाइयाँ बदलें।", iconName: "Ruler", badge: "Offline",
    keywords: ["unit length converter", "utility", "offline"]
  },
  {
    id: "unit_weight_converter", categoryId: "word_tools", titleEn: "Weight Unit Converter", titleHi: "वजन इकाई कन्वर्टर",
    descEn: "Convert common weight units.", descHi: "वजन की इकाइयाँ बदलें।", iconName: "Weight", badge: "Offline",
    keywords: ["unit weight converter", "utility", "offline"]
  },
  {
    id: "unit_temperature_converter", categoryId: "word_tools", titleEn: "Temperature Converter", titleHi: "तापमान कन्वर्टर",
    descEn: "Convert Celsius, Fahrenheit and Kelvin.", descHi: "तापमान इकाइयाँ बदलें।", iconName: "Thermometer", badge: "Offline",
    keywords: ["unit temperature converter", "utility", "offline"]
  },
  {
    id: "word_counter", categoryId: "word_tools", titleEn: "Word & Character Counter", titleHi: "शब्द व अक्षर गणक",
    descEn: "Count words, characters, sentences and paragraphs.", descHi: "शब्द, अक्षर, वाक्य और अनुच्छेद गिनें।", iconName: "WholeWord", badge: "Offline",
    keywords: ["word counter", "utility", "offline"]
  },
  {
    id: "text_diff", categoryId: "word_tools", titleEn: "Text Difference Checker", titleHi: "टेक्स्ट अंतर जाँचें",
    descEn: "Compare two text blocks line by line.", descHi: "दो टेक्स्ट ब्लॉक की तुलना करें।", iconName: "GitCompare", badge: "Offline",
    keywords: ["text diff", "utility", "offline"]
  },
  {
    id: "random_number_generator", categoryId: "word_tools", titleEn: "Random Number Generator", titleHi: "रैंडम संख्या जनरेटर",
    descEn: "Generate random integers within a chosen range.", descHi: "दी गई सीमा में random integer बनाएँ।", iconName: "Dices", badge: "Offline",
    keywords: ["random number generator", "utility", "offline"]
  },
  {
    id: "random_picker", categoryId: "word_tools", titleEn: "Random Name Picker", titleHi: "रैंडम नाम चुनें",
    descEn: "Pick a random entry from a newline-separated list.", descHi: "सूची में से random नाम चुनें।", iconName: "Shuffle", badge: "Offline",
    keywords: ["random picker", "utility", "offline"]
  },
  {
    id: "password_strength_checker", categoryId: "word_tools", titleEn: "Password Strength Checker", titleHi: "पासवर्ड मजबूती जाँचें",
    descEn: "Give local feedback on password length and character variety.", descHi: "पासवर्ड की लंबाई व विविधता जाँचें।", iconName: "ShieldCheck", badge: "Offline",
    keywords: ["password strength checker", "utility", "offline"]
  },
  {
    id: "json_path_extractor", categoryId: "excel_tools", titleEn: "JSON Path Extractor", titleHi: "JSON Path एक्सट्रैक्टर",
    descEn: "Read a simple dot-separated path from JSON.", descHi: "JSON से dot-separated path का मान निकालें।", iconName: "Braces", badge: "Offline",
    keywords: ["json path extractor", "utility", "offline"]
  },
  {
    id: "markdown_table_generator", categoryId: "excel_tools", titleEn: "Markdown Table Generator", titleHi: "Markdown टेबल जनरेटर",
    descEn: "Convert comma-separated rows into a Markdown table.", descHi: "CSV-जैसी पंक्तियों से Markdown टेबल बनाएँ।", iconName: "Table", badge: "Offline",
    keywords: ["markdown table generator", "utility", "offline"]
  },
  {
    id: "csv_delimiter_converter", categoryId: "excel_tools", titleEn: "CSV Delimiter Converter", titleHi: "CSV Delimiter कन्वर्टर",
    descEn: "Convert comma-separated data to tab-separated or semicolon-separated data.", descHi: "Comma-separated data को tab या semicolon में बदलें।", iconName: "Columns", badge: "Offline",
    keywords: ["csv delimiter converter", "utility", "offline"]
  },
      {
    id: "unit_area_converter", categoryId: "word_tools", titleEn: "Area Unit Converter", titleHi: "क्षेत्रफल इकाई कन्वर्टर",
    descEn: "Convert square meters, square feet, acres and hectares.", descHi: "वर्ग मीटर, वर्ग फुट, एकड़ और हेक्टेयर बदलें।", iconName: "Ruler", badge: "Offline",
    keywords: ["unit area converter", "utility", "offline"]
  },
  {
    id: "unit_volume_converter", categoryId: "word_tools", titleEn: "Volume Unit Converter", titleHi: "आयतन इकाई कन्वर्टर",
    descEn: "Convert liters, milliliters, cubic meters and US gallons.", descHi: "लीटर, मिलीलीटर, घन मीटर और गैलन बदलें।", iconName: "FlaskConical", badge: "Offline",
    keywords: ["unit volume converter", "utility", "offline"]
  },
  {
    id: "unit_speed_converter", categoryId: "word_tools", titleEn: "Speed Unit Converter", titleHi: "गति इकाई कन्वर्टर",
    descEn: "Convert km/h, m/s and mph.", descHi: "km/h, m/s और mph बदलें।", iconName: "Gauge", badge: "Offline",
    keywords: ["unit speed converter", "utility", "offline"]
  },
  {
    id: "data_size_converter", categoryId: "excel_tools", titleEn: "Data Size Converter", titleHi: "डेटा आकार कन्वर्टर",
    descEn: "Convert bytes, KB, MB and GB using decimal or binary units.", descHi: "Bytes, KB, MB और GB बदलें।", iconName: "HardDrive", badge: "Offline",
    keywords: ["data size converter", "utility", "offline"]
  },
      {
    id: "random_team_splitter", categoryId: "word_tools", titleEn: "Random Team Splitter", titleHi: "रैंडम टीम बाँटें",
    descEn: "Split a list of names into a chosen number of random teams.", descHi: "नामों को random टीमों में बाँटें।", iconName: "Users", badge: "Offline",
    keywords: ["random team splitter", "utility", "offline"]
  }
];