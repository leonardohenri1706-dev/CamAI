import { createClient } from '@supabase/supabase-js';
import { PlaceLead } from '@/types/prospecting';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project.supabase.co')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Save or update a lead in Supabase database
 */
export async function syncLeadToSupabase(lead: PlaceLead) {
  if (!supabase) {
    console.log('[Supabase Storage] Supabase keys not set yet. Saved locally.');
    return { success: true, localOnly: true };
  }

  try {
    const payload = {
      id: lead.id,
      display_name: lead.displayName,
      category: lead.category,
      address: lead.formattedAddress,
      neighborhood: lead.neighborhood,
      city: lead.city,
      lat: lead.coordinates.lat,
      lng: lead.coordinates.lng,
      has_website: lead.digitalHealth.hasWebsite,
      website_url: lead.digitalHealth.websiteUrl,
      has_whatsapp: lead.digitalHealth.hasWhatsApp,
      formatted_phone: lead.digitalHealth.formattedPhone,
      raw_phone: lead.digitalHealth.rawPhone,
      rating: lead.digitalHealth.rating,
      reviews_count: lead.digitalHealth.reviewsCount,
      google_maps_uri: lead.digitalHealth.googleMapsUri,
      photo_url: lead.digitalHealth.photoUrl,
      has_instagram: lead.digitalHealth.hasInstagram || false,
      instagram_handle: lead.digitalHealth.instagramHandle || null,
      instagram_profile_url: lead.digitalHealth.instagramProfileUrl || null,
      instagram_followers: lead.digitalHealth.instagramFollowers || null,
      score_percentage: lead.scoreResult.leadScorePercentage,
      classification: lead.scoreResult.classification,
      custom_pitch: lead.scoreResult.customPitch,
      is_saved: lead.isSaved || false,
      crm_status: lead.crmStatus || 'Novo',
      source: lead.source || 'google_maps',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('leads')
      .upsert([payload], { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync Error]:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Supabase Error]:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all saved leads from Supabase database
 */
export async function fetchSavedLeadsFromSupabase(): Promise<PlaceLead[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('is_saved', true);

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      displayName: row.display_name,
      category: row.category,
      formattedAddress: row.address,
      neighborhood: row.neighborhood,
      city: row.city,
      coordinates: { lat: row.lat, lng: row.lng },
      digitalHealth: {
        hasWebsite: row.has_website,
        websiteUrl: row.website_url,
        hasWhatsApp: row.has_whatsapp,
        isVerified: true,
        formattedPhone: row.formatted_phone,
        rawPhone: row.raw_phone,
        rating: row.rating,
        reviewsCount: row.reviews_count,
        googleMapsUri: row.google_maps_uri,
        photoUrl: row.photo_url,
        hasInstagram: row.has_instagram,
        instagramHandle: row.instagram_handle,
        instagramProfileUrl: row.instagram_profile_url,
        instagramFollowers: row.instagram_followers,
      },
      scoreResult: {
        leadScorePercentage: row.score_percentage,
        classification: row.classification,
        rationale: 'Retornado do banco de dados Supabase.',
        customPitch: row.custom_pitch,
        factors: { noWebsiteBonus: 35, reviewVolumeBonus: 20, phoneVerifiedBonus: 15, categoryFitBonus: 20 },
      },
      source: row.source,
      isSaved: row.is_saved,
      crmStatus: row.crm_status,
    }));
  } catch (err) {
    console.error('[Supabase Fetch Error]:', err);
    return [];
  }
}
