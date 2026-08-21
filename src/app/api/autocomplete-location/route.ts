import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ success: true, suggestions: [] });
  }

  try {
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=6&countrycodes=br`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'LeadPulse-Next-Autocomplete/1.0',
        },
      }
    );

    if (osmRes.ok) {
      const data = await osmRes.json();
      const suggestions = data.map((item: any) => {
        const addr = item.address || {};
        const city = addr.city || addr.town || addr.municipality || addr.village || addr.state_district || '';
        const state = addr.state || '';
        const suburb = addr.suburb || addr.neighbourhood || '';

        let display = '';
        if (suburb && city) {
          display = `${suburb} - ${city}, ${state}`;
        } else if (city && state) {
          display = `${city}, ${state}`;
        } else {
          display = `${item.display_name.split(',')[0]} - ${city || state}`;
        }

        return {
          name: display,
          city: city || display,
          state: state || 'BR',
          center: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          },
          zoom: 14,
          source: 'osm_maps',
        };
      });

      return NextResponse.json({ success: true, suggestions });
    }
  } catch (e: any) {
    console.warn('Next autocomplete fallback error:', e);
  }

  return NextResponse.json({ success: true, suggestions: [] });
}
