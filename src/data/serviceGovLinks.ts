export interface GovLink {
  title: string;
  titleHi: string;
  desc: string;
  descHi: string;
  url: string;
  category?: string;
}

export const SERVICE_GOV_LINKS: Record<string, GovLink[]> = {
  card: [
    { title: "National Portal of India", titleHi: "भारत का राष्ट्रीय पोर्टल", desc: "Single window access to government services & foundational ID verification.", descHi: "सरकारी सेवाओं और आधारभूत आईडी का राष्ट्रीय पोर्टल।", url: "https://www.india.gov.in/" },
    { title: "MP e-Services Portal", titleHi: "एम.पी. ई-सेवा पोर्टल", desc: "Madhya Pradesh government e-services & citizen card portal.", descHi: "मध्य प्रदेश सरकार की ई-सेवाएं पोर्टल।", url: "https://services.mp.gov.in/eservice/" },
    { title: "Digital India Citizen Portal", titleHi: "डिजिटल इंडिया पोर्टल", desc: "Official Digital India initiative and citizen identity services.", descHi: "डिजिटल इंडिया पहल और नागरिक सेवाएं।", url: "https://digitalindia.gov.in/" }
  ],
  blood: [
    { title: "e-RaktKosh Portal", titleHi: "ई-रक्तकोश पोर्टल", desc: "Centralized blood bank management system & donor finder by MoHFW.", descHi: "स्वास्थ्य मंत्रालय द्वारा केंद्रीयकृत रक्त बैंक प्रबंधन एवं दाता खोज।", url: "https://www.eraktkosh.in/" },
    { title: "National Health Portal (NHP)", titleHi: "राष्ट्रीय स्वास्थ्य पोर्टल", desc: "Official health guidance & blood emergency directory.", descHi: "आधिकारिक स्वास्थ्य मार्गदर्शन और रक्त आपातकालीन निर्देशिका।", url: "https://www.nhp.gov.in/" },
    { title: "Indian Red Cross Society", titleHi: "भारतीय रेड क्रॉस सोसाइटी", desc: "Humanitarian blood donation network and disaster relief.", descHi: "मानवीय रक्तदान नेटवर्क और आपदा राहत।", url: "https://indianredcross.org/" }
  ],
  donations: [
    { title: "PM National Relief Fund (PMNRF)", titleHi: "प्रधानमंत्री राष्ट्रीय राहत कोष", desc: "Official Prime Minister relief fund for national emergencies.", descHi: "राष्ट्रीय आपात स्थिति के लिए आधिकारिक प्रधानमंत्री राहत कोष।", url: "https://pmnrf.gov.in/" },
    { title: "NGO Darpan (NITI Aayog)", titleHi: "एनजीओ दर्पण (नीति आयोग)", desc: "Verified NGO directory & donation transparency portal.", descHi: "सत्यापित एनजीओ निर्देशिका एवं पारदर्शिता पोर्टल।", url: "https://ngodarpan.gov.in/" },
    { title: "MP CM Relief Fund", titleHi: "एम.पी. मुख्यमंत्री राहत कोष", desc: "Madhya Pradesh Chief Minister relief fund.", descHi: "मध्य प्रदेश मुख्यमंत्री राहत कोष।", url: "https://cmrelieffund.mp.gov.in/" }
  ],
  grievance: [
    { title: "CPGRAMS Public Grievance Portal", titleHi: "सीपीजीआरएएमएस लोक शिकायत पोर्टल", desc: "Centralized public grievance redress and monitoring system.", descHi: "केंद्रीय लोक शिकायत निवारण और निगरानी प्रणाली।", url: "https://pgportal.gov.in/" },
    { title: "MP CM Helpline 181", titleHi: "एम.पी. सीएम हेल्पलाइन 181", desc: "Madhya Pradesh 24x7 citizen grievance portal.", descHi: "मध्य प्रदेश 24x7 नागरिक शिकायत पोर्टल।", url: "https://cmhelpline.mp.gov.in/" },
    { title: "National Consumer Helpline", titleHi: "राष्ट्रीय उपभोक्ता हेल्पलाइन", desc: "Consumer grievance and dispute resolution portal.", descHi: "उपभोक्ता शिकायत और विवाद निवारण पोर्टल।", url: "https://consumerhelpline.gov.in/" }
  ],
  volunteers: [
    { title: "MyGov Volunteer Portal", titleHi: "मायगव स्वयंसेवक पोर्टल", desc: "Official Government of India citizen volunteer network.", descHi: "भारत सरकार का आधिकारिक नागरिक स्वयंसेवक नेटवर्क।", url: "https://www.mygov.in/" },
    { title: "Nehru Yuva Kendra Sangathan (NYKS)", titleHi: "नेहरू युवा केंद्र संगठन", desc: "National youth volunteering & community action portal.", descHi: "राष्ट्रीय युवा स्वयंसेवा और सामुदायिक कार्य पोर्टल।", url: "https://nyks.nic.in/" },
    { title: "National Service Scheme (NSS)", titleHi: "राष्ट्रीय सेवा योजना", desc: "Ministry of Youth Affairs student volunteer network.", descHi: "युवा कार्यक्रम मंत्रालय का छात्र स्वयंसेवक नेटवर्क।", url: "https://nss.gov.in/" }
  ],
  "health-care": [
    { title: "Ayushman Bharat PM-JAY", titleHi: "आयुष्मान भारत पीएम-जय", desc: "World's largest government-funded health insurance scheme.", descHi: "विश्व की सबसे बड़ी सरकारी स्वास्थ्य बीमा योजना।", url: "https://pmjay.gov.in/" },
    { title: "ABHA Health Account (ABDM)", titleHi: "आभा स्वास्थ्य खाता (एबीडीएम)", desc: "Create your official Ayushman Bharat Health Account.", descHi: "अपना आधिकारिक आयुष्मान भारत स्वास्थ्य खाता बनाएं।", url: "https://abdm.gov.in/" },
    { title: "MoHFW Official Portal", titleHi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय", desc: "Ministry of Health & Family Welfare policy & health alerts.", descHi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय की आधिकारिक गाइडलाइन।", url: "https://mohfw.gov.in/" }
  ],
  jobs: [
    { title: "National Career Service (NCS)", titleHi: "राष्ट्रीय करियर सेवा", desc: "Ministry of Labour job portal for verified job seekers & employers.", descHi: "श्रम मंत्रालय का आधिकारिक रोजगार पोर्टल।", url: "https://www.ncs.gov.in/" },
    { title: "MP Rojgar Portal", titleHi: "एम.पी. रोजगार पोर्टल", desc: "Madhya Pradesh state employment exchange and registration.", descHi: "मध्य प्रदेश राज्य रोजगार कार्यालय पोर्टल।", url: "https://mprojgar.gov.in/" },
    { title: "Staff Selection Commission (SSC)", titleHi: "कर्मचारी चयन आयोग", desc: "Official government recruitment examinations portal.", descHi: "कर्मचारी चयन आयोग की आधिकारिक वेबसाइट।", url: "https://ssc.gov.in/" }
  ],
  scholarships: [
    { title: "National Scholarship Portal (NSP)", titleHi: "राष्ट्रीय छात्रवृत्ति पोर्टल", desc: "Single gateway for government scholarships across India.", descHi: "भारत भर में सरकारी छात्रवृत्तियों के लिए एक एकल पोर्टल।", url: "https://scholarships.gov.in/" },
    { title: "MP Scholarship Portal 2.0", titleHi: "एम.पी. छात्रवृत्ति पोर्टल 2.0", desc: "Post-matric and Higher Education scholarships in MP.", descHi: "मध्य प्रदेश उच्च शिक्षा एवं पोस्ट-मैट्रिक छात्रवृत्ति।", url: "http://scholarshipportal.mp.nic.in/" },
    { title: "AICTE Student Schemes", titleHi: "एआईसीटीई छात्र योजनाएं", desc: "Technical education scholarships and fellowship schemes.", descHi: "तकनीकी शिक्षा छात्रवृत्ति और फेलोशिप योजनाएं।", url: "https://www.aicte-india.org/schemes/students-development-schemes" }
  ],
  food: [
    { title: "National Food Security Portal (NFSA)", titleHi: "राष्ट्रीय खाद्य सुरक्षा पोर्टल", desc: "Ration card status, foodgrain allocation & NFSA schemes.", descHi: "राशन कार्ड स्थिति और खाद्यान्न आवंटन पोर्टल।", url: "https://nfsa.gov.in/" },
    { title: "MP Ration Mitra Portal", titleHi: "एम.पी. राशन मित्र पोर्टल", desc: "Madhya Pradesh public distribution system & fair price shops.", descHi: "मध्य प्रदेश सार्वजनिक वितरण प्रणाली पोर्टल।", url: "https://rationmitra.mp.gov.in/" },
    { title: "Dept of Food & Public Distribution", titleHi: "खाद्य एवं सार्वजनिक वितरण विभाग", desc: "Central food security policy and Anna Yojana updates.", descHi: "केंद्रीय खाद्य सुरक्षा नीति और अन्न योजना।", url: "https://dfpd.gov.in/" }
  ],
  medicine: [
    { title: "Pradhan Mantri Janaushadhi (PMBJP)", titleHi: "प्रधानमंत्री जनऔषधि योजना", desc: "Generic medicines locator & low-cost pharmacy finder.", descHi: "कम कीमत पर गुणवत्तापूर्ण जेनेरिक दवाएं।", url: "https://janaushadhi.gov.in/" },
    { title: "eSanjeevani National Telemedicine", titleHi: "ई-संजीवनी राष्ट्रीय टेलीमेडिसिन", desc: "Free government doctor consultation over video.", descHi: "निःशुल्क सरकारी डॉक्टर वीडियो परामर्श।", url: "https://esanjeevani.mohfw.gov.in/" },
    { title: "CDSCO Medical Regulator", titleHi: "सीडीएससीओ औषधि नियामक", desc: "Central Drugs Standard Control Organization.", descHi: "केंद्रीय औषधि मानक नियंत्रण संगठन।", url: "https://cdsco.gov.in/" }
  ],
  education: [
    { title: "DIKSHA Educational Portal", titleHi: "दीक्षा डिजिटल शिक्षा पोर्टल", desc: "National Digital Infrastructure for Teachers and Students.", descHi: "शिक्षकों और छात्रों के लिए राष्ट्रीय डिजिटल शिक्षा इंफ्रास्ट्रक्चर।", url: "https://diksha.gov.in/" },
    { title: "SWAYAM Free Online Education", titleHi: "स्वयं मुफ्त ऑनलाइन शिक्षा", desc: "MHRD initiative for free school, UG & PG online courses.", descHi: "निःशुल्क स्कूल, यूजी और पीजी ऑनलाइन पाठ्यक्रम।", url: "https://swayam.gov.in/" },
    { title: "Ministry of Education India", titleHi: "शिक्षा मंत्रालय भारत", desc: "National Education Policy (NEP) and university portals.", descHi: "राष्ट्रीय शिक्षा नीति और विश्वविद्यालय पोर्टल।", url: "https://www.education.gov.in/" }
  ],
  "women-safety": [
    { title: "National Emergency Number 112", titleHi: "राष्ट्रीय आपातकालीन नंबर 112", desc: "Single emergency response support system for pan-India.", descHi: "अखिल भारतीय आपातकालीन प्रतिक्रिया सहायता प्रणाली।", url: "https://112.gov.in/" },
    { title: "National Commission for Women (NCW)", titleHi: "राष्ट्रीय महिला आयोग", desc: "Women's rights, legal aid & complaint portal.", descHi: "महिला अधिकार, कानूनी सहायता और शिकायत पोर्टल।", url: "http://ncw.nic.in/" },
    { title: "WCD One Stop Crisis Centre", titleHi: "महिला एवं बाल विकास मंत्रालय", desc: "Sakhi One Stop Centre initiative for women safety.", descHi: "महिला सुरक्षा के लिए सखी वन स्टॉप सेंटर पहल।", url: "https://wcd.nic.in/" }
  ],
  seniors: [
    { title: "Elder Line 14567 Portal", titleHi: "एल्डर लाइन 14567 पोर्टल", desc: "National helpline for senior citizens by Ministry of Social Justice.", descHi: "वरिष्ठ नागरिकों के लिए राष्ट्रीय हेल्पलाइन।", url: "https://elderline.dosje.gov.in/" },
    { title: "SACRED Senior Re-Employment", titleHi: "सेक्रेड वरिष्ठ नागरिक पोर्टल", desc: "Senior Able Citizens for Re-Employment in Dignity.", descHi: "वरिष्ठ नागरिकों के लिए सम्मानजनक रोजगार पोर्टल।", url: "https://sacred.dosje.gov.in/" },
    { title: "Ministry of Social Justice & Empowerment", titleHi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय", desc: "Old age pensions & senior welfare schemes.", descHi: "वृद्धावस्था पेंशन और वरिष्ठ कल्याण योजनाएं।", url: "https://socialjustice.gov.in/" }
  ],
  animals: [
    { title: "Animal Welfare Board of India (AWBI)", titleHi: "भारतीय जीव जन्तु कल्याण बोर्ड", desc: "Statutory advisory body on animal welfare laws.", descHi: "पशु कल्याण कानूनों पर सांविधिक सलाहकार निकाय।", url: "http://www.awbi.gov.in/" },
    { title: "Dept of Animal Husbandry & Dairying", titleHi: "पशुपालन एवं डेयरी विभाग", desc: "Central veterinary services and livestock welfare.", descHi: "केंद्रीय पशु चिकित्सा सेवाएं और पशुधन कल्याण।", url: "https://dahd.nic.in/" }
  ],
  environment: [
    { title: "Meri LiFE Movement Portal", titleHi: "मेरी लाइफ आंदोलन पोर्टल", desc: "Official Lifestyle for Environment initiative by MoEFCC.", descHi: "पर्यावरण के लिए जीवन शैली का आधिकारिक पोर्टल।", url: "https://merilife.nic.in/" },
    { title: "MoEFCC Climate Change Portal", titleHi: "पर्यावरण, वन और जलवायु परिवर्तन मंत्रालय", desc: "Central environment conservation policies & green drives.", descHi: "केंद्रीय पर्यावरण संरक्षण नीतियां और हरित अभियान।", url: "https://moef.gov.in/" },
    { title: "National Afforestation Board", titleHi: "राष्ट्रीय वनीकरण बोर्ड", desc: "Tree plantation, forest restoration & eco-drives.", descHi: "वृक्षारोपण और वन बहाली बोर्ड।", url: "https://naeb.nic.in/" }
  ],
  crowdfunding: [
    { title: "India Development Foundation (IDF)", titleHi: "इंडिया डेवलपमेंट फाउंडेशन", desc: "Ministry of External Affairs philanthropy & community fund.", descHi: "परोपकार और सामुदायिक विकास कोष।", url: "https://idfc.gov.in/" },
    { title: "NITI Aayog Community Initiatives", titleHi: "नीति आयोग सामुदायिक पहल", desc: "Aspirational districts & community crowdfunding oversight.", descHi: "आकांक्षी जिले एवं सामुदायिक विकास निगरानी।", url: "https://niti.gov.in/" }
  ],
  culture: [
    { title: "Ministry of Culture India", titleHi: "संस्कृति मंत्रालय भारत", desc: "National monuments, festivals, art & heritage portal.", descHi: "राष्ट्रीय स्मारक, त्यौहार, कला एवं विरासत पोर्टल।", url: "https://www.indiaculture.gov.in/" },
    { title: "Archaeological Survey of India (ASI)", titleHi: "भारतीय पुरातत्व सर्वेक्षण", desc: "Preservation of national heritage sites & monuments.", descHi: "राष्ट्रीय विरासत स्थलों और स्मारकों का संरक्षण।", url: "https://asi.nic.in/" },
    { title: "Incredible India Portal", titleHi: "इन्क्रेडिबल इंडिया (अतुल्य भारत)", desc: "Ministry of Tourism official cultural & heritage guide.", descHi: "पर्यटन मंत्रालय की आधिकारिक सांस्कृतिक निर्देशिका।", url: "https://www.incredibleindia.org/" }
  ],
  disaster: [
    { title: "National Disaster Management (NDMA)", titleHi: "राष्ट्रीय आपदा प्रबंधन प्राधिकरण", desc: "Central emergency alerts, guidelines & disaster response.", descHi: "केंद्रीय आपातकालीन अलर्ट और आपदा प्रबंधन।", url: "https://ndma.gov.in/" },
    { title: "National Disaster Response Force (NDRF)", titleHi: "राष्ट्रीय आपदा मोचन बल (एनडीआरएफ)", desc: "Disaster rescue operations & emergency contact.", descHi: "आपदा बचाव कार्य एवं आपातकालीन संपर्क।", url: "https://ndrf.gov.in/" },
    { title: "IMD Mausam Weather & Warning", titleHi: "भारत मौसम विज्ञान विभाग", desc: "Official weather hazard warnings & cyclone tracker.", descHi: "आधिकारिक मौसम संबंधी चेतावनियां और चक्रवात ट्रैकर।", url: "https://mausam.imd.gov.in/" }
  ],
  farmer: [
    { title: "PM-KISAN Samman Nidhi", titleHi: "पीएम-किसान सम्मान निधि", desc: "Direct income support portal for Indian farmers.", descHi: "भारतीय किसानों के लिए प्रत्यक्ष आय सहायता पोर्टल।", url: "https://pmkisan.gov.in/" },
    { title: "e-NAM National Agriculture Market", titleHi: "ई-नाम राष्ट्रीय कृषि बाजार", desc: "Pan-India electronic trading portal for farm produce.", descHi: "कृषि उपज के लिए अखिल भारतीय इलेक्ट्रॉनिक व्यापार पोर्टल।", url: "https://www.enam.gov.in/" },
    { title: "Kisan Call Centre & Agricoop", titleHi: "किसान कॉल सेंटर एवं कृषि विभाग", desc: "Ministry of Agriculture farmer helpline and advisories.", descHi: "कृषि मंत्रालय की किसान हेल्पलाइन और सलाह।", url: "https://agricoop.gov.in/" }
  ],
  schemes: [
    { title: "MyScheme Government Portal", titleHi: "मायस्कीम सरकारी पोर्टल", desc: "Search & discover 1,000+ government schemes across India.", descHi: "भारत भर में 1,000+ सरकारी योजनाएं खोजें।", url: "https://www.myscheme.gov.in/" },
    { title: "MP e-Services Govt Portal", titleHi: "एम.पी. ई-सेवा पोर्टल", desc: "Madhya Pradesh state government services directory.", descHi: "मध्य प्रदेश राज्य सरकार की सेवाएं निर्देशिका।", url: "https://services.mp.gov.in/eservice/" },
    { title: "India.gov.in Schemes Directory", titleHi: "भारत पोर्टल योजना निर्देशिका", desc: "Official catalog of welfare schemes for citizens.", descHi: "नागरिकों के लिए कल्याणकारी योजनाओं की आधिकारिक सूची।", url: "https://www.india.gov.in/my-government/schemes" }
  ],
  skills: [
    { title: "Skill India Digital Portal", titleHi: "स्किल इंडिया डिजिटल पोर्टल", desc: "Ministry of Skill Development vocational training platform.", descHi: "कौशल विकास मंत्रालय का व्यावसायिक प्रशिक्षण मंच।", url: "https://www.skillindiadigital.gov.in/" },
    { title: "PM Kaushal Vikas Yojana (PMKVY)", titleHi: "प्रधानमंत्री कौशल विकास योजना", desc: "Free industry-relevant skill training for Indian youth.", descHi: "भारतीय युवाओं के लिए मुफ्त उद्योग-प्रासंगिक कौशल प्रशिक्षण।", url: "https://pmkvyofficial.org/" },
    { title: "NSDC Skill India", titleHi: "राष्ट्रीय कौशल विकास निगम", desc: "National Skill Development Corporation skill programs.", descHi: "राष्ट्रीय कौशल विकास निगम कौशल कार्यक्रम।", url: "https://nsdcindia.org/" }
  ],
  countries: [
    { title: "Ministry of External Affairs (MEA)", titleHi: "विदेश मंत्रालय भारत", desc: "Official Indian foreign affairs & embassy directory.", descHi: "आधिकारिक भारतीय विदेश नीति एवं दूतावास निर्देशिका।", url: "https://www.mea.gov.in/" },
    { title: "Passport Seva Official Portal", titleHi: "पासपोर्ट सेवा आधिकारिक पोर्टल", desc: "Indian passport application & status tracking portal.", descHi: "भारतीय पासपोर्ट आवेदन एवं स्थिति ट्रैकिंग पोर्टल।", url: "https://www.passportindia.gov.in/" },
    { title: "Indian Visa Online", titleHi: "इंडियन वीजा ऑनलाइन", desc: "Official Indian e-Visa services portal.", descHi: "आधिकारिक भारतीय ई-वीजा सेवा पोर्टल।", url: "https://indianvisaonline.gov.in/" }
  ],
  earthquakes: [
    { title: "National Centre for Seismology (NCS)", titleHi: "राष्ट्रीय सीस्मोलॉजी केंद्र", desc: "Ministry of Earth Sciences official earthquake tracker.", descHi: "पृथ्वी विज्ञान मंत्रालय का आधिकारिक भूकंप ट्रैकर।", url: "https://seismo.gov.in/" },
    { title: "USGS Global Earthquake Hazards", titleHi: "यूएसजीएस वैश्विक भूकंप निगरानी", desc: "Real-time global seismic monitoring and alerts.", descHi: "वास्तविक समय वैश्विक भूकंपीय निगरानी और अलर्ट।", url: "https://earthquake.usgs.gov/" },
    { title: "NDMA Earthquake Safety", titleHi: "एनडीएमए भूकंप सुरक्षा", desc: "National guidelines for earthquake preparedness.", descHi: "भूकंप की तैयारी के लिए राष्ट्रीय दिशानिर्देश।", url: "https://ndma.gov.in/Natural-Hazards/Earthquakes" }
  ],
  "fuel-tracker": [
    { title: "Ministry of Petroleum & Natural Gas", titleHi: "पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय", desc: "Central fuel policies and daily pricing standards.", descHi: "केंद्रीय ईंधन नीतियां और दैनिक मूल्य निर्धारण मानक।", url: "https://mopng.gov.in/" },
    { title: "Petroleum Planning & Analysis (PPAC)", titleHi: "पेट्रोलियम योजना एवं विश्लेषण सेल", desc: "Official Indian fuel consumption and price analytics.", descHi: "आधिकारिक भारतीय ईंधन खपत और मूल्य विश्लेषण।", url: "https://www.ppac.gov.in/" }
  ],
  "gps-toolkit": [
    { title: "Parivahan Sewa Portal (MoRTH)", titleHi: "परिवहन सेवा पोर्टल", desc: "Ministry of Road Transport driving license & RC portal.", descHi: "सड़क परिवहन मंत्रालय का ड्राइविंग लाइसेंस और आरसी पोर्टल।", url: "https://parivahan.gov.in/" },
    { title: "ISRO Bhuvan Geo-Portal", titleHi: "इसरो भुवन भू-पोर्टल", desc: "ISRO Indian 3D satellite map and GIS navigation.", descHi: "इसरो भारतीय 3D उपग्रह मानचित्र और जीआईएस नेविगेशन।", url: "https://bhuvan.nrsc.gov.in/" }
  ],
  vitals: [
    { title: "ABHA Health Card (ABDM)", titleHi: "आभा हेल्थ कार्ड", desc: "Create & link your digital health records.", descHi: "अपने डिजिटल स्वास्थ्य रिकॉर्ड बनाएं और लिंक करें।", url: "https://abha.abdm.gov.in/" },
    { title: "Fit India Movement Portal", titleHi: "फिट इंडिया मूवमेंट", desc: "Government fitness standards and health challenges.", descHi: "सरकारी फिटनेस मानक और स्वास्थ्य चुनौतियां।", url: "https://fitindia.gov.in/" }
  ],
  medications: [
    { title: "PM Janaushadhi Kendras", titleHi: "प्रधानमंत्री जनऔषधि केंद्र", desc: "Find nearest PMBJP affordable medicine store.", descHi: "निकटतम पीएमबीजेपी सस्ती दवा स्टोर खोजें।", url: "https://janaushadhi.gov.in/" },
    { title: "eSanjeevani OPD Consult", titleHi: "ई-संजीवनी ओपीडी", desc: "Free telemedicine consultation with government doctors.", descHi: "सरकारी डॉक्टरों के साथ मुफ्त टेलीमेडिसिन परामर्श।", url: "https://esanjeevaniopd.in/" }
  ],
  "medical-dict": [
    { title: "National Health Portal Dictionary", titleHi: "राष्ट्रीय स्वास्थ्य पोर्टल शब्दकोश", desc: "Official medical dictionary, diseases & first-aid guide.", descHi: "आधिकारिक चिकित्सा शब्दकोश, बीमारियां और प्राथमिक चिकित्सा।", url: "https://www.nhp.gov.in/" },
    { title: "AIIMS Health Information", titleHi: "एम्स स्वास्थ्य सूचना पोर्टल", desc: "All India Institute of Medical Sciences patient guide.", descHi: "अखिल भारतीय आयुर्विज्ञान संस्थान रोगी गाइड।", url: "https://www.aiims.edu/" }
  ],
  sos: [
    { title: "112 India Emergency System", titleHi: "112 इंडिया आपातकालीन प्रणाली", desc: "Pan-India single emergency contact number.", descHi: "अखिल भारतीय एकल आपातकालीन संपर्क नंबर।", url: "https://112.gov.in/" },
    { title: "National Disaster Response NDMA", titleHi: "राष्ट्रीय आपदा प्रबंधन प्राधिकरण", desc: "Emergency crisis action & disaster relief.", descHi: "आपातकालीन संकट कार्रवाई और आपदा राहत।", url: "https://ndma.gov.in/" }
  ],
  "period-tracker": [
    { title: "Rashtriya Kishor Swasthya (RKSK)", titleHi: "राष्ट्रीय किशोर स्वास्थ्य कार्यक्रम", desc: "Ministry of Health adolescent health & wellness portal.", descHi: "स्वास्थ्य मंत्रालय का किशोर स्वास्थ्य एवं कल्याण पोर्टल।", url: "https://nhm.gov.in/" },
    { title: "Ministry of Women & Child (WCD)", titleHi: "महिला एवं बाल विकास मंत्रालय", desc: "Women health schemes and hygiene initiatives.", descHi: "महिला स्वास्थ्य योजनाएं और स्वच्छता पहल।", url: "https://wcd.nic.in/" }
  ],
  "child-tracker": [
    { title: "Poshan Tracker Portal", titleHi: "पोषण ट्रैकर पोर्टल", desc: "Ministry of Women & Child Development child growth tracker.", descHi: "महिला एवं बाल विकास मंत्रालय का बाल विकास ट्रैकर।", url: "https://poshantracker.in/" },
    { title: "U-WIN Universal Immunization", titleHi: "यू-विन सार्वभौमिक टीकाकरण", desc: "Child vaccination passport and scheduling portal.", descHi: "बाल टीकाकरण पासपोर्ट और निर्धारण पोर्टल।", url: "https://uwin.mohfw.gov.in/" },
    { title: "NCPCR Child Rights Protection", titleHi: "राष्ट्रीय बाल अधिकार संरक्षण आयोग", desc: "National Commission for Protection of Child Rights.", descHi: "राष्ट्रीय बाल अधिकार संरक्षण आयोग।", url: "https://ncpcr.gov.in/" }
  ],
  "resume-builder": [
    { title: "National Career Service (NCS)", titleHi: "राष्ट्रीय करियर सेवा", desc: "Create profile on India's official employment portal.", descHi: "भारत के आधिकारिक रोजगार पोर्टल पर प्रोफाइल बनाएं।", url: "https://www.ncs.gov.in/" },
    { title: "AICTE Internship Portal", titleHi: "एआईसीटीई इंटर्नशिप पोर्टल", desc: "Official student internships across government & industry.", descHi: "सरकार और उद्योग में आधिकारिक छात्र इंटर्नशिप।", url: "https://internship.aicte-india.org/" }
  ],
  "doc-scanner": [
    { title: "DigiLocker Official Portal", titleHi: "डिजिलॉकर आधिकारिक पोर्टल", desc: "Store & verify your authentic digital documents safely.", descHi: "अपने प्रामाणिक डिजिटल दस्तावेज़ों को सुरक्षित रूप से स्टोर करें।", url: "https://www.digilocker.gov.in/" },
    { title: "e-Sign India Portal", titleHi: "ई-साइन इंडिया पोर्टल", desc: "Government Aadhaar-based digital document signing.", descHi: "सरकारी आधार आधारित डिजिटल दस्तावेज़ हस्ताक्षर।", url: "https://esign.gov.in/" }
  ],
  "ai-chat": [
    { title: "Bhashini National AI Mission", titleHi: "भाषिणी राष्ट्रीय एआई मिशन", desc: "Government of India AI-driven Indian language translation.", descHi: "भारत सरकार का एआई-संचालित भारतीय भाषा अनुवाद।", url: "https://bhashini.gov.in/" },
    { title: "IndiaAI Official Portal", titleHi: "इंडिया-एआई आधिकारिक पोर्टल", desc: "National AI portal for research, tools & datasets.", descHi: "अनुसंधान, उपकरण और डेटासेट के लिए राष्ट्रीय एआई पोर्टल।", url: "https://indiaai.gov.in/" }
  ],
  "story-library": [
    { title: "National Digital Library of India", titleHi: "भारत का राष्ट्रीय डिजिटल पुस्तकालय", desc: "Virtual repository of educational resources by IIT Kharagpur.", descHi: "शैक्षणिक संसाधनों का आभासी भंडार।", url: "https://ndl.iitkgp.ac.in/" },
    { title: "Sahitya Akademi Portal", titleHi: "साहित्य अकादमी पोर्टल", desc: "National Academy of Letters Indian literature archive.", descHi: "राष्ट्रीय साहित्य अकादमी भारतीय साहित्य संग्रह।", url: "https://sahitya-akademi.gov.in/" }
  ],
  "hindu-calendar": [
    { title: "Rashtriya Panchang (IMD)", titleHi: "राष्ट्रीय पंचांग (आईएमडी)", desc: "Official Indian National Calendar published by Poshtik.", descHi: "पोष्टिक द्वारा प्रकाशित आधिकारिक भारतीय राष्ट्रीय पंचांग।", url: "https://poshtik.gov.in/" },
    { title: "Ministry of Culture Festivals", titleHi: "संस्कृति मंत्रालय त्यौहार", desc: "Official calendar of Indian heritage & traditional festivals.", descHi: "भारतीय विरासत और पारंपरिक त्योहारों का आधिकारिक कैलेंडर।", url: "https://www.indiaculture.gov.in/" }
  ],
  "news-feed": [
    { title: "Press Information Bureau (PIB)", titleHi: "प्रेस सूचना ब्यूरो (पीआईबी)", desc: "Official press releases of the Government of India.", descHi: "भारत सरकार की आधिकारिक प्रेस विज्ञप्तियां।", url: "https://pib.gov.in/" },
    { title: "DD News Official Portal", titleHi: "डीडी न्यूज आधिकारिक पोर्टल", desc: "Doordarshan national news broadcasting network.", descHi: "दूरदर्शन राष्ट्रीय समाचार प्रसारण नेटवर्क।", url: "https://ddnews.gov.in/" },
    { title: "All India Radio News (AIR)", titleHi: "ऑल इंडिया रेडियो न्यूज", desc: "News Services Division of All India Radio.", descHi: "ऑल इंडिया रेडियो का समाचार सेवा प्रभाग।", url: "https://newsonair.gov.in/" }
  ],
  "internet-radio": [
    { title: "Prasar Bharati AIR Live", titleHi: "प्रसार भारती एआईआर लाइव", desc: "Official Prasar Bharati radio live streaming platform.", descHi: "आधिकारिक प्रसार भारती रेडियो लाइव स्ट्रीमिंग प्लेटफॉर्म।", url: "https://prasarbharati.gov.in/" },
    { title: "All India Radio National", titleHi: "ऑल इंडिया रेडियो राष्ट्रीय", desc: "AIR national bulletin & regional channels.", descHi: "एआईआर राष्ट्रीय बुलेटिन और क्षेत्रीय चैनल।", url: "https://newsonair.gov.in/" }
  ],
  "transit-planner": [
    { title: "Parivahan Mobility (MoRTH)", titleHi: "परिवहन मोबिलिटी", desc: "National Common Mobility Card & transit advisories.", descHi: "राष्ट्रीय सामान्य गतिशीलता कार्ड और पारगमन सलाह।", url: "https://morth.nic.in/" },
    { title: "Indian Railways IRCTC", titleHi: "भारतीय रेलवे आईआरसीटीसी", desc: "Official Indian Railways ticket booking & train status.", descHi: "आधिकारिक भारतीय रेलवे टिकट बुकिंग और ट्रेन स्थिति।", url: "https://www.irctc.co.in/" },
    { title: "MP Metro Rail Corporation", titleHi: "एम.पी. मेट्रो रेल कॉर्पोरेशन", desc: "Madhya Pradesh metro transit routes & project updates.", descHi: "मध्य प्रदेश मेट्रो ट्रांजिट मार्ग और परियोजना अपडेट।", url: "https://mpmetrorail.com/" }
  ],
  youth: [
    { title: "Mera Yuva Bharat (MY Bharat)", titleHi: "मेरा युवा भारत (माय भारत)", desc: "Autonomous body for youth development & civic participation.", descHi: "युवा विकास और नागरिक भागीदारी के लिए स्वायत्त निकाय।", url: "https://mybharat.gov.in/" },
    { title: "Ministry of Youth Affairs & Sports", titleHi: "युवा कार्यक्रम एवं खेल मंत्रालय", desc: "Youth empowerment, sports grants & National Youth Awards.", descHi: "युवा सशक्तिकरण, खेल अनुदान और राष्ट्रीय युवा पुरस्कार।", url: "https://yas.nic.in/" },
    { title: "Khelo India Portal", titleHi: "खेलो इंडिया पोर्टल", desc: "National program for development of sports in India.", descHi: "भारत में खेलों के विकास के लिए राष्ट्रीय कार्यक्रम।", url: "https://kheloindia.gov.in/" }
  ],
  nation: [
    { title: "MyGov India Citizen Engagement", titleHi: "मायगव इंडिया नागरिक पोर्टल", desc: "Participate in nation building, policy discussions & polls.", descHi: "राष्ट्र निर्माण, नीति चर्चा और सर्वेक्षणों में भाग लें।", url: "https://www.mygov.in/" },
    { title: "Kartavya Civic Duty Portal", titleHi: "कर्तव्य नागरिक पोर्टल", desc: "Citizen fundamental duties awareness & nation building.", descHi: "नागरिक मौलिक कर्तव्य जागरूकता और राष्ट्र निर्माण।", url: "https://kartavya.gov.in/" },
    { title: "Azadi Ka Amrit Mahotsav", titleHi: "आजादी का अमृत महोत्सव", desc: "National celebrations & patriotic initiatives.", descHi: "राष्ट्रीय समारोह और देशभक्तिपूर्ण पहल।", url: "https://amritmahotsav.nic.in/" }
  ]
};

export function getGovLinksForService(serviceId: string): GovLink[] {
  return SERVICE_GOV_LINKS[serviceId] || [
    { title: "National Portal of India", titleHi: "भारत का राष्ट्रीय पोर्टल", desc: "Official single window access to government services.", descHi: "सरकारी सेवाओं की आधिकारिक एकल खिड़की।", url: "https://www.india.gov.in/" },
    { title: "MP e-Services Portal", titleHi: "एम.पी. ई-सेवा पोर्टल", desc: "Madhya Pradesh state e-services directory.", descHi: "मध्य प्रदेश राज्य ई-सेवाएं निर्देशिका।", url: "https://services.mp.gov.in/eservice/" }
  ];
}
