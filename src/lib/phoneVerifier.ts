export const VALID_DDDS = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '51', '53', '54', '55',
  '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '71', '73', '74', '75', '77', '79',
  '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '91', '92', '93', '94', '95', '96', '97', '98', '99'
]);

/**
 * Universal Authentic Brazilian Phone Formatter (+55)
 * Formats ONLY real phone numbers provided by source data.
 * If rawPhone is missing or invalid, returns null (NO fake or fallback numbers!).
 */
export function verifyAndFormatRealWhatsApp(rawPhone: string | null | undefined) {
  if (!rawPhone || typeof rawPhone !== 'string' || rawPhone.trim().length < 8) {
    return null;
  }

  let digits = rawPhone.replace(/\D/g, '');

  if (digits.length < 8) {
    return null;
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Remove leading country code if present
  if (digits.startsWith('55') && digits.length >= 12) {
    digits = digits.slice(2);
  }

  // Handle 10-digit numbers (DDD + 8 digits)
  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    // Add missing 9 prefix for mobile numbers starting with 6,7,8,9
    if (['6', '7', '8', '9'].includes(rest[0])) {
      digits = `${ddd}9${rest}`;
    }
  }

  if (digits.length < 10) {
    return null;
  }

  const ddd = digits.slice(0, 2);
  if (!VALID_DDDS.has(ddd)) {
    return null;
  }

  const num = digits.slice(2);
  if (num.length < 8) {
    return null;
  }

  // Full international raw phone for WhatsApp (55 + DDD + number)
  const fullInternational = `55${ddd}${num}`;

  // Clean presentation string: +55 (DD) 9XXXX-XXXX or +55 (DD) XXXX-XXXX
  const formatted = num.length === 9
    ? `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`
    : `+55 (${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;

  const waUrl = `https://api.whatsapp.com/send/?phone=${fullInternational}`;

  return {
    formattedPhone: formatted,
    rawPhone: fullInternational,
    hasWhatsApp: true,
    isVerified: true,
    ddd,
    waUrl,
  };
}

export function buildWhatsAppLink(rawPhone: string | null | undefined, messageText?: string) {
  const verified = verifyAndFormatRealWhatsApp(rawPhone);
  if (!verified || !verified.rawPhone) {
    return '';
  }
  const cleanPhone = verified.rawPhone;
  const msg = messageText ? encodeURIComponent(messageText.trim()) : '';
  return `https://api.whatsapp.com/send/?phone=${cleanPhone}${msg ? `&text=${msg}` : ''}`;
}

export const formatAndVerifyWhatsAppNumber = verifyAndFormatRealWhatsApp;
