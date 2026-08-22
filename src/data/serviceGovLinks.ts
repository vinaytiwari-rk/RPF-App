export interface GovLink {
  title: string;
  titleHi: string;
  desc: string;
  descHi: string;
  url: string;
  category?: string;
  isGov?: boolean; // true = Official Govt portal, false = Useful Private Resource
}

export const SERVICE_GOV_LINKS: Record<string, GovLink[]> = {
  card: [
    { title: "National Portal of India", titleHi: "भारत का राष्ट्रीय पोर्टल", desc: "Single window access to government services & foundational ID verification.", descHi: "सरकारी सेवाओं और आधारभूत आईडी का राष्ट्रीय पोर्टल।", url: "https://www.india.gov.in/", isGov: true },
    { title: "MP e-Services Portal", titleHi: "एम.पी. ई-सेवा पोर्टल", desc: "Madhya Pradesh government e-services & citizen card portal.", descHi: "मध्य प्रदेश सरकार की ई-सेवाएं पोर्टल।", url: "https://services.mp.gov.in/eservice/", isGov: true },
    { title: "Digital India Citizen Portal", titleHi: "डिजिटल इंडिया पोर्टल", desc: "Official Digital India initiative and citizen identity services.", descHi: "डिजिटल इंडिया पहल और नागरिक सेवाएं।", url: "https://digitalindia.gov.in/", isGov: true },
    { title: "UIDAI Resident Portal", titleHi: "यूआईडीएआई निवासी पोर्टल", desc: "Official Aadhaar identity and verification services portal.", descHi: "आधिकारिक आधार पहचान और सत्यापन सेवा पोर्टल।", url: "https://uidai.gov.in/", isGov: true },
    { title: "UMANG Unified App", titleHi: "उमंग एकीकृत ऐप पोर्टल", desc: "Unified mobile app for multi-government services in India.", descHi: "भारत में बहु-सरकारी सेवाओं के लिए एकीकृत मोबाइल ऐप।", url: "https://web.umang.gov.in/", isGov: true },
    { title: "MyGov Citizen Services", titleHi: "मायगव नागरिक पोर्टल", desc: "Citizen engagement and identity service programs.", descHi: "नागरिक सहभागिता और पहचान सेवा कार्यक्रम।", url: "https://www.mygov.in/", isGov: true }
  ],
  blood: [
    { title: "e-RaktKosh Portal", titleHi: "ई-रक्तकोश पोर्टल", desc: "Centralized blood bank management system & donor finder by MoHFW.", descHi: "स्वास्थ्य मंत्रालय द्वारा केंद्रीयकृत रक्त बैंक प्रबंधन एवं दाता खोज।", url: "https://www.eraktkosh.in/", isGov: true },
    { title: "National Health Portal (NHP)", titleHi: "राष्ट्रीय स्वास्थ्य पोर्टल", desc: "Official health guidance & blood emergency directory.", descHi: "आधिकारिक स्वास्थ्य मार्गदर्शन और रक्त आपातकालीन निर्देशिका।", url: "https://www.nhp.gov.in/", isGov: true },
    { title: "Indian Red Cross Society", titleHi: "भारतीय रेड क्रॉस सोसाइटी", desc: "Humanitarian blood donation network and disaster relief.", descHi: "मानवीय रक्तदान नेटवर्क और आपदा राहत।", url: "https://indianredcross.org/", isGov: true },
    { title: "Friends2Support Blood Network", titleHi: "फ्रेंड्स2सपोर्ट ब्लड नेटवर्क", desc: "Largest voluntary blood donor community database in India.", descHi: "भारत का प्रमुख स्वैच्छिक रक्तदान नेटवर्क।", url: "https://www.friends2support.org/", isGov: false },
    { title: "Rotary Blood Bank Network", titleHi: "रोटरी ब्लड बैंक नेटवर्क", desc: "Pan-India voluntary blood donation and component bank.", descHi: "अखिल भारतीय स्वैच्छिक रक्तदान और घटक बैंक।", url: "https://www.rotarybloodbank.org/", isGov: false },
    { title: "Blood Donors India", titleHi: "ब्लड डोनेटर्स इंडिया", desc: "Emergency blood donor connection and helpline service.", descHi: "आपातकालीन रक्तदान हेल्पलाइन और सहायता।", url: "https://blooddonors.in/", isGov: false }
  ],
  donations: [
    { title: "PM National Relief Fund (PMNRF)", titleHi: "प्रधानमंत्री राष्ट्रीय राहत कोष", desc: "Official Prime Minister relief fund for national emergencies.", descHi: "राष्ट्रीय आपात स्थिति के लिए आधिकारिक प्रधानमंत्री राहत कोष।", url: "https://pmnrf.gov.in/", isGov: true },
    { title: "NGO Darpan (NITI Aayog)", titleHi: "एनजीओ दर्पण (नीति आयोग)", desc: "Verified NGO directory & donation transparency portal.", descHi: "सत्यापित एनजीओ निर्देशिका एवं पारदर्शिता पोर्टल।", url: "https://ngodarpan.gov.in/", isGov: true },
    { title: "MP CM Relief Fund", titleHi: "एम.पी. मुख्यमंत्री राहत कोष", desc: "Madhya Pradesh Chief Minister relief fund.", descHi: "मध्य प्रदेश मुख्यमंत्री राहत कोष।", url: "https://cmrelieffund.mp.gov.in/", isGov: true },
    { title: "GiveIndia Foundation", titleHi: "गिव-इंडिया फाउंडेशन", desc: "Trusted social impact and donation platform in India.", descHi: "सत्यापित सामाजिक प्रभाव एवं दान मंच।", url: "https://www.giveindia.org/", isGov: false },
    { title: "Goonj Community Relief", titleHi: "गूँज सामुदायिक राहत", desc: "Disaster relief and clothing bank initiatives across India.", descHi: "आपदा राहत और वस्त्र बैंक पहल।", url: "https://goonj.org/", isGov: false },
    { title: "Akshaya Patra Foundation", titleHi: "अक्षय पात्र फाउंडेशन", desc: "Mid-day meal and community hunger relief foundation.", descHi: "मध्याह्न भोजन और सामुदायिक भूख राहत फाउंडेशन।", url: "https://www.akshayapatra.org/", isGov: false }
  ],
  grievance: [
    { title: "CPGRAMS Public Grievance Portal", titleHi: "सीपीजीआरएएमएस लोक शिकायत पोर्टल", desc: "Centralized public grievance redress and monitoring system.", descHi: "केंद्रीय लोक शिकायत निवारण और निगरानी प्रणाली।", url: "https://pgportal.gov.in/", isGov: true },
    { title: "MP CM Helpline 181", titleHi: "एम.पी. सीएम हेल्पलाइन 181", desc: "Madhya Pradesh 24x7 citizen grievance portal.", descHi: "मध्य प्रदेश 24x7 नागरिक शिकायत पोर्टल।", url: "https://cmhelpline.mp.gov.in/", isGov: true },
    { title: "National Consumer Helpline", titleHi: "राष्ट्रीय उपभोक्ता हेल्पलाइन", desc: "Consumer grievance and dispute resolution portal.", descHi: "उपभोक्ता शिकायत और विवाद निवारण पोर्टल।", url: "https://consumerhelpline.gov.in/", isGov: true },
    { title: "RTI Online Portal", titleHi: "आरटीआई ऑनलाइन पोर्टल", desc: "File Right to Information applications online to central ministries.", descHi: "केंद्रीय मंत्रालयों में ऑनलाइन आरटीई आवेदन फाइल करें।", url: "https://rtionline.gov.in/", isGov: true },
    { title: "National Legal Services Authority", titleHi: "राष्ट्रीय कानूनी सेवा प्राधिकरण", desc: "Free legal aid & Lok Adalat grievance redressal.", descHi: "निःशुल्क कानूनी सहायता और लोक अदालत।", url: "https://nalsa.gov.in/", isGov: true },
    { title: "National Human Rights Commission", titleHi: "राष्ट्रीय मानव अधिकार आयोग", desc: "Human rights complaint & grievance portal.", descHi: "मानव अधिकार शिकायत निवारण पोर्टल।", url: "https://nhrc.nic.in/", isGov: true }
  ],
  volunteers: [
    { title: "MyGov Volunteer Portal", titleHi: "मायगव स्वयंसेवक पोर्टल", desc: "Official Government of India citizen volunteer network.", descHi: "भारत सरकार का आधिकारिक नागरिक स्वयंसेवक नेटवर्क।", url: "https://www.mygov.in/", isGov: true },
    { title: "Nehru Yuva Kendra Sangathan (NYKS)", titleHi: "नेहरू युवा केंद्र संगठन", desc: "National youth volunteering & community action portal.", descHi: "राष्ट्रीय युवा स्वयंसेवा और सामुदायिक कार्य पोर्टल।", url: "https://nyks.nic.in/", isGov: true },
    { title: "National Service Scheme (NSS)", titleHi: "राष्ट्रीय सेवा योजना", desc: "Ministry of Youth Affairs student volunteer network.", descHi: "युवा कार्यक्रम मंत्रालय का छात्र स्वयंसेवक नेटवर्क।", url: "https://nss.gov.in/", isGov: true },
    { title: "UN Volunteers India", titleHi: "संयुक्त राष्ट्र स्वयंसेवक भारत", desc: "United Nations volunteer opportunities in India.", descHi: "भारत में संयुक्त राष्ट्र स्वयंसेवक के अवसर।", url: "https://www.unv.org/", isGov: false },
    { title: "Youth For India Fellowship", titleHi: "युवा फॉर इंडिया फेलोशिप", desc: "Rural development volunteering fellowship in India.", descHi: "भारत में ग्रामीण विकास स्वयंसेवा फेलोशिप।", url: "https://youthforindia.org/", isGov: false },
    { title: "Volunteer4India Network", titleHi: "वोलंटियर4इंडिया नेटवर्क", desc: "Youth volunteering and social action platform.", descHi: "युवा स्वयंसेवा और सामाजिक कार्य मंच।", url: "https://v4i.in/", isGov: false }
  ],
  "health-care": [
    { title: "Ayushman Bharat PM-JAY", titleHi: "आयुष्मान भारत पीएम-जय", desc: "World's largest government-funded health insurance scheme.", descHi: "विश्व की सबसे बड़ी सरकारी स्वास्थ्य बीमा योजना।", url: "https://pmjay.gov.in/", isGov: true },
    { title: "ABHA Health Account (ABDM)", titleHi: "आभा स्वास्थ्य खाता (एबीडीएम)", desc: "Create your official Ayushman Bharat Health Account.", descHi: "अपना आधिकारिक आयुष्मान भारत स्वास्थ्य खाता बनाएं।", url: "https://abdm.gov.in/", isGov: true },
    { title: "MoHFW Official Portal", titleHi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय", desc: "Ministry of Health & Family Welfare policy & health alerts.", descHi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय की आधिकारिक गाइडलाइन।", url: "https://mohfw.gov.in/", isGov: true },
    { title: "Tata 1mg Health Network", titleHi: "टाटा 1एमजी स्वास्थ्य नेटवर्क", desc: "Online medicine delivery, lab tests & health information.", descHi: "ऑनलाइन दवा डिलीवरी, लैब टेस्ट और स्वास्थ्य जानकारी।", url: "https://www.1mg.com/", isGov: false },
    { title: "Practo Doctor Finder", titleHi: "प्रैक्टो डॉक्टर खोज", desc: "Find top verified doctors & book clinic appointments.", descHi: "सत्यापित डॉक्टर खोजें और क्लिनिक अपॉइंटमेंट बुक करें।", url: "https://www.practo.com/", isGov: false },
    { title: "Apollo 24/7 Healthcare", titleHi: "अपोलो 24/7 हेल्थकेयर", desc: "24x7 doctor consultations, diagnostics and emergency care.", descHi: "24x7 डॉक्टर परामर्श और डायग्नोस्टिक्स।", url: "https://www.apollo247.com/", isGov: false }
  ],
  jobs: [
    { title: "National Career Service (NCS)", titleHi: "राष्ट्रीय करियर सेवा", desc: "Ministry of Labour job portal for verified job seekers & employers.", descHi: "श्रम मंत्रालय का आधिकारिक रोजगार पोर्टल।", url: "https://www.ncs.gov.in/", isGov: true },
    { title: "MP Rojgar Portal", titleHi: "एम.पी. रोजगार पोर्टल", desc: "Madhya Pradesh state employment exchange and registration.", descHi: "मध्य प्रदेश राज्य रोजगार कार्यालय पोर्टल।", url: "https://mprojgar.gov.in/", isGov: true },
    { title: "Staff Selection Commission (SSC)", titleHi: "कर्मचारी चयन आयोग", desc: "Official government recruitment examinations portal.", descHi: "कर्मचारी चयन आयोग की आधिकारिक वेबसाइट।", url: "https://ssc.gov.in/", isGov: true },
    { title: "LinkedIn India Careers", titleHi: "लिंक्डइन इंडिया करियर", desc: "Professional networking and verified job search in India.", descHi: "प्रोफेशनल नेटवर्किंग और नौकरियां खोजें।", url: "https://www.linkedin.com/", isGov: false },
    { title: "Naukri Career Portal", titleHi: "नौकरी.कॉम पोर्टल", desc: "Premier Indian job portal for corporate & private hiring.", descHi: "भारत का प्रमुख जॉब पोर्टल।", url: "https://www.naukri.com/", isGov: false },
    { title: "Unstop Career Opportunities", titleHi: "अनस्टॉप करियर नेटवर्क", desc: "Campus hiring, competitions, hackathons & entry jobs.", descHi: "कैम्पस हायरिंग, हैकाथॉन और नौकरियां।", url: "https://unstop.com/", isGov: false }
  ],
  scholarships: [
    { title: "National Scholarship Portal (NSP)", titleHi: "राष्ट्रीय छात्रवृत्ति पोर्टल", desc: "Single gateway for government scholarships across India.", descHi: "भारत भर में सरकारी छात्रवृत्तियों के लिए एक एकल पोर्टल।", url: "https://scholarships.gov.in/", isGov: true },
    { title: "MP Scholarship Portal 2.0", titleHi: "एम.पी. छात्रवृत्ति पोर्टल 2.0", desc: "Post-matric and Higher Education scholarships in MP.", descHi: "मध्य प्रदेश उच्च शिक्षा एवं पोस्ट-मैट्रिक छात्रवृत्ति।", url: "http://scholarshipportal.mp.nic.in/", isGov: true },
    { title: "AICTE Student Schemes", titleHi: "एआईसीटीई छात्र योजनाएं", desc: "Technical education scholarships and fellowship schemes.", descHi: "तकनीकी शिक्षा छात्रवृत्ति और फेलोशिप योजनाएं।", url: "https://www.aicte-india.org/schemes/students-development-schemes", isGov: true },
    { title: "Buddy4Study Network", titleHi: "बडी4स्टडी छात्रवृत्ति नेटवर्क", desc: "Comprehensive scholarship aggregator and application assistance.", descHi: "छात्रवृत्ति खोज और आवेदन सहायता।", url: "https://www.buddy4study.com/", isGov: false },
    { title: "Vidyasaarathi Portal", titleHi: "विद्यासारथी पोर्टल", desc: "Corporate CSR scholarship portal for higher education.", descHi: "उच्च शिक्षा के लिए कॉर्पोरेट सीएसआर छात्रवृत्ति पोर्टल।", url: "https://www.vidyasaarathi.co.in/", isGov: false },
    { title: "Vidya Lakshmi Education Loans", titleHi: "विद्या लक्ष्मी शिक्षा ऋण", desc: "Single window portal for student education loans.", descHi: "छात्र शिक्षा ऋण के लिए एकल खिड़की पोर्टल।", url: "https://www.vidyalakshmi.co.in/", isGov: false }
  ],
  food: [
    { title: "National Food Security Portal (NFSA)", titleHi: "राष्ट्रीय खाद्य सुरक्षा पोर्टल", desc: "Ration card status, foodgrain allocation & NFSA schemes.", descHi: "राशन कार्ड स्थिति और खाद्यान्न आवंटन पोर्टल।", url: "https://nfsa.gov.in/", isGov: true },
    { title: "MP Ration Mitra Portal", titleHi: "एम.पी. राशन मित्र पोर्टल", desc: "Madhya Pradesh public distribution system & fair price shops.", descHi: "मध्य प्रदेश सार्वजनिक वितरण प्रणाली पोर्टल।", url: "https://rationmitra.mp.gov.in/", isGov: true },
    { title: "Dept of Food & Public Distribution", titleHi: "खाद्य एवं सार्वजनिक वितरण विभाग", desc: "Central food security policy and Anna Yojana updates.", descHi: "केंद्रीय खाद्य सुरक्षा नीति और अन्न योजना।", url: "https://dfpd.gov.in/", isGov: true },
    { title: "Akshaya Patra Foundation", titleHi: "अक्षय पात्र फाउंडेशन", desc: "Largest mid-day meal program provider in government schools.", descHi: "सरकारी स्कूलों में सबसे बड़ा मध्याह्न भोजन कार्यक्रम।", url: "https://www.akshayapatra.org/", isGov: false },
    { title: "Feeding India (Zomato)", titleHi: "फीडिंग इंडिया मूवमेंट", desc: "Non-profit initiative solving hunger and malnutrition in India.", descHi: "भारत में भूख और कुपोषण को समाप्त करने का अभियान।", url: "https://www.feedingindia.org/", isGov: false },
    { title: "Robin Hood Army Food Drive", titleHi: "रॉबिन हुड आर्मी फूड ड्राइव", desc: "Volunteer organization serving surplus food to needy.", descHi: "ज़रूरतमंदों को अधिशेष भोजन परोसने वाला संगठन।", url: "https://robinhoodarmy.com/", isGov: false }
  ],
  medicine: [
    { title: "Pradhan Mantri Janaushadhi (PMBJP)", titleHi: "प्रधानमंत्री जनऔषधि योजना", desc: "Generic medicines locator & low-cost pharmacy finder.", descHi: "कम कीमत पर गुणवत्तापूर्ण जेनेरिक दवाएं।", url: "https://janaushadhi.gov.in/", isGov: true },
    { title: "eSanjeevani National Telemedicine", titleHi: "ई-संजीवनी राष्ट्रीय टेलीमेडिसिन", desc: "Free government doctor consultation over video.", descHi: "निःशुल्क सरकारी डॉक्टर वीडियो परामर्श।", url: "https://esanjeevani.mohfw.gov.in/", isGov: true },
    { title: "CDSCO Medical Regulator", titleHi: "सीडीएससीओ औषधि नियामक", desc: "Central Drugs Standard Control Organization.", descHi: "केंद्रीय औषधि मानक नियंत्रण संगठन।", url: "https://cdsco.gov.in/", isGov: true },
    { title: "Netmeds Pharmacy Portal", titleHi: "नेटमेड्स फार्मेसी", desc: "Order genuine medicines online with doorstep delivery.", descHi: "प्रामाणिक दवाएं ऑनलाइन ऑर्डर करें।", url: "https://www.netmeds.com/", isGov: false },
    { title: "PharmEasy Healthcare", titleHi: "फार्मइजी हेल्थकेयर", desc: "Prescription medicine delivery & lab diagnostic tests.", descHi: "दवा डिलीवरी और लैब डायग्नोस्टिक टेस्ट।", url: "https://pharmeasy.in/", isGov: false },
    { title: "Truemeds Affordable Medicines", titleHi: "ट्रूमेड्स किफ़ायती दवाएं", desc: "Save up to 70% on substitute generic medicines.", descHi: "विकल्प जेनेरिक दवाओं पर 70% तक बचत करें।", url: "https://www.truemeds.in/", isGov: false }
  ],
  education: [
    { title: "DIKSHA Educational Portal", titleHi: "दीक्षा डिजिटल शिक्षा पोर्टल", desc: "National Digital Infrastructure for Teachers and Students.", descHi: "शिक्षकों और छात्रों के लिए राष्ट्रीय डिजिटल शिक्षा इंफ्रास्ट्रक्चर।", url: "https://diksha.gov.in/", isGov: true },
    { title: "SWAYAM Free Online Education", titleHi: "स्वयं मुफ्त ऑनलाइन शिक्षा", desc: "MHRD initiative for free school, UG & PG online courses.", descHi: "निःशुल्क स्कूल, यूजी और पीजी ऑनलाइन पाठ्यक्रम।", url: "https://swayam.gov.in/", isGov: true },
    { title: "Ministry of Education India", titleHi: "शिक्षा मंत्रालय भारत", desc: "National Education Policy (NEP) and university portals.", descHi: "राष्ट्रीय शिक्षा नीति और विश्वविद्यालय पोर्टल।", url: "https://www.education.gov.in/", isGov: true },
    { title: "Khan Academy India", titleHi: "खान अकादमी इंडिया", desc: "Free world-class math, science & computer courses for K-12.", descHi: "मुफ्त विश्व स्तरीय गणित, विज्ञान और कंप्यूटर पाठ्यक्रम।", url: "https://hi.khanacademy.org/", isGov: false },
    { title: "GeeksforGeeks Learning", titleHi: "गीक्स-फॉर-गीक्स लर्निंग", desc: "Computer science, coding & engineering learning platform.", descHi: "कंप्यूटर साइंस, कोडिंग और इंजीनियरिंग लर्निंग।", url: "https://www.geeksforgeeks.org/", isGov: false },
    { title: "NPTEL Online Certification", titleHi: "एनपीटीईएल ऑनलाइन कोर्स", desc: "Free online courses by top IITs and IISc.", descHi: "शीर्ष आईआईटी और आईआईएससी द्वारा मुफ्त कोर्स।", url: "https://nptel.ac.in/", isGov: false }
  ],
  "women-safety": [
    { title: "National Emergency Number 112", titleHi: "राष्ट्रीय आपातकालीन नंबर 112", desc: "Single emergency response support system for pan-India.", descHi: "अखिल भारतीय आपातकालीन प्रतिक्रिया सहायता प्रणाली।", url: "https://112.gov.in/", isGov: true },
    { title: "National Commission for Women (NCW)", titleHi: "राष्ट्रीय महिला आयोग", desc: "Women's rights, legal aid & complaint portal.", descHi: "महिला अधिकार, कानूनी सहायता और शिकायत पोर्टल।", url: "http://ncw.nic.in/", isGov: true },
    { title: "WCD One Stop Crisis Centre", titleHi: "महिला एवं बाल विकास मंत्रालय", desc: "Sakhi One Stop Centre initiative for women safety.", descHi: "महिला सुरक्षा के लिए सखी वन स्टॉप सेंटर पहल।", url: "https://wcd.nic.in/", isGov: true },
    { title: "Safecity Safety Platform", titleHi: "सेफसिटी सुरक्षा प्लेटफॉर्म", desc: "Crowdsourced personal safety & harassment reporting platform.", descHi: "व्यक्तिगत सुरक्षा और उत्पीड़न रिपोर्टिंग प्लेटफॉर्म।", url: "https://safecity.in/", isGov: false },
    { title: "Shakti Shalini Crisis Support", titleHi: "शक्ति शालिनी सहायता नेटवर्क", desc: "Crisis shelter and support for women facing violence.", descHi: "हिंसा का सामना कर रही महिलाओं के लिए सहायता नेटवर्क।", url: "https://shaktishalini.org/", isGov: false },
    { title: "Jagori Women Rights Network", titleHi: "जागोरी महिला अधिकार नेटवर्क", desc: "Women empowerment, training & safety advocacy organization.", descHi: "महिला सशक्तिकरण और सुरक्षा वकालत संगठन।", url: "https://www.jagori.org/", isGov: false }
  ],
  seniors: [
    { title: "Elder Line 14567 Portal", titleHi: "एल्डर लाइन 14567 पोर्टल", desc: "National helpline for senior citizens by Ministry of Social Justice.", descHi: "वरिष्ठ नागरिकों के लिए राष्ट्रीय हेल्पलाइन।", url: "https://elderline.dosje.gov.in/", isGov: true },
    { title: "SACRED Senior Re-Employment", titleHi: "सेक्रेड वरिष्ठ नागरिक पोर्टल", desc: "Senior Able Citizens for Re-Employment in Dignity.", descHi: "वरिष्ठ नागरिकों के लिए सम्मानजनक रोजगार पोर्टल।", url: "https://sacred.dosje.gov.in/", isGov: true },
    { title: "Ministry of Social Justice & Empowerment", titleHi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय", desc: "Old age pensions & senior welfare schemes.", descHi: "वृद्धावस्था पेंशन और वरिष्ठ कल्याण योजनाएं।", url: "https://socialjustice.gov.in/", isGov: true },
    { title: "HelpAge India Elder Care", titleHi: "हेल्पऐज इंडिया एल्डर केयर", desc: "Leading national charity for disadvantaged senior citizens.", descHi: "वरिष्ठ नागरिकों के लिए प्रमुख राष्ट्रीय चैरिटी।", url: "https://www.helpageindia.org/", isGov: false },
    { title: "Dignity Foundation", titleHi: "डिग्निटी फाउंडेशन", desc: "Enriching the lives of senior citizens through social support.", descHi: "सामाजिक सहायता से वरिष्ठ नागरिकों का जीवन समृद्ध बनाना।", url: "https://www.dignityfoundation.org/", isGov: false },
    { title: "Agewell Foundation", titleHi: "एजवेल फाउंडेशन", desc: "Advocacy and healthcare network for elderly persons.", descHi: "बुजुर्गों के लिए वकालत और स्वास्थ्य सेवा नेटवर्क।", url: "https://www.agewellfoundation.org/", isGov: false }
  ],
  animals: [
    { title: "Animal Welfare Board of India (AWBI)", titleHi: "भारतीय जीव जन्तु कल्याण बोर्ड", desc: "Statutory advisory body on animal welfare laws.", descHi: "पशु कल्याण कानूनों पर सांविधिक सलाहकार निकाय।", url: "http://www.awbi.gov.in/", isGov: true },
    { title: "Dept of Animal Husbandry & Dairying", titleHi: "पशुपालन एवं डेयरी विभाग", desc: "Central veterinary services and livestock welfare.", descHi: "केंद्रीय पशु चिकित्सा सेवाएं और पशुधन कल्याण।", url: "https://dahd.nic.in/", isGov: true },
    { title: "PETA India Animal Rescue", titleHi: "पेटा इंडिया पशु बचाव", desc: "Animal protection advocacy and cruelty emergency response.", descHi: "पशु संरक्षण और क्रूरता आपातकालीन सहायता।", url: "https://www.petaindia.com/", isGov: false },
    { title: "Blue Cross of India", titleHi: "ब्लू क्रॉस ऑफ इंडिया", desc: "Stray animal medical care, rescue & shelter services.", descHi: "बेसहारा पशु चिकित्सा और बचाव सेवाएं।", url: "https://bluecrossofindia.org/", isGov: false },
    { title: "Friendicoes SECA Shelter", titleHi: "फ्रेंडिकोस पशु आश्रय", desc: "24/7 animal ambulance, clinic & adoption center.", descHi: "24/7 पशु एम्बुलेंस और गोद लेने का केंद्र।", url: "https://friendicoes.org/", isGov: false },
    { title: "People For Animals (PFA)", titleHi: "पीपल फॉर एनिमल्स (पीएफए)", desc: "India's largest animal welfare organizational network.", descHi: "भारत का सबसे बड़ा पशु कल्याण नेटवर्क।", url: "https://www.peopleforanimalsindia.org/", isGov: false }
  ],
  environment: [
    { title: "Meri LiFE Movement Portal", titleHi: "मेरी लाइफ आंदोलन पोर्टल", desc: "Official Lifestyle for Environment initiative by MoEFCC.", descHi: "पर्यावरण के लिए जीवन शैली का आधिकारिक पोर्टल।", url: "https://merilife.nic.in/", isGov: true },
    { title: "MoEFCC Climate Change Portal", titleHi: "पर्यावरण, वन और जलवायु परिवर्तन मंत्रालय", desc: "Central environment conservation policies & green drives.", descHi: "केंद्रीय पर्यावरण संरक्षण नीतियां और हरित अभियान।", url: "https://moef.gov.in/", isGov: true },
    { title: "National Afforestation Board", titleHi: "राष्ट्रीय वनीकरण बोर्ड", desc: "Tree plantation, forest restoration & eco-drives.", descHi: "वृक्षारोपण और वन बहाली बोर्ड।", url: "https://naeb.nic.in/", isGov: true },
    { title: "WWF India Conservation", titleHi: "डब्ल्यूडब्ल्यूएफ इंडिया संरक्षण", desc: "World Wide Fund for Nature wildlife & environment care.", descHi: "वन्यजीव और प्रकृति संरक्षण फाउंडेशन।", url: "https://www.wwfindia.org/", isGov: false },
    { title: "Greenpeace India", titleHi: "ग्रीनपीस इंडिया", desc: "Clean energy, air quality & environmental campaign network.", descHi: "स्वच्छ ऊर्जा और पर्यावरण अभियान नेटवर्क।", url: "https://www.greenpeace.org/india/", isGov: false },
    { title: "Cauvery Calling (Isha Outreach)", titleHi: "कावेरी कॉलिंग (ईशा आउटरीच)", desc: "Mass tree plantation initiative to revive river basins.", descHi: "नदी घाटियों के पुनरुद्धार के लिए वृक्षारोपण अभियान।", url: "https://www.sadhguru.org/cauvery-calling", isGov: false }
  ],
  crowdfunding: [
    { title: "India Development Foundation (IDF)", titleHi: "इंडिया डेवलपमेंट फाउंडेशन", desc: "Ministry of External Affairs philanthropy & community fund.", descHi: "परोपकार और सामुदायिक विकास कोष।", url: "https://idfc.gov.in/", isGov: true },
    { title: "NITI Aayog Community Initiatives", titleHi: "नीति आयोग सामुदायिक पहल", desc: "Aspirational districts & community crowdfunding oversight.", descHi: "आकांक्षी जिले एवं सामुदायिक विकास निगरानी।", url: "https://niti.gov.in/", isGov: true },
    { title: "Milaap Crowdfunding Network", titleHi: "मिलाप क्राउडफंडिंग नेटवर्क", desc: "India's most trusted medical & personal emergency funding.", descHi: "चिकित्सा और व्यक्तिगत आपातकालीन निधि मंच।", url: "https://milaap.org/", isGov: false },
    { title: "Ketto Social Impact Funding", titleHi: "कीटो सोशल इम्पैक्ट फंडिंग", desc: "Online crowdfunding for medical treatments and education.", descHi: "इलाज और शिक्षा के लिए ऑनलाइन फंड जुटाएं।", url: "https://www.ketto.org/", isGov: false },
    { title: "ImpactGuru Healthcare Fund", titleHi: "इम्पैक्टगुरु हेल्थकेयर फंड", desc: "Medical crowdfunding platform for critical illnesses.", descHi: "गंभीर बीमारियों के लिए मेडिकल क्राउडफंडिंग।", url: "https://www.impactguru.com/", isGov: false },
    { title: "FuelADream Project Funding", titleHi: "फ्यूल-ए-ड्रीम प्रोजेक्ट फंडिंग", desc: "Crowdfunding for social causes, ideas & creative projects.", descHi: "सामाजिक कारणों और विचारों के लिए फंडिंग।", url: "https://www.fueladream.com/", isGov: false }
  ],
  culture: [
    { title: "Ministry of Culture India", titleHi: "संस्कृति मंत्रालय भारत", desc: "National monuments, festivals, art & heritage portal.", descHi: "राष्ट्रीय स्मारक, त्यौहार, कला एवं विरासत पोर्टल।", url: "https://www.indiaculture.gov.in/", isGov: true },
    { title: "Archaeological Survey of India (ASI)", titleHi: "भारतीय पुरातत्व सर्वेक्षण", desc: "Preservation of national heritage sites & monuments.", descHi: "राष्ट्रीय विरासत स्थलों और स्मारकों का संरक्षण।", url: "https://asi.nic.in/", isGov: true },
    { title: "Incredible India Tourism", titleHi: "इन्क्रेडिबल इंडिया (अतुल्य भारत)", desc: "Ministry of Tourism official cultural & heritage guide.", descHi: "पर्यटन मंत्रालय की आधिकारिक सांस्कृतिक निर्देशिका।", url: "https://www.incredibleindia.org/", isGov: true },
    { title: "Sahitya Akademi Portal", titleHi: "साहित्य अकादमी पोर्टल", desc: "National Academy of Letters Indian literature archive.", descHi: "राष्ट्रीय साहित्य अकादमी भारतीय साहित्य संग्रह।", url: "https://sahitya-akademi.gov.in/", isGov: true },
    { title: "Sangeet Natak Akademi", titleHi: "संगीत नाटक अकादमी", desc: "National Academy for Music, Dance and Drama.", descHi: "संगीत, नृत्य और नाटक की राष्ट्रीय अकादमी।", url: "https://sangeetnatak.gov.in/", isGov: true },
    { title: "SPIC MACAY Cultural Heritage", titleHi: "स्पिक मैके सांस्कृतिक विरासत", desc: "Promoting Indian classical music & heritage among youth.", descHi: "युवाओं के बीच भारतीय शास्त्रीय संगीत का प्रचार।", url: "https://spicmacay.org/", isGov: false }
  ],
  disaster: [
    { title: "National Disaster Management (NDMA)", titleHi: "राष्ट्रीय आपदा प्रबंधन प्राधिकरण", desc: "Central emergency alerts, guidelines & disaster response.", descHi: "केंद्रीय आपातकालीन अलर्ट और आपदा प्रबंधन।", url: "https://ndma.gov.in/", isGov: true },
    { title: "National Disaster Response Force (NDRF)", titleHi: "राष्ट्रीय आपदा मोचन बल (एनडीआरएफ)", desc: "Disaster rescue operations & emergency contact.", descHi: "आपदा बचाव कार्य एवं आपातकालीन संपर्क।", url: "https://ndrf.gov.in/", isGov: true },
    { title: "IMD Mausam Weather & Warning", titleHi: "भारत मौसम विज्ञान विभाग", desc: "Official weather hazard warnings & cyclone tracker.", descHi: "आधिकारिक मौसम संबंधी चेतावनियां और चक्रवात ट्रैकर।", url: "https://mausam.imd.gov.in/", isGov: true },
    { title: "SEEDS India Disaster Relief", titleHi: "सीड्स इंडिया आपदा राहत", desc: "Humanitarian organization building resilient communities.", descHi: "आपदा राहत और पुनर्वास संगठन।", url: "https://www.seedsindia.org/", isGov: false },
    { title: "Rapid Response Relief Network", titleHi: "रैपिड रिस्पॉन्स राहत नेटवर्क", desc: "Immediate disaster relief and rescue operation NGO.", descHi: "तत्काल आपदा राहत और बचाव कार्य एनजीओ।", url: "https://www.rapidresponse.org.in/", isGov: false },
    { title: "Habitat for Humanity Relief", titleHi: "हैबिटैट फॉर ह्यूमैनिटी राहत", desc: "Post-disaster shelter rebuilding and sanitation support.", descHi: "आपदा के बाद आवास पुनर्निर्माण और स्वच्छता सहायता।", url: "https://habitatindia.org/", isGov: false }
  ],
  farmer: [
    { title: "PM-KISAN Samman Nidhi", titleHi: "पीएम-किसान सम्मान निधि", desc: "Direct income support portal for Indian farmers.", descHi: "भारतीय किसानों के लिए प्रत्यक्ष आय सहायता पोर्टल।", url: "https://pmkisan.gov.in/", isGov: true },
    { title: "e-NAM National Agriculture Market", titleHi: "ई-नाम राष्ट्रीय कृषि बाजार", desc: "Pan-India electronic trading portal for farm produce.", descHi: "कृषि उपज के लिए अखिल भारतीय इलेक्ट्रॉनिक व्यापार पोर्टल।", url: "https://www.enam.gov.in/", isGov: true },
    { title: "Kisan Call Centre & Agricoop", titleHi: "किसान कॉल सेंटर एवं कृषि विभाग", desc: "Ministry of Agriculture farmer helpline and advisories.", descHi: "कृषि मंत्रालय की किसान हेल्पलाइन और सलाह।", url: "https://agricoop.gov.in/", isGov: true },
    { title: "DeHaat Farmers Network", titleHi: "देहात किसान नेटवर्क", desc: "Agri-tech platform providing seeds, advisory & market linkage.", descHi: "कृषि-तकनीक मंच जो बीज, सलाह और बाजार लिंकेज प्रदान करता है।", url: "https://agridex.com/", isGov: false },
    { title: "Agribazaar Agri Trading", titleHi: "एग्रीबाज़ार कृषि व्यापार", desc: "Digital marketplace for buying & selling agricultural commodities.", descHi: "कृषि जिंसों की खरीद-बिक्री के लिए डिजिटल मार्केटप्लेस।", url: "https://www.agribazaar.com/", isGov: false },
    { title: "ICMR Krishi Vigyan Kendra Network", titleHi: "कृषि विज्ञान केंद्र नेटवर्क", desc: "Grassroots agricultural research & farmer training centers.", descHi: "कृषि अनुसंधान एवं किसान प्रशिक्षण केंद्र।", url: "https://kvk.icar.gov.in/", isGov: true }
  ],
  schemes: [
    { title: "MyScheme Government Portal", titleHi: "मायस्कीम सरकारी पोर्टल", desc: "Search & discover 1,000+ government schemes across India.", descHi: "भारत भर में 1,000+ सरकारी योजनाएं खोजें।", url: "https://www.myscheme.gov.in/", isGov: true },
    { title: "MP e-Services Govt Portal", titleHi: "एम.पी. ई-सेवा पोर्टल", desc: "Madhya Pradesh state government services directory.", descHi: "मध्य प्रदेश राज्य सरकार की सेवाएं निर्देशिका।", url: "https://services.mp.gov.in/eservice/", isGov: true },
    { title: "India.gov.in Schemes Directory", titleHi: "भारत पोर्टल योजना निर्देशिका", desc: "Official catalog of welfare schemes for citizens.", descHi: "नागरिकों के लिए कल्याणकारी योजनाओं की आधिकारिक सूची।", url: "https://www.india.gov.in/my-government/schemes", isGov: true },
    { title: "Jan Samarth National Portal", titleHi: "जन समर्थ राष्ट्रीय पोर्टल", desc: "Single digital portal for government credit-linked schemes.", descHi: "सरकारी क्रेडिट-लिंक्ड योजनाओं के लिए डिजिटल पोर्टल।", url: "https://www.jansamarth.in/", isGov: true },
    { title: "PMAY Urban & Rural Housing", titleHi: "पीएम आवास योजना आवास", desc: "Pradhan Mantri Awas Yojana affordable housing portal.", descHi: "प्रधानमंत्री आवास योजना किफायती आवास पोर्टल।", url: "https://pmaymis.gov.in/", isGov: true },
    { title: "Viksit Bharat Sankalp Portal", titleHi: "विकसित भारत संकल्प पोर्टल", desc: "Central welfare scheme saturation tracking portal.", descHi: "केंद्रीय कल्याणकारी योजना संतृप्ति ट्रैकिंग।", url: "https://viksitbharat.gov.in/", isGov: true }
  ],
  skills: [
    { title: "Skill India Digital Portal", titleHi: "स्किल इंडिया डिजिटल पोर्टल", desc: "Ministry of Skill Development vocational training platform.", descHi: "कौशल विकास मंत्रालय का व्यावसायिक प्रशिक्षण मंच।", url: "https://www.skillindiadigital.gov.in/", isGov: true },
    { title: "PM Kaushal Vikas Yojana (PMKVY)", titleHi: "प्रधानमंत्री कौशल विकास योजना", desc: "Free industry-relevant skill training for Indian youth.", descHi: "भारतीय युवाओं के लिए मुफ्त उद्योग-प्रासंगिक कौशल प्रशिक्षण।", url: "https://pmkvyofficial.org/", isGov: true },
    { title: "NSDC Skill India", titleHi: "राष्ट्रीय कौशल विकास निगम", desc: "National Skill Development Corporation skill programs.", descHi: "राष्ट्रीय कौशल विकास निगम कौशल कार्यक्रम।", url: "https://nsdcindia.org/", isGov: true },
    { title: "Coursera Free Courses", titleHi: "कोर्सेरा फ्री कोर्स", desc: "Global online courses & certificates from top universities.", descHi: "शीर्ष विश्वविद्यालयों से मुफ्त ऑनलाइन पाठ्यक्रम।", url: "https://www.coursera.org/", isGov: false },
    { title: "edX Professional Learning", titleHi: "एड-एक्स व्यावसायिक शिक्षा", desc: "Free online courses from MIT, Harvard & global institutions.", descHi: "एमआईटी और हार्वर्ड से मुफ्त ऑनलाइन पाठ्यक्रम।", url: "https://www.edx.org/", isGov: false },
    { title: "NPTEL IIT Learning Platform", titleHi: "एनपीटीईएल आईआईटी लर्निंग", desc: "Free engineering & technology courses by premier IITs.", descHi: "आईआईटी द्वारा मुफ्त इंजीनियरिंग और तकनीक पाठ्यक्रम।", url: "https://nptel.ac.in/", isGov: false }
  ],
  countries: [
    { title: "Ministry of External Affairs (MEA)", titleHi: "विदेश मंत्रालय भारत", desc: "Official Indian foreign affairs & embassy directory.", descHi: "आधिकारिक भारतीय विदेश नीति एवं दूतावास निर्देशिका।", url: "https://www.mea.gov.in/", isGov: true },
    { title: "Passport Seva Official Portal", titleHi: "पासपोर्ट सेवा आधिकारिक पोर्टल", desc: "Indian passport application & status tracking portal.", descHi: "भारतीय पासपोर्ट आवेदन एवं स्थिति ट्रैकिंग पोर्टल।", url: "https://www.passportindia.gov.in/", isGov: true },
    { title: "Indian Visa Online", titleHi: "इंडियन वीजा ऑनलाइन", desc: "Official Indian e-Visa services portal.", descHi: "आधिकारिक भारतीय ई-वीजा सेवा पोर्टल।", url: "https://indianvisaonline.gov.in/", isGov: true },
    { title: "XE Currency Converter", titleHi: "एक्सई मुद्रा कनवर्टर", desc: "Real-time global currency exchange rates & calculator.", descHi: "वास्तविक समय की वैश्विक मुद्रा विनिमय दरें।", url: "https://www.xe.com/", isGov: false },
    { title: "TimeAndDate World Clock", titleHi: "टाइम-एंड-डेट वर्ल्ड क्लॉक", desc: "Global time zones, sunrise/sunset & city clocks.", descHi: "वैश्विक समय क्षेत्र, सूर्योदय/सूर्यास्त समय।", url: "https://www.timeanddate.com/", isGov: false },
    { title: "United Nations Member States", titleHi: "संयुक्त राष्ट्र सदस्य देश", desc: "Official UN country profiles and international statistics.", descHi: "आधिकारिक संयुक्त राष्ट्र देश प्रोफ़ाइल।", url: "https://www.un.org/", isGov: false }
  ],
  earthquakes: [
    { title: "National Centre for Seismology (NCS)", titleHi: "राष्ट्रीय सीस्मोलॉजी केंद्र", desc: "Ministry of Earth Sciences official earthquake tracker.", descHi: "पृथ्वी विज्ञान मंत्रालय का आधिकारिक भूकंप ट्रैकर।", url: "https://seismo.gov.in/", isGov: true },
    { title: "USGS Global Earthquake Hazards", titleHi: "यूएसजीएस वैश्विक भूकंप निगरानी", desc: "Real-time global seismic monitoring and alerts.", descHi: "वास्तविक समय वैश्विक भूकंपीय निगरानी और अलर्ट।", url: "https://earthquake.usgs.gov/", isGov: true },
    { title: "NDMA Earthquake Safety", titleHi: "एनडीएमए भूकंप सुरक्षा", desc: "National guidelines for earthquake preparedness.", descHi: "भूकंप की तैयारी के लिए राष्ट्रीय दिशानिर्देश।", url: "https://ndma.gov.in/Natural-Hazards/Earthquakes", isGov: true },
    { title: "EMSC European Seismic Monitor", titleHi: "ईएमएससी भूकंप निगरानी", desc: "European-Mediterranean Seismological Centre live alerts.", descHi: "यूरोपीय-भूमध्यसागरीय सीस्मोलॉजिकल सेंटर लाइव अलर्ट।", url: "https://www.emsc-csem.org/", isGov: false },
    { title: "IRIS Global Seismology", titleHi: "आईआरआईएस ग्लोबल सीस्मोलॉजी", desc: "Incorporated Research Institutions for Seismology.", descHi: "सीस्मोलॉजी अनुसंधान संस्थानों का डेटाबेस।", url: "https://www.iris.edu/", isGov: false },
    { title: "Pacific Tsunami Warning Center", titleHi: "प्रशांत सुनामी चेतावनी केंद्र", desc: "Global ocean tsunami warnings & earthquake safety.", descHi: "वैश्विक समुद्री सुनामी चेतावनियाँ और सुरक्षा।", url: "https://www.tsunami.gov/", isGov: false }
  ],
  "fuel-tracker": [
    { title: "Ministry of Petroleum & Natural Gas", titleHi: "पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय", desc: "Central fuel policies and daily pricing standards.", descHi: "केंद्रीय ईंधन नीतियां और दैनिक मूल्य निर्धारण मानक।", url: "https://mopng.gov.in/", isGov: true },
    { title: "Petroleum Planning & Analysis (PPAC)", titleHi: "पेट्रोलियम योजना एवं विश्लेषण सेल", desc: "Official Indian fuel consumption and price analytics.", descHi: "आधिकारिक भारतीय ईंधन खपत और मूल्य विश्लेषण।", url: "https://www.ppac.gov.in/", isGov: true },
    { title: "Indian Oil Fuel Portal", titleHi: "इंडियन ऑयल ईंधन पोर्टल", desc: "IndianOil petrol/diesel locator & daily city fuel rates.", descHi: "इंडियनऑयल पेट्रोल/डीजल लोकेटर और दैनिक मूल्य।", url: "https://www.iocl.com/", isGov: false },
    { title: "Bharat Petroleum (BPCL)", titleHi: "भारत पेट्रोलियम (बीपीसीएल)", desc: "BPCL fuel stations, EV charging & LPG services.", descHi: "बीपीसीएल ईंधन स्टेशन, ईवी चार्जिंग सेवाएं।", url: "https://www.bharatpetroleum.in/", isGov: false },
    { title: "Hindustan Petroleum (HPCL)", titleHi: "हिंदुस्तान पेट्रोलियम (एचपीसीएल)", desc: "HPCL retail outlet locator and LPG booking.", descHi: "एचपीसीएल रिटेल आउटलेट लोकेटर और एलपीजी बुकिंग।", url: "https://www.hindustanpetroleum.com/", isGov: false },
    { title: "FuelPrice India Tracker", titleHi: "फ्यूल-प्राइज इंडिया ट्रैकर", desc: "Track daily petrol, diesel & auto-LPG prices in Indian cities.", descHi: "भारतीय शहरों में दैनिक पेट्रोल, डीजल दरें।", url: "https://fuelprice.io/", isGov: false }
  ],
  "gps-toolkit": [
    { title: "Parivahan Sewa Portal (MoRTH)", titleHi: "परिवहन सेवा पोर्टल", desc: "Ministry of Road Transport driving license & RC portal.", descHi: "सड़क परिवहन मंत्रालय का ड्राइविंग लाइसेंस और आरसी पोर्टल।", url: "https://parivahan.gov.in/", isGov: true },
    { title: "ISRO Bhuvan Geo-Portal", titleHi: "इसरो भुवन भू-पोर्टल", desc: "ISRO Indian 3D satellite map and GIS navigation.", descHi: "इसरो भारतीय 3D उपग्रह मानचित्र और जीआईएस नेविगेशन।", url: "https://bhuvan.nrsc.gov.in/", isGov: true },
    { title: "Google Maps Navigation", titleHi: "गूगल मैप्स नेविगेशन", desc: "Live GPS traffic navigation, parking & route guidance.", descHi: "लाइव जीपीएस ट्रैफिक नेविगेशन और मार्ग मार्गदर्शन।", url: "https://maps.google.com/", isGov: false },
    { title: "OpenStreetMap Global Map", titleHi: "ओपन-स्ट्रीट-मैप ग्लोबल", desc: "Open-source collaborative global street map dataset.", descHi: "ओपन-सोर्स सहयोगी वैश्विक सड़क मानचित्र डेटा।", url: "https://www.openstreetmap.org/", isGov: false },
    { title: "MapMyIndia Mappls", titleHi: "मैपमायइंडिया मैपल्स", desc: "India's indigenous 3D maps and door-step navigation.", descHi: "भारत का स्वदेशी 3D मानचित्र और नेविगेशन।", url: "https://www.mappls.com/", isGov: false },
    { title: "Waze Live Traffic", titleHi: "वेज़ लाइव ट्रैफिक", desc: "Community-driven real-time traffic alerts and road hazards.", descHi: "कम्युनिटी-संचालित वास्तविक समय ट्रैफिक अलर्ट।", url: "https://www.waze.com/", isGov: false }
  ],
  vitals: [
    { title: "ABHA Health Card (ABDM)", titleHi: "आभा हेल्थ कार्ड", desc: "Create & link your digital health records.", descHi: "अपने डिजिटल स्वास्थ्य रिकॉर्ड बनाएं और लिंक करें।", url: "https://abha.abdm.gov.in/", isGov: true },
    { title: "Fit India Movement Portal", titleHi: "फिट इंडिया मूवमेंट", desc: "Government fitness standards and health challenges.", descHi: "सरकारी फिटनेस मानक और स्वास्थ्य चुनौतियां।", url: "https://fitindia.gov.in/", isGov: true },
    { title: "National Health Mission (NHM)", titleHi: "राष्ट्रीय स्वास्थ्य मिशन", desc: "Public health guidelines & vital tracking standards.", descHi: "सार्वजनिक स्वास्थ्य गाइडलाइन और विटल्स मानक।", url: "https://nhm.gov.in/", isGov: true },
    { title: "Healthline Fitness & Vitals", titleHi: "हेल्थलाइन फिटनेस एवं विटल्स", desc: "Evidence-based health, exercise & blood pressure guide.", descHi: "साक्ष्य-आधारित स्वास्थ्य, व्यायाम और बीपी गाइड।", url: "https://www.healthline.com/", isGov: false },
    { title: "WebMD Health Tracker", titleHi: "वेबएमडी हेल्थ ट्रैकर", desc: "Symptom checker, vital metrics & wellness tools.", descHi: "लक्षण चेकर, विटल्स मेट्रिक्स और वेलनेस टूल्स।", url: "https://www.webmd.com/", isGov: false },
    { title: "ICMR Health Guidelines", titleHi: "आईसीएमआर स्वास्थ्य गाइडलाइन", desc: "Indian Council of Medical Research health advisories.", descHi: "भारतीय चिकित्सा अनुसंधान परिषद की सलाह।", url: "https://www.icmr.gov.in/", isGov: true }
  ],
  medications: [
    { title: "PM Janaushadhi Kendras", titleHi: "प्रधानमंत्री जनऔषधि केंद्र", desc: "Find nearest PMBJP affordable medicine store.", descHi: "निकटतम पीएमबीजेपी सस्ती दवा स्टोर खोजें।", url: "https://janaushadhi.gov.in/", isGov: true },
    { title: "eSanjeevani OPD Consult", titleHi: "ई-संजीवनी ओपीडी", desc: "Free telemedicine consultation with government doctors.", descHi: "सरकारी डॉक्टरों के साथ मुफ्त टेलीमेडिसिन परामर्श।", url: "https://esanjeevaniopd.in/", isGov: true },
    { title: "Tata 1mg Pill Finder", titleHi: "टाटा 1एमजी दवा निर्देशिका", desc: "Search prescription drugs, side effects & dosage reminders.", descHi: "दवाएं खोजें, दुष्प्रभाव और खुराक अनुस्मारक।", url: "https://www.1mg.com/", isGov: false },
    { title: "PharmEasy Reminder Guide", titleHi: "फार्मइजी मेडिसिन गाइड", desc: "Comprehensive medicine usage guidelines & delivery.", descHi: "व्यापक दवा उपयोग दिशानिर्देश और डिलीवरी।", url: "https://pharmeasy.in/", isGov: false },
    { title: "Medscape Drug Interaction", titleHi: "मेडस्केप ड्रग गाइड", desc: "Clinical drug interaction & dosage safety checker.", descHi: "नैदानिक दवा पारस्परिक क्रिया और खुराक सुरक्षा चेकर।", url: "https://www.medscape.com/", isGov: false },
    { title: "RxList Medical Reference", titleHi: "आरएक्स-लिस्ट मेडिकल संदर्भ", desc: "Medical prescription drug database and pill identifier.", descHi: "मेडिकल पर्चे दवा डेटाबेस और गोली पहचानकर्ता।", url: "https://www.rxlist.com/", isGov: false }
  ],
  "medical-dict": [
    { title: "National Health Portal Dictionary", titleHi: "राष्ट्रीय स्वास्थ्य पोर्टल शब्दकोश", desc: "Official medical dictionary, diseases & first-aid guide.", descHi: "आधिकारिक चिकित्सा शब्दकोश, बीमारियां और प्राथमिक चिकित्सा।", url: "https://www.nhp.gov.in/", isGov: true },
    { title: "AIIMS Health Information", titleHi: "एम्स स्वास्थ्य सूचना पोर्टल", desc: "All India Institute of Medical Sciences patient guide.", descHi: "अखिल भारतीय आयुर्विज्ञान संस्थान रोगी गाइड।", url: "https://www.aiims.edu/", isGov: true },
    { title: "Mayo Clinic Medical Terms", titleHi: "मेयो क्लिनिक मेडिकल गाइड", desc: "World-class medical dictionary & treatment reference.", descHi: "विश्व स्तरीय चिकित्सा शब्दकोश और उपचार संदर्भ।", url: "https://www.mayoclinic.org/", isGov: false },
    { title: "WebMD Medical Glossary", titleHi: "वेबएमडी मेडिकल शब्दावली", desc: "Comprehensive diseases & condition reference library.", descHi: "व्यापक बीमारियां और स्थिति संदर्भ पुस्तकालय।", url: "https://www.webmd.com/", isGov: false },
    { title: "PubMed Central Archive", titleHi: "पबमेड सेंट्रल आर्काइव", desc: "Free biomedical and life sciences journal literature.", descHi: "मुफ्त बायोमेडिकल और जीवन विज्ञान शोध साहित्य।", url: "https://www.ncbi.nlm.nih.gov/pmc/", isGov: false },
    { title: "Merck Manual Consumer Edition", titleHi: "मर्क मैनुअल उपभोक्ता संस्करण", desc: "Trusted medical medical information for consumers.", descHi: "उपभोक्ताओं के लिए विश्वसनीय चिकित्सा जानकारी।", url: "https://www.merckmanuals.com/home", isGov: false }
  ],
  sos: [
    { title: "112 India Emergency System", titleHi: "112 इंडिया आपातकालीन प्रणाली", desc: "Pan-India single emergency contact number.", descHi: "अखिल भारतीय एकल आपातकालीन संपर्क नंबर।", url: "https://112.gov.in/", isGov: true },
    { title: "National Disaster Response NDMA", titleHi: "राष्ट्रीय आपदा प्रबंधन प्राधिकरण", desc: "Emergency crisis action & disaster relief.", descHi: "आपातकालीन संकट कार्रवाई और आपदा राहत।", url: "https://ndma.gov.in/", isGov: true },
    { title: "Railway Security Helpline 139", titleHi: "रेलवे सुरक्षा हेल्पलाइन 139", desc: "Indian Railways 24/7 passenger safety & SOS helpline.", descHi: "भारतीय रेलवे 24/7 यात्री सुरक्षा और एसओएस हेल्पलाइन।", url: "https://railmadad.indianrailways.gov.in/", isGov: true },
    { title: "National Cyber Crime Helpline 1930", titleHi: "राष्ट्रीय साइबर अपराध हेल्पलाइन 1930", desc: "Report financial cyber frauds and emergency cyber crimes.", descHi: "वित्तीय साइबर धोखाधड़ी और साइबर अपराध रिपोर्ट करें।", url: "https://cybercrime.gov.in/", isGov: true },
    { title: "Emergency Response System ERSS", titleHi: "आपातकालीन प्रतिक्रिया सहायता प्रणाली", desc: "State-level emergency dispatch & location tracking.", descHi: "राज्य-स्तरीय आपातकालीन प्रेषण और स्थान ट्रैकिंग।", url: "https://erss.in/", isGov: true },
    { title: "Childline Emergency 1098", titleHi: "चाइल्डलाइन आपातकालीन 1098", desc: "24/7 emergency helpline for children in distress.", descHi: "संकट में बच्चों के लिए 24/7 आपातकालीन हेल्पलाइन।", url: "https://childlineindia.org/", isGov: false }
  ],
  "period-tracker": [
    { title: "Rashtriya Kishor Swasthya (RKSK)", titleHi: "राष्ट्रीय किशोर स्वास्थ्य कार्यक्रम", desc: "Ministry of Health adolescent health & wellness portal.", descHi: "स्वास्थ्य मंत्रालय का किशोर स्वास्थ्य एवं कल्याण पोर्टल।", url: "https://nhm.gov.in/", isGov: true },
    { title: "Ministry of Women & Child (WCD)", titleHi: "महिला एवं बाल विकास मंत्रालय", desc: "Women health schemes and hygiene initiatives.", descHi: "महिला स्वास्थ्य योजनाएं और स्वच्छता पहल।", url: "https://wcd.nic.in/", isGov: true },
    { title: "Clue Cycle & Reproductive Health", titleHi: "क्लूट मासिक धर्म एवं स्वास्थ्य", desc: "Scientific menstrual cycle tracking & reproductive health.", descHi: "वैज्ञानिक मासिक धर्म चक्र ट्रैकिंग और स्वास्थ्य।", url: "https://helloclue.com/", isGov: false },
    { title: "Flo Women Health & Period Guide", titleHi: "फ्लो महिला स्वास्थ्य गाइड", desc: "Period calendar, ovulation calculator & health insights.", descHi: "पीरियड कैलेंडर, ओव्यूलेशन कैलकुलेटर।", url: "https://flo.health/", isGov: false },
    { title: "UNICEF Menstrual Hygiene Guide", titleHi: "यूनिसेफ मासिक धर्म स्वच्छता गाइड", desc: "Global educational resources on period health & dignity.", descHi: "पीरियड स्वास्थ्य पर वैश्विक शैक्षिक संसाधन।", url: "https://www.unicef.org/", isGov: false },
    { title: "Period Positive India Network", titleHi: "पीरियड पॉजिटिव इंडिया", desc: "Menstrual hygiene awareness & eco-friendly period products.", descHi: "मासिक धर्म स्वच्छता जागरूकता और पर्यावरण-अनुकूल उत्पाद।", url: "https://periodpositive.org/", isGov: false }
  ],
  "child-tracker": [
    { title: "Poshan Tracker Portal", titleHi: "पोषण ट्रैकर पोर्टल", desc: "Ministry of Women & Child Development child growth tracker.", descHi: "महिला एवं बाल विकास मंत्रालय का बाल विकास ट्रैकर।", url: "https://poshantracker.in/", isGov: true },
    { title: "U-WIN Universal Immunization", titleHi: "यू-विन सार्वभौमिक टीकाकरण", desc: "Child vaccination passport and scheduling portal.", descHi: "बाल टीकाकरण पासपोर्ट और निर्धारण पोर्टल।", url: "https://uwin.mohfw.gov.in/", isGov: true },
    { title: "NCPCR Child Rights Protection", titleHi: "राष्ट्रीय बाल अधिकार संरक्षण आयोग", desc: "National Commission for Protection of Child Rights.", descHi: "राष्ट्रीय बाल अधिकार संरक्षण आयोग।", url: "https://ncpcr.gov.in/", isGov: true },
    { title: "UNICEF Child Development", titleHi: "यूनिसेफ बाल विकास गाइड", desc: "Early childhood development milestones and care.", descHi: "प्रारंभिक बचपन के विकास के मील के पत्थर।", url: "https://www.unicef.org/", isGov: false },
    { title: "Child Rights and You (CRY)", titleHi: "चाइल्ड राइट्स एंड यू (क्राई)", desc: "Indian NGO restoring child rights, health & nutrition.", descHi: "बाल अधिकारों, स्वास्थ्य और पोषण को बहाल करने वाला एनजीओ।", url: "https://www.cry.org/", isGov: false },
    { title: "FirstCry Parenting Guide", titleHi: "फर्स्टक्राई पेरेंटिंग गाइड", desc: "Child milestone tracker, baby care & vaccination chart.", descHi: "बाल मील का पत्थर ट्रैकर, शिशु देखभाल और टीका चार्ट।", url: "https://www.firstcry.com/intelli/", isGov: false }
  ],
  "resume-builder": [
    { title: "National Career Service (NCS)", titleHi: "राष्ट्रीय करियर सेवा", desc: "Create profile on India's official employment portal.", descHi: "भारत के आधिकारिक रोजगार पोर्टल पर प्रोफाइल बनाएं।", url: "https://www.ncs.gov.in/", isGov: true },
    { title: "AICTE Internship Portal", titleHi: "एआईसीटीई इंटर्नशिप पोर्टल", desc: "Official student internships across government & industry.", descHi: "सरकार और उद्योग में आधिकारिक छात्र इंटर्नशिप।", url: "https://internship.aicte-india.org/", isGov: true },
    { title: "Canva Resume Builder", titleHi: "कैनवा बायोडाटा निर्माता", desc: "Professional modern resume templates and designer.", descHi: "पेशेवर आधुनिक बायोडाटा टेम्प्लेट और डिज़ाइनर।", url: "https://www.canva.com/resumes/templates/", isGov: false },
    { title: "Novoresume Builder", titleHi: "नोवोरेज़्यूमे बिल्डर", desc: "Professional ATS-friendly resume creator.", descHi: "पेशेवर एटीएस-फ्रेंडली बायोडाटा निर्माता।", url: "https://novoresume.com/", isGov: false },
    { title: "Zety Career Resume Builder", titleHi: "ज़ेटी करियर बायोडाटा", desc: "Fast resume builder with professional formatting tips.", descHi: "पेशेवर फ़ॉर्मेटिंग युक्तियों के साथ बायोडाटा निर्माता।", url: "https://zety.com/", isGov: false },
    { title: "Resume.com Free Tools", titleHi: "रेज़्यूमे.कॉम मुफ्त उपकरण", desc: "Create, edit and download free PDF resumes.", descHi: "मुफ्त पीडीएफ बायोडाटा बनाएं, संपादित करें और डाउनलोड करें।", url: "https://www.resume.com/", isGov: false }
  ],
  "doc-scanner": [
    { title: "DigiLocker Official Portal", titleHi: "डिजिलॉकर आधिकारिक पोर्टल", desc: "Store & verify your authentic digital documents safely.", descHi: "अपने प्रामाणिक डिजिटल दस्तावेज़ों को सुरक्षित रूप से स्टोर करें।", url: "https://www.digilocker.gov.in/", isGov: true },
    { title: "e-Sign India Portal", titleHi: "ई-साइन इंडिया पोर्टल", desc: "Government Aadhaar-based digital document signing.", descHi: "सरकारी आधार आधारित डिजिटल दस्तावेज़ हस्ताक्षर।", url: "https://esign.gov.in/", isGov: true },
    { title: "Adobe Acrobat Online Tools", titleHi: "एडोब एक्रोबैट ऑनलाइन टूल्स", desc: "Merge, compress, scan & edit PDF documents.", descHi: "पीडीएफ दस्तावेजों को मर्ज, कंप्रेस, स्कैन और एडिट करें।", url: "https://www.adobe.com/acrobat/online.html", isGov: false },
    { title: "SmallPDF Document Converter", titleHi: "स्मॉल-पीडीएफ कन्वर्टर", desc: "Compress, convert & scan images to PDF online.", descHi: "ऑनलाइन छवियों को पीडीएफ में कंप्रेस और स्कैन करें।", url: "https://smallpdf.com/", isGov: false },
    { title: "ILovePDF Online PDF Tools", titleHi: "आई-लव-पीडीएफ टूल्स", desc: "Every tool you need to work with PDFs in one place.", descHi: "पीडीएफ के साथ काम करने के लिए हर जरूरी टूल।", url: "https://www.ilovepdf.com/", isGov: false },
    { title: "CamScanner Web Portal", titleHi: "कैमस्कैनर वेब पोर्टल", desc: "Document scanning, OCR text recognition & PDF tools.", descHi: "दस्तावेज़ स्कैनिंग, ओसीआर टेक्स्ट पहचान।", url: "https://www.camscanner.com/", isGov: false }
  ],
  "ai-chat": [
    { title: "Bhashini National AI Mission", titleHi: "भाषिणी राष्ट्रीय एआई मिशन", desc: "Government of India AI-driven Indian language translation.", descHi: "भारत सरकार का एआई-संचालित भारतीय भाषा अनुवाद।", url: "https://bhashini.gov.in/", isGov: true },
    { title: "IndiaAI Official Portal", titleHi: "इंडिया-एआई आधिकारिक पोर्टल", desc: "National AI portal for research, tools & datasets.", descHi: "अनुसंधान, उपकरण और डेटासेट के लिए राष्ट्रीय एआई पोर्टल।", url: "https://indiaai.gov.in/", isGov: true },
    { title: "ChatGPT Official Platform", titleHi: "चैट-जीपीटी प्लेटफॉर्म", desc: "OpenAI conversational AI assistant for learning & coding.", descHi: "सीखने और कोडिंग के लिए ओपनएआई एआई सहायक।", url: "https://chatgpt.com/", isGov: false },
    { title: "Google Gemini AI Portal", titleHi: "गूगल जेमिनी एआई पोर्टल", desc: "Google advanced multimodal AI for research & writing.", descHi: "अनुसंधान और लेखन के लिए गूगल जेमिनी एआई।", url: "https://gemini.google.com/", isGov: false },
    { title: "Anthropic Claude AI Portal", titleHi: "एंथ्रोपिक क्लॉड एआई", desc: "State-of-the-art AI assistant for analysis & coding.", descHi: "विश्लेषण और कोडिंग के लिए अत्याधुनिक एआई।", url: "https://claude.ai/", isGov: false },
    { title: "HuggingFace Open AI Hub", titleHi: "हगिंगफ़ेस ओपन एआई हब", desc: "Open source artificial intelligence models and tools.", descHi: "ओपन सोर्स कृत्रिम बुद्धिमत्ता मॉडल और उपकरण।", url: "https://huggingface.co/", isGov: false }
  ],
  "story-library": [
    { title: "National Digital Library of India", titleHi: "भारत का राष्ट्रीय डिजिटल पुस्तकालय", desc: "Virtual repository of educational resources by IIT Kharagpur.", descHi: "शैक्षणिक संसाधनों का आभासी भंडार।", url: "https://ndl.iitkgp.ac.in/", isGov: true },
    { title: "Sahitya Akademi Portal", titleHi: "साहित्य अकादमी पोर्टल", desc: "National Academy of Letters Indian literature archive.", descHi: "राष्ट्रीय साहित्य अकादमी भारतीय साहित्य संग्रह।", url: "https://sahitya-akademi.gov.in/", isGov: true },
    { title: "LibriVox Free Public Audiobooks", titleHi: "लिब्रीवॉक्स मुफ्त ऑडियोबुक्स", desc: "Free public domain audiobooks read by volunteers.", descHi: "स्वयंसेवकों द्वारा पढ़ी जाने वाली मुफ्त सार्वजनिक ऑडियो पुस्तकें।", url: "https://librivox.org/", isGov: false },
    { title: "Project Gutenberg eBooks", titleHi: "प्रोजेक्ट गुटेनबर्ग ई-बुक्स", desc: "Library of over 70,000 free public domain ebooks.", descHi: "70,000 से अधिक मुफ्त ई-पुस्तकों का पुस्तकालय।", url: "https://www.gutenberg.org/", isGov: false },
    { title: "Internet Archive Literature", titleHi: "इंटरनेट आर्काइव साहित्य", desc: "Non-profit digital library of millions of free books.", descHi: "लाखों मुफ्त पुस्तकों का गैर-लाभकारी डिजिटल पुस्तकालय।", url: "https://archive.org/", isGov: false },
    { title: "StoryWeaver Children Library", titleHi: "स्टोरीवीवर बाल पुस्तकालय", desc: "Open source multilingual children's storybook platform.", descHi: "ओपन सोर्स बहुभाषी बच्चों की कहानी पुस्तकालय।", url: "https://storyweaver.org.in/", isGov: false }
  ],
  "hindu-calendar": [
    { title: "Rashtriya Panchang (IMD)", titleHi: "राष्ट्रीय पंचांग (आईएमडी)", desc: "Official Indian National Calendar published by Poshtik.", descHi: "पोष्टिक द्वारा प्रकाशित आधिकारिक भारतीय राष्ट्रीय पंचांग।", url: "https://poshtik.gov.in/", isGov: true },
    { title: "Ministry of Culture Festivals", titleHi: "संस्कृति मंत्रालय त्यौहार", desc: "Official calendar of Indian heritage & traditional festivals.", descHi: "भारतीय विरासत और पारंपरिक त्योहारों का आधिकारिक कैलेंडर।", url: "https://www.indiaculture.gov.in/", isGov: true },
    { title: "Drik Panchang Official", titleHi: "दृक पंचांग आधिकारिक पोर्टल", desc: "Accurate Hindu Panchang, Tithi, Nakshatra & Muhurat finder.", descHi: "सटीक हिंदू पंचांग, तिथि, नक्षत्र और मुहूर्त।", url: "https://www.drikpanchang.com/", isGov: false },
    { title: "AstroSage Hindu Calendar", titleHi: "एस्ट्रोसेज हिंदू पंचांग", desc: "Detailed Indian festivals, Vrat dates and Hindu calendar.", descHi: "विस्तृत भारतीय त्यौहार, व्रत तिथियां और पंचांग।", url: "https://www.astrosage.com/panchang/", isGov: false },
    { title: "Hindu Blog Festivals Guide", titleHi: "हिंदू ब्लॉग त्यौहार गाइड", desc: "Traditions, rituals, fasts and auspicious dates guide.", descHi: "परंपराएं, अनुष्ठान, व्रत और शुभ तिथियां।", url: "https://www.hindu-blog.com/", isGov: false },
    { title: "TemplePurohit Cultural Guide", titleHi: "मंदिर पुरोहित सांस्कृतिक निर्देशिका", desc: "Vedic culture, temple history and festival calendars.", descHi: "वैदिक संस्कृति, मंदिर का इतिहास और त्योहारों का पंचांग।", url: "https://www.templepurohit.com/", isGov: false }
  ],
  "news-feed": [
    { title: "Press Information Bureau (PIB)", titleHi: "प्रेस सूचना ब्यूरो (पीआईबी)", desc: "Official press releases of the Government of India.", descHi: "भारत सरकार की आधिकारिक प्रेस विज्ञप्तियां।", url: "https://pib.gov.in/", isGov: true },
    { title: "DD News Official Portal", titleHi: "डीडी न्यूज आधिकारिक पोर्टल", desc: "Doordarshan national news broadcasting network.", descHi: "दूरदर्शन राष्ट्रीय समाचार प्रसारण नेटवर्क।", url: "https://ddnews.gov.in/", isGov: true },
    { title: "All India Radio News (AIR)", titleHi: "ऑल इंडिया रेडियो न्यूज", desc: "News Services Division of All India Radio.", descHi: "ऑल इंडिया रेडियो का समाचार सेवा प्रभाग।", url: "https://newsonair.gov.in/", isGov: true },
    { title: "Press Trust of India (PTI)", titleHi: "प्रेस ट्रस्ट ऑफ इंडिया (पीटीआई)", desc: "India's premier news agency covering national & world news.", descHi: "राष्ट्रीय और विश्व समाचारों को कवर करने वाली समाचार एजेंसी।", url: "https://www.ptinews.com/", isGov: false },
    { title: "Asian News International (ANI)", titleHi: "एशियाई समाचार अंतर्राष्ट्रीय (एएनआई)", desc: "Leading multimedia news agency in South Asia.", descHi: "दक्षिण एशिया की अग्रणी मल्टीमीडिया समाचार एजेंसी।", url: "https://www.aninews.in/", isGov: false },
    { title: "Google News India Portal", titleHi: "गूगल न्यूज इंडिया पोर्टल", desc: "Aggregated real-time headlines from top Indian publishers.", descHi: "शीर्ष भारतीय प्रकाशकों से वास्तविक समय की प्रमुख समाचार।", url: "https://news.google.com/", isGov: false }
  ],
  "internet-radio": [
    { title: "Prasar Bharati AIR Live", titleHi: "प्रसार भारती एआईआर लाइव", desc: "Official Prasar Bharati radio live streaming platform.", descHi: "आधिकारिक प्रसार भारती रेडियो लाइव स्ट्रीमिंग प्लेटफॉर्म।", url: "https://prasarbharati.gov.in/", isGov: true },
    { title: "All India Radio National", titleHi: "ऑल इंडिया रेडियो राष्ट्रीय", desc: "AIR national bulletin & regional channels.", descHi: "एआईआर राष्ट्रीय बुलेटिन और क्षेत्रीय चैनल।", url: "https://newsonair.gov.in/", isGov: true },
    { title: "Radio Garden Global Portal", titleHi: "रेडियो गार्डन ग्लोबल पोर्टल", desc: "Interactive global live radio globe with thousands of stations.", descHi: "हजारों स्टेशनों के साथ इंटरैक्टिव वैश्विक रेडियो गार्डन।", url: "https://radio.garden/", isGov: false },
    { title: "TuneIn India Stations", titleHi: "ट्यून-इन इंडिया रेडियो", desc: "Listen to live news, sports and music radio streams.", descHi: "लाइव समाचार, खेल और संगीत रेडियो स्ट्रीम सुनें।", url: "https://tunein.com/", isGov: false },
    { title: "Radio India Online Directory", titleHi: "रेडियो इंडिया ऑनलाइन निर्देशिका", desc: "Free streaming of Indian FM & AM radio channels.", descHi: "भारतीय एफएम और एएम रेडियो चैनलों की मुफ्त स्ट्रीमिंग।", url: "https://radioindia.in/", isGov: false },
    { title: "World Radio Map Platform", titleHi: "वर्ल्ड रेडियो मैप प्लेटफॉर्म", desc: "Radio frequency maps & online streams worldwide.", descHi: "रेडियो फ़्रीक्वेंसी मैप्स और ऑनलाइन स्ट्रीम्स।", url: "http://worldradiomap.com/", isGov: false }
  ],
  "transit-planner": [
    { title: "Parivahan Mobility (MoRTH)", titleHi: "परिवहन मोबिलिटी", desc: "National Common Mobility Card & transit advisories.", descHi: "राष्ट्रीय सामान्य गतिशीलता कार्ड और पारगमन सलाह।", url: "https://morth.nic.in/", isGov: true },
    { title: "Indian Railways IRCTC", titleHi: "भारतीय रेलवे आईआरसीटीसी", desc: "Official Indian Railways ticket booking & train status.", descHi: "आधिकारिक भारतीय रेलवे टिकट बुकिंग और ट्रेन स्थिति।", url: "https://www.irctc.co.in/", isGov: true },
    { title: "MP Metro Rail Corporation", titleHi: "एम.पी. मेट्रो रेल कॉर्पोरेशन", desc: "Madhya Pradesh metro transit routes & project updates.", descHi: "मध्य प्रदेश मेट्रो ट्रांजिट मार्ग और परियोजना अपडेट।", url: "https://mpmetrorail.com/", isGov: true },
    { title: "RedBus Ticket Planner", titleHi: "रेडबस टिकट प्लाक", desc: "Book bus tickets across 3,000+ bus operators in India.", descHi: "भारत में 3,000+ बस ऑपरेटरों में बस टिकट बुक करें।", url: "https://www.redbus.in/", isGov: false },
    { title: "Ixigo Train & Flight Transit", titleHi: "इक्सिगो ट्रेन एवं फ्लाइट", desc: "Live train running status, PNR status & fare alerts.", descHi: "लाइव ट्रेन स्थिति, पीएनआर स्थिति और किराए की चेतावनी।", url: "https://www.ixigo.com/", isGov: false },
    { title: "Moovit Urban Transit App", titleHi: "मूविट अर्बन ट्रांजिट गाइड", desc: "Real-time bus schedules, metro maps & transit planner.", descHi: "रियल-टाइम बस समय सारणी, मेट्रो मानचित्र।", url: "https://moovitapp.com/", isGov: false }
  ],
  youth: [
    { title: "Mera Yuva Bharat (MY Bharat)", titleHi: "मेरा युवा भारत (माय भारत)", desc: "Autonomous body for youth development & civic participation.", descHi: "युवा विकास और नागरिक भागीदारी के लिए स्वायत्त निकाय।", url: "https://mybharat.gov.in/", isGov: true },
    { title: "Ministry of Youth Affairs & Sports", titleHi: "युवा कार्यक्रम एवं खेल मंत्रालय", desc: "Youth empowerment, sports grants & National Youth Awards.", descHi: "युवा सशक्तिकरण, खेल अनुदान और राष्ट्रीय युवा पुरस्कार।", url: "https://yas.nic.in/", isGov: true },
    { title: "Khelo India Portal", titleHi: "खेलो इंडिया पोर्टल", desc: "National program for development of sports in India.", descHi: "भारत में खेलों के विकास के लिए राष्ट्रीय कार्यक्रम।", url: "https://kheloindia.gov.in/", isGov: true },
    { title: "AIESEC Youth Leadership", titleHi: "आयसेक युवा नेतृत्व नेटवर्क", desc: "Global youth leadership and international internship portal.", descHi: "वैश्विक युवा नेतृत्व और अंतर्राष्ट्रीय इंटर्नशिप।", url: "https://aiesec.org/", isGov: false },
    { title: "Youth Ki Awaaz Platform", titleHi: "युवा की आवाज प्लेटफॉर्म", desc: "India's largest youth writing and civic advocacy network.", descHi: "भारत का सबसे बड़ा युवा लेखन और नागरिक नेटवर्क।", url: "https://www.youthkiawaaz.com/", isGov: false },
    { title: "Commonwealth Youth Council", titleHi: "कॉमनवेल्थ यूथ काउंसिल", desc: "Global youth empowerment initiative across 56 nations.", descHi: "56 देशों में वैश्विक युवा सशक्तिकरण पहल।", url: "https://commonwealthyouth.org/", isGov: false }
  ],
  nation: [
    { title: "MyGov India Citizen Portal", titleHi: "मायगव इंडिया नागरिक पोर्टल", desc: "Participate in nation building, policy discussions & polls.", descHi: "राष्ट्र निर्माण, नीति चर्चा और सर्वेक्षणों में भाग लें।", url: "https://www.mygov.in/", isGov: true },
    { title: "Kartavya Civic Duty Portal", titleHi: "कर्तव्य नागरिक पोर्टल", desc: "Citizen fundamental duties awareness & nation building.", descHi: "नागरिक मौलिक कर्तव्य जागरूकता और राष्ट्र निर्माण।", url: "https://kartavya.gov.in/", isGov: true },
    { title: "Azadi Ka Amrit Mahotsav", titleHi: "आजादी का अमृत महोत्सव", desc: "National celebrations & patriotic initiatives.", descHi: "राष्ट्रीय समारोह और देशभक्तिपूर्ण पहल।", url: "https://amritmahotsav.nic.in/", isGov: true },
    { title: "NITI Aayog India Knowledge", titleHi: "नीति आयोग भारत ज्ञान हब", desc: "National policy research, aspirational districts & development.", descHi: "राष्ट्रीय नीति अनुसंधान और विकास।", url: "https://niti.gov.in/", isGov: true },
    { title: "Constitution of India Archive", titleHi: "भारत का संविधान पोर्टल", desc: "Interactive digital archive of the Constitution of India.", descHi: "भारत के संविधान का डिजिटल संग्रह।", url: "https://www.constitutionofindia.net/", isGov: false },
    { title: "National Informatics Centre (NIC)", titleHi: "राष्ट्रीय सूचना विज्ञान केंद्र", desc: "Technology backbone of Indian e-governance.", descHi: "भारतीय ई-गवर्नेंस का प्रौद्योगिकी रीढ़।", url: "https://www.nic.in/", isGov: true }
  ]
};

export function getGovLinksForService(serviceId: string): GovLink[] {
  return SERVICE_GOV_LINKS[serviceId] || [
    { title: "National Portal of India", titleHi: "भारत का राष्ट्रीय पोर्टल", desc: "Official single window access to government services.", descHi: "सरकारी सेवाओं की आधिकारिक एकल खिड़की।", url: "https://www.india.gov.in/", isGov: true },
    { title: "MP e-Services Portal", titleHi: "एम.पी. ई-सेवा पोर्टल", desc: "Madhya Pradesh state e-services directory.", descHi: "मध्य प्रदेश राज्य ई-सेवाएं निर्देशिका।", url: "https://services.mp.gov.in/eservice/", isGov: true }
  ];
}
