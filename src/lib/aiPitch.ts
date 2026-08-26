import { AuditResult } from './auditor';

export interface GeneratedPitch {
  pitchText: string;
  pitchAngle: string;
  templateCategory: 'WEB_APP_DEVELOPMENT' | 'ERP_CRM_AUTOMATION' | 'SEO_GOOGLE_RANKING';
  metaTemplateName: string;
  metaTemplateParameters: string[];
  keyHooks: string[];
}

export function cleanBusinessName(rawName: string): string {
  if (!rawName) return 'there';
  let cleaned = rawName.split(/[-–|:,•]/)[0].trim();
  const words = cleaned.split(' ');
  if (words.length > 4) {
    cleaned = words.slice(0, 3).join(' ');
  }
  return cleaned;
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
  audit: AuditResult
): GeneratedPitch {
  const name = cleanBusinessName(rawBusinessName);
  const location = city || 'your area';
  const cleanCategory = category ? category.split(',')[0].trim() : 'businesses';
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
  if (audit.pitchCategory === 'ERP_CRM' || !audit.isMobileFriendly) {
    const pitchText = `Hello Team ${name},\n\nKudos on your ${ratingStr} reputation in ${location}! 🌟\n\nI visited your website and loved your work. We noticed an opportunity to streamline how you handle incoming customer inquiries—especially when staff is busy or after business hours.\n\nWe build custom WhatsApp CRM workflows, automated customer follow-ups, and ERP business management software tailored for ${cleanCategory} to capture and convert more client inquiries automatically.\n\nWould you be open to seeing a quick 1-minute visual walkthrough of how this works?`;

    return {
      pitchText,
      pitchAngle: 'Custom ERP, CRM & Business Automation',
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
  audit: AuditResult
): Promise<GeneratedPitch> {
  return buildUniversalProductionPitch(
    businessName,
    category,
    city,
    googleRating,
    reviewCount,
    audit
  );
}
