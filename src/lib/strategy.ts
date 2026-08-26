import { GoogleGenAI } from '@google/genai';

export interface StrategyDecision {
  targetNiche: string;
  targetLocation: string;
  searchQuery: string;
  rationale: string;
  estimatedLeadVolume: number;
}

const DEFAULT_NICHES = [
  'Dental Clinics & Orthodontists',
  'Luxury Interior Designers & Architects',
  'Real Estate Consultants & Builders',
  'Physiotherapy & Sports Rehab Centers',
  'Cosmetic & Dermatology Clinics',
  'Boutique Hotels & Resorts',
  'Car Detailing & Ceramic Coating Studios',
  'Solar Energy & Rooftop Installers',
  'Law Firms & Corporate Advocates',
  'Modular Kitchen Manufacturers',
];

const DEFAULT_LOCATIONS = [
  'Bandra West, Mumbai',
  'Andheri West, Mumbai',
  'South Mumbai',
  'Koregaon Park, Pune',
  'Baner & Balewadi, Pune',
  'Indiranagar, Bangalore',
  'Koramangala, Bangalore',
  'HSR Layout, Bangalore',
  'Golf Course Road, Gurgaon',
  'Jubilee Hills, Hyderabad',
];

export async function decideDailyStrategy(
  pastTargetHistories: string[] = [],
  apiKey: string = process.env.GEMINI_API_KEY || ''
): Promise<StrategyDecision> {
  // Random selection fallback
  const randomNiche = DEFAULT_NICHES[Math.floor(Math.random() * DEFAULT_NICHES.length)];
  const randomLocation = DEFAULT_LOCATIONS[Math.floor(Math.random() * DEFAULT_LOCATIONS.length)];
  const fallbackQuery = `${randomNiche} in ${randomLocation}`;

  if (!apiKey) {
    return {
      targetNiche: randomNiche,
      targetLocation: randomLocation,
      searchQuery: fallbackQuery,
      rationale: `Selected high-ticket B2B category (${randomNiche}) in an affluent commercial zone (${randomLocation}).`,
      estimatedLeadVolume: 20,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are an autonomous AI Growth Strategist. Your job is to select the single best B2B niche and high-income geographic target location for today's outreach campaign in India (e.g. Mumbai, Pune, Bangalore, Delhi NCR, Hyderabad, etc.).

Goals:
1. Target businesses with high average order value (Dental, Aesthetic Clinics, Interior Designers, Real Estate, Solar, Car Detailing, Premium Salons/Spas, etc.) that benefit massively from custom websites, mobile apps, ERP/CRM, and Local SEO rankings.
2. Target affluent commercial/residential micro-markets where business owners actively invest in marketing.
3. Avoid repetitive targeting from this past list: [${pastTargetHistories.slice(-10).join(', ')}].

Output strictly in JSON with this structure:
{
  "targetNiche": "e.g. Aesthetic & Skin Clinics",
  "targetLocation": "e.g. Indiranagar, Bangalore",
  "searchQuery": "e.g. Skin and cosmetic clinics in Indiranagar Bangalore",
  "rationale": "e.g. High customer lifetime value and heavy reliance on local Google search and WhatsApp appointment booking.",
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
      targetNiche: parsed.targetNiche || randomNiche,
      targetLocation: parsed.targetLocation || randomLocation,
      searchQuery: parsed.searchQuery || `${parsed.targetNiche} in ${parsed.targetLocation}`,
      rationale: parsed.rationale || 'High-ticket conversion opportunity.',
      estimatedLeadVolume: parsed.estimatedLeadVolume || 20,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.warn('AI strategy selection failed, using rule-based strategy:', err.message);
    return {
      targetNiche: randomNiche,
      targetLocation: randomLocation,
      searchQuery: fallbackQuery,
      rationale: 'Rule-based strategy selection for affluent business hub.',
      estimatedLeadVolume: 20,
    };
  }
}
