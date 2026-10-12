export type InstagramPost = {
  id: string;
  title: string;
  url: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  videoId?: string;
  caption?: string;
  category?: string;
  platform?: "youtube" | "instagram" | "facebook";
  active?: boolean;
  order?: number;
};

// 20 Authentic Foundation Reels
export const DEFAULT_20_REELS: InstagramPost[] = [
  {
    id: "reel-1",
    title: "राष्ट्रपिता महात्मा गांधी जी को सादर नमन।",
    url: "https://www.instagram.com/reel/DAms1e9vU8w/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-2",
    title: "देहदान, महादान",
    url: "https://www.instagram.com/reel/DAkM8QqvG6L/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-3",
    title: "प्रथम पूज्य गणपति जी से लोक कल्याण की कामना",
    url: "https://www.instagram.com/reel/DAc_XF_v8iK/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-4",
    title: "अदम्य साहस, सूझबूझ और कर्तव्यनिष्ठा की मिसाल बने भारतीय पायलट कैप्टन स्मित मच्छार जी पर आर पी फाउंडेशन सहित देश को गर्व है।",
    url: "https://www.instagram.com/reel/DAYf5R-vhZq/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-5",
    title: "विश्व हिन्दू परिषद के पूर्व अंतरराष्ट्रीय अध्यक्ष श्रद्धेय अशोक सिंघल जी की जयंती के अवसर पर रवीन्द्र भवन, भोपाल में आयोजित जन्म शताब्दी वर्ष उद्घाटन समारोह",
    url: "https://www.instagram.com/reel/DAV2UeZv_Yk/",
    category: "Culture",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-6",
    title: "र पी फाउंडेशन द्वारा पंडित दीनदयाल उपाध्याय जी की जयंती के अवसर पर जनसेवा एवं स्वस्थ समाज के संकल्प के साथ भोपाल के वाजपेयी नगर, ईदगाह हिल्स स्थित योग केंद्र, जवाहरलाल नेहरू अस्पताल के पास निःशुल्क स्वास्थ्य शिविर का आयोजन",
    url: "https://www.instagram.com/reel/DATQUgRvJd3/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-7",
    title: "RP Foundation की टीम एवं PCDS Final Batch के 22 विद्यार्थियों ने भोपाल के शाहजहांनाबाद (इद्गाह हिल्स) स्थित आसरा वृद्धजन सेवा आश्रम पहुँचकर वहां निवासरत बुजुर्गों के साथ स्नेह, अपनत्व और खुशियों से भरा समय बिताया।",
    url: "https://www.instagram.com/reel/DAQ3u4XvA1d/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-8",
    title: "RP Foundation के संस्थापक एवं People’s Group के उपाध्यक्ष व प्रबंध निदेशक श्री रोहित पंडित जी ने राष्ट्रीय स्वयंसेवक संघ के सरसंघचालक डॉ. मोहन भागवत जी से आत्मीय भेंट की।",
    url: "https://www.instagram.com/reel/DAN7W9FvS5m/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-9",
    title: "RP Foundation द्वारा ग्राम गुंगा, बेरसिया रोड, भोपाल में रोजगार एवं जागरूकता कार्यक्रम का आयोजन",
    url: "https://www.instagram.com/reel/DALa-gSvL0o/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-10",
    title: "RP Foundation लगातार जरूरतमंद लोगों तक निःशुल्क स्वास्थ्य सेवाएँ पहुँचाने का प्रयास",
    url: "https://www.instagram.com/reel/DAI3g7fvf5l/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-11",
    title: "RP Foundation लगातार समाज के अंतिम व्यक्ति तक बेहतर स्वास्थ्य सेवाएँ पहुँचाने के लिए कार्यरत",
    url: "https://www.instagram.com/reel/DAGWn8lvp1u/",
    category: "Healthcare",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-12",
    title: "दिव्यांग कल्याण एवं विकास परिषद (म.प्र.) के तत्वावधान में भोपाल में आयोजित संगठन के समस्त जिलाध्यक्षों एवं जिला सचिवों की प्रदेशस्तरीय बैठक में आर.पी. फाउंडेशन के सचिव श्री अंकित द्विवेदी जी ने सहभागिता की और कार्यक्रम को संबोधित किया",
    url: "https://www.instagram.com/reel/DAD0kC_vK3h/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-13",
    title: "RP Foundation रोजगार मेला",
    url: "https://www.instagram.com/reel/DABK6RkvE2e/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-14",
    title: "आर पी फाउंडेशन के संस्थापक एवं पीपुल्स ग्रुप के उपाध्यक्ष एवं प्रबंध निदेशक श्री रोहित पंडित जी ने कार्यक्रम को संबोधित करते हुए उपस्थित विशाल जनसमुदाय को रक्तदान, अंगदान एवं देहदान जैसे पुनीत कार्यों के लिए प्रेरित किया",
    url: "https://www.instagram.com/reel/C_-kdLAvB1Z/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-15",
    title: "मुख्यमंत्री डॉ. मोहन यादव यादव ने भोपाल के रविन्द्र भवन में आयोजित तीन दिवसीय बुंदेली समागम में बिन्नू की बारात' पूर्णत: बुंदेलखंडी बोली में निर्मित फीचर फिल्म के टीज़र और मोशन पोस्टर का विमोचन किया",
    url: "https://www.instagram.com/reel/C_77m7TvS9h/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-16",
    title: "आर पी फाउंडेशन के संस्थापक, पीपुल्स ग्रुप के उपाध्यक्ष एवं प्रबंध निदेशक रोहित पंडित जी ने मुख्यमंत्री डॉ. मोहन यादव यादव जी की गरिमामई उपस्थिति में भोपाल के रविन्द्र भवन में आयोजित तीन दिवसीय बुंदेली समागम कार्यक्रम में सहभागिता की ।",
    url: "https://www.instagram.com/reel/C_5VuU7vF7g/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-17",
    title: "Live- बुंदेली समागम के प्रथम दिवस आर पी फाउंडेशन के संस्थापक एवं पीपुल्स ग्रुप के उपाध्यक्ष,प्रबंध निदेशक श्री रोहित पंडित जी ने मुख्यमंत्री श्री मोहन यादव जी की उपस्थिति में सहभागिता की । इस अवसर पर बुन्देली बौछार प्रमुख सचिन चौधरी जी सहित अन्य गणमान्य जन उपस्थित रहे",
    url: "https://www.instagram.com/reel/C_2w9Dvvp6f/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-18",
    title: "भोपाल की गोविंदपुरा विधानसभा के पिपलानी वार्ड क्रमांक 63 सहित विभिन्न क्षेत्रों में पेयजल की समस्या को देखते हुए आर.पी. फाउंडेशन द्वारा टैंकरों के माध्यम से निःशुल्क पेयजल वितरण सेवा निरंतर जारी है।",
    url: "https://www.instagram.com/reel/C_0NP5pvU5e/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-19",
    title: "\"जब उम्मीदें टूटने लगती हैं, तब एक अवसर पूरी ज़िंदगी बदल देता है।\"",
    url: "https://www.instagram.com/reel/C_xpE6pvT4d/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-20",
    title: "RP Foundation द्वारा मेट्रो कर्मचारियों के लिए विशेष स्वास्थ्य शिविर आयोजित किया गया",
    url: "https://www.instagram.com/reel/C_vFm4ovS3c/",
    category: "Healthcare",
    platform: "instagram",
    active: true
  }
];
