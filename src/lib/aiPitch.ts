import { GoogleGenAI } from '@google/genai';
import { AuditResult } from './auditor';

export interface GeneratedPitch {
  pitchText: string;
  pitchAngle: string;
  keyHooks: string[];
}

export async function generatePersonalizedPitch(
  businessName: string,
  category: string | null,
  city: string | null,
  googleRating: number | null,
  reviewCount: number | null,
  audit: AuditResult,
  apiKey: string = process.env.GEMINI_API_KEY || ''
): Promise<GeneratedPitch> {
  // Determine pitch angle
  let angle = 'Website & App Development';
  if (audit.pitchCategory === 'ERP_CRM') angle = 'Custom ERP / WhatsApp CRM & Automation';
  else if (audit.pitchCategory === 'LOCAL_SEO_MARKETING') angle = 'Local SEO & Google 3-Pack Ranking';
  else if (audit.pitchCategory === 'GMB_RANKING') angle = 'Google Review Booster & Reputation Management';

  // Fallback template if Gemini is offline or not configured
  const fallbackPitch = `Hi ${businessName} team,\n\nI came across your profile on Google (${googleRating || 4.8}★ with ${reviewCount || 'great'} reviews in ${city || 'your area'}).\n\n${
    !audit.hasWebsite
      ? `I noticed you don't have a modern website/booking app set up yet. We help ${category || 'local businesses'} build fast, beautiful websites with automated WhatsApp booking to double client inquiries.`
      : `I checked out your website and loved what you do! We help high-growth ${category || 'businesses'} dominate Google Maps 3-Pack search results, boost SEO rankings, and automate customer inquiries with custom WhatsApp CRM tools.`
  }\n\nWould you be open to a quick 5-min demo or a free visual mockup for ${businessName}? Let me know!`;

  if (!apiKey) {
    return {
      pitchText: fallbackPitch,
      pitchAngle: angle,
      keyHooks: audit.recommendations,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are an elite B2B sales copywriter crafting a concise, warm, highly personalized WhatsApp outreach message for business owners in India.

Business Details:
- Name: "${businessName}"
- Industry / Category: "${category || 'Local Business'}"
- City / Area: "${city || 'Local Market'}"
- Google Rating: ${googleRating || 'High'} stars (${reviewCount || 0} reviews)
- Digital Audit Finding: ${audit.auditSummary}
- Pitch Category: ${audit.pitchCategory}
- Key Pain Points / Opportunities: ${audit.recommendations.join(', ')}

Guidelines for the WhatsApp Pitch:
1. Tone: Respectful, conversational, crisp, non-spammy, and consultative.
2. Structure:
   - Quick compliment referencing their actual business rating/niche.
   - Specific observation from the digital audit (e.g. lack of automated WhatsApp booking, missing mobile-responsive site, or opportunity to capture top 3 Google local searches).
   - Clear value proposition of what we deliver (Custom Web/Mobile App, CRM/WhatsApp ERP automation, or Local SEO/Google Ranking).
   - Low-friction Call To Action (e.g., "Can I share a free 2-minute mockup/audit video for ${businessName}?").
3. Length: Under 80-110 words. No excessive emojis.

Output format:
Return ONLY the final WhatsApp message text, with natural line breaks.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const generated = response.text?.trim() || fallbackPitch;

    return {
      pitchText: generated,
      pitchAngle: angle,
      keyHooks: audit.recommendations,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.warn('Gemini pitch generation failed, using fallback copy:', err.message);
    return {
      pitchText: fallbackPitch,
      pitchAngle: angle,
      keyHooks: audit.recommendations,
    };
  }
}
