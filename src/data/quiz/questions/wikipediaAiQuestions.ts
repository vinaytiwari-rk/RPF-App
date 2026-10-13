import { SamahitQuestion } from "../samahitQuestionTypes";

export const WIKIPEDIA_AI_QUESTIONS: SamahitQuestion[] = [
  {
    id: "wiki_ai_001",
    category: "general_knowledge",
    subcategory: "indian_polity",
    questionEn: "According to the Constitution of India, which article guarantees the Right to Constitutional Remedies, famously called the 'Heart and Soul' of the Constitution by Dr. B. R. Ambedkar?",
    questionHi: "भारतीय संविधान के अनुसार, कौन सा अनुच्छेद 'संवैधानिक उपचारों का अधिकार' प्रदान करता है, जिसे डॉ. बी. आर. अम्बेडकर ने संविधान का 'हृदय और आत्मा' कहा था?",
    optionsEn: [
      "Article 32",
      "Article 21",
      "Article 14",
      "Article 19"
    ],
    optionsHi: [
      "अनुच्छेद 32",
      "अनुच्छेद 21",
      "अनुच्छेद 14",
      "अनुच्छेद 19"
    ],
    correctOptionId: "opt_a",
    correctIndex: 0,
    explanationEn: "Article 32 provides the right to individuals to move the Supreme Court to seek justice when they feel that their right has been 'unduly deprived'. Dr. Ambedkar referred to it as the 'heart and soul of the Constitution'.",
    explanationHi: "अनुच्छेद 32 नागरिकों को मौलिक अधिकारों के उल्लंघन पर सीधे सर्वोच्च न्यायालय जाने का अधिकार देता है। डॉ. अम्बेडकर ने इसे संविधान की 'आत्मा और हृदय' कहा था।",
    difficulty: "medium",
    source: {
      name: "Wikipedia & Gemini AI (Constitution of India)",
      url: "https://en.wikipedia.org/wiki/Constitution_of_India",
      verificationDate: "2026-10-13",
      status: "verified"
    },
    createdAt: "2026-10-13T00:00:00.000Z",
    fingerprint: "wiki_const_01",
    isActive: true
  },
  {
    id: "wiki_ai_002",
    category: "general_knowledge",
    subcategory: "indian_history",
    questionEn: "At which Indus Valley Civilisation site was the world's earliest known tidal dockyard discovered?",
    questionHi: "सिंधु घाटी सभ्यता के किस स्थल पर विश्व का सबसे प्राचीन ज्ञात गोदीबाड़ा (डॉकयार्ड) खोजा गया था?",
    optionsEn: [
      "Lothal (Gujarat)",
      "Harappa (Punjab)",
      "Mohenjo-daro (Sindh)",
      "Kalibangan (Rajasthan)"
    ],
    optionsHi: [
      "लोथल (गुजरात)",
      "हड़प्पा (पंजाब)",
      "मोहनजोदड़ो (सिंध)",
      "कालीबंगा (राजस्थान)"
    ],
    correctOptionId: "opt_a",
    correctIndex: 0,
    explanationEn: "Lothal had the world's earliest known dock, which connected the city to an ancient course of the Sabarmati river on the trade route between Harappan cities in Sindh and the peninsula of Saurashtra.",
    explanationHi: "लोथल में विश्व का सबसे पहला ज्ञात डॉकयार्ड था, जिसने शहर को साबरमती नदी के प्राचीन प्रवाह से जोड़कर व्यापारिक मार्ग प्रदान किया था।",
    difficulty: "medium",
    source: {
      name: "Wikipedia & Gemini AI (Lothal / IVC)",
      url: "https://en.wikipedia.org/wiki/Lothal",
      verificationDate: "2026-10-13",
      status: "verified"
    },
    createdAt: "2026-10-13T00:00:00.000Z",
    fingerprint: "wiki_ivc_02",
    isActive: true
  },
  {
    id: "wiki_ai_003",
    category: "general_knowledge",
    subcategory: "indian_economy",
    questionEn: "In which year was the Reserve Bank of India (RBI) nationalised, transitioning from private shareholders to Government ownership?",
    questionHi: "भारतीय रिज़र्व बैंक (RBI) का राष्ट्रीयकरण किस वर्ष हुआ था, जिसके बाद यह पूर्णतः सरकारी स्वामित्व में आया?",
    optionsEn: [
      "1949",
      "1935",
      "1947",
      "1950"
    ],
    optionsHi: [
      "1949",
      "1935",
      "1947",
      "1950"
    ],
    correctOptionId: "opt_a",
    correctIndex: 0,
    explanationEn: "Though established on 1 April 1935 under the Reserve Bank of India Act, 1934, the RBI was nationalised on 1 January 1949.",
    explanationHi: "भारतीय रिज़र्व बैंक की स्थापना 1 अप्रैल 1935 को हुई थी, परंतु 1 जनवरी 1949 को इसका राष्ट्रीयकरण कर इसे भारत सरकार के स्वामित्व में लाया गया।",
    difficulty: "medium",
    source: {
      name: "Wikipedia & Gemini AI (Reserve Bank of India)",
      url: "https://en.wikipedia.org/wiki/Reserve_Bank_of_India",
      verificationDate: "2026-10-13",
      status: "verified"
    },
    createdAt: "2026-10-13T00:00:00.000Z",
    fingerprint: "wiki_rbi_03",
    isActive: true
  },
  {
    id: "wiki_ai_004",
    category: "general_knowledge",
    subcategory: "space_science",
    questionEn: "On 23 August 2023, India's Chandrayaan-3 mission successfully soft-landed near the lunar south pole. What was the lander named?",
    questionHi: "23 अगस्त 2023 को भारत के चंद्रयान-3 मिशन ने चंद्रमा के दक्षिणी ध्रुव के निकट सफल सॉफ्ट लैंडिंग की। लैंडर का क्या नाम था?",
    optionsEn: [
      "Vikram",
      "Pragyan",
      "Dhruv",
      "Aditya"
    ],
    optionsHi: [
      "विक्रम",
      "प्रज्ञान",
      "ध्रुव",
      "आदित्य"
    ],
    correctOptionId: "opt_a",
    correctIndex: 0,
    explanationEn: "The Chandrayaan-3 mission consisted of a propulsion module, the lander named Vikram (after Dr. Vikram Sarabhai), and the rover named Pragyan.",
    explanationHi: "चंद्रयान-3 मिशन में प्रणोदन मॉड्यूल, 'विक्रम' लैंडर (डॉ. विक्रम साराभाई के सम्मान में) और 'प्रज्ञान' रोवर शामिल थे।",
    difficulty: "easy",
    source: {
      name: "Wikipedia & Gemini AI (Chandrayaan-3)",
      url: "https://en.wikipedia.org/wiki/Chandrayaan-3",
      verificationDate: "2026-10-13",
      status: "verified"
    },
    createdAt: "2026-10-13T00:00:00.000Z",
    fingerprint: "wiki_space_04",
    isActive: true
  },
  {
    id: "wiki_ai_005",
    category: "general_knowledge",
    subcategory: "indian_polity",
    questionEn: "Which Constitutional Amendment Act introduced the 3-tier Panchayati Raj system across rural India with constitutional status in 1992?",
    questionHi: "किस संविधान संशोधन अधिनियम द्वारा 1992 में भारत में पंचायती राज व्यवस्था को संवैधानिक दर्जा प्रदान किया गया था?",
    optionsEn: [
      "73rd Amendment Act",
      "74th Amendment Act",
      "42nd Amendment Act",
      "44th Amendment Act"
    ],
    optionsHi: [
      "73वां संशोधन अधिनियम",
      "74वां संशोधन अधिनियम",
      "42वां संशोधन अधिनियम",
      "44वां संशोधन अधिनियम"
    ],
    correctOptionId: "opt_a",
    correctIndex: 0,
    explanationEn: "The 73rd Constitutional Amendment Act, 1992 added Part IX and the 11th Schedule to the Constitution, giving formal constitutional recognition to Panchayati Raj institutions.",
    explanationHi: "73वें संविधान संशोधन अधिनियम (1992) द्वारा संविधान में भाग IX और 11वीं अनुसूची जोड़कर पंचायती राज को संवैधानिक दर्जा दिया गया।",
    difficulty: "medium",
    source: {
      name: "Wikipedia & Gemini AI (Panchayati Raj)",
      url: "https://en.wikipedia.org/wiki/Panchayati_raj_in_India",
      verificationDate: "2026-10-13",
      status: "verified"
    },
    createdAt: "2026-10-13T00:00:00.000Z",
    fingerprint: "wiki_panchayat_05",
    isActive: true
  },
  {
    id: "wiki_ai_006",
    category: "general_knowledge",
    subcategory: "general_science",
    questionEn: "In photosynthesis, which cellular organelle contains chlorophyll and serves as the primary site for light-dependent reactions?",
    questionHi: "प्रकाश संश्लेषण में, किस कोशिकीय अंगक में क्लोरोफिल पाया जाता है और वह प्रकाश-निर्भर अभिक्रियाओं का मुख्य स्थल है?",
    optionsEn: [
      "Chloroplast",
      "Mitochondria",
      "Ribosome",
      "Endoplasmic Reticulum"
    ],
    optionsHi: [
      "क्लोरोप्लास्ट (हरितलवक)",
      "माइटोकॉन्ड्रिया",
      "राइबोसोम",
      "अंतःप्रद्रव्यी जालिका"
    ],
    correctOptionId: "opt_a",
    correctIndex: 0,
    explanationEn: "Photosynthesis in green plants takes place inside chloroplasts, which contain chlorophyll pigments embedded within thylakoid membrane structures.",
    explanationHi: "पौधों में प्रकाश संश्लेषण क्लोरोप्लास्ट (हरितलवक) के अंदर होता है, जिसमें थाइलाकोइड झिल्ली में क्लोरोफिल वर्णक स्थित होते हैं।",
    difficulty: "easy",
    source: {
      name: "Wikipedia & Gemini AI (Photosynthesis)",
      url: "https://en.wikipedia.org/wiki/Photosynthesis",
      verificationDate: "2026-10-13",
      status: "verified"
    },
    createdAt: "2026-10-13T00:00:00.000Z",
    fingerprint: "wiki_science_06",
    isActive: true
  },
  {
    id: "wiki_ai_007",
    category: "general_knowledge",
    subcategory: "environment_geography",
    questionEn: "The Western Ghats of India are recognized as an international UNESCO World Heritage Site and biodiversity hotspot. Which state does NOT form part of the Western Ghats range?",
    questionHi: "भारत के पश्चिमी घाट को यूनेस्को विश्व धरोहर स्थल और जैव विविधता हॉटस्पॉट माना जाता है। कौन सा राज्य पश्चिमी घाट श्रृंखला में शामिल नहीं है?",
    optionsEn: [
      "Odisha",
      "Maharashtra",
      "Karnataka",
      "Kerala"
    ],
    optionsHi: [
      "ओडिशा",
      "महाराष्ट्र",
      "कर्नाटक",
      "केरल"
    ],
    correctOptionId: "opt_a",
    correctIndex: 0,
    explanationEn: "The Western Ghats traverse the states of Gujarat, Maharashtra, Goa, Karnataka, Kerala, and Tamil Nadu. Odisha is situated along the Eastern Ghats / eastern coastline.",
    explanationHi: "पश्चिमी घाट गुजरात, महाराष्ट्र, गोवा, कर्नाटक, केरल और तमिलनाडु से होकर गुजरता है। ओडिशा भारत के पूर्वी तट (पूर्वी घाट) पर स्थित है।",
    difficulty: "medium",
    source: {
      name: "Wikipedia & Gemini AI (Western Ghats)",
      url: "https://en.wikipedia.org/wiki/Western_Ghats",
      verificationDate: "2026-10-13",
      status: "verified"
    },
    createdAt: "2026-10-13T00:00:00.000Z",
    fingerprint: "wiki_ghats_07",
    isActive: true
  },
  {
    id: "wiki_ai_008",
    category: "general_knowledge",
    subcategory: "indian_polity",
    questionEn: "Who presides over the joint sitting of both Houses of Parliament in India?",
    questionHi: "भारत में संसद के दोनों सदनों की संयुक्त बैठक (Joint Sitting) की अध्यक्षता कौन करता है?",
    optionsEn: [
      "Speaker of the Lok Sabha",
      "Chairman of the Rajya Sabha",
      "President of India",
      "Prime Minister of India"
    ],
    optionsHi: [
      "लोकसभा अध्यक्ष (Speaker)",
      "राज्यसभा के सभापति (उपराष्ट्रपति)",
      "भारत के राष्ट्रपति",
      "भारत के प्रधानमंत्री"
    ],
    correctOptionId: "opt_a",
    correctIndex: 0,
    explanationEn: "According to Article 118(4) of the Constitution, the joint sitting of both Houses of Parliament is summoned by the President but presided over by the Speaker of the Lok Sabha.",
    explanationHi: "संविधान के अनुच्छेद 118(4) के अनुसार, दोनों सदनों की संयुक्त बैठक राष्ट्रपति द्वारा बुलाई जाती है किंतु इसकी अध्यक्षता लोकसभा अध्यक्ष करते हैं।",
    difficulty: "medium",
    source: {
      name: "Wikipedia & Gemini AI (Parliament of India)",
      url: "https://en.wikipedia.org/wiki/Parliament_of_India",
      verificationDate: "2026-10-13",
      status: "verified"
    },
    createdAt: "2026-10-13T00:00:00.000Z",
    fingerprint: "wiki_parliament_08",
    isActive: true
  },
  {
    id: "wiki_ai_009",
    category: "general_knowledge",
    subcategory: "indian_history",
    questionEn: "Which major national session of the Indian National Congress in December 1929 declared 'Purna Swaraj' (Complete Independence) as its ultimate goal?",
    questionHi: "दिसंबर 1929 में भारतीय राष्ट्रीय कांग्रेस के किस प्रसिद्ध अधिवेशन में 'पूर्ण स्वराज' (पूर्ण स्वतंत्रता) को अपना अंतिम लक्ष्य घोषित किया गया था?",
    optionsEn: [
      "Lahore Session",
      "Belgaum Session",
      "Karachi Session",
      "Calcutta Session"
    ],
    optionsHi: [
      "लाहौर अधिवेशन",
      "बेलगाम अधिवेशन",
      "कराची अधिवेशन",
      "कलकत्ता अधिवेशन"
    ],
    correctOptionId: "opt_a",
    correctIndex: 0,
    explanationEn: "Presided over by Jawaharlal Nehru, the Lahore Session of the Congress on 19 December 1929 passed the historic Purna Swaraj resolution.",
    explanationHi: "जवाहरलाल नेहरू की अध्यक्षता में 1929 के ऐतिहासिक लाहौर अधिवेशन में कांग्रेस ने 'पूर्ण स्वराज' का ऐतिहासिक प्रस्ताव पारित किया था।",
    difficulty: "medium",
    source: {
      name: "Wikipedia & Gemini AI (Purna Swaraj)",
      url: "https://en.wikipedia.org/wiki/Purna_Swaraj",
      verificationDate: "2026-10-13",
      status: "verified"
    },
    createdAt: "2026-10-13T00:00:00.000Z",
    fingerprint: "wiki_swaraj_09",
    isActive: true
  },
  {
    id: "wiki_ai_010",
    category: "general_knowledge",
    subcategory: "indian_economy",
    questionEn: "NITI Aayog (National Institution for Transforming India) replaced the Planning Commission in which year?",
    questionHi: "नीति आयोग (NITI Aayog) ने योजना आयोग (Planning Commission) का स्थान किस वर्ष लिया था?",
    optionsEn: [
      "2015",
      "2014",
      "2016",
      "2017"
    ],
    optionsHi: [
      "2015",
      "2014",
      "2016",
      "2017"
    ],
    correctOptionId: "opt_a",
    correctIndex: 0,
    explanationEn: "NITI Aayog was formed on 1 January 2015 via a Union Cabinet resolution to replace the 65-year-old Planning Commission.",
    explanationHi: "नीति आयोग का गठन 1 जनवरी 2015 को केंद्रीय मंत्रिमंडल के एक प्रस्ताव द्वारा किया गया, जिसने 65 वर्ष पुराने योजना आयोग का स्थान लिया।",
    difficulty: "easy",
    source: {
      name: "Wikipedia & Gemini AI (NITI Aayog)",
      url: "https://en.wikipedia.org/wiki/NITI_Aayog",
      verificationDate: "2026-10-13",
      status: "verified"
    },
    createdAt: "2026-10-13T00:00:00.000Z",
    fingerprint: "wiki_niti_10",
    isActive: true
  }
];
