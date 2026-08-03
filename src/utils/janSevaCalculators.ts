// src/utils/janSevaCalculators.ts

export const getEligibleSchemes = (matchAge: number, matchIncome: number) => {
  const eligibleList = [];
  if (matchIncome <= 120000) eligibleList.push("Ayushman Bharat (Free Health Cover)");
  if (matchIncome <= 180000 && matchAge >= 60) eligibleList.push("IGNOAPS Old-Age Pension");
  if (matchIncome <= 250000) eligibleList.push("PM Kisan Samman Nidhi (Farmer Subsidy)");
  if (matchIncome <= 100000) eligibleList.push("Ladli Behna Scheme (Women Cash Grant)");
  return eligibleList;
};

export const getCardExpiryTracker = (issueDate: string) => {
  if (!issueDate) return null;
  const issue = new Date(issueDate);
  const expiry = new Date(issue.getTime() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 year expiration
  const diffTime = expiry.getTime() - new Date().getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return {
    expiryDateStr: expiry.toLocaleDateString(),
    expired: diffDays <= 0,
    diffDays
  };
};

export const validateLuhn = (cardCheckNo: string) => {
  if (cardCheckNo.length < 12) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardCheckNo.length - 1; i >= 0; i--) {
    let digit = parseInt(cardCheckNo.charAt(i), 10);
    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

export const getPovertyLineStatus = (matchIncome: number, dependentCount: number) => {
  const bplCap = 15000 + (dependentCount * 2000); // dynamic BPL income standard adjustment
  return {
    isBPL: matchIncome <= bplCap,
    bplCap
  };
};

export const getDependencyRatio = (monthlyExpense: number, dependentCount: number) => {
  return Math.round(monthlyExpense / (dependentCount + 1));
};
