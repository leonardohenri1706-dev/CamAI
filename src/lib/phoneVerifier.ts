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

export function verifyAndFormatRealWhatsApp(rawPhone: string | null | undefined) {
  if (!rawPhone) {
    return null;
  }

  let digits = rawPhone.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.startsWith('55') && digits.length >= 12) {
    digits = digits.slice(2);
  }

  // Handle older 10-digit mobile numbers (e.g. 85 9876-5432)
  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const num = digits.slice(2);
    // If first digit of number is mobile (6, 7, 8, 9), convert to 9-digit
    if (['6', '7', '8', '9'].includes(num[0])) {
      digits = `${ddd}9${num}`;
    } else {
      // Landline starting with 2, 3, 4, 5 -> REJECT! Not valid for WhatsApp.
      return null;
    }
  }

  // Mobile must strictly be 11 digits (2 DDD + 9 mobile)
  if (digits.length !== 11) {
    return null;
  }

  const ddd = digits.slice(0, 2);
  const num = digits.slice(2);

  // Validate Brazilian DDD
  if (!VALID_DDDS.has(ddd)) {
    return null;
  }

  // Brazilian mobile numbers on WhatsApp MUST start with 9
  if (!num.startsWith('9')) {
    return null;
  }

  const formatted = `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
  const fullInternational = `55${ddd}${num}`;
  
  // Official direct WhatsApp API URL that works on mobile and web
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

export function buildWhatsAppLink(rawPhone: string | null | undefined, messageText: string) {
  const verified = verifyAndFormatRealWhatsApp(rawPhone);
  const cleanPhone = verified ? verified.rawPhone : (rawPhone || '').replace(/\D/g, '');
  const encoded = encodeURIComponent(messageText.trim());
  return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encoded}`;
}

export const formatAndVerifyWhatsAppNumber = verifyAndFormatRealWhatsApp;
