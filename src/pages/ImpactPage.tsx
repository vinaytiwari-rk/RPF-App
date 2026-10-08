      }
    } catch {
      setVolunteers([
        { id: "v1", name: "Ramesh Sharma", role: "Healthcare Coordinator", city: "Bhopal", skills: "First Aid, Logistics" },
        { id: "v2", name: "Pooja Verma", role: "Women Empowerment Lead", city: "Bhopal", skills: "Counseling, Training" },
        { id: "v3", name: "Amit Kumar", role: "Emergency Relief Volunteer", city: "Indore", skills: "Disaster Relief, Transport" }
      ]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      authorName: user?.name || (isHi ? "नागरिक स्वयंसेवक" : "Citizen Volunteer"),
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  const DEFAULT_IMPACT_DOMAINS = [
    {
      id: "sanitation",
      tab: "active" as const,
      titleEn: "Sanitation & Clean Environment Drive",
      titleHi: "स्वच्छता अभियान व प्रसाधन केंद्र",
      descEn: "Organizing mass cleanliness drives, plastic-free campaigns, and building public sanitation facilities across rural and urban slums.",
      descHi: "ग्रामीण व शहरी बस्तियों में वृहद स्वच्छता अभियान, प्लास्टिक-मुक्त ड्राइव एवं सार्वजनिक प्रसाधन केंद्रों का निर्माण।",
      icon: Trash2,
      badgeEn: "Clean Environment",
      badgeHi: "पर्यावरण व स्वच्छता",
      color: "bg-emerald-50 text-[#167C5A] border-emerald-200"
    },
    {
      id: "water",
      tab: "care" as const,
      titleEn: "Clean Drinking Water Supply",
      titleHi: "शुद्ध पेयजल व जल संरक्षण",
      descEn: "Installing handpumps, clean RO water systems, and deploying water tankers in drought-prone & water-scarce communities.",
      descHi: "जल संकटग्रस्त क्षेत्रों में हैंडपंप स्थापना, शुद्ध आरओ प्लांट व टैंकरों से निःशुल्क पेयजल आपूर्ति।",
      icon: Droplets,
      badgeEn: "Water Relief",
      badgeHi: "पेयजल आपूर्ति",
      color: "bg-sky-50 text-sky-600 border-sky-200"
    },
    {
      id: "jobs",
      tab: "active" as const,
      titleEn: "Jobs for Unemployed Youth & Women",
      titleHi: "रोजगार मेला व महिला आजीविका",
      descEn: "Organizing Mega Rojgar Melas, direct company hiring drives, and micro-entrepreneurship support for unemployed youth.",
      descHi: "बेरोजगार युवाओं के लिए रोजगार मेले, सीधी भर्ती ड्राइव व स्वरोजगार हेतु आर्थिक मार्गदर्शन।",
      icon: Briefcase,
      badgeEn: "Livelihood",
      badgeHi: "रोजगार अवसर",
      color: "bg-amber-50 text-[#D97706] border-amber-200"
    },
    {
      id: "pink-erickshaw",
      tab: "active" as const,
      titleEn: "Pink E-Rickshaw Empowerment",
      titleHi: "पिंक ई-रिक्शा योजना (महिला स्वावलंबन)",
      descEn: "Providing subsidized eco-friendly e-rickshaws to women, empowering them with financial independence and safe urban transit.",
      descHi: "महिलाओं को ई-रिक्शा स्वामित्व प्रदान कर आर्थिक स्वतंत्रता व सुरक्षित हरित परिवहन योजना।",
      icon: Heart,
      badgeEn: "Women Power",
      badgeHi: "महिला स्वावलंबन",
      color: "bg-rose-50 text-rose-600 border-rose-200"
    },
    {
      id: "skills",
      tab: "active" as const,
      titleEn: "Skills Training & Vocational Courses",
      titleHi: "कौशल विकास व वोकेशनल ट्रेनिंग",
      descEn: "Free tailoring units, computer literacy centers, electrician certification, and vocational skill workshops.",
      descHi: "निःशुल्क सिलाई-कढ़ाई केंद्र, कंप्यूटर साक्षरता, मोबाइल रिपेयरिंग व स्किल सर्टिफिकेशन कोर्स।",
      icon: Wrench,
      badgeEn: "Skill Development",
      badgeHi: "कौशल विकास",
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      id: "health",
      tab: "care" as const,
      titleEn: "Free Health Services & Emergency Care",
      titleHi: "निःशुल्क स्वास्थ्य सेवा व चिकित्सा शिविर",
      descEn: "Conducting Mega Health Camps, free medicine distribution, blood donor network dispatch, and diagnostic aid.",
      descHi: "निःशुल्क स्वास्थ्य जांच शिविर, दवा वितरण, इमरजेंसी ब्लड डोनेशन नेटवर्क व एम्बुलेंस सहायता।",
      icon: Stethoscope,
      badgeEn: "Healthcare",
      badgeHi: "निःशुल्क चिकित्सा",
      color: "bg-red-50 text-red-600 border-red-200"
    },
    {
      id: "welfare",
      tab: "care" as const,
      titleEn: "Helping Poor & Downtrodden People",
      titleHi: "निराश्रित व वंचित वर्ग कल्याण",
      descEn: "Distributing ration kits, winter blankets, disaster emergency relief, and shelter assistance to vulnerable families.",
      descHi: "जरूरतमंद परिवारों को राशन किट, शीतकालीन कंबल, आपदा राहत सामग्रियां व आश्रय सहायता।",
      icon: HandHeart,
      badgeEn: "Welfare Relief",
      badgeHi: "जन सेवा सहायता",
      color: "bg-[#B9E5CC]/10 text-[#245D45] border-[#B9E5CC]/20"
    },
    {
      id: "environment",
      tab: "active" as const,
      titleEn: "Keep Environment Clean & Plantation",
      titleHi: "पर्यावरण संरक्षण व वृक्षारोपण अभियान",
      descEn: "Organizing mass tree plantation drives, riverbank cleanups, and bio-waste management awareness.",
      descHi: "वृहद वृक्षारोपण अभियान, नदी तट स्वच्छता व पर्यावरण संरक्षण जन जागरूकता कार्यक्रम।",
      icon: Trees,
      badgeEn: "Green Earth",
      badgeHi: "पर्यावरण संरक्षण",
      color: "bg-emerald-50 text-[#167C5A] border-emerald-200"
    },
    {
      id: "culture",
      tab: "community" as const,
      titleEn: "Community Welfare & Indian Tradition",
      titleHi: "सामुदायिक कल्याण व भारतीय संस्कृति",
      descEn: "Promoting Indian heritage, traditional values, festival celebrations, and building inclusive community welfare spaces.",
      descHi: "भारतीय परंपराओं, नैतिक मूल्यों, सांस्कृतिक उत्सवों व सामुदायिक सद्भाव का प्रचार एवं संरक्षण।",
      icon: Landmark,
      badgeEn: "Heritage & Values",
      badgeHi: "संस्कृति व परंपरा",
      color: "bg-amber-50 text-[#C2410C] border-amber-200"
    },
    {
      id: "education",
      tab: "community" as const,
      titleEn: "Education Services & Youth Mentorship",
      titleHi: "निःशुल्क शिक्षा व बाल कल्याण",
      descEn: "Providing free books, stationery, evening tuition classes for underprivileged children, and youth sports aid.",
      descHi: "वंचित बच्चों हेतु निःशुल्क पाठ्य सामग्री, शाम की कोचिंग कक्षाएं एवं युवा खेलकूद प्रोत्साहन।",
      icon: GraduationCap,
      badgeEn: "Youth Education",
      badgeHi: "बाल शिक्षा सपोर्ट",
      color: "bg-indigo-50 text-indigo-600 border-indigo-200"
    }
  ];


  const IMPACT_DOMAINS = Array.isArray((cmsConfig as any)?.impactDomains)
    ? [...(cmsConfig as any).impactDomains]
        .filter((d: any) => d && d.enabled !== false)
        .sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0))
        .map((d: any) => ({
          id: d.id,
          tab: (d.tab || "active") as SubFilterTab,
          titleEn: d.title || d.titleEn || d.titleHi || "Impact Initiative",
          titleHi: d.title || d.titleHi || d.titleEn || "प्रभाव पहल",
          descEn: d.description || d.descEn || d.descHi || "",
          descHi: d.description || d.descHi || d.descEn || "",
          icon: ICON_MAP[d.iconName] || Sparkles,
          badgeEn: d.badge || d.badgeEn || d.badgeHi || "Ground Action",
          badgeHi: d.badge || d.badgeHi || d.badgeEn || "जन सेवा",
          color: d.color || "bg-emerald-50 text-[#167C5A] border-emerald-200"
        }))
    : DEFAULT_IMPACT_DOMAINS;


  const liveStats = useMemo(() => {
    if (Array.isArray(cmsConfig?.impactStats)) {
      return [...cmsConfig.impactStats]
        .filter((s: any) => s && s.enabled !== false)
        .sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0))
        .map((s: any) => s.id === "cards_issued" && cardImpact?.totalCards ? { ...s, value: cardImpact.totalCards } : s);
    }
    return [
      { id: "beneficiaries", labelEn: "Total Beneficiaries", labelHi: "कुल लाभार्थी नागरिक", value: 0, suffix: "+", iconName: "Users" },
      { id: "health_camps", labelEn: "Health & Eye Camps", labelHi: "स्वास्थ्य एवं नेत्र शिविर", value: 0, suffix: "+", iconName: "Stethoscope" },
      { id: "tree_plantations", labelEn: "Trees Planted", labelHi: "रोपित वृक्ष व पौधे", value: 0, suffix: "+", iconName: "Trees" },
      { id: "cards_issued", labelEn: "Jan Seva Cards", labelHi: "जन सेवा कार्ड जारी", value: cardImpact?.totalCards ?? 0, suffix: "+", iconName: "Award" }
    ];
  }, [cmsConfig?.impactStats, cardImpact]);

  const liveDomains = useMemo(() => {
    if (Array.isArray(cmsConfig?.impactDomains)) {
      return [...cmsConfig.impactDomains]
        .filter((d: any) => d && d.enabled !== false)
        .sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0));
    }
    return IMPACT_DOMAINS;
  }, [cmsConfig?.impactDomains]);

  const filteredDomains = liveDomains.filter((d: any) => subTab === "all" || d.tab === subTab);

  const liveStories = useMemo(() => {
    if (Array.isArray(cmsConfig?.testimonials) && cmsConfig.testimonials.length > 0) {
      return cmsConfig.testimonials.filter((t: any) => t.enabled !== false);
    }
    return [];
  }, [cmsConfig?.testimonials]);
