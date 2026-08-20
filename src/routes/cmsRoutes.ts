import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/settings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["general"]);
    if (result.rows.length > 0) {
      res.json({ settings: result.rows[0] });
    } else {
      const defaults = {
        id: "general",
        tollFree: "1800 - 569 - 0991",
        webUrl: "www.therpfoundation.org",
        email: "info@therpfoundation.org",
        founderMessageEn: "Our mission is simple – to serve humanity with sincerity, build strong communities, and create a better tomorrow for India.",
        founderMessageHi: "हमारा उद्देश्य सरल है - निष्ठा के साथ मानवता की सेवा करना, मजबूत समुदायों का निर्माण करना और भारत के प्रत्येक नागरिक के लिए एक बेहतर कल का निर्माण करना।",
        helplinesMarquee: "RP Foundation Toll Free Number: 1800-569-0991, CM Helpline: 181, Emergency Response Support System: 112, Women Helpline: 1090, Ambulance: 108/102, Police Helpline: 100, Fire Emergency: 101, Child Helpline: 1098, Railway Inqury : 139, Airlines Enquiry : 143, Blood Bank: 1910, Voter Helpline: 1950, Cyber Crime Helpline : 1930, LPG Leak Line Helpline: 1906, Natinal Consumer Helpline: 1915, National Narcotis Helpline: 1933, Natural Calaities Helpline: 1070, Road Accident Helpline: 1073"
      };
      await pool.query(
        'INSERT INTO settings (id, "tollFree", "webUrl", email, "founderMessageEn", "founderMessageHi", "helplinesMarquee") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [defaults.id, defaults.tollFree, defaults.webUrl, defaults.email, defaults.founderMessageEn, defaults.founderMessageHi, defaults.helplinesMarquee]
      );
      res.json({ settings: defaults });
    }
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/settings", authenticateToken, authorizeRole("super_admin"), async (req, res) => {
  try {
    const { tollFree, webUrl, email, founderMessageEn, founderMessageHi, helplinesMarquee } = req.body;
    await pool.query(
      `INSERT INTO settings (id, "tollFree", "webUrl", email, "founderMessageEn", "founderMessageHi", "helplinesMarquee") 
       VALUES ('general', $1, $2, $3, $4, $5, $6) 
       ON CONFLICT (id) DO UPDATE SET 
       "tollFree" = $1, "webUrl" = $2, email = $3, "founderMessageEn" = $4, "founderMessageHi" = $5, "helplinesMarquee" = $6`,
      [tollFree, webUrl, email, founderMessageEn, founderMessageHi, helplinesMarquee]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Core Services visibility (admin) ──────────────────────────────────
// Lets an admin actually hide/"delete" one of the built-in service tiles
// that power the Home quick actions and the Services grid. Previously
// there was no working way to do this at all: an orphaned ServicesManager
// component posted to /api/settings (a table row that doesn't even have a
// servicesStatus column), and the admin "directory" delete button operated
// on a totally unrelated directory_services table. This reads/writes the
// same cms_data JSON blob the rest of the CMS already uses, touching only
// the hiddenServiceIds field so it never clobbers other CMS content.
router.get("/api/admin/services", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { CORE_SERVICES } = await import("../data/coreServices.js");
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    let hiddenServiceIds: string[] = [];
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      try {
        const parsed = JSON.parse(result.rows[0].founderMessageEn);
        if (Array.isArray(parsed.hiddenServiceIds)) hiddenServiceIds = parsed.hiddenServiceIds;
      } catch (e) {}
    }
    const data = CORE_SERVICES.map((s: any) => ({ ...s, hidden: hiddenServiceIds.includes(s.id) }));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/api/admin/services/:id/visibility", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { hidden } = req.body;
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    let cmsData: any = {};
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      try { cmsData = JSON.parse(result.rows[0].founderMessageEn); } catch (e) { cmsData = {}; }
    }
    const current: string[] = Array.isArray(cmsData.hiddenServiceIds) ? cmsData.hiddenServiceIds : [];
    const next = hidden
      ? Array.from(new Set([...current, id]))
      : current.filter((sid: string) => sid !== id);
    cmsData.hiddenServiceIds = next;

    await pool.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1)
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(cmsData)]
    );
    res.json({ success: true, hiddenServiceIds: next });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/api/cms/config", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      res.json({ success: true, data: JSON.parse(result.rows[0].founderMessageEn) });
    } else {
      res.json({ success: true, data: {} });
    }
  } catch (error: any) {
    res.json({ success: true, data: {} });
  }
});

router.post("/api/cms/config", authenticateToken, authorizeRole("super_admin"), async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1) 
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true, data: req.body });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/api/cms", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      let parsed = JSON.parse(result.rows[0].founderMessageEn);
      let modified = false;

      if (Array.isArray(parsed.liveTvChannels)) {
        const newChannelsMap = new Map([
          ['uploaded-42', 'https://www.ndtv.com/livetv-ndtv24x7'],
          ['uploaded-43', 'https://www.republicworld.com/livetv'],
          ['uploaded-44', 'https://www.wionews.com/live-tv'],
          ['uploaded-45', 'https://www.timesnownews.com/live-tv'],
          ['uploaded-46', 'https://www.indiatoday.in/livetv'],
          ['uploaded-47', 'https://www.news18.com/livetv/'],
          ['uploaded-48', 'https://www.aajtak.in/livetv'],
          ['uploaded-49', 'https://www.abplive.com/live-tv'],
          ['uploaded-50', 'https://hindi.news18.com/livetv/'],
          ['uploaded-51', 'https://www.timesnowhindi.com/live-tv'],
          ['uploaded-52', 'https://zeenews.india.com/hindi/live-tv'],
          ['uploaded-53', 'https://www.republicbharat.com/livetv'],
          ['uploaded-54', 'https://www.indiatvnews.com/livetv'],
          ['uploaded-55', 'https://www.tv9hindi.com/live-tv'],
          ['uploaded-56', 'https://ndtv.in/livetv-ndtvindia?pfrom=home-ndtv-india_nav'],
          ['uploaded-57', 'https://www.newsnationtv.com/liveTV'],
        ]);

        let hasUpdates = false;
        parsed.liveTvChannels = parsed.liveTvChannels.map((channel: any) => {
          if (channel && channel.id && newChannelsMap.has(channel.id)) {
            const newUrl = newChannelsMap.get(channel.id);
            if (channel.url !== newUrl) {
              channel.url = newUrl;
              channel.videoId = "";
              hasUpdates = true;
            }
          }
          return channel;
        });

        const existingIds = new Set(parsed.liveTvChannels.map((c: any) => c?.id));
        const newChannelsToAdd = [
          { id: 'uploaded-59', name: 'DW', url: 'https://www.dw.com/en/live-tv/channel-english', category: 'News', enabled: true },
          { id: 'uploaded-60', name: 'Sansad 3', url: 'https://webcast.gov.in/lstvlive/', category: 'News', enabled: true },
          { id: 'uploaded-61', name: 'France24', url: 'https://www.france24.com/en/live', category: 'News', enabled: true },
          { id: 'uploaded-62', name: 'Al Jazeera', url: 'https://www.aljazeera.com/video/live', category: 'News', enabled: true },
          { id: 'uploaded-63', name: 'Euro News', url: 'https://www.euronews.com/live', category: 'News', enabled: true },
          { id: 'uploaded-64', name: 'CNN', url: 'https://edition.cnn.com/videos/fast/cnni-fast', category: 'News', enabled: true },
          { id: 'uploaded-65', name: 'RT', url: 'https://www.rt.com/on-air/', category: 'News', enabled: true },
          { id: 'uploaded-66', name: 'IMF', url: 'https://www.imf.org/en/live', category: 'News', enabled: true }
        ];

        newChannelsToAdd.forEach(nc => {
          if (!existingIds.has(nc.id)) {
            parsed.liveTvChannels.push({
              ...nc,
              order: parsed.liveTvChannels.length
            });
            hasUpdates = true;
          }
        });

        if (hasUpdates) {
          modified = true;
        }
      }
      if (!parsed.govSchemeUrl || parsed.govSchemeUrl === "https://www.myscheme.gov.in/find-scheme") {
        parsed.govSchemeUrl = "https://services.mp.gov.in/eservice/";
        modified = true;
      }

      if (!parsed.faqs) {
        parsed.faqs = [
          {
            id: "faq-1",
            questionEn: "What is the Jan Seva Smart ID Card?",
            questionHi: "जन सेवा स्मार्ट आईडी कार्ड क्या है?",
            answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
            answerHi: "यह मध्य प्रदेश के नागरिकों के लिए आरपी फाउंडेशन द्वारा प्रदान किया जाने वाला एक डिजिटल कार्ड है, जिसके माध्यम से आप सभी 21 कल्याणकारी सेवाओं का लाभ सरलता से उठा सकते हैं।"
          },
          {
            id: "faq-2",
            questionEn: "How long does card approval take?",
            questionHi: "कार्ड स्वीकृति में कितना समय लगता है?",
            answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
            answerHi: "आवेदन जमा करने के बाद, सत्यापन टीम आपके दस्तावेजों की जांच करती है और साधारणतः 2 से 3 कार्य दिवसों के भीतर इसे स्वीकृत कर दिया जाता है।"
          },
          {
            id: "faq-3",
            questionEn: "How long does grievance resolution take?",
            questionHi: "शिकायत निवारण में कितना समय लगता है?",
            answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
            answerHi: "सभी नागरिक शिकायतों को दर्ज करने के बाद सीधे क्षेत्रीय प्रशासकों को भेजा जाता है, जो 48 से 72 घंटों के भीतर इसका समाधान करने का प्रयास करते हैं।"
          }
        ];
        modified = true;
      }
      if (!parsed.aboutTextEn) {
        parsed.aboutTextEn = "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.";
        parsed.aboutTextHi = "आरपी फाउंडेशन एक गैर-लाभकारी संगठन है जो समाज के कमजोर वर्गों को सशक्त बनाने, शिक्षा, स्वास्थ्य, और आपातकालीन नागरिक राहत प्रदान करने के लिए प्रतिबद्ध है।";
        parsed.logoImgUrl = "/assets/logo.png";
        modified = true;
      }
      if (parsed.quoteOfTheDayEn === undefined) {
        parsed.quoteOfTheDayEn = "Work is worship, and service is the greatest religion.";
        parsed.quoteOfTheDayHi = "कर्म ही पूजा है, और सेवा ही सबसे बड़ा धर्म है।";
        parsed.impactBottomTextEn = "Together, we are making a real difference in people's lives.";
        parsed.impactBottomTextHi = "हम सब मिलकर लोगों के जीवन में वास्तविक बदलाव ला रहे हैं।";
        parsed.statsOffsets = { beneficiaries: 0, volunteers: 0, healthCamps: 0, campaigns: 0 };
        modified = true;
      }
      if (!parsed.factCheckSources) {
        parsed.factCheckSources = [
          { name: "PIB Fact Check", nameHi: "पीआईबी फैक्ट चेक", url: "https://xcancel.com/pibfactcheck", description: "Press Information Bureau fact-checks regarding government policies and schemes.", descriptionHi: "सरकारी नीतियों और योजनाओं के संबंध में प्रेस सूचना ब्यूरो द्वारा तथ्य-जांच।" },
          { name: "Vishvas News", nameHi: "विश्वास न्यूज़", url: "https://www.vishvasnews.com/", description: "A leading Indian multilingual fact-checking website.", descriptionHi: "भारत की एक प्रमुख बहुभाषी तथ्य-जांच वेबसाइट।" },
          { name: "India Today Anti Fake News War", nameHi: "इंडिया टुडे एंटी फेक न्यूज़ वॉर", url: "https://xcancel.com/IndiaTodayFacts", description: "India Today fact-checks addressing viral misinformation.", descriptionHi: "इंडिया टुडे द्वारा वायरल भ्रामक जानकारियों की तथ्य-जांच।" },
          { name: "PTI Fact Check (X)", nameHi: "पीटीआई फैक्ट चेक (X)", url: "https://xcancel.com/ptifactcheck", description: "PTI's official fact-check handle on X/Twitter.", descriptionHi: "प्रेस ट्रस्ट ऑफ इंडिया (PTI) का आधिकारिक तथ्य-जांच हैंडल।" },
          { name: "MEA Fact Check", nameHi: "विदेश मंत्रालय फैक्ट चेक", url: "https://xcancel.com/MEAFactCheck", description: "Ministry of External Affairs official fact-checking handle.", descriptionHi: "विदेश मंत्रालय का आधिकारिक तथ्य-जांच हैंडल।" },
          { name: "Jansampark MP Fact Check", nameHi: "जनसंपर्क मध्य प्रदेश फैक्ट चेक", url: "https://xcancel.com/jansamparkFC", description: "Madhya Pradesh Government's official public relations fact-checker.", descriptionHi: "मध्य प्रदेश सरकार का आधिकारिक जनसंपर्क तथ्य-जांच हैंडल।" },
          { name: "NewsMeter Fact Check", nameHi: "न्यूज़मीटर फैक्ट चेक", url: "https://xcancel.com/newsmeterfacts", description: "Independent digital fact-checking and investigative journalism.", descriptionHi: "स्वतंत्र डिजिटल तथ्य-जांच और खोजी पत्रकारिता।" },
          { name: "UP Police Viral Check", nameHi: "यूपी पुलिस वायरल चेक", url: "https://xcancel.com/UPPViralCheck", description: "Uttar Pradesh Police official handle for checking viral rumors.", descriptionHi: "उत्तर प्रदेश पुलिस का वायरल अफवाहों की जांच का आधिकारिक हैंडल।" },
          { name: "Info UP Fact Check", nameHi: "इन्फो यूपी फैक्ट चेक", url: "https://xcancel.com/InfoUPFactcheck", description: "Information & Public Relations Department of UP fact-checking handle.", descriptionHi: "सूचना एवं जनसंपर्क विभाग (उत्तर प्रदेश) का आधिकारिक तथ्य-जांच हैंडल।" },
          { name: "Dainik Bhaskar No Fake News", nameHi: "दैनिक भास्कर - नो फेक न्यूज़", url: "https://www.bhaskar.com/no-fake-news/", description: "Fact-checks by Dainik Bhaskar.", descriptionHi: "दैनिक भास्कर द्वारा तथ्य-जांच।" },
          { name: "BoomLive Fact Check", nameHi: "बूमलाइव फैक्ट चेक", url: "https://www.boomlive.in/fact-check", description: "Independent digital journalism and fact-checking.", descriptionHi: "स्वतंत्र डिजिटल पत्रकारिता और तथ्य-जांच।" },
          { name: "Alt News", nameHi: "ऑल्ट न्यूज़", url: "https://www.altnews.in/", description: "A leading Indian fact-checking website.", descriptionHi: "भारत की एक प्रमुख तथ्य-जांच वेबसाइट।" }
        ];
        modified = true;
      }
      if (modified) {
        await pool.query(
          'UPDATE settings SET "founderMessageEn" = $1 WHERE id = $2',
          [JSON.stringify(parsed), "cms_data"]
        );
      }
      return res.json({ success: true, cms: parsed });
    } else {
      const defaults = {
        alertBannerEn: "",
        alertBannerHi: "",
        founderName: "Rohit Pandit",
        founderDesignation: "Founder, RP Foundation",
        founderImgUrl: "/assets/founder.png",
        aboutTextEn: "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.",
        aboutTextHi: "आरपी फाउंडेशन एक गैर-लाभकारी संगठन है जो समाज के कमजोर वर्गों को सशक्त बनाने, शिक्षा, स्वास्थ्य, और आपातकालीन नागरिक राहत प्रदान करने के लिए प्रतिबद्ध है।",
        logoImgUrl: "/assets/logo.png",
        faqs: [
          {
            id: "faq-1",
            questionEn: "What is the Jan Seva Smart ID Card?",
            questionHi: "जन सेवा स्मार्ट आईडी कार्ड क्या है?",
            answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
            answerHi: "यह मध्य प्रदेश के नागरिकों के लिए आरपी फाउंडेशन द्वारा प्रदान किया जाने वाला एक डिजिटल कार्ड है, जिसके माध्यम से आप सभी 21 कल्याणकारी सेवाओं का लाभ सरलता से उठा सकते हैं।"
          },
          {
            id: "faq-2",
            questionEn: "How long does card approval take?",
            questionHi: "कार्ड स्वीकृति में कितना समय लगता है?",
            answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
            answerHi: "आवेदन जमा करने के बाद, सत्यापन टीम आपके दस्तावेजों की जांच करती है और साधारणतः 2 से 3 कार्य दिवसों के भीतर इसे स्वीकृत कर दिया जाता है।"
          },
          {
            id: "faq-3",
            questionEn: "How long does grievance resolution take?",
            questionHi: "शिकायत निवारण में कितना समय लगता है?",
            answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
            answerHi: "सभी नागरिक शिकायतों को दर्ज करने के बाद सीधे क्षेत्रीय प्रशासकों को भेजा जाता है, जो 48 से 72 घंटों के भीतर इसका समाधान करने का प्रयास करते हैं।"
          }
        ],
        carouselSlides: [
          {
            titleEn: "Together, We Build a Better Tomorrow",
            titleHi: "एक बेहतर कल के लिए साथ मिलकर आगे बढ़ें",
            subEn: "Empowering lives. Strengthening communities.",
            subHi: "जीवन को सशक्त बनाना। समुदायों को सुदृढ़ करना।",
            image: "/assets/mega_camp_banner.png"
          },
          {
            titleEn: "Building a Better Tomorrow for Every Citizen",
            titleHi: "प्रत्येक नागरिक के लिए एक बेहतर कल का निर्माण",
            subEn: "We create healthier, stronger, and empowered communities.",
            subHi: "हम स्वस्थ, सशक्त और अधिक समृद्ध समाज का निर्माण करते हैं।",
            image: "/assets/water_pump_camp.png"
          }
        ],
        quoteOfTheDayEn: "Work is worship, and service is the greatest religion.",
        quoteOfTheDayHi: "कर्म ही पूजा है, और सेवा ही सबसे बड़ा धर्म है।",
        impactBottomTextEn: "Together, we are making a real difference in people's lives.",
        impactBottomTextHi: "हम सब मिलकर लोगों के जीवन में वास्तविक बदलाव ला रहे हैं।",
        statsOffsets: {
          beneficiaries: 0,
          volunteers: 0,
          healthCamps: 0,
          campaigns: 0
        },
        customServices: [],
        socialDirectory: [
          {
            name: "RP Foundation (Official)",
            platform: "instagram",
            handle: "@rpfoundationofficial",
            url: "https://www.instagram.com/rpfoundationofficial/",
            descEn: "Latest photos, videos & daily campaign highlights.",
            descHi: "नवीनतम फोटो, वीडियो और दैनिक अभियान की झलकियाँ।"
          },
          {
            name: "Rohit Pandit (Founder)",
            platform: "instagram",
            handle: "@therohitpandit",
            url: "https://www.instagram.com/therohitpandit/",
            descEn: "Founder Rohit Pandit's personal social updates.",
            descHi: "संस्थापक रोहित पंडित का व्यक्तिगत जनसेवा ब्लॉग।"
          },
          {
            name: "RP Foundation Facebook",
            platform: "facebook",
            handle: "@rpfofficial",
            url: "https://www.facebook.com/rpfofficial",
            descEn: "Facebook community feeds and welfare program updates.",
            descHi: "फेसबुक समुदाय और जन कल्याणकारी कार्यक्रमों की जानकारी।"
          },
          {
            name: "RP Foundation on X",
            platform: "x",
            handle: "@rpfoundation15",
            url: "https://x.com/rpfoundation15",
            descEn: "Real-time updates, announcements & relief requests.",
            descHi: "महत्वपूर्ण घोषणाएं और त्वरित राहत अलर्ट ट्विटर पर।"
          },
          {
            name: "RP Foundation YouTube",
            platform: "youtube",
            handle: "RP Foundation Official",
            url: "https://www.youtube.com/@rpfoundationofficial",
            descEn: "Public awareness tutorials & campaign video reports.",
            descHi: "जन जागरूकता ट्यूटोरियल & अभियान की वीडियो रिपोर्ट्स।"
          }
        ],
        notifications: [
          {
            id: "1",
            type: "urgent",
            titleEn: "Urgent Blood Need: O+",
            titleHi: "आपातकालीन रक्त आवश्यकता: O+",
            bodyEn: "Critical patient at Bhopal Hospital requires 2 units of O+ blood.",
            bodyHi: "सीहोर अस्पताल में गंभीर मरीज को O+ रक्त की 2 यूनिट की आवश्यकता है।",
            createdAt: new Date().toISOString(),
            read: false
          },
          {
            id: "2",
            type: "warning",
            titleEn: "Heatwave Alert - Madhya Pradesh",
            titleHi: "लू की चेतावनी - मध्य प्रदेश",
            bodyEn: "Temperatures expected to exceed 43°C. Stay hydrated and avoid outdoor activity.",
            bodyHi: "तापमान 43 डिग्री सेल्सियस से अधिक होने की संभावना है। हाइड्रेटेड रहें और बाहरी गतिविधियों से बचें।",
            createdAt: new Date().toISOString(),
            read: false
          }
        ],
        testimonials: [
          {
            id: "t1",
            nameEn: "Satyendra Thakur",
            nameHi: "सत्येंद्र ठाकुर",
            villageEn: "Karond Ward 5, Bhopal",
            villageHi: "करौंद वार्ड 5, भोपाल",
            quoteEn: "My daughter received the Saraswati Scholarship directly in her bank account within 2 weeks of applying. This support is helping her pursue college education. Gratitude to Rohit Sir!",
            quoteHi: "मेरी बेटी को आवेदन करने के २ सप्ताह के भीतर सीधे उसके बैंक खाते में सरस्वती छात्रवृत्ति प्राप्त हुई। यह सहायता उसे कॉलेज की शिक्षा जारी रखने में मदद कर रही है। रोहित सर को धन्यवाद!"
          },
          {
            id: "t2",
            nameEn: "Shanti Devi",
            nameHi: "शान्ति देवी",
            villageEn: "Bhopal Block, MP",
            villageHi: "सीहोर ब्लॉक, म.प्र.",
            quoteEn: "During my husband's eye surgery, RP Foundation volunteers did everything from hospital registration to arranging blood donors. They treated us like family members.",
            quoteHi: "मेरे पति के नेत्र ऑपरेशन के दौरान, आरपी फाउंडेशन के स्वयंसेवकों ने अस्पताल पंजीकरण से लेकर रक्तदाताओं की व्यवस्था करने तक सब कुछ किया। उन्होंने हमारे साथ परिवार के सदस्यों जैसा व्यवहार किया।"
          }
        ],
        factCheckSources: [
          { name: "PIB Fact Check", nameHi: "पीआईबी फैक्ट चेक", url: "https://xcancel.com/pibfactcheck", description: "Press Information Bureau fact-checks regarding government policies and schemes.", descriptionHi: "सरकारी नीतियों और योजनाओं के संबंध में प्रेस सूचना ब्यूरो द्वारा तथ्य-जांच।" },
          { name: "Vishvas News", nameHi: "विश्वास न्यूज़", url: "https://www.vishvasnews.com/", description: "A leading Indian multilingual fact-checking website.", descriptionHi: "भारत की एक प्रमुख बहुभाषी तथ्य-जांच वेबसाइट।" },
          { name: "India Today Anti Fake News War", nameHi: "इंडिया टुडे एंटी फेक न्यूज़ वॉर", url: "https://xcancel.com/IndiaTodayFacts", description: "India Today fact-checks addressing viral misinformation.", descriptionHi: "इंडिया टुडे द्वारा वायरल भ्रामक जानकारियों की तथ्य-जांच।" },
          { name: "PTI Fact Check (X)", nameHi: "पीटीआई फैक्ट चेक (X)", url: "https://xcancel.com/ptifactcheck", description: "PTI's official fact-check handle on X/Twitter.", descriptionHi: "प्रेस ट्रस्ट ऑफ इंडिया (PTI) का आधिकारिक तथ्य-जांच हैंडल।" },
          { name: "MEA Fact Check", nameHi: "विदेश मंत्रालय फैक्ट चेक", url: "https://xcancel.com/MEAFactCheck", description: "Ministry of External Affairs official fact-checking handle.", descriptionHi: "विदेश मंत्रालय का आधिकारिक तथ्य-जांच हैंडल।" },
          { name: "Jansampark MP Fact Check", nameHi: "जनसंपर्क मध्य प्रदेश फैक्ट चेक", url: "https://xcancel.com/jansamparkFC", description: "Madhya Pradesh Government's official public relations fact-checker.", descriptionHi: "मध्य प्रदेश सरकार का आधिकारिक जनसंपर्क तथ्य-जांच हैंडल।" },
          { name: "NewsMeter Fact Check", nameHi: "न्यूज़मीटर फैक्ट चेक", url: "https://xcancel.com/newsmeterfacts", description: "Independent digital fact-checking and investigative journalism.", descriptionHi: "स्वतंत्र डिजिटल तथ्य-जांच और खोजी पत्रकारिता।" },
          { name: "UP Police Viral Check", nameHi: "यूपी पुलिस वायरल चेक", url: "https://xcancel.com/UPPViralCheck", description: "Uttar Pradesh Police official handle for checking viral rumors.", descriptionHi: "उत्तर प्रदेश पुलिस का वायरल अफवाहों की जांच का आधिकारिक हैंडल।" },
          { name: "Info UP Fact Check", nameHi: "इन्फो यूपी फैक्ट चेक", url: "https://xcancel.com/InfoUPFactcheck", description: "Information & Public Relations Department of UP fact-checking handle.", descriptionHi: "सूचना एवं जनसंपर्क विभाग (उत्तर प्रदेश) का आधिकारिक तथ्य-जांच हैंडल।" },
          { name: "Dainik Bhaskar No Fake News", nameHi: "दैनिक भास्कर - नो फेक न्यूज़", url: "https://www.bhaskar.com/no-fake-news/", description: "Fact-checks by Dainik Bhaskar.", descriptionHi: "दैनिक भास्कर द्वारा तथ्य-जांच।" },
          { name: "BoomLive Fact Check", nameHi: "बूमलाइव फैक्ट चेक", url: "https://www.boomlive.in/fact-check", description: "Independent digital journalism and fact-checking.", descriptionHi: "स्वतंत्र डिजिटल पत्रकारिता और तथ्य-जांच।" },
          { name: "Alt News", nameHi: "ऑल्ट न्यूज़", url: "https://www.altnews.in/", description: "A leading Indian fact-checking website.", descriptionHi: "भारत की एक प्रमुख तथ्य-जांच वेबसाइट।" }
        ],
        govSchemeUrl: "https://services.mp.gov.in/eservice/"
      };
      await pool.query(
        `INSERT INTO settings (id, "founderMessageEn") VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $2`,
        ["cms_data", JSON.stringify(defaults)]
      );
      return res.json({ success: true, cms: defaults });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/cms", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1) 
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
