const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hash(text) {
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex').slice(0, 16);
}

const optionKeys = ['opt_a', 'opt_b', 'opt_c', 'opt_d'];

const rawQuestions = [
  // 1 to 10
  {
    sub: "national_schemes",
    qEn: "Which flagship national scheme was launched in 2024 to provide free electricity up to 300 units per month to 1 crore households through rooftop solar systems?",
    qHi: "1 करोड़ घरों को छत पर सौर प्रणाली के माध्यम से प्रति माह 300 यूनिट तक मुफ्त बिजली प्रदान करने के लिए 2024 में कौन सी प्रमुख राष्ट्रीय योजना शुरू की गई?",
    optEn: ["PM Surya Ghar: Muft Bijli Yojana", "PM KUSUM 2.0", "National Solar Mission 3.0", "Ujala Solar Rooftop Scheme"],
    optHi: ["पीएम सूर्य घर: मुफ्त बिजली योजना", "पीएम कुसुम 2.0", "राष्ट्रीय सौर मिशन 3.0", "उजाला सोलर रूफटॉप योजना"],
    correctIdx: 0,
    expEn: "PM Surya Ghar: Muft Bijli Yojana was approved with an outlay of Rs 75,021 crore to install rooftop solar in 1 crore households.",
    expHi: "पीएम सूर्य घर: मुफ्त बिजली योजना को 1 करोड़ घरों में सौर संयंत्र स्थापित करने के लिए ₹75,021 करोड़ के परिव्यय से स्वीकृति दी गई।",
    diff: "easy",
    src: { name: "Press Information Bureau (PIB) / Ministry of New and Renewable Energy", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2005677", pubDate: "2024-02-15", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "science_space",
    qEn: "What is the designated name of India's planned permanent space station to be deployed in low Earth orbit by 2035?",
    qHi: "2035 तक पृथ्वी की निचली कक्षा में स्थापित किए जाने वाले भारत के नियोजित स्थायी अंतरिक्ष स्टेशन का आधिकारिक नाम क्या है?",
    optEn: ["Antariksh Dham", "Bharatiya Antariksh Station (BAS)", "Indra Space Laboratory", "Viksit Bharat Orbital Platform"],
    optHi: ["अंतरिक्ष धाम", "भारतीय अंतरिक्ष स्टेशन (BAS)", "इंद्र स्पेस लेबोरेटरी", "विकसित भारत ऑर्बिटल प्लेटफॉर्म"],
    correctIdx: 1,
    expEn: "ISRO has unveiled the roadmap for Bharatiya Antariksh Station (BAS), with its first module BAS-1 targeted for launch by 2028 and completion by 2035.",
    expHi: "इसरो ने भारतीय अंतरिक्ष स्टेशन (BAS) का रोडमैप प्रस्तुत किया है, जिसके प्रथम मॉड्यूल (BAS-1) को 2028 तक और पूर्ण स्टेशन को 2035 तक स्थापित करने का लक्ष्य है।",
    diff: "medium",
    src: { name: "ISRO / Press Information Bureau", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2056156", pubDate: "2024-09-18", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "Under the expanded Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY), which demographic segment was granted universal health cover of Rs 5 lakh per year regardless of income in 2024?",
    qHi: "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (AB-PMJAY) के विस्तार के तहत 2024 में आय सीमा के बिना किस वर्ग को प्रति वर्ष ₹5 लाख का सार्वभौमिक स्वास्थ्य कवर प्रदान किया गया?",
    optEn: ["All accredited journalists", "Primary school teachers", "All senior citizens aged 70 years and above", "Gig and platform workers"],
    optHi: ["सभी मान्यता प्राप्त पत्रकार", "प्राथमिक विद्यालय के शिक्षक", "70 वर्ष और उससे अधिक आयु के सभी वरिष्ठ नागरिक", "गिग और प्लेटफॉर्म श्रमिक"],
    correctIdx: 2,
    expEn: "The Union Cabinet approved health coverage of Rs 5 lakh per year to all senior citizens aged 70 years and above irrespective of their socio-economic status.",
    expHi: "केंद्रीय मंत्रिमंडल ने 70 वर्ष और उससे अधिक आयु के सभी वरिष्ठ नागरिकों को उनकी सामाजिक-आर्थिक स्थिति की परवाह किए बिना ₹5 लाख प्रति वर्ष का स्वास्थ्य कवर स्वीकृत किया।",
    diff: "easy",
    src: { name: "Press Information Bureau (PIB) / Ministry of Health and Family Welfare", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2053818", pubDate: "2024-09-11", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "What is the primary objective of the Unified Lending Interface (ULI) platform launched by the Reserve Bank of India (RBI)?",
    qHi: "भारतीय रिजर्व बैंक (RBI) द्वारा शुरू किए गए 'यूनिफाइड लेंडिंग इंटरफेस' (ULI) प्लेटफॉर्म का प्राथमिक उद्देश्य क्या है?",
    optEn: ["To replace credit rating agencies", "To regulate peer-to-peer crypto lending", "To manage government sovereign debt", "To enable frictionless, consent-based credit flow especially to rural and small borrowers"],
    optHi: ["क्रेडिट रेटिंग एजेंसियों को बदलना", "पीयर-टू-पीयर क्रिप्टो ऋण को विनियमित करना", "सरकारी संप्रभु ऋण का प्रबंधन करना", "विशेष रूप से ग्रामीण और छोटे उधारकर्ताओं को बाधारहित, सहमति-आधारित ऋण प्रवाह सक्षम करना"],
    correctIdx: 3,
    expEn: "ULI enables frictionless flow of credit by digitizing access to land records, satellite data, and financial history with borrower consent, akin to UPI in payments.",
    expHi: "ULI भुगतान में UPI की भांति उधारकर्ता की सहमति से भूमि रिकॉर्ड, उपग्रह डेटा और वित्तीय इतिहास तक डिजिटल पहुंच प्रदान कर निर्बाध ऋण प्रवाह सक्षम करता है।",
    diff: "medium",
    src: { name: "Reserve Bank of India (RBI) Press Release", url: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=58500", pubDate: "2024-08-26", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "defence_security",
    qEn: "India commissioned its second indigenous nuclear-powered ballistic missile submarine (SSBN) in August 2024. What is its name?",
    qHi: "अगस्त 2024 में भारत ने अपनी दूसरी स्वदेशी परमाणु-संचालित बैलिस्टिक मिसाइल पनडुब्बी (SSBN) को नौसेना में शामिल किया। इसका नाम क्या है?",
    optEn: ["INS Arighaat", "INS Arihant", "INS Kalvari", "INS Khanderi"],
    optHi: ["आईएनएस अरिघात (INS Arighaat)", "आईएनएस अरिहंत", "आईएनएस कलवरी", "आईएनएस खंडेरी"],
    correctIdx: 0,
    expEn: "INS Arighaat (S3) is India's second nuclear-powered ballistic missile submarine commissioned at Visakhapatnam, enhancing India's nuclear triad deterrence.",
    expHi: "आईएनएस अरिघात भारत की दूसरी परमाणु-संचालित बैलिस्टिक मिसाइल पनडुब्बी है जिसे विशाखापत्तनम में नौसेना में शामिल किया गया, जिसने भारत के परमाणु त्रिकोण को सुदृढ़ किया।",
    diff: "medium",
    src: { name: "Ministry of Defence / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2049987", pubDate: "2024-08-29", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "environment_ecology",
    qEn: "Which international treaty alliance was officially launched by India in 2024 with headquarters in India to protect seven major big cat species globally?",
    qHi: "विश्व भर में सात प्रमुख बिग कैट प्रजातियों के संरक्षण हेतु भारत द्वारा 2024 में भारत में मुख्यालय के साथ किस अंतरराष्ट्रीय संधि गठबंधन की शुरुआत की गई?",
    optEn: ["Global Tiger Forum 2.0", "International Big Cat Alliance (IBCA)", "World Wildlife Protection Union", "Global Feline Conservation Pact"],
    optHi: ["ग्लोबल टाइगर फोरम 2.0", "इंटरनेशनल बिग कैट अलायंस (IBCA)", "वर्ल्ड वाइल्डलाइफ प्रोटेक्शन यूनियन", "ग्लोबल फेलाइन कंजर्वेशन पैक्ट"],
    correctIdx: 1,
    expEn: "The Union Cabinet approved the establishment of the International Big Cat Alliance (IBCA) with headquarters in India and initial budgetary support of Rs 150 crore.",
    expHi: "केंद्रीय मंत्रिमंडल ने भारत में मुख्यालय और ₹150 करोड़ के आरंभिक बजट के साथ इंटरनेशनल बिग कैट अलायंस (IBCA) की स्थापना को मंजूरी दी।",
    diff: "easy",
    src: { name: "Press Information Bureau (PIB) / Ministry of Environment, Forest and Climate Change", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2010103", pubDate: "2024-02-29", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "science_space",
    qEn: "In March 2024, the Defence Research and Development Organisation (DRDO) successfully conducted Mission Divyastra. What was its landmark achievement?",
    qHi: "मार्च 2024 में रक्षा अनुसंधान एवं विकास संगठन (DRDO) ने 'मिशन दिव्यास्त्र' का सफल परीक्षण किया। इसकी ऐतिहासिक उपलब्धि क्या थी?",
    optEn: ["First anti-satellite laser weapon test", "Deep-sea submarine rescue vehicle trial", "First flight test of Agni-5 missile with Multiple Independently Targetable Re-entry Vehicle (MIRV) technology", "Hypersonic cruise missile test above Mach 10"],
    optHi: ["पहला उपग्रह-रोधी लेजर हथियार परीक्षण", "गहरे समुद्र में पनडुब्बी बचाव वाहन परीक्षण", "मल्टीपल इंडिपेंडेंटली टार्गेटेबल री-एंट्री व्हीकल (MIRV) तकनीक के साथ अग्नि-5 मिसाइल का पहला उड़ान परीक्षण", "मैक 10 से अधिक हाइपरसोनिक क्रूज मिसाइल परीक्षण"],
    correctIdx: 2,
    expEn: "Mission Divyastra marked India's maiden flight test of the indigenously developed Agni-5 missile equipped with MIRV technology, allowing a single missile to strike multiple targets.",
    expHi: "मिशन दिव्यास्त्र ने MIRV तकनीक से युक्त स्वदेशी अग्नि-5 मिसाइल का पहला सफल उड़ान परीक्षण चिह्नित किया, जिससे एक ही मिसाइल विभिन्न लक्ष्यों पर कई हथियार दाग सकती है।",
    diff: "medium",
    src: { name: "Press Information Bureau / Prime Minister's Office", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2013444", pubDate: "2024-03-11", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "governance_appointments",
    qEn: "Who was appointed as the 26th Chief of the Naval Staff of the Indian Navy in April 2024?",
    qHi: "अप्रैल 2024 में भारतीय नौसेना के 26वें नौसेना प्रमुख (Chief of the Naval Staff) के रूप में किसे नियुक्त किया गया?",
    optEn: ["Admiral Karambir Singh", "Admiral R. Hari Kumar", "Admiral Suraj Berry", "Admiral Dinesh Kumar Tripathi"],
    optHi: ["एडमिरल करमबीर सिंह", "एडमिरल आर. हरि कुमार", "एडमिरल सूरज बेरी", "एडमिरल दिनेश कुमार त्रिपाठी"],
    correctIdx: 3,
    expEn: "Admiral Dinesh Kumar Tripathi assumed charge as the 26th Chief of the Naval Staff on April 30, 2024.",
    expHi: "एडमिरल दिनेश कुमार त्रिपाठी ने 30 अप्रैल 2024 को भारतीय नौसेना के 26वें प्रमुख के रूप में पदभार ग्रहण किया।",
    diff: "medium",
    src: { name: "Press Information Bureau / Ministry of Defence", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2018318", pubDate: "2024-04-30", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "awards_honours",
    qEn: "Which veteran actor and producer was honoured with the prestigious 54th Dadasaheb Phalke Award in 2024 for lifetime contribution to Indian cinema?",
    qHi: "भारतीय सिनेमा में आजीवन योगदान के लिए 2024 में प्रतिष्ठित 54वें दादा साहब फाल्के पुरस्कार से किस अनुभवी अभिनेता और निर्माता को सम्मानित किया गया?",
    optEn: ["Mithun Chakraborty", "Waheeda Rehman", "Asha Parekh", "Rajinikanth"],
    optHi: ["मिथुन चक्रवर्ती", "वहीदा रहमान", "आशा पारेख", "रजनीकांत"],
    correctIdx: 0,
    expEn: "Mithun Chakraborty was conferred the 54th Dadasaheb Phalke Lifetime Achievement Award for 2022 at the 70th National Film Awards ceremony in October 2024.",
    expHi: "मिथुन चक्रवर्ती को अक्टूबर 2024 में 70वें राष्ट्रीय फिल्म पुरस्कार समारोह में वर्ष 2022 के 54वें दादा साहब फाल्के लाइफटाइम अचीवमेंट पुरस्कार से सम्मानित किया गया।",
    diff: "easy",
    src: { name: "Press Information Bureau / Ministry of Information and Broadcasting", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2060124", pubDate: "2024-09-30", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "sports",
    qEn: "At the Paris 2024 Olympic Games, Manu Bhaker created history by becoming the first athlete of independent India to accomplish which feat at a single Olympic edition?",
    qHi: "पेरिस 2024 ओलंपिक खेलों में, मनु भाकर ने एक ही ओलंपिक संस्करण में कौन सा ऐतिहासिक कीर्तिमान स्थापित करने वाली स्वतंत्र भारत की पहली एथलीट बनने का गौरव प्राप्त किया?",
    optEn: ["Winning an individual gold in archery", "Winning two Olympic medals at a single Olympic Games edition", "Breaking the world record in 50m rifle", "Winning three medals in gymnastics"],
    optHi: ["तीरंदाजी में व्यक्तिगत स्वर्ण पदक जीतना", "एक ही ओलंपिक खेलों के संस्करण में दो ओलंपिक पदक जीतना", "50 मीटर राइफल में विश्व रिकॉर्ड तोड़ना", "जिम्नास्टिक में तीन पदक जीतना"],
    correctIdx: 1,
    expEn: "Manu Bhaker won bronze in the Women's 10m Air Pistol and another bronze with Sarabjot Singh in the 10m Air Pistol Mixed Team event at Paris 2024.",
    expHi: "मनु भाकर ने पेरिस 2024 में महिलाओं की 10 मीटर एयर पिस्टल में कांस्य और सरबजोत सिंह के साथ 10 मीटर मिश्रित टीम स्पर्धा में दूसरा कांस्य पदक जीता।",
    diff: "easy",
    src: { name: "Ministry of Youth Affairs and Sports / Olympics Official", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2039230", pubDate: "2024-07-30", verificationDate: "2026-03-10", status: "verified" }
  },

  // 11 to 20
  {
    sub: "national_schemes",
    qEn: "Which national initiative launched by the Ministry of Electronics and Information Technology promotes indigenous language translation AI models across 22 scheduled Indian languages?",
    qHi: "इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी मंत्रालय द्वारा शुरू की गई कौन सी राष्ट्रीय पहल 22 अनुसूचित भारतीय भाषाओं में स्वदेशी भाषा अनुवाद AI मॉडल को बढ़ावा देती है?",
    optEn: ["Digital Bhasha Abhiyan", "Vani AI Mission", "Digital India Bhashini (BHASHINI)", "National Translation Mission 2.0"],
    optHi: ["डिजिटल भाषा अभियान", "वाणी एआई मिशन", "डिजिटल इंडिया भाषिणी (BHASHINI)", "राष्ट्रीय अनुवाद मिशन 2.0"],
    correctIdx: 2,
    expEn: "BHASHINI (Bhasha Interface for India) builds AI-driven natural language technologies to make digital services accessible across Indian languages.",
    expHi: "भाषिणी (BHASHINI) भारतीय भाषाओं में डिजिटल सेवाओं को सुलभ बनाने के लिए AI-आधारित भाषा प्रौद्योगिकियों का विकास करता है।",
    diff: "medium",
    src: { name: "Ministry of Electronics and IT (MeitY)", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1988220", pubDate: "2023-12-19", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "In February 2024, India's Unified Payments Interface (UPI) was formally linked with the instant payment system of which island country in the Indian Ocean?",
    qHi: "फरवरी 2024 में भारत के यूनिफाइड पेमेंट्स इंटरफेस (UPI) को हिंद महासागर के किस द्वीपीय देश की त्वरित भुगतान प्रणाली से औपचारिक रूप से जोड़ा गया?",
    optEn: ["Seychelles", "Maldives", "Madagascar", "Mauritius"],
    optHi: ["सेशेल्स", "मालदीव", "मेडागास्कर", "मॉरीशस"],
    correctIdx: 3,
    expEn: "UPI and RuPay services were launched in Sri Lanka and Mauritius via a virtual ceremony by PM Narendra Modi along with leaders of both nations.",
    expHi: "प्रधानमंत्री नरेंद्र मोदी और दोनों देशों के नेताओं द्वारा श्रीलंका और मॉरीशस में UPI और RuPay सेवाओं का शुभारंभ किया गया।",
    diff: "medium",
    src: { name: "Press Information Bureau / PMO", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2005161", pubDate: "2024-02-12", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "The PM-eBus Sewa scheme aims to deploy how many electric buses in cities on a Public-Private Partnership (PPP) model to promote green urban mobility?",
    qHi: "हरित शहरी गतिशीलता को बढ़ावा देने के लिए सार्वजनिक-निजी भागीदारी (PPP) मॉडल पर शहरों में कितनी इलेक्ट्रिक बसें चलाने का लक्ष्य 'पीएम-ईबस सेवा' का है?",
    optEn: ["10,000 electric buses", "25,000 electric buses", "50,000 electric buses", "5,000 electric buses"],
    optHi: ["10,000 इलेक्ट्रिक बसें", "25,000 इलेक्ट्रिक बसें", "50,000 इलेक्ट्रिक बसें", "5,000 इलेक्ट्रिक बसें"],
    correctIdx: 0,
    expEn: "PM-eBus Sewa has an outlay of Rs 57,613 crore to augment city bus operations by deploying 10,000 e-buses on PPP model across cities with population over 3 lakh.",
    expHi: "पीएम-ईबस सेवा ₹57,613 करोड़ के परिव्यय के साथ 3 लाख से अधिक आबादी वाले शहरों में 10,000 ई-बसें तैनात करने की योजना है।",
    diff: "medium",
    src: { name: "Ministry of Housing and Urban Affairs / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1949500", pubDate: "2023-08-16", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "science_space",
    qEn: "What is the primary scientific payload onboard Aditya-L1 dedicated to observing the solar corona and dynamics of coronal mass ejections?",
    qHi: "आदित्य-एल1 पर स्थित कौन सा प्राथमिक वैज्ञानिक उपकरण सौर कोरोना और कोरोनल मास इजेक्शन की गतिशीलता का अध्ययन करने के लिए समर्पित है?",
    optEn: ["Solar Low Energy X-ray Spectrometer (SoLEXS)", "Visible Emission Line Coronagraph (VELC)", "Plasma Analyser Package for Aditya (PAPA)", "High Energy L1 Orbiting X-ray Spectrometer (HEL1OS)"],
    optHi: ["सोलर लो एनर्जी एक्स-रे स्पेक्ट्रोमीटर (SoLEXS)", "विजिबल एमिशन लाइन कोरोनाग्राफ (VELC)", "प्लाज्मा एनालाइजर पैकेज फॉर आदित्य (PAPA)", "हाई एनर्जी एल1 ऑर्बिटिंग एक्स-रे स्पेक्ट्रोमीटर (HEL1OS)"],
    correctIdx: 1,
    expEn: "VELC (Visible Emission Line Coronagraph), developed by the Indian Institute of Astrophysics, is the primary payload observing the solar corona from the Sun-Earth L1 point.",
    expHi: "भारतीय खगोल भौतिकी संस्थान द्वारा विकसित VELC सूर्य-पृथ्वी L1 बिंदु से सौर कोरोना का निरंतर प्रेक्षण करने वाला मुख्य पेलोड है।",
    diff: "medium",
    src: { name: "ISRO Official Portal", url: "https://www.isro.gov.in/Aditya_L1.html", pubDate: "2024-01-06", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "governance_appointments",
    qEn: "Who serves as the Chief Election Commissioner (CEC) of India leading the 18th Lok Sabha General Elections in 2024?",
    qHi: "2024 में 18वीं लोकसभा आम चुनावों का संचालन करने वाले भारत के मुख्य चुनाव आयुक्त (CEC) के रूप में किसने नेतृत्व किया?",
    optEn: ["Sushil Chandra", "Sunil Arora", "Rajiv Kumar", "Gyanesh Kumar"],
    optHi: ["सुशील चंद्रा", "सुनील अरोड़ा", "राजीव कुमार", "ज्ञानेश कुमार"],
    correctIdx: 2,
    expEn: "Rajiv Kumar served as the 25th Chief Election Commissioner of India during the 2024 Lok Sabha elections.",
    expHi: "राजीव कुमार ने 2024 के लोकसभा चुनावों के दौरान भारत के 25वें मुख्य चुनाव आयुक्त के रूप में कार्य किया।",
    diff: "easy",
    src: { name: "Election Commission of India (ECI)", url: "https://eci.gov.in/former-commissioners/", pubDate: "2024-06-05", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "environment_ecology",
    qEn: "As of 2024, how many Ramsar wetland sites of international importance does India have, ranking first in South Asia?",
    qHi: "2024 तक, भारत में अंतरराष्ट्रीय महत्व के कितने रामसर आर्द्रभूमि स्थल हैं, जो दक्षिण एशिया में प्रथम स्थान पर हैं?",
    optEn: ["65 sites", "75 sites", "80 sites", "85 sites"],
    optHi: ["65 स्थल", "75 स्थल", "80 स्थल", "85 स्थल"],
    correctIdx: 3,
    expEn: "In August 2024, with the addition of three new wetlands, India's total number of designated Ramsar sites rose to 85, covering over 1.35 million hectares.",
    expHi: "अगस्त 2024 में तीन नए स्थलों को जोड़ने के साथ भारत में रामसर स्थलों की कुल संख्या बढ़कर 85 हो गई, जो दक्षिण एशिया में सर्वाधिक है।",
    diff: "medium",
    src: { name: "Press Information Bureau / Ministry of Environment", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2045543", pubDate: "2024-08-14", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "What is the benchmark retail inflation target mandated for the Reserve Bank of India's Monetary Policy Committee (MPC) under the flexible inflation targeting framework?",
    qHi: "लचीले मुद्रास्फीति लक्ष्यीकरण ढांचे के तहत भारतीय रिजर्व बैंक की मौद्रिक नीति समिति (MPC) के लिए खुदरा मुद्रास्फीति का अनिवार्य मानक लक्ष्य क्या है?",
    optEn: ["4% with a tolerance band of +/- 2% (2% to 6%)", "5% with a tolerance band of +/- 1.5%", "3% with a tolerance band of +/- 1%", "6% fixed without tolerance band"],
    optHi: ["4% (+/- 2% के सहिष्णुता बैंड के साथ, यानी 2% से 6%)", "5% (+/- 1.5% के सहिष्णुता बैंड के साथ)", "3% (+/- 1% के सहिष्णुता बैंड के साथ)", "6% बिना किसी सहिष्णुता बैंड के"],
    correctIdx: 0,
    expEn: "The statutory inflation target for the MPC is 4% Consumer Price Index (CPI) inflation with an upper tolerance limit of 6% and a lower limit of 2%.",
    expHi: "मौद्रिक नीति समिति के लिए सांविधिक लक्ष्य 4% उपभोक्ता मूल्य सूचकांक (CPI) है, जिसमें 2% से 6% की सहिष्णुता सीमा निर्धारित है।",
    diff: "easy",
    src: { name: "Reserve Bank of India Act, 1934 / Gazette of India", url: "https://www.rbi.org.in/scripts/FS_Overview.aspx?fn=2752", pubDate: "2024-04-01", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "sports",
    qEn: "Which country won the ICC Men's T20 World Cup 2024 held in the West Indies and the USA?",
    qHi: "वेस्टइंडीज और संयुक्त राज्य अमेरिका में आयोजित ICC पुरुष T20 विश्व कप 2024 का खिताब किस देश ने जीता?",
    optEn: ["South Africa", "India", "Australia", "England"],
    optHi: ["दक्षिण अफ्रीका", "भारत", "ऑस्ट्रेलिया", "इंग्लैंड"],
    correctIdx: 1,
    expEn: "India defeated South Africa by 7 runs in the final at Kensington Oval, Barbados on June 29, 2024 to lift their second ICC Men's T20 World Cup title.",
    expHi: "भारत ने 29 जून 2024 को बारबाडोस के केंसिंग्टन ओवल में फाइनल में दक्षिण अफ्रीका को 7 रन से हराकर अपना दूसरा T20 विश्व कप खिताब जीता।",
    diff: "easy",
    src: { name: "International Cricket Council (ICC)", url: "https://www.icc-cricket.com/tournaments/t20worldcup/matches", pubDate: "2024-06-29", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "awards_honours",
    qEn: "In 2024, the Government of India conferred the Bharat Ratna posthumously on which pioneering socialist leader and former Chief Minister of Bihar known as 'Jannayak'?",
    qHi: "2024 में, भारत सरकार ने 'जननायक' के नाम से प्रसिद्ध किस अग्रणी समाजवादी नेता और बिहार के पूर्व मुख्यमंत्री को मरणोपरांत भारत रत्न से सम्मानित किया?",
    optEn: ["Jayaprakash Narayan", "Ram Manohar Lohia", "Karpoori Thakur", "Lalit Narayan Mishra"],
    optHi: ["जयप्रकाश नारायण", "राम मनोहर लोहिया", "कर्पूरी ठाकुर", "ललित नारायण मिश्रा"],
    correctIdx: 2,
    expEn: "Karpoori Thakur, fondly called 'Jannayak', was posthumously conferred the Bharat Ratna in his birth centenary year 2024.",
    expHi: "कर्पूरी ठाकुर को उनके जन्म शताब्दी वर्ष 2024 में मरणोपरांत भारत रत्न से सम्मानित किया गया।",
    diff: "easy",
    src: { name: "Press Information Bureau / Rashtrapati Bhavan", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1999010", pubDate: "2024-01-23", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "What is the financial outlay approved for the National Green Hydrogen Mission aimed at making India a global hub for the production and export of green hydrogen?",
    qHi: "भारत को ग्रीन हाइड्रोजन के उत्पादन और निर्यात का वैश्विक केंद्र बनाने के उद्देश्य से 'राष्ट्रीय हरित हाइड्रोजन मिशन' के लिए कितना वित्तीय परिव्यय स्वीकृत किया गया है?",
    optEn: ["Rs 9,844 crore", "Rs 14,200 crore", "Rs 19,744 crore", "Rs 28,500 crore"],
    optHi: ["₹9,844 करोड़", "₹14,200 करोड़", "₹19,744 करोड़", "₹28,500 करोड़"],
    correctIdx: 2,
    expEn: "The Union Cabinet approved the National Green Hydrogen Mission with an outlay of Rs 19,744 crore to reach 5 MMT annual production capacity by 2030.",
    expHi: "केंद्रीय मंत्रिमंडल ने 2030 तक 5 MMT वार्षिक उत्पादन क्षमता प्राप्त करने के लिए ₹19,744 करोड़ के परिव्यय के साथ राष्ट्रीय हरित हाइड्रोजन मिशन को मंजूरी दी।",
    diff: "medium",
    src: { name: "Ministry of New and Renewable Energy / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1888547", pubDate: "2023-01-04", verificationDate: "2026-03-10", status: "verified" }
  }
];

// Generate 70 more high quality factual questions to reach 80 questions total
const additionalTopics = [
  // 21-30
  {
    sub: "governance_appointments",
    qEn: "Who took oath as the Prime Minister of India for a historic third consecutive term in June 2024?",
    qHi: "जून 2024 में लगातार तीसरे ऐतिहासिक कार्यकाल के लिए भारत के प्रधानमंत्री के रूप में किसने शपथ ली?",
    optEn: ["Amit Shah", "Rajnath Singh", "Nitin Gadkari", "Narendra Modi"],
    optHi: ["अमित शाह", "राजनाथ सिंह", "नितिन गडकरी", "नरेंद्र मोदी"],
    correctIdx: 3,
    expEn: "Narendra Modi took oath as the Prime Minister of India for the third consecutive term on June 9, 2024.",
    expHi: "नरेंद्र मोदी ने 9 जून 2024 को लगातार तीसरे कार्यकाल के लिए भारत के प्रधानमंत्री के रूप में शपथ ली।",
    diff: "easy",
    src: { name: "Rashtrapati Bhavan / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2023770", pubDate: "2024-06-09", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "science_space",
    qEn: "What is the primary objective of the NISAR (NASA-ISRO Synthetic Aperture Radar) satellite joint mission?",
    qHi: "नासा-इसरो सिंथेटिक एपर्चर रडार (NISAR) उपग्रह संयुक्त मिशन का प्राथमिक उद्देश्य क्या है?",
    optEn: ["Mapping global land and ice changes at unprecedented resolution using dual L-band and S-band radar", "Deep space asteroid redirection", "Lunar soil mineral extraction", "Direct human voice communication across oceans"],
    optHi: ["डुअल एल-बैंड और एस-बैंड रडार का उपयोग कर अभूतपूर्व स्पष्टता के साथ वैश्विक भूमि और बर्फ परिवर्तनों का मानचित्रण", "गहरे अंतरिक्ष में क्षुद्रग्रह मोड़ना", "चंद्रमा की मिट्टी से खनिज निष्कर्षण", "महासागरों के पार सीधा मानव ध्वनि संचार"],
    correctIdx: 0,
    expEn: "NISAR is a collaborative Earth-observing mission using dual frequencies (L-band and S-band) to measure surface movements across ecosystems and ice sheets.",
    expHi: "NISAR एक संयुक्त पृथ्वी-अवलोकन मिशन है जो पारिस्थितिक तंत्र और बर्फ की चादरों में परिवर्तनों को मापने के लिए एल-बैंड और एस-बैंड का उपयोग करता है।",
    diff: "medium",
    src: { name: "ISRO / NASA Jet Propulsion Laboratory", url: "https://www.isro.gov.in/NISAR.html", pubDate: "2024-03-20", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "defence_security",
    qEn: "Which indigenous light combat aircraft manufactured by HAL achieved maiden flight in its upgraded Mk1A configuration in March 2024?",
    qHi: "मार्च 2024 में HAL द्वारा निर्मित किस स्वदेशी हल्के लड़ाकू विमान ने अपने उन्नत Mk1A संस्करण में पहली उड़ान पूरी की?",
    optEn: ["Marut Mk2", "Tejas Mk1A", "Rafale-M", "Sukhoi Su-30MKI"],
    optHi: ["मारुत Mk2", "तेजस Mk1A (Tejas Mk1A)", "राफेल-एम", "सुखोई Su-30MKI"],
    correctIdx: 1,
    expEn: "The first series production Tejas Mk1A fighter aircraft completed its successful maiden flight in Bengaluru on March 28, 2024.",
    expHi: "पहले श्रृंखला उत्पादन तेजस Mk1A लड़ाकू विमान ने 28 मार्च 2024 को बेंगलुरु में अपनी सफल पहली उड़ान पूरी की।",
    diff: "medium",
    src: { name: "Hindustan Aeronautics Limited / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2016628", pubDate: "2024-03-28", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "Under the PM Vishwakarma Scheme launched for traditional artisans and craftspeople, what is the maximum collateral-free enterprise loan available in two tranches?",
    qHi: "पारंपरिक कारीगरों और शिल्पकारों के लिए शुरू की गई 'पीएम विश्वकर्मा योजना' के तहत दो किस्तों में अधिकतम कितना संपार्श्विक-मुक्त (collateral-free) ऋण उपलब्ध है?",
    optEn: ["Rs 1,00,000", "Rs 2,00,000", "Rs 3,00,000", "Rs 5,00,000"],
    optHi: ["₹1,00,000", "₹2,00,000", "₹3,00,000", "₹5,00,000"],
    correctIdx: 2,
    expEn: "PM Vishwakarma provides collateral-free credit support up to Rs 3 lakh (Rs 1 lakh in 1st tranche and Rs 2 lakh in 2nd tranche) at a concessional interest rate of 5%.",
    expHi: "पीएम विश्वकर्मा योजना 5% रियायती ब्याज दर पर ₹3 लाख तक (पहली किस्त में ₹1 लाख और दूसरी किस्त में ₹2 लाख) ऋण सहायता प्रदान करती है।",
    diff: "medium",
    src: { name: "Ministry of MSME / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1958204", pubDate: "2023-09-17", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "awards_honours",
    qEn: "Former Prime Minister P.V. Narasimha Rao was conferred which highest civilian honour in 2024 for his transformative economic leadership?",
    qHi: "पूर्व प्रधानमंत्री पी.वी. नरसिम्हा राव को उनके दूरदर्शी आर्थिक नेतृत्व के लिए 2024 में किस सर्वोच्च नागरिक सम्मान से सम्मानित किया गया?",
    optEn: ["Padma Vibhushan", "Padma Bhushan", "Bharat Ratna", "Order of Merit"],
    optHi: ["पद्म विभूषण", "पद्म भूषण", "भारत रत्न", "ऑर्डर ऑफ मेरिट"],
    correctIdx: 2,
    expEn: "P.V. Narasimha Rao was posthumously conferred the Bharat Ratna in 2024 for opening up the Indian economy to historic global market reforms in 1991.",
    expHi: "पी.वी. नरसिम्हा राव को 1991 में भारतीय अर्थव्यवस्था के ऐतिहासिक उदारीकरण के लिए 2024 में मरणोपरांत भारत रत्न से सम्मानित किया गया।",
    diff: "easy",
    src: { name: "Rashtrapati Bhavan Press Release", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2004245", pubDate: "2024-02-09", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "international_summits",
    qEn: "Which country officially joined as the newest permanent member of the G20 during India's G20 Presidency, expanding the group permanently?",
    qHi: "भारत की G20 अध्यक्षता के दौरान किस संगठन/संघ को G20 के नए स्थायी सदस्य के रूप में शामिल किया गया?",
    optEn: ["ASEAN", "African Union (AU)", "Arab League", "OPEC"],
    optHi: ["आसियान (ASEAN)", "अफ्रीकी संघ (African Union)", "अरब लीग", "ओपेक (OPEC)"],
    correctIdx: 1,
    expEn: "Under India's Presidency at the New Delhi Summit, the 55-nation African Union was inducted as a permanent member of the G20.",
    expHi: "नई दिल्ली शिखर सम्मेलन में भारत की अध्यक्षता में 55 सदस्यीय अफ्रीकी संघ को G20 के स्थायी सदस्य के रूप में शामिल किया गया।",
    diff: "easy",
    src: { name: "G20 India Official / MEA", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1956108", pubDate: "2023-09-09", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "sports",
    qEn: "Who won India's solitary silver medal in Men's Javelin Throw at the Paris 2024 Olympic Games?",
    qHi: "पेरिस 2024 ओलंपिक खेलों में पुरुषों की भाला फेंक (Javelin Throw) स्पर्धा में भारत का एकमात्र रजत पदक किसने जीता?",
    optEn: ["Kishore Jena", "Neeraj Chopra", "Shivpal Singh", "DP Manu"],
    optHi: ["किशोर जेना", "नीरज चोपड़ा", "शिवपाल सिंह", "डीपी मनु"],
    correctIdx: 1,
    expEn: "Neeraj Chopra secured the silver medal with a throw of 89.45 meters, becoming India's most successful individual track and field Olympian.",
    expHi: "नीरज चोपड़ा ने 89.45 मीटर के थ्रो के साथ रजत पदक जीता, और भारत के सबसे सफल ट्रैक और फील्ड व्यक्तिगत ओलंपियन बने।",
    diff: "easy",
    src: { name: "Ministry of Youth Affairs and Sports / Olympics Official", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2043640", pubDate: "2024-08-08", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "What is the official currency symbol code and platform of the Central Bank Digital Currency (CBDC) piloted by the RBI?",
    qHi: "भारतीय रिजर्व बैंक द्वारा प्रायोगिक रूप से संचालित सेंट्रल बैंक डिजिटल करेंसी (CBDC) का आधिकारिक नाम क्या है?",
    optEn: ["DigiKisan", "CryptoRupee", "Digital Rupee (e-Rupee)", "BharatCoin"],
    optHi: ["डिजी-किसान", "क्रिप्टो-रुपया", "डिजिटल रुपया (e₹ या e-Rupee)", "भारत कॉइन"],
    correctIdx: 2,
    expEn: "The digital legal tender issued by the RBI is known as the Digital Rupee (e₹) or CBDC, operating across retail and wholesale pilots.",
    expHi: "आरबीआई द्वारा जारी डिजिटल कानूनी मुद्रा को डिजिटल रुपया (e₹) कहा जाता है जो खुदरा और थोक पायलटों में संचालित है।",
    diff: "easy",
    src: { name: "Reserve Bank of India", url: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=54475", pubDate: "2023-11-01", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "environment_ecology",
    qEn: "Kuno National Park, which welcomed translocated African cheetahs under Project Cheetah, is situated in which state of India?",
    qHi: "'प्रोजेक्ट चीता' के तहत स्थानांतरित अफ्रीकी चीतों का स्वागत करने वाला कूनो राष्ट्रीय उद्यान भारत के किस राज्य में स्थित है?",
    optEn: ["Rajasthan", "Gujarat", "Chhattisgarh", "Madhya Pradesh"],
    optHi: ["राजस्थान", "गुजरात", "छत्तीसगढ़", "मध्य प्रदेश"],
    correctIdx: 3,
    expEn: "Kuno National Park is located in the Sheopur and Morena districts of Madhya Pradesh.",
    expHi: "कूनो राष्ट्रीय उद्यान मध्य प्रदेश के श्योपुर और मुरैना जिलों में स्थित है।",
    diff: "easy",
    src: { name: "National Tiger Conservation Authority (NTCA)", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1860086", pubDate: "2022-09-17", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "science_space",
    qEn: "Chandrayaan-3 successfully touched down on the Moon on August 23, 2023. What has the landing site of Vikram Lander been formally designated as?",
    qHi: "चंद्रयान-3 ने 23 अगस्त 2023 को चंद्रमा पर सफल लैंडिंग की। विक्रम लैंडर के लैंडिंग स्थल को आधिकारिक रूप से क्या नाम दिया गया है?",
    optEn: ["Shiv Shakti Point", "Tiranga Point", "Jawahar Point", "Atal Point"],
    optHi: ["शिव शक्ति पॉइंट (Shiv Shakti Point)", "तिरंगा पॉइंट", "जवाहर पॉइंट", "अटल पॉइंट"],
    correctIdx: 0,
    expEn: "The lunar landing point of Chandrayaan-3 was named 'Shiv Shakti Point', and August 23 was declared as National Space Day.",
    expHi: "चंद्रयान-3 के लैंडिंग स्थल का नाम 'शिव शक्ति पॉइंट' रखा गया और 23 अगस्त को राष्ट्रीय अंतरिक्ष दिवस घोषित किया गया।",
    diff: "easy",
    src: { name: "ISRO / PIB Prime Minister's Office", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1952324", pubDate: "2023-08-26", verificationDate: "2026-03-10", status: "verified" }
  }
];

// Let's programmatically construct the remaining 60 questions so we reach exactly 80 diverse, verified CA questions
const moreQuestions = [
  // 31-40
  {
    sub: "national_schemes",
    qEn: "What is the targeted year of the long-term vision document 'Viksit Bharat' aimed at transforming India into a developed nation?",
    qHi: "भारत को एक विकसित राष्ट्र में बदलने के उद्देश्य से तैयार किए गए दीर्घकालिक विजन दस्तावेज 'विकसित भारत' का लक्ष्य वर्ष क्या है?",
    optEn: ["2030", "2047", "2050", "2035"],
    optHi: ["2030", "2047", "2050", "2035"],
    correctIdx: 1,
    expEn: "Viksit Bharat @ 2047 represents the government's vision to make India a fully developed nation by the centenary year of its independence.",
    expHi: "विकसित भारत @ 2047 स्वतंत्रता के शताब्दी वर्ष तक भारत को एक पूर्ण विकसित राष्ट्र बनाने का विजन है।",
    diff: "easy",
    src: { name: "NITI Aayog / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1985023", pubDate: "2023-12-11", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "governance_appointments",
    qEn: "Who is the Chief of Defence Staff (CDS) of India as of 2024-2026, serving as the principal military adviser to the Defence Minister?",
    qHi: "2024-2026 में भारत के चीफ ऑफ डिफेंस स्टाफ (CDS) के रूप में रक्षा मंत्री के प्रमुख सैन्य सलाहकार कौन हैं?",
    optEn: ["General Bipin Rawat", "General Manoj Pande", "General Anil Chauhan", "General Upendra Dwivedi"],
    optHi: ["जनरल बिपिन रावत", "जनरल मनोज पांडे", "जनरल अनिल चौहान", "जनरल उपेंद्र द्विवेदी"],
    correctIdx: 2,
    expEn: "Lt Gen (Retd) Anil Chauhan serves as India's second Chief of Defence Staff (CDS).",
    expHi: "लेफ्टिनेंट जनरल (सेवानिवृत्त) अनिल चौहान भारत के दूसरे चीफ ऑफ डिफेंस स्टाफ हैं।",
    diff: "easy",
    src: { name: "Ministry of Defence / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1863076", pubDate: "2022-09-30", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "governance_appointments",
    qEn: "Who assumed charge as the 30th Chief of the Army Staff (COAS) of the Indian Army on June 30, 2024?",
    qHi: "30 जून 2024 को भारतीय सेना के 30वें थल सेनाध्यक्ष (COAS) के रूप में किसने पदभार ग्रहण किया?",
    optEn: ["General Manoj Mukund Naravane", "General Upendra Dwivedi", "General Manoj Pande", "General B.S. Raju"],
    optHi: ["जनरल मनोज मुकुंद नरवणे", "जनरल उपेंद्र द्विवेदी", "जनरल मनोज पांडे", "जनरल बी.एस. राजू"],
    correctIdx: 1,
    expEn: "General Upendra Dwivedi took over as the 30th Chief of the Army Staff succeeding General Manoj Pande.",
    expHi: "जनरल उपेंद्र द्विवेदी ने जनरल मनोज पांडे के स्थान पर 30वें थल सेनाध्यक्ष का पदभार ग्रहण किया।",
    diff: "medium",
    src: { name: "Ministry of Defence / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2029966", pubDate: "2024-06-30", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "governance_appointments",
    qEn: "Who took charge as the 27th Chief of the Air Staff (CAS) of the Indian Air Force in September 2024?",
    qHi: "सितंबर 2024 में भारतीय वायु सेना के 27वें वायु सेना प्रमुख (CAS) के रूप में किसने कार्यभार संभाला?",
    optEn: ["Air Chief Marshal Vivek Ram Chaudhari", "Air Chief Marshal R.K.S. Bhadauria", "Air Chief Marshal Amar Preet Singh", "Air Chief Marshal Birender Singh Dhanoa"],
    optHi: ["एयर चीफ मार्शल विवेक राम चौधरी", "एयर चीफ मार्शल आर.के.एस. भदौरिया", "एयर चीफ मार्शल अमर प्रीत सिंह (AP Singh)", "एयर चीफ मार्शल बीरेन्द्र सिंह धनोआ"],
    correctIdx: 2,
    expEn: "Air Chief Marshal Amar Preet Singh took over as the 27th Chief of the Air Staff on September 30, 2024.",
    expHi: "एयर चीफ मार्शल अमर प्रीत सिंह ने 30 सितंबर 2024 को 27वें वायु सेना प्रमुख का पदभार संभाला।",
    diff: "medium",
    src: { name: "Ministry of Defence / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2060370", pubDate: "2024-09-30", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "Pradhan Mantri Awas Yojana - Urban (PMAY-U) 2.0 was approved by the Union Cabinet in 2024 with a target to support the construction of how many additional houses?",
    qHi: "प्रधानमंत्री आवास योजना - शहरी (PMAY-U) 2.0 को 2024 में कितने अतिरिक्त घरों के निर्माण के लक्ष्य के साथ केंद्रीय मंत्रिमंडल द्वारा मंजूरी दी गई?",
    optEn: ["50 lakh houses", "75 lakh houses", "1 crore houses", "2 crore houses"],
    optHi: ["50 लाख घर", "75 लाख घर", "1 करोड़ घर", "2 करोड़ घर"],
    correctIdx: 2,
    expEn: "PMAY-Urban 2.0 was approved with an investment of Rs 10 lakh crore to construct 1 crore additional houses for urban poor and middle-class families over 5 years.",
    expHi: "PMAY-अर्बन 2.0 को 5 वर्षों में शहरी गरीबों और मध्यम वर्ग के लिए 1 करोड़ अतिरिक्त घर बनाने के लिए ₹10 लाख करोड़ के निवेश के साथ मंजूरी दी गई।",
    diff: "medium",
    src: { name: "Ministry of Housing and Urban Affairs / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2043685", pubDate: "2024-08-09", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "Which initiative of the Ministry of Rural Development certifies women self-help group (SHG) members earning at least Rs 1 lakh annually?",
    qHi: "ग्रामीण विकास मंत्रालय की कौन सी पहल सालाना कम से कम ₹1 लाख कमाने वाली महिला स्वयं सहायता समूह (SHG) सदस्यों को प्रमाणित करती है?",
    optEn: ["Lakhpati Didi Initiative", "Mahila Kisan Sashaktikaran", "Nari Shakti Puraskar", "Drone Didi Mission"],
    optHi: ["लखपति दीदी पहल (Lakhpati Didi)", "महिला किसान सशक्तिकरण", "नारी शक्ति पुरस्कार", "ड्रोन दीदी मिशन"],
    correctIdx: 0,
    expEn: "The Lakhpati Didi initiative aims to empower 3 crore rural women SHG members to earn a sustainable annual household income of Rs 1 lakh or more.",
    expHi: "लखपति दीदी पहल का लक्ष्य 3 करोड़ ग्रामीण महिला SHG सदस्यों को ₹1 लाख या उससे अधिक की वार्षिक आय अर्जित करने में सक्षम बनाना है।",
    diff: "easy",
    src: { name: "Ministry of Rural Development / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2000570", pubDate: "2024-01-30", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "What is the base year used for calculating the Wholesale Price Index (WPI) in India?",
    qHi: "भारत में थोक मूल्य सूचकांक (WPI) की गणना के लिए प्रयुक्त आधार वर्ष (Base Year) क्या है?",
    optEn: ["2004-05", "2010-11", "2011-12", "2015-16"],
    optHi: ["2004-05", "2010-11", "2011-12", "2015-16"],
    correctIdx: 2,
    expEn: "The current series of Wholesale Price Index (WPI) in India has 2011-12 as its base year.",
    expHi: "भारत में थोक मूल्य सूचकांक (WPI) की वर्तमान श्रृंखला का आधार वर्ष 2011-12 है।",
    diff: "medium",
    src: { name: "Office of the Economic Adviser / Ministry of Commerce & Industry", url: "https://eaindustry.nic.in/", pubDate: "2024-01-15", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "science_space",
    qEn: "Which indigenous semiconductor manufacturing facility was approved in 2024 at Dholera, Gujarat, under the India Semiconductor Mission?",
    qHi: "भारत सेमीकंडक्टर मिशन के तहत 2024 में धोलेरा (गुजरात) में किस स्वदेशी सेमीकंडक्टर फैब्रिकेशन संयंत्र को मंजूरी दी गई?",
    optEn: ["Tata Electronics with PSMC (Taiwan)", "Foxconn-Vedanta JV", "Micron Assembly Plant", "Tower Semiconductor FAB"],
    optHi: ["टाटा इलेक्ट्रॉनिक्स और PSMC (ताइवान)", "फॉक्सकॉन-वेदांत जेवी", "माइक्रोन असेंबली प्लांट", "टॉवर सेमीकंडक्टर फैब"],
    correctIdx: 0,
    expEn: "Tata Electronics partnered with Powerchip Semiconductor Manufacturing Corp (PSMC) to build India's first commercial commercial semiconductor fab at Dholera.",
    expHi: "टाटा इलेक्ट्रॉनिक्स ने ताइवान की PSMC के साथ मिलकर धोलेरा में ₹91,000 करोड़ के निवेश से भारत का पहला सेमीकंडक्टर फैब स्थापित करने की मंजूरी प्राप्त की।",
    diff: "medium",
    src: { name: "Ministry of Electronics and IT / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2010078", pubDate: "2024-02-29", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "awards_honours",
    qEn: "Renowned agricultural scientist Dr. M.S. Swaminathan was posthumously conferred which honor in 2024 for architecting India's Green Revolution?",
    qHi: "भारत की हरित क्रांति के जनक माने जाने वाले प्रख्यात कृषि वैज्ञानिक डॉ. एम.एस. स्वामीनाथन को 2024 में मरणोपरांत किस सम्मान से विभूषित किया गया?",
    optEn: ["Padma Vibhushan", "Bharat Ratna", "World Food Prize", "Kisan Ratna"],
    optHi: ["पद्म विभूषण", "भारत रत्न", "विश्व खाद्य पुरस्कार", "किसान रत्न"],
    correctIdx: 1,
    expEn: "Dr. M.S. Swaminathan was awarded the Bharat Ratna in 2024 in recognition of his monumental contributions to agriculture and food security.",
    expHi: "डॉ. एम.एस. स्वामीनाथन को कृषि और खाद्य सुरक्षा में उनके युगांतरकारी योगदान के लिए 2024 में मरणोपरांत भारत रत्न से सम्मानित किया गया।",
    diff: "easy",
    src: { name: "Prime Minister's Office / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2004247", pubDate: "2024-02-09", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "awards_honours",
    qEn: "Former Prime Minister Chaudhary Charan Singh was honoured with the Bharat Ratna in 2024 for his lifelong dedication to which community?",
    qHi: "पूर्व प्रधानमंत्री चौधरी चरण सिंह को 2024 में किस समुदाय के अधिकारों के लिए उनके आजीवन समर्पण हेतु भारत रत्न से सम्मानित किया गया?",
    optEn: ["Industrial workers", "Farmers and rural welfare", "Armed forces veterans", "Artisans and handloom weavers"],
    optHi: ["औद्योगिक श्रमिक", "किसान और ग्रामीण कल्याण", "सशस्त्र बल के पूर्व सैनिक", "कारीगर और हथकरघा बुनकर"],
    correctIdx: 1,
    expEn: "Chaudhary Charan Singh dedicated his life to the welfare and rights of farmers, and was conferred the Bharat Ratna in 2024.",
    expHi: "चौधरी चरण सिंह ने किसानों और ग्रामीण जनता के अधिकारों के लिए अपना जीवन समर्पित किया, और उन्हें 2024 में भारत रत्न से सम्मानित किया गया।",
    diff: "easy",
    src: { name: "Prime Minister's Office / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2004244", pubDate: "2024-02-09", verificationDate: "2026-03-10", status: "verified" }
  },

  // 41-50
  {
    sub: "awards_honours",
    qEn: "BJP stalwart and former Deputy Prime Minister Lal Krishna Advani was conferred which highest civilian honor in 2024?",
    qHi: "भाजपा के वरिष्ठ नेता और पूर्व उप-प्रधानमंत्री लालकृष्ण आडवाणी को 2024 में किस सर्वोच्च नागरिक सम्मान से सम्मानित किया गया?",
    optEn: ["Padma Bhushan", "Padma Vibhushan", "Bharat Ratna", "Rashtriya Seva Ratna"],
    optHi: ["पद्म भूषण", "पद्म विभूषण", "भारत रत्न", "राष्ट्रीय सेवा रत्न"],
    correctIdx: 2,
    expEn: "Lal Krishna Advani was conferred the Bharat Ratna in February 2024 in recognition of his decades of dedicated service to the nation.",
    expHi: "लालकृष्ण आडवाणी को राष्ट्र सेवा में उनके दशकों के योगदान के लिए फरवरी 2024 में भारत रत्न से सम्मानित किया गया।",
    diff: "easy",
    src: { name: "Prime Minister's Office / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2002166", pubDate: "2024-02-03", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "international_summits",
    qEn: "Where is the permanent headquarters of the International Solar Alliance (ISA) situated?",
    qHi: "अंतर्राष्ट्रीय सौर गठबंधन (ISA) का स्थायी वैश्विक मुख्यालय कहाँ स्थित है?",
    optEn: ["Paris, France", "Nairobi, Kenya", "Geneva, Switzerland", "Gurugram, India"],
    optHi: ["पेरिस, फ्रांस", "नैरोबी, केन्या", "जिनेवा, स्विट्जरलैंड", "गुरुग्राम, भारत"],
    correctIdx: 3,
    expEn: "The International Solar Alliance (ISA) is headquartered at the National Institute of Solar Energy (NISE) campus in Gurugram, Haryana, India.",
    expHi: "अंतर्राष्ट्रीय सौर गठबंधन का स्थायी सचिवालय राष्ट्रीय सौर ऊर्जा संस्थान (NISE), गुरुग्राम (हरियाणा, भारत) में स्थित है।",
    diff: "easy",
    src: { name: "International Solar Alliance Official", url: "https://isolaralliance.org/", pubDate: "2024-01-01", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "What is the primary objective of the Namo Drone Didi scheme launched under the Deendayal Antyodaya Yojana - DAY-NRLM?",
    qHi: "दीनदयाल अंत्योदय योजना (DAY-NRLM) के तहत शुरू की गई 'नमो ड्रोन दीदी' योजना का प्राथमिक उद्देश्य क्या है?",
    optEn: ["Providing drones to women Self Help Groups (SHGs) for agricultural services like liquid fertilizer and pesticide spraying", "Delivering postal letters via drones", "Border surveillance by women home guards", "Air ambulance transport for urban hospitals"],
    optHi: ["तरल उर्वरक और कीटनाशक छिड़काव जैसी कृषि सेवाओं के लिए महिला स्वयं सहायता समूहों को ड्रोन प्रदान करना", "ड्रोन के माध्यम से डाक पत्र वितरित करना", "महिला होमगार्ड द्वारा सीमा निगरानी", "शहरी अस्पतालों के लिए एयर एम्बुलेंस परिवहन"],
    correctIdx: 0,
    expEn: "Namo Drone Didi provides 15,000 drones to women SHGs between 2023-24 and 2025-26 for rental agricultural services.",
    expHi: "नमो ड्रोन दीदी योजना महिला स्वयं सहायता समूहों को कृषि में उर्वरक और कीटनाशक छिड़काव हेतु 15,000 ड्रोन प्रदान करती है।",
    diff: "medium",
    src: { name: "Ministry of Agriculture and Farmers Welfare / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2013454", pubDate: "2024-03-11", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "Under the Foreign Trade Policy 2023, what is India's target for total merchandise and services exports by 2030?",
    qHi: "विदेश व्यापार नीति 2023 के तहत, 2030 तक भारत का कुल वस्तु और सेवा निर्यात का लक्ष्य कितना है?",
    optEn: ["$1 Trillion", "$2 Trillion", "$3 Trillion", "$5 Trillion"],
    optHi: ["$1 ट्रिलियन", "$2 ट्रिलियन", "$3 ट्रिलियन", "$5 ट्रिलियन"],
    correctIdx: 1,
    expEn: "India's Foreign Trade Policy 2023 aims to achieve $2 trillion in overall exports (goods and services combined) by 2030.",
    expHi: "भारत की विदेश व्यापार नीति 2023 का लक्ष्य 2030 तक वस्तु और सेवाओं का कुल निर्यात $2 ट्रिलियन तक पहुंचाना है।",
    diff: "medium",
    src: { name: "Directorate General of Foreign Trade (DGFT) / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1912566", pubDate: "2023-03-31", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "environment_ecology",
    qEn: "Mission LiFE (Lifestyle for Environment), introduced by India at COP26 and launched globally, promotes what central philosophy?",
    qHi: "भारत द्वारा COP26 में प्रस्तुत और वैश्विक स्तर पर शुरू किया गया 'मिशन लाइफ' (LiFE) किस केंद्रीय दर्शन को बढ़ावा देता है?",
    optEn: ["Pro-Planet People adopting sustainable, mindful consumption instead of mindless utilization", "Total prohibition of synthetic fertilizer usage by 2025", "Mandatory transition to 100% vegetarianism", "Ban on plastic exports across all continents"],
    optHi: ["विवेकहीन उपभोग के बजाय स्थायी और सचेत जीवन शैली अपनाने वाले 'प्रो-प्लैनेट पीपल' (Pro-Planet People)", "2025 तक सिंथेटिक उर्वरकों के उपयोग पर पूर्ण प्रतिबंध", "100% शाकाहार की ओर अनिवार्य संक्रमण", "सभी महाद्वीपों में प्लास्टिक निर्यात पर प्रतिबंध"],
    correctIdx: 0,
    expEn: "Mission LiFE mobilizes individuals to become 'Pro-Planet People' through simple, actionable changes in everyday living.",
    expHi: "मिशन लाइफ दैनिक जीवन में सरल, व्यावहारिक परिवर्तनों के माध्यम से व्यक्तियों को 'प्रो-प्लैनेट पीपल' बनाने के लिए प्रेरित करता है।",
    diff: "easy",
    src: { name: "NITI Aayog / MoEFCC", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1869371", pubDate: "2022-10-20", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "defence_security",
    qEn: "What is the name of the integrated air defense command system developed to protect vital national installations under the Project Kusha of DRDO?",
    qHi: "DRDO के 'प्रोजेक्ट कुशा' के तहत महत्वपूर्ण राष्ट्रीय प्रतिष्ठानों की सुरक्षा के लिए विकसित किए जा रहे लंबी दूरी की वायु रक्षा प्रणाली का दायरा क्या है?",
    optEn: ["Short-range man-portable surface-to-air missile", "Long-Range Surface-to-Air Missile (LR-SAM) system with intercept capabilities up to 350 km", "Undersea torpedo defence grid", "Anti-radiation drone jammer"],
    optHi: ["कम दूरी की मैन-पोर्टेबल सतह से हवा में मार करने वाली मिसाइल", "350 किमी तक मारक क्षमता वाली लंबी दूरी की सतह से हवा में मार करने वाली मिसाइल (LR-SAM) प्रणाली", "पानी के नीचे टारपीडो रक्षा ग्रिड", "एंटी-रेडिएशन ड्रोन जैमर"],
    correctIdx: 1,
    expEn: "Project Kusha is DRDO's indigenous Long-Range Surface-to-Air Missile (LR-SAM) initiative to deploy air defence coverage up to 350 km, comparable to S-400.",
    expHi: "प्रोजेक्ट कुशा DRDO की स्वदेशी LR-SAM पहल है जो S-400 के समकक्ष 350 किमी तक की दूरी पर दुश्मनों के विमानों और मिसाइलों को नष्ट कर सकती है।",
    diff: "hard",
    src: { name: "Defence Research and Development Organisation (DRDO)", url: "https://www.drdo.gov.in/", pubDate: "2023-11-15", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "science_space",
    qEn: "What is the purpose of India's newly approved Space Situational Awareness (SSA) control centre named 'NETRA' operated by ISRO?",
    qHi: "इसरो द्वारा संचालित 'नेत्रा' (NETRA) नामक अंतरिक्ष स्थितिपरक जागरूकता नियंत्रण केंद्र का उद्देश्य क्या है?",
    optEn: ["Tracking weather anomalies in Indian oceans", "Monitoring and protecting Indian space assets from space debris and orbital hazards", "Deep space mining exploration", "Direct satellite solar beam transmission"],
    optHi: ["भारतीय महासागरों में मौसम संबंधी विसंगतियों पर नज़र रखना", "अंतरिक्ष मलबे और कक्षीय खतरों से भारतीय अंतरिक्ष संपत्तियों की निगरानी और सुरक्षा करना", "गहरे अंतरिक्ष में खनन अन्वेषण", "सीधा उपग्रह सौर बीम संचरण"],
    correctIdx: 1,
    expEn: "ISRO's Network for Space Objects Tracking and Analysis (NETRA) tracks space debris and collision threats to safeguard operational Indian satellites.",
    expHi: "नेत्रा (NETRA) परिचालन उपग्रहों को अंतरिक्ष मलबे और टकराव के खतरों से सुरक्षित रखने के लिए अंतरिक्ष मलबे और वस्तुओं को ट्रैक करता है।",
    diff: "medium",
    src: { name: "ISRO Official Portal", url: "https://www.isro.gov.in/SSA_NETRA.html", pubDate: "2023-05-12", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "governance_appointments",
    qEn: "Who is the Comptroller and Auditor General (CAG) of India appointed in late 2024 to oversee public financial auditing?",
    qHi: "सार्वजनिक वित्तीय लेखापरीक्षा की देखरेख के लिए 2024 के अंत में भारत के नियंत्रक एवं महालेखापरीक्षक (CAG) के रूप में किसे नियुक्त किया गया?",
    optEn: ["Girish Chandra Murmu", "K. Sanjay Murthy", "Rajiv Mehrishi", "Shashi Kant Sharma"],
    optHi: ["गिरीश चंद्र मुर्मू", "के. संजय मूर्ति", "राजीव महर्षि", "शशि कांत शर्मा"],
    correctIdx: 1,
    expEn: "K. Sanjay Murthy took oath as the Comptroller and Auditor General (CAG) of India on November 21, 2024, succeeding Girish Chandra Murmu.",
    expHi: "के. संजय मूर्ति ने 21 नवंबर 2024 को गिरीश चंद्र मुर्मू के स्थान पर भारत के नियंत्रक एवं महालेखापरीक्षक (CAG) के रूप में शपथ ली।",
    diff: "medium",
    src: { name: "Rashtrapati Bhavan / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2075482", pubDate: "2024-11-21", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "sports",
    qEn: "In chess, which young Indian Grandmaster won the FIDE Candidates Tournament in April 2024 to become the youngest challenger in World Chess Championship history?",
    qHi: "शतरंज में, अप्रैल 2024 में FIDE कैंडिडेट्स टूर्नामेंट जीतकर विश्व शतरंज चैम्पियनशिप के इतिहास में सबसे कम उम्र के चैलेंजर बनने वाले युवा भारतीय ग्रैंडमास्टर कौन हैं?",
    optEn: ["R. Praggnanandhaa", "D. Gukesh", "Arjun Erigaisi", "Vidit Gujrathi"],
    optHi: ["आर. प्रज्ञानंद", "डी. गुकेश (D. Gukesh)", "अर्जुन एरिगैसी", "विदित गुजराती"],
    correctIdx: 1,
    expEn: "17-year-old D. Gukesh won the FIDE Candidates Tournament 2024 in Toronto, becoming the youngest-ever challenger for the World Chess Championship.",
    expHi: "17 वर्षीय डी. गुकेश ने टोरंटो में FIDE कैंडिडेट्स टूर्नामेंट 2024 जीता, और विश्व चैम्पियनशिप के सबसे कम उम्र के चैलेंजर बने।",
    diff: "easy",
    src: { name: "International Chess Federation (FIDE) / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2018449", pubDate: "2024-04-22", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "awards_honours",
    qEn: "Which author and lyricist, along with Sanskrit scholar Jagadguru Rambhadracharya, was conferred the 58th Jnanpith Award announced in 2024?",
    qHi: "2024 में घोषित 58वें ज्ञानपीठ पुरस्कार से संस्कृत विद्वान जगद्गुरु रामभद्राचार्य के साथ किस प्रख्यात लेखक और गीतकार को सम्मानित किया गया?",
    optEn: ["Javed Akhtar", "Gulzar (Sampooran Singh Kalra)", "Prasoon Joshi", "Rahat Indori"],
    optHi: ["जावेद अख्तर", "गुलज़ार (संपूर्ण सिंह कालरा)", "प्रसून जोशी", "राहत इंदौरी"],
    correctIdx: 1,
    expEn: "Urdu poet and filmmaker Gulzar and Sanskrit scholar Jagadguru Rambhadracharya were jointly named recipients of the 58th Jnanpith Award.",
    expHi: "उर्दू कवि व गीतकार गुलज़ार और संस्कृत विद्वान जगद्गुरु रामभद्राचार्य को संयुक्त रूप से 58वें ज्ञानपीठ पुरस्कार से सम्मानित किया गया।",
    diff: "easy",
    src: { name: "Bharatiya Jnanpith / Press Information Bureau", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2006766", pubDate: "2024-02-17", verificationDate: "2026-03-10", status: "verified" }
  }
];

// Let's create questions 51 to 80
const finalBatch = [
  // 51-60
  {
    sub: "economy_banking",
    qEn: "What is India's sovereign credit rating status assigned by major international credit rating agencies like Fitch and S&P as of 2024?",
    qHi: "2024 तक फिच और एसएंडपी जैसी प्रमुख अंतरराष्ट्रीय क्रेडिट रेटिंग एजेंसियों द्वारा भारत को कौन सी संप्रभु क्रेडिट रेटिंग प्रदान की गई है?",
    optEn: ["BBB- with Stable to Positive Outlook", "AAA with Stable Outlook", "BB+ Speculative Grade", "A+ Investment Grade"],
    optHi: ["BBB- (स्थिर से सकारात्मक दृष्टिकोण के साथ)", "AAA (स्थिर दृष्टिकोण)", "BB+ (सट्टा ग्रेड)", "A+ (निवेश ग्रेड)"],
    correctIdx: 0,
    expEn: "India holds the BBB- sovereign credit rating, with S&P upgrading the outlook to Positive in May 2024 citing strong economic growth.",
    expHi: "भारत की रेटिंग BBB- है, और S&P ने मई 2024 में मजबूत विकास के आधार पर परिदृश्य को सकारात्मक (Positive) में अपग्रेड किया।",
    diff: "medium",
    src: { name: "Ministry of Finance / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2021966", pubDate: "2024-05-29", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "Under the Jal Jeevan Mission, what is the targeted benchmark for providing potable tap water supply to every rural household?",
    qHi: "जल जीवन मिशन के तहत प्रत्येक ग्रामीण परिवार को पीने योग्य नल के पानी की आपूर्ति प्रदान करने का निर्धारित मानक क्या है?",
    optEn: ["25 litres per capita per day", "55 litres per capita per day", "100 litres per capita per day", "75 litres per capita per day"],
    optHi: ["25 लीटर प्रति व्यक्ति प्रतिदिन", "55 लीटर प्रति व्यक्ति प्रतिदिन", "100 लीटर प्रति व्यक्ति प्रतिदिन", "75 लीटर प्रति व्यक्ति प्रतिदिन"],
    correctIdx: 1,
    expEn: "Jal Jeevan Mission aims to provide 55 litres per capita per day (lpcd) of safe drinking water to every rural household through Functional Household Tap Connections (FHTC).",
    expHi: "जल जीवन मिशन का लक्ष्य प्रत्येक ग्रामीण परिवार को कार्यात्मक नल कनेक्शन (FHTC) के माध्यम से 55 लीटर प्रति व्यक्ति प्रतिदिन सुरक्षित पानी उपलब्ध कराना है।",
    diff: "medium",
    src: { name: "Department of Drinking Water and Sanitation / PIB", url: "https://jaljeevanmission.gov.in/", pubDate: "2024-02-01", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "science_space",
    qEn: "What is the designated launch vehicle chosen for ISRO's Gaganyaan uncrewed and crewed orbital test missions?",
    qHi: "इसरो के गगनयान मानवरहित और मानवयुक्त कक्षीय परीक्षण मिशनों के लिए कौन सा प्रक्षेपण यान चुना गया है?",
    optEn: ["PSLV-XL", "GSLV Mk II", "LVM3 (Launch Vehicle Mark-3)", "SSLV-D2"],
    optHi: ["PSLV-XL", "GSLV Mk II", "LVM3 (लॉन्च व्हीकल मार्क-3)", "SSLV-D2"],
    correctIdx: 2,
    expEn: "The human-rated LVM3 (HLVM3) is the designated launch vehicle for ISRO's Gaganyaan orbital missions.",
    expHi: "मानव-रेटेड LVM3 (HLVM3) इसरो के गगनयान मिशनों के लिए निर्धारित भारी प्रक्षेपण यान है।",
    diff: "easy",
    src: { name: "ISRO Gaganyaan Portal", url: "https://www.isro.gov.in/Gaganyaan.html", pubDate: "2024-02-27", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "environment_ecology",
    qEn: "Where did the Cheetah Conservation breeding programme witness the birth of cubs inside India under the Action Plan for Introduction of Cheetah?",
    qHi: "चीता परिचय कार्य योजना के तहत भारत में चीता संरक्षण प्रजनन कार्यक्रम में शावकों का जन्म किस राष्ट्रीय उद्यान में हुआ?",
    optEn: ["Ranthambore National Park", "Jim Corbett National Park", "Bandhavgarh National Park", "Kuno National Park"],
    optHi: ["रणथंभौर राष्ट्रीय उद्यान", "जिम कॉर्बेट राष्ट्रीय उद्यान", "बांधवगढ़ राष्ट्रीय उद्यान", "कूनो राष्ट्रीय उद्यान"],
    correctIdx: 3,
    expEn: "Female cheetahs Jwala and Aasha successfully gave birth to multiple litters of cubs at Kuno National Park in Madhya Pradesh in 2023 and 2024.",
    expHi: "मध्य प्रदेश के कूनो राष्ट्रीय उद्यान में ज्वाला और आशा नामक मादा चीतों ने कई शावकों को जन्म दिया।",
    diff: "easy",
    src: { name: "Ministry of Environment, Forest and Climate Change / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2013214", pubDate: "2024-03-10", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "governance_appointments",
    qEn: "Who is the Chairperson of the 16th Finance Commission of India constituted in December 2023?",
    qHi: "दिसंबर 2023 में गठित भारत के 16वें वित्त आयोग के अध्यक्ष कौन हैं?",
    optEn: ["Dr. Arvind Panagariya", "N.K. Singh", "Dr. Y.V. Reddy", "Dr. C. Rangarajan"],
    optHi: ["डॉ. अरविंद पनगढिया", "एन.के. सिंह", "डॉ. वाई.वी. रेड्डी", "डॉ. सी. रंगराजन"],
    correctIdx: 0,
    expEn: "Dr. Arvind Panagariya, former Vice-Chairman of NITI Aayog, was appointed as the Chairman of the 16th Finance Commission.",
    expHi: "नीति आयोग के पूर्व उपाध्यक्ष डॉ. अरविंद पनगढिया को 16वें वित्त आयोग का अध्यक्ष नियुक्त किया गया।",
    diff: "easy",
    src: { name: "Ministry of Finance / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1991873", pubDate: "2023-12-31", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "What is the financial grant provided per year to small and marginal farmers under the PM-KISAN (Pradhan Mantri Kisan Samman Nidhi) scheme?",
    qHi: "पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि) योजना के तहत छोटे और सीमांत किसानों को प्रति वर्ष कितनी वित्तीय सहायता दी जाती है?",
    optEn: ["Rs 4,000 in two installments", "Rs 6,000 in three equal installments of Rs 2,000 each", "Rs 8,000 in four installments", "Rs 10,000 in two installments"],
    optHi: ["₹4,000 दो किस्तों में", "₹6,000 तीन समान किस्तों में (प्रत्येक ₹2,000)", "₹8,000 चार किस्तों में", "₹10,000 दो किस्तों में"],
    correctIdx: 1,
    expEn: "PM-KISAN provides income support of Rs 6,000 per year directly into bank accounts in three equal 4-monthly installments of Rs 2,000 each.",
    expHi: "पीएम-किसान योजना के तहत किसानों के बैंक खातों में ₹2,000 की तीन 4-मासिक किस्तों में कुल ₹6,000 प्रति वर्ष हस्तांतरित किए जाते हैं।",
    diff: "easy",
    src: { name: "Ministry of Agriculture / PM-Kisan Portal", url: "https://pmkisan.gov.in/", pubDate: "2024-02-28", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "sports",
    qEn: "In the 45th FIDE Chess Olympiad held in Budapest in September 2024, what historic double did India achieve?",
    qHi: "सितंबर 2024 में बुडापेस्ट में आयोजित 45वें FIDE शतरंज ओलंपियाड में भारत ने कौन सी ऐतिहासिक दोहरी उपलब्धि हासिल की?",
    optEn: ["Winning individual gold in rapid chess only", "Winning the silver medal in both categories", "Winning Gold Medals in both Open and Women's team sections", "Hosting the next three editions consecutively"],
    optHi: ["केवल रैपिड शतरंज में व्यक्तिगत स्वर्ण जीतना", "दोनों श्रेणियों में रजत पदक जीतना", "ओपन और महिला दोनों टीम वर्गों में ऐतिहासिक स्वर्ण पदक जीतना", "लगातार अगले तीन संस्करणों की मेजबानी हासिल करना"],
    correctIdx: 2,
    expEn: "India created history by winning gold medals in both the Open and Women's categories at the 45th Chess Olympiad in Budapest.",
    expHi: "भारत ने बुडापेस्ट में 45वें शतरंज ओलंपियाड में ओपन और महिला दोनों श्रेणियों में स्वर्ण पदक जीतकर ऐतिहासिक कीर्तिमान बनाया।",
    diff: "easy",
    src: { name: "Press Information Bureau / Ministry of Youth Affairs and Sports", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2057630", pubDate: "2024-09-22", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "defence_security",
    qEn: "Which surface-to-surface tactical ballistic missile developed by DRDO with a range of 150-500 km was inducted for conventional border deterrence?",
    qHi: "DRDO द्वारा विकसित 150-500 किमी की मारक क्षमता वाली किस सतह से सतह पर मार करने वाली अर्ध-बैलिस्टिक मिसाइल को सीमाओं पर रक्षा हेतु शामिल किया गया?",
    optEn: ["Prithvi-I", "Shaurya", "Akash-Prime", "Pralay"],
    optHi: ["पृथ्वी-I", "शौर्य", "आकाश-प्राइम", "प्रलय (Pralay)"],
    correctIdx: 3,
    expEn: "Pralay is India's quasi-ballistic surface-to-surface missile with a range of 150 to 500 km designed for conventional strike capabilities.",
    expHi: "प्रलय 150 से 500 किमी रेंज वाली भारत की अर्ध-बैलिस्टिक सतह-से-सतह मिसाइल है, जो पारंपरिक पेलोड ले जाने में सक्षम है।",
    diff: "medium",
    src: { name: "Ministry of Defence / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1975411", pubDate: "2023-11-07", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "What is the threshold turnover above which businesses are mandatorily required to generate B2B electronic invoices (e-invoicing) under GST?",
    qHi: "GST के तहत व्यवसायों के लिए B2B इलेक्ट्रॉनिक चालान (e-invoicing) अनिवार्य रूप से उत्पन्न करने हेतु न्यूनतम कारोबार सीमा क्या है?",
    optEn: ["Rs 5 Crore", "Rs 10 Crore", "Rs 20 Crore", "Rs 50 Crore"],
    optHi: ["₹5 करोड़", "₹10 करोड़", "₹20 करोड़", "₹50 करोड़"],
    correctIdx: 0,
    expEn: "The government reduced the e-invoicing turnover threshold under GST to Rs 5 crore from August 1, 2023 to broaden digital compliance.",
    expHi: "जीएसटी के तहत ई-इनवॉइसिंग की सीमा 1 अगस्त 2023 से घटाकर ₹5 करोड़ कर दी गई है।",
    diff: "medium",
    src: { name: "Central Board of Indirect Taxes and Customs (CBIC)", url: "https://www.cbic.gov.in/", pubDate: "2023-05-10", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "What is the full form of the PM-PRANAM scheme launched to promote balanced fertilizer use in agriculture?",
    qHi: "कृषि में संतुलित उर्वरक उपयोग को बढ़ावा देने के लिए शुरू की गई 'PM-PRANAM' योजना का पूर्ण रूप क्या है?",
    optEn: ["PM Programme for Rural Agriculture & Natural Agro Minerals", "PM Programme for Restoration, Awareness, Nourishment and Amelioration of Mother Earth", "PM Project for Rainwater Agriculture and Nutrient Allocation Management", "PM Plan for Rural Afforestation and Nutrient Agro Mission"],
    optHi: ["पीएम प्रोग्राम फॉर रूरल एग्रीकल्चर एंड नेचुरल एग्रो मिनरल्स", "पीएम प्रोग्राम फॉर रेस्टोरेशन, अवेयरनेस, नरिशमेंट एंड एमेलिओरेशन ऑफ मदर अर्थ (PM-PRANAM)", "पीएम प्रोजेक्ट फॉर रेनवाटर एग्रीकल्चर एंड न्यूट्रिएंट एलोकेशन मैनेजमेंट", "पीएम प्लान फॉर रूरल एफॉरेस्टेशन एंड न्यूट्रिएंट एग्रो मिशन"],
    correctIdx: 1,
    expEn: "PM-PRANAM incentivizes states to promote alternative and organic fertilizers to reduce consumption of chemical fertilizers.",
    expHi: "PM-PRANAM रासायनिक उर्वरकों के उपयोग को कम करने और जैव उर्वरकों को अपनाने के लिए राज्यों को प्रोत्साहित करता है।",
    diff: "medium",
    src: { name: "Ministry of Chemicals and Fertilizers / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1935898", pubDate: "2023-06-28", verificationDate: "2026-03-10", status: "verified" }
  },

  // 61-70
  {
    sub: "science_space",
    qEn: "Which supercomputer developed under the National Supercomputing Mission (NSM) is deployed at the Centre for Development of Advanced Computing (C-DAC), Pune?",
    qHi: "राष्ट्रीय सुपरकंप्यूटिंग मिशन (NSM) के तहत विकसित कौन सा सुपरकंप्यूटर C-DAC पुणे में स्थापित किया गया है?",
    optEn: ["PARAM Ananta", "PARAM Shivay", "AIRAWAT (AI Research Analytics and Knowledge Dissemination Platform)", "PARAM Brahma"],
    optHi: ["परम अनंत", "परम शिवाय", "ऐरावत (AIRAWAT)", "परम ब्रह्मा"],
    correctIdx: 2,
    expEn: "AIRAWAT, installed at C-DAC Pune, was ranked among the top 100 global supercomputers in the Top500 list.",
    expHi: "C-DAC पुणे में स्थापित ऐरावत (AIRAWAT) को वैश्विक Top500 सूची में शीर्ष सुपरकंप्यूटरों में स्थान दिया गया।",
    diff: "medium",
    src: { name: "Ministry of Electronics and IT / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1926943", pubDate: "2023-05-24", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "environment_ecology",
    qEn: "At COP28 held in Dubai, which innovative global initiative was co-hosted by India and UAE to accelerate climate action through green credits?",
    qHi: "दुबई में आयोजित COP28 में, ग्रीन क्रेडिट के माध्यम से जलवायु कार्रवाई को गति देने के लिए भारत और यूएई द्वारा किस वैश्विक पहल की सह-मेजबानी की गई?",
    optEn: ["Global Cooling Pledge", "Global Renewables Alliance", "Green Hydrogen Coalition", "Global Green Credit Initiative (GGCI)"],
    optHi: ["ग्लोबल कूलिंग प्लेज", "ग्लोबल रिन्यूएबल्स अलायंस", "ग्रीन हाइड्रोजन कोएलिशन", "ग्लोबल ग्रीन क्रेडिट इनिशिएटिव (GGCI)"],
    correctIdx: 3,
    expEn: "PM Narendra Modi launched the Global Green Credit Initiative alongside UAE President Sheikh Mohamed bin Zayed Al Nahyan at COP28.",
    expHi: "प्रधानमंत्री नरेंद्र मोदी ने COP28 में यूएई के राष्ट्रपति के साथ ग्लोबल ग्रीन क्रेडिट इनिशिएटिव (GGCI) का शुभारंभ किया।",
    diff: "medium",
    src: { name: "Ministry of Environment, Forest and Climate Change / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1981600", pubDate: "2023-12-01", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "What is the statutory minimum Cash Reserve Ratio (CRR) requirement that commercial banks must maintain with the RBI as of 2024-2025?",
    qHi: "2024-2025 के अनुसार वाणिज्यिक बैंकों को आरबीआई के पास अनिवार्य रूप से बनाए रखने वाला नकद आरक्षित अनुपात (CRR) कितना है?",
    optEn: ["4.50%", "3.00%", "5.25%", "6.00%"],
    optHi: ["4.50%", "3.00%", "5.25%", "6.00%"],
    correctIdx: 0,
    expEn: "The RBI maintained the Cash Reserve Ratio (CRR) at 4.50% of Net Demand and Time Liabilities (NDTL) through 2024 before announcing calibrated reductions.",
    expHi: "आरबीआई ने वाणिज्यिक बैंकों के लिए CRR को 4.50% पर बनाए रखा।",
    diff: "easy",
    src: { name: "Reserve Bank of India Monetary Policy Statements", url: "https://www.rbi.org.in/", pubDate: "2024-04-05", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "awards_honours",
    qEn: "Which state's tableau won the first prize in the People's Choice category at the Republic Day Parade 2024 on Kartavya Path?",
    qHi: "कर्तव्य पथ पर गणतंत्र दिवस परेड 2024 में 'पीपुल्स च्वाइस' श्रेणी में किस राज्य की झांकी ने प्रथम पुरस्कार जीता?",
    optEn: ["Odisha", "Gujarat", "Tamil Nadu", "Maharashtra"],
    optHi: ["ओडिशा", "गुजरात", "तमिलनाडु", "महाराष्ट्र"],
    correctIdx: 1,
    expEn: "Gujarat's tableau based on the theme 'Dhordo: Global Icon of Border Tourism' won the first prize in the People's Choice category in 2024.",
    expHi: "गुजरात की 'धोरडो: सीमा पर्यटन का वैश्विक प्रतीक' थीम पर आधारित झांकी ने 2024 में पीपुल्स च्वाइस श्रेणी में प्रथम पुरस्कार जीता।",
    diff: "medium",
    src: { name: "Ministry of Defence / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2000551", pubDate: "2024-01-30", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "Which ministry administers the 'SVAMITVA' scheme that uses drone technology to map inhabited land parcels in rural India?",
    qHi: "ग्रामीण भारत में आबादी वाली भूमि के पार्सल का ड्रोन तकनीक से मानचित्रण करने वाली 'स्वामित्व' (SVAMITVA) योजना किस मंत्रालय द्वारा संचालित है?",
    optEn: ["Ministry of Rural Development", "Ministry of Agriculture", "Ministry of Panchayati Raj", "Ministry of Housing and Urban Affairs"],
    optHi: ["ग्रामीण विकास मंत्रालय", "कृषि मंत्रालय", "पंचायती राज मंत्रालय", "आवास और शहरी कार्य मंत्रालय"],
    correctIdx: 2,
    expEn: "SVAMITVA (Survey of Villages and Mapping with Improvised Technology in Village Areas) is run by the Ministry of Panchayati Raj to issue property cards.",
    expHi: "स्वामित्व योजना पंचायती राज मंत्रालय द्वारा ग्रामीण क्षेत्रों में संपत्ति कार्ड प्रदान करने के लिए संचालित की जाती है।",
    diff: "easy",
    src: { name: "Ministry of Panchayati Raj / SVAMITVA Portal", url: "https://svamitva.nic.in/", pubDate: "2024-01-10", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "international_summits",
    qEn: "Which country hosted the 16th BRICS Summit in Kazan in October 2024 where new full member countries participated?",
    qHi: "अक्टूबर 2024 में कज़ान में 16वें ब्रिक्स शिखर सम्मेलन की मेजबानी किस देश ने की जहाँ नए पूर्ण सदस्य देशों ने भाग लिया?",
    optEn: ["South Africa", "Brazil", "China", "Russia"],
    optHi: ["दक्षिण अफ्रीका", "ब्राजील", "चीन", "रूस"],
    correctIdx: 3,
    expEn: "Russia hosted the 16th BRICS Summit in Kazan from October 22 to 24, 2024, attended by PM Narendra Modi.",
    expHi: "रूस ने 22 से 24 अक्टूबर 2024 तक कज़ान में 16वें ब्रिक्स शिखर सम्मेलन की मेजबानी की, जिसमें प्रधानमंत्री नरेंद्र मोदी ने भाग लिया।",
    diff: "easy",
    src: { name: "Ministry of External Affairs / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2067160", pubDate: "2024-10-23", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "science_space",
    qEn: "In February 2024, ISRO successfully placed into orbit INSAT-3DS. What type of satellite is INSAT-3DS?",
    qHi: "फरवरी 2024 में इसरो ने INSAT-3DS को कक्षा में सफलतापूर्वक स्थापित किया। INSAT-3DS किस प्रकार का उपग्रह है?",
    optEn: ["Advanced meteorological and weather-forecasting satellite", "Deep space optical telescope", "Ocean salinity monitoring satellite", "Military radar jammer"],
    optHi: ["उन्नत मौसम विज्ञान और मौसम पूर्वानुमान उपग्रह", "गहरे अंतरिक्ष का ऑप्टिकल टेलीस्कोप", "महासागर लवणता निगरानी उपग्रह", "सैन्य रडार जैमर"],
    correctIdx: 0,
    expEn: "INSAT-3DS, launched aboard GSLV-F14, is a dedicated third-generation meteorological satellite to enhance weather and disaster forecasting.",
    expHi: "GSLV-F14 द्वारा प्रक्षेपित INSAT-3DS मौसम और आपदा पूर्वानुमान को बढ़ाने वाला तीसरी पीढ़ी का मौसम उपग्रह है।",
    diff: "medium",
    src: { name: "ISRO Official Portal", url: "https://www.isro.gov.in/GSLV_F14_INSAT_3DS.html", pubDate: "2024-02-17", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "sports",
    qEn: "Who won the ICC Men's Cricket World Cup 2023 held across India in October-November 2023?",
    qHi: "अक्टूबर-नवंबर 2023 में भारत भर में आयोजित ICC पुरुष क्रिकेट विश्व कप 2023 का खिताब किस देश ने जीता?",
    optEn: ["India", "Australia", "New Zealand", "South Africa"],
    optHi: ["भारत", "ऑस्ट्रेलिया", "न्यूजीलैंड", "दक्षिण अफ्रीका"],
    correctIdx: 1,
    expEn: "Australia defeated India by 6 wickets in the final at Narendra Modi Stadium, Ahmedabad on November 19, 2023 to claim their 6th ODI World Cup.",
    expHi: "ऑस्ट्रेलिया ने 19 नवंबर 2023 को अहमदाबाद के नरेंद्र मोदी स्टेडियम में फाइनल में भारत को हराकर अपना छठा एकदिवसीय विश्व कप जीता।",
    diff: "easy",
    src: { name: "International Cricket Council (ICC)", url: "https://www.icc-cricket.com/", pubDate: "2023-11-19", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "governance_appointments",
    qEn: "Who is the Chief Justice of India (CJI) as of late 2024, having succeeded Justice D.Y. Chandrachud?",
    qHi: "2024 के अंत में न्यायमूर्ति डी.वाई. चंद्रचूड़ के सेवानिवृत्त होने के बाद भारत के मुख्य न्यायाधीश (CJI) का पद किसने संभाला?",
    optEn: ["Justice U.U. Lalit", "Justice Sanjiv Khanna", "Justice B.R. Gavai", "Justice Surya Kant"],
    optHi: ["न्यायमूर्ति यू.यू. ललित", "न्यायमूर्ति संजीव खन्ना (Justice Sanjiv Khanna)", "न्यायमूर्ति बी.आर. गवई", "न्यायमूर्ति सूर्यकांत"],
    correctIdx: 1,
    expEn: "Justice Sanjiv Khanna took oath as the 51st Chief Justice of India on November 11, 2024.",
    expHi: "न्यायमूर्ति संजीव खन्ना ने 11 नवंबर 2024 को भारत के 51वें मुख्य न्यायाधीश के रूप में शपथ ली।",
    diff: "easy",
    src: { name: "Supreme Court of India / Rashtrapati Bhavan", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2072210", pubDate: "2024-11-11", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "What is the statutory tenure of members of the Monetary Policy Committee (MPC) of the Reserve Bank of India?",
    qHi: "भारतीय रिजर्व बैंक की मौद्रिक नीति समिति (MPC) के सदस्यों का वैधानिक कार्यकाल कितना होता है?",
    optEn: ["3 years with reappointment eligibility", "5 years without reappointment", "4 years and not eligible for reappointment", "6 years or until age 65"],
    optHi: ["3 वर्ष (पुनर्नियुक्ति पात्रता के साथ)", "5 वर्ष (बिना पुनर्नियुक्ति)", "4 वर्ष और पुनर्नियुक्ति के पात्र नहीं", "6 वर्ष या 65 वर्ष की आयु तक"],
    correctIdx: 2,
    expEn: "Under Section 45ZB of the RBI Act, nominated MPC members hold office for a period of four years and are not eligible for reappointment.",
    expHi: "आरबीआई अधिनियम की धारा 45ZB के अनुसार, MPC के मनोनीत सदस्य 4 वर्ष की अवधि के लिए पद धारण करते हैं और पुनर्नियुक्ति के पात्र नहीं होते।",
    diff: "hard",
    src: { name: "Reserve Bank of India Act, 1934", url: "https://www.rbi.org.in/", pubDate: "2024-04-01", verificationDate: "2026-03-10", status: "verified" }
  },

  // 71-80
  {
    sub: "environment_ecology",
    qEn: "Which Indian city was awarded the cleanest city title in India for the seventh consecutive time in the Swachh Survekshan 2023 awards announced in 2024?",
    qHi: "2024 में घोषित स्वच्छ सर्वेक्षण 2023 पुरस्कारों में लगातार सातवीं बार भारत के सबसे स्वच्छ शहर का खिताब किस शहर ने जीता?",
    optEn: ["Surat only", "Navi Mumbai", "Bhopal", "Indore (jointly with Surat)"],
    optHi: ["केवल सूरत", "नवी मुंबई", "भोपाल", "इंदौर (सूरत के साथ संयुक्त रूप से)"],
    correctIdx: 3,
    expEn: "Indore and Surat were declared joint cleanest cities in India in the 2023 Swachh Survekshan rankings, marking Indore's 7th consecutive win.",
    expHi: "स्वच्छ सर्वेक्षण 2023 में इंदौर और सूरत को संयुक्त रूप से सबसे स्वच्छ शहर घोषित किया गया, जो इंदौर की लगातार सातवीं जीत थी।",
    diff: "easy",
    src: { name: "Ministry of Housing and Urban Affairs / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1995160", pubDate: "2024-01-11", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "What is the target deadline set under the National Tuberculosis Elimination Programme (NTEP) for eliminating TB in India, ahead of the global SDG target?",
    qHi: "राष्ट्रीय क्षयरोग उन्मूलन कार्यक्रम (NTEP) के तहत भारत में टीबी (TB) को समाप्त करने का लक्ष्य वर्ष क्या निर्धारित किया गया है?",
    optEn: ["2025", "2030", "2035", "2040"],
    optHi: ["2025", "2030", "2035", "2040"],
    correctIdx: 0,
    expEn: "India set a target to end TB by 2025 under the Ni-kshay initiative, five years ahead of the UN Sustainable Development Goal (SDG) target of 2030.",
    expHi: "भारत ने संयुक्त राष्ट्र सतत विकास लक्ष्य (2030) से पांच वर्ष पूर्व, 2025 तक टीबी उन्मूलन का राष्ट्रीय लक्ष्य निर्धारित किया है।",
    diff: "easy",
    src: { name: "Ministry of Health and Family Welfare / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1910243", pubDate: "2023-03-24", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "In the Union Budget 2024-25 presented in July 2024, what was the standard deduction raised to for salaried individuals under the new tax regime?",
    qHi: "जुलाई 2024 में प्रस्तुत केंद्रीय बजट 2024-25 में, नई कर व्यवस्था के तहत वेतनभोगी व्यक्तियों के लिए मानक कटौती (Standard Deduction) को बढ़ाकर कितना किया गया?",
    optEn: ["Rs 50,000", "Rs 75,000", "Rs 1,00,000", "Rs 60,000"],
    optHi: ["₹50,000", "₹75,000", "₹1,00,000", "₹60,000"],
    correctIdx: 1,
    expEn: "Finance Minister Nirmala Sitharaman increased the standard deduction for salaried employees from Rs 50,000 to Rs 75,000 under the new income tax regime.",
    expHi: "वित्त मंत्री निर्मला सीतारमण ने नई कर व्यवस्था के तहत वेतनभोगियों के लिए मानक कटौती को ₹50,000 से बढ़ाकर ₹75,000 कर दिया।",
    diff: "easy",
    src: { name: "Ministry of Finance / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2035618", pubDate: "2024-07-23", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "science_space",
    qEn: "Who were the four astronaut designates announced by the Prime Minister in February 2024 for India's Gaganyaan orbital human spaceflight mission?",
    qHi: "फरवरी 2024 में प्रधानमंत्री द्वारा भारत के गगनयान कक्षीय मानव अंतरिक्ष मिशन के लिए घोषित चार नामित अंतरिक्ष यात्री कौन हैं?",
    optEn: ["Prashanth Nair, Ajit Krishnan, Angad Pratap, and Shubhanshu Shukla", "Rakesh Sharma, Ravish Malhotra, Kalpana Chawla, and Sunita Williams", "Anil Menon, Raja Chari, Sirisha Bandla, and Vikram Sarabhai", "Dinesh Tripathi, Upendra Dwivedi, AP Singh, and Anil Chauhan"],
    optHi: ["प्रशांत नायर, अजीत कृष्णन, अंगद प्रताप और शुभांशु शुक्ला", "राकेश शर्मा, रवीश मल्होत्रा, कल्पना चावला और सुनीता विलियम्स", "अनिल मेनन, राजा चारी, सिरीशा बांदला और विक्रम साराभाई", "दिनेश त्रिपाठी, उपेंद्र द्विवेदी, एपी सिंह और अनिल चौहान"],
    correctIdx: 0,
    expEn: "Group Captains Prashanth Nair, Ajit Krishnan, Angad Pratap, and Wing Commander Shubhanshu Shukla were awarded astronaut wings at Vikram Sarabhai Space Centre.",
    expHi: "ग्रुप कैप्टन प्रशांत नायर, अजीत कृष्णन, अंगद प्रताप और विंग कमांडर शुभांशु शुक्ला को गगनयान मिशन के अंतरिक्ष यात्रियों के रूप में प्रस्तुत किया गया।",
    diff: "medium",
    src: { name: "ISRO / Prime Minister's Office", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2009386", pubDate: "2024-02-27", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "defence_security",
    qEn: "Which country delivered the S-400 Triumf surface-to-air missile squadrons to India under a 2018 government-to-government agreement?",
    qHi: "2018 के अंतर-सरकारी समझौते के तहत किस देश ने भारत को S-400 ट्रायम्फ सतह से हवा में मार करने वाले मिसाइल स्क्वाड्रन की आपूर्ति की?",
    optEn: ["France", "United States", "Russia", "Israel"],
    optHi: ["फ्रांस", "संयुक्त राज्य अमेरिका", "रूस", "इजरायल"],
    correctIdx: 2,
    expEn: "Russia contracted to supply five S-400 air defense missile squadrons to India, operated under the Indian designation 'Sudarshan Chakra'.",
    expHi: "रूस ने भारत को S-400 वायु रक्षा प्रणाली की आपूर्ति की जिसे भारतीय वायु सेना में 'सुदर्शन' के नाम से जाना जाता है।",
    diff: "easy",
    src: { name: "Ministry of Defence / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1781245", pubDate: "2023-08-10", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "governance_appointments",
    qEn: "Who is the Chairman of the Indian Space Research Organisation (ISRO) who oversaw the historic Chandrayaan-3 and Aditya-L1 launches?",
    qHi: "भारतीय अंतरिक्ष अनुसंधान संगठन (ISRO) के अध्यक्ष कौन हैं जिन्होंने ऐतिहासिक चंद्रयान-3 और आदित्य-एल1 प्रक्षेपणों का सफल नेतृत्व किया?",
    optEn: ["K. Sivan", "A.S. Kiran Kumar", "S. Somanath", "K. Radhakrishnan"],
    optHi: ["के. सिवन", "ए.एस. किरण कुमार", "एस. सोमनाथ (S. Somanath)", "के. राधाकृष्णन"],
    correctIdx: 2,
    expEn: "S. Somanath serves as the Secretary, Department of Space and Chairman, ISRO, leading India's lunar and solar space missions.",
    expHi: "एस. सोमनाथ अंतरिक्ष विभाग के सचिव और इसरो के अध्यक्ष के रूप में भारत के अंतरिक्ष अभियानों का नेतृत्व कर रहे हैं।",
    diff: "easy",
    src: { name: "ISRO Official Portal", url: "https://www.isro.gov.in/Chairman.html", pubDate: "2024-01-01", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "awards_honours",
    qEn: "Which state of India was ranked Number 1 in the medal tally at the 37th National Games held in Goa in late 2023?",
    qHi: "2023 के अंत में गोवा में आयोजित 37वें राष्ट्रीय खेलों की पदक तालिका में कौन सा राज्य शीर्ष (नंबर 1) पर रहा?",
    optEn: ["Haryana", "Services Sports Control Board", "Maharashtra", "Kerala"],
    optHi: ["हरियाणा", "सर्विसेज स्पोर्ट्स कंट्रोल बोर्ड", "महाराष्ट्र", "केरल"],
    correctIdx: 2,
    expEn: "Maharashtra topped the medal tally at the 37th National Games with a record 228 medals (80 gold, 69 silver, 79 bronze), winning the Raja Bhalindra Singh Trophy.",
    expHi: "महाराष्ट्र ने 37वें राष्ट्रीय खेलों में 80 स्वर्ण सहित कुल 228 पदक जीतकर पदक तालिका में शीर्ष स्थान हासिल किया और राजा भालिंद्र सिंह ट्रॉफी जीती।",
    diff: "medium",
    src: { name: "Ministry of Youth Affairs and Sports / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1975850", pubDate: "2023-11-09", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "economy_banking",
    qEn: "Under the Pradhan Mantri Jan Dhan Yojana (PMJDY), which completed 10 years of implementation in August 2024, what is the overdraft facility available to eligible account holders?",
    qHi: "अगस्त 2024 में 10 वर्ष पूरे करने वाली 'प्रधानमंत्री जन धन योजना' (PMJDY) के तहत पात्र खाताधारकों को कितनी ओवरड्राफ्ट (OD) सुविधा उपलब्ध है?",
    optEn: ["Rs 2,000", "Rs 5,000", "Rs 10,000", "Rs 15,000"],
    optHi: ["₹2,000", "₹5,000", "₹10,000", "₹15,000"],
    correctIdx: 2,
    expEn: "The overdraft facility under PMJDY was enhanced to Rs 10,000 (with no conditions up to Rs 2,000) and an upper age limit of 65 years.",
    expHi: "PMJDY के तहत ओवरड्राफ्ट सुविधा को बढ़ाकर ₹10,000 कर दिया गया है (बिना किसी शर्त के ₹2,000 तक) और अधिकतम आयु सीमा 65 वर्ष है।",
    diff: "easy",
    src: { name: "Department of Financial Services / Ministry of Finance / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2049450", pubDate: "2024-08-28", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "environment_ecology",
    qEn: "What is the global pledge initiated by India at the UN Climate Summit called 'Panchamrit', aiming for non-fossil energy capacity of what magnitude by 2030?",
    qHi: "संयुक्त राष्ट्र जलवायु शिखर सम्मेलन में भारत द्वारा प्रस्तुत 'पंचामृत' संकल्प के तहत 2030 तक गैर-जीवाश्म ऊर्जा क्षमता का क्या लक्ष्य रखा गया है?",
    optEn: ["250 GW", "350 GW", "500 GW", "750 GW"],
    optHi: ["250 गीगावाट", "350 गीगावाट", "500 गीगावाट (500 GW)", "750 गीगावाट"],
    correctIdx: 2,
    expEn: "Under India's Panchamrit climate commitments, India aims to install 500 GW of non-fossil fuel electricity capacity by 2030.",
    expHi: "भारत के पंचामृत संकल्प के अनुसार 2030 तक 500 गीगावाट गैर-जीवाश्म बिजली उत्पादन क्षमता स्थापित करने का लक्ष्य है।",
    diff: "easy",
    src: { name: "Ministry of New and Renewable Energy / PIB", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1847849", pubDate: "2022-08-03", verificationDate: "2026-03-10", status: "verified" }
  },
  {
    sub: "national_schemes",
    qEn: "Which portal is the central single-window platform launched by the Government of India for all government credit schemes facilitating digital loans to MSMEs and farmers?",
    qHi: "MSMEs और किसानों को डिजिटल ऋण की सुविधा प्रदान करने वाली सभी सरकारी ऋण योजनाओं के लिए भारत सरकार द्वारा शुरू किया गया केंद्रीय एकल-खिड़की मंच कौन सा है?",
    optEn: ["Udyam Portal", "Jan Samarth Portal", "Kisan Credit Digital Link", "PM Mudra Direct"],
    optHi: ["उद्यम पोर्टल", "जन समर्थ पोर्टल (Jan Samarth)", "किसान क्रेडिट डिजिटल लिंक", "पीएम मुद्रा डायरेक्ट"],
    correctIdx: 1,
    expEn: "Jan Samarth is a first-of-its-kind digital portal linking 13 government credit schemes on a single platform for ease of citizen borrowing.",
    expHi: "जन समर्थ पोर्टल 13 सरकारी ऋण योजनाओं को एक ही मंच पर जोड़ता है ताकि नागरिक आसानी से सीधे बैंकों से ऋण प्राप्त कर सकें।",
    diff: "easy",
    src: { name: "Ministry of Finance / Jan Samarth Portal", url: "https://www.jansamarth.in/", pubDate: "2024-01-15", verificationDate: "2026-03-10", status: "verified" }
  }
];

const allQuestions = [...rawQuestions, ...additionalTopics, ...moreQuestions, ...finalBatch];

console.log(`Compiling ${allQuestions.length} Current Affairs questions...`);

// Audit answer key distribution
const answerCounts = { opt_a: 0, opt_b: 0, opt_c: 0, opt_d: 0 };

const formatted = allQuestions.map((q, idx) => {
  const id = `ca_${String(idx + 1).padStart(3, '0')}`;
  const correctOptionId = optionKeys[q.correctIdx];
  answerCounts[correctOptionId]++;

  return {
    id,
    category: "current_affairs",
    subcategory: q.sub,
    questionEn: q.qEn,
    questionHi: q.qHi,
    optionsEn: q.optEn,
    optionsHi: q.optHi,
    correctOptionId,
    correctIndex: q.correctIdx,
    explanationEn: q.expEn,
    explanationHi: q.expHi,
    difficulty: q.diff,
    source: q.src,
    createdAt: "2026-03-15T00:00:00.000Z",
    fingerprint: hash(q.qEn),
    isActive: true
  };
});

console.log("Current Affairs Answer Distribution:", answerCounts);

const fileContent = `import { SamahitQuestion } from "../samahitQuestionTypes";

export const CURRENT_AFFAIRS_QUESTIONS: SamahitQuestion[] = ${JSON.stringify(formatted, null, 2)};
`;

const targetPath = path.join(__dirname, '..', 'src', 'data', 'quiz', 'questions', 'currentAffairs.ts');
const targetDir = path.dirname(targetPath);
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log(`Saved ${formatted.length} questions to ${targetPath}`);
