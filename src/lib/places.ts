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
  let cleaned = rawPhone.trim().replace(/[^\d]/g, '');
  if (!cleaned) return null;

  // If starts with 0 (e.g. 09876543210 or landline 01140581389)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // If already prefixed with 91 (e.g. 919876543210)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    const mobilePart = cleaned.substring(2);
    // WhatsApp requires a valid mobile number starting with 6, 7, 8, or 9
    if (/^[6-9]\d{9}$/.test(mobilePart)) {
      return `+${cleaned}`;
    }
    return null; // Exclude landlines like 911140581389 (Delhi landline)
  }

  // If 10-digit standard Indian mobile number
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return `+${defaultCountry}${cleaned}`;
  }

  // Generic international mobile validation (10 to 15 digits)
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    // If it's an Indian length (12 digits) but failed mobile prefix check, reject landline
    if (cleaned.startsWith('91') && !/^[6-9]/.test(cleaned.substring(2))) {
      return null;
    }
    return `+${cleaned}`;
  }

  return null;
}

/**
 * Searches Google Places API with support for pagination (up to maxResults)
 */
export async function searchGooglePlaces(
  query: string,
  maxResults: number = 20,
  apiKey: string = process.env.GOOGLE_PLACES_API_KEY || ''
): Promise<PlaceLead[]> {
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not configured.');
  }

  try {
    let allCandidates: any[] = [];
    let nextPageToken: string | undefined = undefined;

    // Fetch pages as needed
    do {
      let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${apiKey}`;

      if (nextPageToken) {
        searchUrl += `&pagetoken=${nextPageToken}`;
        // Google requires a short delay before nextPageToken becomes active
        await new Promise((r) => setTimeout(r, 2000));
      }

      const searchRes = await axios.get(searchUrl);
      const results = searchRes.data.results || [];
      allCandidates.push(...results);

      nextPageToken = searchRes.data.next_page_token;

      if (allCandidates.length >= maxResults || !nextPageToken) {
        break;
      }
    } while (allCandidates.length < maxResults && nextPageToken);

    // Limit to requested count
    const targetCandidates = allCandidates.slice(0, maxResults);
    const leads: PlaceLead[] = [];

    for (const item of targetCandidates) {
      try {
        const placeId = item.place_id;
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,url,types&key=${apiKey}`;

        const detailRes = await axios.get(detailsUrl);
        const detail = detailRes.data.result || {};

        const rawPhone = detail.international_phone_number || detail.formatted_phone_number;
        const formattedPhone = normalizePhoneNumber(rawPhone);

        const types: string[] = detail.types || item.types || [];
        const cleanCategory =
          types
            .filter((t) => !['point_of_interest', 'establishment'].includes(t))
            .map((t) => t.replace(/_/g, ' '))
            .join(', ') || query;

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
          googleMapsUrl:
            detail.url ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              detail.name || item.name
            )}&query_place_id=${placeId}`,
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
