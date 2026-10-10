export interface GovLink {
  title: string;
  titleHi: string;
  desc: string;
  descHi: string;
  url: string;
  category?: string;
  isGov?: boolean; // true = Official Govt portal, false = Useful Resource / Internal Tool
}

export const SERVICE_GOV_LINKS: Record<string, GovLink[]> = {
  card: [
    { title: "Jan Seva Digital Application", titleHi: "जन सेवा डिजिटल आवेदन", desc: "Apply for your verified digital Jan Seva Identity Card.", descHi: "अपने सत्यापित जन सेवा पहचान पत्र के लिए आवेदन करें।", url: "/jan-seva-card", isGov: false },
    { title: "MP e-District Citizen Services", titleHi: "एम.पी. ई-डिस्ट्रिक्ट नागरिक सेवाएं", desc: "Official MP government portal for domicile, income & caste certificates.", descHi: "मूल निवासी, आय और जाति प्रमाण पत्र के लिए आधिकारिक पोर्टल।", url: "https://edistrict.mp.gov.in/", isGov: true },
    { title: "DigiLocker Identity Documents", titleHi: "डिजिलॉकर पहचान पत्र", desc: "Access Aadhaar, PAN and verified digital documents directly.", descHi: "आधार, पैन और सत्यापित डिजिटल दस्तावेज सीधे प्राप्त करें।", url: "https://www.digilocker.gov.in/", isGov: true },
    { title: "National Portal of India", titleHi: "भारत का राष्ट्रीय पोर्टल", desc: "Single window access to central and state government services.", descHi: "केंद्रीय और राज्य सरकार की सेवाओं तक पहुंच।", url: "https://www.india.gov.in/", isGov: true }
  ],
  blood: [
    { title: "RPF Blood Connect", titleHi: "आरपीएफ ब्लड कनेक्ट", desc: "Community emergency blood requests and donor volunteer network.", descHi: "सामुदायिक आपातकालीन रक्तदान सहायता एवं स्वयंसेवक नेटवर्क।", url: "/blood-network", isGov: false },
    { title: "e-RaktKosh Portal", titleHi: "ई-रक्तकोश पोर्टल", desc: "Centralized government blood availability, bank directory & donor finder.", descHi: "स्वास्थ्य मंत्रालय द्वारा केंद्रीयकृत रक्त बैंक प्रबंधन एवं दाता खोज।", url: "https://www.eraktkosh.in/", isGov: true },
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
    { title: "CPGRAMS Public Grievance Portal", titleHi: "सीपीजीआरएएमएस लोक शिकायत पोर्टल", desc: "Govt of India centralized public grievance redress and monitoring system.", descHi: "केंद्रीय लोक शिकायत निवारण और निगरानी प्रणाली।", url: "https://pgportal.gov.in/", isGov: true },
    { title: "MP CM Helpline 181", titleHi: "एम.पी. सीएम हेल्पलाइन 181", desc: "Madhya Pradesh 24x7 citizen grievance and citizen charter portal.", descHi: "मध्य प्रदेश 24x7 नागरिक शिकायत पोर्टल।", url: "https://cmhelpline.mp.gov.in/", isGov: true },
    { title: "National Consumer Helpline", titleHi: "राष्ट्रीय उपभोक्ता हेल्पलाइन", desc: "Official consumer complaint, grievance and dispute resolution support.", descHi: "उपभोक्ता शिकायत और विवाद निवारण पोर्टल।", url: "https://consumerhelpline.gov.in/", isGov: true },
    { title: "RTI Online Portal", titleHi: "आरटीआई ऑनलाइन पोर्टल", desc: "File Right to Information requests online to central ministries & depts.", descHi: "केंद्रीय मंत्रालयों में ऑनलाइन आरटीआई आवेदन फाइल करें।", url: "https://rtionline.gov.in/", isGov: true },
    { title: "National Legal Services Authority (NALSA)", titleHi: "राष्ट्रीय कानूनी सेवा प्राधिकरण", desc: "Free legal aid & Lok Adalat grievance redressal.", descHi: "निःशुल्क कानूनी सहायता और लोक अदालत।", url: "https://nalsa.gov.in/", isGov: true },
    { title: "National Human Rights Commission (NHRC)", titleHi: "राष्ट्रीय मानव अधिकार आयोग", desc: "Human rights complaint & grievance redress portal.", descHi: "मानव अधिकार शिकायत निवारण पोर्टल।", url: "https://nhrc.nic.in/", isGov: true }
  ],
  volunteers: [
    { title: "MyGov Volunteer Portal", titleHi: "मायगव स्वयंसेवक पोर्टल", desc: "Official Government of India citizen volunteer network and nation building drives.", descHi: "भारत सरकार का आधिकारिक नागरिक स्वयंसेवक नेटवर्क।", url: "https://www.mygov.in/", isGov: true },
    { title: "National Service Scheme (NSS)", titleHi: "राष्ट्रीय सेवा योजना (एन.एस.एस.)", desc: "Ministry of Youth Affairs student network for community development.", descHi: "युवा कार्यक्रम मंत्रालय का छात्र स्वयंसेवक नेटवर्क।", url: "https://nss.gov.in/", isGov: true },
    { title: "UN Volunteers India", titleHi: "संयुक्त राष्ट्र स्वयंसेवक भारत", desc: "United Nations volunteer opportunities and youth peace programs in India.", descHi: "भारत में संयुक्त राष्ट्र स्वयंसेवक के अवसर।", url: "https://www.unv.org/", isGov: false },
    { title: "Nehru Yuva Kendra Sangathan (NYKS)", titleHi: "नेहरू युवा केंद्र संगठन", desc: "National youth volunteering & community action network.", descHi: "राष्ट्रीय युवा स्वयंसेवा और सामुदायिक कार्य पोर्टल।", url: "https://nyks.nic.in/", isGov: true },
    { title: "Youth For India Fellowship", titleHi: "युवा फॉर इंडिया फेलोशिप", desc: "Rural development volunteering fellowship in India.", descHi: "भारत में ग्रामीण विकास स्वयंसेवा फेलोशिप।", url: "https://youthforindia.org/", isGov: false },
    { title: "Volunteer4India Network", titleHi: "वोलंटियर4इंडिया नेटवर्क", desc: "Youth volunteering and social action platform.", descHi: "युवा स्वयंसेवा और सामाजिक कार्य मंच।", url: "https://v4i.in/", isGov: false }
  ],
  "health-care": [
    { title: "Ayushman Bharat PM-JAY", titleHi: "आयुष्मान भारत पीएम-जय", desc: "Official health benefit beneficiary services & hospital network.", descHi: "विश्व की सबसे बड़ी सरकारी स्वास्थ्य बीमा योजना।", url: "https://pmjay.gov.in/", isGov: true },
    { title: "ABHA Health ID (ABDM)", titleHi: "आभा डिजिटल स्वास्थ्य पहचान (एबीडीएम)", desc: "Digital health identity management and electronic health records.", descHi: "अपना आधिकारिक आयुष्मान भारत डिजिटल स्वास्थ्य खाता बनाएं।", url: "https://abdm.gov.in/", isGov: true },
    { title: "eSanjeevani National Telemedicine", titleHi: "ई-संजीवनी राष्ट्रीय टेलीमेडिसिन", desc: "Official telemedicine video consultations with government doctors.", descHi: "निःशुल्क सरकारी डॉक्टर वीडियो परामर्श।", url: "https://esanjeevani.mohfw.gov.in/", isGov: true },
    { title: "Pradhan Mantri Jan Aushadhi (PMBJP)", titleHi: "प्रधानमंत्री जनऔषधि केंद्र", desc: "Affordable generic medicine centres and low-cost pharmacy finder.", descHi: "कम कीमत पर गुणवत्तापूर्ण जेनेरिक दवाओं के केंद्र खोजें।", url: "https://janaushadhi.gov.in/", isGov: true },
    { title: "Tele MANAS Mental Health", titleHi: "टेली-मानस मानसिक स्वास्थ्य सेवा", desc: "Official 24x7 government mental health helpline and counseling.", descHi: "आधिकारिक 24x7 सरकारी मानसिक स्वास्थ्य एवं परामर्श सेवा।", url: "https://telemanas.mohfw.gov.in/", isGov: true },
    { title: "NCDC India Disease Surveillance", titleHi: "एनसीडीसी भारत रोग नियंत्रण केंद्र", desc: "National Centre for Disease Control public health information and alerts.", descHi: "राष्ट्रीय रोग नियंत्रण केंद्र की सार्वजनिक स्वास्थ्य जानकारी।", url: "https://ncdc.mohfw.gov.in/", isGov: true },
    { title: "World Health Organization (WHO)", titleHi: "विश्व स्वास्थ्य संगठन (डब्ल्यूएचओ)", desc: "WHO official global health updates, outbreak alerts and guidelines.", descHi: "विश्व स्वास्थ्य संगठन के समाचार, दिशानिर्देश और स्वास्थ्य अपडेट।", url: "https://www.who.int/", isGov: true },
    { title: "MoHFW Official Portal", titleHi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय", desc: "Ministry of Health & Family Welfare policy & health alerts.", descHi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय की आधिकारिक गाइडलाइन।", url: "https://mohfw.gov.in/", isGov: true },
    { title: "Tata 1mg Health Network", titleHi: "टाटा 1एमजी स्वास्थ्य नेटवर्क", desc: "Online medicine delivery, lab tests & health information.", descHi: "ऑनलाइन दवा डिलीवरी, लैब टेस्ट और स्वास्थ्य जानकारी।", url: "https://www.1mg.com/", isGov: false },
    { title: "Practo Doctor Finder", titleHi: "प्रैक्टो डॉक्टर खोज", desc: "Find top verified doctors & book clinic appointments.", descHi: "सत्यापित डॉक्टर खोजें और क्लिनिक अपॉइंटमेंट बुक करें।", url: "https://www.practo.com/", isGov: false },
    { title: "Apollo 24/7 Healthcare", titleHi: "अपोलो 24/7 हेल्थकेयर", desc: "24x7 doctor consultations, diagnostics and emergency care.", descHi: "24x7 डॉक्टर परामर्श और डायग्नोस्टिक्स।", url: "https://www.apollo247.com/", isGov: false }
  ],
  jobs: [
    { title: "National Career Service (NCS)", titleHi: "राष्ट्रीय करियर सेवा", desc: "Ministry of Labour job portal for verified job seekers & employers.", descHi: "श्रम मंत्रालय का आधिकारिक रोजगार पोर्टल।", url: "https://www.ncs.gov.in/", isGov: true },
    { title: "MP Rojgar Portal", titleHi: "एम.पी. रोजगार पोर्टल", desc: "Madhya Pradesh state employment exchange and candidate registration.", descHi: "मध्य प्रदेश राज्य रोजगार कार्यालय पोर्टल।", url: "https://mprojgar.gov.in/", isGov: true },
    { title: "Staff Selection Commission (SSC)", titleHi: "कर्मचारी चयन आयोग", desc: "Official government recruitment examinations and notice portal.", descHi: "कर्मचारी चयन आयोग की आधिकारिक वेबसाइट।", url: "https://ssc.gov.in/", isGov: true },
    { title: "LinkedIn India Careers", titleHi: "लिंक्डइन इंडिया करियर", desc: "Professional networking and verified private career opportunities.", descHi: "प्रोफेशनल नेटवर्किंग और नौकरियां खोजें।", url: "https://www.linkedin.com/", isGov: false },
    { title: "Naukri Career Portal", titleHi: "नौकरी.कॉम पोर्टल", desc: "Premier Indian job portal for corporate & private hiring.", descHi: "भारत का प्रमुख जॉब पोर्टल।", url: "https://www.naukri.com/", isGov: false },
    { title: "Unstop Career Opportunities", titleHi: "अनस्टॉप करियर नेटवर्क", desc: "Campus hiring, competitions, hackathons & entry-level jobs.", descHi: "कैम्पस हायरिंग, हैकाथॉन और नौकरियां।", url: "https://unstop.com/", isGov: false }
  ],
  scholarships: [
    { title: "National Scholarship Portal (NSP)", titleHi: "राष्ट्रीय छात्रवृत्ति पोर्टल", desc: "Single gateway for government scholarships across India.", descHi: "भारत भर में सरकारी छात्रवृत्तियों के लिए एक एकल पोर्टल।", url: "https://scholarships.gov.in/", isGov: true },
    { title: "MP Scholarship Portal 2.0", titleHi: "एम.पी. छात्रवृत्ति पोर्टल 2.0", desc: "Post-matric and Higher Education scholarships in Madhya Pradesh.", descHi: "मध्य प्रदेश उच्च शिक्षा एवं पोस्ट-मैट्रिक छात्रवृत्ति।", url: "http://scholarshipportal.mp.nic.in/", isGov: true },
    { title: "AICTE Student Schemes", titleHi: "एआईसीटीई छात्र योजनाएं", desc: "Technical education scholarships and fellowship schemes.", descHi: "तकनीकी शिक्षा छात्रवृत्ति और फेलोशिप योजनाएं।", url: "https://www.aicte-india.org/schemes/students-development-schemes", isGov: true },
    { title: "Buddy4Study Network", titleHi: "बडी4स्टडी छात्रवृत्ति नेटवर्क", desc: "Comprehensive scholarship aggregator and application assistance.", descHi: "छात्रवृत्ति खोज और आवेदन सहायता।", url: "https://www.buddy4study.com/", isGov: false },
    { title: "Vidyasaarathi Portal", titleHi: "विद्यासारथी पोर्टल", desc: "Corporate CSR scholarship portal for higher education.", descHi: "उच्च शिक्षा के लिए कॉर्पोरेट सीएसआर छात्रवृत्ति पोर्टल।", url: "https://www.vidyasaarathi.co.in/", isGov: false },
    { title: "Vidya Lakshmi Education Loans", titleHi: "विद्या लक्ष्मी शिक्षा ऋण", desc: "Single window portal for student education loans.", descHi: "छात्र शिक्षा ऋण के लिए एकल खिड़की पोर्टल।", url: "https://www.vidyalakshmi.co.in/", isGov: false }
  ],
  education: [
    { title: "DIKSHA Educational Portal", titleHi: "दीक्षा डिजिटल शिक्षा पोर्टल", desc: "National Digital Infrastructure for Teachers and Students.", descHi: "शिक्षकों और छात्रों के लिए राष्ट्रीय डिजिटल शिक्षा इंफ्रास्ट्रक्चर।", url: "https://diksha.gov.in/", isGov: true },
    { title: "SWAYAM Free Online Education", titleHi: "स्वयं मुफ्त ऑनलाइन शिक्षा", desc: "MHRD initiative for free school, UG & PG online courses.", descHi: "निःशुल्क स्कूल, यूजी और पीजी ऑनलाइन पाठ्यक्रम।", url: "https://swayam.gov.in/", isGov: true },
    { title: "Ministry of Education India", titleHi: "शिक्षा मंत्रालय भारत", desc: "National Education Policy (NEP) and central university portals.", descHi: "राष्ट्रीय शिक्षा नीति और विश्वविद्यालय पोर्टल।", url: "https://www.education.gov.in/", isGov: true },
    { title: "Khan Academy India", titleHi: "खान अकादमी इंडिया", desc: "Free world-class math, science & computer courses for K-12.", descHi: "मुफ्त विश्व स्तरीय गणित, विज्ञान और कंप्यूटर पाठ्यक्रम।", url: "https://hi.khanacademy.org/", isGov: false },
    { title: "GeeksforGeeks Learning", titleHi: "गीक्स-फॉर-गीक्स लर्निंग", desc: "Computer science, coding & engineering learning platform.", descHi: "कंप्यूटर साइंस, कोडिंग और इंजीनियरिंग लर्निंग।", url: "https://www.geeksforgeeks.org/", isGov: false },
    { title: "NPTEL IIT Certification", titleHi: "एनपीटीईएल आईआईटी कोर्स", desc: "Free online courses and certifications by top IITs and IISc.", descHi: "शीर्ष आईआईटी और आईआईएससी द्वारा मुफ्त कोर्स।", url: "https://nptel.ac.in/", isGov: false }
  ],
  food: [
    { title: "National Food Security Portal (NFSA)", titleHi: "राष्ट्रीय खाद्य सुरक्षा पोर्टल", desc: "Ration card status, foodgrain allocation & NFSA schemes.", descHi: "राशन कार्ड स्थिति और खाद्यान्न आवंटन पोर्टल।", url: "https://nfsa.gov.in/", isGov: true },
    { title: "MP Ration Mitra Portal", titleHi: "एम.पी. राशन मित्र पोर्टल", desc: "Madhya Pradesh public distribution system & fair price shops.", descHi: "मध्य प्रदेश सार्वजनिक वितरण प्रणाली पोर्टल।", url: "https://rationmitra.mp.gov.in/", isGov: true },
    { title: "Dept of Food & Public Distribution", titleHi: "खाद्य एवं सार्वजनिक वितरण विभाग", desc: "Central food security policy and PM Garib Kalyan Anna Yojana.", descHi: "केंद्रीय खाद्य सुरक्षा नीति और अन्न योजना।", url: "https://dfpd.gov.in/", isGov: true },
    { title: "Akshaya Patra Foundation", titleHi: "अक्षय पात्र फाउंडेशन", desc: "Largest mid-day meal program provider in government schools.", descHi: "सरकारी स्कूलों में सबसे बड़ा मध्याह्न भोजन कार्यक्रम।", url: "https://www.akshayapatra.org/", isGov: false },
    { title: "Feeding India (Zomato)", titleHi: "फीडिंग इंडिया मूवमेंट", desc: "Non-profit initiative solving hunger and malnutrition in India.", descHi: "भारत में भूख और कुपोषण को समाप्त करने का अभियान।", url: "https://www.feedingindia.org/", isGov: false },
    { title: "Robin Hood Army Food Drive", titleHi: "रॉबिन हुड आर्मी फूड ड्राइव", desc: "Volunteer organization serving surplus food to the needy.", descHi: "ज़रूरतमंदों को अधिशेष भोजन परोसने वाला संगठन।", url: "https://robinhoodarmy.com/", isGov: false }
  ],
  medicine: [
    { title: "Pradhan Mantri Janaushadhi (PMBJP)", titleHi: "प्रधानमंत्री जनऔषधि योजना", desc: "Generic medicines locator & low-cost pharmacy finder.", descHi: "कम कीमत पर गुणवत्तापूर्ण जेनेरिक दवाएं।", url: "https://janaushadhi.gov.in/", isGov: true },
    { title: "eSanjeevani National Telemedicine", titleHi: "ई-संजीवनी राष्ट्रीय टेलीमेडिसिन", desc: "Free government doctor consultation over video.", descHi: "निःशुल्क सरकारी डॉक्टर वीडियो परामर्श।", url: "https://esanjeevani.mohfw.gov.in/", isGov: true },
    { title: "CDSCO Medical Regulator", titleHi: "सीडीएससीओ औषधि नियामक", desc: "Central Drugs Standard Control Organization safety portal.", descHi: "केंद्रीय औषधि मानक नियंत्रण संगठन।", url: "https://cdsco.gov.in/", isGov: true },
    { title: "Netmeds Pharmacy Portal", titleHi: "नेटमेड्स फार्मेसी", desc: "Order genuine medicines online with doorstep delivery.", descHi: "प्रामाणिक दवाएं ऑनलाइन ऑर्डर करें।", url: "https://www.netmeds.com/", isGov: false },
    { title: "PharmEasy Healthcare", titleHi: "फार्मइजी हेल्थकेयर", desc: "Prescription medicine delivery & lab diagnostic tests.", descHi: "दवा डिलीवरी और लैब डायग्नोस्टिक टेस्ट।", url: "https://pharmeasy.in/", isGov: false },
    { title: "Truemeds Affordable Medicines", titleHi: "ट्रूमेड्स किफ़ायती दवाएं", desc: "Save up to 70% on substitute generic medicines.", descHi: "विकल्प जेनेरिक दवाओं पर 70% तक बचत करें।", url: "https://www.truemeds.in/", isGov: false }
  ],
  "women-safety": [
    { title: "National Emergency Number 112", titleHi: "राष्ट्रीय आपातकालीन नंबर 112", desc: "Single emergency response support system for pan-India.", descHi: "अखिल भारतीय आपातकालीन प्रतिक्रिया सहायता प्रणाली।", url: "https://112.gov.in/", isGov: true },
    { title: "National Commission for Women (NCW)", titleHi: "राष्ट्रीय महिला आयोग", desc: "Women's rights, legal aid & complaint redressal portal.", descHi: "महिला अधिकार, कानूनी सहायता और शिकायत पोर्टल।", url: "http://ncw.nic.in/", isGov: true },
    { title: "WCD One Stop Crisis Centre", titleHi: "महिला एवं बाल विकास मंत्रालय", desc: "Sakhi One Stop Centre initiative for comprehensive women safety.", descHi: "महिला सुरक्षा के लिए सखी वन स्टॉप सेंटर पहल।", url: "https://wcd.nic.in/", isGov: true },
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
    { title: "Bharat Pashudhan Portal", titleHi: "भारत पशुधन राष्ट्रीय पोर्टल", desc: "National digital livestock mission for animal identification & health.", descHi: "पशु स्वास्थ्य एवं पहचान के लिए राष्ट्रीय डिजिटल पोर्टल।", url: "https://bharatpashudhan.dahd.gov.in/", isGov: true },
    { title: "MP Directorate of Animal Husbandry (MPDAH)", titleHi: "मध्य प्रदेश पशुपालन संचालनालय", desc: "Official veterinary dispensaries and state animal schemes in MP.", descHi: "मध्य प्रदेश पशु चिकित्सा सेवाएं एवं कल्याण योजनाएं।", url: "https://mpdah.gov.in/", isGov: true },
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
    { title: "ICMR Krishi Vigyan Kendra Network", titleHi: "कृषि विज्ञान केंद्र नेटवर्क", desc: "Grassroots agricultural research & farmer training centers.", descHi: "कृषि अनुसंधान एवं किसान प्रशिक्षण केंद्र।", url: "https://kvk.icar.gov.in/", isGov: true },
    { title: "DeHaat Farmers Network", titleHi: "देहात किसान नेटवर्क", desc: "Agri-tech platform providing seeds, advisory & market linkage.", descHi: "कृषि-तकनीक मंच जो बीज, सलाह और बाजार लिंकेज प्रदान करता है।", url: "https://agridex.com/", isGov: false },
    { title: "Agribazaar Agri Trading", titleHi: "एग्रीबाज़ार कृषि व्यापार", desc: "Digital marketplace for buying & selling agricultural commodities.", descHi: "कृषि जिंसों की खरीद-बिक्री के लिए डिजिटल मार्केटप्लेस।", url: "https://www.agribazaar.com/", isGov: false }
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
  sos: [
    { title: "112 India Emergency System", titleHi: "112 इंडिया आपातकालीन प्रणाली", desc: "Pan-India single emergency contact number.", descHi: "अखिल भारतीय एकल आपातकालीन संपर्क नंबर।", url: "https://112.gov.in/", isGov: true },
    { title: "National Disaster Response NDMA", titleHi: "राष्ट्रीय आपदा प्रबंधन प्राधिकरण", desc: "Emergency crisis action & disaster relief.", descHi: "आपातकालीन संकट कार्रवाई और आपदा राहत।", url: "https://ndma.gov.in/", isGov: true },
    { title: "Railway Security Helpline 139", titleHi: "रेलवे सुरक्षा हेल्पलाइन 139", desc: "Indian Railways 24/7 passenger safety & SOS helpline.", descHi: "भारतीय रेलवे 24/7 यात्री सुरक्षा और एसओएस हेल्पलाइन।", url: "https://railmadad.indianrailways.gov.in/", isGov: true },
    { title: "National Cyber Crime Helpline 1930", titleHi: "राष्ट्रीय साइबर अपराध हेल्पलाइन 1930", desc: "Report financial cyber frauds and emergency cyber crimes.", descHi: "वित्तीय साइबर धोखाधड़ी और साइबर अपराध रिपोर्ट करें।", url: "https://cybercrime.gov.in/", isGov: true },
    { title: "Emergency Response System ERSS", titleHi: "आपातकालीन प्रतिक्रिया सहायता प्रणाली", desc: "State-level emergency dispatch & location tracking.", descHi: "राज्य-स्तरीय आपातकालीन प्रेषण और स्थान ट्रैकिंग।", url: "https://erss.in/", isGov: true },
    { title: "Childline Emergency 1098", titleHi: "चाइल्डलाइन आपातकालीन 1098", desc: "24/7 emergency helpline for children in distress.", descHi: "संकट में बच्चों के लिए 24/7 आपातकालीन हेल्पलाइन।", url: "https://childlineindia.org/", isGov: false }
  ],
  "transit-planner": [
    { title: "Parivahan Mobility (MoRTH)", titleHi: "परिवहन मोबिलिटी", desc: "National Common Mobility Card & transit advisories.", descHi: "राष्ट्रीय सामान्य गतिशीलता कार्ड और पारगमन सलाह।", url: "https://morth.nic.in/", isGov: true },
    { title: "Indian Railways IRCTC", titleHi: "भारतीय रेलवे आईआरसीटीसी", desc: "Official Indian Railways ticket booking & train status.", descHi: "आधिकारिक भारतीय रेलवे टिकट बुकिंग और ट्रेन स्थिति।", url: "https://www.irctc.co.in/", isGov: true },
    { title: "MP Metro Rail Corporation", titleHi: "एम.पी. मेट्रो रेल कॉर्पोरेशन", desc: "Madhya Pradesh metro transit routes & project updates.", descHi: "मध्य प्रदेश मेट्रो ट्रांजिट मार्ग और परियोजना अपडेट।", url: "https://mpmetrorail.com/", isGov: true },
    { title: "RedBus Ticket Planner", titleHi: "रेडबस टिकट प्लाक", desc: "Book bus tickets across 3,000+ bus operators in India.", descHi: "भारत में 3,000+ बस ऑपरेटरों में बस टिकट बुक करें।", url: "https://www.redbus.in/", isGov: false },
    { title: "Ixigo Train & Flight Transit", titleHi: "इक्सिगो ट्रेन एवं फ्लाइट", desc: "Live train running status, PNR status & fare alerts.", descHi: "लाइव ट्रेन स्थिति, पीएनआर स्थिति और किराए की चेतावनी।", url: "https://www.ixigo.com/", isGov: false },
    { title: "Moovit Urban Transit App", titleHi: "मूविट अर्बन ट्रांजिट गाइड", desc: "Real-time bus schedules, metro maps & transit planner.", descHi: "रियल-टाइम बस समय सारणी, मेट्रो मानचित्र।", url: "https://moovitapp.com/", isGov: false }
  ],
  "daily-utility": [
    { title: "BMI Calculator & Health Tracker", titleHi: "बीएमआई कैलकुलेटर व स्वास्थ्य ट्रैकर", desc: "Calculate Body Mass Index and ideal body weight standards.", descHi: "शरीर द्रव्यमान सूचकांक और आदर्श वजन मानकों की गणना करें।", url: "/bmi-calculator", isGov: false },
    { title: "Pomodoro Focus & Break Timer", titleHi: "पोमोडोरो फोकस टाइमर", desc: "Boost study and work productivity with timed focus cycles.", descHi: "समयबद्ध फोकस चक्रों के साथ अध्ययन और कार्य उत्पादकता बढ़ाएं।", url: "/pomodoro", isGov: false },
    { title: "Guided Breathing Meditator", titleHi: "गैडेड ब्रीदिंग मेडिटेशन", desc: "Guided relaxation, stress-relief and mindfulness breathing rhythms.", descHi: "तनाव मुक्ति और मानसिक शांति के लिए श्वास व्यायाम।", url: "/breathing-meditator", isGov: false },
    { title: "Online Mock Tests & Quiz", titleHi: "ऑनलाइन मॉक टेस्ट व क्विज", desc: "AI-powered UPSC, SSC, PSC competitive test practice.", descHi: "सरकारी भर्ती व प्रतियोगी परीक्षाओं के लिए ऑनलाइन अभ्यास।", url: "/online-test", isGov: false },
    { title: "National Portal of India", titleHi: "भारत का राष्ट्रीय पोर्टल", desc: "Centralized civic utilities, forms and directory.", descHi: "केंद्रीय नागरिक सेवाएं और सरकारी प्रपत्र।", url: "https://www.india.gov.in/", isGov: true },
    { title: "MP e-Services Citizen Portal", titleHi: "एम.पी. ई-सेवा नागरिक पोर्टल", desc: "State citizen certificates, utility bill pay and licenses.", descHi: "राज्य नागरिक प्रमाण पत्र और जनोपयोगी सेवाएं।", url: "https://services.mp.gov.in/eservice/", isGov: true }
  ],
  "bmi-calculator": [
    { title: "RPF BMI Calculator", titleHi: "आरपीएफ बीएमआई कैलकुलेटर", desc: "Interactive body mass index calculator and health indicator.", descHi: "इंटरैक्टिव बीएमआई कैलकुलेटर और स्वास्थ्य संकेतक।", url: "/bmi-calculator", isGov: false },
    { title: "WHO Healthy Weight Guidelines", titleHi: "डब्ल्यूएचओ स्वस्थ वजन दिशानिर्देश", desc: "World Health Organization standards on BMI & obesity.", descHi: "विश्व स्वास्थ्य संगठन के बीएमआई और वजन मानक।", url: "https://www.who.int/", isGov: true },
    { title: "Fit India Movement", titleHi: "फिट इंडिया मूवमेंट", desc: "Official Government of India fitness challenges and healthy lifestyle guide.", descHi: "भारत सरकार का आधिकारिक फिटनेस और स्वस्थ जीवन शैली पोर्टल।", url: "https://fitindia.gov.in/", isGov: true }
  ],
  "pomodoro-timer": [
    { title: "Pomodoro Focus Timer", titleHi: "पोमोडोरो फोकस टाइमर", desc: "Structured work & study interval productivity timer.", descHi: "संरचित कार्य और अध्ययन अंतराल उत्पादकता टाइमर।", url: "/pomodoro", isGov: false },
    { title: "Pomodoro Technique Guide", titleHi: "पोमोडोरो तकनीक गाइड", desc: "Scientifically proven time management technique for learners.", descHi: "शिक्षार्थियों के लिए समय प्रबंधन तकनीक।", url: "https://en.wikipedia.org/wiki/Pomodoro_Technique", isGov: false }
  ],
  "breathing-meditator": [
    { title: "Breathing Meditator", titleHi: "ब्रीदिंग मेडिटेटर", desc: "Guided pranayama and box breathing cycles for stress reduction.", descHi: "तनाव कम करने के लिए निर्देशित प्राणायाम और श्वास चक्र।", url: "/breathing-meditator", isGov: false },
    { title: "Yoga & Wellness Portal (Ayush)", titleHi: "आयुष योग एवं कल्याण पोर्टल", desc: "Ministry of Ayush official pranayama & mental wellness guidelines.", descHi: "आयुष मंत्रालय के आधिकारिक प्राणायाम और मानसिक कल्याण दिशानिर्देश।", url: "https://yoga.ayush.gov.in/", isGov: true }
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
    { title: "Press Information Bureau (PIB)", titleHi: "प्रेस सूचना ब्यूरो (पीआईबी)", desc: "Official press releases and verified news from Government of India.", descHi: "भारत सरकार की आधिकारिक प्रेस विज्ञप्तियां।", url: "https://pib.gov.in/", isGov: true },
    { title: "DD News Official Portal", titleHi: "डीडी न्यूज आधिकारिक पोर्टल", desc: "Doordarshan national news broadcasting network.", descHi: "दूरदर्शन राष्ट्रीय समाचार प्रसारण नेटवर्क।", url: "https://ddnews.gov.in/", isGov: true },
    { title: "All India Radio News (AIR)", titleHi: "ऑल इंडिया रेडियो न्यूज", desc: "News Services Division of All India Radio bulletins.", descHi: "ऑल इंडिया रेडियो का समाचार सेवा प्रभाग।", url: "https://newsonair.gov.in/", isGov: true },
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
  epaper: [
    // National English
    { title: "Free Press Journal (FPJ)", titleHi: "फ्री प्रेस जर्नल", desc: "Leading national English daily newspaper e-paper edition.", descHi: "प्रमुख राष्ट्रीय अंग्रेजी दैनिक समाचार पत्र का ई-पेपर।", url: "https://epaper.freepressjournal.in/", isGov: false },
    { title: "Mid-Day Daily", titleHi: "मिड-डे दैनिक", desc: "Mumbai and national news daily digital newspaper.", descHi: "दैनिक डिजिटल अंग्रेजी समाचार पत्र।", url: "https://epaper.mid-day.com/", isGov: false },
    { title: "Financial Express", titleHi: "फाइनेंशियल एक्सप्रेस", desc: "Premier financial and business daily newspaper e-paper.", descHi: "प्रमुख वित्तीय एवं व्यावसायिक समाचार पत्र।", url: "https://epaper.financialexpress.com/", isGov: false },
    { title: "The Telegraph India", titleHi: "द टेलीग्राफ", desc: "National English daily newspaper digital edition.", descHi: "राष्ट्रीय अंग्रेजी दैनिक समाचार पत्र डिजिटल संस्करण।", url: "https://epaper.telegraphindia.com/", isGov: false },
    { title: "The Hitavada", titleHi: "द हितवाद", desc: "Central India's premier English daily newspaper e-paper.", descHi: "मध्य भारत का प्रमुख अंग्रेजी समाचार पत्र।", url: "https://ehitavada.com/", isGov: false },
    { title: "Central Chronicle", titleHi: "सेंट्रल क्रॉनिकल", desc: "Madhya Pradesh & Central India's English daily.", descHi: "मध्य प्रदेश और मध्य भारत का अंग्रेजी दैनिक।", url: "https://centralchronicle.in/", isGov: false },
    { title: "Mint Business Daily", titleHi: "मिंट बिजनेस डेली", desc: "Top Indian financial daily newspaper e-paper.", descHi: "शीर्ष भारतीय वित्तीय दैनिक समाचार पत्र।", url: "https://epaper.livemint.com/", isGov: false },
    { title: "The Daily Guardian", titleHi: "द डेली गार्जियन", desc: "National policy, political & international news daily.", descHi: "राष्ट्रीय नीति, राजनीतिक व वैश्विक समाचार पत्र।", url: "https://thedailyguardian.com/", isGov: false },
    // National Hindi
    { title: "People's Samachar", titleHi: "पीपुल्स समाचार", desc: "Madhya Pradesh's leading Hindi daily newspaper.", descHi: "मध्य प्रदेश का प्रमुख हिंदी दैनिक समाचार पत्र।", url: "https://peoplesamachar.in/", isGov: false },
    { title: "Aaj Tak News", titleHi: "आज तक डिजिटल", desc: "National Hindi breaking news and daily reporting.", descHi: "राष्ट्रीय हिंदी ब्रेकिंग न्यूज और रिपोर्टिंग।", url: "https://www.aajtak.in/", isGov: false },
    { title: "Live Hindustan Epaper", titleHi: "लाइव हिन्दुस्तान", desc: "Hindustan Hindi daily newspaper editions.", descHi: "हिन्दुस्तान हिंदी दैनिक समाचार पत्र।", url: "https://epaper.livehindustan.com/", isGov: false },
    { title: "Dainik Lokdesh", titleHi: "दैनिक लोकदेश", desc: "Central India authentic Hindi daily newspaper.", descHi: "मध्य भारत का विश्वसनीय हिंदी दैनिक।", url: "https://lokdesh.in/", isGov: false },
    { title: "Navbharat Epaper", titleHi: "नवभारत ई-पेपर", desc: "National Hindi daily newspaper e-paper editions.", descHi: "राष्ट्रीय हिंदी दैनिक समाचार पत्र।", url: "https://epaper.navabharat.org/", isGov: false },
    { title: "Pradesh Today", titleHi: "प्रदेश टुडे", desc: "Madhya Pradesh state Hindi daily newspaper.", descHi: "मध्य प्रदेश राज्य हिंदी दैनिक समाचार पत्र।", url: "https://pradeshtoday.com/", isGov: false },
    { title: "Subah Savere", titleHi: "सुबह सवेरे", desc: "Bhopal and MP state news daily paper.", descHi: "भोपाल और मध्य प्रदेश का दैनिक समाचार पत्र।", url: "https://subahsavere.org/", isGov: false },
    { title: "Dainik Navajyoti", titleHi: "दैनिक नवज्योति", desc: "Heritage Hindi daily newspaper digital edition.", descHi: "दैनिक नवज्योति हिंदी समाचार पत्र।", url: "https://epaper.navajyoti.com/", isGov: false },
    { title: "Navarashtra Daily", titleHi: "नवराष्ट्र दैनिक", desc: "Hindi & regional daily newspaper publication.", descHi: "नवराष्ट्र दैनिक समाचार पत्र प्रकाशन।", url: "https://epaper.navarashtra.com/", isGov: false },
    { title: "Prabhat Khabar", titleHi: "प्रभात खबर", desc: "Leading Hindi daily newspaper in Eastern & Central India.", descHi: "पूर्वी व मध्य भारत का प्रमुख हिंदी दैनिक।", url: "https://epaper.prabhatkhabar.com/", isGov: false }
  ],
  "fact-check": [
    // Official Government Checkers
    { title: "PIB Fact Check Official", titleHi: "पीआईबी फैक्ट चेक आधिकारिक", desc: "Official Government of India fact-checking unit debunking fake news.", descHi: "भारत सरकार का आधिकारिक फैक्ट चेक पोर्टल।", url: "https://factcheck.pib.gov.in/", isGov: true },
    { title: "MEA Fact Check Portal", titleHi: "विदेश मंत्रालय फैक्ट चेक", desc: "Ministry of External Affairs official foreign policy clarification portal.", descHi: "विदेश मंत्रालय का आधिकारिक नीति स्पष्टीकरण पोर्टल।", url: "https://www.mea.gov.in/", isGov: true },
    { title: "Jansampark MP Fact Check", titleHi: "जनसंपर्क एम.पी. फैक्ट चेक", desc: "Madhya Pradesh Directorate of Public Relations fake news alert.", descHi: "मध्य प्रदेश जनसंपर्क विभाग का फैक्ट चेक पोर्टल।", url: "https://mpinfo.org/", isGov: true },
    { title: "UP Police Viral Check", titleHi: "यूपी पुलिस वायरल चेक", desc: "State police viral misinformation monitoring & counter-fact unit.", descHi: "राज्य पुलिस सोशल मीडिया भ्रामक सूचना जांच इकाई।", url: "https://uppolice.gov.in/", isGov: true },
    // Independent Checkers
    { title: "Vishvas News (Jagran)", titleHi: "विश्वास न्यूज", desc: "IFCN certified Hindi & Indian languages fact checking portal.", descHi: "आईएफ़सीएन प्रमाणित हिंदी व प्रांतीय फैक्ट चेक पोर्टल।", url: "https://www.vishvasnews.com/", isGov: false },
    { title: "India Today Fact Check", titleHi: "इंडिया टुडे फैक्ट चेक", desc: "In-depth investigation of viral videos and political claims.", descHi: "वायरल वीडियो और राजनीतिक दावों की गहन जांच।", url: "https://www.indiatoday.in/fact-check", isGov: false },
    { title: "PTI Fact Check Unit", titleHi: "पीटीआई फैक्ट चेक यूनिट", desc: "Press Trust of India verified claims analysis desk.", descHi: "प्रेस ट्रस्ट ऑफ इंडिया का फैक्ट चेक डेस्क।", url: "https://www.ptinews.com/category/fact-check", isGov: false },
    { title: "NewsMeter Fact Check", titleHi: "न्यूजमीटर फैक्ट चेक", desc: "South and Central India verified fact checking newsroom.", descHi: "सत्यापित फैक्ट चेकिंग न्यूजरूम।", url: "https://newsmeter.in/fact-check", isGov: false },
    { title: "Dainik Bhaskar Fake News Exposed", titleHi: "दैनिक भास्कर फेक न्यूज एक्सपोज्ड", desc: "Leading Hindi newspaper investigation on social media hoaxes.", descHi: "सोशल मीडिया अफवाहों की जांच।", url: "https://www.bhaskar.com/fake-news-exposed/", isGov: false },
    { title: "BOOM Live", titleHi: "बूम लाइव फैक्ट चेक", desc: "IFCN certified independent digital journalism fact checker.", descHi: "स्वतंत्र डिजिटल पत्रकारिता फैक्ट चेकर।", url: "https://www.boomlive.in/", isGov: false },
    { title: "Alt News", titleHi: "ऑल्ट न्यूज", desc: "Dedicated Indian misinformation and propaganda debunking site.", descHi: "भ्रामक प्रचार और अफवाहों की जांच करने वाला पोर्टल।", url: "https://www.altnews.in/", isGov: false },
    { title: "OpIndia Fact Check", titleHi: "ऑपइंडिया फैक्ट चेक", desc: "Media narrative and news report verification portal.", descHi: "समाचार और दावों की सत्यापन रिपोर्ट।", url: "https://www.opindia.com/category/fact-check/", isGov: false },
    { title: "Snopes Fact Check", titleHi: "स्नोप्स फैक्ट चेक", desc: "World's oldest and definitive internet reference for rumors & hoaxes.", descHi: "अफवाहों और दावों की जांच के लिए विश्व प्रसिद्ध पोर्टल।", url: "https://www.snopes.com/", isGov: false },
    { title: "PolitiFact Truth-O-Meter", titleHi: "पॉलिटिफैक्ट ट्रुथ-ओ-मीटर", desc: "Pulitzer Prize winning political statement verification site.", descHi: "राजनीतिक बयानों की सत्यता जांचने का प्रमुख मंच।", url: "https://www.politifact.com/", isGov: false },
    { title: "FactCheck.org", titleHi: "फैक्ट-चेक.ओआरजी", desc: "Annenberg Public Policy Center nonpartisan fact-checking.", descHi: "सार्वजनिक नीति एवं दावों का निष्पक्ष फैक्ट चेक।", url: "https://www.factcheck.org/", isGov: false },
    { title: "Reuters Fact Check", titleHi: "रॉयटर्स फैक्ट चेक", desc: "Global news organization visual and social claim verification.", descHi: "रॉयटर्स अंतरराष्ट्रीय फैक्ट चेक डेस्क।", url: "https://www.reuters.com/fact-check/", isGov: false },
    { title: "AP News Fact Check", titleHi: "एपी न्यूज फैक्ट चेक", desc: "Associated Press fact-checking reports across the globe.", descHi: "एसोसिएटेड प्रेस वैश्विक फैक्ट चेकिंग रिपोर्ट।", url: "https://apnews.com/hub/ap-fact-check", isGov: false },
    { title: "BBC Verify", titleHi: "बीबीसी वेरीफाई", desc: "BBC investigative analysis debunking disinformation & deepfakes.", descHi: "बीबीसी की भ्रामक सूचना और डीपफेक जांच इकाई।", url: "https://www.bbc.com/news/reality_check", isGov: false },
    { title: "Newschecker India", titleHi: "न्यूजचेकर इंडिया", desc: "Multilingual verification of viral claims on WhatsApp & social media.", descHi: "व्हाट्सएप और सोशल मीडिया दावों का बहुभाषी सत्यापन।", url: "https://newschecker.in/", isGov: false },
    { title: "Originality.ai Detector", titleHi: "ओरिजिनलिटी.एआई डिटेक्टर", desc: "AI content and deepfake text verification checker.", descHi: "एआई सामग्री और डीपफेक पाठ पहचान टूल।", url: "https://originality.ai/", isGov: false }
  ],
  directory: [
    { title: "Government of India Who's Who", titleHi: "भारत सरकार हू'ज हू संपर्क", desc: "Central ministries, secretaries and department heads contact directory.", descHi: "केंद्रीय मंत्रालयों और सचिवों की आधिकारिक संपर्क निर्देशिका।", url: "https://www.india.gov.in/my-government/whos-who", isGov: true },
    { title: "National Helplines Directory", titleHi: "राष्ट्रीय हेल्पलाइन निर्देशिका", desc: "Emergency, disaster, medical & women helpline numbers across India.", descHi: "आपातकालीन, आपदा, चिकित्सा व महिला हेल्पलाइन नंबर।", url: "https://www.india.gov.in/helplines", isGov: true },
    { title: "RP Foundation Youth Directory", titleHi: "आरपीएफ युवा स्वयंसेवक निर्देशिका", desc: "Community points, blood donor network and youth coordinators.", descHi: "सामुदायिक केंद्र, रक्तदाता नेटवर्क और युवा समन्वयक।", url: "/volunteers", isGov: false },
    { title: "People's University Portal", titleHi: "पीपुल्स यूनिवर्सिटी पोर्टल", desc: "Official University campus, healthcare and constituent colleges directory.", descHi: "आधिकारिक विश्वविद्यालय परिसर, चिकित्सा और संस्थान निर्देशिका।", url: "https://www.peoplesuniversity.edu.in/", isGov: false }
  ],
  "peoples-university": [
    { title: "People's University Official Portal", titleHi: "पीपुल्स यूनिवर्सिटी आधिकारिक पोर्टल", desc: "Bhopal's premier multidisciplinary university official gateway.", descHi: "भोपाल के प्रमुख बहु-विषयक विश्वविद्यालय का मुख्य पोर्टल।", url: "https://www.peoplesuniversity.edu.in/", isGov: false },
    { title: "Admissions & Courses", titleHi: "प्रवेश एवं पाठ्यक्रम निर्देशिका", desc: "Undergraduate, postgraduate and doctoral academic programs.", descHi: "स्नातक, स्नातकोत्तर और डॉक्टरेट शैक्षणिक कार्यक्रम।", url: "https://www.peoplesuniversity.edu.in/admission/", isGov: false },
    { title: "People's College of Medical Sciences", titleHi: "पीपुल्स मेडिकल कॉलेज व रिसर्च सेंटर", desc: "Multi-speciality tertiary care teaching hospital and research centre.", descHi: "मल्टी-स्पेशियलिटी अस्पताल और अनुसंधान केंद्र।", url: "https://www.peoplesuniversity.edu.in/medical/", isGov: false }
  ],
  "live-tv": [
    { title: "DD News Live Stream", titleHi: "डीडी न्यूज लाइव स्ट्रीम", desc: "Official Doordarshan 24x7 live national broadcast.", descHi: "दूरदर्शन का 24x7 लाइव राष्ट्रीय समाचार प्रसारण।", url: "https://www.youtube.com/@DDNewsOfficial", isGov: true },
    { title: "Sansad TV Live Stream", titleHi: "संसद टीवी लाइव स्ट्रीम", desc: "Official Parliament of India Lok Sabha & Rajya Sabha live feeds.", descHi: "भारतीय संसद लोकसभा व राज्यसभा का आधिकारिक लाइव प्रसारण।", url: "https://www.youtube.com/@SansadTV", isGov: true },
    { title: "DD India Global Broadcast", titleHi: "डीडी इंडिया ग्लोबल", desc: "India's international public news broadcasting service.", descHi: "भारत की अंतरराष्ट्रीय सार्वजनिक समाचार प्रसारण सेवा।", url: "https://www.youtube.com/@DDIndia", isGov: true },
    { title: "DD Sports Official", titleHi: "डीडी स्पोर्ट्स लाइव", desc: "National sports events, athletics and tournament broadcasts.", descHi: "राष्ट्रीय खेल आयोजन और टूर्नामेंट का लाइव प्रसारण।", url: "https://www.youtube.com/@DDSportsOfficial", isGov: true }
  ],
  "social-reels": [
    { title: "RP Foundation Shorts & Reels", titleHi: "आरपीएफ शॉर्ट्स व रील्स", desc: "Community impact stories, welfare highlights & awareness reels.", descHi: "सामुदायिक जागरूकता और प्रेरणादायक वीडियो रील्स।", url: "/reels", isGov: false },
    { title: "MyGov India Citizen Media", titleHi: "मायगव इंडिया मीडिया", desc: "Official citizen initiatives, policy explications and youth videos.", descHi: "आधिकारिक नागरिक पहल और युवा वीडियो संग्रह।", url: "https://www.youtube.com/@MyGovIndia", isGov: true }
  ],
  "online-test": [
    { title: "Online Mock Test Center", titleHi: "ऑनलाइन मॉक टेस्ट केंद्र", desc: "AI-generated practice quizzes, live timer and merit certificates.", descHi: "एआई आधारित अभ्यास क्विज, लाइव टाइमर और मेरिट प्रमाण पत्र।", url: "/online-test", isGov: false },
    { title: "UPSC Official Examination Portal", titleHi: "यूपीएससी आधिकारिक परीक्षा पोर्टल", desc: "Union Public Service Commission civil services examination notifications.", descHi: "संघ लोक सेवा आयोग सिविल सेवा परीक्षा पोर्टल।", url: "https://upsc.gov.in/", isGov: true },
    { title: "SSC Official Recruitment Portal", titleHi: "कर्मचारी चयन आयोग (एसएससी)", desc: "Staff Selection Commission notices, admit cards and results.", descHi: "कर्मचारी चयन आयोग परीक्षा और परिणाम।", url: "https://ssc.gov.in/", isGov: true },
    { title: "MPPSC State Examination Portal", titleHi: "एमपीपीएससी आधिकारिक पोर्टल", desc: "Madhya Pradesh Public Service Commission examinations.", descHi: "मध्य प्रदेश लोक सेवा आयोग परीक्षा पोर्टल।", url: "https://mppsc.mp.gov.in/", isGov: true }
  ]
};

export const SERVICE_ALIASES: Record<string, string> = {
  "card": "card",
  "jan-seva-card": "card",
  "blood": "blood",
  "blood-network": "blood",
  "donations": "donations",
  "grievance": "grievance",
  "grievances": "grievance",
  "volunteers": "volunteers",
  "volunteering": "volunteers",
  "health-care": "health-care",
  "jobs": "jobs",
  "jobs-portal": "jobs",
  "employment": "jobs",
  "scholarships": "scholarships",
  "food": "food",
  "food-support": "food",
  "medicine": "medicine",
  "medicine-support": "medicine",
  "education": "education",
  "education-aid": "education",
  "women-safety": "women-safety",
  "senior-citizens": "seniors",
  "seniors": "seniors",
  "animal-welfare": "animals",
  "animals": "animals",
  "environment": "environment",
  "crowdfunding": "crowdfunding",
  "religious-culture": "culture",
  "culture": "culture",
  "disaster-management": "disaster",
  "disaster": "disaster",
  "farmer-support": "farmer",
  "farmer": "farmer",
  "government-schemes": "schemes",
  "schemes": "schemes",
  "skills-training": "skills",
  "skills": "skills",
  "sos-system": "sos",
  "sos": "sos",
  "hindu-calendar": "hindu-calendar",
  "news-feed": "news-feed",
  "internet-radio": "internet-radio",
  "transit-planner": "transit-planner",
  "transit": "transit-planner",
  "youth-empowerment": "youth",
  "youth": "youth",
  "nation-building": "nation",
  "nation": "nation",
  "daily-utility": "daily-utility",
  "bmi-calculator": "bmi-calculator",
  "pomodoro-timer": "pomodoro-timer",
  "breathing-meditator": "breathing-meditator",
  "epaper-kiosk": "epaper",
  "epaper": "epaper",
  "national-directory": "directory",
  "directory": "directory",
  "peoples-university": "peoples-university",
  "fact-check": "fact-check",
  "live-tv": "live-tv",
  "social-reels": "social-reels",
  "online-test": "online-test"
};

export function getGovLinksForService(serviceId: string): GovLink[] {
  const direct = SERVICE_GOV_LINKS[serviceId];
  if (direct && direct.length > 0) return direct;
  const alias = SERVICE_ALIASES[serviceId];
  if (alias && SERVICE_GOV_LINKS[alias] && SERVICE_GOV_LINKS[alias].length > 0) {
    return SERVICE_GOV_LINKS[alias];
  }
  return [
    { title: "National Portal of India", titleHi: "भारत का राष्ट्रीय पोर्टल", desc: "Official single window access to government services.", descHi: "सरकारी सेवाओं की आधिकारिक एकल खिड़की।", url: "https://www.india.gov.in/", isGov: true },
    { title: "MP e-Services Portal", titleHi: "एम.पी. ई-सेवा पोर्टल", desc: "Madhya Pradesh state e-services directory.", descHi: "मध्य प्रदेश राज्य ई-सेवाएं निर्देशिका।", url: "https://services.mp.gov.in/eservice/", isGov: true }
  ];
}
