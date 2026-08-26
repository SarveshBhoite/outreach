import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AuditResult {
  hasWebsite: boolean;
  websiteWorking: boolean;
  isMobileFriendly: boolean;
  pageSpeedScore?: number;
  sslValid: boolean;
  pitchCategory: 'WEB_APP_DEV' | 'ERP_CRM' | 'LOCAL_SEO_MARKETING' | 'GMB_RANKING';
  auditSummary: string;
  recommendations: string[];
}

export async function auditDigitalFootprint(
  websiteUrl?: string,
  businessName?: string,
  googleRating?: number,
  reviewCount?: number
): Promise<AuditResult> {
  const recommendations: string[] = [];

  // CASE 1: No Website Listed on Google
  if (!websiteUrl || websiteUrl.trim() === '') {
    recommendations.push('Create modern mobile-responsive business website');
    recommendations.push('Implement 24/7 automated WhatsApp lead capture & booking system');
    recommendations.push('Set up custom domain & professional business email');

    return {
      hasWebsite: false,
      websiteWorking: false,
      isMobileFriendly: false,
      sslValid: false,
      pitchCategory: 'WEB_APP_DEV',
      auditSummary: `No active website found for ${businessName || 'this business'}. High potential for custom web presence, mobile booking flow, or CRM.`,
      recommendations,
    };
  }

  // Ensure URL protocol
  let targetUrl = websiteUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  let websiteWorking = false;
  let sslValid = targetUrl.startsWith('https://');
  let isMobileFriendly = false;
  let pageSpeedScore: number | undefined = undefined;

  try {
    const startTime = Date.now();
    const response = await axios.get(targetUrl, {
      timeout: 8000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AntigravityAuditor/1.0',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });

    const responseTimeMs = Date.now() - startTime;
    websiteWorking = response.status >= 200 && response.status < 400;

    if (websiteWorking) {
      const html = response.data;
      const $ = cheerio.load(typeof html === 'string' ? html : '');

      // Check viewport meta tag for mobile friendliness
      const viewport = $('meta[name="viewport"]').attr('content');
      isMobileFriendly = Boolean(viewport && viewport.includes('width=device-width'));

      // Check title and meta description for SEO presence
      const title = $('title').text().trim();
      const metaDesc = $('meta[name="description"]').attr('content');
      const hasCrmOrChat = html.includes('whatsapp') || html.includes('intercom') || html.includes('tidio') || html.includes('crisp');

      // Estimate speed score
      if (responseTimeMs < 1000) pageSpeedScore = 90;
      else if (responseTimeMs < 2500) pageSpeedScore = 75;
      else pageSpeedScore = 45;

      if (!sslValid) {
        recommendations.push('Upgrade website to secure HTTPS / SSL certificate');
      }

      if (!isMobileFriendly) {
        recommendations.push('Modernize layout for smooth mobile viewing & instant touch call/chat actions');
      }

      if (!metaDesc || metaDesc.length < 20) {
        recommendations.push('Optimize meta tags and on-page SEO for high Google ranking');
      }

      if (!hasCrmOrChat) {
        recommendations.push('Integrate automated WhatsApp CRM & appointment scheduler');
      }

      // Check Google rating strength
      if ((reviewCount || 0) < 20 || (googleRating || 0) < 4.2) {
        recommendations.push('Deploy automated Google review booster system to dominate local 3-pack');
      }

      // Pitch decision logic
      let pitchCategory: 'WEB_APP_DEV' | 'ERP_CRM' | 'LOCAL_SEO_MARKETING' | 'GMB_RANKING' = 'LOCAL_SEO_MARKETING';
      if (!isMobileFriendly || pageSpeedScore < 50) {
        pitchCategory = 'WEB_APP_DEV';
      } else if (!hasCrmOrChat) {
        pitchCategory = 'ERP_CRM';
      } else if ((googleRating || 0) >= 4.0) {
        pitchCategory = 'LOCAL_SEO_MARKETING';
      } else {
        pitchCategory = 'GMB_RANKING';
      }

      return {
        hasWebsite: true,
        websiteWorking: true,
        isMobileFriendly,
        pageSpeedScore,
        sslValid,
        pitchCategory,
        auditSummary: `Website active (${responseTimeMs}ms response). ${isMobileFriendly ? 'Mobile responsive.' : 'Missing mobile viewport optimization.'} ${hasCrmOrChat ? 'Chat present.' : 'No direct WhatsApp CRM integration found.'}`,
        recommendations,
      };
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.warn(`Could not probe website ${targetUrl}:`, err.message);
  }

  // If website failed to respond
  recommendations.push('Rebuild and restore broken/inaccessible website with high speed modern infrastructure');
  recommendations.push('Deploy instant WhatsApp lead capture system');

  return {
    hasWebsite: true,
    websiteWorking: false,
    isMobileFriendly: false,
    sslValid: false,
    pitchCategory: 'WEB_APP_DEV',
    auditSummary: `Website domain ${targetUrl} listed on Google but currently unresponsive or broken.`,
    recommendations,
  };
}
