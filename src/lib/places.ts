import axios from 'axios';

export interface PlaceLead {
  placeId: string;
  businessName: string;
  category?: string;
  address?: string;
  city?: string;
  phoneNumber?: string;
  formattedPhone?: string;
  websiteUrl?: string;
  googleRating?: number;
  reviewCount?: number;
  googleMapsUrl?: string;
}

export function normalizePhoneNumber(rawPhone?: string, defaultCountry = '91'): string | null {
  if (!rawPhone) return null;
  // Remove all non-digits except leading +
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');
  if (!cleaned) return null;

  // If already starts with +, remove + to standardize
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Handle standard Indian 10-digit mobile numbers
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    cleaned = defaultCountry + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = defaultCountry + cleaned.substring(1);
  }

  // Validate E.164 numeric length (usually 10 to 15 digits)
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  return null;
}

export async function searchGooglePlaces(
  query: string,
  apiKey: string = process.env.GOOGLE_PLACES_API_KEY || ''
): Promise<PlaceLead[]> {
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not configured.');
  }

  try {
    // 1. Text Search to find place candidates
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${apiKey}`;
    
    const searchRes = await axios.get(searchUrl);
    if (searchRes.data.status !== 'OK' && searchRes.data.status !== 'ZERO_RESULTS') {
      console.warn(`Places Search status: ${searchRes.data.status} - ${searchRes.data.error_message || ''}`);
    }

    const results = searchRes.data.results || [];
    const leads: PlaceLead[] = [];

    // 2. Fetch detailed profiles for up to top 20 candidates
    for (const item of results.slice(0, 20)) {
      try {
        const placeId = item.place_id;
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,url,types&key=${apiKey}`;
        
        const detailRes = await axios.get(detailsUrl);
        const detail = detailRes.data.result || {};

        const rawPhone = detail.international_phone_number || detail.formatted_phone_number;
        const formattedPhone = normalizePhoneNumber(rawPhone);

        // Parse category from types
        const types: string[] = detail.types || item.types || [];
        const cleanCategory = types
          .filter((t) => !['point_of_interest', 'establishment'].includes(t))
          .map((t) => t.replace(/_/g, ' '))
          .join(', ') || query;

        // Parse city from formatted address if available
        let city = '';
        const addressParts = (detail.formatted_address || item.formatted_address || '').split(',');
        if (addressParts.length > 2) {
          city = addressParts[addressParts.length - 2].trim();
        }

        leads.push({
          placeId: placeId,
          businessName: detail.name || item.name,
          category: cleanCategory,
          address: detail.formatted_address || item.formatted_address || '',
          city: city,
          phoneNumber: rawPhone,
          formattedPhone: formattedPhone || undefined,
          websiteUrl: detail.website || undefined,
          googleRating: detail.rating || item.rating || 0,
          reviewCount: detail.user_ratings_total || item.user_ratings_total || 0,
          googleMapsUrl: detail.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail.name || item.name)}&query_place_id=${placeId}`,
        });
      } catch (itemErr) {
        console.error(`Error fetching place detail for ${item.name}:`, itemErr);
      }
    }

    return leads;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Google Places Search API Error:', err.message);
    throw error;
  }
}
