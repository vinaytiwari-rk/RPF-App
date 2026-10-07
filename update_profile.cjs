const fs = require('fs');
let file = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const replacement = `    const accountItems = useMemo(() => [
      { icon: Sparkles, title: hi ? "मेरी गतिविधियाँ" : "My Activity", sub: hi ? "आपके कार्य और प्रभाव" : "Your actions and impact", route: "/activity", color: "bg-[#D97706]" },
      { icon: User, title: hi ? "प्रोफ़ाइल संपादित करें" : "Edit Profile", sub: hi ? "अपनी व्यक्तिगत जानकारी अपडेट करें" : "Update your personal information", route: "/profile?edit=1", color: "bg-[#245D45]" },
      { icon: Award, title: hi ? "मेरे प्रमाणपत्र" : "My Certificates", sub: hi ? "सेवा एवं भागीदारी प्रमाणपत्र" : "Certificates of service & impact", route: "/my-certificates", color: "bg-[#7C5C9E]" },
      { icon: Settings, title: hi ? "ऐप सेटिंग्स" : "App Settings", sub: hi ? "भाषा, सूचनाएं और ऐप प्राथमिकताएं" : "Language, notifications & preferences", route: "/settings", color: "bg-[#245D45]" },
    ], [hi]);`;

file = file.replace(/const accountItems = useMemo\(\(\) => \[\s*\{ icon: User[^]+?\], \[hi\]\);/m, replacement);

fs.writeFileSync('src/pages/Profile.tsx', file, 'utf8');
console.log('Profile updated');
