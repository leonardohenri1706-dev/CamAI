import { scrapeWebsiteContacts, ScrapedContacts } from './siteCrawler';

export interface BatchLeadInput {
  id?: string;
  name: string;
  websiteUrl?: string | null;
  phoneRaw?: string | null;
  whatsappNumber?: string | null;
  whatsappUrl?: string | null;
  instagramProfile?: string | null;
  [key: string]: any;
}

/**
 * High-Performance Concurrent Batch Crawler for Next.js / Route Handlers
 * Processes leads in controlled pools of concurrency without overloading Node.js sockets.
 */
export async function enrichLeadsBatchNode<T extends BatchLeadInput>(
  leads: T[],
  maxConcurrency: number = 15,
  timeoutMs: number = 3500
): Promise<T[]> {
  const enrichedList: T[] = [];
  const leadsWithWebsites = leads.filter((l) => l.websiteUrl && l.websiteUrl.length > 4);
  const leadsWithoutWebsites = leads.filter((l) => !l.websiteUrl || l.websiteUrl.length <= 4);

  // Process in chunks of maxConcurrency
  for (let i = 0; i < leadsWithWebsites.length; i += maxConcurrency) {
    const chunk = leadsWithWebsites.slice(i, i + maxConcurrency);
    
    const chunkPromises = chunk.map(async (lead) => {
      try {
        if (!lead.whatsappNumber || !lead.instagramProfile) {
          const scraped = await scrapeWebsiteContacts(lead.websiteUrl!, timeoutMs);
          return {
            ...lead,
            whatsappNumber: lead.whatsappNumber || scraped.whatsappNumber,
            whatsappUrl: lead.whatsappUrl || scraped.whatsappUrl,
            instagramProfile: lead.instagramProfile || scraped.instagramProfile,
          };
        }
      } catch {
        // Continue silently on single lead failure
      }
      return lead;
    });

    const chunkResults = await Promise.allSettled(chunkPromises);
    for (const res of chunkResults) {
      if (res.status === 'fulfilled') {
        enrichedList.push(res.value as T);
      }
    }
  }

  return [...enrichedList, ...leadsWithoutWebsites];
}
