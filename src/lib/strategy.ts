import { GoogleGenAI } from '@google/genai';

export interface StrategyDecision {
  targetNiche: string;
  targetLocation: string;
  searchQuery: string;
  rationale: string;
  targetCity: string;
  targetState: string;
  estimatedLeadVolume: number;
}

/**
 * Autonomous AI Strategy Engine:
 * Generates fresh, un-hardcoded business niches and granular micro-localities
 * across Tier 1, Tier 2, and Tier 3 commercial hubs all over India.
 */
export async function decideDailyStrategy(
  pastTargetHistories: string[] = [],
  apiKey: string = process.env.GEMINI_API_KEY || ''
): Promise<StrategyDecision> {
  const defaultFallback: StrategyDecision = {
    targetNiche: 'Modular Kitchen & Interior Studios',
    targetLocation: 'Kalyani Nagar & Viman Nagar, Pune',
    targetCity: 'Pune',
    targetState: 'Maharashtra',
    searchQuery: 'Modular Kitchen Showrooms in Kalyani Nagar Pune',
    rationale: 'High density of independent local businesses with high order values that need modern digital catalogs and WhatsApp CRM.',
    estimatedLeadVolume: 20,
  };

  if (!apiKey) {
    return defaultFallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are an autonomous AI Market Intelligence & B2B Growth Engine operating across India.
Your mission is to autonomously select the single best B2B niche and hyper-local micro-market in India for today's outreach campaign.

CRITICAL RULES:
1. EXPLORE ALL OVER INDIA:
   - Rotate across all regions: West (Mumbai, Pune, Ahmedabad, Surat, Nagpur, Nashik), South (Bangalore, Hyderabad, Chennai, Kochi, Coimbatore, Vizag), North (Delhi NCR, Gurgaon, Noida, Chandigarh, Jaipur, Lucknow, Ludhiana), East & Central (Kolkata, Bhubaneswar, Indore, Bhopal, Raipur).
   
2. STRICTLY HYPER-LOCAL MICRO-MARKETS (Never broad states or entire generic cities):
   - Pick specific tight commercial zones, sub-neighbourhoods, industrial belts, or luxury high-streets (e.g. "C.G. Road Ahmedabad", "Banjara Hills Road 12 Hyderabad", "Indiranagar 100ft Road Bangalore", "Panchkula Sector 8", "Lal Baug & New Palasia Indore", "Vastrapur Ahmedabad", "Kalyani Nagar Pune", "Khar Linking Road Mumbai").
   - Why: Searching micro-localities uncovers real independent SME owners who urgently need Websites, WhatsApp CRM & Local SEO, rather than massive corporate conglomerates.

3. DIVERSE HIGH-TICKET B2B NICHES:
   - Think creatively across all lucrative Indian SMB sectors:
     - Healthcare & Wellness: Dental Clinics, IVF & Fertility Clinics, Hair Transplant & Skin Clinics, Ayurveda Resorts, Diagnostics.
     - Home & Construction: Modular Kitchens, Luxury Interior Studios, Architects, Marble & Granite Showrooms, Roofing & Solar Installers, Glass & Aluminium Fabricators.
     - Auto & Luxury: Ceramic Coating & Detailing Studios, Car Audio & Accessories, Luxury Spas, Boutique Hotels.
     - Professional & B2B: CA & Corporate Tax Firms, IP/Trademark Lawyers, Commercial Real Estate Agencies, Banquet Halls & Caterers.

4. PREVENT REPETITION:
   - Strictly avoid recent targets: [${pastTargetHistories.slice(-20).join(', ')}].

Output strictly in JSON format:
{
  "targetNiche": "e.g. Hair Transplant & Skin Clinics",
  "targetLocation": "e.g. C.G. Road & Navrangpura, Ahmedabad",
  "targetCity": "Ahmedabad",
  "targetState": "Gujarat",
  "searchQuery": "e.g. Hair transplant and skin clinics in CG Road Ahmedabad",
  "rationale": "e.g. Affluent medical & cosmetic corridor with independent doctors needing direct WhatsApp appointment capture.",
  "estimatedLeadVolume": 20
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '';
    const parsed = JSON.parse(jsonText) as StrategyDecision;

    return {
      targetNiche: parsed.targetNiche || defaultFallback.targetNiche,
      targetLocation: parsed.targetLocation || defaultFallback.targetLocation,
      targetCity: parsed.targetCity || defaultFallback.targetCity,
      targetState: parsed.targetState || defaultFallback.targetState,
      searchQuery: parsed.searchQuery || `${parsed.targetNiche} in ${parsed.targetLocation}`,
      rationale: parsed.rationale || defaultFallback.rationale,
      estimatedLeadVolume: parsed.estimatedLeadVolume || 20,
    };
  } catch (error: unknown) {
    return defaultFallback;
  }
}
