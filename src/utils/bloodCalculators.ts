// src/utils/bloodCalculators.ts

export const getBloodCompatibility = (bloodType: string) => {
  const compatMap: Record<string, { donors: string[]; recipients: string[] }> = {
    "A+": { donors: ["A+", "A-", "O+", "O-"], recipients: ["A+", "AB+"] },
    "A-": { donors: ["A-", "O-"], recipients: ["A+", "A-", "AB+", "AB-"] },
    "B+": { donors: ["B+", "B-", "O+", "O-"], recipients: ["B+", "AB+"] },
    "B-": { donors: ["B-", "O-"], recipients: ["B+", "B-", "AB+", "AB-"] },
    "AB+": { donors: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], recipients: ["AB+"] },
    "AB-": { donors: ["A-", "B-", "AB-", "O-"], recipients: ["AB+", "AB-"] },
    "O+": { donors: ["O+", "O-"], recipients: ["A+", "B+", "AB+", "O+"] },
    "O-": { donors: ["O-"], recipients: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] }
  };
  return compatMap[bloodType] || { donors: [], recipients: [] };
};

export const getDonationIntervalEligiblity = (lastDonationDate: string, donorGender: string) => {
  if (!lastDonationDate) return null;
  const limit = donorGender === "female" ? 120 : 90;
  const last = new Date(lastDonationDate);
  const diffTime = Math.abs(new Date().getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return {
    eligible: diffDays >= limit,
    daysLeft: limit - diffDays,
    limit
  };
};

export const getEstimatedBloodVolume = (patientWeight: number, patientHeight: number) => {
  // Nadler's formula simplified: (0.3669 * H^3) + (0.03219 * W) + 0.6041 (Male model average)
  const hM = patientHeight * 0.0254; // convert inches to meters
  const volume = ((0.3669 * Math.pow(hM, 3)) + (0.03219 * patientWeight) + 0.6041).toFixed(2);
  return volume;
};

export const getUrgencyTriageIndex = (calcHb: number, isHi: boolean) => {
  if (calcHb < 7) {
    return {
      level: isHi ? "🚨 अति गंभीर (Immediate Transfusion Needed)" : "🚨 Critical (Immediate Transfusion Needed)",
      color: "bg-red-50 text-red-700 border-red-200"
    };
  } else if (calcHb < 10) {
    return {
      level: isHi ? "⚠️ मध्यम तात्कालिकता (Moderate Urgency)" : "⚠️ Moderate Urgency",
      color: "bg-amber-50 text-amber-700 border-amber-200"
    };
  } else {
    return {
      level: isHi ? "✅ सामान्य (Standard Request)" : "✅ Normal (Standard Request)",
      color: "bg-green-50 text-green-700 border-green-200"
    };
  }
};
