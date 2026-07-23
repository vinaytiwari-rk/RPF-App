import os

# 1. Update Home.tsx with the new Vision-aligned design
new_home_code = '''import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { motion } from "motion/react";
import { translations } from "../translations";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  return (
    <div className="space-y-6 animate-fadeIn min-h-full pb-24 font-sans relative overflow-x-hidden bg-[#FAF9F6]">
      {/* Sunburst Rays Backdrop Pattern */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] opacity-[0.08] pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#FFB800]" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 5l2 15 15-15-5 25 15-5-25 5 15 15-25-2 5 25-15-15-5 15-15-15-5 15-5-25-25 2 15-15-25-5 15-5-15-25 15 15z" />
        </svg>
      </div>

      {/* Main Hero Section & Namaste Illustration */}
      <div className="relative z-10 pt-10 flex flex-col items-center text-center px-4">
        {/* Animated Marigold/Sparkles Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ y: [-10, 10, -10], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-8 left-1/4 w-2.5 h-2.5 bg-[#FFB800] rounded-full blur-[0.5px]"
          />
          <motion.div 
            animate={{ y: [10, -10, 10], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-12 right-1/4 w-2 h-2 bg-[#F26522] rounded-full blur-[0.5px]"
          />
        </div>

        {/* 3D Vector SVG Namaste Illustration */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative w-40 h-40 mb-4 bg-white/40 backdrop-blur-xs rounded-full p-2 border border-white/50 shadow-inner flex items-center justify-center"
        >
          <svg viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-[0_8px_20px_rgba(242,101,34,0.15)]">
            <g fill="#F26522">
              {/* Left Hand */}
              <path d="M43.5 75C41 75 39 71 39 65V42C39 34.5 44.5 32 48.5 32C49 32 49.5 32.5 49.5 33V70C49.5 72.8 46.8 75 43.5 75Z" />
              {/* Right Hand */}
              <path d="M56.5 75C59 75 61 71 61 65V42C61 34.5 55.5 32 51.5 32C51 32 50.5 32.5 50.5 33V70C50.5 72.8 53.2 75 56.5 75Z" />
              {/* Saffron Sleeves Trim */}
              <path d="M37 66h5v8h-5z M58 66h5v8h-5z" fill="#FFB800" />
            </g>
          </svg>
        </motion.div>

        {/* Greeting Text */}
        <h2 className="font-display font-black text-xl text-[#1C2D42] tracking-tight">
          {isHi ? "नमस्ते! आरपी फाउंडेशन में आपका स्वागत है" : "Namaste! Welcome to RP Foundation"}
        </h2>
        <p className="text-[#F26522] text-[10.5px] font-bold uppercase tracking-wider mt-1.5 max-w-[260px] leading-relaxed">
          {isHi ? "आत्मनिर्भर स्वदेशी भारत की ओर अग्रसर" : "Together towards a self-reliant Swadeshi Bharat"}
        </p>
      </div>

      {/* 2x2 Grid Action & Impact Cards */}
      <div className="px-4 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          
          {/* Card 1: Swadeshi Cottage Industry */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/services")}
            className="bg-white p-4.5 rounded-[20px] shadow-[0_8px_24px_rgba(28,45,66,0.04)] border-2 border-[#2D884D]/25 flex flex-col justify-between h-36 cursor-pointer text-left transition"
          >
            <div className="w-9 h-9 bg-[#2D884D]/10 rounded-xl flex items-center justify-center text-[#2D884D]">
              <LucideIcons.Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-[#1C2D42]">
                {isHi ? "स्वदेशी मिशन" : "Swadeshi Mission"}
              </h4>
              <p className="text-[9px] font-semibold text-slate-500 mt-1 leading-snug">
                {isHi ? "कुटीर उद्योग और ग्रामीण कारीगरों का समर्थन" : "Supporting cottage industry & rural artisans."}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Daily Food Drive */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/donations")}
            className="bg-white p-4.5 rounded-[20px] shadow-[0_8px_24px_rgba(28,45,66,0.04)] border-2 border-[#F26522]/25 flex flex-col justify-between h-36 cursor-pointer text-left transition"
          >
            <div className="w-9 h-9 bg-[#F26522]/10 rounded-xl flex items-center justify-center text-[#F26522]">
              <LucideIcons.Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-[#1C2D42]">
                {isHi ? "भोजन सेवा" : "Daily Food Drive"}
              </h4>
              <p className="text-[9px] font-semibold text-slate-500 mt-1 leading-snug">
                {isHi ? "जरूरतमंदों के लिए दैनिक पौष्टिक भोजन व्यवस्था" : "Providing healthy daily meals to those in need."}
              </p>
            </div>
          </motion.div>

          {/* Card 3: Rural Education */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/services")}
            className="bg-white p-4.5 rounded-[20px] shadow-[0_8px_24px_rgba(28,45,66,0.04)] border-2 border-[#FFB800]/30 flex flex-col justify-between h-36 cursor-pointer text-left transition"
          >
            <div className="w-9 h-9 bg-[#FFB800]/10 rounded-xl flex items-center justify-center text-[#FFB800]">
              <LucideIcons.BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-[#1C2D42]">
                {isHi ? "ग्रामीण शिक्षा" : "Rural Education"}
              </h4>
              <p className="text-[9px] font-semibold text-slate-500 mt-1 leading-snug">
                {isHi ? "स्कॉलरशिप और निशुल्क अध्ययन सामग्री वितरण" : "Scholarships & free textbook drives for students."}
              </p>
            </div>
          </motion.div>

          {/* Card 4: Volunteer Join */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/volunteer-registration")}
            className="bg-white p-4.5 rounded-[20px] shadow-[0_8px_24px_rgba(28,45,66,0.04)] border-2 border-[#1C2D42]/25 flex flex-col justify-between h-36 cursor-pointer text-left transition"
          >
            <div className="w-9 h-9 bg-[#1C2D42]/10 rounded-xl flex items-center justify-center text-[#1C2D42]">
              <LucideIcons.Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-[#1C2D42]">
                {isHi ? "स्वयंसेवक सेवा" : "Volunteer Join"}
              </h4>
              <p className="text-[9px] font-semibold text-slate-500 mt-1 leading-snug">
                {isHi ? "राष्ट्र निर्माण में हमारा सहयोग करें" : "Dedicate your skills & service to rural upliftment."}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
'''

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(new_home_code)


# 2. Update MainLayout.tsx with the precise Layout Header and Bottom navigation specifications
with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    layout_content = f.read()

# Update top header branding with taglines & logo styling
# Locate header branding block and replace with exact spec
layout_content = re.sub(
    r'<div className="flex items-center gap-3 relative z-10">.*?</div>\s*</div>\s*</div>\s*\{/\* Right: Actions',
    '''<div className="flex items-center gap-2.5 relative z-10">
              {location.pathname !== "/" ? (
                <button 
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:shadow-xs flex items-center justify-center transition cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <img src="/assets/logo.png" alt="RP Logo" className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-200/50 p-0.5" />
              )}
              <div className="flex flex-col justify-center text-left">
                <h1 className="font-display font-black text-[13.5px] text-[#1C2D42] tracking-wide leading-none">
                  RP FOUNDATION
                </h1>
                <span className="font-sans text-[7.5px] font-black text-[#F26522] mt-0.5 leading-none tracking-wider uppercase">
                  सेवा • समर्पण • संकल्प
                </span>
              </div>
            </div>''',
    layout_content,
    flags=re.DOTALL
)

# Apply curved bottom nav specification with center notch/elevated design
# Replace navigation container styling
layout_content = layout_content.replace(
    'className="w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] backdrop-blur-md border-b-2 border-[#000080]/20 px-4 py-3.5 flex justify-between items-center relative z-50 shrink-0 select-none"',
    'className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 py-3.5 flex justify-between items-center relative z-50 shrink-0 select-none"'
)

# Update Bottom Nav Container
layout_content = re.sub(
    r'<motion\.div\s*initial=\{\{ y: 100 \}\}\s*animate=\{\{ y: 0 \}\}.*?className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center px-1 pb-safe select-none z-50 shrink-0"',
    r'<motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }} className="w-full bg-white/95 border-t border-slate-200/60 rounded-t-[28px] shadow-[0_-8px_30px_rgba(28,45,66,0.08)] flex justify-around items-center px-1 pb-safe select-none z-50 shrink-0"',
    layout_content,
    flags=re.DOTALL
)

# Replace the child-like Donate button with the precise glowing vector heart button
# Elevated above navigation dock line, glowing crimson-saffron neon glow fill
glowing_vector_heart = '''
          {/* Central elevated Glowing Heart Donate Button */}
          <motion.div className="relative -top-7">
            <motion.button 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNav("/donations")}
              className="flex items-center justify-center cursor-pointer p-0 bg-transparent border-0 outline-none relative"
            >
              <svg 
                viewBox="0 0 100 100" 
                className="w-16 h-16 filter drop-shadow-[0_0_15px_rgba(255,59,48,0.95)] animate-pulse"
                style={{ animationDuration: '2.2s' }}
              >
                <defs>
                  <linearGradient id="neonHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF3B30" />
                    <stop offset="100%" stopColor="#F26522" />
                  </linearGradient>
                </defs>
                <path 
                  d="M50 88.3L43.8 82.6C21.8 62.6 7.3 49.5 7.3 33.3C7.3 20.1 17.6 9.8 30.8 9.8C38.3 9.8 45.5 13.3 50 18.8C54.5 13.3 61.7 9.8 69.2 9.8C82.4 9.8 92.7 20.1 92.7 33.3C92.7 49.5 78.2 62.6 56.2 82.7L50 88.3Z" 
                  fill="url(#neonHeartGrad)"
                />
                {/* Embedded silhouette of Folding Hands (Namaste) inside heart */}
                <path 
                  d="M50 28c-0.8 0-1.5 0.3-2 0.8l-8.5 8.5c-0.8 0.8-0.8 2 0 2.8 0.8 0.8 2 0.8 2.8 0L50 32.8l7.7 7.3c0.8 0.8 2 0.8 2.8 0 0.8-0.8 0.8-2 0-2.8l-8.5-8.5c-0.5-0.5-1.2-0.8-2-0.8z" 
                  fill="#ffffff"
                />
                <path 
                  d="M50 33.5c-0.5 0-1 0.2-1.4 0.6L41 42c-0.8 0.8-0.8 2 0 2.8s2 0.8 2.8 0l6.2-5.9 6.2 5.9c0.8 0.8 2 0.8 2.8 0s0.8-2 0-2.8l-7.6-7.9c-0.4-0.4-0.9-0.6-1.4-0.6z" 
                  fill="#ffffff"
                  opacity="0.9"
                />
                <path 
                  d="M47.5 40v20c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V40h-5z" 
                  fill="#ffffff"
                  opacity="0.95"
                />
              </svg>
              <span className="absolute -bottom-4 text-[8px] font-black text-[#1C2D42] tracking-widest uppercase">DONATE</span>
            </motion.button>
          </motion.div>
'''

layout_content = re.sub(
    r'\{/\* Central Donate Button \*/\}.*?</motion\.div>',
    glowing_vector_heart,
    layout_content,
    flags=re.DOTALL
)

# Replace the navigation items label to match "Home", "Services", "Donate", "Impact", "Profile"
# Specifically replacing Community navigation block title
layout_content = re.sub(
    r'\{/\* Central Donate Button \*/\}.*?<span className="text-\[9px\] font-bold">\{language === "hi" \? "??????" : "Community"\}</span>',
    glowing_vector_heart,
    layout_content,
    flags=re.DOTALL
)

# Labeled bottom nav buttons:
# 1. Home
# 2. Services
# 3. Donate (central)
# 4. Community (labeled "Impact" / "हमारा प्रभाव")
# 5. Profile
layout_content = layout_content.replace(
    '{language === "hi" ? "??????" : "Community"}',
    '{language === "hi" ? "प्रभाव" : "Impact"}'
)

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(layout_content)

print('Updated Home.tsx and MainLayout.tsx components')
