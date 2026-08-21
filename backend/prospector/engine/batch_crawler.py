# backend/prospector/engine/batch_crawler.py
import asyncio
import re
from typing import List, Dict, Any, Optional

WA_LINK_REGEX = re.compile(
    r'(?:https?://)?(?:api\.whatsapp\.com/send\?phone=|wa\.me/|web\.whatsapp\.com/send\?phone=)([0-9]+)',
    re.IGNORECASE
)
INSTA_LINK_REGEX = re.compile(
    r'(?:https?://)?(?:www\.)?instagram\.com/([a-zA-Z0-9_.]+)/?',
    re.IGNORECASE
)
HREF_REGEX = re.compile(r'href=["\']([^"\']+)["\']', re.IGNORECASE)
EXCLUDED_INSTA = {"p", "reel", "stories", "explore", "about", "legal", "developer", "wordpress", "sharer"}


async def _crawl_single_site(
    client: Any,
    semaphore: asyncio.Semaphore,
    lead: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Rastreia um único site respeitando o limite do semáforo e enriquece o dicionário do lead.
    """
    url = lead.get("website") or lead.get("websiteUrl") or lead.get("websiteUri")
    if not url:
        return lead

    if not str(url).startswith(("http://", "https://")):
        url = f"https://{url}"

    # Adquire a permissão no semáforo para limitar a concorrência
    async with semaphore:
        try:
            res = await client.get(url)
            if res.status_code == 200:
                html = res.text

                # 1. Procura WhatsApp e Instagram em links href
                for match in HREF_REGEX.finditer(html):
                    href = match.group(1).strip()

                    if not lead.get("whatsapp_number"):
                        wa_match = WA_LINK_REGEX.search(href)
                        if wa_match:
                            lead["whatsapp_number"] = wa_match.group(1)
                            lead["whatsapp_url"] = href if href.startswith("http") else f"https://{href.lstrip('/')}"

                    if not lead.get("instagram_profile"):
                        insta_match = INSTA_LINK_REGEX.search(href)
                        if insta_match:
                            user = insta_match.group(1).lower()
                            if user not in EXCLUDED_INSTA:
                                lead["instagram_profile"] = f"https://instagram.com/{insta_match.group(1)}"

                # 2. Fallback de texto inline para WhatsApp
                if not lead.get("whatsapp_number"):
                    body_wa = WA_LINK_REGEX.search(html)
                    if body_wa:
                        lead["whatsapp_number"] = body_wa.group(1)
                        lead["whatsapp_url"] = f"https://wa.me/{body_wa.group(1)}"

                # 3. Fallback para celular no texto
                if not lead.get("whatsapp_number"):
                    mob_match = re.search(r'(?:whatsapp|whats|contato|celular|fone)?[:\s]*\(?([1-9]{2})\)?\s?(9\d{4})[-\s]?(\d{4})', html, re.IGNORECASE)
                    if mob_match:
                        raw_digits = f"{mob_match.group(1)}{mob_match.group(2)}{mob_match.group(3)}"
                        lead["whatsapp_number"] = f"55{raw_digits}"
                        lead["whatsapp_url"] = f"https://api.whatsapp.com/send?phone=55{raw_digits}"

        except Exception:
            # Erros de DNS, timeout ou SSL não devem derrubar o lote
            pass

    return lead


async def enrich_leads_batch(
    leads: List[Dict[str, Any]],
    max_concurrency: int = 15,
    timeout_sec: float = 4.0
) -> List[Dict[str, Any]]:
    """
    Processa a lista de leads em paralelo controlando a concorrência máxima com Semaphore.
    """
    import httpx
    semaphore = asyncio.Semaphore(max_concurrency)

    # Configuração otimizada de conexão compartilhada (Connection Pool)
    limits = httpx.Limits(
        max_keepalive_connections=max_concurrency,
        max_connections=max_concurrency * 2
    )
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    async with httpx.AsyncClient(
        limits=limits,
        headers=headers,
        timeout=timeout_sec,
        follow_redirects=True,
        verify=False
    ) as client:
        tasks = [
            _crawl_single_site(client, semaphore, lead)
            for lead in leads
        ]
        enriched_leads = await asyncio.gather(*tasks, return_exceptions=False)

    return list(enriched_leads)
