const fs = require('fs');

let content = fs.readFileSync('D:/rp-foundation/src/layouts/MainLayout.tsx', 'utf8');

if (!content.includes('const handleNativeShare = async () => {')) {
  // Inject Share Icon
  content = content.replace(
    'import { ArrowLeft, User, Compass, Users, Bell, Activity, Globe, Search, MessageSquare, Bot, X, Send, Mic, Shield, Heart } from "lucide-react";',
    'import { ArrowLeft, User, Compass, Users, Bell, Activity, Globe, Search, MessageSquare, Bot, X, Send, Mic, Shield, Heart, Share2 } from "lucide-react";'
  );

  // Inject handleNativeShare function
  const shareFunc = 
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RP Foundation',
          text: 'Check out RP Foundation - Digital NGO Platform!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert(language === "hi" ? "??? ??????? ???????? ???? ???" : "Sharing not supported on this device.");
    }
  };
;
  content = content.replace('const [showGuestModal, setShowGuestModal] = useState(false);', 'const [showGuestModal, setShowGuestModal] = useState(false);\n' + shareFunc);

  // Inject button into Header next to Language toggle
  const shareBtn = 
          <button 
            onClick={handleNativeShare}
            className="p-1.5 rounded-full hover:bg-slate-100 transition active:scale-95 border border-slate-200"
            title="Share App"
          >
            <Share2 className="w-[18px] h-[18px] text-slate-700" />
          </button>
  ;
  // Search for the language toggle button to place the share button next to it
  content = content.replace(
    '<button\n            onClick={() => setLanguage(language === "en" ? "hi" : "en")}',
    shareBtn + '\n          <button\n            onClick={() => setLanguage(language === "en" ? "hi" : "en")}'
  );
  if(!content.includes(shareBtn)) {
    // fallback if exact string didn't match
    content = content.replace(
      'onClick={() => setLanguage(language === "en" ? "hi" : "en")}',
      'onClick={() => setLanguage(language === "en" ? "hi" : "en")}\n          >\n            {language === "en" ? "HI" : "EN"}\n          </button>\n' + shareBtn + '\n          <div className="hidden">'
    );
  }

  fs.writeFileSync('D:/rp-foundation/src/layouts/MainLayout.tsx', content);
}
