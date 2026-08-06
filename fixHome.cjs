const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Home.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update useApp hook
content = content.replace(
  'const { settings, cmsConfig, servicesList, isLoadingServices } = useApp();',
  'const { settings, globalSettings, announcements, cmsConfig, servicesList, isLoadingServices } = useApp();'
);

// 2. Hide Impact section based on show_widgets
content = content.replace(
  '{/* 3. Our Impact Section',
  '{(globalSettings?.show_widgets !== false) && (\n      <>\n      {/* 3. Our Impact Section'
);

// 3. Hide Quick Actions based on show_widgets
content = content.replace(
  '{/* 6. Message from Founder',
  '</>\n      )}\n\n      {/* 6. Message from Founder'
);

// 4. Update Founder Info
content = content.replace(
  'src={cmsConfig.founderImgUrl || "/assets/founder.png"}',
  'src={globalSettings?.founder_image || cmsConfig.founderImgUrl || "/assets/founder.png"}'
);
content = content.replace(
  '"{lang === "hi" ? settings.founderMessageHi : settings.founderMessageEn}"',
  '"{globalSettings?.founder_message || (lang === "hi" ? settings.founderMessageHi : settings.founderMessageEn)}"'
);

// 5. Add Announcements Section
const announcementsCode = \
      {/* Dynamic Important Notices */}
      {(globalSettings?.show_notices !== false && announcements && announcements.length > 0) && (
        <div className="px-4 relative z-10">
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-4 py-2 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> 
                {lang === "hi" ? "महत्वपूर्ण सूचनाएं" : "Important Notices"}
              </h3>
            </div>
            <div className="p-3 space-y-3 max-h-48 overflow-y-auto">
              {announcements.map((ann, i) => (
                <div key={i} className="flex gap-3 items-start border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11px] leading-tight mb-0.5">{ann.title}</h4>
                    <p className="text-[10px] text-slate-600 leading-snug">{ann.content}</p>
                    {ann.link_url && (
                      <a href={ann.link_url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600 font-semibold mt-1 inline-flex items-center hover:underline">
                        {lang === "hi" ? "अधिक पढ़ें" : "Read More"} <ChevronRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
\;

content = content.replace(
  '{/* 3. Our Impact Section',
  announcementsCode + '\\n\\n      {/* 3. Our Impact Section'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Home.tsx updated');
