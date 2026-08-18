var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/data/coreServices.ts
var coreServices_exports = {};
__export(coreServices_exports, {
  CORE_SERVICES: () => CORE_SERVICES
});
var CORE_SERVICES;
var init_coreServices = __esm({
  "src/data/coreServices.ts"() {
    CORE_SERVICES = [
      { id: "card", category: "welfare", iconName: "ShieldCheck", titleEn: "Jan Seva Card", titleHi: "\u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921", descEn: "Apply for Foundational ID", descHi: "\u092C\u0941\u0928\u093F\u092F\u093E\u0926\u0940 \u0906\u0908\u0921\u0940 \u0915\u0947 \u0932\u093F\u090F \u0906\u0935\u0947\u0926\u0928" },
      { id: "blood", category: "urgent", iconName: "Heart", titleEn: "Blood Network", titleHi: "\u0930\u0915\u094D\u0924 \u0928\u0947\u091F\u0935\u0930\u094D\u0915", descEn: "Emergency Blood Donor Requests", descHi: "\u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0930\u0915\u094D\u0924\u0926\u093E\u0924\u093E \u0905\u0928\u0941\u0930\u094B\u0927" },
      { id: "donations", category: "involved", iconName: "HandCoins", titleEn: "Donations", titleHi: "\u0926\u093E\u0928", descEn: "Support our causes directly", descHi: "\u0939\u092E\u093E\u0930\u0947 \u0915\u093E\u0930\u0923\u094B\u0902 \u0915\u093E \u0938\u092E\u0930\u094D\u0925\u0928 \u0915\u0930\u0947\u0902" },
      { id: "grievance", category: "civic", iconName: "AlertTriangle", titleEn: "Grievances", titleHi: "\u0936\u093F\u0915\u093E\u092F\u0924\u0947\u0902", descEn: "Report Civic Issues", descHi: "\u0928\u093E\u0917\u0930\u093F\u0915 \u0938\u092E\u0938\u094D\u092F\u093E\u0913\u0902 \u0915\u0940 \u0930\u093F\u092A\u094B\u0930\u094D\u091F" },
      { id: "volunteers", category: "involved", iconName: "Users", titleEn: "Volunteering", titleHi: "\u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u093E", descEn: "Join the RP Force", descHi: "\u0906\u0930\u092A\u0940 \u092B\u094B\u0930\u094D\u0938 \u0938\u0947 \u091C\u0941\u0921\u093C\u0947\u0902" },
      { id: "health-care", category: "welfare", iconName: "HeartPulse", titleEn: "Health Care", titleHi: "\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u0947\u0935\u093E", descEn: "Track health metrics & seek care", descHi: "\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u092E\u093E\u092A\u0928 \u090F\u0935\u0902 \u091A\u093F\u0915\u093F\u0924\u094D\u0938\u093E" },
      { id: "jobs", category: "welfare", iconName: "Briefcase", titleEn: "Jobs Portal", titleHi: "\u0930\u094B\u091C\u0917\u093E\u0930 \u092A\u094B\u0930\u094D\u091F\u0932", descEn: "Find local employment opportunities", descHi: "\u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0930\u094B\u091C\u0917\u093E\u0930 \u0915\u0947 \u0905\u0935\u0938\u0930 \u0916\u094B\u091C\u0947\u0902" },
      { id: "scholarships", category: "welfare", iconName: "GraduationCap", titleEn: "Scholarships", titleHi: "\u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F", descEn: "Apply for educational grants", descHi: "\u0936\u0948\u0915\u094D\u0937\u0923\u093F\u0915 \u0905\u0928\u0941\u0926\u093E\u0928 \u0915\u0947 \u0932\u093F\u090F \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902" },
      { id: "food", category: "welfare", iconName: "Apple", titleEn: "Food Support", titleHi: "\u0906\u0939\u093E\u0930 \u0938\u0939\u093E\u092F\u0924\u093E", descEn: "Apply for dry rations or find kitchens", descHi: "\u0938\u0942\u0916\u093E \u0930\u093E\u0936\u0928 \u092F\u093E \u0930\u0938\u094B\u0908 \u0915\u0947\u0902\u0926\u094D\u0930 \u0916\u094B\u091C\u0947\u0902" },
      { id: "medicine", category: "welfare", iconName: "Pill", titleEn: "Medicine Support", titleHi: "\u091A\u093F\u0915\u093F\u0924\u094D\u0938\u093E \u0938\u0939\u093E\u092F\u0924\u093E", descEn: "Request critical medical supplies", descHi: "\u0906\u0935\u0936\u094D\u092F\u0915 \u091A\u093F\u0915\u093F\u0924\u094D\u0938\u093E \u0906\u092A\u0942\u0930\u094D\u0924\u093F \u0915\u093E \u0905\u0928\u0941\u0930\u094B\u0927" },
      { id: "education", category: "welfare", iconName: "BookOpen", titleEn: "Education Aid", titleHi: "\u0936\u093F\u0915\u094D\u0937\u093E \u0938\u0939\u093E\u092F\u0924\u093E", descEn: "Scholarships and Books", descHi: "\u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u0914\u0930 \u0915\u093F\u0924\u093E\u092C\u0947\u0902" },
      { id: "women-safety", category: "urgent", iconName: "Shield", titleEn: "Women Safety", titleHi: "\u092E\u0939\u093F\u0932\u093E \u0938\u0941\u0930\u0915\u094D\u0937\u093E", descEn: "24/7 Helpline and support", descHi: "24/7 \u0939\u0947\u0932\u094D\u092A\u0932\u093E\u0907\u0928" },
      { id: "seniors", category: "welfare", iconName: "HandHelping", titleEn: "Senior Citizens", titleHi: "\u0935\u0930\u093F\u0937\u094D\u0920 \u0928\u093E\u0917\u0930\u093F\u0915", descEn: "Doorstep checkups & elder care", descHi: "\u0935\u0930\u093F\u0937\u094D\u0920 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0938\u0939\u093E\u092F\u0924\u093E" },
      { id: "animals", category: "welfare", iconName: "Compass", titleEn: "Animal Welfare", titleHi: "\u092A\u0936\u0941 \u0915\u0932\u094D\u092F\u093E\u0923", descEn: "Stray rescue & adoption registry", descHi: "\u092C\u0947\u0938\u0939\u093E\u0930\u093E \u092A\u0936\u0941\u0913\u0902 \u0915\u0940 \u0938\u0939\u093E\u092F\u0924\u093E" },
      { id: "environment", category: "involved", iconName: "TreePine", titleEn: "Environment", titleHi: "\u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923", descEn: "Tree plantation drives", descHi: "\u0935\u0943\u0915\u094D\u0937\u093E\u0930\u094B\u092A\u0923 \u0905\u092D\u093F\u092F\u093E\u0928" },
      { id: "crowdfunding", category: "involved", iconName: "Coins", titleEn: "Crowdfunding", titleHi: "\u0938\u093E\u092E\u0941\u0926\u093E\u092F\u093F\u0915 \u0927\u0928 \u0938\u0902\u091A\u092F", descEn: "Crowdfunded community projects", descHi: "\u0938\u093E\u092E\u0941\u0926\u093E\u092F\u093F\u0915 \u092A\u0930\u093F\u092F\u094B\u091C\u0928\u093E\u0913\u0902 \u0915\u0947 \u0932\u093F\u090F \u0927\u0928" },
      { id: "culture", category: "civic", iconName: "Landmark", titleEn: "Religious & Culture", titleHi: "\u0927\u0930\u094D\u092E \u0914\u0930 \u0938\u0902\u0938\u094D\u0915\u0943\u0924\u093F", descEn: "Festivals, sacred texts & live feeds", descHi: "\u0924\u094D\u092F\u094C\u0939\u093E\u0930, \u0917\u094D\u0930\u0902\u0925 \u0914\u0930 \u092E\u0902\u0926\u093F\u0930 \u0932\u093E\u0907\u0935" },
      { id: "disaster", category: "urgent", iconName: "AlertCircle", titleEn: "Disaster Management", titleHi: "\u0906\u092A\u0926\u093E \u092A\u094D\u0930\u092C\u0902\u0927\u0928", descEn: "Emergency relief & rescue mapping", descHi: "\u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0930\u093E\u0939\u0924 \u090F\u0935\u0902 \u092C\u091A\u093E\u0935" },
      { id: "farmer", category: "welfare", iconName: "Sprout", titleEn: "Farmer Support", titleHi: "\u0915\u093F\u0938\u093E\u0928 \u0938\u0939\u092F\u094B\u0917", descEn: "Crop diagnostic & market pricing", descHi: "\u0915\u0943\u0937\u093F \u0938\u0939\u093E\u092F\u0924\u093E \u0914\u0930 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923" },
      { id: "schemes", category: "empowerment", iconName: "FileText", titleEn: "Government Schemes", titleHi: "\u0938\u0930\u0915\u093E\u0930\u0940 \u092F\u094B\u091C\u0928\u093E\u090F\u0902", descEn: "Eligibility calculator & guides", descHi: "\u0906\u0927\u093E\u0930, \u0930\u093E\u0936\u0928 \u090F\u0935\u0902 PM \u0906\u0935\u093E\u0938 \u0938\u0939\u093E\u092F\u0924\u093E" },
      { id: "skills", category: "empowerment", iconName: "GraduationCap", titleEn: "Skills Training", titleHi: "\u0915\u094C\u0936\u0932 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923", descEn: "Tailoring, coding & courses", descHi: "\u0928\u093F\u0936\u0941\u0932\u094D\u0915 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923 \u0915\u094B\u0930\u094D\u0938" },
      { id: "countries", category: "civic", iconName: "Globe", titleEn: "Global Guide", titleHi: "\u0935\u0948\u0936\u094D\u0935\u093F\u0915 \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E", descEn: "Look up nation currencies, timezones & details", descHi: "\u0935\u093F\u0936\u094D\u0935 \u092E\u0941\u0926\u094D\u0930\u093E, \u0938\u092E\u092F \u0914\u0930 \u0926\u0947\u0936\u094B\u0902 \u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940" },
      { id: "earthquakes", category: "civic", iconName: "AlertTriangle", titleEn: "Earthquakes", titleHi: "\u092D\u0942\u0915\u0902\u092A", descEn: "Live USGS Alerts", descHi: "\u0932\u093E\u0907\u0935 \u092D\u0942\u0915\u0902\u092A \u0905\u0932\u0930\u094D\u091F" },
      { id: "fuel-tracker", category: "welfare", iconName: "Fuel", titleEn: "Fuel Tracker", titleHi: "\u0908\u0902\u0927\u0928 \u091F\u094D\u0930\u0948\u0915\u0930", descEn: "Track mileage & cost", descHi: "\u092E\u093E\u0907\u0932\u0947\u091C \u0914\u0930 \u0932\u093E\u0917\u0924" },
      { id: "gps-toolkit", category: "civic", iconName: "Compass", titleEn: "GPS Toolkit", titleHi: "\u091C\u0940\u092A\u0940\u090F\u0938 \u091F\u0942\u0932\u0915\u093F\u091F", descEn: "Speedometer & Parking", descHi: "\u0938\u094D\u092A\u0940\u0921\u094B\u092E\u0940\u091F\u0930 \u0914\u0930 \u092A\u093E\u0930\u094D\u0915\u093F\u0902\u0917" },
      { id: "vitals", category: "welfare", iconName: "Activity", titleEn: "Vitals Dashboard", titleHi: "\u0935\u093F\u091F\u0932\u094D\u0938 \u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921", descEn: "Track BP, steps & BMI", descHi: "\u092C\u0940\u092A\u0940, \u0915\u0926\u092E \u0914\u0930 \u092C\u0940\u090F\u092E\u0906\u0908" },
      { id: "medications", category: "welfare", iconName: "Pill", titleEn: "Med Reminder", titleHi: "\u0926\u0935\u093E \u0905\u0928\u0941\u0938\u094D\u092E\u093E\u0930\u0915", descEn: "Pill schedule alerts", descHi: "\u0926\u0935\u093E \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0905\u0932\u0930\u094D\u091F" },
      { id: "medical-dict", category: "welfare", iconName: "BookOpen", titleEn: "Medical Dict", titleHi: "\u091A\u093F\u0915\u093F\u0924\u094D\u0938\u093E \u0936\u092C\u094D\u0926\u0915\u094B\u0936", descEn: "Glossary & first aid", descHi: "\u0936\u092C\u094D\u0926\u093E\u0935\u0932\u0940 \u0914\u0930 \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915 \u0909\u092A\u091A\u093E\u0930" },
      { id: "sos", category: "urgent", iconName: "ShieldAlert", titleEn: "SOS System", titleHi: "\u090F\u0938\u0913\u090F\u0938 \u0938\u093F\u0938\u094D\u091F\u092E", descEn: "Emergency panic & location", descHi: "\u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u092A\u0948\u0928\u093F\u0915 \u0914\u0930 \u0938\u094D\u0925\u093E\u0928" },
      { id: "period-tracker", category: "welfare", iconName: "Heart", titleEn: "Period Tracker", titleHi: "\u092E\u093E\u0939\u0935\u093E\u0930\u0940 \u091F\u094D\u0930\u0948\u0915\u0930", descEn: "Cycle calendar & symptoms", descHi: "\u092E\u093E\u0938\u093F\u0915 \u0927\u0930\u094D\u092E \u0915\u0948\u0932\u0947\u0902\u0921\u0930" },
      { id: "child-tracker", category: "welfare", iconName: "Baby", titleEn: "Child Tracker", titleHi: "\u0936\u093F\u0936\u0941 \u091F\u094D\u0930\u0948\u0915\u0930", descEn: "Developmental milestones", descHi: "\u0935\u093F\u0915\u093E\u0938 \u0915\u0947 \u092E\u0940\u0932 \u0915\u0947 \u092A\u0924\u094D\u0925\u0930" },
      { id: "resume-builder", category: "empowerment", iconName: "FileText", titleEn: "Resume Builder", titleHi: "\u092C\u093E\u092F\u094B\u0921\u093E\u091F\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0924\u093E", descEn: "AI resume generation", descHi: "\u090F\u0906\u0908 \u092C\u093E\u092F\u094B\u0921\u093E\u091F\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923" },
      { id: "doc-scanner", category: "empowerment", iconName: "Camera", titleEn: "Doc Scanner", titleHi: "\u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u093C \u0938\u094D\u0915\u0948\u0928\u0930", descEn: "Scan and save PDFs", descHi: "\u092A\u0940\u0921\u0940\u090F\u092B \u0938\u094D\u0915\u0948\u0928 \u0915\u0930\u0947\u0902" },
      { id: "ai-chat", category: "empowerment", iconName: "Bot", titleEn: "AI Assistant", titleHi: "\u090F\u0906\u0908 \u0938\u0939\u093E\u092F\u0915", descEn: "Ask Gemini anything", descHi: "\u091C\u0947\u092E\u093F\u0928\u0940 \u0938\u0947 \u0915\u0941\u091B \u092D\u0940 \u092A\u0942\u091B\u0947\u0902" },
      { id: "story-library", category: "empowerment", iconName: "BookOpen", titleEn: "Audiobooks", titleHi: "\u0911\u0921\u093F\u092F\u094B \u092A\u0941\u0938\u094D\u0924\u0915\u0947\u0902", descEn: "Read and listen to stories", descHi: "\u0915\u0939\u093E\u0928\u093F\u092F\u093E\u0902 \u092A\u0922\u093C\u0947\u0902 \u0914\u0930 \u0938\u0941\u0928\u0947\u0902" },
      { id: "hindu-calendar", category: "culture", iconName: "Calendar", titleEn: "Hindu Calendar", titleHi: "\u0939\u093F\u0902\u0926\u0942 \u092A\u0902\u091A\u093E\u0902\u0917", descEn: "Tithis & Festivals", descHi: "\u0924\u093F\u0925\u093F\u092F\u093E\u0902 \u0914\u0930 \u0924\u094D\u092F\u094B\u0939\u093E\u0930" },
      { id: "news-feed", category: "culture", iconName: "Newspaper", titleEn: "News Feed", titleHi: "\u0938\u092E\u093E\u091A\u093E\u0930", descEn: "Top headlines & stories", descHi: "\u092A\u094D\u0930\u092E\u0941\u0916 \u0916\u092C\u0930\u0947\u0902" },
      { id: "internet-radio", category: "culture", iconName: "Radio", titleEn: "Internet Radio", titleHi: "\u0907\u0902\u091F\u0930\u0928\u0947\u091F \u0930\u0947\u0921\u093F\u092F\u094B", descEn: "Live radio stations", descHi: "\u0932\u093E\u0907\u0935 \u0930\u0947\u0921\u093F\u092F\u094B \u0938\u094D\u091F\u0947\u0936\u0928" },
      { id: "transit-planner", category: "civic", iconName: "Map", titleEn: "Transit Planner", titleHi: "\u092A\u093E\u0930\u0917\u092E\u0928 \u092F\u094B\u091C\u0928\u093E\u0915\u093E\u0930", descEn: "Bus & Metro Routes", descHi: "\u092C\u0938 \u0914\u0930 \u092E\u0947\u091F\u094D\u0930\u094B \u092E\u093E\u0930\u094D\u0917" },
      { id: "youth", category: "empowerment", iconName: "Rocket", titleEn: "Youth Empowerment", titleHi: "\u092F\u0941\u0935\u093E \u0938\u0936\u0915\u094D\u0924\u093F\u0915\u0930\u0923", descEn: "Leadership, sports & career guidance for youth", descHi: "\u092F\u0941\u0935\u093E\u0913\u0902 \u0915\u0947 \u0932\u093F\u090F \u0928\u0947\u0924\u0943\u0924\u094D\u0935, \u0916\u0947\u0932 \u090F\u0935\u0902 \u0915\u0930\u093F\u092F\u0930 \u092E\u093E\u0930\u094D\u0917\u0926\u0930\u094D\u0936\u0928" },
      { id: "nation", category: "civic", iconName: "Flag", titleEn: "Nation Building", titleHi: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930 \u0928\u093F\u0930\u094D\u092E\u093E\u0923", descEn: "National programs, civic duty & patriotic initiatives", descHi: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E, \u0928\u093E\u0917\u0930\u093F\u0915 \u0915\u0930\u094D\u0924\u0935\u094D\u092F \u090F\u0935\u0902 \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u092D\u0915\u094D\u0924\u093F \u092A\u0939\u0932" }
    ];
  }
});

// server.ts
var import_socket = require("socket.io");
var import_http = __toESM(require("http"), 1);

// src/lib/constituency.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_axios = __toESM(require("axios"), 1);
var acGeoJsonData = null;
var acGeoJsonLoadAttempted = false;
var MP_CONSTITUENCIES_MOCK = [
  { district: "Bhopal", vidhan_sabha: "Bhopal Uttar", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Bhopal Madhya", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Bhopal Dakshin-Pashchim", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Narela", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Govindpura", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Huzur", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Budhni", sansad_kshetra: "Vidisha" },
  { district: "Bhopal", vidhan_sabha: "Ichhawar", sansad_kshetra: "Vidisha" },
  { district: "Bhopal", vidhan_sabha: "Ashta", sansad_kshetra: "Dewas" },
  { district: "Indore", vidhan_sabha: "Indore-1", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-2", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-3", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-4", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-5", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Rau", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Mhow", sansad_kshetra: "Dhar" },
  { district: "Gwalior", vidhan_sabha: "Gwalior East", sansad_kshetra: "Gwalior" },
  { district: "Gwalior", vidhan_sabha: "Gwalior South", sansad_kshetra: "Gwalior" },
  { district: "Jabalpur", vidhan_sabha: "Jabalpur Cantt", sansad_kshetra: "Jabalpur" },
  { district: "Jabalpur", vidhan_sabha: "Jabalpur East", sansad_kshetra: "Jabalpur" },
  { district: "Vidisha", vidhan_sabha: "Vidisha", sansad_kshetra: "Vidisha" },
  { district: "Sagar", vidhan_sabha: "Sagar", sansad_kshetra: "Sagar" },
  { district: "Ujjain", vidhan_sabha: "Ujjain North", sansad_kshetra: "Ujjain" },
  { district: "Ujjain", vidhan_sabha: "Ujjain South", sansad_kshetra: "Ujjain" },
  { district: "Dewas", vidhan_sabha: "Dewas", sansad_kshetra: "Dewas" }
];
var PINCODE_CONSTITUENCY_MAP = {
  "462038": {
    vidhan_sabha: "Narela",
    vidhan_sabhas: ["Narela", "Bhopal Uttar", "Govindpura"],
    sansad_kshetra: "Bhopal"
  },
  "462001": {
    vidhan_sabha: "Bhopal Uttar",
    vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"],
    sansad_kshetra: "Bhopal"
  },
  "462002": {
    vidhan_sabha: "Bhopal Uttar",
    vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"],
    sansad_kshetra: "Bhopal"
  },
  "462003": {
    vidhan_sabha: "Bhopal Uttar",
    vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"],
    sansad_kshetra: "Bhopal"
  },
  "462008": {
    vidhan_sabha: "Bhopal Uttar",
    vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"],
    sansad_kshetra: "Bhopal"
  },
  "462010": {
    vidhan_sabha: "Narela",
    vidhan_sabhas: ["Narela", "Govindpura"],
    sansad_kshetra: "Bhopal"
  },
  "462011": {
    vidhan_sabha: "Narela",
    vidhan_sabhas: ["Narela", "Govindpura"],
    sansad_kshetra: "Bhopal"
  },
  "462018": {
    vidhan_sabha: "Narela",
    vidhan_sabhas: ["Narela", "Govindpura"],
    sansad_kshetra: "Bhopal"
  },
  "462021": {
    vidhan_sabha: "Govindpura",
    vidhan_sabhas: ["Govindpura", "Narela"],
    sansad_kshetra: "Bhopal"
  },
  "462022": {
    vidhan_sabha: "Govindpura",
    vidhan_sabhas: ["Govindpura", "Narela"],
    sansad_kshetra: "Bhopal"
  },
  "462023": {
    vidhan_sabha: "Govindpura",
    vidhan_sabhas: ["Govindpura", "Narela"],
    sansad_kshetra: "Bhopal"
  },
  "462024": {
    vidhan_sabha: "Govindpura",
    vidhan_sabhas: ["Govindpura", "Narela"],
    sansad_kshetra: "Bhopal"
  },
  "462026": {
    vidhan_sabha: "Bhopal Madhya",
    vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"],
    sansad_kshetra: "Bhopal"
  },
  "462004": {
    vidhan_sabha: "Bhopal Madhya",
    vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"],
    sansad_kshetra: "Bhopal"
  },
  "462007": {
    vidhan_sabha: "Bhopal Madhya",
    vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"],
    sansad_kshetra: "Bhopal"
  },
  "462016": {
    vidhan_sabha: "Bhopal Dakshin-Pashchim",
    vidhan_sabhas: ["Bhopal Dakshin-Pashchim", "Bhopal Madhya", "Huzur"],
    sansad_kshetra: "Bhopal"
  },
  "462030": {
    vidhan_sabha: "Bhopal Dakshin-Pashchim",
    vidhan_sabhas: ["Bhopal Dakshin-Pashchim", "Bhopal Madhya", "Huzur"],
    sansad_kshetra: "Bhopal"
  },
  "462009": {
    vidhan_sabha: "Huzur",
    vidhan_sabhas: ["Huzur", "Bhopal Dakshin-Pashchim"],
    sansad_kshetra: "Bhopal"
  },
  "462042": {
    vidhan_sabha: "Huzur",
    vidhan_sabhas: ["Huzur", "Bhopal Dakshin-Pashchim"],
    sansad_kshetra: "Bhopal"
  },
  "466001": {
    vidhan_sabha: "Budhni",
    vidhan_sabhas: ["Budhni", "Ichhawar"],
    sansad_kshetra: "Vidisha"
  },
  "452001": {
    vidhan_sabha: "Indore-1",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"],
    sansad_kshetra: "Indore"
  },
  "452002": {
    vidhan_sabha: "Indore-2",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"],
    sansad_kshetra: "Indore"
  },
  "452003": {
    vidhan_sabha: "Indore-3",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"],
    sansad_kshetra: "Indore"
  },
  "452004": {
    vidhan_sabha: "Indore-4",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"],
    sansad_kshetra: "Indore"
  },
  "452010": {
    vidhan_sabha: "Indore-5",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"],
    sansad_kshetra: "Indore"
  },
  "452011": {
    vidhan_sabha: "Rau",
    vidhan_sabhas: ["Rau", "Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5"],
    sansad_kshetra: "Indore"
  },
  "453441": {
    vidhan_sabha: "Mhow",
    vidhan_sabhas: ["Mhow", "Rau"],
    sansad_kshetra: "Dhar"
  }
};
function findConstituenciesByDistrict(district, state) {
  const geoJson = loadACGeoJson();
  if (!geoJson || !Array.isArray(geoJson.features)) return null;
  const targetDistrict = district.trim().toLowerCase();
  const targetState = state ? state.trim().toLowerCase() : null;
  const seen = /* @__PURE__ */ new Set();
  const matches = [];
  for (const feature of geoJson.features) {
    const props = feature.properties;
    if (!props) continue;
    const distRaw = (props.DIST_NAME || "").toLowerCase();
    const st = (props.ST_NAME || "").toLowerCase();
    const cleanDist = distRaw.replace(/\b(district|m corp|municipal corporation|city)\b/g, "").replace(/[^a-z]/g, "");
    const cleanTargetDist = targetDistrict.replace(/\b(district|m corp|municipal corporation|city)\b/g, "").replace(/[^a-z]/g, "");
    if (!cleanDist || !cleanTargetDist) continue;
    if (!cleanDist.includes(cleanTargetDist) && !cleanTargetDist.includes(cleanDist)) continue;
    if (targetState && !st.includes(targetState) && !targetState.includes(st)) continue;
    const acName = props.AC_NAME;
    if (!acName || seen.has(acName)) continue;
    seen.add(acName);
    matches.push({
      vidhan_sabha: acName,
      sansad_kshetra: props.PC_NAME || ""
    });
  }
  return matches.length > 0 ? matches : null;
}
function loadACGeoJson() {
  return acGeoJsonData;
}
async function loadACGeoJsonAsync() {
  if (acGeoJsonData) return acGeoJsonData;
  if (acGeoJsonLoadAttempted) return acGeoJsonData;
  acGeoJsonLoadAttempted = true;
  try {
    const cachePath = import_path.default.join(process.cwd(), "ac_cache.json");
    if (import_fs.default.existsSync(cachePath)) {
      console.log("[AC GeoJSON] Loading constituency data from local cache...");
      const raw = import_fs.default.readFileSync(cachePath, "utf8");
      acGeoJsonData = JSON.parse(raw);
      console.log(`[AC GeoJSON] Successfully loaded ${acGeoJsonData.features?.length} constituency features from cache.`);
      return acGeoJsonData;
    }
    console.log("[AC GeoJSON] Fetching constituency data from remote (60s timeout)...");
    const res = await import_axios.default.get("https://yashveeeeeeer.github.io/india-geodata/ac.geojson", { timeout: 6e4 });
    if (res.data && Array.isArray(res.data.features)) {
      acGeoJsonData = res.data;
      try {
        import_fs.default.writeFileSync(cachePath, JSON.stringify(res.data));
        console.log("[AC GeoJSON] Saved to local cache.");
      } catch (writeErr) {
        console.error("[AC GeoJSON] Failed to write cache:", writeErr.message);
      }
      console.log(`[AC GeoJSON] Successfully loaded ${acGeoJsonData.features.length} constituency features.`);
    }
  } catch (err) {
    console.error("[AC GeoJSON] Failed to load from remote:", err.message);
  }
  return acGeoJsonData;
}
function resolveConstituency(pincode, district, areas = [], state) {
  if (PINCODE_CONSTITUENCY_MAP[pincode]) {
    return PINCODE_CONSTITUENCY_MAP[pincode];
  }
  const areaString = (areas || []).join(" ").toLowerCase();
  const distLower = (district || "").toLowerCase();
  const geoMatches = findConstituenciesByDistrict(district, state);
  if (geoMatches) {
    const vidhan_sabhas = geoMatches.map((m) => m.vidhan_sabha);
    let sansad_kshetra2 = geoMatches[0]?.sansad_kshetra || `${district} Lok Sabha constituency`;
    if (geoMatches.length === 1) {
      return {
        vidhan_sabha: geoMatches[0].vidhan_sabha,
        vidhan_sabhas,
        sansad_kshetra: geoMatches[0].sansad_kshetra || sansad_kshetra2
      };
    }
    const nameMatch = geoMatches.find(
      (m) => areaString.includes(m.vidhan_sabha.toLowerCase())
    );
    if (nameMatch) {
      return {
        vidhan_sabha: nameMatch.vidhan_sabha,
        vidhan_sabhas,
        sansad_kshetra: nameMatch.sansad_kshetra || sansad_kshetra2
      };
    }
    return {
      vidhan_sabha: "",
      vidhan_sabhas,
      sansad_kshetra: ""
    };
  }
  if (distLower === "bhopal") {
    if (areaString.includes("narela") || areaString.includes("m.l. nagar") || areaString.includes("ml nagar") || areaString.includes("eintkhedi") || areaString.includes("karond")) {
      return {
        vidhan_sabha: "Narela",
        vidhan_sabhas: [
          "Narela",
          "Bhopal Uttar",
          "Govindpura",
          "Bhopal Madhya",
          "Bhopal Dakshin-Pashchim",
          "Huzur"
        ],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("govindpura") || areaString.includes("piplani") || areaString.includes("industrial area") || areaString.includes("bhel")) {
      return {
        vidhan_sabha: "Govindpura",
        vidhan_sabhas: [
          "Govindpura",
          "Narela",
          "Bhopal Uttar",
          "Bhopal Madhya",
          "Bhopal Dakshin-Pashchim",
          "Huzur"
        ],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("huzur") || areaString.includes("bairagarh") || areaString.includes("lalghati") || areaString.includes("gandhi nagar")) {
      return {
        vidhan_sabha: "Huzur",
        vidhan_sabhas: [
          "Huzur",
          "Bhopal Dakshin-Pashchim",
          "Bhopal Uttar",
          "Bhopal Madhya",
          "Govindpura",
          "Narela"
        ],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("dakshin") || areaString.includes("pashchim") || areaString.includes("tt nagar") || areaString.includes("new market") || areaString.includes("arera")) {
      return {
        vidhan_sabha: "Bhopal Dakshin-Pashchim",
        vidhan_sabhas: [
          "Bhopal Dakshin-Pashchim",
          "Bhopal Madhya",
          "Huzur",
          "Bhopal Uttar",
          "Govindpura",
          "Narela"
        ],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("madhya") || areaString.includes("jehangirabad") || areaString.includes("chola") || areaString.includes("aishbagh")) {
      return {
        vidhan_sabha: "Bhopal Madhya",
        vidhan_sabhas: [
          "Bhopal Madhya",
          "Bhopal Uttar",
          "Bhopal Dakshin-Pashchim",
          "Narela",
          "Govindpura",
          "Huzur"
        ],
        sansad_kshetra: "Bhopal"
      };
    }
    return {
      vidhan_sabha: "",
      vidhan_sabhas: [
        "Bhopal Uttar",
        "Bhopal Madhya",
        "Bhopal Dakshin-Pashchim",
        "Narela",
        "Govindpura",
        "Huzur"
      ],
      sansad_kshetra: "Bhopal"
    };
  }
  if (distLower === "indore") {
    if (areaString.includes("mhow")) {
      return {
        vidhan_sabha: "Mhow",
        vidhan_sabhas: [
          "Mhow",
          "Rau",
          "Indore-1",
          "Indore-2",
          "Indore-3",
          "Indore-4",
          "Indore-5"
        ],
        sansad_kshetra: "Dhar"
      };
    }
    if (areaString.includes("rau") || areaString.includes("rajendra nagar")) {
      return {
        vidhan_sabha: "Rau",
        vidhan_sabhas: [
          "Rau",
          "Indore-1",
          "Indore-2",
          "Indore-3",
          "Indore-4",
          "Indore-5",
          "Mhow"
        ],
        sansad_kshetra: "Indore"
      };
    }
    return {
      vidhan_sabha: "",
      vidhan_sabhas: [
        "Indore-1",
        "Indore-2",
        "Indore-3",
        "Indore-4",
        "Indore-5",
        "Rau",
        "Mhow"
      ],
      sansad_kshetra: "Indore"
    };
  }
  const matches = MP_CONSTITUENCIES_MOCK.filter(
    (c) => c.district.toLowerCase() === distLower
  );
  if (matches.length === 0) {
    return {
      vidhan_sabha: "",
      vidhan_sabhas: district ? [`${district} Assembly Constituency`] : [],
      sansad_kshetra: district ? `${district} Lok Sabha constituency` : ""
    };
  }
  if (matches.length === 1) {
    return {
      vidhan_sabha: matches[0].vidhan_sabha,
      vidhan_sabhas: [matches[0].vidhan_sabha],
      sansad_kshetra: matches[0].sansad_kshetra
    };
  }
  const sansad_kshetras = Array.from(
    new Set(matches.map((c) => c.sansad_kshetra))
  );
  const sansad_kshetra = sansad_kshetras.length === 1 ? sansad_kshetras[0] : `${district} Lok Sabha constituency`;
  return {
    vidhan_sabha: "",
    vidhan_sabhas: matches.map((c) => c.vidhan_sabha),
    sansad_kshetra
  };
}

// server.ts
var import_express29 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_express_rate_limit3 = __toESM(require("express-rate-limit"), 1);
var import_bcryptjs7 = __toESM(require("bcryptjs"), 1);
var import_path4 = __toESM(require("path"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);
var import_pg2 = __toESM(require("pg"), 1);

// src/db/middleware.js
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// src/db/dbPool.ts
var import_pg = __toESM(require("pg"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rp_foundation";
var pool = new import_pg.default.Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.") ? false : { rejectUnauthorized: false }
});

// src/db/middleware.js
var configuredSecret = process.env.JWT_SECRET?.trim();
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
}
var JWT_SECRET = configuredSecret || "development_only_change_me_please_32_chars";
var LEGACY_ADMIN_ROLES = /* @__PURE__ */ new Set(["admin", "super_admin", "superadmin"]);
var CANONICAL_ADMIN_ROLE = "admin";
var normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  return LEGACY_ADMIN_ROLES.has(value) ? CANONICAL_ADMIN_ROLE : value;
};
var authorizeRole = (requiredRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });
  const userRole = normalizeRole(req.user.role);
  const wantedRole = normalizeRole(requiredRole);
  if (!wantedRole) return res.status(500).json({ success: false, error: "Authorization policy is not configured" });
  if (userRole !== wantedRole) {
    return res.status(403).json({ success: false, error: "Access Denied: Insufficient permissions" });
  }
  req.user.role = userRole;
  next();
};
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) return res.status(401).json({ success: false, error: "No token provided" });
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    if (!decoded || typeof decoded !== "object") return res.status(403).json({ success: false, error: "Invalid token" });
    const normalizedRole = normalizeRole(decoded.role);
    if (!normalizedRole || !decoded.id) return res.status(403).json({ success: false, error: "Invalid token claims" });
    const user = { ...decoded, role: normalizedRole };
    if (user.role !== "guest") {
      const sessionRes = await pool.query(
        "SELECT 1 FROM sessions WHERE token = $1 AND expires_at > NOW() LIMIT 1",
        [token]
      );
      if (sessionRes.rows.length === 0) return res.status(401).json({ success: false, error: "Session expired or logged out" });
    }
    req.user = user;
    req.authToken = token;
    next();
  } catch (error) {
    if (error?.name === "TokenExpiredError") return res.status(401).json({ success: false, error: "Token expired" });
    if (error?.code || error?.message?.includes("sessions")) {
      console.error("Authentication session validation failed:", error);
      return res.status(503).json({ success: false, error: "Authentication service temporarily unavailable" });
    }
    return res.status(403).json({ success: false, error: "Invalid token" });
  }
};
var requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });
  if (normalizeRole(req.user.role) !== CANONICAL_ADMIN_ROLE) {
    return res.status(403).json({ success: false, error: "Access Denied: Administrator role required" });
  }
  req.user.role = CANONICAL_ADMIN_ROLE;
  next();
};
var auditEvent = async ({
  userId = null,
  action,
  resource = null,
  resourceId = null,
  req = null,
  metadata = {}
}) => {
  if (!action) return;
  try {
    const forwarded = req?.headers?.["x-forwarded-for"];
    const ipAddress = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || req?.ip || "").split(",")[0].trim() || null;
    const userAgent = req?.headers?.["user-agent"] || null;
    await pool.query(
      `INSERT INTO administrator_audit_log
        (actor_user_id, actor_role, action, entity_type, entity_id, request_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        userId,
        normalizeRole(req?.user?.role) || "system",
        action,
        resource,
        resourceId,
        req?.headers?.["x-request-id"] || null,
        JSON.stringify({ ipAddress, userAgent, ...metadata })
      ]
    );
  } catch (error) {
    console.error("Administrator audit log write failed:", error);
  }
};

// server.ts
var import_fs3 = __toESM(require("fs"), 1);
var import_crypto19 = __toESM(require("crypto"), 1);
var import_multer2 = __toESM(require("multer"), 1);

// src/routes/adminHqRoutes.ts
var import_express = require("express");
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);

// src/controllers/adminHqController.ts
var pool2;
var setDbPool = (dbPool) => {
  pool2 = dbPool;
};
var updateServiceContent = async (req, res) => {
  const { serviceId } = req.params;
  const { content, action_url } = req.body || {};
  if (!serviceId || typeof serviceId !== "string") {
    return res.status(400).json({ success: false, error: "A valid service ID is required." });
  }
  if (content !== void 0 && (typeof content !== "object" || Array.isArray(content) || content === null)) {
    return res.status(400).json({ success: false, error: "Content must be a JSON object." });
  }
  if (action_url !== void 0 && action_url !== null && typeof action_url !== "string") {
    return res.status(400).json({ success: false, error: "Action URL must be a string." });
  }
  try {
    const result = await pool2.query(
      `INSERT INTO service_content (service_id, content, action_url, updated_at)
       VALUES ($1, $2::jsonb, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (service_id) DO UPDATE SET
         content = EXCLUDED.content,
         action_url = EXCLUDED.action_url,
         updated_at = CURRENT_TIMESTAMP
       RETURNING service_id, content, action_url, updated_at`,
      [serviceId, JSON.stringify(content || {}), action_url ?? null]
    );
    const row = result.rows[0];
    await auditEvent({
      action: "service_content_updated",
      resource: "service_content",
      resourceId: serviceId,
      userId: String(req.user?.id || ""),
      req,
      metadata: { hasContent: content !== void 0, hasActionUrl: action_url !== void 0 }
    });
    return res.json({ success: true, data: row, message: "Service content updated successfully." });
  } catch (error) {
    console.error("Error updating service content:", error);
    return res.status(500).json({ success: false, error: "Failed to update service content." });
  }
};

// src/routes/adminHqRoutes.ts
var router = (0, import_express.Router)();
var adminLoginLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many administrator login attempts. Please try again later." }
});
router.post("/api/auth/admin-login", adminLoginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    const normalizedIdentifier = String(identifier || "").trim().toLowerCase();
    if (!normalizedIdentifier || !password) {
      await auditEvent({ action: "admin_login_failed", resource: "administrator", req, metadata: { reason: "missing_credentials" } });
      return res.status(401).json({ success: false, error: "Invalid administrator credentials." });
    }
    const result = await pool.query(
      `SELECT id, username, password_hash FROM admin_credentials WHERE LOWER(username)=LOWER($1) LIMIT 1`,
      [normalizedIdentifier]
    );
    if (!result.rows.length) {
      await auditEvent({ action: "admin_login_failed", resource: "administrator", req, metadata: { reason: "unknown_identifier" } });
      return res.status(401).json({ success: false, error: "Invalid administrator credentials." });
    }
    const credential = result.rows[0];
    const valid = await import_bcryptjs.default.compare(String(password), credential.password_hash);
    if (!valid) {
      await auditEvent({ action: "admin_login_failed", resource: "administrator", req, metadata: { reason: "invalid_password", username: normalizedIdentifier } });
      return res.status(401).json({ success: false, error: "Invalid administrator credentials." });
    }
    const user = { id: String(credential.id), name: "System Administrator", role: "admin" };
    const token = import_jsonwebtoken2.default.sign(user, JWT_SECRET, { expiresIn: "7d" });
    try {
      await pool.query(
        `INSERT INTO sessions(id,user_id,token,expires_at) VALUES($1,$2,$3,NOW()+INTERVAL '7 days') ON CONFLICT(id) DO NOTHING`,
        [`admin-${Date.now()}`, user.id, token]
      );
    } catch (e) {
      console.error("Administrator session tracking failed:", e);
      return res.status(503).json({ success: false, error: "Administrator session service is temporarily unavailable." });
    }
    await auditEvent({ action: "admin_login_success", resource: "administrator", userId: user.id, req });
    return res.json({ success: true, user, token });
  } catch (error) {
    console.error("Administrator login error:", error);
    return res.status(500).json({ success: false, error: "Administrator login failed." });
  }
});
router.all("/api/admin-setup", (_req, res) => res.status(410).json({ success: false, error: "Administrator setup endpoint has been retired." }));
var admin = [authenticateToken, requireAdmin];
router.get("/api/admin/volunteers", ...admin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const count = await pool.query(`SELECT COUNT(*)::int AS count FROM volunteers`);
    const result = await pool.query(`SELECT id,username,registration_number,full_name AS name,father_husband_name,mother_name,approval_status AS status,dob,mobile,email,blood_group,country,state,city,address,pincode,area_locality,sansad_kshetra,vidhan_sabha,ward_no,created_at FROM volunteers ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    return res.json({ success: true, data: result.rows, totalPages: Math.ceil(count.rows[0].count / limit), currentPage: page, totalCount: count.rows[0].count });
  } catch (error) {
    console.error("Admin volunteers error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch volunteers." });
  }
});
router.put("/api/admin/volunteers/:id/status", ...admin, async (req, res) => {
  try {
    const status = String(req.body?.status || "").toLowerCase();
    if (!["pending", "approved", "rejected", "inactive"].includes(status)) return res.status(400).json({ success: false, error: "Invalid volunteer status." });
    const result = await pool.query(`UPDATE volunteers SET approval_status=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING id,username,registration_number,full_name AS name,approval_status AS status,updated_at`, [status, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: "Volunteer not found." });
    await auditEvent({ action: "volunteer_status_updated", resource: "volunteer", resourceId: String(req.params.id), userId: String(req.user?.id || ""), req, metadata: { status } });
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Admin volunteer status error:", error);
    return res.status(500).json({ success: false, error: "Failed to update volunteer status." });
  }
});
router.get("/api/admin/blood_donors", ...admin, async (_req, res) => {
  try {
    const result = await pool.query(`SELECT v.id,v.username,v.full_name AS name,v.mobile,v.email,m.blood_group,m.is_active,CONCAT_WS(', ',v.city,v.state) AS location,m.created_at FROM volunteer_blood_memberships m JOIN volunteers v ON v.id=m.volunteer_id ORDER BY m.updated_at DESC`);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Admin blood members error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch Blood Network members." });
  }
});
router.get("/api/admin/blood-network/requests", ...admin, async (_req, res) => {
  try {
    const result = await pool.query(`SELECT r.*,v.full_name AS requester_name,v.mobile AS requester_mobile FROM blood_requests r LEFT JOIN volunteers v ON v.id=r.requester_id ORDER BY r.created_at DESC LIMIT 200`);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch Blood Network requisitions." });
  }
});
router.get("/api/admin/blood-network/summary", ...admin, async (_req, res) => {
  try {
    const [members, groups, requests] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE is_active)::int AS active FROM volunteer_blood_memberships`),
      pool.query(`SELECT blood_group,COUNT(*)::int AS count FROM volunteer_blood_memberships WHERE is_active=TRUE GROUP BY blood_group ORDER BY blood_group`),
      pool.query(`SELECT COUNT(*) FILTER(WHERE status='open')::int AS open,COUNT(*) FILTER(WHERE status='cancelled')::int AS cancelled,COUNT(*)::int AS total FROM blood_requests`)
    ]);
    return res.json({ success: true, data: { members: members.rows[0], groups: groups.rows, requests: requests.rows[0] } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to load Blood Network summary." });
  }
});
router.get("/api/admin/system/diagnostics", ...admin, async (_req, res) => {
  try {
    const required2 = {
      volunteers: ["id", "username", "full_name", "password_hash", "approval_status", "mobile", "email", "blood_group", "created_at", "updated_at"],
      users: ["id", "username", "name", "email", "phone", "role"],
      service_content: ["service_id", "content", "action_url", "updated_at"],
      app_settings: ["id"],
      admin_credentials: ["id", "username", "password_hash"],
      sessions: ["id", "user_id", "token", "expires_at"],
      volunteer_blood_memberships: ["volunteer_id", "blood_group", "is_active"],
      blood_requests: ["id", "requester_id", "blood_group", "status", "created_at"],
      grievances: ["id", "status", "created_at"],
      donations: ["created_at"],
      card_applications: ["created_at"],
      health_camps: ["date"]
    };
    const tables = Object.keys(required2);
    const tableRows = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema=current_schema() AND table_name = ANY($1::text[])`, [tables]);
    const presentTables = new Set(tableRows.rows.map((r) => r.table_name));
    const columnRows = await pool.query(`SELECT table_name,column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name = ANY($1::text[])`, [tables]);
    const columnsByTable = {};
    for (const row of columnRows.rows) (columnsByTable[row.table_name] ||= /* @__PURE__ */ new Set()).add(row.column_name);
    const checks = tables.map((table) => ({ table, present: presentTables.has(table), missing: required2[table].filter((column) => !columnsByTable[table]?.has(column)) }));
    const failed = checks.filter((check) => !check.present || check.missing.length > 0);
    return res.json({ success: failed.length === 0, data: { status: failed.length === 0 ? "healthy" : "attention_required", checks, checkedAt: (/* @__PURE__ */ new Date()).toISOString() } });
  } catch (error) {
    console.error("Admin diagnostics error:", error);
    return res.status(500).json({ success: false, error: "Unable to run system diagnostics." });
  }
});
router.put("/services/:serviceId/content", ...admin, updateServiceContent);
var adminHqRoutes_default = router;

// src/routes/authRoutes.ts
var import_express2 = __toESM(require("express"), 1);

// src/lib/mailer.ts
var import_axios2 = __toESM(require("axios"), 1);
var SMTP2GO_API_BASE_URL = "https://api.smtp2go.com/v3/";
var SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY;
var DEFAULT_SENDER = process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org";
async function sendEmail({ to, subject, text, html, from }) {
  if (!SMTP2GO_API_KEY) {
    console.error("SMTP2GO_API_KEY not set in environment \u2014 cannot send email");
    throw new Error("Email service not configured");
  }
  const toList = Array.isArray(to) ? to : [to];
  const payload = {
    sender: from || `RP Foundation <${DEFAULT_SENDER}>`,
    to: toList,
    subject
  };
  if (text) payload.text_body = text;
  if (html) payload.html_body = html;
  const url = new URL("email/send", SMTP2GO_API_BASE_URL).toString();
  const response = await import_axios2.default.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "X-Smtp2go-Api-Key": SMTP2GO_API_KEY,
      "Accept": "application/json"
    }
  });
  if (response.data?.data?.failed) {
    console.error("SMTP2GO send failures:", response.data.data.failures);
  }
  return response.data;
}

// src/routes/authRoutes.ts
var import_jsonwebtoken3 = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_server = require("@simplewebauthn/server");
var router2 = import_express2.default.Router();
router2.get("/api/auth/fix-db", async (req, res) => {
  try {
    await pool.query("ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE");
    await pool.query("ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending'");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE");
    res.send("<h1>Database Patched Successfully!</h1><p>You can now go back and register volunteers.</p>");
  } catch (err) {
    res.status(500).send("Error patching db: " + err.message);
  }
});
router2.get("/api/auth/debug-db", async (req, res) => {
  try {
    let result = {};
    try {
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE");
      result.users_alter = "Success";
    } catch (e) {
      result.users_alter_error = e.message;
    }
    try {
      await pool.query("ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE");
      result.vol_alter = "Success";
    } catch (e) {
      result.vol_alter_error = e.message;
    }
    try {
      const vol = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", ["volunteers"]);
      result.vol_columns = vol.rows;
      const usr = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", ["users"]);
      result.usr_columns = usr.rows;
    } catch (e) {
      result.schema_error = e.message;
    }
    res.json({ success: true, result });
  } catch (err) {
    res.json({ success: false, code: err.code, message: err.message, stack: err.stack });
  }
});
var USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
var RESERVED_USERNAMES = /* @__PURE__ */ new Set(["admin", "root", "superuser", "system", "moderator", "guest", "anonymous"]);
var rpName = "RP Foundation";
var rpID = process.env.WEBAUTHN_RP_ID?.trim() || (() => {
  if (process.env.NODE_ENV === "production") console.error("CRITICAL WARNING: WEBAUTHN_RP_ID missing in production.");
  return "localhost";
})();
var originUrl = process.env.WEBAUTHN_ORIGIN?.trim() || (() => {
  if (process.env.NODE_ENV === "production") console.error("CRITICAL WARNING: WEBAUTHN_ORIGIN missing in production.");
  return "http://localhost:5173";
})();
var publicAppUrl = process.env.PUBLIC_APP_URL?.trim() || (() => {
  if (process.env.NODE_ENV === "production") console.error("CRITICAL WARNING: PUBLIC_APP_URL missing in production.");
  return "http://localhost:5173";
})();
var webAuthnChallengeStore = /* @__PURE__ */ new Map();
router2.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const password_hash = await import_bcryptjs2.default.hash(password, 10);
    const userId = "citizen-" + Date.now();
    await pool.query(
      `INSERT INTO users (id, name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5, 'citizen')`,
      [userId, name, email, phone, password_hash]
    );
    const userPayload = { id: userId, role: "citizen", name };
    const token = import_jsonwebtoken3.default.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });
    await pool.query(
      `INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      ["sess-" + Date.now(), userId, token]
    );
    res.json({ success: true, token, user: userPayload });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router2.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, identifier, password, role } = req.body;
    if (role === "guest") {
      const guestId = "guest_" + Date.now() + import_crypto.default.randomBytes(3).toString("hex");
      const guestUser = { id: guestId, name: "Guest User", role: "guest" };
      const token2 = import_jsonwebtoken3.default.sign(guestUser, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ success: true, user: guestUser, token: token2 });
    }
    const finalIdentifier = identifier || phone;
    if (!finalIdentifier || !password) {
      return res.status(400).json({ success: false, error: "Missing identifier/phone or password" });
    }
    if (finalIdentifier === "admin") {
      const adminCredRes = await pool.query(`SELECT * FROM admin_credentials WHERE username = $1`, [finalIdentifier]);
      if (adminCredRes.rows.length > 0) {
        const adminRow = adminCredRes.rows[0];
        const adminPasswordValid = await import_bcryptjs2.default.compare(password, adminRow.password_hash);
        if (adminPasswordValid) {
          const adminUser = { id: "usr_staff_admin", name: "System Administrator", role: "admin" };
          const token2 = import_jsonwebtoken3.default.sign(adminUser, JWT_SECRET, { expiresIn: "7d" });
          return res.json({ success: true, user: adminUser, token: token2 });
        }
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }
    }
    let user = null;
    let isVolunteer = false;
    let validPassword = false;
    const volResult = await pool.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1) OR LOWER(registration_number) = LOWER($1)`,
      [finalIdentifier]
    );
    if (volResult.rows.length > 0) {
      user = volResult.rows[0];
      isVolunteer = true;
      if (user.password_hash) {
        if (user.password_hash.startsWith("$2")) {
          validPassword = await import_bcryptjs2.default.compare(password, user.password_hash);
        } else {
          const oldHash = import_crypto.default.createHash("sha256").update(password).digest("hex");
          validPassword = oldHash === user.password_hash;
        }
      } else {
        const userResult = await pool.query(`SELECT password_hash FROM users WHERE id = $1`, [user.id]);
        if (userResult.rows.length > 0 && userResult.rows[0].password_hash) {
          validPassword = await import_bcryptjs2.default.compare(password, userResult.rows[0].password_hash);
        }
      }
    } else {
      const userResult = await pool.query(
        `SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR phone = $1 OR LOWER(username) = LOWER($1)`,
        [finalIdentifier]
      );
      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        if (user.password_hash) validPassword = await import_bcryptjs2.default.compare(password, user.password_hash);
      }
    }
    if (!user) return res.status(401).json({ success: false, error: "User not found" });
    if (!validPassword) return res.status(401).json({ success: false, error: "Invalid credentials" });
    const userPayload = isVolunteer ? { id: user.id, role: "volunteer", name: user.full_name, phone: user.mobile, email: user.email } : { id: user.id, role: user.role || "citizen", name: user.name, phone: user.phone, email: user.email };
    const token = import_jsonwebtoken3.default.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });
    try {
      await pool.query(
        `INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '7 days') ON CONFLICT (id) DO NOTHING`,
        ["sess-" + Date.now(), user.id, token]
      );
      await auditEvent({
        userId: user.id,
        action: "login_success",
        req,
        metadata: { role: userPayload.role, identifier: finalIdentifier }
      });
    } catch (e) {
      console.warn("Session tracking failed (ignoring):", e.message);
    }
    res.json({ success: true, token, user: userPayload });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
router2.post("/api/auth/logout", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      const decoded = import_jsonwebtoken3.default.decode(token);
      if (decoded && decoded.id) {
        await auditEvent({
          userId: decoded.id,
          action: "logout",
          req
        });
      }
      await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
    }
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router2.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (req.user.role === "guest" || req.user.role === "admin" || req.user.role === "super_admin") {
      return res.json({
        success: true,
        user: {
          id: userId,
          name: req.user.role === "guest" ? "Guest User" : "System Admin",
          role: req.user.role,
          janSevaCardStatus: "none",
          points: 0,
          badges: 0
        }
      });
    }
    let result = await pool.query(`SELECT id, username, name, role, email, phone, avatar, cover FROM users WHERE id = $1`, [userId]);
    if (result.rows.length === 0) {
      const volResult = await pool.query(`SELECT id, username, registration_number, full_name as name, email, mobile as phone, avatar, cover FROM volunteers WHERE id = $1`, [userId]);
      if (volResult.rows.length === 0) return res.status(404).json({ success: false, error: "User not found" });
      const vol = volResult.rows[0];
      return res.json({ success: true, user: { ...vol, role: "volunteer", isVolunteer: true, volunteerData: vol } });
    }
    const user = result.rows[0];
    if (user.phone || user.email) {
      const volResult = await pool.query(`SELECT * FROM volunteers WHERE mobile = $1 OR email = $2`, [user.phone, user.email]);
      if (volResult.rows.length > 0) {
        user.volunteerData = volResult.rows[0];
        user.isVolunteer = true;
      }
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router2.post("/api/auth/profile/update", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar } = req.body;
    await pool.query(`UPDATE users SET name = $1, avatar = $2 WHERE id = $3`, [name, avatar, userId]);
    await pool.query(`UPDATE volunteers SET full_name = $1, avatar = $2 WHERE id = $3`, [name, avatar, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router2.get("/api/auth/check-username", async (req, res) => {
  try {
    const usernameRaw = (req.query.username || "").trim();
    const username = usernameRaw.toLowerCase();
    if (!username) return res.status(400).json({ available: false, error: "Username is required" });
    if (!USERNAME_REGEX.test(username)) return res.status(200).json({ available: false, error: "Use 3-20 letters, numbers, . or _, starting with a letter" });
    if (RESERVED_USERNAMES.has(username)) return res.json({ available: false, error: "This username is reserved" });
    const volResult = await pool.query(`SELECT id FROM volunteers WHERE LOWER(username) = $1`, [username]);
    const userResult = await pool.query(`SELECT id FROM users WHERE LOWER(username) = $1`, [username]);
    res.json({ available: volResult.rows.length === 0 && userResult.rows.length === 0 });
  } catch (err) {
    console.error("Check Username Error:", err);
    res.status(500).json({ available: false, error: `DB Error: ${err.message}` });
  }
});
router2.post("/api/auth/register-volunteer", async (req, res) => {
  try {
    const data = req.body;
    if (!data.full_name || !data.full_name.trim()) return res.status(400).json({ error: "Full name is required." });
    if (!data.mobile || !data.mobile.trim()) return res.status(400).json({ error: "Mobile number is required." });
    if (!data.password || data.password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
    let usernameRaw = (data.username || "").trim().toLowerCase();
    if (!usernameRaw) usernameRaw = (data.mobile || "").trim().toLowerCase();
    if (!usernameRaw) return res.status(400).json({ error: "Please choose a username or provide a mobile number." });
    const isPhone = /^[0-9+]{10,15}$/.test(usernameRaw);
    if (!isPhone && !USERNAME_REGEX.test(usernameRaw)) return res.status(400).json({ error: "Username must be 3-20 characters (letters, numbers, . or _), starting with a letter." });
    if (RESERVED_USERNAMES.has(usernameRaw)) return res.status(400).json({ error: "This username is reserved. Please choose another." });
    const volCheck = await pool.query(`SELECT id FROM volunteers WHERE LOWER(username) = $1`, [usernameRaw]);
    const userCheck = await pool.query(`SELECT id FROM users WHERE LOWER(username) = $1`, [usernameRaw]);
    if (volCheck.rows.length > 0 || userCheck.rows.length > 0) return res.status(409).json({ error: "This username is already in use. Please choose another." });
    const id = import_crypto.default.randomUUID();
    const yearStr = (/* @__PURE__ */ new Date()).getFullYear().toString().slice(-2);
    const randomNum = import_crypto.default.randomInt(1e3, 1e4);
    const regNumber = `RPF/VOL/${yearStr}/${randomNum}`;
    const passwordHash = await import_bcryptjs2.default.hash(data.password, 10);
    const safeDob = data.dob && data.dob.trim() ? data.dob : null;
    await pool.query(`
      INSERT INTO volunteers (
        id, username, registration_number, full_name, father_husband_name, mother_name, approval_status,
        dob, mobile, email, education, blood_group, skills, reason_for_joining, availability,
        national_id_1, national_id_2, country, state, city, address, pincode, area_locality,
        sansad_kshetra, vidhan_sabha, ward_no, password_hash
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      )
    `, [
      id,
      usernameRaw,
      regNumber,
      data.full_name,
      data.father_husband_name,
      data.mother_name,
      "pending",
      safeDob,
      data.mobile,
      data.email || null,
      JSON.stringify(data.education || []),
      data.blood_group,
      JSON.stringify(data.skills || []),
      data.reason_for_joining,
      data.availability,
      data.national_id_1 || null,
      data.national_id_2 || null,
      data.country,
      data.state,
      data.city,
      data.address,
      data.pincode,
      data.area_locality || null,
      data.sansad_kshetra,
      data.vidhan_sabha,
      data.ward_no,
      passwordHash
    ]);
    res.json({ success: true, registration_number: regNumber, username: usernameRaw });
  } catch (err) {
    console.error("Register Error:", err);
    if (err.code === "23505") {
      const constraint = (err.constraint || "").toLowerCase();
      if (constraint.includes("username")) return res.status(409).json({ error: "This username is already in use. Please choose another." });
      if (constraint.includes("mobile")) return res.status(409).json({ error: "This mobile number is already registered." });
      if (constraint.includes("email")) return res.status(409).json({ error: "This email is already registered." });
      return res.status(409).json({ error: "Some of your details are already registered." });
    }
    if (err.code === "22007" || err.code === "22008") return res.status(400).json({ error: "Date of birth is invalid. Please re-select it." });
    res.status(500).json({ error: err.message || "Registration failed. Please try again." });
  }
});
router2.post("/api/auth/reset-ticket", async (req, res) => {
  try {
    const { identifier } = req.body;
    await pool.query(`CREATE TABLE IF NOT EXISTS admin_reset_tickets (id SERIAL PRIMARY KEY, identifier VARCHAR(255) NOT NULL, status VARCHAR(50) DEFAULT 'pending', created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`);
    await pool.query(`INSERT INTO admin_reset_tickets (identifier) VALUES ($1)`, [identifier]);
    res.json({ success: true, message: "Admin reset ticket created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router2.get("/api/auth/webauthn/register-options", async (req, res) => {
  try {
    const userId = req.query.userId;
    const userResult = await pool.query(`SELECT username, full_name FROM volunteers WHERE id = $1`, [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = userResult.rows[0];
    const options = await (0, import_server.generateRegistrationOptions)({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(userId)),
      userName: user.username,
      userDisplayName: user.full_name,
      attestationType: "none",
      authenticatorSelection: { residentKey: "required", userVerification: "preferred" }
    });
    webAuthnChallengeStore.set(userId, options.challenge);
    res.json(options);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router2.post("/api/auth/webauthn/register-verify", async (req, res) => {
  const { userId, response } = req.body;
  const expectedChallenge = webAuthnChallengeStore.get(userId);
  if (!expectedChallenge) return res.status(400).json({ error: "Challenge expired" });
  try {
    const verification = await (0, import_server.verifyRegistrationResponse)({ response, expectedChallenge, expectedOrigin: originUrl, expectedRPID: rpID });
    if (verification.verified && verification.registrationInfo) {
      const { id: credentialID, publicKey: credentialPublicKey, counter } = verification.registrationInfo.credential;
      const base64CredID = Buffer.from(credentialID).toString("base64");
      const base64PubKey = Buffer.from(credentialPublicKey).toString("base64");
      await pool.query(`INSERT INTO passkeys ("credentialID", "publicKey", counter, "userId") VALUES ($1, $2, $3, $4)`, [base64CredID, base64PubKey, counter, userId]);
      webAuthnChallengeStore.delete(userId);
      res.json({ success: true });
    } else res.status(400).json({ error: "Verification failed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router2.post("/api/auth/webauthn/login-options", async (req, res) => {
  const { identifier } = req.body;
  const userResult = await pool.query(`SELECT id FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`, [identifier]);
  if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
  const userId = userResult.rows[0].id;
  const passkeysResult = await pool.query(`SELECT "credentialID" FROM passkeys WHERE "userId" = $1`, [userId]);
  const allowCredentials = passkeysResult.rows.map((row) => ({ id: row.credentialID, type: "public-key", transports: ["internal", "hybrid"] }));
  const options = await (0, import_server.generateAuthenticationOptions)({ rpID, allowCredentials, userVerification: "preferred" });
  webAuthnChallengeStore.set(userId, options.challenge);
  res.json({ options, userId });
});
router2.post("/api/auth/webauthn/login-verify", async (req, res) => {
  const { userId, response } = req.body;
  const expectedChallenge = webAuthnChallengeStore.get(userId);
  if (!expectedChallenge) return res.status(400).json({ error: "Challenge expired" });
  try {
    const passkeyResult = await pool.query(`SELECT * FROM passkeys WHERE "credentialID" = $1 AND "userId" = $2`, [response.id, userId]);
    if (passkeyResult.rows.length === 0) return res.status(404).json({ error: "Passkey not found" });
    const passkey = passkeyResult.rows[0];
    const verification = await (0, import_server.verifyAuthenticationResponse)({
      response,
      expectedChallenge,
      expectedOrigin: originUrl,
      expectedRPID: rpID,
      credential: { id: passkey.credentialID, publicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64")), counter: Number(passkey.counter) }
    });
    if (verification.verified) {
      await pool.query(`UPDATE passkeys SET counter = $1 WHERE "credentialID" = $2`, [verification.authenticationInfo.newCounter, passkey.credentialID]);
      webAuthnChallengeStore.delete(userId);
      const userResult = await pool.query(`SELECT * FROM volunteers WHERE id = $1`, [userId]);
      const user = userResult.rows[0];
      res.json({ success: true, user: { id: user.id, name: user.full_name, phone: user.mobile, email: user.email, role: "volunteer" } });
    } else res.status(400).json({ error: "Verification failed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router2.post("/api/auth/login-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Invalid email" });
    const otp = import_crypto.default.randomInt(1e5, 1e6).toString();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(
      `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,
      [email, otp]
    );
    await sendEmail({
      to: email,
      subject: "Your Jan Seva Login OTP",
      text: `Your OTP for RP Foundation Jan Seva is: ${otp}. It is valid for 10 minutes.`,
      html: `<b>Your OTP for RP Foundation Jan Seva is: <span style="color: #FF9933; font-size: 1.5em;">${otp}</span></b><br/><p>It is valid for 10 minutes.</p>`
    });
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: err.message });
  }
});
router2.post("/api/auth/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Phone/email and OTP are required" });
    const result = await pool.query(
      `SELECT * FROM otps WHERE phone = $1 AND otp = $2 AND "createdAt" >= NOW() - INTERVAL '10 minutes'`,
      [phone, otp]
    );
    if (result.rows.length > 0) {
      await pool.query("DELETE FROM otps WHERE phone = $1", [phone]);
      return res.json({ success: true });
    }
    await pool.query(`DELETE FROM otps WHERE phone = $1 AND "createdAt" < NOW() - INTERVAL '10 minutes'`, [phone]);
    res.status(401).json({ error: "Invalid or expired OTP" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var authRoutes_default = router2;

// src/routes/passwordResetSecure.ts
var import_express3 = __toESM(require("express"), 1);
var import_crypto2 = __toESM(require("crypto"), 1);
var import_bcryptjs3 = __toESM(require("bcryptjs"), 1);
var router3 = import_express3.default.Router();
var RESET_TTL_MINUTES = 15;
var RESET_TTL_SQL = `${RESET_TTL_MINUTES} minutes`;
function hashResetToken(token) {
  return import_crypto2.default.createHash("sha256").update(token, "utf8").digest("hex");
}
function genericResetResponse(res) {
  return res.json({
    success: true,
    message: "If the account exists and has a registered email address, a password reset link has been sent."
  });
}
router3.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const identifier = typeof req.body?.identifier === "string" ? req.body.identifier.trim() : "";
    if (!identifier) return genericResetResponse(res);
    const result = await pool.query(
      `SELECT id, email
         FROM volunteers
        WHERE mobile = $1
           OR LOWER(email) = LOWER($1)
           OR LOWER(username) = LOWER($1)
           OR LOWER(registration_number) = LOWER($1)
        LIMIT 1`,
      [identifier]
    );
    if (result.rows.length === 0 || !result.rows[0].email) return genericResetResponse(res);
    const user = result.rows[0];
    const rawToken = import_crypto2.default.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1e3);
    const requestIp = req.ip || null;
    const userAgent = req.get("user-agent") || null;
    await pool.query(
      `UPDATE password_reset_tokens
          SET used_at = NOW()
        WHERE user_id = $1
          AND used_at IS NULL`,
      [user.id]
    );
    await pool.query(
      `INSERT INTO password_reset_tokens
        (user_id, token_hash, expires_at, request_ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, tokenHash, expiresAt.toISOString(), requestIp, userAgent]
    );
    const publicAppUrl2 = process.env.PUBLIC_APP_URL?.trim();
    if (!publicAppUrl2) {
      throw new Error("PUBLIC_APP_URL must be configured for password reset emails.");
    }
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Click here to reset your password: ${publicAppUrl2}/reset-password?token=${encodeURIComponent(rawToken)}`
    });
    return genericResetResponse(res);
  } catch (err) {
    console.error("Password reset request failed:", err);
    return genericResetResponse(res);
  }
});
router3.post("/api/auth/set-password", async (req, res) => {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    const password = req.body?.password;
    if (!token || typeof password !== "string") {
      return res.status(400).json({ error: "Reset token and new password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const tokenHash = hashResetToken(token);
    const tokenRes = await pool.query(
      `SELECT id, user_id
         FROM password_reset_tokens
        WHERE token_hash = $1
          AND used_at IS NULL
          AND expires_at > NOW()
        LIMIT 1`,
      [tokenHash]
    );
    if (tokenRes.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    const resetToken = tokenRes.rows[0];
    const passwordHash = await import_bcryptjs3.default.hash(password, 10);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `UPDATE volunteers
            SET password_hash = $1
          WHERE id = $2
        RETURNING id`,
        [passwordHash, resetToken.user_id]
      );
      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "User not found" });
      }
      const consumed = await client.query(
        `UPDATE password_reset_tokens
            SET used_at = NOW()
          WHERE user_id = $1
            AND used_at IS NULL
            AND (id = $2 OR expires_at <= NOW() OR token_hash = $3)
          RETURNING id`,
        [resetToken.user_id, resetToken.id, tokenHash]
      );
      if (consumed.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      await client.query("DELETE FROM sessions WHERE user_id = $1", [resetToken.user_id]);
      await auditEvent({
        userId: resetToken.user_id,
        action: "password_reset_completed",
        req
      });
      await client.query("COMMIT");
    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    } finally {
      client.release();
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Password reset completion failed:", err);
    return res.status(500).json({ error: "Unable to reset password right now. Please try again." });
  }
});
var passwordResetSecure_default = router3;

// src/routes/livenessRoutes.ts
var import_express4 = __toESM(require("express"), 1);
var import_crypto3 = __toESM(require("crypto"), 1);
var router4 = import_express4.default.Router();
router4.get("/api/liveness", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "rpf-app",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router4.get("/api/health-vitals", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM health_vitals WHERE user_id = $1", [req.user.id]);
    return res.json({ success: true, data: result.rows[0] ?? null });
  } catch (error) {
    console.error("health-vitals read failed:", error);
    return res.status(500).json({ success: false, error: "Unable to load health data" });
  }
});
router4.post("/api/health-vitals", authenticateToken, async (req, res) => {
  try {
    const allowedFields = [
      "steps",
      "water_cups",
      "calories",
      "exercise_mins",
      "weight",
      "height",
      "bmi",
      "sleep_hours",
      "heart_rate",
      "sleep_cycle",
      "period_day",
      "pregnancy_week"
    ];
    const values = {};
    for (const field of allowedFields) {
      if (req.body?.[field] !== void 0 && req.body?.[field] !== null) values[field] = req.body[field];
    }
    if (Object.keys(values).length === 0) {
      return res.status(400).json({ success: false, error: "At least one health value is required" });
    }
    const columns = Object.keys(values);
    const params = [req.user.id, ...columns.map((column) => values[column])];
    const insertColumns = ["user_id", ...columns, "updated_at"];
    const placeholders = ["$1", ...columns.map((_, index) => `$${index + 2}`), "NOW()"];
    const updates = columns.map((column, index) => `"${column}" = $${index + 2}`).join(", ");
    await pool.query(
      `INSERT INTO health_vitals (${insertColumns.map((column) => `"${column}"`).join(", ")})
       VALUES (${placeholders.join(", ")})
       ON CONFLICT (user_id) DO UPDATE SET ${updates}, updated_at = NOW()`,
      params
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("health-vitals write failed:", error);
    return res.status(500).json({ success: false, error: "Unable to save health data" });
  }
});
router4.get("/api/pediatric", authenticateToken, async (req, res) => {
  try {
    const [profile, vaccines] = await Promise.all([
      pool.query("SELECT * FROM pediatric_profile WHERE user_id = $1", [req.user.id]),
      pool.query("SELECT * FROM vaccine_status WHERE user_id = $1", [req.user.id])
    ]);
    return res.json({ success: true, profile: profile.rows[0] ?? null, vaccines: vaccines.rows });
  } catch (error) {
    console.error("pediatric read failed:", error);
    return res.status(500).json({ success: false, error: "Unable to load child health data" });
  }
});
router4.post("/api/blood_donors", authenticateToken, async (req, res) => {
  try {
    const { name, bloodGroup, phone, location, lastDonated } = req.body ?? {};
    if (!name || !bloodGroup || !phone) {
      return res.status(400).json({ success: false, error: "Name, blood group and phone are required" });
    }
    const id = import_crypto3.default.randomUUID();
    await pool.query(
      `INSERT INTO blood_donors
       (id, name, "bloodGroup", phone, location, verified, distance, "lastDonated", "createdAt")
       VALUES ($1, $2, $3, $4, $5, false, NULL, $6, NOW())`,
      [id, String(name).trim(), String(bloodGroup).trim().toUpperCase(), String(phone).trim(), location || null, lastDonated || null]
    );
    return res.status(201).json({ success: true, id });
  } catch (error) {
    console.error("blood donor registration failed:", error);
    return res.status(500).json({ success: false, error: "Unable to register donor" });
  }
});
var livenessRoutes_default = router4;

// src/routes/healthRoutes.ts
var import_express5 = __toESM(require("express"), 1);
var import_crypto4 = __toESM(require("crypto"), 1);
var import_axios3 = __toESM(require("axios"), 1);
var router5 = import_express5.default.Router();
router5.use(["/api/auth/fix-db", "/api/auth/debug-db"], (_req, res) => {
  return res.status(410).json({
    success: false,
    error: "This database maintenance endpoint has been retired."
  });
});
router5.get("/api/health-vitals", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM health_vitals WHERE user_id = $1",
      [req.user.id]
    );
    return res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error("Error fetching health vitals:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch health data" });
  }
});
router5.post("/api/health-vitals", authenticateToken, async (req, res) => {
  try {
    const {
      steps,
      water_cups,
      calories,
      exercise_mins,
      weight,
      height,
      bmi,
      sleep_hours,
      heart_rate,
      sleep_cycle,
      period_day,
      pregnancy_week
    } = req.body || {};
    await pool.query(
      `INSERT INTO health_vitals
       (user_id, steps, water_cups, calories, exercise_mins, weight, height, bmi,
        sleep_hours, heart_rate, sleep_cycle, period_day, pregnancy_week, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
       ON CONFLICT (user_id) DO UPDATE SET
        steps=COALESCE($2,health_vitals.steps),
        water_cups=COALESCE($3,health_vitals.water_cups),
        calories=COALESCE($4,health_vitals.calories),
        exercise_mins=COALESCE($5,health_vitals.exercise_mins),
        weight=COALESCE($6,health_vitals.weight),
        height=COALESCE($7,health_vitals.height),
        bmi=COALESCE($8,health_vitals.bmi),
        sleep_hours=COALESCE($9,health_vitals.sleep_hours),
        heart_rate=COALESCE($10,health_vitals.heart_rate),
        sleep_cycle=COALESCE($11,health_vitals.sleep_cycle),
        period_day=COALESCE($12,health_vitals.period_day),
        pregnancy_week=COALESCE($13,health_vitals.pregnancy_week),
        updated_at=NOW()`,
      [
        req.user.id,
        steps,
        water_cups,
        calories,
        exercise_mins,
        weight,
        height,
        bmi,
        sleep_hours,
        heart_rate,
        sleep_cycle,
        period_day,
        pregnancy_week
      ]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("Error saving health vitals:", error);
    return res.status(500).json({ success: false, error: "Unable to save health data" });
  }
});
router5.get("/api/medications", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM medications WHERE user_id = $1 ORDER BY created_at ASC",
      [req.user.id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching medications:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch medications" });
  }
});
router5.post("/api/medications", authenticateToken, async (req, res) => {
  try {
    const { name, alarm_time } = req.body || {};
    if (!String(name || "").trim()) {
      return res.status(400).json({ success: false, error: "Medication name is required" });
    }
    const id = import_crypto4.default.randomUUID();
    await pool.query(
      "INSERT INTO medications (id,user_id,name,alarm_time,taken) VALUES ($1,$2,$3,$4,false)",
      [id, req.user.id, String(name).trim(), alarm_time || null]
    );
    return res.status(201).json({ success: true, id });
  } catch (error) {
    console.error("Error creating medication:", error);
    return res.status(500).json({ success: false, error: "Unable to save medication" });
  }
});
router5.post("/api/medications/:id/toggle", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE medications SET taken = NOT taken WHERE id = $1 AND user_id = $2 RETURNING id,taken",
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, error: "Medication not found" });
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error toggling medication:", error);
    return res.status(500).json({ success: false, error: "Unable to update medication" });
  }
});
router5.delete("/api/medications/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM medications WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, error: "Medication not found" });
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting medication:", error);
    return res.status(500).json({ success: false, error: "Unable to delete medication" });
  }
});
router5.get("/api/pediatric", authenticateToken, async (req, res) => {
  try {
    const [profile, vaccines] = await Promise.all([
      pool.query("SELECT * FROM pediatric_profile WHERE user_id = $1", [req.user.id]),
      pool.query("SELECT * FROM vaccine_status WHERE user_id = $1", [req.user.id])
    ]);
    return res.json({
      success: true,
      profile: profile.rows[0] || null,
      vaccines: vaccines.rows
    });
  } catch (error) {
    console.error("Error fetching pediatric profile:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch child health data" });
  }
});
router5.post("/api/pediatric", authenticateToken, async (req, res) => {
  try {
    const { child_age, child_weight } = req.body || {};
    await pool.query(
      `INSERT INTO pediatric_profile (user_id,child_age,child_weight,updated_at)
       VALUES ($1,$2,$3,NOW())
       ON CONFLICT (user_id) DO UPDATE SET child_age=$2,child_weight=$3,updated_at=NOW()`,
      [req.user.id, child_age ?? null, child_weight ?? null]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("Error saving pediatric profile:", error);
    return res.status(500).json({ success: false, error: "Unable to save child health data" });
  }
});
router5.post("/api/pediatric/vaccine", authenticateToken, async (req, res) => {
  try {
    const { vaccine_name, done } = req.body || {};
    if (!String(vaccine_name || "").trim()) {
      return res.status(400).json({ success: false, error: "Vaccine name is required" });
    }
    const id = import_crypto4.default.randomUUID();
    await pool.query(
      `INSERT INTO vaccine_status (id,user_id,vaccine_name,done,updated_at)
       VALUES ($1,$2,$3,$4,NOW())
       ON CONFLICT (user_id,vaccine_name) DO UPDATE SET done=$4,updated_at=NOW()`,
      [id, req.user.id, String(vaccine_name).trim(), Boolean(done)]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("Error saving vaccine status:", error);
    return res.status(500).json({ success: false, error: "Unable to save vaccine status" });
  }
});
router5.get("/api/health_camps", async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,"titleEn","titleHi","dateEn","dateHi","locationEn","locationHi",contact,"registeredCount","createdAt" FROM health_camps ORDER BY "createdAt" DESC'
    );
    return res.json({ camps: result.rows });
  } catch (error) {
    console.error("Error fetching health camps:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch health camps" });
  }
});
router5.post("/api/health_camps/:id/register", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE health_camps SET "registeredCount"=COALESCE("registeredCount",0)+1
       WHERE id=$1
       RETURNING id,"titleEn","titleHi","dateEn","dateHi","locationEn","locationHi",contact,"registeredCount","createdAt"`,
      [req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, error: "Camp not found" });
    return res.json({ success: true, camp: result.rows[0] });
  } catch (error) {
    console.error("Error registering for health camp:", error);
    return res.status(500).json({ success: false, error: "Unable to register for camp" });
  }
});
router5.post("/api/health_camps", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body || {};
    if (!titleEn && !titleHi) return res.status(400).json({ success: false, error: "Camp title is required" });
    const id = import_crypto4.default.randomUUID();
    await pool.query(
      `INSERT INTO health_camps (id,"titleEn","titleHi","dateEn","dateHi","locationEn","locationHi",contact,"createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, titleEn || "", titleHi || "", dateEn || null, dateHi || null, locationEn || "", locationHi || "", contact || "", (/* @__PURE__ */ new Date()).toISOString()]
    );
    return res.status(201).json({ success: true, id });
  } catch (error) {
    console.error("Error creating health camp:", error);
    return res.status(500).json({ success: false, error: "Unable to create health camp" });
  }
});
router5.post("/api/health_camps/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body || {};
    const result = await pool.query(
      `UPDATE health_camps SET "titleEn"=$1,"titleHi"=$2,"dateEn"=$3,"dateHi"=$4,"locationEn"=$5,"locationHi"=$6,contact=$7 WHERE id=$8 RETURNING id`,
      [titleEn || "", titleHi || "", dateEn || null, dateHi || null, locationEn || "", locationHi || "", contact || "", req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, error: "Camp not found" });
    return res.json({ success: true });
  } catch (error) {
    console.error("Error editing health camp:", error);
    return res.status(500).json({ success: false, error: "Unable to update health camp" });
  }
});
router5.delete("/api/health_camps/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM health_camps WHERE id=$1 RETURNING id", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ success: false, error: "Camp not found" });
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting health camp:", error);
    return res.status(500).json({ success: false, error: "Unable to delete health camp" });
  }
});
router5.get("/api/blood_donors", async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,name,"bloodGroup",phone,location,verified,distance,"lastDonated" FROM blood_donors ORDER BY "createdAt" DESC'
    );
    return res.json({ donors: result.rows });
  } catch (error) {
    console.error("Error fetching blood donors:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch blood donors" });
  }
});
router5.post("/api/blood_donors", authenticateToken, async (req, res) => {
  try {
    const { name, bloodGroup, phone, location, lastDonated } = req.body || {};
    if (!String(name || "").trim() || !String(bloodGroup || "").trim() || !String(phone || "").trim()) {
      return res.status(400).json({ success: false, error: "Name, blood group and phone are required" });
    }
    const id = import_crypto4.default.randomUUID();
    await pool.query(
      `INSERT INTO blood_donors (id,name,"bloodGroup",phone,location,verified,distance,"lastDonated","createdAt")
       VALUES ($1,$2,$3,$4,$5,false,NULL,$6,$7)`,
      [id, String(name).trim(), String(bloodGroup).trim(), String(phone).trim(), String(location || "").trim(), lastDonated || null, (/* @__PURE__ */ new Date()).toISOString()]
    );
    return res.status(201).json({ success: true, id, verified: false });
  } catch (error) {
    console.error("Error creating blood donor:", error);
    return res.status(500).json({ success: false, error: "Unable to register as blood donor" });
  }
});
router5.get("/api/blood-banks", async (req, res) => {
  const apiKey = process.env.DATAGOV_API_KEY;
  const resourceId = process.env.DATAGOV_RESOURCE_ID || "fced6df9-a360-4e08-8ca0-f283fc74ce15";
  const searchQuery = String(req.query.search || "").toLowerCase().trim();
  if (apiKey) {
    try {
      const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${encodeURIComponent(apiKey)}&format=json&limit=250&filters[_state]=Madhya%20Pradesh`;
      const response = await import_axios3.default.get(url, { timeout: 1e4 });
      if (Array.isArray(response.data?.records)) {
        let mapped = response.data.records.map((item) => ({
          id: `ogd_${item.sr_no}`,
          name: item._blood_bank_name || "Unknown Blood Bank",
          phone: item._contact_no && !["NA", "N/A"].includes(item._contact_no) ? item._contact_no : item._mobile || "N/A",
          address: item._address || "N/A",
          city: item._city || item._district || "Madhya Pradesh",
          state: item._state || "Madhya Pradesh",
          pincode: item.pincode === "NA" ? "" : item.pincode || "",
          latitude: item._latitude,
          longitude: item._longitude,
          category: item._category || "General",
          service_time: item._service_time || "24x7",
          stock_a_plus: null,
          stock_a_minus: null,
          stock_b_plus: null,
          stock_b_minus: null,
          stock_ab_plus: null,
          stock_ab_minus: null,
          stock_o_plus: null,
          stock_o_minus: null
        }));
        if (searchQuery) {
          mapped = mapped.filter(
            (b) => b.name.toLowerCase().includes(searchQuery) || b.city.toLowerCase().includes(searchQuery) || b.address.toLowerCase().includes(searchQuery) || b.pincode.includes(searchQuery)
          );
        }
        return res.json(mapped);
      }
    } catch (error) {
      console.error("Data.gov.in blood-bank lookup failed:", error?.message || error);
    }
  }
  try {
    let sql = "SELECT * FROM blood_banks";
    const params = [];
    if (searchQuery) {
      sql += " WHERE LOWER(name) LIKE $1 OR LOWER(city) LIKE $1 OR LOWER(address) LIKE $1 OR pincode LIKE $1";
      params.push(`%${searchQuery}%`);
    }
    sql += " ORDER BY name ASC";
    const result = await pool.query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching blood banks:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch blood banks" });
  }
});
router5.get("/api/blood-requests/my", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM blood_requests WHERE user_id=$1 ORDER BY created_at DESC", [req.user.id]);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching blood requests:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch blood requests" });
  }
});
router5.post("/api/blood-requests", authenticateToken, async (req, res) => {
  try {
    const { bloodGroup, componentType, quantity, urgency, doctorName, notes } = req.body || {};
    if (!bloodGroup || !componentType) return res.status(400).json({ success: false, error: "Blood group and component type are required" });
    const id = `req_${import_crypto4.default.randomUUID().slice(0, 8)}`;
    await pool.query(
      `INSERT INTO blood_requests (id,user_id,blood_group,component_type,quantity,urgency,status,doctor_name,notes,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      [id, req.user.id, bloodGroup, componentType, parseInt(quantity, 10) || 1, urgency || "Normal", "Pending", doctorName || "", notes || ""]
    );
    return res.status(201).json({ success: true, id });
  } catch (error) {
    console.error("Error creating blood request:", error);
    return res.status(500).json({ success: false, error: "Unable to create blood request" });
  }
});
router5.get("/api/appointments/my", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, b.name AS "bloodBankName", b.phone AS "bloodBankPhone", b.address AS "bloodBankAddress"
       FROM blood_appointments a JOIN blood_banks b ON a.blood_bank_id=b.id
       WHERE a.user_id=$1 ORDER BY a.appointment_date DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch appointments" });
  }
});
router5.post("/api/appointments", authenticateToken, async (req, res) => {
  try {
    const { bloodBankId, appointmentDate, bloodGroup, notes } = req.body || {};
    if (!bloodBankId || !appointmentDate) return res.status(400).json({ success: false, error: "Blood bank and appointment date are required" });
    const id = `appt_${import_crypto4.default.randomUUID().slice(0, 8)}`;
    await pool.query(
      `INSERT INTO blood_appointments (id,user_id,blood_bank_id,appointment_date,blood_group,status,notes,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
      [id, req.user.id, bloodBankId, appointmentDate, bloodGroup || "", "Scheduled", notes || ""]
    );
    return res.status(201).json({ success: true, id });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ success: false, error: "Unable to create appointment" });
  }
});
router5.get("/api/health/dictionary", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ success: false, error: "Query is required" });
  const clientId = process.env.WHO_ICD_CLIENT_ID;
  const clientSecret = process.env.WHO_ICD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(503).json({ success: false, error: "Health dictionary service is not configured" });
  }
  try {
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await import_axios3.default.post(
      "https://icdaccessmanagement.who.int/connect/token",
      "grant_type=client_credentials&scope=icdapi_access",
      { headers: { Authorization: `Basic ${authString}`, "Content-Type": "application/x-www-form-urlencoded" }, timeout: 1e4 }
    );
    const searchRes = await import_axios3.default.get(
      `https://id.who.int/icd/release/11/2024-01/mms/search?q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${tokenRes.data.access_token}`, Accept: "application/json", "API-Version": "v2", "Accept-Language": "en" }, timeout: 1e4 }
    );
    return res.json({ success: true, data: searchRes.data?.destinationEntities?.slice(0, 10) || [] });
  } catch (error) {
    console.error("ICD API error:", error?.response?.data || error?.message || error);
    return res.status(502).json({ success: false, error: "Health dictionary service unavailable" });
  }
});
var healthRoutes_default = router5;

// src/routes/grievanceRoutes.ts
var import_express6 = __toESM(require("express"), 1);
var import_crypto5 = __toESM(require("crypto"), 1);
var router6 = import_express6.default.Router();
router6.post("/api/support_requests", async (req, res) => {
  try {
    const { citizenName, citizenPhone, requestType, location, description, status, createdAt } = req.body;
    const id = import_crypto5.default.randomUUID();
    await pool.query(
      `INSERT INTO support_requests (id, "citizenName", "citizenPhone", "requestType", location, description, status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, citizenName, citizenPhone, requestType, location, description, status, createdAt || /* @__PURE__ */ new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router6.post("/api/sos_alerts", async (req, res) => {
  try {
    const { citizenName, citizenPhone, location, status, createdAt } = req.body;
    const id = import_crypto5.default.randomUUID();
    await pool.query(
      `INSERT INTO sos_alerts (id, "citizenName", "citizenPhone", location, status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, citizenName, citizenPhone, location, status, createdAt || /* @__PURE__ */ new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router6.get("/api/grievances", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "audioUrl", "videoUrl", "imageUrl", created_at AS "createdAt" FROM grievances ORDER BY created_at DESC'
    );
    res.json({ grievances: result.rows });
  } catch (error) {
    console.error("Error fetching grievances:", error);
    res.status(500).json({ error: error.message });
  }
});
router6.post("/api/grievances", async (req, res) => {
  try {
    const { title, description, category, urgency, location, reportedBy, citizenName, status, date, aiSummary, audioUrl, videoUrl, imageUrl } = req.body;
    const id = import_crypto5.default.randomUUID();
    const result = await pool.query(
      `INSERT INTO grievances 
       (id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "audioUrl", "videoUrl", "imageUrl") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING id`,
      [
        id,
        title,
        description,
        category,
        urgency,
        location,
        reportedBy,
        status || "Pending",
        date || (/* @__PURE__ */ new Date()).toLocaleDateString(),
        aiSummary || "",
        audioUrl || "",
        videoUrl || "",
        imageUrl || ""
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error creating grievance:", error);
    res.status(500).json({ error: error.message });
  }
});
router6.post("/api/grievances/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    await pool.query("UPDATE grievances SET status = $1 WHERE id = $2", [status, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router6.delete("/api/grievances/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM grievances WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var grievanceRoutes_default = router6;

// src/routes/aiRoutes.ts
var import_express7 = __toESM(require("express"), 1);

// src/lib/externalSearch.ts
var import_axios4 = __toESM(require("axios"), 1);
var cheerio = __toESM(require("cheerio"), 1);
async function queryExternalSearch(searchQuery) {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const targetDomains = [
    "gov.in",
    "nic.in",
    "mp.gov.in",
    "bhaskar.com",
    "jagran.com",
    "ndtv.com",
    "timesofindia.indiatimes.com",
    "hindustantimes.com",
    "wikipedia.org"
  ];
  const browserHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Upgrade-Insecure-Requests": "1"
  };
  if (tavilyKey) {
    try {
      console.log(`[Search/Tier-1/Tavily] Querying: "${searchQuery}"`);
      const response = await import_axios4.default.post(
        "https://api.tavily.com/search",
        {
          api_key: tavilyKey,
          query: searchQuery,
          include_domains: targetDomains,
          max_results: 5
        },
        {
          timeout: 4e3
        }
      );
      const items = response.data.results ?? [];
      if (items.length > 0) {
        return items.slice(0, 3).map((item) => {
          let host = "";
          try {
            host = new URL(item.url).hostname;
          } catch {
            host = "tavily.com";
          }
          return {
            title: (item.title ?? "").slice(0, 120),
            link: item.url ?? "",
            url: item.url ?? "",
            snippet: (item.content ?? "").replace(/\n/g, " ").slice(0, 260),
            displayLink: host
          };
        });
      }
    } catch (err) {
      console.warn(`[Search/Tier-1/Tavily] Failed: ${err.message}. Cascading to Tier 2...`);
    }
  } else {
    console.warn(`[Search/Tier-1/Tavily] TAVILY_API_KEY is not set. Cascading to Tier 2...`);
  }
  try {
    const constrainedQuery = `${searchQuery} site:gov.in`;
    console.log(`[Search/Tier-2/DDG-Scraper] Querying: "${constrainedQuery}"`);
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(constrainedQuery)}`;
    const response = await import_axios4.default.get(ddgUrl, {
      headers: browserHeaders,
      timeout: 4500
    });
    const $ = cheerio.load(response.data);
    const results = [];
    $(".result").each((_, el) => {
      if (results.length >= 3) return;
      const title = $(el).find(".result__title").text().trim();
      const rawLink = $(el).find(".result__url").attr("href");
      const snippet = $(el).find(".result__snippet").text().trim();
      if (title && rawLink) {
        let link = rawLink;
        if (rawLink.startsWith("//")) {
          link = "https:" + rawLink;
        } else if (rawLink.startsWith("/l/?kh=")) {
          try {
            const urlObj = new URL("https://html.duckduckgo.com" + rawLink);
            const uddg = urlObj.searchParams.get("uddg");
            if (uddg) {
              link = decodeURIComponent(uddg);
            }
          } catch {
          }
        }
        let host = "duckduckgo.com";
        try {
          host = new URL(link).hostname;
        } catch {
        }
        results.push({
          title: title.slice(0, 120),
          link,
          url: link,
          snippet: snippet.replace(/\n/g, " ").slice(0, 260),
          displayLink: host
        });
      }
    });
    if (results.length > 0) {
      return results;
    }
    console.warn(`[Search/Tier-2/DDG-Scraper] No results found or blocked. Cascading to Tier 3...`);
  } catch (err) {
    console.warn(`[Search/Tier-2/DDG-Scraper] Failed: ${err.message}. Cascading to Tier 3...`);
  }
  try {
    console.log(`[Search/Tier-3/SearXNG] Dynamic instance lookup...`);
    const spaceRes = await import_axios4.default.get("https://searx.space/data/instances.json", {
      timeout: 3e3
    });
    const instances = spaceRes.data?.instances || {};
    const healthyUrls = [];
    for (const [domain, info] of Object.entries(instances)) {
      const details = info;
      if (details.http?.status_code === 200 && details.uptime?.uptimeDay > 95) {
        const url = domain.startsWith("http") ? domain : `https://${domain}`;
        healthyUrls.push(url.endsWith("/") ? url : url + "/");
      }
    }
    if (healthyUrls.length > 0) {
      for (const instanceUrl of healthyUrls.slice(0, 3)) {
        const searchUrl = `${instanceUrl}search`;
        try {
          console.log(`[Search/Tier-3/SearXNG] Trying instance: ${searchUrl}`);
          const res = await import_axios4.default.get(searchUrl, {
            params: {
              q: `${searchQuery} site:gov.in`,
              format: "json"
            },
            headers: browserHeaders,
            timeout: 3500
          });
          if (res.data && typeof res.data === "object" && Array.isArray(res.data.results)) {
            const items = res.data.results || [];
            if (items.length > 0) {
              return items.slice(0, 3).map((item) => {
                let host = "searxng.org";
                try {
                  host = new URL(item.url).hostname;
                } catch {
                }
                return {
                  title: (item.title ?? "").slice(0, 120),
                  link: item.url ?? "",
                  url: item.url ?? "",
                  snippet: (item.content ?? "").replace(/\n/g, " ").slice(0, 260),
                  displayLink: host
                };
              });
            }
          }
        } catch (err) {
          console.warn(`[Search/Tier-3/SearXNG] Instance ${searchUrl} failed: ${err.message}`);
        }
      }
    }
    console.warn(`[Search/Tier-3/SearXNG] Cluster search failed or rate-limited. Cascading to Tier 4...`);
  } catch (err) {
    console.warn(`[Search/Tier-3/SearXNG] Dynamic discovery failed: ${err.message}. Cascading to Tier 4...`);
  }
  try {
    console.log(`[Search/Tier-4/Wikipedia] Querying: "${searchQuery}"`);
    const wikiUrl = "https://en.wikipedia.org/w/api.php";
    const res = await import_axios4.default.get(wikiUrl, {
      params: {
        action: "query",
        list: "search",
        srsearch: searchQuery,
        format: "json",
        utf8: 1,
        origin: "*"
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
      },
      timeout: 4e3
    });
    const items = res.data?.query?.search || [];
    if (items.length > 0) {
      return items.slice(0, 3).map((item) => ({
        title: item.title,
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        snippet: (item.snippet ?? "").replace(/<span class="searchmatch">/g, "").replace(/<\/span>/g, "").slice(0, 260),
        displayLink: "en.wikipedia.org"
      }));
    }
  } catch (err) {
    console.error("[Search/Tier-4/Wikipedia] Failed completely:", err.message);
  }
  return [];
}

// src/lib/gemini.ts
var import_genai = require("@google/genai");
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.VITE_GOOGLE_SEARCH_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY or GOOGLE_SEARCH_API_KEY environment variable is not set. AI Features will use mock mode.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
async function handleOfflineFallback(message, language, res) {
  const query = message.toLowerCase();
  const hasDevanagari = /[\u0900-\u097F]/.test(message);
  const commonHinglish = ["kya", "hai", "kaise", "kab", "karo", "naam", "sewa", "chahiye", "chal", "raha", "hoga", "apna", "banao", "madad", "namaste", "namaskar", "aaj"];
  const isHinglish = commonHinglish.some((word) => query.includes(word));
  const isHi = language === "hi" || hasDevanagari || isHinglish;
  if (query.includes("aaj") || query.includes("today") || query.includes("kya chal") || query.includes("status") || query.includes("whats up")) {
    const reply = isHi ? "\u0928\u092E\u0938\u094D\u0924\u0947! \u0906\u091C \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0915\u0947 \u0924\u0939\u0924 **\u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0938\u0902\u0930\u0915\u094D\u0937\u0923 \u0905\u092D\u093F\u092F\u093E\u0928**, **\u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u091C\u093E\u0902\u091A \u0936\u093F\u0935\u093F\u0930**, \u0914\u0930 **\u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921 \u092A\u0902\u091C\u0940\u0915\u0930\u0923** \u0915\u0940 \u0938\u0947\u0935\u093E\u090F\u0902 \u0938\u0915\u094D\u0930\u093F\u092F \u0930\u0942\u092A \u0938\u0947 \u091A\u0932 \u0930\u0939\u0940 \u0939\u0948\u0902\u0964 \u0906\u092A \u0907\u0928\u092E\u0947\u0902 \u0938\u0947 \u0915\u093F\u0938 \u0938\u0947\u0935\u093E \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902?" : "Hello! Today at the RP Foundation, our **Environment Protection Drive**, **Free Health Checkup Camps**, and **Jan Seva Card Registrations** are actively running. Which service would you like to know more about?";
    return res.json({ response: reply });
  }
  if (query.includes("motive") || query.includes("purpose") || query.includes("dhyey") || query.includes("aim") || query.includes("rp") && query.includes("kya") || query.includes("foundation") && query.includes("kya")) {
    const reply = isHi ? "**\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 (RP Foundation)** \u090F\u0915 \u0917\u0948\u0930-\u0938\u0930\u0915\u093E\u0930\u0940 \u0938\u0902\u0917\u0920\u0928 (NGO) \u0939\u0948 \u091C\u094B \u0938\u092E\u093E\u091C \u0915\u0932\u094D\u092F\u093E\u0923, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u0939\u093E\u092F\u0924\u093E, \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u0936\u093F\u0915\u094D\u0937\u093E \u0938\u0939\u092F\u094B\u0917, \u0938\u093E\u092E\u0941\u0926\u093E\u092F\u093F\u0915 \u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u093E \u0914\u0930 \u0921\u093F\u091C\u093F\u091F\u0932 \u0938\u0936\u0915\u094D\u0924\u093F\u0915\u0930\u0923 (\u091C\u0948\u0938\u0947 \u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921) \u0915\u0947 \u0932\u093F\u090F \u0938\u092E\u0930\u094D\u092A\u093F\u0924 \u0939\u0948\u0964 \u0939\u092E\u093E\u0930\u093E \u0927\u094D\u092F\u0947\u092F **'\u0938\u0947\u0935\u093E, \u0938\u092E\u0930\u094D\u092A\u0923, \u0938\u0902\u0915\u0932\u094D\u092A'** \u0939\u0948\u0964" : "**RP Foundation** is a non-governmental organization (NGO) dedicated to social welfare, healthcare assistance, educational support, community volunteering, and digital empowerment (such as the Jan Seva Card). Our motto is **'Service, Dedication, Resolve'**.";
    return res.json({ response: reply });
  }
  if (query.includes("founder") || query.includes("sanchalak") || query.includes("kisne banaya") || query.includes("founder kon") || query.includes("rohit")) {
    const reply = isHi ? "\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 (RP Foundation) \u0915\u0947 \u0938\u0902\u0938\u094D\u0925\u093E\u092A\u0915 **\u0930\u094B\u0939\u093F\u0924 \u092A\u0902\u0921\u093F\u0924** (\u0930\u094B\u0939\u093F\u0924 \u0938\u0930) \u0939\u0948\u0902\u0964 \u0909\u0928\u0915\u0947 \u0928\u0947\u0924\u0943\u0924\u094D\u0935 \u092E\u0947\u0902 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0938\u092E\u093E\u091C \u0915\u0947 \u0917\u0930\u0940\u092C \u0914\u0930 \u092A\u093F\u091B\u0921\u093C\u0947 \u0935\u0930\u094D\u0917\u094B\u0902 \u0915\u0940 \u0938\u0939\u093E\u092F\u0924\u093E \u0915\u0947 \u0932\u093F\u090F \u0915\u0908 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u092F\u094B\u091C\u0928\u093E\u090F\u0902 \u091A\u0932\u093E \u0930\u0939\u093E \u0939\u0948\u0964" : "RP Foundation was founded by **Rohit Pandit** (Rohit Sir). Under his guidance, the foundation carries out multiple community welfare programs, health camps, and free education drives.";
    return res.json({ response: reply });
  }
  if (query.includes("card") || query.includes("\u0915\u093E\u0930\u094D\u0921") || query.includes("jan seva") || query.includes("\u091C\u0928 \u0938\u0947\u0935\u093E")) {
    const reply = isHi ? "**\u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921** \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0915\u093E \u0906\u092A\u0915\u093E digital identity pass \u0939\u0948\u0964\n\n\u{1F4CB} **\u0906\u0935\u0947\u0926\u0928 \u0915\u0947 \u091A\u0930\u0923:**\n1. Go to *Services \u2192 Jan Seva Card*.\n2. Fill Name, DOB and upload a valid ID document.\n3. Your Aadhaar is masked for privacy.\n4. Once approved, download your QR-enabled digital pass." : "**Jan Seva Card** is your digital identity pass from RP Foundation.\n\n\u{1F4CB} **Steps to Apply:**\n1. Go to *Services \u2192 Jan Seva Card*.\n2. Fill Name, DOB and upload a valid ID document.\n3. Your Aadhaar is masked for privacy \u2014 never stored as plain text.\n4. Once approved, download your QR-enabled digital pass.";
    return res.json({ response: reply });
  }
  if (query.includes("blood") || query.includes("\u0930\u0915\u094D\u0924") || query.includes("\u092C\u094D\u0932\u0921") || query.includes("donor")) {
    const reply = isHi ? "**\u0930\u0915\u094D\u0924 \u0928\u0947\u091F\u0935\u0930\u094D\u0915 (Blood Network)** \u2014 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u092F\u093E \u0938\u094D\u0935\u0948\u091A\u094D\u091B\u093F\u0915 \u0930\u0915\u094D\u0924\u0926\u093E\u0928\u0964\n\n\u{1FA78} **\u0930\u0915\u094D\u0924 \u0905\u0928\u0941\u0930\u094B\u0927:** \u0906\u0935\u0936\u094D\u092F\u0915 \u0917\u094D\u0930\u0941\u092A, \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u0915\u093E \u0928\u093E\u092E \u0914\u0930 \u092F\u0942\u0928\u093F\u091F \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964\n\u{1FA78} **\u0930\u0915\u094D\u0924\u0926\u093E\u0924\u093E \u092A\u0902\u091C\u0940\u0915\u0930\u0923:** \u092C\u094D\u0932\u0921 \u091F\u093E\u0907\u092A \u0914\u0930 \u0905\u0902\u0924\u093F\u092E \u0926\u093E\u0928 \u0924\u093F\u0925\u093F \u0938\u092C\u092E\u093F\u091F \u0915\u0930\u0947\u0902\u0964" : "**Blood Network** \u2014 Emergency or voluntary blood donation.\n\n\u{1FA78} **Request Blood:** Post your required group, hospital name and units needed.\n\u{1FA78} **Register as Donor:** Submit blood type, last donation date.";
    return res.json({ response: reply });
  }
  if (query.includes("volunteer") || query.includes("\u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915") || query.includes("seva")) {
    const reply = isHi ? "**RP Foundation \u092E\u0947\u0902 \u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915 \u092C\u0928\u0947\u0902\u0964**\n\n\u{1F91D} **\u0915\u0948\u0938\u0947 \u091C\u0941\u0921\u093C\u0947\u0902:**\n1. *\u0938\u0947\u0935\u093E\u090F\u0902 \u2192 \u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915 \u0905\u0935\u0938\u0930* \u092A\u0930 \u091C\u093E\u090F\u0902\u0964\n2. \u0915\u094C\u0936\u0932 \u0936\u094D\u0930\u0947\u0923\u0940 \u091A\u0941\u0928\u0947\u0902: \u0936\u093F\u0915\u094D\u0937\u0923, IT, \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u0915\u093E\u0930\u094D\u092F, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F\u0964\n3. \u0938\u092A\u094D\u0924\u093E\u0939\u093E\u0902\u0924 \u0905\u092D\u093F\u092F\u093E\u0928\u094B\u0902, \u092D\u094B\u091C\u0928 \u0936\u093F\u0935\u093F\u0930\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0938\u093E\u0907\u0928 \u0905\u092A \u0915\u0930\u0947\u0902\u0964" : "**Volunteer Opportunities** at RP Foundation.\n\n\u{1F91D} **How to Join:**\n1. Go to *Services \u2192 Volunteer Opportunities*.\n2. Choose a skill: Teaching, IT, Field Work, Healthcare.\n3. Sign up for weekend drives, food camps, plantation events.";
    return res.json({ response: reply });
  }
  if (query.includes("donate") || query.includes("\u0926\u093E\u0928") || query.includes("donation")) {
    const reply = isHi ? "**\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0915\u094B \u0926\u093E\u0928 \u0915\u0930\u0947\u0902** \u2014 \u0906\u092A\u0915\u093E \u092F\u094B\u0917\u0926\u093E\u0928 \u091C\u0940\u0935\u0928 \u092C\u0926\u0932\u0924\u093E \u0939\u0948\u0964\n\n\u{1F49B} **\u0924\u094D\u0935\u0930\u093F\u0924 \u0935\u093F\u0915\u0932\u094D\u092A:** \u20B9500 / \u20B91000 / \u20B95000 \u092F\u093E \u0915\u0938\u094D\u091F\u092E \u0930\u093E\u0936\u093F\u0964\n\u{1F4DC} **80G \u0938\u0930\u094D\u091F\u093F\u092B\u093F\u0915\u0947\u091F:** \u0938\u094D\u0935\u0924: \u0928\u093F\u0930\u094D\u092E\u093F\u0924 \u0915\u0930-\u091B\u0942\u091F PDF\u0964" : "**Donate to RP Foundation** \u2014 Your contribution changes lives.\n\n\u{1F49B} **Quick options:** \u20B9500 / \u20B91000 / \u20B95000 or a custom amount.\n\u{1F4DC} **80G Certificate:** Auto-generated tax-exemption PDF.";
    return res.json({ response: reply });
  }
  try {
    const results = await queryExternalSearch(message);
    if (results && results.length > 0) {
      let reply = isHi ? "\u092E\u0941\u091D\u0947 \u0907\u0938\u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u0935\u0947\u092C \u0938\u0947 \u092F\u0947 \u092A\u0930\u093F\u0923\u093E\u092E \u092E\u093F\u0932\u0947 \u0939\u0948\u0902:\n\n" : "I found the following results from the web:\n\n";
      results.forEach((r) => {
        reply += `\u{1F517} **[${r.title}](${r.link})**
${r.snippet}

`;
      });
      return res.json({ response: reply });
    }
  } catch (e) {
  }
  const defaultReply = isHi ? "\u0928\u092E\u0938\u094D\u0924\u0947! \u092E\u0948\u0902 \u0906\u092A\u0915\u0940 \u0916\u094B\u091C \u092E\u0947\u0902 \u0938\u0939\u093E\u092F\u0924\u093E \u0915\u0930\u0928\u0947 \u0915\u0940 \u0915\u094B\u0936\u093F\u0936 \u0915\u0930 \u0930\u0939\u093E \u0939\u0942\u0901\u0964 \u0905\u0927\u093F\u0915 \u0935\u093F\u0936\u093F\u0937\u094D\u091F \u092A\u094D\u0930\u0936\u094D\u0928 \u092A\u0942\u091B\u0947\u0902 (\u091C\u0948\u0938\u0947 '\u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921 \u0915\u0948\u0938\u0947 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902' \u092F\u093E '\u0930\u0915\u094D\u0924\u0926\u093E\u0928 \u0915\u0948\u0938\u0947 \u0915\u0930\u0947\u0902') \u092F\u093E \u0939\u092E\u093E\u0930\u0940 \u0939\u0947\u0932\u094D\u092A\u0932\u093E\u0907\u0928 **1800-569-0991** \u092A\u0930 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902\u0964" : "Hello! I am trying to assist you with your search. Please ask a more specific question (e.g. 'how to get jan seva card' or 'how to donate blood') or call our helpline at **1800-569-0991**.";
  return res.json({ response: defaultReply });
}

// src/routes/aiRoutes.ts
var router7 = import_express7.default.Router();
router7.post("/api/ai/chat", async (req, res) => {
  const { message, history = [], language = "hi" } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.VITE_GOOGLE_SEARCH_API_KEY;
  if (!apiKey || apiKey === "MOCK_KEY") {
    return handleOfflineFallback(message, language, res);
  }
  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are "RP Foundation AI Mitr" (\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u090F\u0906\u0908 \u092E\u093F\u0924\u094D\u0930), a friendly and general-purpose AI assistant.
You can answer any general questions, solve math problems, write text, explain concepts, or translate languages just like Gemini, ChatGPT, or Grok, while maintaining your identity as RP AI Mitr.
When asked about RP Foundation, guide them about its initiatives (Jan Seva Card, blood donation, volunteer opportunities, government schemes).
Always match the user's language preference (Hindi, English, or Hinglish) and keep responses clear, concise, and helpful.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `System instruction: ${systemPrompt}` }] },
        ...history.map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ]
    });
    const replyText = response.text || "Sorry, I am unable to process that right now.";
    return res.json({ response: replyText });
  } catch (error) {
    console.error("Gemini Chat Error, falling back:", error);
    return handleOfflineFallback(message, language, res);
  }
});
router7.post("/api/ai/categorize", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  const safeCatDefault = {
    category: "Uncategorized",
    urgency: "Pending Review",
    summary: title ? title.substring(0, 50) + "..." : "Complaint under review"
  };
  if (!apiKey) {
    console.warn("AI Categorization skipped: No GEMINI_API_KEY provided.");
    return res.json(safeCatDefault);
  }
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an auto-triage AI for RP Foundation's Grievance Redressal system. Your task is to categorize citizens' complaints.
Analyze the following title and description of a complaint, and return a JSON object with:
1. "category": strictly one of ["Water Supply", "Roads & Transit", "Sanitation & Waste", "Education & Schools", "Healthcare Facilities", "Street Lights & Power", "Others"]
2. "urgency": strictly one of ["Low", "Medium", "High", "Critical"]
3. "summary": a single compact summary line (in Hindi if complaint is in Hindi, otherwise English).

Complaint Title: "${title}"
Complaint Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            category: { type: import_genai.Type.STRING },
            urgency: { type: import_genai.Type.STRING },
            summary: { type: import_genai.Type.STRING }
          },
          required: ["category", "urgency", "summary"]
        }
      }
    });
    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error("AI Categorization Error:", error);
    res.json(safeCatDefault);
  }
});
router7.post("/api/ai/scheme-match", async (req, res) => {
  const { age, gender, annualIncome, occupation, state, category } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const safeSchemeDefault = { schemes: [] };
  if (!apiKey) {
    console.warn("AI Scheme Match skipped: No GEMINI_API_KEY provided.");
    return res.json(safeSchemeDefault);
  }
  try {
    const ai = getGeminiClient();
    const prompt = `Formulate custom recommended Indian Government Schemes or RP Foundation scholarships for a citizen with the following details:
- Age: ${age}
- Gender: ${gender}
- Annual Income: \u20B9${annualIncome}
- Occupation: ${occupation}
- State: ${state}
- Social Category/Work: ${category}

Respond with a JSON array of up to 3 highly tailored schemes. Each scheme should contain:
1. "name" (Scheme/Scholarship name in Bilingual format e.g. "Ayushman Bharat / \u0906\u092F\u0941\u0937\u094D\u092E\u093E\u0928 \u092D\u093E\u0930\u0924")
2. "eligibility" (Why they are eligible)
3. "benefits" (Key benefits)
4. "steps" (Simple steps to apply)`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              name: { type: import_genai.Type.STRING },
              eligibility: { type: import_genai.Type.STRING },
              benefits: { type: import_genai.Type.STRING },
              steps: { type: import_genai.Type.STRING }
            },
            required: ["name", "eligibility", "benefits", "steps"]
          }
        }
      }
    });
    const schemes = JSON.parse(response.text || "[]");
    res.json({ schemes });
  } catch (error) {
    console.error("Scheme Matcher Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze schemes" });
  }
});
router7.post("/api/ai/resume", async (req, res) => {
  const { fullName, title, experience, skills } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI service unavailable (No API Key)" });
  }
  try {
    const ai = getGeminiClient();
    const prompt = `You are an expert career coach. Based on the following user details, generate a professional resume summary and a short, impactful cover letter.
- Name: ${fullName}
- Title: ${title}
- Skills: ${skills}
- Experience Context: ${experience}

Format the response strictly as a JSON object with:
1. "summary" (A 2-3 sentence professional summary)
2. "coverLetter" (A 3-paragraph cover letter)
`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            summary: { type: import_genai.Type.STRING },
            coverLetter: { type: import_genai.Type.STRING }
          },
          required: ["summary", "coverLetter"]
        }
      }
    });
    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error("AI Resume Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate resume content" });
  }
});
var aiRoutes_default = router7;

// src/routes/cultureRoutes.ts
var import_express8 = __toESM(require("express"), 1);

// src/lib/socialCache.ts
var socialPreviewsCache = {};
var SOCIAL_CACHE_TTL = 60 * 60 * 1e3;

// src/routes/cultureRoutes.ts
var import_crypto6 = __toESM(require("crypto"), 1);
var import_axios5 = __toESM(require("axios"), 1);
var router8 = import_express8.default.Router();
router8.get("/api/success-stories", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM success_stories ORDER BY "createdAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router8.post("/api/success-stories", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, error: "Title and Content are required" });
    const id = import_crypto6.default.randomUUID();
    await pool.query(
      `INSERT INTO success_stories (id, title, content, "imageUrl", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
      [id, title, content, imageUrl || null]
    );
    res.json({ success: true, message: "Success story created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router8.delete("/api/success-stories/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM success_stories WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: "Success story deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router8.get("/api/social-previews", async (req, res) => {
  try {
    const apiKey = process.env.EXABASE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "Exabase API key not configured on server" });
    }
    let targetUrls = [
      "https://www.instagram.com/rpfoundationofficial/",
      "https://www.instagram.com/therohitpandit/",
      "https://www.facebook.com/rpfofficial",
      "https://x.com/rpfoundation15",
      "https://www.youtube.com/@rpfoundationofficial"
    ];
    try {
      const cmsDataRes = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
      if (cmsDataRes.rows.length > 0 && cmsDataRes.rows[0].founderMessageEn) {
        const parsed = JSON.parse(cmsDataRes.rows[0].founderMessageEn);
        if (parsed.socialDirectory && Array.isArray(parsed.socialDirectory) && parsed.socialDirectory.length > 0) {
          targetUrls = parsed.socialDirectory.map((item) => item.url).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn("[EXABASE] Failed to dynamically load social links from DB settings, using defaults:", e.message);
    }
    const results = [];
    for (const url of targetUrls) {
      const now = Date.now();
      const cached = socialPreviewsCache[url];
      if (cached && now - cached.timestamp < SOCIAL_CACHE_TTL) {
        results.push(cached.data);
        continue;
      }
      try {
        console.log(`[EXABASE] Fetching live preview for: ${url}`);
        const response = await import_axios5.default.get(
          `https://api.exabase.io/v2/link?url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-Api-Key": apiKey
            },
            timeout: 8e3
          }
        );
        const previewData = response.data;
        const imgObj = previewData.image;
        const imageUrl = (imgObj && typeof imgObj === "object" ? imgObj.url : imgObj) || previewData.imageUrl || previewData.ImageUrl || "";
        const normalized = {
          url,
          title: previewData.title || previewData.Title || url,
          description: previewData.description || previewData.Description || "",
          image: imageUrl,
          siteName: previewData.siteName || previewData.SiteName || ""
        };
        socialPreviewsCache[url] = {
          data: normalized,
          timestamp: now
        };
        results.push(normalized);
      } catch (err) {
        console.warn(`[EXABASE WARNING] Failed to fetch live preview for ${url}:`, err.message);
        if (cached) {
          results.push(cached.data);
        } else {
          results.push({
            url,
            title: url.includes("instagram") ? url.includes("therohitpandit") ? "Rohit Pandit Instagram" : "RP Foundation Instagram" : url.includes("facebook") ? "RP Foundation Facebook" : url.includes("youtube") ? "RP Foundation YouTube" : "RP Foundation Twitter/X",
            description: "Visit our official social media page for live updates, campaigns and community achievements.",
            image: "",
            siteName: url.includes("instagram") ? "Instagram" : url.includes("facebook") ? "Facebook" : url.includes("youtube") ? "YouTube" : "Twitter/X"
          });
        }
      }
    }
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router8.get("/api/culture/rsvps", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT event_title FROM event_rsvps WHERE user_id = $1", [userId]);
    res.json({ success: true, data: result.rows.map((r) => r.event_title) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router8.post("/api/culture/rsvps", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { event_title } = req.body;
    await pool.query(
      `INSERT INTO event_rsvps (user_id, event_title, registered_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (user_id, event_title) DO NOTHING`,
      [userId, event_title]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router8.delete("/api/culture/rsvps/:eventTitle", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventTitle } = req.params;
    await pool.query("DELETE FROM event_rsvps WHERE user_id = $1 AND event_title = $2", [userId, eventTitle]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var cultureRoutes_default = router8;

// src/routes/janSevaRoutes.ts
var import_express9 = __toESM(require("express"), 1);
var import_crypto7 = __toESM(require("crypto"), 1);
var router9 = import_express9.default.Router();
router9.get("/api/cards", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications_v2'
    );
    res.json({ applications: result.rows });
  } catch (error) {
    console.error("Error fetching card applications:", error);
    res.status(500).json({ error: error.message });
  }
});
router9.post("/api/cards", async (req, res) => {
  try {
    const { userId, name, gender, dob, address, idType, idNumber } = req.body;
    if (idType === "aadhaar" || idNumber) {
      const existing = await pool.query('SELECT "cardNo" FROM card_applications_v2 WHERE "idNumber" = $1', [idNumber]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, error: "A card with this Aadhaar number already exists.", cardNo: existing.rows[0].cardNo });
      }
    }
    const submittedAt = (/* @__PURE__ */ new Date()).toISOString();
    const id = import_crypto7.default.randomUUID();
    const cardNo = `JSC-${Math.floor(1e7 + Math.random() * 9e7)}`;
    const status = "approved";
    await pool.query(
      `INSERT INTO card_applications_v2 
         (id, "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        userId || "guest",
        name,
        gender,
        dob,
        address,
        idType || "aadhaar",
        idNumber,
        status,
        cardNo,
        submittedAt
      ]
    );
    if (userId && userId !== "guest") {
      await pool.query(
        'UPDATE users SET "janSevaCardStatus" = $1, "janSevaCardNo" = $2 WHERE id = $3',
        ["approved", cardNo, userId]
      );
    }
    res.json({ success: true, cardNo });
  } catch (error) {
    console.error("Error saving card application:", error);
    res.status(500).json({ error: error.message });
  }
});
router9.post("/api/cards/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const cardNo = `JSC-${Math.floor(1e7 + Math.random() * 9e7)}`;
    await pool.query(
      'UPDATE card_applications_v2 SET status = $1, "cardNo" = $2 WHERE "userId" = $3',
      ["approved", cardNo, userId]
    );
    await pool.query(
      'UPDATE users SET "janSevaCardStatus" = $1, "janSevaCardNo" = $2 WHERE id = $3',
      ["approved", cardNo, userId]
    );
    res.json({ success: true, cardNo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.post("/api/cards/reject", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    await pool.query(
      'UPDATE card_applications_v2 SET status = $1 WHERE "userId" = $2',
      ["rejected", userId]
    );
    await pool.query(
      'UPDATE users SET "janSevaCardStatus" = $1 WHERE id = $2',
      ["rejected", userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.delete("/api/cards/:userId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM card_applications_v2 WHERE "userId" = $1', [req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.get("/api/cards/my", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }
    const result = await pool.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications_v2 WHERE "userId" = $1',
      [userId]
    );
    res.json({ success: true, application: result.rows[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var janSevaRoutes_default = router9;

// src/routes/locationRoutes.ts
var import_express10 = __toESM(require("express"), 1);
var import_axios6 = __toESM(require("axios"), 1);
var router10 = import_express10.default.Router();
router10.get("/api/locations/pincode", async (req, res) => {
  const pincode = String(req.query.p || "").trim();
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ success: false, error: "Invalid pincode" });
  }
  if (PINCODE_CONSTITUENCY_MAP[pincode]) {
    const resolution2 = PINCODE_CONSTITUENCY_MAP[pincode];
    let district = "";
    let city = "";
    if (pincode.startsWith("462")) {
      district = city = "Bhopal";
    } else if (pincode.startsWith("452") || pincode.startsWith("453")) {
      district = city = "Indore";
    } else if (pincode.startsWith("466")) {
      district = city = "Bhopal";
    }
    let areas = [];
    try {
      const postRes = await import_axios6.default.get(
        `https://api.postalpincode.in/pincode/${pincode}`,
        { timeout: 4e3 }
      );
      if (postRes.data?.[0]?.Status === "Success" && Array.isArray(postRes.data[0].PostOffice)) {
        areas = postRes.data[0].PostOffice.map((po) => po.Name);
        const office = postRes.data[0].PostOffice[0];
        district = office.District || district;
        city = office.Block && office.Block !== "NA" ? office.Block : office.District || city;
      }
    } catch (err) {
    }
    return res.json({
      success: true,
      data: {
        pincode,
        state: "Madhya Pradesh",
        district,
        city,
        vidhan_sabha: resolution2.vidhan_sabha,
        vidhan_sabhas: resolution2.vidhan_sabhas,
        sansad_kshetra: resolution2.sansad_kshetra,
        areas,
        source: "local_map + india_post"
      }
    });
  }
  try {
    const response = await import_axios6.default.get(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { timeout: 5e3 }
    );
    const data = response.data;
    if (data?.[0]?.Status === "Success" && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
      const offices = data[0].PostOffice;
      const office = offices[0];
      const areas = offices.map((po) => po.Name);
      const district = office.District || "";
      const state = office.State || "";
      const city = office.Block && office.Block !== "NA" ? office.Block : district;
      const resolution2 = resolveConstituency(
        pincode,
        district,
        areas,
        state
      );
      return res.json({
        success: true,
        data: {
          pincode,
          state,
          district,
          city,
          vidhan_sabha: resolution2.vidhan_sabha,
          vidhan_sabhas: resolution2.vidhan_sabhas,
          sansad_kshetra: resolution2.sansad_kshetra,
          areas,
          source: "india_post"
        }
      });
    }
    return res.status(404).json({
      success: false,
      error: "Pincode not found in India Post directory"
    });
  } catch (error) {
    console.error("India Post API failed:", error.message);
  }
  const resolution = resolveConstituency(pincode, "", [], void 0);
  return res.json({
    success: true,
    data: {
      pincode,
      state: "",
      district: "",
      city: "",
      vidhan_sabha: resolution.vidhan_sabha || "",
      vidhan_sabhas: resolution.vidhan_sabhas || [],
      sansad_kshetra: resolution.sansad_kshetra || "",
      areas: [],
      source: "fallback",
      message: "India Post API unavailable. Showing best local match if available."
    }
  });
});
router10.get("/api/locations/helplines", async (req, res) => {
  const { pincode } = req.query;
  if (!pincode) {
    return res.status(400).json({ error: "Pincode is required" });
  }
  const mpHelplines = [
    {
      name: "One Stop Centre (OSC) - Bhopal",
      address: "District Hospital Campus, Bhopal, Madhya Pradesh - 466001",
      phone: "07562224455",
      type: "One Stop Centre",
      helpline: "181 / 1091"
    },
    {
      name: "One Stop Centre (OSC) - Bhopal",
      address: "J.P. Hospital Campus, 1250 Hospital Rd, Tulsi Nagar, Bhopal, MP - 462003",
      phone: "07552550181",
      type: "One Stop Centre",
      helpline: "181 / 1091"
    },
    {
      name: "One Stop Centre (OSC) - Indore",
      address: "M.Y. Hospital Campus, Indore, Madhya Pradesh - 452001",
      phone: "07312520181",
      type: "One Stop Centre",
      helpline: "181 / 1091"
    },
    {
      name: "Mahila Thana (Women Police Station) - Bhopal",
      address: "Jahangirabad, Bhopal, Madhya Pradesh - 462008",
      phone: "07552443801",
      type: "Police Helpline",
      helpline: "1091 / 100"
    },
    {
      name: "Mahila Thana (Women Police Station) - Bhopal",
      address: "Kotwali Campus, Bhopal, Madhya Pradesh - 466001",
      phone: "07562227091",
      type: "Police Helpline",
      helpline: "1091 / 100"
    },
    {
      name: "District Police Headquarters Helpdesk - Bhopal",
      address: "SP Office, Bhopal, Madhya Pradesh - 466001",
      phone: "07562227202",
      type: "Police Helpline",
      helpline: "100 / 112"
    }
  ];
  const nationalHelplines = [
    {
      name: "National Commission for Women Helpline",
      address: "New Delhi, India (24/7 National Coverage)",
      phone: "14490",
      type: "National Helpline",
      helpline: "14490"
    },
    {
      name: "Student & Women Helpline (181)",
      address: "State Capital Helpdesk, India",
      phone: "181",
      type: "State Helpline",
      helpline: "181"
    },
    {
      name: "All India Women Helpline (1091)",
      address: "National Coverage",
      phone: "1091",
      type: "National Helpline",
      helpline: "1091"
    },
    {
      name: "Emergency Response Support System (112)",
      address: "National Unified Emergency Response",
      phone: "112",
      type: "Unified Helpline",
      helpline: "112"
    }
  ];
  const pinStr = String(pincode);
  let resolvedLocal = [];
  if (pinStr.startsWith("466")) {
    resolvedLocal = mpHelplines.filter((h) => h.name.includes("Bhopal"));
  } else if (pinStr.startsWith("462") || pinStr.startsWith("461")) {
    resolvedLocal = mpHelplines.filter((h) => h.name.includes("Bhopal") || h.name.includes("Bhopal"));
  } else if (pinStr.startsWith("452") || pinStr.startsWith("451") || pinStr.startsWith("450")) {
    resolvedLocal = mpHelplines.filter((h) => h.name.includes("Indore"));
  } else {
    if (pinStr.startsWith("45") || pinStr.startsWith("46") || pinStr.startsWith("47") || pinStr.startsWith("48")) {
      resolvedLocal = mpHelplines;
    }
  }
  res.json({
    success: true,
    data: [...resolvedLocal, ...nationalHelplines]
  });
});
router10.get("/api/locations/street_ratings", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM street_ratings ORDER BY "createdAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router10.post("/api/locations/street_ratings", async (req, res) => {
  try {
    const { location_name, latitude, longitude, rating, notes } = req.body;
    await pool.query(
      `INSERT INTO street_ratings (location_name, latitude, longitude, rating, notes) 
       VALUES ($1, $2, $3, $4, $5)`,
      [location_name, latitude || 0, longitude || 0, rating || 3, notes || ""]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router10.get("/api/locations/search", (req, res) => {
  const query = req.query.q?.trim().toLowerCase();
  if (!query || query.length < 2) {
    return res.json([]);
  }
  const geoJson = loadACGeoJson();
  if (geoJson) {
    const results = [];
    const seen = /* @__PURE__ */ new Set();
    const features = geoJson.features || [];
    for (const feature of features) {
      const props = feature.properties;
      if (props && props.ST_NAME === "MADHYA PRADESH") {
        const dist = (props.DIST_NAME || "").toLowerCase();
        const ac = (props.AC_NAME || "").toLowerCase();
        if (dist.includes(query) || ac.includes(query)) {
          const uniqueKey = `${props.DIST_NAME}-${props.AC_NAME}`;
          if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            results.push({
              district: props.DIST_NAME,
              vidhan_sabha: props.AC_NAME,
              sansad_kshetra: props.PC_NAME
            });
          }
        }
      }
      if (results.length >= 10) break;
    }
    res.json(results);
  } else {
    const results = MP_CONSTITUENCIES_MOCK.filter(
      (item) => item.district.toLowerCase().includes(query) || item.vidhan_sabha.toLowerCase().includes(query)
    ).slice(0, 10);
    res.json(results);
  }
});
router10.get("/api/countries", async (_req, res) => {
  try {
    const fields = "name,cca2,flags,capital,population,region,subregion,languages,currencies,maps,timezones";
    const response = await import_axios6.default.get(
      `https://restcountries.com/v3.1/all?fields=${fields}`,
      { timeout: 12e3 }
    );
    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("Countries proxy failed:", err.message);
    res.status(502).json({ success: false, error: "Failed to load countries" });
  }
});
var locationRoutes_default = router10;

// src/routes/womenRoutes.ts
var import_express11 = __toESM(require("express"), 1);
var import_crypto8 = __toESM(require("crypto"), 1);
var router11 = import_express11.default.Router();
router11.get("/api/women/complaints", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const result = await pool.query(
      `SELECT * FROM women_complaints WHERE user_id = $1 ORDER BY "createdAt" DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router11.post("/api/women/complaints", async (req, res) => {
  try {
    const { user_id, complainant_name, complainant_phone, complaint_type, incident_date, location, description, suspect_details, is_anonymous } = req.body;
    await pool.query(
      `INSERT INTO women_complaints (user_id, complainant_name, complainant_phone, complaint_type, incident_date, location, description, suspect_details, is_anonymous) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user_id || "guest",
        complainant_name || "",
        complainant_phone || "",
        complaint_type,
        incident_date,
        location,
        description,
        suspect_details || "",
        is_anonymous || false
      ]
    );
    const dataString = JSON.stringify({
      complaintType: complaint_type,
      incidentDate: incident_date,
      location,
      description,
      suspectDetails: suspect_details,
      isAnonymous: is_anonymous
    });
    await pool.query(
      `INSERT INTO service_submissions_v2 ("userId", "citizenName", "citizenPhone", "serviceName", "submissionData", status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user_id || "guest",
        is_anonymous ? "Anonymous" : complainant_name || "Citizen",
        is_anonymous ? "" : complainant_phone || "",
        "Women Support - Incident Complaint",
        dataString,
        "pending"
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router11.get("/api/rto/vehicle/:plate", async (req, res) => {
  try {
    const { plate } = req.params;
    if (!plate) return res.status(400).json({ error: "Plate number is required" });
    const formattedPlate = plate.replace(/\s+/g, "").toUpperCase();
    const result = await pool.query(
      `SELECT * FROM rto_vehicles WHERE REPLACE(UPPER(plate_number), ' ', '') = $1`,
      [formattedPlate]
    );
    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0] });
    }
    if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/.test(formattedPlate)) {
      return res.status(404).json({ success: false, error: "Vehicle not found. Please check plate number format." });
    }
    let hash = 0;
    for (let i = 0; i < formattedPlate.length; i++) {
      hash = formattedPlate.charCodeAt(i) + ((hash << 5) - hash);
    }
    const models = ["Maruti Suzuki Swift", "Hyundai Creta", "Honda City", "Tata Nexon", "Mahindra Scorpio", "Toyota Innova", "Kia Seltos", "Royal Enfield Classic 350", "Honda Activa 6G"];
    const names = ["Rakesh Kumar", "Priya Singh", "Amit Sharma", "Deepak Verma", "Neha Gupta", "Vikram Rathore", "Suresh Patel"];
    const fuelTypes = ["PETROL", "DIESEL", "CNG", "ELECTRIC"];
    const model = models[Math.abs(hash) % models.length];
    const nameStr = names[Math.abs(hash) % names.length];
    const maskedName = nameStr.split(" ").map((n) => n[0] + "*".repeat(n.length - 1)).join(" ");
    const regYear = 2010 + Math.abs(hash) % 14;
    const regDate = new Date(regYear, Math.abs(hash) % 12, Math.abs(hash) % 28 + 1);
    const insYear = regYear + 15;
    const insDate = new Date(insYear, Math.abs(hash) % 12, Math.abs(hash) % 28 + 1);
    const mockVehicle = {
      plate_number: plate.toUpperCase(),
      owner_name: maskedName,
      vehicle_model: model,
      registration_date: regDate.toISOString().split("T")[0],
      insurance_validity: insDate.toISOString().split("T")[0],
      fitness_validity: insDate.toISOString().split("T")[0],
      fuel_type: fuelTypes[Math.abs(hash) % fuelTypes.length],
      status: "ACTIVE",
      rto_code: formattedPlate.substring(0, 4)
    };
    const responseData = { ...mockVehicle, is_demo_data: true, status: "DEMO MODE (NOT REAL)" };
    res.json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router11.post("/api/family/group", async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) return res.status(400).json({ error: "Missing fields" });
    const groupId = import_crypto8.default.randomUUID();
    const inviteCode = import_crypto8.default.randomBytes(3).toString("hex").toUpperCase();
    await pool.query(
      `INSERT INTO family_groups (id, name, invite_code, created_by) VALUES ($1, $2, $3, $4)`,
      [groupId, name, inviteCode, userId]
    );
    await pool.query(
      `INSERT INTO family_members (id, group_id, user_id, role) VALUES ($1, $2, $3, $4)`,
      [import_crypto8.default.randomUUID(), groupId, userId, "admin"]
    );
    res.json({ success: true, data: { groupId, inviteCode } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router11.post("/api/family/join", async (req, res) => {
  try {
    const { inviteCode, userId } = req.body;
    if (!inviteCode || !userId) return res.status(400).json({ error: "Missing fields" });
    const groupRes = await pool.query(`SELECT id FROM family_groups WHERE invite_code = $1`, [inviteCode]);
    if (groupRes.rows.length === 0) return res.status(404).json({ error: "Invalid invite code" });
    const groupId = groupRes.rows[0].id;
    const memberRes = await pool.query(`SELECT id FROM family_members WHERE group_id = $1 AND user_id = $2`, [groupId, userId]);
    if (memberRes.rows.length === 0) {
      await pool.query(
        `INSERT INTO family_members (id, group_id, user_id, role) VALUES ($1, $2, $3, $4)`,
        [import_crypto8.default.randomUUID(), groupId, userId, "member"]
      );
    }
    res.json({ success: true, data: { groupId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router11.get("/api/family/groups", async (req, res) => {
  try {
    const { userId } = req.query;
    const result = await pool.query(
      `SELECT g.* FROM family_groups g 
       JOIN family_members m ON g.id = m.group_id 
       WHERE m.user_id = $1`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router11.post("/api/family/location", async (req, res) => {
  try {
    const { userId, latitude, longitude, battery_level, is_charging } = req.body;
    if (!userId || !latitude || !longitude) return res.status(400).json({ error: "Missing fields" });
    await pool.query(
      `INSERT INTO member_locations (id, user_id, latitude, longitude, battery_level, is_charging) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [import_crypto8.default.randomUUID(), userId, latitude, longitude, battery_level || null, is_charging || false]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router11.get("/api/family/locations/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const result = await pool.query(
      `SELECT m.user_id, u.name as user_name, u.phone, l.latitude, l.longitude, l.battery_level, l.is_charging, l.timestamp 
       FROM family_members m
       LEFT JOIN users u ON m.user_id = u.id
       LEFT JOIN LATERAL (
         SELECT latitude, longitude, battery_level, is_charging, timestamp 
         FROM member_locations 
         WHERE user_id = m.user_id 
         ORDER BY timestamp DESC 
         LIMIT 1
       ) l ON true
       WHERE m.group_id = $1`,
      [groupId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var womenRoutes_default = router11;

// src/routes/environmentRoutes.ts
var import_express12 = __toESM(require("express"), 1);
var import_crypto9 = __toESM(require("crypto"), 1);
var import_axios7 = __toESM(require("axios"), 1);
var router12 = import_express12.default.Router();
router12.get("/api/env/fuel", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM fuel_logs WHERE user_id = $1 ORDER BY fill_date DESC",
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router12.post("/api/env/fuel", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { odometer, liters, price_per_liter } = req.body;
    if (!odometer || !liters || !price_per_liter) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const total_cost = Number(liters) * Number(price_per_liter);
    const id = import_crypto9.default.randomUUID();
    await pool.query(
      `INSERT INTO fuel_logs (id, user_id, odometer, liters, price_per_liter, total_cost) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, userId, odometer, liters, price_per_liter, total_cost]
    );
    res.json({ success: true, id, total_cost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router12.delete("/api/env/fuel/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query("DELETE FROM fuel_logs WHERE id = $1 AND user_id = $2", [id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router12.get("/api/env/earthquakes", async (req, res) => {
  try {
    const response = await import_axios7.default.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson");
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error fetching earthquake data:", error.message);
    res.status(500).json({ error: "Failed to fetch earthquake data" });
  }
});
var environmentRoutes_default = router12;

// src/routes/educationRoutes.ts
var import_express13 = __toESM(require("express"), 1);
var import_crypto10 = __toESM(require("crypto"), 1);
var router13 = import_express13.default.Router();
var MOCK_COURSES = [
  { id: "c1", title: "Introduction to Digital Literacy", category: "Technology", instructor: "Govt. IT Initiative", youtube_id: "7_eM0_tF6xM", duration: "1.5 Hours", views: 1205 },
  { id: "c2", title: "Financial Independence for Women", category: "Finance", instructor: "State Bank Literacy Program", youtube_id: "L1_N3R6a1fU", duration: "2 Hours", views: 3400 },
  { id: "c3", title: "Agriculture Best Practices 2026", category: "Agriculture", instructor: "Kisan Suvidha", youtube_id: "5B-G2mUfHkI", duration: "45 Mins", views: 980 }
];
var MOCK_QUESTIONS = [
  { id: 1, text: "What is the capital of Madhya Pradesh?", options: ["Indore", "Bhopal", "Gwalior", "Jabalpur"], answer: 1 },
  { id: 2, text: "Which gas is primarily responsible for the greenhouse effect?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], answer: 1 },
  { id: 3, text: "Who was the first woman Prime Minister of India?", options: ["Indira Gandhi", "Sarojini Naidu", "Pratibha Patil", "Sushma Swaraj"], answer: 0 }
];
var MOCK_BOOKS = [
  { id: "b1", title: "The Discovery of India", author: "Jawaharlal Nehru", category: "History", content: "The Discovery of India was written by India's first Prime Minister Jawaharlal Nehru during his imprisonment in 1942\u20131945... (This is a short sample text for demonstration of the digital reader). It gives a broad view of Indian history, philosophy and culture." },
  { id: "b2", title: "Godan (The Gift of a Cow)", author: "Munshi Premchand", category: "Literature", content: "Godan is a famous Hindi novel by Munshi Premchand, first published in 1936. The story revolves around the socio-economic deprivation as well as the exploitation of the village poor... (This is a short sample text for demonstration)." }
];
router13.get("/api/edu/courses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses ORDER BY views DESC");
    let courses = result.rows;
    if (courses.length === 0) {
      courses = MOCK_COURSES;
    }
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router13.get("/api/edu/tests/questions", async (req, res) => {
  res.json({ success: true, data: MOCK_QUESTIONS });
});
router13.post("/api/edu/tests/submit", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, score, total } = req.body;
    const id = import_crypto10.default.randomUUID();
    await pool.query(
      `INSERT INTO mock_test_scores (id, user_id, test_category, score, total) VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, category, score, total]
    );
    res.json({ success: true, message: "Score saved successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router13.get("/api/edu/tests/scores", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM mock_test_scores WHERE user_id = $1 ORDER BY date_taken DESC", [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router13.get("/api/edu/library", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM library_books ORDER BY views DESC");
    let books = result.rows;
    if (books.length === 0) {
      books = MOCK_BOOKS;
    }
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var educationRoutes_default = router13;

// src/routes/miscRoutes.ts
var import_express14 = __toESM(require("express"), 1);

// src/lib/apiCache.ts
var apiCache = /* @__PURE__ */ new Map();
var CACHE_TTL = 6e4;

// src/routes/miscRoutes.ts
var router14 = import_express14.default.Router();
router14.get("/api/search/external", async (req, res) => {
  try {
    const q = req.query.q || req.query.query;
    if (!q) return res.status(400).json({ success: false, error: "Missing search query" });
    const results = await queryExternalSearch(q);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("External search API error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
router14.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    const userId = String(req.user?.id || "").trim();
    if (!userId) return res.status(401).json({ success: false, error: "Authenticated user is required" });
    const result = await pool.query(
      `SELECT id, title, message, type, reference_id, is_read, created_at
       FROM app_notifications
       WHERE recipient_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId]
    );
    res.json({
      notifications: result.rows.map((row) => ({
        id: String(row.id),
        type: row.type === "blood_request" ? "urgent" : row.type === "success" ? "success" : "info",
        titleEn: row.title,
        titleHi: row.title,
        bodyEn: row.message,
        bodyHi: row.message,
        createdAt: row.created_at,
        read: Boolean(row.is_read),
        referenceId: row.reference_id || null
      }))
    });
  } catch (err) {
    console.error("User notifications API error:", err);
    res.status(500).json({ success: false, error: "Unable to load notifications" });
  }
});
router14.post("/api/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const userId = String(req.user?.id || "").trim();
    const notificationId = String(req.params.id || "").trim();
    if (!userId || !notificationId) return res.status(400).json({ success: false, error: "Invalid notification" });
    const result = await pool.query(
      `UPDATE app_notifications SET is_read = TRUE
       WHERE id = $1 AND recipient_id = $2
       RETURNING id`,
      [notificationId, userId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, error: "Notification not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Notification read API error:", err);
    res.status(500).json({ success: false, error: "Unable to update notification" });
  }
});
router14.get("/api/testimonials", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ testimonials: parsed.testimonials || [] });
    }
    res.json({ testimonials: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router14.get("/api/stats", async (req, res) => {
  const cached = apiCache.get("/api/stats");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return res.json(cached.data);
  let beneficiaries = 0, volunteers = 0, healthCamps = 0, campaigns = 0;
  let offsets = { beneficiaries: 0, volunteers: 0, healthCamps: 0, campaigns: 0 };
  try {
    const cmsRes = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (cmsRes.rows.length > 0 && cmsRes.rows[0].founderMessageEn) {
      const parsed = JSON.parse(cmsRes.rows[0].founderMessageEn);
      if (parsed.statsOffsets) offsets = parsed.statsOffsets;
    }
  } catch (e) {
  }
  try {
    const bRes = await pool.query("SELECT COUNT(*) FROM card_applications_v2");
    beneficiaries = parseInt(bRes.rows[0].count, 10);
  } catch (e) {
  }
  try {
    const vRes = await pool.query("SELECT COUNT(*) FROM volunteers");
    volunteers = parseInt(vRes.rows[0].count, 10);
  } catch (e) {
  }
  try {
    const hRes = await pool.query("SELECT COUNT(*) FROM health_camps");
    healthCamps = parseInt(hRes.rows[0].count, 10);
  } catch (e) {
  }
  try {
    const sRes = await pool.query(`SELECT COUNT(*) FROM service_submissions_v2 WHERE "serviceName" = 'Scholarships Support' OR "serviceNameEn" = 'Scholarships Support' OR "serviceName" = 'Campaigns'`);
    campaigns = parseInt(sRes.rows[0].count, 10);
  } catch (e) {
  }
  const data = { beneficiaries: beneficiaries + (offsets.beneficiaries || 0), volunteers: volunteers + (offsets.volunteers || 0), healthCamps: healthCamps + (offsets.healthCamps || 0), campaigns: campaigns + (offsets.campaigns || 0) };
  apiCache.set("/api/stats", { data, timestamp: Date.now() });
  res.json(data);
});
var MOCK_JOBS = [
  { id: "job_01", title: "Primary School Teacher", company: "Bhopal District Schools", location: "Bhopal, MP", type: "Full-Time", salary: "\u20B918,000 - \u20B925,000 / month", description: "Looking for dedicated teachers for local government primary schools." },
  { id: "job_02", title: "Data Entry Operator", company: "Smart City Org", location: "Indore, MP", type: "Contract", salary: "\u20B912,000 / month", description: "Requires basic computer skills and Hindi typing." },
  { id: "job_03", title: "Nursing Staff", company: "Apollo Seva Hospital", location: "Jabalpur, MP", type: "Full-Time", salary: "\u20B922,000 - \u20B930,000 / month", description: "Urgent hiring for registered nurses for the emergency ward." },
  { id: "job_04", title: "Delivery Executive", company: "Kisan Fresh", location: "Multiple Locations", type: "Part-Time", salary: "\u20B915,000 + Fuel", description: "Deliver fresh produce directly from farmers to city markets." }
];
router14.get("/api/jobs", async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM job_listings ORDER BY posted_at DESC");
    if (result.rows.length === 0) {
      for (const job of MOCK_JOBS) await pool.query("INSERT INTO job_listings (id, title, company, location, type, salary, description) VALUES ($1, $2, $3, $4, $5, $6, $7)", [job.id, job.title, job.company, job.location, job.type, job.salary, job.description]);
      result = await pool.query("SELECT * FROM job_listings ORDER BY posted_at DESC");
    }
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});
router14.get("/api/culture/panchang", async (req, res) => {
  try {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let result = await pool.query("SELECT * FROM panchang_calendar WHERE date = $1", [today]);
    if (result.rows.length === 0) {
      const mockPanchang = { date: today, tithi: "Shukla Paksha Ekadashi", nakshatra: "Rohini", sunrise: "05:42 AM", sunset: "07:11 PM", moonrise: "03:15 PM", moonset: "02:10 AM", festivals: "Nirjala Ekadashi" };
      await pool.query("INSERT INTO panchang_calendar (date, tithi, nakshatra, sunrise, sunset, moonrise, moonset, festivals) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [today, mockPanchang.tithi, mockPanchang.nakshatra, mockPanchang.sunrise, mockPanchang.sunset, mockPanchang.moonrise, mockPanchang.moonset, mockPanchang.festivals]);
      result = await pool.query("SELECT * FROM panchang_calendar WHERE date = $1", [today]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching panchang:", err);
    res.status(500).json({ error: "Failed to fetch panchang" });
  }
});
router14.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });
    await pool.query("INSERT INTO chat_history (session_id, role, content) VALUES ($1, $2, $3)", [sessionId, "user", message]);
    let responseText = "I'm a helpful AI assistant. I can help you navigate the platform, translate text, or answer basic questions.";
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) responseText = "Namaste! How can I assist you today? You can ask me about Jobs, Panchang, or how to use the RPF platform.";
    else if (lowerMessage.includes("job") || lowerMessage.includes("work")) responseText = "We have several job listings available! You can find them under the 'Jobs & Internships' section. I can also help you build your resume.";
    else if (lowerMessage.includes("panchang") || lowerMessage.includes("calendar") || lowerMessage.includes("festival")) responseText = "You can view today's Tithi, Nakshatra, and auspicious timings in the 'Culture & Heritage' section.";
    else if (lowerMessage.includes("thank")) responseText = "You're welcome! Let me know if you need anything else.";
    else if (lowerMessage.includes("translate")) responseText = "I can translate text between English and Hindi for you. Just type the phrase and ask me to translate it!";
    await new Promise((resolve) => setTimeout(resolve, 800));
    await pool.query("INSERT INTO chat_history (session_id, role, content) VALUES ($1, $2, $3)", [sessionId, "assistant", responseText]);
    res.json({ reply: responseText });
  } catch (err) {
    console.error("Error in AI chat:", err);
    res.status(500).json({ error: "Failed to process chat" });
  }
});
router14.get("/api/ai/chat/history", async (req, res) => {
  try {
    const { sessionId = "default" } = req.query;
    const result = await pool.query("SELECT role, content FROM chat_history WHERE session_id = $1 ORDER BY timestamp ASC LIMIT 50", [sessionId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});
var miscRoutes_default = router14;

// src/routes/volunteerRoutes.ts
var import_express15 = __toESM(require("express"), 1);
var import_crypto11 = __toESM(require("crypto"), 1);
var router15 = import_express15.default.Router();
router15.put("/api/volunteers/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(`UPDATE volunteers SET approval_status = $1 WHERE id = $2`, [status, id]);
    res.json({ success: true, message: "Volunteer status updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router15.put("/api/volunteers/:id/allocate", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { allocation } = req.body;
    await pool.query(`UPDATE volunteers SET constituency_allocation = $1 WHERE id = $2`, [allocation, id]);
    res.json({ success: true, message: "Volunteer allocated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router15.post("/api/volunteers/report", authenticateToken, async (req, res) => {
  try {
    const { volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng } = req.body;
    await pool.query(`INSERT INTO volunteer_reports (id, volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [import_crypto11.default.randomUUID(), volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng]);
    res.json({ success: true, message: "Report submitted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router15.get("/api/volunteers/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, registration_number, full_name, mobile, email, avatar, "registeredAt", approval_status FROM volunteers WHERE id = $1 LIMIT 1`, [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: "Volunteer record not found" });
    res.json({ success: true, volunteer: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router15.get("/api/volunteers/me/certificates", async (req, res) => {
  try {
    const { volunteer_id } = req.query;
    const result = await pool.query(`SELECT * FROM certificates WHERE volunteer_id = $1 ORDER BY issue_date DESC`, [volunteer_id]);
    res.json({ success: true, certificates: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router15.post("/api/volunteer_tasks", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { volunteerId, titleEn, titleHi, descriptionEn, descriptionHi } = req.body;
    await pool.query('INSERT INTO volunteer_tasks ("volunteerId", "titleEn", "titleHi", "descriptionEn", "descriptionHi", status) VALUES ($1, $2, $3, $4, $5, $6)', [volunteerId, titleEn, titleHi, descriptionEn, descriptionHi || 10, "assigned"]);
    res.json({ success: true, message: "Task assigned successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router15.get("/api/volunteer_tasks", async (req, res) => {
  try {
    const volunteerId = req.query.volunteerId;
    if (!volunteerId) return res.status(400).json({ error: "Missing volunteerId parameter" });
    const result = await pool.query('SELECT id, "volunteerId", "titleEn", "titleHi", "descriptionEn", "descriptionHi", status, "createdAt" FROM volunteer_tasks WHERE "volunteerId" = $1', [volunteerId]);
    res.json({ success: true, tasks: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router15.patch("/api/volunteer_tasks/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const taskRes = await pool.query('UPDATE volunteer_tasks SET status = $1 WHERE id = $2 RETURNING "volunteerId"', [status, id]);
    if (taskRes.rows.length > 0 && status === "completed") {
      await pool.query("UPDATE users SET points = COALESCE(points, 0) + $1 WHERE id = $2", [10, taskRes.rows[0].volunteerId]);
    }
    res.json({ success: true, message: "Task status updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router15.post("/api/volunteers", authenticateToken, async (req, res) => {
  try {
    const { name, phone, skills } = req.body;
    const userId = req.user.id;
    await pool.query(`UPDATE users SET "isVolunteer" = true WHERE id = $1`, [userId]);
    const volCheck = await pool.query(`SELECT id FROM volunteers WHERE id = $1`, [userId]);
    if (volCheck.rows.length === 0) {
      const userRes = await pool.query(`SELECT username, email FROM users WHERE id = $1`, [userId]);
      const username = userRes.rows[0]?.username || `user_${userId.slice(-6)}`;
      const email = userRes.rows[0]?.email || null;
      const regNumber = "RPF-" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + Math.floor(1e3 + Math.random() * 9e3);
      await pool.query(`INSERT INTO volunteers (id, username, registration_number, full_name, mobile, email, skills, approval_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [userId, username, regNumber, name || "Citizen", phone || "", email, JSON.stringify(skills ? skills.split(", ") : []), "approved"]);
    } else {
      await pool.query(`UPDATE volunteers SET skills = $1, full_name = $2, mobile = $3 WHERE id = $4`, [JSON.stringify(skills ? skills.split(", ") : []), name || "Citizen", phone || "", userId]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating volunteer record:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
router15.get("/api/volunteers", async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, full_name as name, email, mobile as phone, approval_status as status, "registeredAt" FROM volunteers ORDER BY "registeredAt" DESC');
    res.json({ volunteers: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router15.delete("/api/volunteers/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM volunteers WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router15.get("/api/community/chat/messages", async (_req, res) => {
  try {
    const result = await pool.query(`SELECT id, "authorName", "authorAvatar", text, "createdAt" FROM community_chat_messages ORDER BY "createdAt" DESC LIMIT 50`);
    res.json({ success: true, data: result.rows.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router15.get("/api/public/volunteers", async (req, res) => {
  try {
    const { city, skill } = req.query;
    const conditions = [`approval_status = 'approved'`];
    const params = [];
    if (city) {
      params.push(`%${city}%`);
      conditions.push(`city ILIKE $${params.length}`);
    }
    if (skill) {
      params.push(`%${skill}%`);
      conditions.push(`skills::text ILIKE $${params.length}`);
    }
    const result = await pool.query(`SELECT id, full_name AS name, avatar, city, area_locality, skills, availability, role, constituency_allocation, "registeredAt" FROM volunteers WHERE ${conditions.join(" AND ")} ORDER BY full_name ASC`, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
var volunteerRoutes_default = router15;

// src/routes/certificateRoutes.ts
var import_express16 = __toESM(require("express"), 1);
var import_pdf_lib = require("pdf-lib");
var import_path2 = __toESM(require("path"), 1);
var router16 = import_express16.default.Router();
router16.get("/api/certificates/verify/:certificate_id", async (req, res) => {
  try {
    const certId = req.params.certificate_id;
    const certRes = await pool.query(`SELECT * FROM certificates WHERE certificate_id = $1`, [certId]);
    if (certRes.rows.length === 0) return res.status(404).json({ error: "Certificate not found or invalid." });
    const cert = certRes.rows[0];
    const volRes = await pool.query(`SELECT full_name, registration_number, city, state FROM volunteers WHERE id = $1`, [cert.volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const vol = volRes.rows[0];
    res.json({
      success: true,
      data: {
        certificate_id: cert.certificate_id,
        volunteer_name: vol.full_name,
        registration_number: vol.registration_number,
        service_name: cert.service_id.replace(/-/g, " ").toUpperCase(),
        issue_date: cert.issue_date,
        location: `${vol.city}, ${vol.state}`
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router16.get("/api/certificates/download/:id", async (req, res) => {
  try {
    const certId = req.params.id;
    const certRes = await pool.query(`SELECT * FROM certificates WHERE id = $1 OR certificate_id = $1`, [certId]);
    if (certRes.rows.length === 0) return res.status(404).json({ error: "Certificate not found" });
    const cert = certRes.rows[0];
    const volRes = await pool.query(`SELECT full_name, registration_number, city, state FROM volunteers WHERE id = $1`, [cert.volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const vol = volRes.rows[0];
    let sigs = { signatory_1_name: "Rohit Pandit", signatory_1_designation: "Founder", signatory_2_name: "", signatory_2_designation: "" };
    const sigRes = await pool.query(`SELECT * FROM service_signatures WHERE service_id = $1`, [cert.service_id]);
    if (sigRes.rows.length > 0) sigs = sigRes.rows[0];
    const pdfDoc = await import_pdf_lib.PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(import_pdf_lib.StandardFonts.HelveticaBold);
    const fontNormal = await pdfDoc.embedFont(import_pdf_lib.StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(import_pdf_lib.StandardFonts.HelveticaOblique);
    page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: (0, import_pdf_lib.rgb)(0.1, 0.3, 0.6), borderWidth: 4 });
    page.drawRectangle({ x: 25, y: 25, width: width - 50, height: height - 50, borderColor: (0, import_pdf_lib.rgb)(0.8, 0.6, 0.2), borderWidth: 2 });
    const logoPath = import_path2.default.join(process.cwd(), "public", "assets", "logo.png");
    if (require("fs").existsSync(logoPath)) {
      const logoImageBytes = require("fs").readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoImageBytes);
      const logoDims = logoImage.scale(0.15);
      page.drawImage(logoImage, {
        x: width / 2 - logoDims.width / 2,
        y: height - logoDims.height - 35,
        width: logoDims.width,
        height: logoDims.height
      });
    }
    page.drawText("RP FOUNDATION", { x: width / 2 - 120, y: height - 120, size: 30, font, color: (0, import_pdf_lib.rgb)(0.1, 0.2, 0.5) });
    page.drawText("CERTIFICATE OF APPRECIATION", { x: width / 2 - 200, y: height - 160, size: 24, font, color: (0, import_pdf_lib.rgb)(0.8, 0.6, 0.2) });
    page.drawText("CERTIFICATE OF APPRECIATION", { x: width / 2 - 200, y: height - 160, size: 24, font, color: (0, import_pdf_lib.rgb)(0.8, 0.6, 0.2) });
    page.drawText(`Certificate ID: ${cert.certificate_id}`, { x: 50, y: height - 80, size: 10, font: fontNormal });
    page.drawText(`Date: ${new Date(cert.issue_date).toLocaleDateString()}`, { x: width - 150, y: height - 80, size: 10, font: fontNormal });
    page.drawText("This is proudly presented to", { x: width / 2 - 100, y: height - 230, size: 14, font: fontItalic });
    const nameWidth = font.widthOfTextAtSize(vol.full_name, 36);
    page.drawText(vol.full_name, { x: (width - nameWidth) / 2, y: height - 320, size: 36, font, color: (0, import_pdf_lib.rgb)(0.1, 0.1, 0.1) });
    page.drawText(`Reg No: ${vol.registration_number} | ${vol.city}, ${vol.state}`, { x: width / 2 - 120, y: height - 320, size: 12, font: fontNormal });
    page.drawText(`In recognition of their outstanding contribution and dedication to the`, { x: width / 2 - 200, y: height - 400, size: 14, font: fontNormal });
    const serviceName = cert.service_id.replace(/-/g, " ").toUpperCase() + " SERVICE";
    const svcWidth = font.widthOfTextAtSize(serviceName, 18);
    page.drawText(serviceName, { x: (width - svcWidth) / 2, y: height - 400, size: 18, font, color: (0, import_pdf_lib.rgb)(0.1, 0.3, 0.6) });
    page.drawLine({ start: { x: 100, y: 120 }, end: { x: 300, y: 120 }, thickness: 1, color: (0, import_pdf_lib.rgb)(0, 0, 0) });
    page.drawText(sigs.signatory_1_name, { x: 110, y: 100, size: 12, font });
    page.drawText(sigs.signatory_1_designation, { x: 110, y: 85, size: 10, font: fontItalic, color: (0, import_pdf_lib.rgb)(0.3, 0.3, 0.3) });
    if (sigs.signatory_2_name) {
      page.drawLine({ start: { x: width - 300, y: 120 }, end: { x: width - 100, y: 120 }, thickness: 1, color: (0, import_pdf_lib.rgb)(0, 0, 0) });
      page.drawText(sigs.signatory_2_name, { x: width - 290, y: 100, size: 12, font });
      page.drawText(sigs.signatory_2_designation, { x: width - 290, y: 85, size: 10, font: fontItalic, color: (0, import_pdf_lib.rgb)(0.3, 0.3, 0.3) });
    }
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Certificate_${cert.certificate_id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var certificateRoutes_default = router16;

// src/routes/communityRoutes.ts
var import_express17 = __toESM(require("express"), 1);
var import_crypto12 = __toESM(require("crypto"), 1);
var router17 = import_express17.default.Router();
router17.get("/api/community_posts", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM community_posts ORDER BY "createdAt" DESC');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router17.post("/api/community_posts", async (req, res) => {
  try {
    const { authorName, authorPhone, authorRole, textEn, textHi, segment, location, imageUrl, likes, likedByMe, createdAt } = req.body;
    const id = import_crypto12.default.randomUUID();
    await pool.query(
      `INSERT INTO community_posts (id, "authorName", "authorPhone", "authorRole", "textEn", "textHi", segment, location, "imageUrl", likes, "likedByMe", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, authorName, authorPhone, authorRole, textEn, textHi, segment, location, imageUrl, likes, likedByMe, createdAt || /* @__PURE__ */ new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router17.put("/api/community_posts/:id", async (req, res) => {
  try {
    const { likes, likedByMe } = req.body;
    await pool.query('UPDATE community_posts SET likes = $1, "likedByMe" = $2 WHERE id = $3', [likes, likedByMe, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router17.get("/api/blogs", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs WHERE approved = true ORDER BY "publishedAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router17.get("/api/blogs/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs ORDER BY "createdAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router17.post("/api/blogs", authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, error: "Title and Content are required" });
    const id = import_crypto12.default.randomUUID();
    const authorName = req.user.displayName || req.user.name || "Anonymous Volunteer";
    const authorId = req.user.id;
    await pool.query(
      `INSERT INTO blogs (id, title, content, "authorName", "authorId", approved, "createdAt") VALUES ($1, $2, $3, $4, $5, false, NOW())`,
      [id, title, content, authorName, authorId]
    );
    res.json({ success: true, message: "Blog post submitted for admin approval" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router17.put("/api/blogs/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE blogs SET approved = true, "publishedAt" = NOW() WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: "Blog approved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router17.delete("/api/blogs/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM blogs WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: "Blog deleted/rejected successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router17.get("/api/social", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link, "createdAt" FROM social_posts ORDER BY "createdAt" DESC'
    );
    res.json({ posts: result.rows });
  } catch (error) {
    console.error("Error fetching social posts:", error);
    res.status(500).json({ error: error.message });
  }
});
router17.post("/api/social", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { author, role, avatar, textEn, textHi, image, platform, link } = req.body;
    const id = import_crypto12.default.randomUUID();
    await pool.query(
      `INSERT INTO social_posts 
       (id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, false, $8, $9, $10)`,
      [
        id,
        author,
        role,
        avatar || "",
        textEn,
        textHi,
        image || "",
        platform || "instagram",
        link || "",
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true, id });
  } catch (error) {
    console.error("Error creating social post:", error);
    res.status(500).json({ error: error.message });
  }
});
router17.post("/api/social/like", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await pool.query("SELECT liked, likes FROM social_posts WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      const post = result.rows[0];
      const liked = !post.liked;
      const likes = liked ? post.likes + 1 : Math.max(0, post.likes - 1);
      await pool.query("UPDATE social_posts SET liked = $1, likes = $2 WHERE id = $3", [liked, likes, id]);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: error.message });
  }
});
router17.delete("/api/social/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM social_posts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router17.post("/api/social/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { author, role, avatar, textEn, textHi, image, platform, link } = req.body;
    await pool.query(
      `UPDATE social_posts SET 
       author = $1, role = $2, avatar = $3, "textEn" = $4, "textHi" = $5, 
       image = $6, platform = $7, link = $8 
       WHERE id = $9`,
      [author, role, avatar, textEn, textHi, image, platform, link, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var communityRoutes_default = router17;

// src/routes/jobRoutes.ts
var import_express18 = __toESM(require("express"), 1);
var import_crypto13 = __toESM(require("crypto"), 1);
var router18 = import_express18.default.Router();
router18.get("/api/jobs", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "company", "locEn", "locHi", "salary", "typeEn", "typeHi", "postedAt" FROM jobs ORDER BY "postedAt" DESC'
    );
    res.json({ jobs: result.rows });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/api/jobs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, locEn, locHi, salary, typeEn, typeHi, company } = req.body;
    const id = import_crypto13.default.randomUUID();
    const result = await pool.query(
      `INSERT INTO jobs 
       (id, "titleEn", "titleHi", "company", "locEn", "locHi", "salary", "typeEn", "typeHi", "postedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id`,
      [
        id,
        titleEn,
        titleHi,
        company,
        locEn,
        locHi,
        salary,
        typeEn,
        typeHi,
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.delete("/api/jobs/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM jobs WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router18.post("/api/jobs/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, company, locEn, locHi, salary, typeEn, typeHi } = req.body;
    await pool.query(
      `UPDATE jobs SET 
       "titleEn" = $1, "titleHi" = $2, company = $3, "locEn" = $4, "locHi" = $5, 
       salary = $6, "typeEn" = $7, "typeHi" = $8 
       WHERE id = $9`,
      [titleEn, titleHi, company, locEn, locHi, salary, typeEn, typeHi, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router18.post("/api/job_applications", async (req, res) => {
  try {
    const { jobId, jobTitle, fullName, phone, resume } = req.body;
    const id = import_crypto13.default.randomUUID();
    await pool.query(
      `INSERT INTO job_applications (id, "jobId", "jobTitle", "fullName", phone, resume, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, jobId, jobTitle, fullName, phone, resume || "", (/* @__PURE__ */ new Date()).toISOString()]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving job application:", error);
    res.status(500).json({ error: error.message });
  }
});
var jobRoutes_default = router18;

// src/utils/fcm.ts
var import_app = require("firebase-admin/app");
var import_messaging = require("firebase-admin/messaging");
var sendPushNotification = async (fcmToken, title, body) => {
  try {
    if (!(0, import_app.getApps)().length) return false;
    if (!fcmToken) return false;
    await (0, import_messaging.getMessaging)().send({
      token: fcmToken,
      notification: { title, body },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK"
        // Optional for app routing
      }
    });
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
};

// src/routes/donationRoutes.ts
var import_express19 = __toESM(require("express"), 1);
var import_bcryptjs4 = __toESM(require("bcryptjs"), 1);
var import_crypto14 = __toESM(require("crypto"), 1);
var router19 = import_express19.default.Router();
var BLOOD_GROUPS = /* @__PURE__ */ new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
var VALID_URGENCY = /* @__PURE__ */ new Set(["Normal", "Urgent", "Emergency"]);
var EMAIL_DOMAINS = /* @__PURE__ */ new Set(["gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "rediffmail.com", "rediff.com", "zoho.com", "peoplesuniversity.edu.in"]);
var USERNAME_REGEX2 = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
var RESERVED_USERNAMES2 = /* @__PURE__ */ new Set(["admin", "root", "superuser", "system", "moderator", "guest", "anonymous"]);
var schemaReady = null;
var ensureBloodSchema = async () => {
  if (!schemaReady) schemaReady = (async () => {
    await pool.query(`
      ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255);
      ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(500);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_volunteers_username_lower ON volunteers (LOWER(username)) WHERE username IS NOT NULL;
      CREATE TABLE IF NOT EXISTS volunteer_blood_memberships (volunteer_id VARCHAR(255) PRIMARY KEY,blood_group VARCHAR(10) NOT NULL,is_active BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS blood_request_acceptances (id VARCHAR(36) PRIMARY KEY,request_id UUID NOT NULL,volunteer_id VARCHAR(255) NOT NULL,status VARCHAR(30) NOT NULL DEFAULT 'accepted',expires_at TIMESTAMPTZ NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(request_id,volunteer_id));
      CREATE TABLE IF NOT EXISTS app_notifications (id VARCHAR(36) PRIMARY KEY,recipient_id VARCHAR(255) NOT NULL,title TEXT NOT NULL,message TEXT NOT NULL,type VARCHAR(50) NOT NULL DEFAULT 'general',reference_id VARCHAR(255),is_read BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_blood_request_group_status ON blood_requests(blood_group,status);
      CREATE INDEX IF NOT EXISTS idx_blood_acceptance_expiry ON blood_request_acceptances(expires_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON app_notifications(recipient_id,created_at DESC);
    `);
  })().catch((err) => {
    schemaReady = null;
    throw err;
  });
  return schemaReady;
};
var required = (v) => typeof v === "string" ? v.trim().length > 0 : v !== void 0 && v !== null;
var emailAllowed = (email) => {
  const m = email.trim().toLowerCase().match(/^[^\s@]+@([^\s@]+)$/);
  return !!m && EMAIL_DOMAINS.has(m[1]);
};
var ageFromDob = (dob) => {
  const d = /* @__PURE__ */ new Date(`${dob}T00:00:00`);
  if (Number.isNaN(d.getTime())) return -1;
  const n = /* @__PURE__ */ new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n.getMonth() < d.getMonth() || n.getMonth() === d.getMonth() && n.getDate() < d.getDate()) a--;
  return a;
};
router19.get("/api/auth/check-username", async (req, res) => {
  try {
    await ensureBloodSchema();
    const username = String(req.query.username || "").trim().toLowerCase();
    if (!username) return res.json({ available: false, error: "User ID is required." });
    if (!USERNAME_REGEX2.test(username)) return res.json({ available: false, error: "Use 3-20 characters, starting with a letter; only letters, numbers, . and _ are allowed." });
    if (RESERVED_USERNAMES2.has(username)) return res.json({ available: false, error: "This User ID is reserved." });
    const v = await pool.query("SELECT id FROM volunteers WHERE LOWER(username)=LOWER($1) LIMIT 1", [username]);
    let u = { rows: [] };
    try {
      u = await pool.query("SELECT id FROM users WHERE LOWER(username)=LOWER($1) LIMIT 1", [username]);
    } catch {
    }
    return res.json({ available: v.rows.length === 0 && u.rows.length === 0 });
  } catch (error) {
    console.error("Username availability error:", error);
    return res.status(500).json({ available: false, error: "Unable to check User ID availability right now." });
  }
});
router19.post("/api/volunteer-registration/submit", async (req, res) => {
  try {
    await ensureBloodSchema();
    const d = req.body || {};
    const fullName = String(d.full_name || d.first_name || "").trim();
    const requiredFields = { username: d.username, full_name: fullName, father_husband_name: d.father_husband_name, mother_name: d.mother_name, dob: d.dob, isd_code: d.isd_code, mobile: d.mobile, email: d.email, blood_group: d.blood_group, country: d.country, state: d.state, city: d.city, pincode: d.pincode, area_locality: d.area_locality, address: d.address, ward_no: d.ward_no, password: d.password, confirm_password: d.confirm_password, blood_network_ready: d.blood_network_ready };
    if (String(d.country || "").trim() === "India") {
      requiredFields.sansad_kshetra = d.sansad_kshetra;
      requiredFields.vidhan_sabha = d.vidhan_sabha;
    }
    const missing = Object.entries(requiredFields).filter(([, v]) => !required(v) && v !== false).map(([k]) => k);
    if (missing.length) return res.status(400).json({ success: false, error: `Please fill these fields before continuing: ${missing.join(", ")}` });
    const username = String(d.username).trim().toLowerCase();
    if (!USERNAME_REGEX2.test(username)) return res.status(400).json({ success: false, error: "User ID must be 3-20 characters, start with a letter, and contain only letters, numbers, . or _." });
    if (RESERVED_USERNAMES2.has(username)) return res.status(400).json({ success: false, error: "This User ID is reserved. Please choose another." });
    const age = ageFromDob(String(d.dob));
    if (age < 0) return res.status(400).json({ success: false, error: "Invalid date of birth." });
    if (age < 16) return res.status(403).json({ success: false, code: "MINOR", error: "You are Minor, Not Eligible Now" });
    const email = String(d.email).trim().toLowerCase();
    if (!emailAllowed(email)) return res.status(400).json({ success: false, error: "Only Gmail, Yahoo, Rediff, Zoho, or @peoplesuniversity.edu.in email addresses are accepted." });
    const bloodGroup = String(d.blood_group).trim().toUpperCase();
    if (!BLOOD_GROUPS.has(bloodGroup)) return res.status(400).json({ success: false, error: "Please select a valid Blood Group." });
    const password = String(d.password);
    if (password.length < 8) return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });
    if (password !== String(d.confirm_password)) return res.status(400).json({ success: false, error: "Passwords do not match." });
    const mobile = String(d.mobile).replace(/\s+/g, "");
    const isd = String(d.isd_code).replace(/[^+\d]/g, "");
    if (!/^\+?\d{1,4}$/.test(isd) || !/^[0-9]{6,15}$/.test(mobile)) return res.status(400).json({ success: false, error: "Please enter a valid ISD code and mobile number." });
    const duplicate = await pool.query("SELECT id FROM volunteers WHERE mobile=$1 OR LOWER(email)=LOWER($2) OR LOWER(username)=LOWER($3) LIMIT 1", [mobile, email, username]);
    if (duplicate.rows.length) return res.status(409).json({ success: false, error: "This User ID, mobile number, or email is already registered." });
    const id = import_crypto14.default.randomUUID();
    const registrationNumber = `RPF/VOL/${(/* @__PURE__ */ new Date()).getFullYear().toString().slice(-2)}/${Math.floor(1e5 + Math.random() * 9e5)}`;
    const passwordHash = await import_bcryptjs4.default.hash(password, 12);
    await pool.query("BEGIN");
    try {
      await pool.query(`INSERT INTO volunteers (id,username,registration_number,full_name,father_husband_name,mother_name,approval_status,dob,mobile,email,blood_group,country,state,city,address,pincode,area_locality,sansad_kshetra,vidhan_sabha,ward_no,password_hash) VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`, [id, username, registrationNumber, fullName, String(d.father_husband_name).trim(), String(d.mother_name).trim(), d.dob, mobile, email, bloodGroup, String(d.country).trim(), String(d.state).trim(), String(d.city).trim(), String(d.address).trim(), String(d.pincode).trim(), String(d.area_locality).trim(), String(d.sansad_kshetra || "").trim(), String(d.vidhan_sabha || "").trim(), String(d.ward_no).trim(), passwordHash]);
      if (d.blood_network_ready === true || String(d.blood_network_ready).toLowerCase() === "true") await pool.query(`INSERT INTO volunteer_blood_memberships(volunteer_id,blood_group,is_active) VALUES($1,$2,TRUE) ON CONFLICT(volunteer_id) DO UPDATE SET blood_group=EXCLUDED.blood_group,is_active=TRUE,updated_at=NOW()`, [id, bloodGroup]);
      await pool.query("COMMIT");
    } catch (e) {
      await pool.query("ROLLBACK");
      throw e;
    }
    res.json({ success: true, registration_number: registrationNumber, username, blood_network: !!(d.blood_network_ready === true || String(d.blood_network_ready).toLowerCase() === "true") });
  } catch (error) {
    console.error("Volunteer registration error:", error);
    if (error.code === "23505") return res.status(409).json({ success: false, error: "This User ID, mobile number, or email is already registered." });
    res.status(500).json({ success: false, error: "Registration failed. Please try again." });
  }
});
var resolveVolunteer = async (rawId) => {
  const key = String(rawId || "").trim();
  if (!key) return null;
  const r = await pool.query(`SELECT id,username,full_name,mobile,email,blood_group FROM volunteers WHERE id=$1 OR LOWER(username)=LOWER($1) OR mobile=$1 OR LOWER(email)=LOWER($1) LIMIT 1`, [key]);
  return r.rows[0] || null;
};
router19.get("/api/blood-network/access", async (req, res) => {
  try {
    await ensureBloodSchema();
    const volunteer = await resolveVolunteer(String(req.query.volunteerId || ""));
    if (!volunteer) return res.status(404).json({ success: false, error: "Volunteer account not found." });
    const m = await pool.query("SELECT blood_group,is_active FROM volunteer_blood_memberships WHERE volunteer_id=$1 AND is_active=TRUE", [volunteer.id]);
    res.json({ success: true, member: m.rows.length > 0, volunteer: { ...volunteer, blood_group: m.rows[0]?.blood_group || volunteer.blood_group || null } });
  } catch (error) {
    console.error("Blood access error:", error);
    res.status(500).json({ success: false, error: "Unable to check Blood Donation Network access." });
  }
});
router19.post("/api/blood-network/join", async (req, res) => {
  try {
    await ensureBloodSchema();
    const volunteer = await resolveVolunteer(String(req.body?.volunteerId || ""));
    const bloodGroup = String(req.body?.bloodGroup || "").trim().toUpperCase();
    if (!volunteer) return res.status(404).json({ success: false, error: "Volunteer account not found. Please log in again." });
    if (!BLOOD_GROUPS.has(bloodGroup)) return res.status(400).json({ success: false, error: "Please select your Blood Group to become a member." });
    await pool.query("BEGIN");
    try {
      await pool.query("UPDATE volunteers SET blood_group=$1 WHERE id=$2", [bloodGroup, volunteer.id]);
      await pool.query(`INSERT INTO volunteer_blood_memberships(volunteer_id,blood_group,is_active) VALUES($1,$2,TRUE) ON CONFLICT(volunteer_id) DO UPDATE SET blood_group=EXCLUDED.blood_group,is_active=TRUE,updated_at=NOW()`, [volunteer.id, bloodGroup]);
      await pool.query("COMMIT");
    } catch (e) {
      await pool.query("ROLLBACK");
      throw e;
    }
    res.json({ success: true, bloodGroup });
  } catch (error) {
    console.error("Blood join error:", error);
    res.status(500).json({ success: false, error: String(error.message || error) });
  }
});
router19.post("/api/blood-network/requests", async (req, res) => {
  try {
    await ensureBloodSchema();
    const { requesterId, patientName, bloodGroup, unitsRequired, hospitalName, contactPhone, locationLat, locationLng, urgency, notes } = req.body || {};
    const requester = await resolveVolunteer(requesterId);
    if (!requester) return res.status(404).json({ success: false, error: "Volunteer account not found." });
    if (![patientName, bloodGroup, unitsRequired, hospitalName, contactPhone].every(required)) return res.status(400).json({ success: false, error: "All requisition fields are mandatory." });
    const group = String(bloodGroup).toUpperCase();
    if (!BLOOD_GROUPS.has(group)) return res.status(400).json({ success: false, error: "Invalid blood group." });
    const qty = Number(unitsRequired);
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ success: false, error: "Units required must be at least 1." });
    const urgencyValue = VALID_URGENCY.has(String(urgency)) ? String(urgency) : "Normal";
    const rr = await pool.query(`INSERT INTO blood_requests(requester_id,patient_name,blood_group,units_required,hospital_name,location_lat,location_lng,urgency,contact_phone,status,notes,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'open',$10,NOW()+INTERVAL '48 hours') RETURNING *`, [requester.id, String(patientName).trim(), group, qty, String(hospitalName).trim(), locationLat || null, locationLng || null, urgencyValue, String(contactPhone).trim(), String(notes || "").trim()]);
    const request = rr.rows[0];
    const matches = await pool.query(`SELECT m.volunteer_id FROM volunteer_blood_memberships m JOIN volunteers v ON v.id=m.volunteer_id WHERE m.is_active=TRUE AND m.blood_group=$1 AND v.id<>$2`, [group, requester.id]);
    for (const match of matches.rows) {
      const title = "Urgent: Blood Request (" + group + ")";
      const body = group + " blood is required at " + request.hospital_name + ". Tap to Accept.";
      await pool.query(`INSERT INTO app_notifications(id,recipient_id,title,message,type,reference_id) VALUES($1,$2,$3,$4,'blood_request',$5)`, [import_crypto14.default.randomUUID(), match.volunteer_id, title, body, request.id]);
      try {
        const t = await pool.query("SELECT fcm_token FROM volunteers WHERE id=$1", [match.volunteer_id]);
        if (t.rows[0]?.fcm_token) await sendPushNotification(t.rows[0].fcm_token, title, body);
      } catch (notificationError) {
        console.warn("FCM notification lookup failed; blood request remains successful:", notificationError);
      }
    }
    res.json({ success: true, request, matchedVolunteers: matches.rowCount });
  } catch (error) {
    console.error("Blood request error:", error);
    res.status(500).json({ success: false, error: "Unable to submit blood requisition." });
  }
});
router19.get("/api/blood-network/requests", async (req, res) => {
  try {
    await ensureBloodSchema();
    await pool.query("DELETE FROM blood_request_acceptances WHERE expires_at<=NOW()");
    const volunteer = await resolveVolunteer(String(req.query.volunteerId || ""));
    if (!volunteer) return res.status(404).json({ success: false, error: "Volunteer account not found." });
    const result = await pool.query(`SELECT r.*,COALESCE(json_agg(json_build_object('volunteer_id',a.volunteer_id,'volunteer_name',v.full_name,'status',a.status,'accepted_at',a.created_at,'expires_at',a.expires_at) ORDER BY a.created_at DESC) FILTER(WHERE a.id IS NOT NULL),'[]') AS acceptances FROM blood_requests r LEFT JOIN blood_request_acceptances a ON a.request_id=r.id AND a.expires_at>NOW() AND a.status='accepted' LEFT JOIN volunteers v ON v.id=a.volunteer_id WHERE r.status='open' AND (r.expires_at IS NULL OR r.expires_at>NOW()) GROUP BY r.id ORDER BY r.created_at DESC LIMIT 100`);
    const m = await pool.query("SELECT blood_group FROM volunteer_blood_memberships WHERE volunteer_id=$1 AND is_active=TRUE", [volunteer.id]);
    const group = m.rows[0]?.blood_group;
    const filtered = group ? result.rows.filter((r) => r.blood_group === group || r.requester_id === volunteer.id) : result.rows.filter((r) => r.requester_id === volunteer.id);
    res.json({ success: true, requests: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: "Unable to load blood requisitions." });
  }
});
router19.post("/api/blood-network/requests/:id/accept", async (req, res) => {
  try {
    await ensureBloodSchema();
    const volunteer = await resolveVolunteer(String(req.body?.volunteerId || ""));
    if (!volunteer) return res.status(404).json({ success: false, error: "Volunteer account not found." });
    const rr = await pool.query(`SELECT * FROM blood_requests WHERE id=$1 AND status='open' AND (expires_at IS NULL OR expires_at>NOW())`, [String(req.params.id)]);
    if (!rr.rows.length) return res.status(404).json({ success: false, error: "This requisition is no longer active." });
    const request = rr.rows[0];
    const member = await pool.query("SELECT blood_group FROM volunteer_blood_memberships WHERE volunteer_id=$1 AND is_active=TRUE", [volunteer.id]);
    if (!member.rows.length) return res.status(403).json({ success: false, error: "You are not part of the Blood Donation Network." });
    if (member.rows[0].blood_group !== request.blood_group) return res.status(403).json({ success: false, error: "Only matching blood-group volunteers can accept this request." });
    if (request.requester_id === volunteer.id) return res.status(400).json({ success: false, error: "You cannot accept your own requisition." });
    await pool.query(`INSERT INTO blood_request_acceptances(id,request_id,volunteer_id,status,expires_at) VALUES($1,$2,$3,'accepted',NOW()+INTERVAL '24 hours') ON CONFLICT(request_id,volunteer_id) DO UPDATE SET status='accepted',expires_at=NOW()+INTERVAL '24 hours'`, [import_crypto14.default.randomUUID(), request.id, volunteer.id]);
    const title = "Blood Request Accepted";
    const body = (volunteer.full_name || "A volunteer") + " has accepted your " + request.blood_group + " blood request.";
    await pool.query(`INSERT INTO app_notifications(id,recipient_id,title,message,type,reference_id) VALUES($1,$2,$3,$4,'blood_acceptance',$5)`, [import_crypto14.default.randomUUID(), request.requester_id, title, body, String(request.id)]);
    try {
      const t2 = await pool.query("SELECT fcm_token FROM volunteers WHERE id=$1", [request.requester_id]);
      if (t2.rows[0]?.fcm_token) await sendPushNotification(t2.rows[0].fcm_token, title, body);
    } catch (notificationError) {
      console.warn("FCM notification lookup failed; acceptance remains successful:", notificationError);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Unable to accept this request." });
  }
});
router19.post("/api/blood-network/requests/:id/cancel", async (req, res) => {
  try {
    await ensureBloodSchema();
    const volunteer = await resolveVolunteer(String(req.body?.actorId || ""));
    if (!volunteer) return res.status(404).json({ success: false, error: "Volunteer account not found." });
    const rr = await pool.query("SELECT requester_id FROM blood_requests WHERE id=$1", [String(req.params.id)]);
    if (!rr.rows.length) return res.status(404).json({ success: false, error: "Request not found." });
    if (rr.rows[0].requester_id === volunteer.id) {
      await pool.query(`UPDATE blood_requests SET status='cancelled' WHERE id=$1`, [String(req.params.id)]);
      await pool.query(`UPDATE blood_request_acceptances SET status='cancelled' WHERE request_id=$1`, [String(req.params.id)]);
    } else await pool.query(`UPDATE blood_request_acceptances SET status='cancelled' WHERE request_id=$1 AND volunteer_id=$2`, [String(req.params.id), volunteer.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Unable to cancel this request." });
  }
});
router19.get("/api/blood-network/notifications", async (req, res) => {
  try {
    await ensureBloodSchema();
    const volunteerId = String(req.query.recipientId || "");
    if (!volunteerId) return res.json({ success: true, notifications: [] });
    const result = await pool.query("SELECT * FROM app_notifications WHERE recipient_id=$1 ORDER BY created_at DESC LIMIT 50", [volunteerId]);
    res.json({ success: true, notifications: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: "Unable to load notifications" });
  }
});
router19.post("/api/save-fcm-token", async (req, res) => {
  try {
    const { volunteerId, token } = req.body;
    if (!volunteerId || !token) return res.status(400).json({ success: false, error: "Missing data" });
    await pool.query("ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(500)");
    await pool.query("UPDATE volunteers SET fcm_token=$1 WHERE id=$2", [token, volunteerId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
var donationRoutes_default = router19;

// src/routes/cmsRoutes.ts
var import_express20 = __toESM(require("express"), 1);
var router20 = import_express20.default.Router();
router20.get("/api/settings", async (req, res) => {
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
        founderMessageEn: "Our mission is simple \u2013 to serve humanity with sincerity, build strong communities, and create a better tomorrow for India.",
        founderMessageHi: "\u0939\u092E\u093E\u0930\u093E \u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F \u0938\u0930\u0932 \u0939\u0948 - \u0928\u093F\u0937\u094D\u0920\u093E \u0915\u0947 \u0938\u093E\u0925 \u092E\u093E\u0928\u0935\u0924\u093E \u0915\u0940 \u0938\u0947\u0935\u093E \u0915\u0930\u0928\u093E, \u092E\u091C\u092C\u0942\u0924 \u0938\u092E\u0941\u0926\u093E\u092F\u094B\u0902 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0928\u093E \u0914\u0930 \u092D\u093E\u0930\u0924 \u0915\u0947 \u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0928\u093E\u0917\u0930\u093F\u0915 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092C\u0947\u0939\u0924\u0930 \u0915\u0932 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0928\u093E\u0964",
        helplinesMarquee: "RP Foundation Toll Free Number: 1800-569-0991, CM Helpline: 181, Emergency Response Support System: 112, Women Helpline: 1090, Ambulance: 108/102, Police Helpline: 100, Fire Emergency: 101, Child Helpline: 1098, Railway Inqury : 139, Airlines Enquiry : 143, Blood Bank: 1910, Voter Helpline: 1950, Cyber Crime Helpline : 1930, LPG Leak Line Helpline: 1906, Natinal Consumer Helpline: 1915, National Narcotis Helpline: 1933, Natural Calaities Helpline: 1070, Road Accident Helpline: 1073"
      };
      await pool.query(
        'INSERT INTO settings (id, "tollFree", "webUrl", email, "founderMessageEn", "founderMessageHi", "helplinesMarquee") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [defaults.id, defaults.tollFree, defaults.webUrl, defaults.email, defaults.founderMessageEn, defaults.founderMessageHi, defaults.helplinesMarquee]
      );
      res.json({ settings: defaults });
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: error.message });
  }
});
router20.post("/api/settings", authenticateToken, authorizeRole("super_admin"), async (req, res) => {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router20.get("/api/admin/services", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { CORE_SERVICES: CORE_SERVICES2 } = await Promise.resolve().then(() => (init_coreServices(), coreServices_exports));
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    let hiddenServiceIds = [];
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      try {
        const parsed = JSON.parse(result.rows[0].founderMessageEn);
        if (Array.isArray(parsed.hiddenServiceIds)) hiddenServiceIds = parsed.hiddenServiceIds;
      } catch (e) {
      }
    }
    const data = CORE_SERVICES2.map((s) => ({ ...s, hidden: hiddenServiceIds.includes(s.id) }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router20.post("/api/admin/services/:id/visibility", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { hidden } = req.body;
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    let cmsData = {};
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      try {
        cmsData = JSON.parse(result.rows[0].founderMessageEn);
      } catch (e) {
        cmsData = {};
      }
    }
    const current = Array.isArray(cmsData.hiddenServiceIds) ? cmsData.hiddenServiceIds : [];
    const next = hidden ? Array.from(/* @__PURE__ */ new Set([...current, id])) : current.filter((sid) => sid !== id);
    cmsData.hiddenServiceIds = next;
    await pool.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1)
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(cmsData)]
    );
    res.json({ success: true, hiddenServiceIds: next });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router20.get("/api/cms/config", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      res.json({ success: true, data: JSON.parse(result.rows[0].founderMessageEn) });
    } else {
      res.json({ success: true, data: {} });
    }
  } catch (error) {
    res.json({ success: true, data: {} });
  }
});
router20.post("/api/cms/config", authenticateToken, authorizeRole("super_admin"), async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1) 
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true, data: req.body });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router20.get("/api/cms", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      let parsed = JSON.parse(result.rows[0].founderMessageEn);
      let modified = false;
      if (!parsed.faqs) {
        parsed.faqs = [
          {
            id: "faq-1",
            questionEn: "What is the Jan Seva Smart ID Card?",
            questionHi: "\u091C\u0928 \u0938\u0947\u0935\u093E \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0906\u0908\u0921\u0940 \u0915\u093E\u0930\u094D\u0921 \u0915\u094D\u092F\u093E \u0939\u0948?",
            answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
            answerHi: "\u092F\u0939 \u092E\u0927\u094D\u092F \u092A\u094D\u0930\u0926\u0947\u0936 \u0915\u0947 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0926\u094D\u0935\u093E\u0930\u093E \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u093F\u092F\u093E \u091C\u093E\u0928\u0947 \u0935\u093E\u0932\u093E \u090F\u0915 \u0921\u093F\u091C\u093F\u091F\u0932 \u0915\u093E\u0930\u094D\u0921 \u0939\u0948, \u091C\u093F\u0938\u0915\u0947 \u092E\u093E\u0927\u094D\u092F\u092E \u0938\u0947 \u0906\u092A \u0938\u092D\u0940 21 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0938\u0947\u0935\u093E\u0913\u0902 \u0915\u093E \u0932\u093E\u092D \u0938\u0930\u0932\u0924\u093E \u0938\u0947 \u0909\u0920\u093E \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964"
          },
          {
            id: "faq-2",
            questionEn: "How long does card approval take?",
            questionHi: "\u0915\u093E\u0930\u094D\u0921 \u0938\u094D\u0935\u0940\u0915\u0943\u0924\u093F \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
            answerHi: "\u0906\u0935\u0947\u0926\u0928 \u091C\u092E\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926, \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u091F\u0940\u092E \u0906\u092A\u0915\u0947 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u094B\u0902 \u0915\u0940 \u091C\u093E\u0902\u091A \u0915\u0930\u0924\u0940 \u0939\u0948 \u0914\u0930 \u0938\u093E\u0927\u093E\u0930\u0923\u0924\u0903 2 \u0938\u0947 3 \u0915\u093E\u0930\u094D\u092F \u0926\u093F\u0935\u0938\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0947 \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0926\u093F\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964"
          },
          {
            id: "faq-3",
            questionEn: "How long does grievance resolution take?",
            questionHi: "\u0936\u093F\u0915\u093E\u092F\u0924 \u0928\u093F\u0935\u093E\u0930\u0923 \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
            answerHi: "\u0938\u092D\u0940 \u0928\u093E\u0917\u0930\u093F\u0915 \u0936\u093F\u0915\u093E\u092F\u0924\u094B\u0902 \u0915\u094B \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926 \u0938\u0940\u0927\u0947 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u092A\u094D\u0930\u0936\u093E\u0938\u0915\u094B\u0902 \u0915\u094B \u092D\u0947\u091C\u093E \u091C\u093E\u0924\u093E \u0939\u0948, \u091C\u094B 48 \u0938\u0947 72 \u0918\u0902\u091F\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0915\u093E \u0938\u092E\u093E\u0927\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u093E \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964"
          }
        ];
        modified = true;
      }
      if (!parsed.aboutTextEn) {
        parsed.aboutTextEn = "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.";
        parsed.aboutTextHi = "\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u090F\u0915 \u0917\u0948\u0930-\u0932\u093E\u092D\u0915\u093E\u0930\u0940 \u0938\u0902\u0917\u0920\u0928 \u0939\u0948 \u091C\u094B \u0938\u092E\u093E\u091C \u0915\u0947 \u0915\u092E\u091C\u094B\u0930 \u0935\u0930\u094D\u0917\u094B\u0902 \u0915\u094B \u0938\u0936\u0915\u094D\u0924 \u092C\u0928\u093E\u0928\u0947, \u0936\u093F\u0915\u094D\u0937\u093E, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F, \u0914\u0930 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0928\u093E\u0917\u0930\u093F\u0915 \u0930\u093E\u0939\u0924 \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927 \u0939\u0948\u0964";
        parsed.logoImgUrl = "/assets/logo.png";
        modified = true;
      }
      if (parsed.quoteOfTheDayEn === void 0) {
        parsed.quoteOfTheDayEn = "Work is worship, and service is the greatest religion.";
        parsed.quoteOfTheDayHi = "\u0915\u0930\u094D\u092E \u0939\u0940 \u092A\u0942\u091C\u093E \u0939\u0948, \u0914\u0930 \u0938\u0947\u0935\u093E \u0939\u0940 \u0938\u092C\u0938\u0947 \u092C\u0921\u093C\u093E \u0927\u0930\u094D\u092E \u0939\u0948\u0964";
        parsed.impactBottomTextEn = "Together, we are making a real difference in people's lives.";
        parsed.impactBottomTextHi = "\u0939\u092E \u0938\u092C \u092E\u093F\u0932\u0915\u0930 \u0932\u094B\u0917\u094B\u0902 \u0915\u0947 \u091C\u0940\u0935\u0928 \u092E\u0947\u0902 \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u092C\u0926\u0932\u093E\u0935 \u0932\u093E \u0930\u0939\u0947 \u0939\u0948\u0902\u0964";
        parsed.statsOffsets = { beneficiaries: 0, volunteers: 0, healthCamps: 0, campaigns: 0 };
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
        aboutTextHi: "\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u090F\u0915 \u0917\u0948\u0930-\u0932\u093E\u092D\u0915\u093E\u0930\u0940 \u0938\u0902\u0917\u0920\u0928 \u0939\u0948 \u091C\u094B \u0938\u092E\u093E\u091C \u0915\u0947 \u0915\u092E\u091C\u094B\u0930 \u0935\u0930\u094D\u0917\u094B\u0902 \u0915\u094B \u0938\u0936\u0915\u094D\u0924 \u092C\u0928\u093E\u0928\u0947, \u0936\u093F\u0915\u094D\u0937\u093E, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F, \u0914\u0930 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0928\u093E\u0917\u0930\u093F\u0915 \u0930\u093E\u0939\u0924 \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927 \u0939\u0948\u0964",
        logoImgUrl: "/assets/logo.png",
        faqs: [
          {
            id: "faq-1",
            questionEn: "What is the Jan Seva Smart ID Card?",
            questionHi: "\u091C\u0928 \u0938\u0947\u0935\u093E \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0906\u0908\u0921\u0940 \u0915\u093E\u0930\u094D\u0921 \u0915\u094D\u092F\u093E \u0939\u0948?",
            answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
            answerHi: "\u092F\u0939 \u092E\u0927\u094D\u092F \u092A\u094D\u0930\u0926\u0947\u0936 \u0915\u0947 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0926\u094D\u0935\u093E\u0930\u093E \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u093F\u092F\u093E \u091C\u093E\u0928\u0947 \u0935\u093E\u0932\u093E \u090F\u0915 \u0921\u093F\u091C\u093F\u091F\u0932 \u0915\u093E\u0930\u094D\u0921 \u0939\u0948, \u091C\u093F\u0938\u0915\u0947 \u092E\u093E\u0927\u094D\u092F\u092E \u0938\u0947 \u0906\u092A \u0938\u092D\u0940 21 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0938\u0947\u0935\u093E\u0913\u0902 \u0915\u093E \u0932\u093E\u092D \u0938\u0930\u0932\u0924\u093E \u0938\u0947 \u0909\u0920\u093E \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964"
          },
          {
            id: "faq-2",
            questionEn: "How long does card approval take?",
            questionHi: "\u0915\u093E\u0930\u094D\u0921 \u0938\u094D\u0935\u0940\u0915\u0943\u0924\u093F \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
            answerHi: "\u0906\u0935\u0947\u0926\u0928 \u091C\u092E\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926, \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u091F\u0940\u092E \u0906\u092A\u0915\u0947 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u094B\u0902 \u0915\u0940 \u091C\u093E\u0902\u091A \u0915\u0930\u0924\u0940 \u0939\u0948 \u0914\u0930 \u0938\u093E\u0927\u093E\u0930\u0923\u0924\u0903 2 \u0938\u0947 3 \u0915\u093E\u0930\u094D\u092F \u0926\u093F\u0935\u0938\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0947 \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0926\u093F\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964"
          },
          {
            id: "faq-3",
            questionEn: "How long does grievance resolution take?",
            questionHi: "\u0936\u093F\u0915\u093E\u092F\u0924 \u0928\u093F\u0935\u093E\u0930\u0923 \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
            answerHi: "\u0938\u092D\u0940 \u0928\u093E\u0917\u0930\u093F\u0915 \u0936\u093F\u0915\u093E\u092F\u0924\u094B\u0902 \u0915\u094B \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926 \u0938\u0940\u0927\u0947 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u092A\u094D\u0930\u0936\u093E\u0938\u0915\u094B\u0902 \u0915\u094B \u092D\u0947\u091C\u093E \u091C\u093E\u0924\u093E \u0939\u0948, \u091C\u094B 48 \u0938\u0947 72 \u0918\u0902\u091F\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0915\u093E \u0938\u092E\u093E\u0927\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u093E \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964"
          }
        ],
        carouselSlides: [
          {
            titleEn: "Together, We Build a Better Tomorrow",
            titleHi: "\u090F\u0915 \u092C\u0947\u0939\u0924\u0930 \u0915\u0932 \u0915\u0947 \u0932\u093F\u090F \u0938\u093E\u0925 \u092E\u093F\u0932\u0915\u0930 \u0906\u0917\u0947 \u092C\u095D\u0947\u0902",
            subEn: "Empowering lives. Strengthening communities.",
            subHi: "\u091C\u0940\u0935\u0928 \u0915\u094B \u0938\u0936\u0915\u094D\u0924 \u092C\u0928\u093E\u0928\u093E\u0964 \u0938\u092E\u0941\u0926\u093E\u092F\u094B\u0902 \u0915\u094B \u0938\u0941\u0926\u0943\u095D \u0915\u0930\u0928\u093E\u0964",
            image: "/assets/mega_camp_banner.png"
          },
          {
            titleEn: "Building a Better Tomorrow for Every Citizen",
            titleHi: "\u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0928\u093E\u0917\u0930\u093F\u0915 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092C\u0947\u0939\u0924\u0930 \u0915\u0932 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923",
            subEn: "We create healthier, stronger, and empowered communities.",
            subHi: "\u0939\u092E \u0938\u094D\u0935\u0938\u094D\u0925, \u0938\u0936\u0915\u094D\u0924 \u0914\u0930 \u0905\u0927\u093F\u0915 \u0938\u092E\u0943\u0926\u094D\u0927 \u0938\u092E\u093E\u091C \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964",
            image: "/assets/water_pump_camp.png"
          }
        ],
        quoteOfTheDayEn: "Work is worship, and service is the greatest religion.",
        quoteOfTheDayHi: "\u0915\u0930\u094D\u092E \u0939\u0940 \u092A\u0942\u091C\u093E \u0939\u0948, \u0914\u0930 \u0938\u0947\u0935\u093E \u0939\u0940 \u0938\u092C\u0938\u0947 \u092C\u0921\u093C\u093E \u0927\u0930\u094D\u092E \u0939\u0948\u0964",
        impactBottomTextEn: "Together, we are making a real difference in people's lives.",
        impactBottomTextHi: "\u0939\u092E \u0938\u092C \u092E\u093F\u0932\u0915\u0930 \u0932\u094B\u0917\u094B\u0902 \u0915\u0947 \u091C\u0940\u0935\u0928 \u092E\u0947\u0902 \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u092C\u0926\u0932\u093E\u0935 \u0932\u093E \u0930\u0939\u0947 \u0939\u0948\u0902\u0964",
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
            descHi: "\u0928\u0935\u0940\u0928\u0924\u092E \u092B\u094B\u091F\u094B, \u0935\u0940\u0921\u093F\u092F\u094B \u0914\u0930 \u0926\u0948\u0928\u093F\u0915 \u0905\u092D\u093F\u092F\u093E\u0928 \u0915\u0940 \u091D\u0932\u0915\u093F\u092F\u093E\u0901\u0964"
          },
          {
            name: "Rohit Pandit (Founder)",
            platform: "instagram",
            handle: "@therohitpandit",
            url: "https://www.instagram.com/therohitpandit/",
            descEn: "Founder Rohit Pandit's personal social updates.",
            descHi: "\u0938\u0902\u0938\u094D\u0925\u093E\u092A\u0915 \u0930\u094B\u0939\u093F\u0924 \u092A\u0902\u0921\u093F\u0924 \u0915\u093E \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u091C\u0928\u0938\u0947\u0935\u093E \u092C\u094D\u0932\u0949\u0917\u0964"
          },
          {
            name: "RP Foundation Facebook",
            platform: "facebook",
            handle: "@rpfofficial",
            url: "https://www.facebook.com/rpfofficial",
            descEn: "Facebook community feeds and welfare program updates.",
            descHi: "\u092B\u0947\u0938\u092C\u0941\u0915 \u0938\u092E\u0941\u0926\u093E\u092F \u0914\u0930 \u091C\u0928 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E\u094B\u0902 \u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940\u0964"
          },
          {
            name: "RP Foundation on X",
            platform: "x",
            handle: "@rpfoundation15",
            url: "https://x.com/rpfoundation15",
            descEn: "Real-time updates, announcements & relief requests.",
            descHi: "\u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0918\u094B\u0937\u0923\u093E\u090F\u0902 \u0914\u0930 \u0924\u094D\u0935\u0930\u093F\u0924 \u0930\u093E\u0939\u0924 \u0905\u0932\u0930\u094D\u091F \u091F\u094D\u0935\u093F\u091F\u0930 \u092A\u0930\u0964"
          },
          {
            name: "RP Foundation YouTube",
            platform: "youtube",
            handle: "RP Foundation Official",
            url: "https://www.youtube.com/@rpfoundationofficial",
            descEn: "Public awareness tutorials & campaign video reports.",
            descHi: "\u091C\u0928 \u091C\u093E\u0917\u0930\u0942\u0915\u0924\u093E \u091F\u094D\u092F\u0942\u091F\u094B\u0930\u093F\u092F\u0932 & \u0905\u092D\u093F\u092F\u093E\u0928 \u0915\u0940 \u0935\u0940\u0921\u093F\u092F\u094B \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u094D\u0938\u0964"
          }
        ],
        notifications: [
          {
            id: "1",
            type: "urgent",
            titleEn: "Urgent Blood Need: O+",
            titleHi: "\u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0930\u0915\u094D\u0924 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E: O+",
            bodyEn: "Critical patient at Bhopal Hospital requires 2 units of O+ blood.",
            bodyHi: "\u0938\u0940\u0939\u094B\u0930 \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u092E\u0947\u0902 \u0917\u0902\u092D\u0940\u0930 \u092E\u0930\u0940\u091C \u0915\u094B O+ \u0930\u0915\u094D\u0924 \u0915\u0940 2 \u092F\u0942\u0928\u093F\u091F \u0915\u0940 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E \u0939\u0948\u0964",
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false
          },
          {
            id: "2",
            type: "warning",
            titleEn: "Heatwave Alert - Madhya Pradesh",
            titleHi: "\u0932\u0942 \u0915\u0940 \u091A\u0947\u0924\u093E\u0935\u0928\u0940 - \u092E\u0927\u094D\u092F \u092A\u094D\u0930\u0926\u0947\u0936",
            bodyEn: "Temperatures expected to exceed 43\xB0C. Stay hydrated and avoid outdoor activity.",
            bodyHi: "\u0924\u093E\u092A\u092E\u093E\u0928 43 \u0921\u093F\u0917\u094D\u0930\u0940 \u0938\u0947\u0932\u094D\u0938\u093F\u092F\u0938 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0939\u094B\u0928\u0947 \u0915\u0940 \u0938\u0902\u092D\u093E\u0935\u0928\u093E \u0939\u0948\u0964 \u0939\u093E\u0907\u0921\u094D\u0930\u0947\u091F\u0947\u0921 \u0930\u0939\u0947\u0902 \u0914\u0930 \u092C\u093E\u0939\u0930\u0940 \u0917\u0924\u093F\u0935\u093F\u0927\u093F\u092F\u094B\u0902 \u0938\u0947 \u092C\u091A\u0947\u0902\u0964",
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false
          }
        ],
        testimonials: [
          {
            id: "t1",
            nameEn: "Satyendra Thakur",
            nameHi: "\u0938\u0924\u094D\u092F\u0947\u0902\u0926\u094D\u0930 \u0920\u093E\u0915\u0941\u0930",
            villageEn: "Karond Ward 5, Bhopal",
            villageHi: "\u0915\u0930\u094C\u0902\u0926 \u0935\u093E\u0930\u094D\u0921 5, \u092D\u094B\u092A\u093E\u0932",
            quoteEn: "My daughter received the Saraswati Scholarship directly in her bank account within 2 weeks of applying. This support is helping her pursue college education. Gratitude to Rohit Sir!",
            quoteHi: "\u092E\u0947\u0930\u0940 \u092C\u0947\u091F\u0940 \u0915\u094B \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0968 \u0938\u092A\u094D\u0924\u093E\u0939 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0938\u0940\u0927\u0947 \u0909\u0938\u0915\u0947 \u092C\u0948\u0902\u0915 \u0916\u093E\u0924\u0947 \u092E\u0947\u0902 \u0938\u0930\u0938\u094D\u0935\u0924\u0940 \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0939\u0941\u0908\u0964 \u092F\u0939 \u0938\u0939\u093E\u092F\u0924\u093E \u0909\u0938\u0947 \u0915\u0949\u0932\u0947\u091C \u0915\u0940 \u0936\u093F\u0915\u094D\u0937\u093E \u091C\u093E\u0930\u0940 \u0930\u0916\u0928\u0947 \u092E\u0947\u0902 \u092E\u0926\u0926 \u0915\u0930 \u0930\u0939\u0940 \u0939\u0948\u0964 \u0930\u094B\u0939\u093F\u0924 \u0938\u0930 \u0915\u094B \u0927\u0928\u094D\u092F\u0935\u093E\u0926!"
          },
          {
            id: "t2",
            nameEn: "Shanti Devi",
            nameHi: "\u0936\u093E\u0928\u094D\u0924\u093F \u0926\u0947\u0935\u0940",
            villageEn: "Bhopal Block, MP",
            villageHi: "\u0938\u0940\u0939\u094B\u0930 \u092C\u094D\u0932\u0949\u0915, \u092E.\u092A\u094D\u0930.",
            quoteEn: "During my husband's eye surgery, RP Foundation volunteers did everything from hospital registration to arranging blood donors. They treated us like family members.",
            quoteHi: "\u092E\u0947\u0930\u0947 \u092A\u0924\u093F \u0915\u0947 \u0928\u0947\u0924\u094D\u0930 \u0911\u092A\u0930\u0947\u0936\u0928 \u0915\u0947 \u0926\u094C\u0930\u093E\u0928, \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0915\u0947 \u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915\u094B\u0902 \u0928\u0947 \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0938\u0947 \u0932\u0947\u0915\u0930 \u0930\u0915\u094D\u0924\u0926\u093E\u0924\u093E\u0913\u0902 \u0915\u0940 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u0915\u0930\u0928\u0947 \u0924\u0915 \u0938\u092C \u0915\u0941\u091B \u0915\u093F\u092F\u093E\u0964 \u0909\u0928\u094D\u0939\u094B\u0902\u0928\u0947 \u0939\u092E\u093E\u0930\u0947 \u0938\u093E\u0925 \u092A\u0930\u093F\u0935\u093E\u0930 \u0915\u0947 \u0938\u0926\u0938\u094D\u092F\u094B\u0902 \u091C\u0948\u0938\u093E \u0935\u094D\u092F\u0935\u0939\u093E\u0930 \u0915\u093F\u092F\u093E\u0964"
          }
        ]
      };
      await pool.query(
        `INSERT INTO settings (id, "founderMessageEn") VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $2`,
        ["cms_data", JSON.stringify(defaults)]
      );
      return res.json({ success: true, cms: defaults });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router20.post("/api/cms", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1) 
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var cmsRoutes_default = router20;

// src/routes/campaignRoutes.ts
var import_express21 = __toESM(require("express"), 1);
var import_crypto15 = __toESM(require("crypto"), 1);
var router21 = import_express21.default.Router();
router21.get("/api/campaigns", async (req, res) => {
  const cached = apiCache.get("/api/campaigns");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "imageUrl" AS "coverImgUrl", urgent, "createdAt" FROM campaigns ORDER BY "createdAt" DESC'
    );
    const data = { campaigns: result.rows };
    apiCache.set("/api/campaigns", { data, timestamp: Date.now() });
    res.json(data);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});
router21.post("/api/campaigns", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    const id = import_crypto15.default.randomUUID();
    await pool.query(
      `INSERT INTO campaigns 
       (id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "coverImgUrl", urgent, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        titleEn,
        titleHi,
        Number(goalAmount) || 0,
        Number(raisedAmount) || 0,
        imageUrl || "",
        imageUrl || "",
        !!urgent,
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: error.message });
  }
});
router21.post("/api/campaigns/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    await pool.query(
      `UPDATE campaigns SET 
       "titleEn" = $1, "titleHi" = $2, "goalAmount" = $3, "raisedAmount" = $4, 
       "imageUrl" = $5, "coverImgUrl" = $6, urgent = $7 
       WHERE id = $8`,
      [
        titleEn,
        titleHi,
        Number(goalAmount) || 0,
        Number(raisedAmount) || 0,
        imageUrl || "",
        imageUrl || "",
        !!urgent,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error editing campaign:", error);
    res.status(500).json({ error: error.message });
  }
});
router21.delete("/api/campaigns/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM campaigns WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var campaignRoutes_default = router21;

// src/routes/submissionRoutes.ts
var import_express22 = __toESM(require("express"), 1);
var import_crypto16 = __toESM(require("crypto"), 1);
var router22 = import_express22.default.Router();
router22.get("/api/submissions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, "userId", "serviceNameEn", "serviceName", "citizenName", "citizenPhone", "submissionData", status, latitude, longitude, "createdAt", timestamp 
       FROM service_submissions_v2 
       ORDER BY timestamp DESC`
    );
    res.json({ submissions: result.rows });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: error.message });
  }
});
router22.post("/api/submissions", async (req, res) => {
  try {
    let body = req.body;
    if (Array.isArray(body)) {
      body = body[0];
    }
    const { userId, citizenName, citizenPhone, serviceName, submissionData, status, latitude, longitude, timestamp } = body;
    const id = import_crypto16.default.randomUUID();
    const result = await pool.query(
      `INSERT INTO service_submissions_v2 
       (id, "userId", "serviceNameEn", "serviceName", "citizenName", "citizenPhone", "submissionData", status, latitude, longitude, "createdAt", timestamp) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING id`,
      [
        id,
        userId || "guest",
        serviceName,
        serviceName,
        citizenName || "Citizen",
        citizenPhone || "",
        typeof submissionData === "object" ? JSON.stringify(submissionData) : submissionData || "{}",
        status || "pending",
        latitude || null,
        longitude || null,
        (/* @__PURE__ */ new Date()).toISOString(),
        timestamp || (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    if (serviceName === "Women Support") {
      try {
        const parsedData = JSON.parse(typeof submissionData === "object" ? JSON.stringify(submissionData) : submissionData || "{}");
        if (parsedData.sosTriggered && Array.isArray(parsedData.designatedContacts)) {
          const emails = parsedData.designatedContacts.filter((c) => c.includes("@"));
          if (emails.length > 0) {
            const mapsUrl = parsedData.userLocation || "Location unavailable";
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 12px; max-width: 500px; margin: auto;">
                <h2 style="color: #dc2626; margin-top: 0;">
                  \u{1F6A8} WOMEN EMERGENCY SOS ALERT
                </h2>
                <p style="font-size: 14px; color: #374151;">
                  An emergency SOS distress signal was triggered by <strong>${citizenName || "Citizen"}</strong> (Phone: ${citizenPhone || "N/A"}).
                </p>
                <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 15px; margin: 15px 0;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #991b1b;">Current Location:</p>
                  <a href="${mapsUrl}" target="_blank" style="background-color: #dc2626; color: white; padding: 10px 15px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    View Location on Google Maps
                  </a>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #7f1d1d;">${mapsUrl}</p>
                </div>
                <p style="font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                  Sent automatically by RPF Women Safety System. Time: ${(/* @__PURE__ */ new Date()).toLocaleString()}
                </p>
              </div>
            `;
            await sendEmail({
              from: '"RPF Women Safety" <no-reply@appapi.therpfoundation.org>',
              to: emails,
              subject: `\u{1F6A8} EMERGENCY: SOS Alert from ${citizenName || "Citizen"}`,
              html: emailHtml
            });
            console.log("SOS email alert dispatched successfully to:", emails.join(", "));
          }
        }
      } catch (mailErr) {
        console.error("Failed to send SOS emails:", mailErr);
      }
    }
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Error creating submission:", err);
    res.status(500).json({ error: err.message });
  }
});
router22.post("/api/submissions/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE service_submissions_v2 SET status = $1 WHERE id = $2", [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router22.delete("/api/submissions/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM service_submissions_v2 WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var submissionRoutes_default = router22;

// src/routes/userRoutes.ts
var import_express23 = __toESM(require("express"), 1);

// src/lib/userFields.ts
var USER_PRIVILEGED_FIELDS = /* @__PURE__ */ new Set(["role", "points", "janSevaCardStatus", "janSevaCardNo", "isVolunteer", "isDonor"]);

// src/routes/userRoutes.ts
var router23 = import_express23.default.Router();
router23.get("/api/users/:id", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, "janSevaCardStatus", "janSevaCardNo", "isVolunteer", "isDonor", "onboardingCompleted", "registeredAt" FROM users WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router23.post("/api/users/:id/update", authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user && (req.user.role === "admin" || req.user.role === "superadmin" || req.user.role === "super_admin");
    if (!isAdmin && req.user?.id !== req.params.id) {
      return res.status(403).json({ success: false, error: "You can only update your own profile" });
    }
    let fields = Object.keys(req.body);
    if (!isAdmin) {
      fields = fields.filter((f) => !USER_PRIVILEGED_FIELDS.has(f));
    }
    if (fields.length === 0) {
      return res.json({ success: true });
    }
    const setClause = fields.map((field, idx) => `"${field}" = $${idx + 1}`).join(", ");
    const values = fields.map((field) => req.body[field]);
    values.push(req.params.id);
    await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${values.length}`,
      values
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var userRoutes_default = router23;

// src/routes/uploadRoutes.ts
var import_express24 = __toESM(require("express"), 1);
var import_express_rate_limit2 = __toESM(require("express-rate-limit"), 1);
var import_crypto17 = __toESM(require("crypto"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var uploadLimiter = (0, import_express_rate_limit2.default)({
  windowMs: 15 * 60 * 1e3,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many file uploads. Please try again later." }
});
var storage = import_multer.default.memoryStorage();
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});
var handleUploadErrors = (err, req, res, next) => {
  if (err instanceof import_multer.default.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
var saveFileLocally = async (file) => {
  const ext = import_path3.default.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const filename = import_crypto17.default.randomUUID() + ext;
  const uploadDir = import_path3.default.join(process.cwd(), "uploads");
  if (!import_fs2.default.existsSync(uploadDir)) {
    import_fs2.default.mkdirSync(uploadDir, { recursive: true });
  }
  const filepath = import_path3.default.join(uploadDir, filename);
  import_fs2.default.writeFileSync(filepath, file.buffer);
  return "/uploads/" + filename;
};
var router24 = import_express24.default.Router();
router24.post("/api/upload/founder", authenticateToken, requireAdmin, uploadLimiter, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Founder image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});
router24.post("/api/upload/broadcast", authenticateToken, requireAdmin, uploadLimiter, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Broadcast image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});
router24.post("/api/upload/image", authenticateToken, uploadLimiter, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Generic image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});
router24.post("/api/profile/upload-dp", authenticateToken, uploadLimiter, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    const userId = req.user.id;
    await pool.query(`UPDATE users SET avatar = $1 WHERE id = $2`, [fileUrl, userId]);
    await pool.query(`UPDATE volunteers SET avatar = $1 WHERE id = $2`, [fileUrl, userId]);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload DP failed:", error);
    res.status(500).json({ error: error.message });
  }
});
router24.post("/api/profile/upload-cover", authenticateToken, uploadLimiter, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    const userId = req.user.id;
    await pool.query(`UPDATE users SET cover = $1 WHERE id = $2`, [fileUrl, userId]);
    await pool.query(`UPDATE volunteers SET cover = $1 WHERE id = $2`, [fileUrl, userId]);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload cover failed:", error);
    res.status(500).json({ error: error.message });
  }
});
router24.post("/api/profile/remove-dp", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query(`UPDATE users SET avatar = NULL WHERE id = $1`, [userId]);
    await pool.query(`UPDATE volunteers SET avatar = NULL WHERE id = $1`, [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Remove DP failed:", error);
    res.status(500).json({ error: error.message });
  }
});
router24.post("/api/profile/remove-cover", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query(`UPDATE users SET cover = NULL WHERE id = $1`, [userId]);
    await pool.query(`UPDATE volunteers SET cover = NULL WHERE id = $1`, [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Remove cover failed:", error);
    res.status(500).json({ error: error.message });
  }
});
var uploadRoutes_default = router24;

// src/routes/publicGovRoutes.ts
var import_express25 = __toESM(require("express"), 1);
var import_axios8 = __toESM(require("axios"), 1);
var cheerio2 = __toESM(require("cheerio"), 1);
init_coreServices();
var router25 = import_express25.default.Router();
var isAllowedPortal = (raw) => {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h.startsWith("127.") || h.startsWith("10.") || h.startsWith("192.168.") || h.startsWith("172.16.")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
var proxiedAsset = (value, base) => {
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
};
var proxiedLink = (value, base) => {
  try {
    const absolute = new URL(value, base).toString();
    return isAllowedPortal(absolute) ? `/api/gov/web-proxy?url=${encodeURIComponent(absolute)}&clean=1` : absolute;
  } catch {
    return value;
  }
};
router25.get("/api/gov/web-proxy", async (req, res) => {
  const raw = String(req.query.url || "");
  if (!isAllowedPortal(raw)) return res.status(400).send("Unsupported government portal");
  try {
    const target = new URL(raw);
    const upstream = await import_axios8.default.get(target.toString(), {
      responseType: "text",
      timeout: 15e3,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      },
      validateStatus: () => true
      // always get the body, handle errors ourselves
    });
    const contentType = String(upstream.headers["content-type"] || "text/html");
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("x-frame-options");
    res.removeHeader("content-security-policy");
    if (!contentType.includes("text/html")) {
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(upstream.data);
    }
    const $ = cheerio2.load(String(upstream.data));
    $('meta[http-equiv="Content-Security-Policy"], meta[http-equiv="X-Frame-Options"]').remove();
    $("base").remove();
    const FRAME_BUST_NEUTRALIZER = `<script>
(function(){
  // Override frame-busting: make window.top and window.parent appear to be the same as window itself
  // so that checks like "if (window.top !== window)" pass, preventing redirect to login page
  try {
    Object.defineProperty(window, 'top', { get: function(){ return window; }, configurable: true });
    Object.defineProperty(window, 'parent', { get: function(){ return window; }, configurable: true });
    Object.defineProperty(window, 'frameElement', { get: function(){ return null; }, configurable: true });
  } catch(e) {}
})();
</script>`;
    $("head").prepend(FRAME_BUST_NEUTRALIZER);
    const BROWSER_INTERCEPTOR = `
<script>
(function(){
  var urlParam = new URL(location.href).searchParams.get('url');
  if(!urlParam) return;
  var origin = new URL(urlParam).origin;
  var prox = function(u){ return '/api/gov/web-proxy?url=' + encodeURIComponent(u) + '&clean=1'; };
  
  // 1. Proxy all AJAX requests (for SPAs like Next.js, Google Fact Check)
  var ofetch = window.fetch;
  window.fetch = function(){
    var a = arguments[0];
    if(typeof a === 'string'){
      if(a.startsWith('/')) a = origin + a;
      if(a.startsWith(origin)) arguments[0] = prox(a);
    } else if(a && a.url){
      var u = a.url;
      if(u.startsWith('/')) u = origin + u;
      if(u.startsWith(origin)) {
        try {
          arguments[0] = new Request(prox(u), a);
        } catch(e) {
          console.warn('Proxy Request bypass:', e);
        }
      }
    }
    return ofetch.apply(this, arguments);
  };
  
  var oxhr = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(m, u, a, usr, p){
    if(typeof u === 'string'){
      if(u.startsWith('/')) u = origin + u;
      if(u.startsWith(origin)) u = prox(u);
    }
    return oxhr.call(this, m, u, a, usr, p);
  };

  // 2. Direct-load dynamic UI assets (SVGs, Icons) to avoid proxy WAF blocking (XML Parsing Errors)
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(n) {
        if (n.nodeType !== 1) return;
        var fixAsset = function(el, attr) {
          var v = el.getAttribute(attr);
          if (v && v.startsWith('/') && !v.startsWith('//')) el.setAttribute(attr, origin + v);
        };
        if (n.tagName === 'OBJECT') fixAsset(n, 'data');
        else if (n.querySelectorAll) n.querySelectorAll('object[data^="/"]').forEach(function(o){ fixAsset(o, 'data'); });

        if (n.tagName === 'IMG') fixAsset(n, 'src');
        else if (n.querySelectorAll) n.querySelectorAll('img[src^="/"]').forEach(function(i){ fixAsset(i, 'src'); });
      });
    });
  });
  if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;
    const isSPA = target.hostname.includes("google.com") || target.hostname.includes("originality.ai") || target.hostname.includes("eraktkosh.mohfw.gov.in");
    if (isSPA) {
      $("iframe, frame, frameset, object, embed").remove();
      $("head").prepend(BROWSER_INTERCEPTOR);
    }
    $("a[href]").each((_i, el) => {
      const value = $(el).attr("href");
      if (value && !value.startsWith("#") && !/^javascript:/i.test(value)) {
        $(el).attr("href", proxiedLink(value, target.toString()));
        $(el).removeAttr("target");
      }
    });
    $("form[action]").each((_i, el) => {
      const value = $(el).attr("action");
      if (value) {
        $(el).attr("action", proxiedLink(value, target.toString()));
        $(el).removeAttr("target");
      }
    });
    $("iframe[src], frame[src]").each((_i, el) => {
      const value = $(el).attr("src");
      if (value && !value.startsWith("#") && !/^javascript:/i.test(value)) {
        $(el).attr("src", proxiedLink(value, target.toString()));
      }
    });
    $("link[href]").each((_i, el) => {
      const value = $(el).attr("href");
      if (value && !value.startsWith("#") && !/^javascript:/i.test(value)) {
        $(el).attr("href", proxiedAsset(value, target.toString()));
      }
    });
    $("img[src], script[src], source[src]").each((_i, el) => {
      const value = $(el).attr("src");
      if (value && !/^data:/i.test(value)) {
        $(el).attr("src", proxiedAsset(value, target.toString()));
      }
    });
    $("object[data]").each((_i, el) => {
      const value = $(el).attr("data");
      if (value && !/^data:/i.test(value)) {
        $(el).attr("data", proxiedAsset(value, target.toString()));
      }
    });
    $("embed[src]").each((_i, el) => {
      const value = $(el).attr("src");
      if (value && !/^data:/i.test(value)) {
        $(el).attr("src", proxiedAsset(value, target.toString()));
      }
    });
    res.removeHeader("X-Frame-Options");
    res.removeHeader("x-frame-options");
    res.setHeader("Content-Security-Policy", "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors *; connect-src * data: blob:; img-src * data: blob:; media-src * data: blob:;");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.type("html").send($.html());
  } catch (err) {
    const msg = err?.message || "Unknown error";
    return res.status(502).send(`<html><body style="font-family:system-ui;padding:32px;max-width:480px;margin:0 auto"><h2 style="color:#000080">RPF Browser</h2><p>This portal could not be loaded right now.</p><p style="color:#888;font-size:13px">Technical reason: ${msg}</p><button onclick="history.back()" style="margin-top:16px;padding:10px 24px;background:#000080;color:#fff;border:none;border-radius:8px;cursor:pointer">\u2190 Go Back</button></body></html>`);
  }
});
router25.get("/api/gov/mandi-prices", async (req, res) => {
  const { state, commodity } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY;
  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";
  if (!apiKey) return res.status(503).json({ success: false, error: "Mandi price service is not configured." });
  try {
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
    const response = await import_axios8.default.get(url, { timeout: 5e3 });
    return res.json(response.data);
  } catch (error) {
    console.error("Mandi Prices API failed:", error);
    return res.status(503).json({ success: false, error: "Mandi price service is temporarily unavailable." });
  }
});
router25.get("/api/gov/hospitals", async (req, res) => {
  const { state, district } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY;
  const resourceId = "7924619d-71b5-4b47-b861-12c823055428";
  if (!apiKey) return res.status(503).json({ success: false, error: "Government hospital directory is not configured." });
  try {
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
    const response = await import_axios8.default.get(url, { timeout: 5e3 });
    return res.json(response.data);
  } catch (error) {
    console.error("Government hospitals API failed:", error);
    return res.status(503).json({ success: false, error: "Government hospital directory is temporarily unavailable." });
  }
});
router25.get("/api/public/services", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    let hiddenServiceIds = [];
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      try {
        const parsed = JSON.parse(result.rows[0].founderMessageEn);
        if (Array.isArray(parsed.hiddenServiceIds)) hiddenServiceIds = parsed.hiddenServiceIds;
      } catch {
      }
    }
    const visible = CORE_SERVICES.filter((service) => !hiddenServiceIds.includes(service.id));
    res.json({ success: true, data: visible });
  } catch {
    res.json({ success: true, data: CORE_SERVICES });
  }
});
router25.get("/api/public/services/:id/content", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT service_id, content, action_url, updated_at FROM service_content WHERE service_id = $1`, [id]);
    let data = result.rows.length > 0 ? result.rows[0] : null;
    if (id === "animals") {
      const animalResources = [
        { title: { en: "PETA India Actions", hi: "\u092A\u0947\u091F\u093E \u0907\u0902\u0921\u093F\u092F\u093E \u090F\u0915\u094D\u0936\u0928\u094D\u0938" }, url: "https://www.petaindia.com/action/" },
        { title: { en: "AWBI Colony Animal Caretaker", hi: "AWBI \u0915\u0949\u0932\u094B\u0928\u0940 \u092A\u0936\u0941 \u0915\u0947\u092F\u0930\u091F\u0947\u0915\u0930" }, url: "https://awbi.gov.in/colony-animal-care-taker" },
        { title: { en: "Bharat Pashudhan Portal", hi: "\u092D\u093E\u0930\u0924 \u092A\u0936\u0941\u0927\u0928 \u092A\u094B\u0930\u094D\u091F\u0932" }, url: "https://bharatpashudhan.ndlm.co.in/" },
        { title: { en: "DAHD Schemes & Programmes", hi: "DAHD \u092F\u094B\u091C\u0928\u093E\u090F\u0902 \u0914\u0930 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E" }, url: "https://dahd.gov.in/hi/schemes-programmes" },
        { title: { en: "MPDAH Animal Breeding Farm", hi: "MPDAH \u092A\u0936\u0941 \u092A\u094D\u0930\u091C\u0928\u0928 \u092B\u093E\u0930\u094D\u092E" }, url: "https://mpdah.gov.in/animal-breeding-farm" },
        { title: { en: "MPDAH Welfare Schemes", hi: "MPDAH \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u092F\u094B\u091C\u0928\u093E\u090F\u0902" }, url: "https://mpdah.gov.in/schemes" },
        { title: { en: "NDVSU Grievance Portal", hi: "NDVSU \u0936\u093F\u0915\u093E\u092F\u0924 \u092A\u094B\u0930\u094D\u091F\u0932" }, url: "https://ndvsu.org/grievance" }
      ];
      if (!data) {
        data = {
          service_id: "animals",
          content: {
            en: {
              body: "<h3>Animal Welfare Support</h3><p>Access official animal welfare portals, central/state dairy and animal husbandry schemes, breeding directories, and grievance resources below.</p>",
              actionLabel: "Report Stray Emergency"
            },
            hi: {
              body: "<h3>\u092A\u0936\u0941 \u0915\u0932\u094D\u092F\u093E\u0923 \u0938\u0939\u092F\u094B\u0917</h3><p>\u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u092A\u0936\u0941 \u0915\u0932\u094D\u092F\u093E\u0923 \u092A\u094B\u0930\u094D\u091F\u0932, \u0915\u0947\u0902\u0926\u094D\u0930/\u0930\u093E\u091C\u094D\u092F \u0921\u0947\u092F\u0930\u0940 \u0914\u0930 \u092A\u0936\u0941\u092A\u093E\u0932\u0928 \u092F\u094B\u091C\u0928\u093E\u090F\u0902, \u092A\u094D\u0930\u091C\u0928\u0928 \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E \u0914\u0930 \u0936\u093F\u0915\u093E\u092F\u0924 \u0928\u093F\u0935\u093E\u0930\u0923 \u0938\u0902\u0938\u093E\u0927\u0928\u094B\u0902 \u0924\u0915 \u0928\u0940\u091A\u0947 \u092A\u0939\u0941\u0902\u091A\u0947\u0902\u0964</p>",
              actionLabel: "\u0906\u0935\u093E\u0930\u093E \u092A\u0936\u0941 \u0906\u092A\u093E\u0924\u0915\u093E\u0932 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902"
            }
          },
          action_url: "/grievance",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      data.resources = animalResources;
    } else if (data) {
      data.resources = data.content?.resources || [];
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error("Service content fetch error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
var publicGovRoutes_default = router25;

// src/routes/publicExternalRoutes.ts
var import_express26 = __toESM(require("express"), 1);
var import_axios9 = __toESM(require("axios"), 1);
var import_rss_parser = __toESM(require("rss-parser"), 1);
var router26 = import_express26.default.Router();
var rssParser = new import_rss_parser.default();
var cache = (key, ttl) => {
  const item = apiCache.get(key);
  return item && Date.now() - item.timestamp < ttl ? item.data : null;
};
var save = (key, data) => apiCache.set(key, { data, timestamp: Date.now() });
var cleanText = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
router26.get("/api/public/weather", async (req, res) => {
  try {
    const lat = Number(req.query.lat), lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return res.status(400).json({ success: false, error: "Invalid coordinates" });
    const key = `weather_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const c = cache(key, 9e5);
    if (c) return res.json({ success: true, data: c });
    const { data } = await import_axios9.default.get("https://api.open-meteo.com/v1/forecast", { params: { latitude: lat, longitude: lon, current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m", daily: "temperature_2m_max,temperature_2m_min,precipitation_sum", timezone: "auto" }, timeout: 8e3 });
    save(key, data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "Weather temporarily unavailable" });
  }
});
router26.get("/api/public/forex", async (_req, res) => {
  try {
    const c = cache("forex_inr", 36e5);
    if (c) return res.json({ success: true, data: c });
    const { data } = await import_axios9.default.get("https://api.frankfurter.app/latest?to=INR", { timeout: 8e3 });
    save("forex_inr", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "Exchange rates temporarily unavailable" });
  }
});
router26.get("/api/public/news", async (_req, res) => {
  try {
    const c = cache("india_news_rss", 18e5);
    if (c) return res.json({ success: true, data: c });
    const feed = await rssParser.parseURL("https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en");
    const data = feed.items.slice(0, 20).map((i) => ({ title: i.title, link: i.link, pubDate: i.pubDate, source: i.creator || "Google News", description: i.contentSnippet || null, image_url: null }));
    save("india_news_rss", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "News temporarily unavailable" });
  }
});
router26.get("/api/public/quote-of-day", async (_req, res) => {
  try {
    const c = cache("quote_of_day_v2", 216e5);
    if (c) return res.json({ success: true, data: c });
    const feeds = ["https://www.brainyquote.com/link/quotebr.rss", "http://feeds.feedburner.com/azquotes/quoteoftheday"];
    for (const url of feeds) {
      try {
        const feed = await rssParser.parseURL(url);
        const item = feed.items[0];
        if (!item) continue;
        const title = cleanText(item.title || "");
        const body = cleanText(item.contentSnippet || item.content || item.description || "");
        const explicitAuthor = cleanText(item.creator || item.author || "");
        let quote = body;
        let author = explicitAuthor;
        if (!author && body && title && body !== title) author = title;
        if (!quote && title) {
          const parts = title.split(/\s[-–—|:]\s/);
          if (parts.length > 1) {
            author = author || parts[parts.length - 1].trim();
            quote = parts.slice(0, -1).join(" - ").trim();
          } else quote = title;
        }
        if (quote === title && /\s[-–—|:]\s/.test(title)) {
          const parts = title.split(/\s[-–—|:]\s/);
          quote = parts.slice(0, -1).join(" - ").trim();
          author = author || parts[parts.length - 1].trim();
        }
        if (quote) {
          const data = { quote, author: author || "", link: item.link || (url.includes("brainyquote") ? "https://www.brainyquote.com/quote_of_the_day" : "https://www.azquotes.com/quote_of_the_day.html") };
          save("quote_of_day_v2", data);
          return res.json({ success: true, data });
        }
      } catch {
      }
    }
    return res.status(503).json({ success: false, error: "Quote temporarily unavailable" });
  } catch {
    return res.status(503).json({ success: false, error: "Quote temporarily unavailable" });
  }
});
router26.get("/api/public/calendar/panchang", async (_req, res) => {
  try {
    const c = cache("panchang_rss", 36e5);
    if (c) return res.json({ success: true, data: c });
    const feed = await rssParser.parseURL("https://hinducalendar.app/feed/panchang.xml");
    const data = feed.items.map((i) => ({ title: i.title, description: i.contentSnippet || i.content || "", pubDate: i.pubDate, category: i.categories?.[0] || "" }));
    save("panchang_rss", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "Panchang temporarily unavailable" });
  }
});
router26.get("/api/public/calendar/highlights", async (_req, res) => {
  try {
    const c = cache("calendar_highlights", 36e5);
    if (c) return res.json({ success: true, data: c });
    const feed = await rssParser.parseURL("https://hinducalendar.app/feed/highlights.xml");
    const data = feed.items.map((i) => ({ title: i.title, description: i.contentSnippet || i.content || "", pubDate: i.pubDate }));
    save("calendar_highlights", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "Calendar highlights temporarily unavailable" });
  }
});
router26.get("/api/public/calendar/digest", async (_req, res) => {
  try {
    const { data } = await import_axios9.default.get("https://hinducalendar.app/feed/digest.txt", { responseType: "text", timeout: 8e3 });
    return res.type("text/plain").send(data);
  } catch {
    return res.status(503).send("Digest temporarily unavailable");
  }
});
router26.get("/api/public/jobs-feed", async (_req, res) => {
  try {
    const c = cache("jobs_rss", 36e5);
    if (c) return res.json({ success: true, data: c });
    const feed = await rssParser.parseURL("https://news.google.com/rss/search?q=Sarkari+Naukri+India+Jobs&hl=en-IN&gl=IN&ceid=IN:en");
    const data = feed.items.slice(0, 20).map((i) => ({ title: i.title, link: i.link, pubDate: i.pubDate }));
    save("jobs_rss", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "Jobs feed temporarily unavailable" });
  }
});
router26.get("/api/public/remote-jobs", async (_req, res) => {
  try {
    const { data } = await import_axios9.default.get("https://jobicy.com/api/v2/remote-jobs?count=20&geo=india", { timeout: 8e3 });
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "Remote jobs temporarily unavailable" });
  }
});
router26.get("/api/public/nearby", async (req, res) => {
  try {
    const lat = Number(req.query.lat), lon = Number(req.query.lon), type = String(req.query.type || "police");
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !["police", "veterinary"].includes(type)) return res.status(400).json({ success: false, error: "Invalid nearby search" });
    const key = `nearby_${type}_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const c = cache(key, 864e5);
    if (c) return res.json({ success: true, data: c });
    const tag = type === "police" ? "amenity=police" : "amenity=veterinary";
    const q = `[out:json][timeout:10];node[${tag}](around:5000,${lat},${lon});out;`;
    const { data } = await import_axios9.default.get("https://overpass-api.de/api/interpreter", { params: { data: q }, timeout: 12e3 });
    const locations = (data.elements || []).map((e) => ({ name: e.tags?.name || `Unnamed ${type}`, lat: e.lat, lon: e.lon }));
    save(key, locations);
    return res.json({ success: true, data: locations });
  } catch {
    return res.status(503).json({ success: false, error: "Nearby search temporarily unavailable" });
  }
});
router26.get("/api/public/disaster-alerts", async (_req, res) => {
  try {
    const c = cache("disaster_rss", 9e5);
    if (c) return res.json({ success: true, data: c });
    const feed = await rssParser.parseURL("https://www.gdacs.org/xml/rss.xml");
    const data = feed.items.filter((i) => `${i.title || ""} ${i.contentSnippet || ""}`.toLowerCase().includes("india")).slice(0, 30).map((i) => ({ id: i.guid || i.link, titleEn: i.title, titleHi: i.title, severity: "Alert", link: i.link }));
    save("disaster_rss", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "Disaster alerts temporarily unavailable" });
  }
});
var publicExternalRoutes_default = router26;

// src/routes/adminHqExtraRoutes.ts
var import_express27 = __toESM(require("express"), 1);
var import_bcryptjs5 = __toESM(require("bcryptjs"), 1);
var import_crypto18 = __toESM(require("crypto"), 1);
var router27 = import_express27.default.Router();
router27.all("/api/admin-setup", (_req, res) => {
  return res.status(410).json({
    success: false,
    error: "Administrator setup endpoint has been retired."
  });
});
router27.get("/api/admin/hq/certificates/signatures/:service_id", async (req, res) => {
  try {
    const { service_id } = req.params;
    const result = await pool.query(`SELECT service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation FROM service_signatures WHERE service_id = $1`, [service_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "No certificate signature configuration exists for this service." });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch certificate signature metadata." });
  }
});
router27.use("/api/admin", authenticateToken, requireAdmin);
router27.put("/api/admin/hq/credentials", async (req, res) => {
  try {
    const body = req.body || {};
    const { username, newPassword } = body;
    if (!username || !newPassword) return res.status(400).json({ success: false, error: "Username and password are required." });
    if (String(newPassword).length < 12) return res.status(400).json({ success: false, error: "Administrator password must be at least 12 characters." });
    const hash = await import_bcryptjs5.default.hash(String(newPassword), 12);
    const result = await pool.query(`UPDATE admin_credentials SET username = $1, password_hash = $2 WHERE id = 'admin' RETURNING id, username`, [String(username).trim(), hash]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: "Administrator credential record not found." });
    await auditEvent({ userId: String(req.user?.id || ""), action: "admin_credentials_updated", resource: "admin_credentials", req });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update administrator credentials." });
  }
});
router27.put("/api/admin/hq/certificates/signatures", async (req, res) => {
  try {
    const { service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation } = req.body || {};
    if (!service_id || !signatory_1_name || !signatory_1_designation) {
      return res.status(400).json({ success: false, error: "Service and primary signatory details are required." });
    }
    await pool.query(`
      INSERT INTO service_signatures (service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (service_id) DO UPDATE SET
        signatory_1_name = EXCLUDED.signatory_1_name,
        signatory_1_designation = EXCLUDED.signatory_1_designation,
        signatory_2_name = EXCLUDED.signatory_2_name,
        signatory_2_designation = EXCLUDED.signatory_2_designation
    `, [service_id, signatory_1_name, signatory_1_designation, signatory_2_name ?? null, signatory_2_designation ?? null]);
    await auditEvent({ userId: String(req.user?.id || ""), action: "certificate_signature_updated", resource: "service_signatures", resourceId: String(service_id), req });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update certificate signature configuration." });
  }
});
router27.post("/api/admin/hq/certificates/issue", async (req, res) => {
  try {
    const { volunteer_id, service_id } = req.body || {};
    if (!volunteer_id || !service_id) return res.status(400).json({ success: false, error: "Volunteer and service are required." });
    const certId = `RP-${(/* @__PURE__ */ new Date()).getFullYear()}-${import_crypto18.default.randomBytes(6).toString("hex").toUpperCase()}`;
    const volRes = await pool.query(`SELECT id FROM volunteers WHERE id = $1 OR username = $1 OR registration_number = $1`, [volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ success: false, error: "Volunteer not found." });
    const realVolId = volRes.rows[0].id;
    const existing = await pool.query(`SELECT 1 FROM certificates WHERE volunteer_id = $1 AND service_id = $2`, [realVolId, service_id]);
    if (existing.rows.length > 0) return res.status(409).json({ success: false, error: "Certificate already issued for this service." });
    const result = await pool.query(`INSERT INTO certificates (certificate_id, volunteer_id, service_id) VALUES ($1, $2, $3) RETURNING *`, [certId, realVolId, service_id]);
    await auditEvent({ userId: String(req.user?.id || ""), action: "certificate_issued", resource: "certificate", resourceId: String(result.rows[0].id ?? certId), req, metadata: { volunteer_id: realVolId, service_id } });
    return res.json({ success: true, certificate: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to issue certificate." });
  }
});
router27.get("/api/admin/hq/donations", async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donations ORDER BY "createdAt" DESC');
    return res.json({ success: true, donations: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch donations." });
  }
});
var ADMIN_SETTINGS_COLUMNS = /* @__PURE__ */ new Set([
  "splash_animation",
  "splash_logo",
  "splash_duration",
  "login_bg_image",
  "social_login_enabled",
  "marquee_text",
  "marquee_speed",
  "marquee_color",
  "marquee_bg_color",
  "primary_color",
  "secondary_color",
  "font_family",
  "hero_type",
  "hero_media_url",
  "show_widgets",
  "show_notices",
  "founder_image",
  "founder_message"
]);
router27.get("/api/admin/settings", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM app_settings WHERE id = 1");
    return res.json({ success: true, data: result.rows[0] || {} });
  } catch (err) {
    console.error("Admin settings read error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});
router27.post("/api/admin/settings", async (req, res) => {
  try {
    const updates = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const entries = Object.entries(updates).filter(([key]) => ADMIN_SETTINGS_COLUMNS.has(key));
    if (entries.length === 0) return res.status(400).json({ success: false, error: "No valid settings fields supplied" });
    const setClause = [];
    const values = [];
    for (const [key, value] of entries) {
      setClause.push(`"${key}" = $${values.length + 1}`);
      values.push(value);
    }
    values.push(1);
    const result = await pool.query(
      `UPDATE app_settings SET ${setClause.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );
    await auditEvent({ userId: String(req.user?.id || ""), action: "admin_settings_updated", resource: "app_settings", req, metadata: { fields_updated: entries.map(([key]) => key) } });
    return res.json({ success: true, data: result.rows[0] || {} });
  } catch (err) {
    console.error("Admin settings update error:", err);
    return res.status(500).json({ success: false, error: "Failed to update settings" });
  }
});
var adminHqExtraRoutes_default = router27;

// src/routes/adminDynamicRoutes.ts
var import_express28 = __toESM(require("express"), 1);
var import_bcryptjs6 = __toESM(require("bcryptjs"), 1);
var router28 = import_express28.default.Router();
router28.get("/api/admin-setup", async (req, res) => {
  try {
    const password = "admin";
    const password_hash = await import_bcryptjs6.default.hash(password, 10);
    const existing = await pool.query("SELECT * FROM admin_credentials WHERE username = 'admin'");
    let html = "<html><body style='font-family:sans-serif; padding: 20px;'><h1>God Admin Setup</h1>";
    if (existing.rows.length > 0) {
      await pool.query("UPDATE admin_credentials SET password_hash = $1 WHERE username = 'admin'", [password_hash]);
      html += `<p>Found existing 'admin' credentials. Password has been successfully reset!</p>`;
    } else {
      await pool.query(
        `INSERT INTO admin_credentials (id, username, password_hash) VALUES ('admin', 'admin', $1)`,
        [password_hash]
      );
      html += `<p>No existing 'admin' credentials found. Created a new admin account!</p>`;
    }
    html += `<p>User ID: <b>admin</b></p>`;
    html += `<p>Password: <b>admin</b></p>`;
    html += "<p>You can now go to the <a href='/login'>Login page</a> and enter these credentials.</p></body></html>";
    res.send(html);
  } catch (error) {
    res.status(500).send("Database Error: " + error.message);
  }
});
router28.get("/api/admin/settings", async (req, res) => {
  try {
    const cacheKey = "admin_settings";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({ success: true, data: cached.data });
    }
    const result = await pool.query("SELECT * FROM app_settings WHERE id = 1");
    if (result.rows.length === 0) {
      return res.json({ success: true, data: {} });
    }
    apiCache.set(cacheKey, { data: result.rows[0], timestamp: Date.now() });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});
router28.post("/api/admin/settings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    let setClause = [];
    let values = [];
    let index = 1;
    for (const [key, value] of Object.entries(updates)) {
      setClause.push(`"${key}" = $${index}`);
      values.push(value);
      index++;
    }
    if (setClause.length === 0) return res.json({ success: true });
    const query = `UPDATE app_settings SET ${setClause.join(", ")} WHERE id = 1 RETURNING *`;
    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, error: "Failed to update settings" });
  }
});
router28.get("/api/admin/announcements", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch announcements" });
  }
});
router28.post("/api/admin/announcements", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, is_active } = req.body;
    const result = await pool.query(
      "INSERT INTO announcements (title, content, is_active) VALUES ($1, $2, $3) RETURNING *",
      [title, content, is_active ?? true]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create announcement" });
  }
});
router28.delete("/api/admin/announcements/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM announcements WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete announcement" });
  }
});
router28.put("/api/admin/stories/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }
    const result = await pool.query("UPDATE success_stories SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update story status" });
  }
});
router28.put("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, role, email, phone, isVolunteer, isDonor } = req.body;
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, role = $2, email = $3, phone = $4, "isVolunteer" = $5, "isDonor" = $6
       WHERE id = $7 RETURNING id, name, role, email, phone`,
      [name, role, email, phone, isVolunteer, isDonor, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update user profile" });
  }
});
router28.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM users");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT id, name, role, email, phone, "isVolunteer", "isDonor", "onboardingCompleted" FROM users ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});
router28.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});
router28.get("/api/admin/volunteers", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM volunteers");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT id, name, username, mobile, email, status, registration_number, "createdAt" FROM volunteers ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch volunteers" });
  }
});
router28.put("/api/admin/volunteers/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query("UPDATE volunteers SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update volunteer status" });
  }
});
router28.get("/api/admin/donations", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM donations");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM donations ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch donations" });
  }
});
router28.get("/api/admin/jan-seva-cards", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM card_applications");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM card_applications ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch jan seva cards" });
  }
});
router28.get("/api/admin/health-camps", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM health_camps");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM health_camps ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch health camps" });
  }
});
router28.post("/api/admin/health-camps", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const result = await pool.query(
      `INSERT INTO health_camps ("titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, title, date, date, location, location]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create health camp" });
  }
});
router28.delete("/api/admin/health-camps/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM health_camps WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete health camp" });
  }
});
router28.get("/api/admin/grievances", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM grievances");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM grievances ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch grievances" });
  }
});
router28.put("/api/admin/grievances/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query("UPDATE grievances SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update grievance" });
  }
});
router28.get("/api/admin/women_complaints", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM women_complaints");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM women_complaints ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch women complaints" });
  }
});
router28.get("/api/admin/blood_donors", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM blood_donors");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM blood_donors ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch blood donors" });
  }
});
router28.get("/api/admin/blood_requests", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM blood_requests");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM blood_requests ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch blood requests" });
  }
});
router28.get("/api/admin/blogs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM blogs");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM blogs ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch blogs" });
  }
});
router28.post("/api/admin/blogs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, author } = req.body;
    const result = await pool.query(
      "INSERT INTO blogs (title, description, author) VALUES ($1, $2, $3) RETURNING *",
      [title, description, author]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create blog" });
  }
});
router28.delete("/api/admin/blogs/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM blogs WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete blog" });
  }
});
router28.get("/api/admin/jobs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM jobs");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM jobs ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch jobs" });
  }
});
router28.get("/api/admin/campaigns", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM campaigns");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM campaigns ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch campaigns" });
  }
});
router28.post("/api/admin/campaigns", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, goalAmount, raisedAmount } = req.body;
    const result = await pool.query(
      `INSERT INTO campaigns ("titleEn", "titleHi", "goalAmount", "raisedAmount") VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, title, goalAmount || 0, raisedAmount || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create campaign" });
  }
});
router28.delete("/api/admin/campaigns/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM campaigns WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete campaign" });
  }
});
router28.get("/api/admin/directory", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const countResult = await pool.query("SELECT COUNT(*) FROM directory_services");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    const result = await pool.query(`SELECT * FROM directory_services ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch directory" });
  }
});
router28.post("/api/admin/directory", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, contact, status } = req.body;
    const result = await pool.query(
      `INSERT INTO directory_services (name, category, contact, status) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, category, contact, status || "active"]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create directory entry" });
  }
});
router28.delete("/api/admin/directory/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM directory_services WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete directory entry" });
  }
});
router28.get("/api/admin/scholarships", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM scholarships ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/scholarships", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO scholarships (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/scholarships/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM scholarships WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/food_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM food_support ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/food_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO food_support (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/food_support/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM food_support WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/medicine_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM medicine_support ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/medicine_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO medicine_support (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/medicine_support/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM medicine_support WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/education_aid", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM education_aid ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/education_aid", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO education_aid (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/education_aid/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM education_aid WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/senior_citizens", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM senior_citizens ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/senior_citizens", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO senior_citizens (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/senior_citizens/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM senior_citizens WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/animal_welfare", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM animal_welfare ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/animal_welfare", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO animal_welfare (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/animal_welfare/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM animal_welfare WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/environment", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM environment ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/environment", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO environment (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/environment/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM environment WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/religious_culture", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM religious_culture ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/religious_culture", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO religious_culture (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/religious_culture/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM religious_culture WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/disaster_management", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM disaster_management ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/disaster_management", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO disaster_management (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/disaster_management/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM disaster_management WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/farmer_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM farmer_support ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/farmer_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO farmer_support (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/farmer_support/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM farmer_support WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/government_schemes", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM government_schemes ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/government_schemes", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO government_schemes (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/government_schemes/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM government_schemes WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/skills_training", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM skills_training ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/skills_training", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO skills_training (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/skills_training/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM skills_training WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.get("/api/admin/global_guide", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM global_guide ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.post("/api/admin/global_guide", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO global_guide (title, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router28.delete("/api/admin/global_guide/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM global_guide WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
var adminDynamicRoutes_default = router28;

// server.ts
var import_jsonwebtoken4 = __toESM(require("jsonwebtoken"), 1);
import_dotenv2.default.config();
var app = (0, import_express29.default)();
app.set("trust proxy", 1);
var corsOptions = {
  origin: true,
  // Automatically allow the requesting origin to support web and mobile apps
  credentials: true
};
app.use((0, import_cors.default)(corsOptions));
app.use(import_express29.default.json({ limit: "2mb" }));
app.use(import_express29.default.urlencoded({ limit: "2mb", extended: true }));
var limiter = (0, import_express_rate_limit3.default)({
  windowMs: 15 * 60 * 1e3,
  max: 500,
  // Relaxed to 500 for development, normal use, and cPanel API resilience
  message: { success: false, error: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use("/api/auth", limiter);
app.use("/api/support_requests", limiter);
app.use("/api/grievances", limiter);
var aiLimiter = (0, import_express_rate_limit3.default)({
  windowMs: 15 * 60 * 1e3,
  max: 30,
  message: { success: false, error: "Too many AI requests from this IP, please try again later" }
});
app.use("/api/ai", aiLimiter);
var SMTP2GO_API_BASE_URL2 = process.env.SMTP2GO_API_BASE_URL || "https://api.smtp2go.com/v3/";
var SMTP2GO_API_KEY2 = process.env.SMTP2GO_API_KEY;
var DEFAULT_SENDER2 = process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org";
app.use("/api/admin/hq", authenticateToken, requireAdmin);
app.use("/", authRoutes_default);
app.use("/", passwordResetSecure_default);
app.use("/", livenessRoutes_default);
app.use("/", healthRoutes_default);
app.use("/", grievanceRoutes_default);
app.use("/", aiRoutes_default);
app.use("/", cultureRoutes_default);
app.use("/", janSevaRoutes_default);
app.use("/", locationRoutes_default);
app.use("/", womenRoutes_default);
app.use("/", adminHqRoutes_default);
app.use("/", environmentRoutes_default);
app.use("/", educationRoutes_default);
app.use("/", miscRoutes_default);
app.use("/", volunteerRoutes_default);
app.use("/", certificateRoutes_default);
app.use("/", communityRoutes_default);
app.use("/", jobRoutes_default);
app.use("/", donationRoutes_default);
app.use("/", cmsRoutes_default);
app.use("/", campaignRoutes_default);
app.use("/", submissionRoutes_default);
app.use("/", userRoutes_default);
app.use("/", uploadRoutes_default);
app.use(publicGovRoutes_default);
app.use(publicExternalRoutes_default);
app.use(adminHqExtraRoutes_default);
app.use(adminDynamicRoutes_default);
var rpID2 = process.env.WEBAUTHN_RP_ID || "localhost";
var originUrl2 = `https://${rpID2}`;
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var dbUrl2 = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rp_foundation";
var pool3 = new import_pg2.default.Pool({
  connectionString: dbUrl2,
  ssl: dbUrl2.includes("localhost") || dbUrl2.includes("127.0.0.") ? false : { rejectUnauthorized: false }
});
setDbPool(pool3);
pool3.query(`
  ALTER TABLE volunteers 
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS registration_number VARCHAR(255) UNIQUE
`).then(() => console.log("Volunteers table migrated automatically")).catch((err) => console.error("Auto-migration error:", err));
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool3.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0], env: process.env.DATABASE_URL ? "URL Set" : "URL Missing", dbUrl: dbUrl2.substring(0, 15) + "..." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack, env: process.env.DATABASE_URL ? "URL Set" : "URL Missing", dbUrl: dbUrl2.substring(0, 15) + "..." });
  }
});
async function initDatabase() {
  let client;
  try {
    console.log("Initializing local PostgreSQL schema...");
    client = await pool3.connect();
    const runQuery = async (queryText, params = [], label = "") => {
      try {
        await client.query(queryText, params);
      } catch (err) {
        console.warn(`[DB INIT WARNING] Failed to execute query for: ${label || "unknown"}. Error: ${err.message}`);
      }
    };
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        role TEXT DEFAULT 'citizen',
        
        badges INTEGER DEFAULT 0,
        "janSevaCardStatus" TEXT DEFAULT 'none',
        "janSevaCardNo" TEXT DEFAULT '',
        "isVolunteer" BOOLEAN DEFAULT false,
        "isDonor" BOOLEAN DEFAULT false,
        "onboardingCompleted" BOOLEAN DEFAULT false,
        password_hash VARCHAR(255),
        username VARCHAR(255) UNIQUE,
        registration_number VARCHAR(255) UNIQUE,
        father_husband_name TEXT,
        mother_name TEXT,
        dob DATE,
        education JSONB,
        blood_group VARCHAR(10),
        skills JSONB,
        reason_for_joining TEXT,
        availability VARCHAR(100),
        national_id_1 VARCHAR(50),
        national_id_2 VARCHAR(50),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        pincode VARCHAR(20),
        area_locality VARCHAR(255),
        sansad_kshetra VARCHAR(255),
        vidhan_sabha VARCHAR(255),
        ward_no VARCHAR(255),
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "users table creation");
    const columnsToAlter = [
      { name: "password_hash", type: "VARCHAR(255)" },
      { name: "username", type: "VARCHAR(255) UNIQUE" },
      { name: "registration_number", type: "VARCHAR(255) UNIQUE" },
      { name: "father_husband_name", type: "TEXT" },
      { name: "mother_name", type: "TEXT" },
      { name: "dob", type: "DATE" },
      { name: "education", type: "JSONB" },
      { name: "blood_group", type: "VARCHAR(10)" },
      { name: "skills", type: "JSONB" },
      { name: "reason_for_joining", type: "TEXT" },
      { name: "availability", type: "VARCHAR(100)" },
      { name: "national_id_1", type: "VARCHAR(50)" },
      { name: "national_id_2", type: "VARCHAR(50)" },
      { name: "country", type: "VARCHAR(100)" },
      { name: "state", type: "VARCHAR(100)" },
      { name: "city", type: "VARCHAR(100)" },
      { name: "address", type: "TEXT" },
      { name: "pincode", type: "VARCHAR(20)" },
      { name: "area_locality", type: "VARCHAR(255)" },
      { name: "sansad_kshetra", type: "VARCHAR(255)" },
      { name: "vidhan_sabha", type: "VARCHAR(255)" },
      { name: "ward_no", type: "VARCHAR(255)" }
    ];
    for (const col of columnsToAlter) {
      await runQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`, [], `users alter column ${col.name}`);
      await runQuery(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`, [], `volunteers alter column ${col.name}`);
    }
    await runQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`, [], "users add avatar column");
    await runQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS cover TEXT`, [], "users add cover column");
    await runQuery(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS avatar TEXT`, [], "volunteers add avatar column");
    await runQuery(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS cover TEXT`, [], "volunteers add cover column");
    const multiLingualCols = [
      { table: "users", col: "address", type: "TEXT" },
      { table: "users", col: "gender", type: "TEXT" },
      { table: "users", col: "dob", type: "TEXT" },
      { table: "users", col: "blood_group", type: "TEXT" },
      { table: "users", col: "onboardingCompleted", type: "BOOLEAN DEFAULT false" },
      { table: "users", col: "points", type: "INTEGER DEFAULT 0" },
      { table: "users", col: "janSevaCardStatus", type: "TEXT DEFAULT 'none'" },
      { table: "users", col: "janSevaCardNo", type: "TEXT DEFAULT ''" },
      { table: "users", col: "isVolunteer", type: "BOOLEAN DEFAULT false" },
      { table: "users", col: "isDonor", type: "BOOLEAN DEFAULT false" },
      { table: "users", col: "registration_number", type: "VARCHAR(255) UNIQUE" },
      { table: "jobs", col: "titleEn", type: "TEXT" },
      { table: "jobs", col: "titleHi", type: "TEXT" },
      { table: "jobs", col: "locEn", type: "TEXT" },
      { table: "jobs", col: "locHi", type: "TEXT" },
      { table: "campaigns", col: "titleEn", type: "TEXT" },
      { table: "campaigns", col: "titleHi", type: "TEXT" },
      { table: "campaigns", col: "descriptionEn", type: "TEXT" },
      { table: "campaigns", col: "descriptionHi", type: "TEXT" },
      { table: "health_camps", col: "titleEn", type: "TEXT" },
      { table: "health_camps", col: "titleHi", type: "TEXT" },
      { table: "health_camps", col: "dateEn", type: "TEXT" },
      { table: "health_camps", col: "dateHi", type: "TEXT" },
      { table: "health_camps", col: "locationEn", type: "TEXT" },
      { table: "health_camps", col: "locationHi", type: "TEXT" },
      { table: "health_camps", col: "descriptionEn", type: "TEXT" },
      { table: "health_camps", col: "descriptionHi", type: "TEXT" },
      { table: "social_posts", col: "contentEn", type: "TEXT" },
      { table: "social_posts", col: "contentHi", type: "TEXT" }
    ];
    for (const item of multiLingualCols) {
      await runQuery(`ALTER TABLE ${item.table} ADD COLUMN IF NOT EXISTS "${item.col}" ${item.type}`, [], `${item.table} add ${item.col}`);
    }
    const migrateCols = [
      { table: "jobs", old: "title", new: "titleEn" },
      { table: "jobs", old: "location", new: "locEn" },
      { table: "campaigns", old: "title", new: "titleEn" },
      { table: "campaigns", old: "description", new: "descriptionEn" },
      { table: "health_camps", old: "title", new: "titleEn" },
      { table: "health_camps", old: "date", new: "dateEn" },
      { table: "health_camps", old: "location", new: "locationEn" },
      { table: "health_camps", old: "description", new: "descriptionEn" },
      { table: "social_posts", old: "content", new: "contentEn" }
    ];
    for (const item of migrateCols) {
      await runQuery(`UPDATE ${item.table} SET "${item.new}" = "${item.old}" WHERE "${item.new}" IS NULL AND "${item.old}" IS NOT NULL`, [], `${item.table} migrate ${item.old} to ${item.new}`);
    }
    await runQuery(`
      INSERT INTO users (id, name, username, password_hash, role)
      VALUES ('admin', 'System Administrator', 'admin', '$2a$10$D/x31v5.7r7j0U.tH1Mv3ui/b0f1UuVfOaB2b9m8mUoU0F3aXF7u6', 'super_admin')
      ON CONFLICT (id) DO UPDATE SET role = 'super_admin'
    `, [], "default super admin insert");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        token VARCHAR(255) UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "sessions table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        "userId" VARCHAR(255),
        token VARCHAR(255),
        expires_at TIMESTAMP WITH TIME ZONE
      )
    `, [], "password_reset_tokens table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id VARCHAR(255) PRIMARY KEY DEFAULT 'admin',
        username TEXT NOT NULL DEFAULT 'admin',
        password_hash TEXT NOT NULL
      )
    `, [], "admin_credentials table creation");
    try {
      const adminCredRes = await pool3.query(`SELECT count(*) FROM admin_credentials`);
      if (parseInt(adminCredRes.rows[0].count) === 0) {
        const defaultHash = await import_bcryptjs7.default.hash("admin", 10);
        await pool3.query(
          `INSERT INTO admin_credentials (id, username, password_hash) VALUES ('admin', 'admin', $1)`,
          [defaultHash]
        );
        console.warn("[SECURITY] admin_credentials seeded with default password 'admin' \u2014 change this immediately via the Admin Dashboard.");
      }
    } catch (e) {
      console.warn("admin_credentials seed check failed:", e.message);
    }
    await runQuery(`
      CREATE TABLE IF NOT EXISTS service_content (
        id SERIAL PRIMARY KEY,
        service_id VARCHAR(255) UNIQUE,
        content_en TEXT,
        content_hi TEXT,
        action_label_en TEXT,
        action_label_hi TEXT,
        action_url TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "service_content table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        role TEXT DEFAULT 'citizen',
        "tollFree" TEXT,
        "webUrl" TEXT,
        "founderMessageEn" TEXT,
        "founderMessageHi" TEXT,
        "helplinesMarquee" TEXT
      )
    `, [], "settings table creation");
    await runQuery('ALTER TABLE settings ADD COLUMN IF NOT EXISTS "helplinesMarquee" TEXT;', [], "alter settings helplinesMarquee");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS dynamic_settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "dynamic_settings table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        admin_id VARCHAR(255),
        admin_name VARCHAR(255),
        action VARCHAR(255),
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "audit_logs table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], "otps table creation");
    await runQuery("ALTER TABLE otps ALTER COLUMN phone TYPE VARCHAR(255)", [], "otps alter column phone size");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS directory_services (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255),
        name VARCHAR(255),
        contact VARCHAR(255),
        address TEXT,
        title TEXT,
        description TEXT,
        
        
        status VARCHAR(50) DEFAULT 'active'
      )
    `, [], "directory_services table creation");
    await runQuery('ALTER TABLE directory_services DROP COLUMN IF EXISTS "titleEn"');
    await runQuery('ALTER TABLE directory_services DROP COLUMN IF EXISTS "titleHi"');
    await runQuery('ALTER TABLE directory_services DROP COLUMN IF EXISTS "descEn"');
    await runQuery('ALTER TABLE directory_services DROP COLUMN IF EXISTS "descHi"');
    await runQuery("ALTER TABLE directory_services ADD COLUMN IF NOT EXISTS title TEXT");
    await runQuery("ALTER TABLE directory_services ADD COLUMN IF NOT EXISTS description TEXT");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id UUID PRIMARY KEY,
        author TEXT,
        role TEXT,
        avatar TEXT,
        "textEn" TEXT,
        "textHi" TEXT,
        image TEXT,
        likes INTEGER DEFAULT 0,
        "commentsCount" INTEGER DEFAULT 0,
        liked BOOLEAN DEFAULT false,
        platform TEXT,
        link TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "social_posts table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY,
        "titleEn" TEXT,
        "titleHi" TEXT,
        "goalAmount" NUMERIC DEFAULT 0,
        "raisedAmount" NUMERIC DEFAULT 0,
        "imageUrl" TEXT,
        "coverImgUrl" TEXT,
        urgent BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "campaigns table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY,
        "titleEn" TEXT,
        "titleHi" TEXT,
        company TEXT,
        "locEn" TEXT,
        "locHi" TEXT,
        salary TEXT,
        "typeEn" TEXT,
        "typeHi" TEXT,
        "postedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "jobs table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS health_camps (
        id UUID PRIMARY KEY,
        "titleEn" TEXT,
        "titleHi" TEXT,
        "dateEn" TEXT,
        "dateHi" TEXT,
        "locationEn" TEXT,
        "locationHi" TEXT,
        contact TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "health_camps table creation");
    await runQuery(`ALTER TABLE health_camps ADD COLUMN IF NOT EXISTS "registeredCount" INTEGER DEFAULT 0`, [], "health_camps registeredCount column");
    await runQuery(`
      CREATE OR REPLACE VIEW camps AS 
      SELECT * FROM health_camps
    `, [], "camps view creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS grievances (
        id UUID PRIMARY KEY,
        title TEXT,
        description TEXT,
        category TEXT,
        urgency TEXT,
        location TEXT,
        "reportedBy" TEXT,
        status TEXT DEFAULT 'Pending',
        date TEXT,
        "aiSummary" TEXT,
        "audioUrl" TEXT,
        "videoUrl" TEXT,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "grievances table creation");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "audioUrl" TEXT', [], "grievance audioUrl migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "videoUrl" TEXT', [], "grievance videoUrl migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "imageUrl" TEXT', [], "grievance imageUrl migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "date" TEXT', [], "grievance date migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "aiSummary" TEXT', [], "grievance aiSummary migration");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS service_submissions_v2 (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT,
        "serviceNameEn" TEXT,
        "serviceName" TEXT,
        "citizenName" TEXT,
        "citizenPhone" TEXT,
        "submissionData" TEXT,
        status TEXT DEFAULT 'pending',
        latitude NUMERIC,
        longitude NUMERIC,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "service_submissions_v2 table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS health_vitals (
        user_id VARCHAR(255) PRIMARY KEY,
        steps INTEGER DEFAULT 0,
        water_cups INTEGER DEFAULT 0,
        calories INTEGER DEFAULT 0,
        exercise_mins INTEGER DEFAULT 0,
        weight NUMERIC DEFAULT 0,
        height NUMERIC DEFAULT 0,
        bmi NUMERIC DEFAULT 0,
        sleep_hours NUMERIC DEFAULT 0,
        heart_rate INTEGER DEFAULT 72,
        sleep_cycle VARCHAR(100) DEFAULT '7h 15m',
        period_day INTEGER DEFAULT 12,
        pregnancy_week INTEGER DEFAULT 8,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "health_vitals table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS medications (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255),
        name TEXT,
        alarm_time VARCHAR(50),
        taken BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "medications table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS pediatric_profile (
        user_id VARCHAR(255) PRIMARY KEY,
        child_age VARCHAR(50),
        child_weight VARCHAR(50),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "pediatric_profile table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS vaccine_status (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255),
        vaccine_name TEXT,
        done BOOLEAN DEFAULT false,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, vaccine_name)
      )
    `, [], "vaccine_status table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS event_rsvps (
        user_id VARCHAR(255),
        event_title TEXT,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, event_title)
      )
    `, [], "event_rsvps table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS volunteers (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        registration_number VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        full_name TEXT,
        avatar TEXT,
        father_husband_name TEXT,
        mother_name TEXT,
        dob DATE,
        mobile VARCHAR(20) UNIQUE,
        email VARCHAR(255) UNIQUE,
        education JSONB,
        blood_group VARCHAR(10),
        skills JSONB,
        reason_for_joining TEXT,
        availability VARCHAR(100),
        national_id_1 VARCHAR(50),
        national_id_2 VARCHAR(50),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        pincode VARCHAR(20),
        area_locality VARCHAR(255),
        sansad_kshetra VARCHAR(255),
        vidhan_sabha VARCHAR(255),
        ward_no VARCHAR(255),
        approval_status VARCHAR(50) DEFAULT 'pending',
        
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "volunteers table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY,
        "jobId" TEXT,
        "jobTitle" TEXT,
        "fullName" TEXT,
        phone TEXT,
        resume TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "job_applications table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_donors (
        id UUID PRIMARY KEY,
        name TEXT,
        "bloodGroup" TEXT,
        phone TEXT,
        location TEXT,
        verified BOOLEAN DEFAULT true,
        distance TEXT,
        "lastDonated" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "blood_donors table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS card_applications_v2 (
        id UUID PRIMARY KEY, "userId" VARCHAR(255),
        name TEXT,
        gender TEXT,
        dob TEXT,
        address TEXT,
        "idType" TEXT,
        "idNumber" TEXT,
        status TEXT DEFAULT 'pending',
        "cardNo" TEXT DEFAULT '',
        "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "card_applications_v2 table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        "userId" VARCHAR(255),
        "donorName" TEXT NOT NULL,
        "donorEmail" TEXT,
        amount DECIMAL(10, 2) NOT NULL,
        "campaignId" INTEGER,
        "transactionId" VARCHAR(255) UNIQUE,
        status TEXT DEFAULT 'success',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "donations table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS volunteer_tasks (
        id SERIAL PRIMARY KEY,
        "volunteerId" VARCHAR(255) NOT NULL,
        "titleEn" TEXT NOT NULL,
        "titleHi" TEXT NOT NULL,
        "descriptionEn" TEXT,
        "descriptionHi" TEXT,
        points INTEGER DEFAULT 10,
        status TEXT DEFAULT 'assigned',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "volunteer_tasks table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS passkeys (
        "credentialID" TEXT PRIMARY KEY,
        "publicKey" TEXT NOT NULL,
        counter INTEGER NOT NULL,
        "userId" VARCHAR(255) NOT NULL
      )
    `, [], "passkeys table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS street_ratings (
        id SERIAL PRIMARY KEY,
        location_name TEXT NOT NULL,
        latitude NUMERIC NOT NULL,
        longitude NUMERIC NOT NULL,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        notes TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "street_ratings table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS women_complaints (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        complainant_name TEXT,
        complainant_phone TEXT,
        complaint_type TEXT NOT NULL,
        incident_date TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        suspect_details TEXT,
        is_anonymous BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'Pending Review',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "women_complaints table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        splash_animation TEXT DEFAULT 'fade',
        splash_logo TEXT DEFAULT '/assets/logo.png',
        splash_duration INTEGER DEFAULT 2000,
        login_bg_image TEXT DEFAULT '/assets/login-bg.jpg',
        social_login_enabled BOOLEAN DEFAULT false,
        marquee_text TEXT DEFAULT 'Welcome to RP Foundation Jan Seva App',
        marquee_speed INTEGER DEFAULT 2,
        marquee_color TEXT DEFAULT '#ffffff',
        marquee_bg_color TEXT DEFAULT '#000080',
        primary_color TEXT DEFAULT '#000080',
        secondary_color TEXT DEFAULT '#ff9933',
        font_family TEXT DEFAULT 'Inter',
        hero_type TEXT DEFAULT 'carousel',
        hero_media_url TEXT DEFAULT '',
        show_widgets BOOLEAN DEFAULT true,
        show_notices BOOLEAN DEFAULT true,
        founder_image TEXT DEFAULT '/assets/founder.jpg',
        founder_message TEXT DEFAULT 'Together we can make a difference.'
      )
    `, [], "app_settings table creation");
    await runQuery(`
      INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    `, [], "app_settings default seed");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "announcements table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS success_stories (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'pending'
      )
    `, [], "success_stories table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS scholarships (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "scholarships table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS food_support (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "food_support table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS medicine_support (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "medicine_support table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS education_aid (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "education_aid table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS senior_citizens (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "senior_citizens table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS animal_welfare (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "animal_welfare table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS environment (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "environment table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS religious_culture (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "religious_culture table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS disaster_management (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "disaster_management table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS farmer_support (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "farmer_support table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS government_schemes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "government_schemes table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS skills_training (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "skills_training table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS global_guide (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "global_guide table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blogs (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        "authorName" TEXT NOT NULL,
        "authorId" VARCHAR(255) NOT NULL,
        approved BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "publishedAt" TIMESTAMP WITH TIME ZONE
      )
    `, [], "blogs table creation");
    try {
      const postsCount = await client.query("SELECT COUNT(*) FROM social_posts");
      if (parseInt(postsCount.rows[0].count, 10) === 0) {
        console.log("Seeding default social_posts into PostgreSQL...");
        const DEFAULT_POSTS = [
          {
            author: "Rohit Pandit",
            role: "Founder, RP Foundation",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            textEn: "Sharing highlights from our weekend tree plantation drive in Karond, Bhopal. Over 500 saplings planted! \u{1F333} Let's build a greener tomorrow.",
            textHi: "\u0915\u0930\u094C\u0902\u0926, \u092D\u094B\u092A\u093E\u0932 \u092E\u0947\u0902 \u0939\u092E\u093E\u0930\u0947 \u0938\u092A\u094D\u0924\u093E\u0939\u093E\u0902\u0924 \u0935\u0943\u0915\u094D\u0937\u093E\u0930\u094B\u092A\u0923 \u0905\u092D\u093F\u092F\u093E\u0928 \u0915\u0940 \u0915\u0941\u091B \u091D\u0932\u0915\u093F\u092F\u093E\u0901\u0964 500 \u0938\u0947 \u0905\u0927\u093F\u0915 \u092A\u094C\u0927\u0947 \u0932\u0917\u093E\u090F \u0917\u090F! \u{1F333} \u0906\u0907\u090F \u090F\u0915 \u0939\u0930\u093F\u0924 \u0915\u0932 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0947\u0902\u0964",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
            likes: 412,
            commentsCount: 18,
            liked: false,
            platform: "instagram",
            link: "https://www.instagram.com/therohitpandit/"
          },
          {
            author: "RP Foundation",
            role: "Official Page",
            avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80",
            textEn: "Successful free eye checkup camp conducted today at Sehore district. Over 200 patients received free consultations and medicines. \u{1FA7A}\u{1F499}",
            textHi: "\u0938\u0940\u0939\u094B\u0930 \u091C\u093F\u0932\u093E \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u092E\u0947\u0902 \u0906\u091C \u0938\u092B\u0932 \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u0928\u0947\u0924\u094D\u0930 \u091C\u093E\u0902\u091A \u0936\u093F\u0935\u093F\u0930 \u0906\u092F\u094B\u091C\u093F\u0924 \u0915\u093F\u092F\u093E \u0917\u092F\u093E\u0964 200 \u0938\u0947 \u0905\u0927\u093F\u0915 \u092E\u0930\u0940\u091C\u094B\u0902 \u0915\u094B \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u092A\u0930\u093E\u092E\u0930\u094D\u0936 \u0914\u0930 \u0926\u0935\u093E\u090F\u0902 \u0926\u0940 \u0917\u0908\u0902\u0964 \u{1FA7A}\u{1F499}",
            image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
            likes: 580,
            commentsCount: 34,
            liked: false,
            platform: "facebook",
            link: "https://www.facebook.com/rpfofficial"
          }
        ];
        for (const p of DEFAULT_POSTS) {
          await client.query(
            `INSERT INTO social_posts (id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [import_crypto19.default.randomUUID(), p.author, p.role, p.avatar, p.textEn, p.textHi, p.image, p.likes, p.commentsCount, p.liked, p.platform, p.link]
          );
        }
      }
    } catch (e) {
      console.warn("Seeding social posts failed:", e);
    }
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_banks (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        stock_a_plus INTEGER DEFAULT 10,
        stock_a_minus INTEGER DEFAULT 5,
        stock_b_plus INTEGER DEFAULT 12,
        stock_b_minus INTEGER DEFAULT 4,
        stock_ab_plus INTEGER DEFAULT 8,
        stock_ab_minus INTEGER DEFAULT 2,
        stock_o_plus INTEGER DEFAULT 15,
        stock_o_minus INTEGER DEFAULT 6
      )
    `, [], "blood_banks table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_requests (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        blood_group VARCHAR(10) NOT NULL,
        component_type VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        urgency VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        doctor_name TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "blood_requests table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_appointments (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        blood_bank_id VARCHAR(255) NOT NULL,
        appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
        blood_group VARCHAR(10),
        status VARCHAR(20) DEFAULT 'Scheduled',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "blood_appointments table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS rto_vehicles (
        plate_number VARCHAR(50) PRIMARY KEY,
        owner_name VARCHAR(255) NOT NULL,
        vehicle_model VARCHAR(255),
        registration_date DATE,
        insurance_validity DATE,
        fitness_validity DATE,
        fuel_type VARCHAR(50),
        rto_code VARCHAR(50),
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "rto_vehicles table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS family_groups (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        invite_code VARCHAR(50) UNIQUE,
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "family_groups table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS family_members (
        id VARCHAR(255) PRIMARY KEY,
        group_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(group_id, user_id)
      )
    `, [], "family_members table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS member_locations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        battery_level INTEGER,
        is_charging BOOLEAN,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "member_locations table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS fuel_logs (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        odometer INTEGER NOT NULL,
        liters NUMERIC NOT NULL,
        price_per_liter NUMERIC NOT NULL,
        total_cost NUMERIC NOT NULL,
        fill_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "fuel_logs table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        instructor VARCHAR(255) NOT NULL,
        youtube_id VARCHAR(255) NOT NULL,
        duration VARCHAR(50),
        views INTEGER DEFAULT 0
      )
    `, [], "courses table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS mock_test_scores (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        test_category VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        date_taken TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "mock_test_scores table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS library_books (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        views INTEGER DEFAULT 0
      )
    `, [], "library_books table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS job_listings (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        salary VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], "job_listings table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS panchang_calendar (
        date VARCHAR(255) PRIMARY KEY,
        tithi VARCHAR(255) NOT NULL,
        nakshatra VARCHAR(255) NOT NULL,
        sunrise VARCHAR(255) NOT NULL,
        sunset VARCHAR(255) NOT NULL,
        moonrise VARCHAR(255) NOT NULL,
        moonset VARCHAR(255) NOT NULL,
        festivals TEXT
      )
    `, [], "panchang_calendar table creation");
    await runQuery(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], "chat_history table creation");
    try {
      const bankCount = await client.query("SELECT COUNT(*) FROM blood_banks");
      if (parseInt(bankCount.rows[0].count, 10) === 0) {
        console.log("Seeding default blood banks...");
        const DEFAULT_BANKS = [
          {
            id: "bank_bhopal_redcross",
            name: "Bhopal Red Cross Blood Bank",
            email: "bhopal.redcross@bloodbank.org",
            phone: "+91-755-2550108",
            address: "Link Road No. 1, near Shivaji Nagar",
            city: "Bhopal",
            state: "Madhya Pradesh",
            pincode: "462016",
            stock_a_plus: 15,
            stock_a_minus: 3,
            stock_b_plus: 22,
            stock_b_minus: 5,
            stock_ab_plus: 8,
            stock_ab_minus: 1,
            stock_o_plus: 28,
            stock_o_minus: 7
          },
          {
            id: "bank_indore_civil",
            name: "Indore Central Blood Bank",
            email: "indore.civil@bloodbank.org",
            phone: "+91-731-2430200",
            address: "MY Hospital Campus, Residency Area",
            city: "Indore",
            state: "Madhya Pradesh",
            pincode: "452001",
            stock_a_plus: 12,
            stock_a_minus: 4,
            stock_b_plus: 18,
            stock_b_minus: 3,
            stock_ab_plus: 5,
            stock_ab_minus: 2,
            stock_o_plus: 20,
            stock_o_minus: 5
          },
          {
            id: "bank_sehore_public",
            name: "Sehore District Hospital Blood Bank",
            email: "sehore.hospital@bloodbank.org",
            phone: "+91-756-2224444",
            address: "District Hospital, Main Road",
            city: "Sehore",
            state: "Madhya Pradesh",
            pincode: "466001",
            stock_a_plus: 8,
            stock_a_minus: 2,
            stock_b_plus: 10,
            stock_b_minus: 2,
            stock_ab_plus: 3,
            stock_ab_minus: 1,
            stock_o_plus: 12,
            stock_o_minus: 3
          }
        ];
        for (const b of DEFAULT_BANKS) {
          await client.query(
            `INSERT INTO blood_banks (id, name, email, phone, address, city, state, pincode, stock_a_plus, stock_a_minus, stock_b_plus, stock_b_minus, stock_ab_plus, stock_ab_minus, stock_o_plus, stock_o_minus) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [b.id, b.name, b.email, b.phone, b.address, b.city, b.state, b.pincode, b.stock_a_plus, b.stock_a_minus, b.stock_b_plus, b.stock_b_minus, b.stock_ab_plus, b.stock_ab_minus, b.stock_o_plus, b.stock_o_minus]
          );
        }
      }
    } catch (e) {
      console.warn("Seeding blood banks failed:", e);
    }
    console.log("PostgreSQL schema initialization completed successfully.");
  } catch (err) {
    console.error("Database connection or schema init error (non-fatal):", err.message);
  } finally {
    if (client) {
      client.release();
    }
  }
}
app.use("/api/admin/hq", adminHqRoutes_default);
app.get("/api/mandi-prices", async (req, res) => {
  try {
    const basePrices = [
      { commodityEn: "Wheat (Lokwan)", commodityHi: "\u0917\u0947\u0939\u0942\u0901 (\u0932\u094B\u0915\u0935\u0928)", price: 2850, trend: "+15" },
      { commodityEn: "Rice (Basmati)", commodityHi: "\u091A\u093E\u0935\u0932 (\u092C\u093E\u0938\u092E\u0924\u0940)", price: 4200, trend: "-20" },
      { commodityEn: "Soyabean", commodityHi: "\u0938\u094B\u092F\u093E\u092C\u0940\u0928", price: 4600, trend: "+50" },
      { commodityEn: "Onion", commodityHi: "\u092A\u094D\u092F\u093E\u091C", price: 1800, trend: "+10" },
      { commodityEn: "Potato", commodityHi: "\u0906\u0932\u0942", price: 1200, trend: "-5" }
    ];
    const livePrices = basePrices.map((item) => ({
      ...item,
      livePrice: item.price + Math.floor(Math.random() * 40) - 20
    }));
    res.json({ success: true, data: livePrices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/directory", async (req, res) => {
  try {
    const { category } = req.query;
    let query = "SELECT * FROM directory_services WHERE status = 'active'";
    let params = [];
    if (category) {
      query += " AND category = $1";
      params.push(category);
    }
    const result = await pool3.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
var upload2 = (0, import_multer2.default)({
  storage: import_multer2.default.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".pdf", ".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4", ".mov", ".avi", ".mkv", ".3gp"];
    const ext = import_path4.default.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Only PNG, JPG, JPEG, PDF, MP3, WAV, M4A, OGG, WEBM, MP4, MOV, AVI, and MKV files are allowed"));
    }
    cb(null, true);
  }
});
var handleUploadErrors2 = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
};
async function saveFileLocally2(file) {
  const fileExt = import_path4.default.extname(file.originalname) || ".jpg";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e5)}${fileExt}`;
  const destDir = import_path4.default.join(process.cwd(), "uploads");
  if (!import_fs3.default.existsSync(destDir)) {
    import_fs3.default.mkdirSync(destDir, { recursive: true });
  }
  const destFilePath = import_path4.default.join(destDir, filename);
  await import_fs3.default.promises.writeFile(destFilePath, file.buffer);
  return `/uploads/${filename}`;
}
app.post("/api/admin/upload", authenticateToken, requireAdmin, upload2.single("image"), handleUploadErrors2, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const localUrl = await saveFileLocally2(req.file);
    res.json({ success: true, url: localUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
app.use("/uploads", import_express29.default.static(import_path4.default.join(process.cwd(), "uploads")));
app.use("/app", import_express29.default.static(import_path4.default.join(process.cwd(), "public", "app")));
app.get("/app", (req, res) => {
  res.redirect("/app/");
});
async function startServer() {
  await initDatabase();
  loadACGeoJsonAsync().catch((err) => console.error("Error loading GeoJSON in background", err));
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path4.default.join(process.cwd(), "dist");
    app.use(import_express29.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path4.default.join(distPath, "index.html"));
    });
  }
  process.on("uncaughtException", (err) => {
    console.error("CRITICAL: Uncaught Exception:", err);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
  });
  const server = import_http.default.createServer(app);
  const io = new import_socket.Server(server, {
    cors: corsOptions
  });
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required to join chat"));
    import_jsonwebtoken4.default.verify(token, JWT_SECRET, (err, decoded) => {
      if (err || !decoded?.id) return next(new Error("Invalid or expired session"));
      socket.userId = decoded.id;
      socket.userName = decoded.name || "Citizen";
      next();
    });
  });
  io.on("connection", (socket) => {
    socket.on("chat_message", async (msg) => {
      const userId = socket.userId;
      const authorName = socket.userName;
      const text = typeof msg?.text === "string" ? msg.text.trim().slice(0, 2e3) : "";
      if (!text) return;
      try {
        const result = await pool3.query(
          `INSERT INTO community_chat_messages (id, "userId", "authorName", "authorAvatar", text)
           VALUES (gen_random_uuid(), $1, $2, $3, $4)
           RETURNING id, "authorName", "authorAvatar", text, "createdAt"`,
          [userId, authorName, msg?.authorAvatar || null, text]
        );
        io.emit("chat_message", result.rows[0]);
      } catch (e) {
        console.error("Failed to persist chat message:", e.message);
      }
    });
    socket.on("disconnect", () => {
    });
  });
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
