const fs = require('fs');

let content = fs.readFileSync('D:/rp-foundation/src/pages/Home.tsx', 'utf8');

// 1. Update Home Services List
content = content.replace(
  'const activeServiceIds = cmsConfig?.homeServices?.length > 0',
  'const activeServiceIds = cmsConfig?.homeServices?.length > 0'
);
content = content.replace(
  '      : ["card", "blood", "health-care", "environment", "culture"];',
  '      : ["card", "blood", "health-care", "disaster", "farmer", "skills", "schemes", "jobs", "environment", "culture"];'
);

// 2. Add Routes
content = content.replace(
  '      jobs: "/jobs",',
  '      jobs: "/jobs",\n      disaster: "/services/disaster",\n      farmer: "/services/farmer",\n      skills: "/services/skills",\n      schemes: "/services/schemes",'
);

// 3. Emojis and gradients for icons
const emojiMapping = 
  const serviceIdToEmoji: Record<string, string> = {
    card: "🪪", blood: "🩸", grievance: "📝", disaster: "🚨", 
    farmer: "🌾", schemes: "📜", skills: "🎓", "health-care": "🏥", 
    jobs: "💼", environment: "🌳", culture: "🕉️", donations: "💖"
  };
;
if(!content.includes('const serviceIdToEmoji')) {
   content = content.replace('const serviceIdToRoute', emojiMapping + '\n  const serviceIdToRoute');
}

// 4. Update the icon render
const oldIconRender = '<IconComponent className="w-6 h-6 text-white drop-shadow-md z-10" />';
const newIconRender = 
                        {serviceIdToEmoji[action.id] ? (
                          <span className="text-2xl z-10 drop-shadow-md">{serviceIdToEmoji[action.id]}</span>
                        ) : (
                          <IconComponent className="w-6 h-6 text-white drop-shadow-md z-10" />
                        )}
;
content = content.replace(oldIconRender, newIconRender);

fs.writeFileSync('D:/rp-foundation/src/pages/Home.tsx', content);
