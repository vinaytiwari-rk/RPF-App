// src/utils/healthCalculators.ts

export const assessSymptoms = (symptoms: string[], isHi: boolean) => {
  if (symptoms.includes("cough") && symptoms.includes("fever") && symptoms.includes("sore_throat")) {
    return isHi
      ? "संभावित वायरल संक्रमण / फ्लू (कृपया आराम करें और तरल पदार्थ लें)"
      : "Mild Influenza / Flu (Rest & Stay Hydrated)";
  } else if (symptoms.includes("headache") && symptoms.includes("fatigue")) {
    return isHi
      ? "तनाव जन्य सिरदर्द (हाइड्रेशन बढ़ाएं, आराम करें)"
      : "Tension Headache / Fatigue (Dehydration/Stress)";
  } else {
    return isHi
      ? "सामान्य लक्षण (अवलोकन करें या सेवा केंद्र चिकित्सक से संपर्क करें)"
      : "Mild Symptoms (Monitor & Consult Seva center doctor)";
  }
};

export const calculateBmiValue = (weight: string, height: string) => {
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100; // convert cm to meters
  if (w > 0 && h > 0) {
    return parseFloat((w / (h * h)).toFixed(1));
  }
  return null;
};

export const calculateWellnessValue = (sleepHours: string, exerciseMin: string, waterCups: string) => {
  const sleep = parseFloat(sleepHours) || 0;
  const ex = parseFloat(exerciseMin) || 0;
  const water = parseFloat(waterCups) || 0;
  const score = (sleep * 5) + (ex * 1.5) + (water * 5);
  return Math.min(100, Math.round(score));
};

export interface BPResult {
  status: string;
  advice: string;
  color: string;
}

export const getBpStatus = (systolicBP: number, diastolicBP: number, isHi: boolean): BPResult => {
  if (systolicBP >= 140 || diastolicBP >= 90) {
    return {
      status: isHi ? "🚨 स्टेज 2 उच्च रक्तचाप (Hypertension)" : "🚨 Stage 2 Hypertension",
      advice: isHi ? "सलाह: तुरंत चिकित्सक से संपर्क करें और नमक का सेवन कम करें।" : "Advice: Contact a physician immediately and reduce sodium intake.",
      color: "bg-red-50 text-red-700 border-red-200"
    };
  } else if (systolicBP >= 130 || diastolicBP >= 80) {
    return {
      status: isHi ? "⚠️ स्टेज 1 उच्च रक्तचाप" : "⚠️ Stage 1 Hypertension",
      advice: isHi ? "सलाह: दैनिक व्यायाम शुरू करें और आहार में सुधार करें।" : "Advice: Exercise daily and maintain a healthy diet.",
      color: "bg-amber-50 text-amber-700 border-amber-200"
    };
  } else if (systolicBP >= 120) {
    return {
      status: isHi ? "⚡ ऊंचा रक्तचाप (Elevated)" : "⚡ Elevated BP",
      advice: isHi ? "सलाह: सक्रिय रहें और तली-भुनी चीजों से परहेज करें।" : "Advice: Keep physically active and monitor monthly.",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    };
  } else {
    return {
      status: isHi ? "✅ सामान्य रक्तचाप (Normal)" : "✅ Normal BP",
      advice: isHi ? "सलाह: बहुत बढ़िया! इसी स्वस्थ जीवनशैली को बनाए रखें।" : "Advice: Excellent! Maintain your current lifestyle.",
      color: "bg-green-50 text-green-700 border-green-200"
    };
  }
};

export interface SugarResult {
  status: string;
  advice: string;
  color: string;
}

export const getSugarStatus = (sugarFasting: number, isHi: boolean): SugarResult => {
  if (sugarFasting >= 126) {
    return {
      status: isHi ? "🚨 मधुमेह संकेत (Diabetic Range)" : "🚨 Diabetic Range",
      advice: isHi ? "सलाह: डॉक्टर से सलाह लें और HbA1c टेस्ट करवाएं।" : "Advice: Consult a doctor and order an HbA1c screening.",
      color: "bg-red-50 text-red-700 border-red-200"
    };
  } else if (sugarFasting >= 100) {
    return {
      status: isHi ? "⚠️ प्रीडायबिटीज संकेत (Borderline)" : "⚠️ Pre-Diabetic Range",
      advice: isHi ? "सलाह: मीठा कम करें, फाइबर युक्त भोजन बढ़ाएं और टहलें।" : "Advice: Limit sweets, increase dietary fiber, and walk daily.",
      color: "bg-amber-50 text-amber-700 border-amber-200"
    };
  } else {
    return {
      status: isHi ? "✅ सामान्य शुगर (Healthy)" : "✅ Normal Glucose",
      advice: isHi ? "सलाह: आपका शुगर स्तर स्वस्थ सीमा के अंदर है।" : "Advice: Glucose is within healthy range.",
      color: "bg-green-50 text-green-700 border-green-200"
    };
  }
};

export const getPregnancyGestation = (dueDateIssueDate: string) => {
  if (!dueDateIssueDate) return null;
  const lmp = new Date(dueDateIssueDate);
  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  const today = new Date();
  const diffTime = today.getTime() - lmp.getTime();
  const weeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
  return {
    edd: edd.toLocaleDateString(),
    weeks: weeks > 0 ? weeks : 0
  };
};

export interface GrowthResult {
  status: string;
  color: string;
  standardWeight: number;
}

export const getChildGrowthStatus = (kidAgeYears: number, kidWeightKg: number, isHi: boolean): GrowthResult => {
  const standardWeight = 9.5 + (kidAgeYears - 1) * 2.25;
  const ratio = kidWeightKg / standardWeight;
  let status = "";
  let color = "";
  if (ratio < 0.8) {
    status = isHi ? "🚨 कम वजन (Underweight)" : "🚨 Underweight";
    color = "text-red-700 bg-red-50 border-red-200";
  } else if (ratio > 1.2) {
    status = isHi ? "⚠️ अधिक वजन (Overweight)" : "⚠️ Overweight";
    color = "text-amber-700 bg-amber-50 border-amber-200";
  } else {
    status = isHi ? "✅ स्वस्थ वजन (Normal Growth)" : "✅ Healthy Weight";
    color = "text-green-700 bg-green-50 border-green-200";
  }
  return { status, color, standardWeight };
};
