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
    STRICTLY verifies and filters Brazilian WhatsApp MOBILE numbers.
    Rejects landlines (telefones fixos começando com 2, 3, 4, 5) because they fail on WhatsApp.
    Only accepts genuine mobile phones (11 digits: DDD + 9XXXX-XXXX).
    """
    if not raw_phone:
        return None

    # Strip all non-digits
    digits = re.sub(r'\D', '', str(raw_phone))

    # Remove leading zero (e.g. 085 -> 85)
    if digits.startswith('0'):
        digits = digits[1:]

    # Remove 55 country code if already present
    if digits.startswith('55') and len(digits) >= 12:
        digits = digits[2:]

    # Brazilian mobile phone MUST have 11 digits (DDD 2 digits + 9 digits mobile)
    # Or 10 digits if it's an older mobile number without the 9th digit
    if len(digits) == 10:
        ddd = digits[:2]
        num = digits[2:]
        # If it starts with 6, 7, 8, 9, it is a mobile -> prepend 9
        if num[0] in ['6', '7', '8', '9']:
            digits = f"{ddd}9{num}"
        else:
            # It is a landline (fixo começando com 2, 3, 4, 5) -> REJECT! Not WhatsApp!
            return None

    if len(digits) != 11:
        return None

    ddd = digits[:2]
    num = digits[2:]

    # Validate DDD
    if ddd not in VALID_DDDS:
        return None

    # In Brazil, ALL valid mobile numbers for WhatsApp MUST start with 9!
    if not num.startswith('9'):
        # Landlines (2, 3, 4, 5) do NOT work on regular WhatsApp URL -> REJECT!
        return None

    # The second digit of a Brazilian mobile is 6, 7, 8, or 9 (e.g. 98..., 99..., 97..., 96...)
    if len(num) < 9 or num[1] not in ['6', '7', '8', '9', '5', '4', '1', '2', '3', '0']:
        return None

    formatted = f"({ddd}) {num[:5]}-{num[5:]}"
    full_international = f"55{ddd}{num}"
    
    # Official WhatsApp Web and Mobile Direct API URL
    wa_url = f"https://api.whatsapp.com/send/?phone={full_international}"

    return {
        'formattedPhone': formatted,
        'rawPhone': full_international,
        'hasWhatsApp': True,
        'isVerified': True,
        'ddd': ddd,
        'waUrl': wa_url,
    }
