# backend/prospector/engine/site_crawler.py
import re
from typing import Optional, Dict

# Regex for WhatsApp (wa.me, api.whatsapp.com, web.whatsapp.com, tel:)
WA_LINK_REGEX = re.compile(r'(?:https?://)?(?:api\.whatsapp\.com/send\?phone=|wa\.me/|web\.whatsapp\.com/send\?phone=)([0-9]+)', re.IGNORECASE)
TEL_LINK_REGEX = re.compile(r'^tel:([+0-9]+)$', re.IGNORECASE)
INSTA_LINK_REGEX = re.compile(r'(?:https?://)?(?:www\.)?instagram\.com/([a-zA-Z0-9_.]+)/?', re.IGNORECASE)
HREF_REGEX = re.compile(r'href=["\']([^"\']+)["\']', re.IGNORECASE)

# Excluded generic Instagram paths
EXCLUDED_INSTA = {"p", "reel", "stories", "explore", "about", "legal", "developer", "wordpress", "sharer"}

def extract_contacts_from_website(url: str, timeout_sec: float = 3.5) -> Dict[str, Optional[str]]:
    """
    Synchronous / resilient crawler for Django views to extract WhatsApp and Instagram from website URL.
    """
    if not url or not str(url).strip():
        return {"whatsapp_url": None, "whatsapp_number": None, "instagram_profile": None}

    clean_url = str(url).strip()
    if not clean_url.startswith(("http://", "https://")):
        clean_url = f"https://{clean_url}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    result = {
        "whatsapp_url": None,
        "whatsapp_number": None,
        "instagram_profile": None,
    }

    import requests
    try:
        res = requests.get(clean_url, headers=headers, timeout=timeout_sec, verify=False)
        if res.status_code != 200:
            return result

        html = res.text

        # 1. Search in href links
        for match in HREF_REGEX.finditer(html):
            href = match.group(1).strip()

            # WhatsApp
            wa_match = WA_LINK_REGEX.search(href)
            if wa_match and not result["whatsapp_number"]:
                result["whatsapp_number"] = wa_match.group(1)
                result["whatsapp_url"] = href if href.startswith("http") else f"https://{href.lstrip('/')}"

            # Tel
            tel_match = TEL_LINK_REGEX.match(href)
            if tel_match and not result["whatsapp_number"]:
                clean_tel = re.sub(r"\D", "", tel_match.group(1))
                if len(clean_tel) >= 10:
                    result["whatsapp_number"] = clean_tel
                    result["whatsapp_url"] = f"https://api.whatsapp.com/send?phone={clean_tel}"

            # Instagram
            insta_match = INSTA_LINK_REGEX.search(href)
            if insta_match and not result["instagram_profile"]:
                profile = insta_match.group(1).lower()
                if profile not in EXCLUDED_INSTA:
                    result["instagram_profile"] = f"https://instagram.com/{insta_match.group(1)}"

        # 2. Fallback: Search inline text for wa.me
        if not result["whatsapp_number"]:
            body_match = WA_LINK_REGEX.search(html)
            if body_match:
                result["whatsapp_number"] = body_match.group(1)
                result["whatsapp_url"] = f"https://wa.me/{body_match.group(1)}"

        # 3. Fallback: Cellular regex in HTML
        if not result["whatsapp_number"]:
            mob_match = re.search(r'(?:whatsapp|whats|contato|celular|fone)?[:\s]*\(?([1-9]{2})\)?\s?(9\d{4})[-\s]?(\d{4})', html, re.IGNORECASE)
            if mob_match:
                digits = f"{mob_match.group(1)}{mob_match.group(2)}{mob_match.group(3)}"
                result["whatsapp_number"] = f"55{digits}"
                result["whatsapp_url"] = f"https://api.whatsapp.com/send?phone=55{digits}"

    except Exception:
        pass

    return result
