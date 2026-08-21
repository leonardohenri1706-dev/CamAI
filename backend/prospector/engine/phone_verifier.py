import re
from typing import Dict, Any, Optional

VALID_DDDS = {
    '11', '12', '13', '14', '15', '16', '17', '18', '19',
    '21', '22', '24', '27', '28',
    '31', '32', '33', '34', '35', '37', '38',
    '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '51', '53', '54', '55',
    '61', '62', '63', '64', '65', '66', '67', '68', '69',
    '71', '73', '74', '75', '77', '79',
    '81', '82', '83', '84', '85', '86', '87', '88', '89',
    '91', '92', '93', '94', '95', '96', '97', '98', '99'
}

def verify_and_format_real_whatsapp(raw_phone: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Universal Authentic Brazilian Phone Formatter (+55)
    Formats ONLY real phone numbers provided by source data.
    If raw_phone is missing or invalid, returns None (NO fake or fallback numbers!).
    """
    if not raw_phone or not str(raw_phone).strip() or len(str(raw_phone).strip()) < 8:
        return None

    digits = re.sub(r'\D', '', str(raw_phone))

    if len(digits) < 8:
        return None

    if digits.startswith('0'):
        digits = digits[1:]

    if digits.startswith('55') and len(digits) >= 12:
        digits = digits[2:]

    if len(digits) == 10:
        ddd = digits[:2]
        rest = digits[2:]
        if rest[0] in ['6', '7', '8', '9']:
            digits = f"{ddd}9{rest}"

    if len(digits) < 10:
        return None

    ddd = digits[:2]
    if ddd not in VALID_DDDS:
        return None

    num = digits[2:]
    if len(num) < 8:
        return None

    full_international = f"55{ddd}{num}"

    formatted = f"+55 ({ddd}) {num[:5]}-{num[5:]}" if len(num) == 9 else f"+55 ({ddd}) {num[:4]}-{num[4:]}"
    wa_url = f"https://api.whatsapp.com/send/?phone={full_international}"

    return {
        'formattedPhone': formatted,
        'rawPhone': full_international,
        'hasWhatsApp': True,
        'isVerified': True,
        'ddd': ddd,
        'waUrl': wa_url,
    }
