const fs = require('fs');
let content = fs.readFileSync('src/pages/JanSevaCard.tsx', 'utf8');

// Fix Front Title and Card Number (no bottom border, aligned closer if needed)
content = content.replace(
  /<div className="relative z-10 flex justify-between items-start mb-3\.5 border-b border-slate-100 pb-1\.5">[\s\S]*?<\/div>/m,
  `<div className="relative z-10 flex items-center justify-between gap-2 mb-4 px-2">
  <h4 className="font-sans font-black text-[22px] text-[#000080] leading-none tracking-wide">
    जनसेवा कार्ड
  </h4>
  <span className="font-mono font-black text-[18px] text-[#000080] tracking-wide leading-none">
    {cardNumber}
  </span>
</div>`
);

// Fix Front Name / Gender / DOB / Address lines to match exact spacing and size
content = content.replace(
  /<div className="relative z-10 space-y-2\.5 text-\[11\.5px\] text-slate-800 font-semibold mb-4 pl-0\.5">[\s\S]*?<\/div>\s*\{\/\* Toll-Free Section \*\/\}/m,
  `<div className="relative z-10 space-y-3 text-[12px] text-[#000080] mb-5 px-2">
  <div className="flex items-baseline">
    <span className="w-[120px] shrink-0 font-medium">नाम / Name :</span>
    <span className="font-medium text-[13px]">{cardName}</span>
  </div>
  <div className="flex justify-between items-baseline pr-4">
    <div className="flex items-baseline">
      <span className="w-[120px] shrink-0 font-medium">लिंग / Gender :</span>
      <span className="font-medium">{cardGender}</span>
    </div>
    <div className="flex items-baseline">
      <span className="shrink-0 font-medium mr-2">जन्म तिथि / DOB :</span>
      <span className="font-medium">{cardDob}</span>
    </div>
  </div>
  <div className="flex items-start">
    <span className="w-[120px] shrink-0 mt-0.5 font-medium">पता / Address :</span>
    <span className="font-medium leading-snug flex-1 text-[12px] pr-2">{cardAddress}</span>
  </div>
</div>

{/* Toll-Free Section */}`
);

// Fix Toll Free & Socials
content = content.replace(
  /<div className="relative z-10 text-center border-t border-slate-100 pt-2\.5 pb-1">[\s\S]*?\{\/\* Green Bottom Border \*\/\}/m,
  `<div className="relative z-10 text-center pt-1 pb-1">
  <p className="font-sans font-black text-[22px] text-[#000080] tracking-wider leading-none mb-2">
    Toll Free Number : 1800 - 569 - 0991
  </p>
  <p className="text-[12px] text-slate-600 font-medium tracking-wide leading-none font-serif">
    Web - www.therpfoundation.org <span className="font-bold text-[#000080] mx-1">|</span> Email - info@therpfoundation.org
  </p>
</div>

{/* Social Links Row */}
<div className="relative z-10 flex justify-center items-center gap-4 text-[9.5px] font-bold text-slate-600 mt-1 pb-2">
  <div className="flex items-center gap-1">
    <Facebook className="w-3.5 h-3.5 text-[#000080] fill-[#000080]" />
    <span>rpfoundationofficial</span>
  </div>
  <div className="flex items-center gap-1">
    <Instagram className="w-3.5 h-3.5 text-[#000080]" />
    <span>rpfoundationofficial</span>
  </div>
  <div className="flex items-center gap-1">
    <Twitter className="w-3.5 h-3.5 text-[#000080] fill-[#000080]" />
    <span>rpfoundation15</span>
  </div>
  <div className="flex items-center gap-1">
    <span className="text-[12px] text-[#000080]">@</span>
    <span>rpfoundationofficial</span>
  </div>
</div>
</div>

{/* Green Bottom Border */}`
);

// Fix Back Side Heading
content = content.replace(
  /<div className="relative z-10 text-center mb-3 flex justify-center items-center">[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Benefits List/m,
  `<div className="relative z-10 text-center mb-4 mt-2">
  <h4 className="font-sans font-black text-[22px] text-[#000080] leading-none tracking-wide">
    जनसेवा कार्ड के फायदे :
  </h4>
</div>

{/* Benefits List`
);

// Fix Back Side List
content = content.replace(
  /<ul className="text-\[10\.5px\] text-slate-800 font-extrabold space-y-1\.5 w-full pl-1 leading-snug">[\s\S]*?<\/ul>/m,
  `<ul className="text-[12px] text-slate-700 font-medium space-y-2 w-full px-2 leading-relaxed">
  {activeBenefits.map((b, idx) => (
    <li key={idx} className="flex items-start">
      <span className="leading-tight">
        <span className="text-[#000080] font-black text-[13px]">{b.label}</span> <span className="text-slate-500 mx-1">–</span> {b.desc}
      </span>
    </li>
  ))}
</ul>`
);

// Fix Footer text
content = content.replace(
  /<p className="text-\[10px\] font-black text-slate-800 leading-tight">[\s\S]*?<\/p>/m,
  `<p className="text-[13px] font-semibold text-slate-600 leading-tight pb-1">
  {lang === "hi" 
    ? "नोट: यह सभी सुविधाएं जन सेवा कार्ड धारकों के लिए निःशुल्क होगा।" 
    : "Note: All these facilities will be free of charge for Jan Seva Card holders."}
</p>`
);

fs.writeFileSync('src/pages/JanSevaCard.tsx', content);
console.log('JanSevaCard updated successfully!');
