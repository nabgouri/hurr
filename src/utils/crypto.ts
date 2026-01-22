// Simple hash function for PIN (not cryptographically secure, but sufficient for MVP)
// In production, use a proper crypto library like expo-crypto

export const hashPin = (pin: string): string => {
  // Simple hash for demo purposes
  // In production, use proper hashing with salt
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

export const verifyPin = (pin: string, hash: string): boolean => {
  return hashPin(pin) === hash;
};

// Generate a random approval code (for partner system)
export const generateApprovalCode = (length: number = 6): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Convert Western numerals to Arabic numerals
export const toArabicNumerals = (num: number | string): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((digit) => {
      const n = parseInt(digit, 10);
      return isNaN(n) ? digit : arabicNumerals[n];
    })
    .join('');
};

// Convert Arabic numerals to Western numerals
export const toWesternNumerals = (str: string): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = str;
  arabicNumerals.forEach((arabic, index) => {
    result = result.replace(new RegExp(arabic, 'g'), index.toString());
  });
  return result;
};

export default {
  hashPin,
  verifyPin,
  generateApprovalCode,
  toArabicNumerals,
  toWesternNumerals,
};
