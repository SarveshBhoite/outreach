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

  // =========================================================================
  // CASE 1: No Website Listed on Google (True Web/App Candidate)
  // =========================================================================
  if (!websiteUrl || websiteUrl.trim() === '') {
    recommendations.push('Create modern mobile-responsive business website');
    recommendations.push('Implement direct WhatsApp lead inquiry capture');
    recommendations.push('Set up custom domain & professional business email');

    return {
      hasWebsite: false,
      websiteWorking: false,
      isMobileFriendly: false,
      sslValid: false,
      pitchCategory: 'WEB_APP_DEV',
      auditSummary: `No active website found for ${businessName || 'this business'}. Missing digital presence.`,
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
  let isMobileFriendly = true; // Default true if working to avoid falsely downgrading to Web Dev
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
      const html = typeof response.data === 'string' ? response.data : '';
      const $ = cheerio.load(html);

      // Viewport check
      const viewport = $('meta[name="viewport"]').attr('content');
      isMobileFriendly = Boolean(viewport && viewport.includes('width=device-width'));

      // Check chat/CRM presence
      const hasCrmOrChat =
        html.toLowerCase().includes('whatsapp') ||
        html.toLowerCase().includes('intercom') ||
        html.toLowerCase().includes('tidio') ||
        html.toLowerCase().includes('crisp') ||
        html.toLowerCase().includes('wati');

      // Speed estimate
      if (responseTimeMs < 1000) pageSpeedScore = 90;
      else if (responseTimeMs < 2500) pageSpeedScore = 75;
      else pageSpeedScore = 55;

      if (!hasCrmOrChat) {
        recommendations.push('Integrate automated 24/7 WhatsApp CRM & lead follow-up system');
      }

      recommendations.push('Optimize Google Local 3-Pack rankings and review visibility');

      // ---------------------------------------------------------------------
      // PITCH CATEGORIZATION LOGIC:
      // If the business ALREADY HAS a working website:
      // -> If it lacks WhatsApp chat/CRM -> 'ERP_CRM'
      // -> Otherwise -> 'LOCAL_SEO_MARKETING'
      // *Never downgrade an active website to 'WEB_APP_DEV'*
      // ---------------------------------------------------------------------
      let pitchCategory: 'WEB_APP_DEV' | 'ERP_CRM' | 'LOCAL_SEO_MARKETING' | 'GMB_RANKING' = 'LOCAL_SEO_MARKETING';

      if (!hasCrmOrChat) {
        pitchCategory = 'ERP_CRM';
      } else {
        pitchCategory = 'LOCAL_SEO_MARKETING';
      }

      return {
        hasWebsite: true,
        websiteWorking: true,
        isMobileFriendly,
        pageSpeedScore,
        sslValid,
        pitchCategory,
        auditSummary: `Active website (${responseTimeMs}ms response). ${hasCrmOrChat ? 'Chat present.' : 'No automated WhatsApp CRM found.'}`,
        recommendations,
      };
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.warn(`Could not probe website ${targetUrl}:`, err.message);
  }

  // CASE 3: Website URL is listed on Google but server is down / dead
  recommendations.push('Rebuild and restore broken/inaccessible website');
  recommendations.push('Deploy instant WhatsApp lead capture system');

  return {
    hasWebsite: true,
    websiteWorking: false,
    isMobileFriendly: false,
    sslValid: false,
    pitchCategory: 'WEB_APP_DEV',
    auditSummary: `Website ${targetUrl} listed on Google but currently unresponsive or broken.`,
    recommendations,
  };
}
