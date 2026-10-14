export interface QuizQuestion {
  id: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctIndex: number;
  explanationEn: string;
  explanationHi: string;
  sourceLabel?: string;
  sourceUrl?: string;
  lastVerified?: string;
}

export interface QuizTopic {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  iconName: string;
  color: string;
  badge?: string;
  questionsCount: number;
  durationMinutes: number;
  questions: QuizQuestion[];
}

export const QUIZ_TOPICS: QuizTopic[] = [
  // 1. Daily Current Affairs 2026
  {
    id: "daily_current_affairs",
    titleEn: "Government Programmes & Public Institutions",
    titleHi: "सरकारी योजनाएँ एवं सार्वजनिक संस्थाएँ",
    descEn: "Officially sourced government programmes and public institutions. Static offline questions; not a live daily-news feed.",
    descHi: "सरकारी योजनाओं और सार्वजनिक संस्थाओं पर आधारित स्थिर ऑफलाइन प्रश्न; यह लाइव दैनिक समाचार फ़ीड नहीं है।",
    iconName: "Flame",
    color: "from-amber-600 to-orange-600",
    badge: "आधिकारिक स्रोत",
    questionsCount: 10,
    durationMinutes: 8,
    questions: [
      {
        id: "ca_1",
        questionEn: "Which national programme aims to connect Gram Panchayats with broadband infrastructure?",
        questionHi: "ग्राम पंचायतों को ब्रॉडबैंड अवसंरचना से जोड़ने का राष्ट्रीय कार्यक्रम कौन-सा है?",
        optionsEn: ["Digital Gramin Seva Mission", "BharatNet", "PM Rural E-Kisan", "Smart Panchayat 2.0"],
        optionsHi: ["डिजिटल ग्रामीण सेवा मिशन", "भारतनेट", "पीएम रूरल ई-किसान", "स्मार्ट पंचायत 2.0"],
        correctIndex: 1,
        explanationEn: "BharatNet is the Government of India programme for broadband connectivity to Gram Panchayats.",
        explanationHi: "भारतनेट ग्राम पंचायतों तक ब्रॉडबैंड कनेक्टिविटी पहुँचाने का भारत सरकार का कार्यक्रम है।",
        sourceLabel: "Official government / institutional source",
        sourceUrl: "https://bbnl.nic.in/",
        lastVerified: "2026-10-09"
      },
      {
        id: "ca_2",
        questionEn: "Which office coordinates tri-service matters among the Indian Armed Forces at the highest military staff level?",
        questionHi: "भारतीय सशस्त्र सेनाओं के तीनों अंगों के बीच उच्च स्तर पर समन्वय से जुड़ा पद कौन-सा है?",
        optionsEn: ["Chief of Defence Staff", "Chief Election Commissioner", "Cabinet Secretary", "Attorney General"],
        optionsHi: ["चीफ ऑफ डिफेंस स्टाफ", "मुख्य निर्वाचन आयुक्त", "कैबिनेट सचिव", "महान्यायवादी"],
        correctIndex: 0,
        explanationEn: "The Chief of Defence Staff supports jointness and integration among the Army, Navy and Air Force.",
        explanationHi: "चीफ ऑफ डिफेंस स्टाफ थल सेना, नौसेना और वायु सेना के बीच संयुक्तता और एकीकरण को बढ़ावा देने से जुड़ा पद है।",
        sourceLabel: "Ministry of Defence — Chief of Defence Staff",
        sourceUrl: "https://www.mod.gov.in/",
        lastVerified: "2026-10-09"
      },
      {
        id: "ca_3",
        questionEn: "What is India's premier indigenous human spaceflight mission known as?",
        questionHi: "भारत के प्रथम स्वदेशी मानव अंतरिक्ष उड़ान मिशन का आधिकारिक नाम क्या है?",
        optionsEn: ["Chandrayaan-4", "Gaganyaan", "Aditya-L2", "Mangalyaan-2"],
        optionsHi: ["चंद्रयान-4", "गगनयान (Gaganyaan)", "आदित्य-एल2", "मंगलयान-2"],
        correctIndex: 1,
        explanationEn: "Gaganyaan is ISRO's landmark human spaceflight mission to send Indian astronauts to low Earth orbit.",
        explanationHi: "गगनयान इसरो का ऐतिहासिक मानव अंतरिक्ष मिशन है जो भारतीय अंतरिक्ष यात्रियों को पृथ्वी की निचली कक्षा में भेजेगा।",
        sourceLabel: "CPGRAMS — Government of India",
        sourceUrl: "https://pgportal.gov.in/",
        lastVerified: "2026-10-09"
      },
      {
        id: "ca_4",
        questionEn: "Which Indian portal is the official unified platform for public grievance redressal?",
        questionHi: "केंद्र सरकार के सभी विभागों में जन शिकायतों के निवारण हेतु आधिकारिक एकीकृत पोर्टल कौन सा है?",
        optionsEn: ["CPGRAMS", "Jan Seva Kendra", "MyGov Bharat", "DigiLocker"],
        optionsHi: ["CPGRAMS (सीपीजीआरएएमएस)", "जन सेवा केंद्र", "माईगव भारत", "डिजिलॉकर"],
        correctIndex: 0,
        explanationEn: "CPGRAMS (Centralised Public Grievance Redress and Monitoring System) is managed by DARPG.",
        explanationHi: "CPGRAMS केंद्रीय प्रशासनिक सुधार विभाग द्वारा संचालित नागरिक शिकायत निवारण का आधिकारिक मंच है।",
        sourceLabel: "International Solar Alliance — Official Website",
        sourceUrl: "https://isolaralliance.org/",
        lastVerified: "2026-10-09"
      },
      {
        id: "ca_5",
        questionEn: "Where is the headquarters of the International Solar Alliance (ISA) located?",
        questionHi: "अंतर्राष्ट्रीय सौर गठबंधन (ISA) का स्थायी मुख्यालय भारत के किस शहर में स्थित है?",
        optionsEn: ["New Delhi", "Gurugram, Haryana", "Bengaluru", "Hyderabad"],
        optionsHi: ["नई दिल्ली", "गुरुग्राम, हरियाणा", "बेंगलुरु", "हैदराबाद"],
        correctIndex: 1,
        explanationEn: "The International Solar Alliance headquarters is located in Gurugram, Haryana, India.",
        explanationHi: "अंतर्राष्ट्रीय सौर गठबंधन (ISA) का वैश्विक मुख्यालय गुरुग्राम (हरियाणा) में स्थित है।",
        sourceLabel: "International Solar Alliance — Official Website",
        sourceUrl: "https://isolaralliance.org/",
        lastVerified: "2026-10-09"
      },
      {
        id: "ca_6",
        questionEn: "Which organisation operates UPI in India?",
        questionHi: "भारत में UPI का संचालन कौन करता है?",
        optionsEn: ["RBI", "NPCI (National Payments Corporation of India)", "SEBI", "NITI Aayog"],
        optionsHi: ["आरबीआई (RBI)", "NPCI (भारतीय राष्ट्रीय भुगतान निगम)", "सेबी (SEBI)", "नीति आयोग"],
        correctIndex: 1,
        explanationEn: "NPCI operates UPI in India.",
        explanationHi: "NPCI भारत में UPI का संचालन करता है।",
        sourceLabel: "Official government / institutional source",
        sourceUrl: "https://www.npci.org.in/what-we-do/upi/product-overview",
        lastVerified: "2026-10-09"
      },
      {
        id: "ca_7",
        questionEn: "How much annual assistance does PM-KISAN provide to an eligible farmer family?",
        questionHi: "PM-KISAN के तहत पात्र किसान परिवार को प्रतिवर्ष कितनी सहायता मिलती है?",
        optionsEn: ["₹4,000", "₹6,000 in three instalments", "₹10,000", "₹12,000"],
        optionsHi: ["₹4,000", "तीन किस्तों में ₹6,000", "₹10,000", "₹12,000"],
        correctIndex: 1,
        explanationEn: "Eligible PM-KISAN beneficiaries receive ₹6,000 per year in three equal instalments.",
        explanationHi: "पात्र PM-KISAN लाभार्थियों को तीन समान किस्तों में प्रतिवर्ष ₹6,000 मिलते हैं।",
        sourceLabel: "Official government / institutional source",
        sourceUrl: "https://services.india.gov.in/service/detail/%E0%A4%AA%E0%A5%80%E0%A4%8F%E0%A4%AE-%E0%A4%95%E0%A4%BF%E0%A4%B8%E0%A4%BE%E0%A4%A8-%E0%A4%B8%E0%A4%AE%E0%A5%8D%E0%A4%AE%E0%A4%BE%E0%A4%A8-%E0%A4%A8%E0%A4%BF%E0%A4%A7%E0%A4%BF-1",
        lastVerified: "2026-10-09"
      },
      {
        id: "ca_8",
        questionEn: "Which semiconductor manufacturing ecosystem mission is spearheaded by the Government of India?",
        questionHi: "भारत में सेमीकंडक्टर और माइक्रोचिप निर्माण को बढ़ावा देने वाले राष्ट्रीय मिशन का नाम क्या है?",
        optionsEn: ["India Semiconductor Mission (ISM)", "Digital India Chip Fund", "Atmanirbhar Silicon Plan", "PM Chip Mission"],
        optionsHi: ["इंडिया सेमीकंडक्टर मिशन (ISM)", "डिजिटल इंडिया चिप फंड", "आत्मनिर्भर सिलिकॉन प्लान", "पीएम चिप मिशन"],
        correctIndex: 0,
        explanationEn: "India Semiconductor Mission (ISM) under MeitY drives chip fabrication and packaging fabs in India.",
        explanationHi: "इंडिया सेमीकंडक्टर मिशन (ISM) देश में चिप निर्माण और डिस्प्ले फैब स्थापित करने की नोडल एजेंसी है।",
        sourceLabel: "India Semiconductor Mission — Official Website",
        sourceUrl: "https://ism.gov.in/",
        lastVerified: "2026-10-09"
      },
      {
        id: "ca_9",
        questionEn: "Which day is officially celebrated as National Science Day in India?",
        questionHi: "भारत में प्रत्येक वर्ष राष्ट्रीय विज्ञान दिवस (National Science Day) किस तिथि को मनाया जाता है?",
        optionsEn: ["15 January", "28 February", "11 May", "25 December"],
        optionsHi: ["15 जनवरी", "28 फरवरी (रमन प्रभाव खोज दिवस)", "11 मई", "25 दिसंबर"],
        correctIndex: 1,
        explanationEn: "National Science Day is celebrated on 28 February commemorating Sir C.V. Raman's discovery of the Raman Effect.",
        explanationHi: "28 फरवरी को सर सी.वी. रमन द्वारा 'रमन प्रभाव' की खोज के उपलक्ष्य में राष्ट्रीय विज्ञान दिवस मनाया जाता है।",
        sourceLabel: "Department of Science and Technology — National Science Day",
        sourceUrl: "https://dst.gov.in/sites/default/files/National%20Science%20Day.pdf",
        lastVerified: "2026-10-09"
      },
      {
        id: "ca_10",
        questionEn: "What is the main objective of the PM-PRANAM scheme?",
        questionHi: "PM-PRANAM योजना का मुख्य उद्देश्य क्या है?",
        optionsEn: ["Promote organic fertilizers and reduce chemical urea", "Free tractor distribution", "Solar pump subsidies", "Crop export promotion"],
        optionsHi: ["रासायनिक खादों का उपयोग घटाकर प्राकृतिक व वैकल्पिक उर्वरकों को बढ़ावा देना", "मुफ्त ट्रैक्टर वितरण", "सोलर पंप सब्सिडी", "फसल निर्यात प्रोत्साहन"],
        correctIndex: 0,
        explanationEn: "PM-PRANAM incentivises states and union territories to reduce chemical fertiliser use and promote balanced, sustainable alternatives.",
        explanationHi: "PM-PRANAM राज्यों और केंद्रशासित प्रदेशों को रासायनिक उर्वरकों का उपयोग घटाने और संतुलित, टिकाऊ विकल्प अपनाने के लिए प्रोत्साहित करता है।",
        sourceLabel: "Press Information Bureau — PM-PRANAM",
        sourceUrl: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2038958&lang=2&reg=48",
        lastVerified: "2026-10-09"
      }
    ]
  },

  // 2. Indian Constitution & Polity
  {
    id: "constitution_polity",
    titleEn: "Indian Constitution & Polity (भारतीय संविधान)",
    titleHi: "भारतीय संविधान एवं राजव्यवस्था",
    descEn: "Fundamental rights, preamble, articles, parliament & judicial system for all exams.",
    descHi: "मौलिक अधिकार, प्रस्तावना, महत्वपूर्ण अनुच्छेद, संसद व न्यायपालिका से जुड़े मानक प्रश्न।",
    iconName: "Scale",
    color: "from-blue-600 to-indigo-700",
    badge: "UPSC/SSC",
    questionsCount: 13,
    durationMinutes: 10,
    questions: [
      {
        id: "pol_1",
        questionEn: "Which Article of the Indian Constitution guarantees the 'Right to Constitutional Remedies' (Heart and Soul)?",
        questionHi: "डॉ. बी.आर. अम्बेडकर ने किस अनुच्छेद को भारतीय संविधान का 'हृदय और आत्मा' कहा था?",
        optionsEn: ["Article 14", "Article 21", "Article 32", "Article 370"],
        optionsHi: ["अनुच्छेद 14", "अनुच्छेद 21", "अनुच्छेद 32 (संवैधानिक उपचारों का अधिकार)", "अनुच्छेद 370"],
        correctIndex: 2,
        explanationEn: "Dr. B.R. Ambedkar called Article 32 the 'Heart and Soul' of the Constitution as it guarantees enforcement of Fundamental Rights via writs.",
        explanationHi: "अनुच्छेद 32 नागरिकों को मौलिक अधिकारों के उल्लंघन पर सीधे सुप्रीम कोर्ट जाने और 5 प्रकार की रिट जारी कराने का अधिकार देता है।"
      },
      {
        id: "pol_2",
        questionEn: "What is the minimum age prescribed for becoming the President of India?",
        questionHi: "भारत का राष्ट्रपति निर्वाचित होने के लिए संविधान द्वारा न्यूनतम कितनी आयु निर्धारित है?",
        optionsEn: ["25 Years", "30 Years", "35 Years", "None"],
        optionsHi: ["25 वर्ष", "30 वर्ष", "35 वर्ष", "कोई सीमा नहीं"],
        correctIndex: 2,
        explanationEn: "Article 58 specifies that a candidate for the President must have completed the age of 35 years.",
        explanationHi: "अनुच्छेद 58 के अनुसार राष्ट्रपति पद के उम्मीदवार की आयु कम से कम 35 वर्ष पूरी होनी चाहिए।"
      },
      {
        id: "pol_3",
        questionEn: "Which schedule of the Indian Constitution contains the list of recognized languages?",
        questionHi: "भारतीय संविधान की किस अनुसूची में 22 आधिकारिक भाषाओं का उल्लेख किया गया है?",
        optionsEn: ["7th Schedule", "8th Schedule", "10th Schedule", "11th Schedule"],
        optionsHi: ["सातवीं अनुसूची", "आठवीं अनुसूची", "दसवीं अनुसूची", "ग्यारहवीं अनुसूची"],
        correctIndex: 1,
        explanationEn: "The 8th Schedule recognizes 22 official languages of India.",
        explanationHi: "संविधान की 8वीं अनुसूची में वर्तमान में 22 भाषाओं को मान्यता प्राप्त है।"
      },
      {
        id: "pol_4",
        questionEn: "Panchayati Raj was given constitutional status by which amendment act?",
        questionHi: "पंचायती राज व्यवस्था को किस संविधान संशोधन अधिनियम द्वारा संवैधानिक दर्जा प्रदान किया गया?",
        optionsEn: ["42nd Amendment 1976", "44th Amendment 1978", "73rd Amendment 1992", "86th Amendment 2002"],
        optionsHi: ["42वां संशोधन 1976", "44वां संशोधन 1978", "73वां संविधान संशोधन 1992", "86वां संशोधन 2002"],
        correctIndex: 2,
        explanationEn: "The 73rd Constitutional Amendment Act, 1992 added Part IX and the 11th Schedule for Panchayats.",
        explanationHi: "73वें संविधान संशोधन 1992 द्वारा संविधान में भाग 9 और 11वीं अनुसूची जोड़कर पंचायतों को वैधानिक दर्जा दिया गया।"
      },
      {
        id: "pol_5",
        questionEn: "Who presides over the joint sitting of both Houses of Parliament?",
        questionHi: "संसद के दोनों सदनों की संयुक्त बैठक (Joint Sitting) की अध्यक्षता कौन करता है?",
        optionsEn: ["President of India", "Vice-President (Chairman Rajya Sabha)", "Speaker of Lok Sabha", "Prime Minister"],
        optionsHi: ["भारत का राष्ट्रपति", "उपराष्ट्रपति (राज्यसभा सभापति)", "लोकसभा अध्यक्ष (Speaker)", "प्रधानमंत्री"],
        correctIndex: 2,
        explanationEn: "Under Article 118(4), the Speaker of the Lok Sabha presides over the joint sitting called by the President.",
        explanationHi: "अनुच्छेद 118(4) के तहत संयुक्त बैठक राष्ट्रपति बुलाते हैं, परंतु उसकी अध्यक्षता हमेशा लोकसभा अध्यक्ष करते हैं।"
      },
      {
        id: "pol_6",
        questionEn: "Fundamental Duties were added to the Constitution on the recommendation of which committee?",
        questionHi: "संविधान में मौलिक कर्तव्यों को किस समिति की सिफारिश पर जोड़ा गया था?",
        optionsEn: ["Sarkaria Commission", "Swaran Singh Committee", "Verma Committee", "Kothari Commission"],
        optionsHi: ["सरकारिया आयोग", "सरदार स्वर्ण सिंह समिति", "वर्मा समिति", "कोठारी आयोग"],
        correctIndex: 1,
        explanationEn: "Swaran Singh Committee recommended Fundamental Duties, added by 42nd Amendment 1976 as Article 51A.",
        explanationHi: "स्वर्ण सिंह समिति की सिफारिश पर 42वें संशोधन (1976) द्वारा भाग 4(A) और अनुच्छेद 51(A) में मौलिक कर्तव्य जोड़े गए।"
      },
      {
        id: "pol_7",
        questionEn: "Which Article provides for the appointment of the Comptroller and Auditor General (CAG) of India?",
        questionHi: "भारत के नियंत्रक एवं महालेखापरीक्षक (CAG) का पद किस अनुच्छेद के अंतर्गत स्थापित है?",
        optionsEn: ["Article 76", "Article 148", "Article 280", "Article 324"],
        optionsHi: ["अनुच्छेद 76 (महान्यायवादी)", "अनुच्छेद 148 (CAG)", "अनुच्छेद 280 (वित्त आयोग)", "अनुच्छेद 324 (चुनाव आयोग)"],
        correctIndex: 1,
        explanationEn: "Article 148 establishes the office of the Comptroller and Auditor General of India.",
        explanationHi: "अनुच्छेद 148 के तहत राष्ट्रपति सीएजी (CAG) की नियुक्ति करते हैं, जो सार्वजनिक धन का संरक्षक होता है।"
      },
      {
        id: "pol_8",
        questionEn: "Right to Education (RTE) was made a fundamental right under which Article?",
        questionHi: "6 से 14 वर्ष के बच्चों के लिए मुफ्त व अनिवार्य शिक्षा किस अनुच्छेद के तहत मौलिक अधिकार है?",
        optionsEn: ["Article 19(1)(a)", "Article 21A", "Article 25", "Article 45"],
        optionsHi: ["अनुच्छेद 19(1)", "अनुच्छेद 21A", "अनुच्छेद 25", "अनुच्छेद 45"],
        correctIndex: 1,
        explanationEn: "86th Constitutional Amendment 2002 inserted Article 21A making free education for ages 6-14 a Fundamental Right.",
        explanationHi: "86वें संशोधन 2002 द्वारा अनुच्छेद 21A जोड़कर प्रारंभिक शिक्षा को मूल अधिकार बनाया गया।"
      },
      {
        id: "pol_9",
        questionEn: "Who has the power to declare a National Emergency in India under Article 352?",
        questionHi: "अनुच्छेद 352 के तहत देश में राष्ट्रीय आपातकाल की घोषणा करने का अधिकार किसे है?",
        optionsEn: ["Prime Minister", "President of India (on Cabinet's written advice)", "Chief Justice of India", "Parliament only"],
        optionsHi: ["प्रधानमंत्री", "राष्ट्रपति (मंत्रिमंडल की लिखित सलाह पर)", "मुख्य न्यायाधीश", "संसद"],
        correctIndex: 1,
        explanationEn: "The President declares national emergency under Article 352 only after receiving written recommendation from the Cabinet.",
        explanationHi: "राष्ट्रपति मंत्रिमंडल की लिखित सिफारिश प्राप्त होने पर ही युद्ध, बाह्य आक्रमण या सशस्त्र विद्रोह पर आपातकाल घोषित कर सकते हैं।"
      },
      {
        id: "pol_10",
        questionEn: "What is the tenure of a member of the Rajya Sabha?",
        questionHi: "राज्यसभा के किसी सदस्य का कार्यकाल कितने वर्षों का होता है?",
        optionsEn: ["4 Years", "5 Years", "6 Years", "Permanent"],
        optionsHi: ["4 वर्ष", "5 वर्ष", "6 वर्ष", "स्थायी"],
        correctIndex: 2,
        explanationEn: "Rajya Sabha is a permanent body, but its members are elected for a term of 6 years with 1/3 retiring every 2 years.",
        explanationHi: "राज्यसभा एक स्थायी सदन है जो कभी भंग नहीं होता, लेकिन इसके प्रत्येक सदस्य का कार्यकाल 6 वर्ष होता है।"
      }
,
      {
        id: "pol_11",
        questionEn: "Which Article guarantees the right to move the Supreme Court for enforcement of Fundamental Rights?",
        questionHi: "मौलिक अधिकारों के प्रवर्तन के लिए सर्वोच्च न्यायालय जाने का अधिकार किस अनुच्छेद में है?",
        optionsEn: ["Article 14","Article 21","Article 32","Article 51A"],
        optionsHi: ["अनुच्छेद 14","अनुच्छेद 21","अनुच्छेद 32","अनुच्छेद 51A"],
        correctIndex: 2,
        explanationEn: "Article 32 guarantees the right to move the Supreme Court for enforcement of Fundamental Rights.",
        explanationHi: "अनुच्छेद 32 मौलिक अधिकारों के प्रवर्तन के लिए सर्वोच्च न्यायालय जाने का अधिकार सुनिश्चित करता है।",
        sourceLabel: "Legislative Department — Constitution of India",
        sourceUrl: "https://www.legislative.gov.in/static/uploads/2025/07/c9fe9c9b6840524844316f74bb1c556c.pdf",
        lastVerified: "2026-10-09"
      },
      {
        id: "pol_11b",
        questionEn: "Which Article establishes the office of the Comptroller and Auditor General of India?",
        questionHi: "भारत के नियंत्रक एवं महालेखापरीक्षक का पद किस अनुच्छेद में स्थापित है?",
        optionsEn: ["Article 76","Article 148","Article 280","Article 324"],
        optionsHi: ["अनुच्छेद 76","अनुच्छेद 148","अनुच्छेद 280","अनुच्छेद 324"],
        correctIndex: 1,
        explanationEn: "Article 148 provides for the Comptroller and Auditor General of India.",
        explanationHi: "अनुच्छेद 148 भारत के नियंत्रक एवं महालेखापरीक्षक के पद का प्रावधान करता है।",
        sourceLabel: "Legislative Department — Constitution of India",
        sourceUrl: "https://www.legislative.gov.in/static/uploads/2025/07/c9fe9c9b6840524844316f74bb1c556c.pdf",
        lastVerified: "2026-10-09"
      },
      {
        id: "pol_11c",
        questionEn: "Which Part of the Constitution contains the Directive Principles of State Policy?",
        questionHi: "राज्य के नीति-निदेशक तत्व संविधान के किस भाग में हैं?",
        optionsEn: ["Part II","Part III","Part IV","Part IVA"],
        optionsHi: ["भाग II","भाग III","भाग IV","भाग IVA"],
        correctIndex: 2,
        explanationEn: "The Directive Principles of State Policy are contained in Part IV.",
        explanationHi: "राज्य के नीति-निदेशक तत्व संविधान के भाग IV में दिए गए हैं।",
        sourceLabel: "Legislative Department — Constitution of India",
        sourceUrl: "https://www.legislative.gov.in/static/uploads/2025/07/c9fe9c9b6840524844316f74bb1c556c.pdf",
        lastVerified: "2026-10-09"
      }
    ]
  },

  // 3. Indian History & Freedom Movement
  {
    id: "indian_history",
    titleEn: "Indian History & Freedom Struggle (इतिहास)",
    titleHi: "भारतीय इतिहास एवं स्वतंत्रता संग्राम",
    descEn: "Ancient, medieval, 1857 revolt, Mahatma Gandhi & Indian national movement.",
    descHi: "सिंधु घाटी, मौर्य साम्राज्य, 1857 की क्रांति, गांधी युग व स्वतंत्रता आंदोलन के प्रश्न।",
    iconName: "BookOpen",
    color: "from-amber-700 to-yellow-800",
    questionsCount: 13,
    durationMinutes: 10,
    questions: [
      {
        id: "his_1",
        questionEn: "The famous slogan 'Do or Die' (करो या मरो) was given by Mahatma Gandhi during which movement?",
        questionHi: "महात्मा गांधी जी ने प्रसिद्ध नारा 'करो या मरो' किस आंदोलन के दौरान दिया था?",
        optionsEn: ["Non-Cooperation Movement 1920", "Civil Disobedience Movement 1930", "Quit India Movement 1942", "Champaran Satyagraha 1917"],
        optionsHi: ["असहयोग आंदोलन 1920", "सविनय अवज्ञा आंदोलन 1930", "भारत छोड़ो आंदोलन 1942", "चंपारण सत्याग्रह 1917"],
        correctIndex: 2,
        explanationEn: "Gandhiji gave the call 'Do or Die' on 8 August 1942 at Gowalia Tank Maidan, Bombay during Quit India Movement.",
        explanationHi: "गांधीजी ने 8 अगस्त 1942 को बंबई के गोवालिया टैंक मैदान से भारत छोड़ो आंदोलन में 'करो या मरो' का नारा दिया था।"
      },
      {
        id: "his_2",
        questionEn: "Who was the founder of the Maurya Dynasty in ancient India?",
        questionHi: "प्राचीन भारत में मौर्य साम्राज्य की स्थापना किसने की थी?",
        optionsEn: ["Ashoka the Great", "Chandragupta Maurya", "Bindusara", "Samudragupta"],
        optionsHi: ["सम्राट अशोक", "चन्द्रगुप्त मौर्य (चाणक्य की सहायता से)", "बिन्दुसार", "समुद्रगुप्त"],
        correctIndex: 1,
        explanationEn: "Chandragupta Maurya founded the Maurya Empire in 322 BCE with the guidance of his mentor Chanakya (Kautilya).",
        explanationHi: "आचार्य चाणक्य की सहायता से चन्द्रगुप्त मौर्य ने नंद वंश के धनानंद को पराजित कर मौर्य वंश की नींव रखी थी।"
      },
      {
        id: "his_3",
        questionEn: "In which year did the historic battle of Plassey take place?",
        questionHi: "अंग्रेजों और बंगाल के नवाब सिराजुद्दौला के बीच प्लासी का ऐतिहासिक युद्ध किस वर्ष हुआ था?",
        optionsEn: ["1757", "1764", "1857", "1761"],
        optionsHi: ["1757 ईस्वी (23 जून)", "1764 ईस्वी (बक्सर)", "1857 ईस्वी", "1761 ईस्वी"],
        correctIndex: 0,
        explanationEn: "The Battle of Plassey was fought on 23 June 1757, laying the foundation of British East India Company rule in Bengal.",
        explanationHi: "23 जून 1757 को रॉबर्ट क्लाइव के नेतृत्व में ब्रिटिश सेना ने प्लासी के मैदान में नवाब सिराजुद्दौला को हराया था।"
      },
      {
        id: "his_4",
        questionEn: "Who is known as the 'Frontier Gandhi' (सीमांत गांधी)?",
        questionHi: "भारतीय स्वतंत्रता संग्राम में 'सीमांत गांधी' (Frontier Gandhi) के नाम से किन्हें जाना जाता है?",
        optionsEn: ["Maulana Abul Kalam Azad", "Khan Abdul Ghaffar Khan", "Muhammad Ali Jinnah", "Liaquat Ali Khan"],
        optionsHi: ["मौलाना अबुल कलाम आजाद", "खान अब्दुल गफ्फार खान", "मोहम्मद अली जिन्ना", "लियाकत अली खान"],
        correctIndex: 1,
        explanationEn: "Khan Abdul Ghaffar Khan (Badshah Khan), leader of the Khudai Khidmatgar (Red Shirts), was called Frontier Gandhi.",
        explanationHi: "खुदाई खिदमतगार (लाल कुर्ती) आंदोलन के प्रणेता खान अब्दुल गफ्फार खान को सीमांत गांधी कहा जाता है।"
      },
      {
        id: "his_5",
        questionEn: "Where did the first session of the Indian National Congress take place in 1885?",
        questionHi: "दिसंबर 1885 में भारतीय राष्ट्रीय कांग्रेस (INC) का पहला अधिवेशन किस शहर में आयोजित हुआ था?",
        optionsEn: ["Calcutta", "Bombay (Mumbai)", "Madras", "Allahabad"],
        optionsHi: ["कलकत्ता", "बंबई (गोकुलदास तेजपाल संस्कृत कॉलेज)", "मद्रास", "इलाहाबाद"],
        correctIndex: 1,
        explanationEn: "The first session was held in Bombay at Gokuldas Tejpal Sanskrit College under the presidency of W.C. Bonnerjee.",
        explanationHi: "कांग्रेस का पहला अधिवेशन 28 दिसंबर 1885 को बंबई में व्योमेश चंद्र बनर्जी की अध्यक्षता में 72 प्रतिनिधियों के साथ हुआ था।"
      },
      {
        id: "his_6",
        questionEn: "Who was the Governor-General of India during the 1857 First War of Independence?",
        questionHi: "1857 के प्रथम स्वतंत्रता संग्राम के समय भारत का गवर्नर-जनरल कौन था?",
        optionsEn: ["Lord Dalhousie", "Lord Canning", "Lord Curzon", "Lord Mountbatten"],
        optionsHi: ["लॉर्ड डलहौजी", "लॉर्ड कैनिंग (Lord Canning)", "लॉर्ड कर्जन", "लॉर्ड माउंटबेटन"],
        correctIndex: 1,
        explanationEn: "Lord Canning was the Governor-General in 1857 and subsequently became the first Viceroy of India in 1858.",
        explanationHi: "1857 की क्रांति के समय लॉर्ड कैनिंग गवर्नर जनरल था, जो बाद में 1858 में भारत का पहला वायसराय बना।"
      },
      {
        id: "his_7",
        questionEn: "Which ancient site of the Indus Valley Civilization is famous for its Great Bath (विशाल स्नानागार)?",
        questionHi: "सिंधु घाटी सभ्यता का प्रसिद्ध 'विशाल स्नानागार' (The Great Bath) किस स्थल से प्राप्त हुआ है?",
        optionsEn: ["Harappa", "Mohenjo-daro", "Lothal", "Kalibangan"],
        optionsHi: ["हड़प्पा", "मोहनजोदड़ो (Mohenjo-daro)", "लोथल (डॉकयार्ड)", "कालीबंगा"],
        correctIndex: 1,
        explanationEn: "The Great Bath was discovered in Mohenjo-daro, situated on the bank of the Indus River.",
        explanationHi: "विशाल स्नानागार और विशाल अन्नागार दोनों मोहनजोदड़ो (वर्तमान पाकिस्तान के सिंध प्रांत) में मिले थे।"
      },
      {
        id: "his_8",
        questionEn: "Who authored the famous book 'Poverty and Un-British Rule in India' exposing the drain of wealth?",
        questionHi: "भारत से धन की निकासी (Drain of Wealth) का सिद्धांत प्रस्तुत करने वाले 'ग्रैंड ओल्ड मैन ऑफ इंडिया' कौन थे?",
        optionsEn: ["Gopal Krishna Gokhale", "Dadabhai Naoroji", "Bal Gangadhar Tilak", "Bipin Chandra Pal"],
        optionsHi: ["गोपाल कृष्ण गोखले", "दादाभाई नौरोजी", "बाल गंगाधर तिलक", "बिपिन चंद्र पाल"],
        correctIndex: 1,
        explanationEn: "Dadabhai Naoroji formulated the 'Drain of Wealth' theory in his book 'Poverty and Un-British Rule in India'.",
        explanationHi: "दादाभाई नौरोजी ने ब्रिटिश शासन द्वारा भारत की आर्थिक लूट को उजागर करते हुए धन निष्कासन का सिद्धांत दिया था।"
      },
      {
        id: "his_9",
        questionEn: "Jallianwala Bagh massacre occurred on which date in Amritsar?",
        questionHi: "अमृतसर में भीषण जलियांवाला बाग हत्याकांड किस तिथि को घटित हुआ था?",
        optionsEn: ["13 April 1919 (बैसाखी का दिन)", "15 August 1919", "23 March 1931", "10 May 1857"],
        optionsHi: ["13 अप्रैल 1919 (बैसाखी दिवस)", "15 अगस्त 1919", "23 मार्च 1931", "10 मई 1857"],
        correctIndex: 0,
        explanationEn: "On 13 April 1919 (Baisakhi day), General Dyer ordered troops to fire on unarmed gathering protesting Rowlatt Act.",
        explanationHi: "13 अप्रैल 1919 को बैसाखी के दिन जनरल डायर ने रॉलेट एक्ट का शांतिपूर्ण विरोध कर रही निहत्थी भीड़ पर गोलियां चलवाई थीं।"
      },
      {
        id: "his_10",
        questionEn: "Who gave the famous slogan 'Swaraj is my birthright and I shall have it'?",
        questionHi: "'स्वराज मेरा जन्मसिद्ध अधिकार है और मैं इसे लेकर रहूँगा' यह उद्घोष किसने किया था?",
        optionsEn: ["Subhas Chandra Bose", "Bal Gangadhar Tilak", "Bhagat Singh", "Lala Lajpat Rai"],
        optionsHi: ["सुभाष चंद्र बोस", "लोकमान्य बाल गंगाधर तिलक", "शहीद भगत सिंह", "लाला लाजपत राय"],
        correctIndex: 1,
        explanationEn: "Bal Gangadhar Tilak gave this famous slogan to inspire Indians towards self-rule.",
        explanationHi: "लोकमान्य बाल गंगाधर तिलक ने भारतीयों में आत्मसम्मान और पूर्ण स्वराज की भावना जगाने के लिए यह नारा दिया था।"
      }
,
      {
        id: "his_11",
        questionEn: "The Buddhist monuments at Sanchi are located in which Indian state?",
        questionHi: "सांची के बौद्ध स्मारक भारत के किस राज्य में स्थित हैं?",
        optionsEn: ["Uttar Pradesh","Madhya Pradesh","Bihar","Rajasthan"],
        optionsHi: ["उत्तर प्रदेश","मध्य प्रदेश","बिहार","राजस्थान"],
        correctIndex: 1,
        explanationEn: "The Buddhist monuments at Sanchi are in Madhya Pradesh and are a UNESCO World Heritage Site.",
        explanationHi: "सांची के बौद्ध स्मारक मध्य प्रदेश में हैं और UNESCO विश्व धरोहर स्थल हैं।",
        sourceLabel: "UNESCO — Buddhist Monuments at Sanchi",
        sourceUrl: "https://whc.unesco.org/en/list/524/",
        lastVerified: "2026-10-09"
      },
      {
        id: "his_11b",
        questionEn: "The Quit India Movement was launched in which year?",
        questionHi: "भारत छोड़ो आंदोलन किस वर्ष शुरू हुआ था?",
        optionsEn: ["1919","1920","1930","1942"],
        optionsHi: ["1919","1920","1930","1942"],
        correctIndex: 3,
        explanationEn: "The Quit India resolution was adopted in August 1942.",
        explanationHi: "भारत छोड़ो प्रस्ताव अगस्त 1942 में अपनाया गया था।",
        sourceLabel: "Azadi Ka Amrit Mahotsav — Quit India Movement",
        sourceUrl: "https://amritmahotsav.nic.in/quit-india-movement.htm",
        lastVerified: "2026-10-09"
      },
      {
        id: "his_11c",
        questionEn: "Who was a key organiser in founding the Indian National Congress in 1885?",
        questionHi: "1885 में भारतीय राष्ट्रीय कांग्रेस की स्थापना में प्रमुख भूमिका किसकी थी?",
        optionsEn: ["A. O. Hume","Lord Curzon","Lord Mountbatten","Warren Hastings"],
        optionsHi: ["ए. ओ. ह्यूम","लॉर्ड कर्ज़न","लॉर्ड माउंटबेटन","वॉरेन हेस्टिंग्स"],
        correctIndex: 0,
        explanationEn: "A. O. Hume was a key organiser in the founding of the Indian National Congress in 1885.",
        explanationHi: "ए. ओ. ह्यूम ने 1885 में भारतीय राष्ट्रीय कांग्रेस की स्थापना में प्रमुख भूमिका निभाई।",
        sourceLabel: "Indian National Congress — Official Website",
        sourceUrl: "https://www.inc.in/",
        lastVerified: "2026-10-09"
      }
    ]
  },

  // 4. General Science & Environment
  {
    id: "general_science",
    titleEn: "General Science & Everyday Technology (सामान्य विज्ञान)",
    titleHi: "सामान्य विज्ञान व दैनिक तकनीकी",
    descEn: "Physics, Chemistry, Biology, human body, vitamins & environmental science.",
    descHi: "मानव शरीर, विटामिन, भौतिकी के नियम, रासायनिक सूत्र व पर्यावरण अध्ययन।",
    iconName: "Atom",
    color: "from-emerald-600 to-teal-700",
    questionsCount: 13,
    durationMinutes: 8,
    questions: [
      {
        id: "sci_1",
        questionEn: "Which vitamin is synthesized in the human body with the help of morning sunlight?",
        questionHi: "सुबह की धूप की सहायता से मानव शरीर में किस विटामिन का प्राकृतिक संश्लेषण होता है?",
        optionsEn: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
        optionsHi: ["विटामिन A", "विटामिन B12", "विटामिन C", "विटामिन D"],
        correctIndex: 3,
        explanationEn: "Sunlight triggers the synthesis of Vitamin D in the skin, which is essential for bone health and calcium absorption.",
        explanationHi: "सूर्य की पराबैंगनी किरणों के संपर्क में आने से त्वचा में विटामिन D का निर्माण होता है, जो हड्डियों के लिए जरूरी है।"
      },
      {
        id: "sci_2",
        questionEn: "What is the powerhouse of the cell called?",
        questionHi: "मानव शरीर की कोशिका का 'पावरहाउस' (Powerhouse of the Cell) किसे कहा जाता है?",
        optionsEn: ["Ribosome", "Mitochondria", "Nucleus", "Golgi Body"],
        optionsHi: ["राइबोसोम", "माइटोकॉन्ड्रिया (Mitochondria)", "केन्द्रक (Nucleus)", "गॉल्जी काय"],
        correctIndex: 1,
        explanationEn: "Mitochondria generates most of the chemical energy needed by the cell in the form of ATP.",
        explanationHi: "माइटोकॉन्ड्रिया में कोशिकीय श्वसन द्वारा ऊर्जा (ATP) उत्पन्न होती है, इसलिए इसे कोशिका का ऊर्जागृह कहते हैं।"
      },
      {
        id: "sci_3",
        questionEn: "What is the chemical formula of common salt used in food?",
        questionHi: "भोजन में उपयोग होने वाले साधारण नमक का रासायनिक नाम व सूत्र क्या है?",
        optionsEn: ["NaCl (Sodium Chloride)", "NaHCO3 (Baking Soda)", "NaOH (Caustic Soda)", "KCl (Potassium Chloride)"],
        optionsHi: ["NaCl (सोडियम क्लोराइड)", "NaHCO3 (बेकिंग सोडा)", "NaOH (कास्टिक सोडा)", "KCl"],
        correctIndex: 0,
        explanationEn: "Common table salt is Sodium Chloride (NaCl).",
        explanationHi: "साधारण खाने का नमक सोडियम और क्लोरीन का यौगिक सोडियम क्लोराइड (NaCl) होता है।"
      },
      {
        id: "sci_4",
        questionEn: "Which gas is primarily responsible for global warming as a greenhouse gas?",
        questionHi: "वायुमंडल में ग्रीनहाउस प्रभाव और ग्लोबल वार्मिंग के लिए मुख्य रूप से कौन सी गैस जिम्मेदार है?",
        optionsEn: ["Oxygen (O2)", "Nitrogen (N2)", "Carbon Dioxide (CO2)", "Argon (Ar)"],
        optionsHi: ["ऑक्सीजन", "नाइट्रोजन", "कार्बन डाइऑक्साइड (CO2)", "आर्गन"],
        correctIndex: 2,
        explanationEn: "Carbon dioxide (CO2) traps thermal radiation in the atmosphere, driving global temperature rise.",
        explanationHi: "कार्बन डाइऑक्साइड (CO2) पृथ्वी से उत्सर्जित अवरक्त किरणों को अवशोषित कर तापमान बढ़ाती है।"
      },
      {
        id: "sci_5",
        questionEn: "What is the normal blood pressure of a healthy adult human?",
        questionHi: "एक स्वस्थ वयस्क व्यक्ति का सामान्य रक्तचाप (Blood Pressure) कितना माना जाता है?",
        optionsEn: ["80/120 mmHg", "120/80 mmHg", "140/90 mmHg", "100/60 mmHg"],
        optionsHi: ["80/120 mmHg", "120/80 mmHg (सिस्टोलिक/डायस्टोलिक)", "140/90 mmHg", "100/60 mmHg"],
        correctIndex: 1,
        explanationEn: "Standard normal blood pressure is 120 mmHg systolic and 80 mmHg diastolic.",
        explanationHi: "सामान्य रक्तचाप 120 mmHg (हार्ट पंपिंग) तथा 80 mmHg (हार्ट रेस्टिंग) होता है।"
      },
      {
        id: "sci_6",
        questionEn: "Which device is used to measure electric current in a circuit?",
        questionHi: "विद्युत परिपथ में विद्युत धारा (Electric Current) मापने के लिए किस उपकरण का उपयोग किया जाता है?",
        optionsEn: ["Voltmeter", "Ammeter", "Barometer", "Thermometer"],
        optionsHi: ["वोल्टमीटर (विभवांतर)", "एमीटर (Ammeter - धारा)", "बैरोमीटर (वायुदाब)", "थर्मामीटर (तापमान)"],
        correctIndex: 1,
        explanationEn: "An ammeter is connected in series to measure electric current in amperes.",
        explanationHi: "विद्युत धारा को एम्पीयर में मापने के लिए परिपथ के श्रेणीक्रम में एमीटर लगाया जाता है।"
      },
      {
        id: "sci_7",
        questionEn: "What is the pH value of pure distilled water at room temperature?",
        questionHi: "शुद्ध आसुत जल (Pure Distilled Water) का pH मान कितना होता है?",
        optionsEn: ["0 (Acidic)", "7 (Neutral)", "14 (Basic)", "5.5"],
        optionsHi: ["0 (अम्लीय)", "7 (उदासीन / Neutral)", "14 (क्षारीय)", "5.5"],
        correctIndex: 1,
        explanationEn: "Pure water is neutral with a pH of 7 at 25°C.",
        explanationHi: "शुद्ध जल न तो अम्लीय होता है और न ही क्षारीय, इसका pH मान ठीक 7 (उदासीन) होता है।"
      },
      {
        id: "sci_8",
        questionEn: "Which blood group is known as the 'Universal Donor'?",
        questionHi: "किस रक्त समूह (Blood Group) को 'सर्वदाता' (Universal Donor) कहा जाता है?",
        optionsEn: ["AB Positive", "O Negative", "A Positive", "B Negative"],
        optionsHi: ["AB पॉजिटिव (सर्वग्राही)", "O नेगेटिव (सर्वदाता)", "A पॉजिटिव", "B नेगेटिव"],
        correctIndex: 1,
        explanationEn: "O Negative lacks A, B, and Rh antigens, making it safe for transfusion to any recipient in emergencies.",
        explanationHi: "O नेगेटिव में कोई एंटीजन नहीं होता, इसलिए आपातकाल में यह रक्त किसी भी मरीज को दिया जा सकता है।"
      },
      {
        id: "sci_9",
        questionEn: "Sound waves cannot travel through which of the following mediums?",
        questionHi: "ध्वनि तरंगें (Sound Waves) निम्नलिखित में से किस माध्यम में यात्रा नहीं कर सकतीं?",
        optionsEn: ["Water", "Steel", "Air", "Vacuum (निर्वात)"],
        optionsHi: ["जल में", "लोहे/स्टील में", "हवा में", "निर्वात (Vacuum - जहाँ हवा न हो)"],
        correctIndex: 3,
        explanationEn: "Sound is a mechanical wave that requires a material medium to propagate; it cannot travel in a vacuum.",
        explanationHi: "ध्वनि एक यांत्रिक तरंग है जिसे गति करने के लिए माध्यम के अणुओं की आवश्यकता होती है, निर्वात में ध्वनि नहीं चल सकती।"
      },
      {
        id: "sci_10",
        questionEn: "Which pigment gives green color to plant leaves and helps in photosynthesis?",
        questionHi: "पौधों की पत्तियों का हरा रंग किस वर्णक के कारण होता है जो प्रकाश संश्लेषण में सहायक है?",
        optionsEn: ["Hemoglobin", "Chlorophyll (पर्णहरित)", "Melanin", "Carotene"],
        optionsHi: ["हीमोग्लोबिन", "क्लोरोफिल (Chlorophyll)", "मेलेनिन", "कैरोटीन"],
        correctIndex: 1,
        explanationEn: "Chlorophyll absorbs solar energy to synthesize food through photosynthesis.",
        explanationHi: "क्लोरोफिल सूर्य के प्रकाश को अवशोषित करके कार्बन डाइऑक्साइड और जल से ग्लूकोज बनाने में मदद करता है।"
      }
,
      {
        id: "sci_11",
        questionEn: "What is the approximate speed of light in vacuum?",
        questionHi: "निर्वात में प्रकाश की लगभग चाल कितनी है?",
        optionsEn: ["3 × 10⁶ m/s","3 × 10⁸ m/s","3 × 10⁴ m/s","3 × 10¹⁰ m/s"],
        optionsHi: ["3 × 10⁶ मीटर/सेकंड","3 × 10⁸ मीटर/सेकंड","3 × 10⁴ मीटर/सेकंड","3 × 10¹⁰ मीटर/सेकंड"],
        correctIndex: 1,
        explanationEn: "The speed of light in vacuum is 299,792,458 metres per second, commonly rounded to 3 × 10⁸ m/s.",
        explanationHi: "निर्वात में प्रकाश की चाल 299,792,458 मीटर प्रति सेकंड है, जिसे सामान्यतः 3 × 10⁸ m/s लिखा जाता है।",
        sourceLabel: "NIST — Speed of Light",
        sourceUrl: "https://physics.nist.gov/cgi-bin/cuu/Value?c",
        lastVerified: "2026-10-09"
      },
      {
        id: "sci_11b",
        questionEn: "Which gas do plants primarily absorb from the atmosphere during photosynthesis?",
        questionHi: "प्रकाश संश्लेषण के दौरान पौधे वायुमंडल से मुख्यतः कौन-सी गैस लेते हैं?",
        optionsEn: ["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"],
        optionsHi: ["ऑक्सीजन","नाइट्रोजन","कार्बन डाइऑक्साइड","हाइड्रोजन"],
        correctIndex: 2,
        explanationEn: "Plants use carbon dioxide, water and light energy to produce sugars during photosynthesis.",
        explanationHi: "प्रकाश संश्लेषण में पौधे कार्बन डाइऑक्साइड, पानी और प्रकाश ऊर्जा का उपयोग करके शर्करा बनाते हैं।",
        sourceLabel: "NASA Climate Kids — Carbon Cycle",
        sourceUrl: "https://climatekids.nasa.gov/carbon/",
        lastVerified: "2026-10-09"
      },
      {
        id: "sci_11c",
        questionEn: "What is the SI unit of electric current?",
        questionHi: "विद्युत धारा की SI इकाई क्या है?",
        optionsEn: ["Volt","Ohm","Ampere","Watt"],
        optionsHi: ["वोल्ट","ओम","एम्पियर","वाट"],
        correctIndex: 2,
        explanationEn: "The ampere (A) is the SI base unit of electric current.",
        explanationHi: "एम्पियर (A) विद्युत धारा की SI मूल इकाई है।",
        sourceLabel: "BIPM — SI Brochure",
        sourceUrl: "https://www.bipm.org/en/publications/si-brochure",
        lastVerified: "2026-10-09"
      }
    ]
  },

  // 5. Reasoning & Mental Ability
  {
    id: "logical_reasoning",
    titleEn: "Reasoning & Mental Ability (तर्कशक्ति)",
    titleHi: "तार्किक क्षमता व मेंटल एबिलिटी",
    descEn: "Series, coding-decoding, blood relations, direction & analytical logic.",
    descHi: "संख्या श्रृंखला, कोडिंग-डिकोडिंग, रक्त संबंध, दिशा परीक्षण व विश्लेषणात्मक तर्क।",
    iconName: "BrainCircuit",
    color: "from-purple-600 to-indigo-800",
    questionsCount: 11,
    durationMinutes: 10,
    questions: [
      {
        id: "rea_1",
        questionEn: "Complete the series: 3, 7, 15, 31, 63, ?",
        questionHi: "संख्या श्रृंखला को पूरा करें: 3, 7, 15, 31, 63, ?",
        optionsEn: ["95", "127", "125", "120"],
        optionsHi: ["95", "127", "125", "120"],
        correctIndex: 1,
        explanationEn: "Pattern: (previous number * 2) + 1. So (63 * 2) + 1 = 126 + 1 = 127.",
        explanationHi: "पैटर्न: (पिछली संख्या x 2) + 1। अतः (63 x 2) + 1 = 126 + 1 = 127।"
      },
      {
        id: "rea_2",
        questionEn: "If 'ROSE' is coded as '6821' and 'CHAIR' as '73456', what is the code for 'SEARCH'?",
        questionHi: "यदि किसी कूटभाषा में 'ROSE' को '6821' और 'CHAIR' को '73456' लिखा जाता है, तो 'SEARCH' का कोड क्या होगा?",
        optionsEn: ["214673", "214573", "213674", "124673"],
        optionsHi: ["214673", "214573", "213674", "124673"],
        correctIndex: 0,
        explanationEn: "Direct mapping: S=2, E=1, A=4, R=6, C=7, H=3 => 214673.",
        explanationHi: "प्रत्यक्ष कोड मैपिंग: S=2, E=1, A=4, R=6, C=7, H=3, जिससे उत्तर 214673 बनता है।"
      },
      {
        id: "rea_3",
        questionEn: "Pointing to a photograph, Ramesh says: 'He is the son of the only son of my grandfather.' How is Ramesh related to the person in the photograph?",
        questionHi: "एक फोटो की ओर इशारा करते हुए रमेश ने कहा: 'यह मेरे दादाजी के इकलौते पुत्र का बेटा है।' फोटो वाला व्यक्ति रमेश का क्या है?",
        optionsEn: ["Brother (or Ramesh himself)", "Cousin", "Uncle", "Father"],
        optionsHi: ["भाई (या स्वयं रमेश)", "चचेरा भाई", "चाचा", "पिता"],
        correctIndex: 0,
        explanationEn: "Ramesh's grandfather's only son is Ramesh's father. The son of Ramesh's father is either Ramesh himself or his brother.",
        explanationHi: "रमेश के दादाजी का इकलौता पुत्र = रमेश के पिता। पिता का पुत्र = रमेश का भाई या स्वयं रमेश।"
      },
      {
        id: "rea_4",
        questionEn: "A man walks 5 km North, turns right and walks 3 km, then turns right again and walks 5 km. In which direction is he from his starting point?",
        questionHi: "एक व्यक्ति उत्तर दिशा में 5 किमी चलता है, फिर दाएं मुड़कर 3 किमी चलता है, फिर पुनः दाएं मुड़कर 5 किमी चलता है। अब वह प्रारंभिक बिंदु से किस दिशा में है?",
        optionsEn: ["North", "South", "East", "West"],
        optionsHi: ["उत्तर", "दक्षिण", "पूर्व (East)", "पश्चिम"],
        correctIndex: 2,
        explanationEn: "5km North and 5km South cancel out on the vertical axis, leaving him 3 km to the East of starting position.",
        explanationHi: "उत्तर में 5 किमी जाकर पुनः दक्षिण में 5 किमी आने से लंबवत दूरी शून्य हो गई, वह केवल 3 किमी पूर्व (East) दिशा में है।"
      },
      {
        id: "rea_5",
        questionEn: "Find the odd one out from the options:",
        questionHi: "दिए गए विकल्पों में से असंगत (Odd one) को चुनें:",
        optionsEn: ["Carrot (गाजर)", "Potato (आलू)", "Tomato (टमाटर)", "Ginger (अदरक)"],
        optionsHi: ["गाजर (जमीन के नीचे)", "आलू (जमीन के नीचे)", "टमाटर (जमीन के ऊपर/फल)", "अदरक (जमीन के नीचे)"],
        correctIndex: 2,
        explanationEn: "Tomato grows above ground on branches, while carrot, potato, and ginger grow underground.",
        explanationHi: "टमाटर जमीन के ऊपर पौधे पर उगने वाला फल/सब्जी है, जबकि गाजर, आलू और अदरक जमीन के नीचे उगते हैं।"
      },
      {
        id: "rea_6",
        questionEn: "If today is Monday, what day of the week will it be after 61 days?",
        questionHi: "यदि आज सोमवार है, तो ठीक 61 दिनों के बाद सप्ताह का कौन सा दिन होगा?",
        optionsEn: ["Tuesday", "Wednesday", "Thursday", "Saturday"],
        optionsHi: ["मंगलवार", "बुधवार", "गुरुवार", "शनिवार"],
        correctIndex: 3,
        explanationEn: "61 divided by 7 leaves remainder 5. Monday + 5 days = Saturday.",
        explanationHi: "61 को 7 से भाग देने पर शेषफल 5 बचता है। सोमवार + 5 दिन = शनिवार।"
      },
      {
        id: "rea_7",
        questionEn: "Doctor is related to Hospital in the same way as Teacher is related to:",
        questionHi: "जिस प्रकार 'चिकित्सक' का संबंध 'अस्पताल' से है, उसी प्रकार 'शिक्षक' का संबंध किससे है?",
        optionsEn: ["Class", "School", "Books", "Student"],
        optionsHi: ["कक्षा", "विद्यालय (School - कार्यस्थल)", "किताबें", "विद्यार्थी"],
        correctIndex: 1,
        explanationEn: "The relationship represents profession and primary workplace: Doctor -> Hospital, Teacher -> School.",
        explanationHi: "यह संबंध पेशा और मुख्य कार्यस्थल का है: डॉक्टर अस्पताल में कार्य करते हैं, तो शिक्षक विद्यालय में।"
      },
      {
        id: "rea_8",
        questionEn: "In a row of 30 students, Amit is 12th from the left. What is his position from the right end?",
        questionHi: "30 छात्रों की एक पंक्ति में अमित बाएं छोर से 12वें स्थान पर है। दाएं छोर से उसका स्थान क्या होगा?",
        optionsEn: ["18th", "19th", "20th", "21st"],
        optionsHi: ["18वां", "19वां", "20वां", "21वां"],
        correctIndex: 1,
        explanationEn: "Formula: Total = (Left + Right) - 1. So Right = Total - Left + 1 = 30 - 12 + 1 = 19.",
        explanationHi: "सूत्र: दायां स्थान = (कुल छात्र - बायां स्थान) + 1 = (30 - 12) + 1 = 18 + 1 = 19वां।"
      }
,
      {
        id: "rea_9",
        questionEn: "Complete the sequence: 2, 6, 12, 20, 30, __.",
        questionHi: "श्रृंखला पूरी करें: 2, 6, 12, 20, 30, __।",
        optionsEn: ["36","40","42","44"],
        optionsHi: ["36","40","42","44"],
        correctIndex: 2,
        explanationEn: "The differences are +4, +6, +8, +10, so the next difference is +12 and the answer is 42.",
        explanationHi: "अंतर +4, +6, +8, +10 हैं; अगला अंतर +12 होगा, इसलिए उत्तर 42 है।",
        sourceLabel: "Rule-derived reasoning question",
        lastVerified: "2026-10-09"
      },
      {
        id: "rea_10",
        questionEn: "If all roses are flowers and some flowers fade quickly, which conclusion must be true?",
        questionHi: "यदि सभी गुलाब फूल हैं और कुछ फूल जल्दी मुरझाते हैं, तो कौन-सा निष्कर्ष निश्चित रूप से सही है?",
        optionsEn: ["All roses fade quickly","No roses fade quickly","All roses are flowers","Some roses are not flowers"],
        optionsHi: ["सभी गुलाब जल्दी मुरझाते हैं","कोई गुलाब जल्दी नहीं मुरझाता","सभी गुलाब फूल हैं","कुछ गुलाब फूल नहीं हैं"],
        correctIndex: 2,
        explanationEn: "The first premise directly guarantees that all roses are flowers; the second does not say whether roses fade quickly.",
        explanationHi: "पहला कथन सीधे बताता है कि सभी गुलाब फूल हैं; दूसरा यह नहीं बताता कि गुलाब जल्दी मुरझाते हैं या नहीं।",
        sourceLabel: "Formal logic — derived from stated premises",
        lastVerified: "2026-10-09"
      },
      {
        id: "rea_11",
        questionEn: "A clock shows 3:00. What is the smaller angle between its hour and minute hands?",
        questionHi: "घड़ी में 3:00 बजे हैं। घंटे और मिनट की सुइयों के बीच छोटा कोण कितना होगा?",
        optionsEn: ["45°","60°","90°","120°"],
        optionsHi: ["45°","60°","90°","120°"],
        correctIndex: 2,
        explanationEn: "At 3:00 the hands form a right angle of 90 degrees.",
        explanationHi: "3 बजे दोनों सुइयों के बीच 90 डिग्री का समकोण बनता है।",
        sourceLabel: "Geometric calculation — derived from clock positions",
        lastVerified: "2026-10-09"
      }
    ]
  },

  // 6. Computer & Digital Literacy
  {
    id: "computer_literacy",
    titleEn: "Computer & Cyber Literacy (कंप्यूटर व डिजिटल)",
    titleHi: "कंप्यूटर व साइबर सुरक्षा ज्ञान",
    descEn: "Internet, keyboard shortcuts, memory, MS Office, cyber security & AI basics.",
    descHi: "कंप्यूटर मेमोरी, इंटरनेट, शॉर्टकट की, साइबर सुरक्षा व सरकारी डिजिटल सेवाएं।",
    iconName: "Monitor",
    color: "from-sky-600 to-blue-800",
    questionsCount: 11,
    durationMinutes: 8,
    questions: [
      {
        id: "comp_1",
        questionEn: "What is the primary function of RAM (Random Access Memory) in a computer?",
        questionHi: "कंप्यूटर में RAM (रैंडम एक्सेस मेमोरी) का मुख्य कार्य क्या होता है?",
        optionsEn: ["Permanent storage of files", "Temporary working memory for running apps", "Display graphics on monitor", "Cool down the processor"],
        optionsHi: ["फाइलों को स्थायी रूप से सुरक्षित रखना", "चल रहे ऐप्स हेतु तीव्र अस्थायी कार्यशील मेमोरी", "स्क्रीन पर फोटो दिखाना", "कंप्यूटर को ठंडा रखना"],
        correctIndex: 1,
        explanationEn: "RAM is high-speed volatile memory holding active data and apps currently in use.",
        explanationHi: "रैम एक वोलेटाइल (अस्थायी) मेमोरी है जो वर्तमान में चल रहे प्रोग्राम्स का डेटा तेजी से प्रोसेस करती है।"
      },
      {
        id: "comp_2",
        questionEn: "Which shortcut key is universally used to 'Undo' the last action in Windows?",
        questionHi: "कंप्यूटर में किसी गलत कार्रवाई को वापस पूर्ववत (Undo) करने के लिए किस शॉर्टकट कुंजी का उपयोग होता है?",
        optionsEn: ["Ctrl + C", "Ctrl + V", "Ctrl + Z", "Ctrl + Y"],
        optionsHi: ["Ctrl + C (कॉपी)", "Ctrl + V (पेस्ट)", "Ctrl + Z (Undo - पूर्ववत)", "Ctrl + Y (Redo)"],
        correctIndex: 2,
        explanationEn: "Ctrl + Z reverses the most recent action across operating systems and text editors.",
        explanationHi: "Ctrl + Z कीबोर्ड शॉर्टकट का उपयोग अंतिम किए गए कार्य को तुरंत पूर्ववत करने हेतु होता है।"
      },
      {
        id: "comp_3",
        questionEn: "What does the 'S' stand for in HTTPS seen in website URL addresses?",
        questionHi: "सुरक्षित वेबसाइटों के यूआरएल (HTTPS) में 'S' अक्षर का क्या अर्थ होता है?",
        optionsEn: ["Server", "Secure (Encrypted SSL/TLS)", "System", "Standard"],
        optionsHi: ["सर्वर", "Secure (सुरक्षित / एन्क्रिप्टेड)", "सिस्टम", "स्टैंडर्ड"],
        correctIndex: 1,
        explanationEn: "HTTPS stands for HyperText Transfer Protocol Secure, using SSL/TLS encryption to protect data in transit.",
        explanationHi: "HTTPS का अर्थ हाइपरटेक्स्ट ट्रांसफर प्रोटोकॉल सिक्योर है, जो उपयोगकर्ता के पासवर्ड और डेटा को एन्क्रिप्ट रखता है।"
      },
      {
        id: "comp_4",
        questionEn: "1 Gigabyte (1 GB) is exactly equal to how many Megabytes (MB)?",
        questionHi: "कंप्यूटर मेमोरी में 1 गीगाबाइट (1 GB) कितने मेगाबाइट (MB) के बराबर होता है?",
        optionsEn: ["100 MB", "1000 MB", "1024 MB", "1048576 MB"],
        optionsHi: ["100 MB", "1000 MB", "1024 MB", "1048576 MB"],
        correctIndex: 2,
        explanationEn: "In binary computing, 1 GB equals 2^10 = 1024 MB.",
        explanationHi: "बाइनरी माप प्रणाली के अनुसार 1 GB ठीक 1024 मेगाबाइट (MB) के बराबर होता है।"
      },
      {
        id: "comp_5",
        questionEn: "What type of cyber attack involves tricking users into revealing passwords via fake links or emails?",
        questionHi: "फर्जी लिंक या ईमेल भेजकर यूज़र के बैंक पासवर्ड या ओटीपी चुराने के साइबर अपराध को क्या कहा जाता है?",
        optionsEn: ["Phishing (फ़िशिंग)", "Spamming", "Firewalling", "Formatting"],
        optionsHi: ["फ़िशिंग (Phishing)", "स्पैमिंग", "फ़ायरवॉलिंग", "फॉर्मेटिंग"],
        correctIndex: 0,
        explanationEn: "Phishing is a fraudulent practice of sending deceptive messages to steal sensitive credentials.",
        explanationHi: "फ़िशिंग हमले में जालसाज असली बैंक जैसी दिखने वाली नकली वेबसाइट का झांसा देकर गोपनीय पासवर्ड चुराते हैं।"
      },
      {
        id: "comp_6",
        questionEn: "What is the full form of PDF used for digital documents?",
        questionHi: "दस्तावेजों में व्यापक रूप से उपयोग होने वाले 'PDF' का पूर्ण रूप (Full Form) क्या है?",
        optionsEn: ["Personal Document File", "Portable Document Format", "Printed Data Folder", "Public Digital File"],
        optionsHi: ["पर्सनल डॉक्यूमेंट फाइल", "Portable Document Format (पोर्टेबल डॉक्यूमेंट फॉर्मेट)", "प्रिंटेड डेटा फोल्डर", "पब्लिक डिजिटल फाइल"],
        correctIndex: 1,
        explanationEn: "PDF stands for Portable Document Format, developed by Adobe to present documents independently of software and hardware.",
        explanationHi: "PDF का पूर्ण रूप Portable Document Format है, जिसे किसी भी डिवाइस पर बिना फॉर्मेट बदले देखा जा सकता है।"
      },
      {
        id: "comp_7",
        questionEn: "Which of the following is an open-source operating system?",
        questionHi: "निम्नलिखित में से कौन सा ऑपरेटिंग सिस्टम ओपन-सोर्स (Open Source) और निःशुल्क है?",
        optionsEn: ["Microsoft Windows", "Apple macOS", "Linux (Ubuntu)", "iOS"],
        optionsHi: ["माइक्रोसॉफ्ट विंडोज", "एप्पल मैक ओएस", "लिनक्स (Linux / Ubuntu)", "आईओएस"],
        correctIndex: 2,
        explanationEn: "Linux is open-source operating system whose source code is freely available for community development.",
        explanationHi: "लिनक्स एक ओपन-सोर्स ऑपरेटिंग सिस्टम है जिसका कोड मुफ्त उपलब्ध रहता है और विश्व भर के सर्वर इस पर चलते हैं।"
      },
      {
        id: "comp_8",
        questionEn: "What is the primary role of a Firewall in a computer network?",
        questionHi: "कंप्यूटर और इंटरनेट नेटवर्क में 'फ़ायरवॉल' (Firewall) का प्राथमिक कार्य क्या होता है?",
        optionsEn: ["Increase internet speed", "Block unauthorized incoming connections & threats", "Clean dust from computer", "Charge the battery"],
        optionsHi: ["इंटरनेट की गति बढ़ाना", "अनाधिकृत बाहरी कनेक्शन व साइबर खतरों को रोकना", "कंप्यूटर की धूल साफ करना", "बैटरी चार्ज करना"],
        correctIndex: 1,
        explanationEn: "A firewall monitors and filters incoming and outgoing network traffic based on security rules.",
        explanationHi: "फ़ायरवॉल एक डिजिटल सुरक्षा दीवार की तरह काम करता है जो इंटरनेट से आने वाले वायरस और हैकर्स को रोकता है।"
      }
,
      {
        id: "comp_9",
        questionEn: "What does HTTPS add to HTTP for web communication?",
        questionHi: "वेब संचार में HTTPS, HTTP के मुकाबले कौन-सी मुख्य सुरक्षा सुविधा जोड़ता है?",
        optionsEn: ["A guarantee that a site is honest","Encryption and server authentication using TLS","Unlimited internet speed","Automatic virus removal"],
        optionsHi: ["यह गारंटी कि वेबसाइट ईमानदार है","TLS के माध्यम से एन्क्रिप्शन और सर्वर प्रमाणीकरण","असीमित इंटरनेट गति","वायरस अपने-आप हटाना"],
        correctIndex: 1,
        explanationEn: "HTTPS uses TLS to encrypt data in transit and authenticate the server; it does not guarantee trustworthy site content.",
        explanationHi: "HTTPS, TLS के जरिए डेटा एन्क्रिप्ट करता है और सर्वर की पहचान जाँचता है; यह वेबसाइट की सामग्री ईमानदार होने की गारंटी नहीं देता।",
        sourceLabel: "IETF — TLS 1.3",
        sourceUrl: "https://www.rfc-editor.org/rfc/rfc8446",
        lastVerified: "2026-10-09"
      },
      {
        id: "comp_10",
        questionEn: "What is the safest response when an unexpected message asks you to share an OTP?",
        questionHi: "जब कोई अनजान संदेश आपसे OTP साझा करने को कहे, तो सबसे सुरक्षित कदम क्या है?",
        optionsEn: ["Share it quickly","Send it after checking the logo","Do not share it; verify through the official service independently","Post it in a group"],
        optionsHi: ["तुरंत साझा करें","लोगो देखकर भेज दें","इसे साझा न करें; आधिकारिक सेवा से स्वतंत्र रूप से सत्यापन करें","समूह में डाल दें"],
        correctIndex: 2,
        explanationEn: "One-time passwords are authentication secrets and should not be shared with callers or message senders.",
        explanationHi: "OTP प्रमाणीकरण का गोपनीय कोड है; इसे कॉल करने वाले या संदेश भेजने वाले के साथ साझा नहीं करना चाहिए।",
        sourceLabel: "CERT-In — Cyber Safety guidance",
        sourceUrl: "https://www.cert-in.org.in/",
        lastVerified: "2026-10-09"
      },
      {
        id: "comp_11",
        questionEn: "What is multi-factor authentication (MFA)?",
        questionHi: "मल्टी-फैक्टर ऑथेंटिकेशन (MFA) क्या है?",
        optionsEn: ["Using the same password everywhere","Using two or more different categories of proof to verify identity","Changing a username daily","Installing two browsers"],
        optionsHi: ["हर जगह एक ही पासवर्ड उपयोग करना","पहचान सत्यापित करने के लिए दो या अधिक अलग-अलग प्रकार के प्रमाण उपयोग करना","रोज़ username बदलना","दो ब्राउज़र इंस्टॉल करना"],
        correctIndex: 1,
        explanationEn: "MFA combines two or more different factor types, such as something you know, have, or are.",
        explanationHi: "MFA में अलग-अलग प्रकार के दो या अधिक प्रमाण जोड़े जाते हैं, जैसे ज्ञान, पास में मौजूद वस्तु या जैविक पहचान।",
        sourceLabel: "NIST — Digital Identity Guidelines",
        sourceUrl: "https://pages.nist.gov/800-63-3/sp800-63b.html",
        lastVerified: "2026-10-09"
      }
    ]
  }
];
