import { AuditResult } from './auditor';

export interface GeneratedPitch {
  pitchText: string;
  pitchAngle: string;
  templateCategory: 'WEB_APP_DEVELOPMENT' | 'ERP_CRM_AUTOMATION' | 'SEO_GOOGLE_RANKING';
  metaTemplateName: string;
  metaTemplateParameters: string[];
  keyHooks: string[];
}

/**
 * Strips out legal suffixes, emojis, and marketing keywords from Google business titles
 * (e.g. "Dr. Batra's Dental Care - Best Dentist in Mumbai™" -> "Dr. Batra's Dental Care")
 */
export function cleanBusinessName(rawName: string): string {
  if (!rawName) return 'there';

  let cleaned = rawName
    .replace(/[®™©]/g, '')
    .split(/[-–—|:•,\(\)]/)[0]
    .trim();

  // Strip common trailing descriptors
  cleaned = cleaned.replace(/\s+(Pvt\.?\s*Ltd\.?|LLP|LLC|Private Limited|Enterprises|Solutions|Inc\.?)$/i, '');

  const words = cleaned.split(/\s+/);
  if (words.length > 4) {
    cleaned = words.slice(0, 3).join(' ');
  }

  return cleaned.trim() || 'there';
}

/**
 * Cleans ugly Google raw system types like "general_contractor" or "health"
 * into natural readable professional phrases like "Interior Design Firms" or "Dental Clinics"
 */
export function cleanCategoryName(rawCategory?: string | null, targetNiche?: string | null): string {
  // If targetNiche is already provided from the search query/campaign, use it directly
  if (targetNiche && targetNiche.trim().length > 2) {
    return targetNiche.trim().toLowerCase();
  }

  if (!rawCategory || !rawCategory.trim()) {
    return 'local businesses';
  }

  // Pure dynamic regex formatting: converts any raw string (e.g. "solar_panel_contractor") to "solar panel contractor"
  const clean = rawCategory
    .split(',')[0]
    .replace(/[_\-]+/g, ' ')
    .replace(/\b(establishment|point of interest)\b/gi, '')
    .trim()
    .toLowerCase();

  return clean || 'local businesses';
}

/**
 * Dynamically cleans any Indian address or city string to extract the real, natural locality
 * (e.g. "Kalyani Nagar, Pune 411006" -> "Kalyani Nagar", "Andheri West, Mumbai" -> "Andheri West")
 */
export function cleanLocationName(city?: string | null, address?: string | null): string {
  // If address is available, extract the most specific locality/sub-area
  if (address && address.trim()) {
    const parts = address
      .split(',')
      .map((p) => p.replace(/\b(India|\d{6})\b/gi, '').trim())
      .filter((p) => p.length > 2 && !/^\d+$/.test(p));

    if (parts.length >= 2) {
      // Return the sub-locality (e.g. "Greater Kailash 1", "Kalyani Nagar", "Indiranagar")
      const candidate = parts[parts.length - 2] || parts[0];
      return candidate.replace(/\b\d{6}\b/g, '').trim();
    }
  }

  if (city && city.trim()) {
    // Strip 6-digit Indian PIN codes dynamically
    const cleanCity = city.replace(/\b\d{6}\b/g, '').replace(/,/g, '').trim();
    if (cleanCity.length > 2) {
      return cleanCity;
    }
  }

  return 'your area';
}

/**
 * Universal B2B Outreach Engine using the 3 Verified & Approved Meta Templates:
 * 1. universal_b2b_web_v2 (For businesses without a website)
 * 2. universal_b2b_crm_intro (For businesses lacking WhatsApp CRM / lead automation)
 * 3. universal_b2b_seo_intro (For established businesses needing Google 3-Pack & SEO)
 */
export function buildUniversalProductionPitch(
  rawBusinessName: string,
  category: string | null,
  city: string | null,
  googleRating: number | null,
  reviewCount: number | null,
  audit: AuditResult,
  targetNiche?: string | null
): GeneratedPitch {
  const name = cleanBusinessName(rawBusinessName);
  const location = cleanLocationName(city);
  const cleanCategory = cleanCategoryName(category, targetNiche);
  const ratingStr = `${googleRating || 4.8}★`;

  // -------------------------------------------------------------------------
  // TEMPLATE 1: universal_b2b_web_v2 (Businesses without Website)
  // -------------------------------------------------------------------------
  if (!audit.hasWebsite || !audit.websiteWorking) {
    const pitchText = `Hello Team ${name},\n\nKudos on ${name}'s ${ratingStr} Google profile in ${location}—great customer reviews! 👏\n\nWe noticed you don't have an active official website to showcase your work online. We help ${cleanCategory} build fast, modern websites & custom business apps that turn Google visitors directly into qualified WhatsApp inquiries.\n\nCan I send over a quick 2-page design preview & feature plan we put together for ${name}?`;

    return {
      pitchText,
      pitchAngle: 'Custom Web & Business App Development',
      templateCategory: 'WEB_APP_DEVELOPMENT',
      metaTemplateName: 'universal_b2b_web_v2',
      metaTemplateParameters: [name, ratingStr, location, cleanCategory],
      keyHooks: ['Modern Website', 'Digital Service Catalog', 'Direct WhatsApp Inquiries'],
    };
  }

  // -------------------------------------------------------------------------
  // TEMPLATE 2: universal_b2b_crm_intro (Businesses Needing CRM & Automation)
  // -------------------------------------------------------------------------
  if (audit.pitchCategory === 'ERP_CRM') {
    const pitchText = `Hello Team ${name},\n\nKudos on your ${ratingStr} reputation in ${location}! 🌟\n\nI visited your website and loved your work. We noticed an opportunity to streamline how you handle incoming customer inquiries—especially when staff is busy or after business hours.\n\nWe build custom WhatsApp CRM workflows, automated customer follow-ups, and ERP business management software tailored for ${cleanCategory} to capture and convert more client inquiries automatically.\n\nWould you be open to seeing a quick 1-minute visual walkthrough of how this works?`;

    return {
      pitchText,
      pitchAngle: 'WhatsApp CRM & ERP Automation',
      templateCategory: 'ERP_CRM_AUTOMATION',
      metaTemplateName: 'universal_b2b_crm_intro',
      metaTemplateParameters: [name, ratingStr, location, cleanCategory],
      keyHooks: ['24/7 WhatsApp Lead Capture', 'Automated Inquiries', 'Custom Business ERP'],
    };
  }

  // -------------------------------------------------------------------------
  // TEMPLATE 3: universal_b2b_seo_intro (Businesses With Active Sites -> SEO/Ads)
  // -------------------------------------------------------------------------
  const pitchText = `Hi Team ${name},\n\nI came across ${name} while looking at established ${cleanCategory} in ${location} (${ratingStr} on Google).\n\nYour website looks great, but right now, you're missing out on the top 3 spots in Google Maps search results where 70% of high-intent clients click first when looking for your services.\n\nWe specialize in ranking local businesses at the very top of Google Search and running targeted digital marketing campaigns to bring steady weekly client inquiries.\n\nCan I send you a free 1-page competitor keyword analysis for ${location}?`;

  return {
    pitchText,
    pitchAngle: 'Google Search & Maps 3-Pack Ranking (SEO / Marketing)',
    templateCategory: 'SEO_GOOGLE_RANKING',
    metaTemplateName: 'universal_b2b_seo_intro',
    metaTemplateParameters: [name, cleanCategory, location, ratingStr],
    keyHooks: ['Google Local 3-Pack Domination', 'Competitor Keyword Analysis', 'Targeted Inquiries'],
  };
}

export async function generatePersonalizedPitch(
  businessName: string,
  category: string | null,
  city: string | null,
  googleRating: number | null,
  reviewCount: number | null,
  audit: AuditResult,
  targetNiche?: string | null
): Promise<GeneratedPitch> {
  return buildUniversalProductionPitch(
    businessName,
    category,
    city,
    googleRating,
    reviewCount,
    audit,
    targetNiche
  );
}
