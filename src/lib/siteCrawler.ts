export interface ScrapedContacts {
  whatsappUrl: string | null;
  whatsappNumber: string | null;
  instagramProfile: string | null;
}

const WA_REGEX = /(?:api\.whatsapp\.com\/send\?phone=|wa\.me\/|web\.whatsapp\.com\/send\?phone=)([0-9]+)/i;
const TEL_REGEX = /^tel:([+0-9]+)$/i;
const INSTA_REGEX = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?/i;
const EXCLUDED_INSTA = new Set(['p', 'reel', 'stories', 'explore', 'about', 'legal', 'developer', 'wordpress', 'sharer']);

/**
 * Lightweight, Ultra-Fast HTML Crawler for Next.js / Edge Serverless
 * Extracts real WhatsApp links, mobile numbers and verified Instagram profiles from website HTML.
 */
export async function scrapeWebsiteContacts(targetUrl: string, timeoutMs: number = 3500): Promise<ScrapedContacts> {
  const result: ScrapedContacts = {
    whatsappUrl: null,
    whatsappNumber: null,
    instagramProfile: null,
  };

  if (!targetUrl || typeof targetUrl !== 'string' || targetUrl.trim().length < 4) {
    return result;
  }

  const url = targetUrl.startsWith('http') ? targetUrl.trim() : `https://${targetUrl.trim()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) return result;

    const html = await res.text();

    // 1. Scan all <a> href links via Regex (zero-dependency, ultra-fast)
    const hrefRegex = /href=["']([^"']+)["']/gi;
    let match: RegExpExecArray | null;

    while ((match = hrefRegex.exec(html)) !== null) {
      const href = match[1].trim();

      // Check WhatsApp Link
      const waMatch = href.match(WA_REGEX);
      if (waMatch && !result.whatsappNumber) {
        result.whatsappNumber = waMatch[1];
        result.whatsappUrl = href.startsWith('http') ? href : `https://${href.replace(/^\/\//, '')}`;
      }

      // Check tel: Link
      const telMatch = href.match(TEL_REGEX);
      if (telMatch && !result.whatsappNumber) {
        const cleanTel = telMatch[1].replace(/\D/g, '');
        if (cleanTel.length >= 10) {
          result.whatsappNumber = cleanTel;
          result.whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanTel}`;
        }
      }

      // Check Instagram Link
      const instaMatch = href.match(INSTA_REGEX);
      if (instaMatch && !result.instagramProfile) {
        const username = instaMatch[1].toLowerCase();
        if (!EXCLUDED_INSTA.has(username)) {
          result.instagramProfile = `https://instagram.com/${instaMatch[1]}`;
        }
      }
    }

    // 2. Fallback: Inline wa.me / api.whatsapp search across full HTML text
    if (!result.whatsappNumber) {
      const bodyWaMatch = html.match(WA_REGEX);
      if (bodyWaMatch) {
        result.whatsappNumber = bodyWaMatch[1];
        result.whatsappUrl = `https://wa.me/${bodyWaMatch[1]}`;
      }
    }

    // 3. Fallback: Cellular regex search in HTML body
    if (!result.whatsappNumber) {
      const mobileMatch = html.match(/(?:whatsapp|whats|contato|celular|fone)?[:\s]*\(?([1-9]{2})\)?\s?(9\d{4})[-\s]?(\d{4})/i);
      if (mobileMatch) {
        const rawDigits = `${mobileMatch[1]}${mobileMatch[2]}${mobileMatch[3]}`;
        result.whatsappNumber = `55${rawDigits}`;
        result.whatsappUrl = `https://api.whatsapp.com/send?phone=55${rawDigits}`;
      }
    }
  } catch {
    // Timeout or network error gracefully silenced
  } finally {
    clearTimeout(timeoutId);
  }

  return result;
}
