import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { decideDailyStrategy } from './src/lib/strategy';
import { searchGooglePlaces } from './src/lib/places';
import { auditDigitalFootprint } from './src/lib/auditor';
import { generatePersonalizedPitch } from './src/lib/aiPitch';

async function runReadOnlyLeadDiscoveryDemo() {
  console.log('========================================================================================');
  console.log('🇮🇳 100% AUTONOMOUS AI MARKET DISCOVERY & LEAD SCRAPING (PAN-INDIA)');
  console.log('🔒 (100% READ-ONLY MODE — ZERO WHATSAPP MESSAGES WILL EVER BE SENT)');
  console.log('========================================================================================\n');

  // Let Gemini AI autonomously select a fresh niche and hyper-local micro-market anywhere in India
  console.log('🤖 Step 1: AI Strategy Engine analyzing Pan-India opportunity...\n');
  const aiDecision = await decideDailyStrategy();

  console.log(`🎯 AI CHOSEN NICHE: "${aiDecision.targetNiche}"`);
  console.log(`📍 AI CHOSEN MICRO-LOCALITY: "${aiDecision.targetLocation}" (${aiDecision.targetCity}, ${aiDecision.targetState})`);
  console.log(`💡 WHY THIS MARKET: ${aiDecision.rationale}`);
  console.log(`🔍 GENERATED SEARCH QUERY: "${aiDecision.searchQuery}"\n`);

  console.log('----------------------------------------------------------------------------------------');
  console.log(`📡 Step 2: Fetching businesses from Google Places for: "${aiDecision.searchQuery}"...`);
  const places = await searchGooglePlaces(aiDecision.searchQuery);
  console.log(`✅ Extracted ${places.length} business candidates in this local area.\n`);

  let count = 0;
  for (const place of places) {
    if (!place.formattedPhone) continue;
    count++;

    // Step 3: Deep Technical Audit
    const audit = await auditDigitalFootprint(
      place.websiteUrl,
      place.businessName,
      place.googleRating,
      place.reviewCount
    );

    // Step 4: Accurate Pitch Angle Assignment
    const pitch = await generatePersonalizedPitch(
      place.businessName,
      place.category || aiDecision.targetNiche,
      place.city || aiDecision.targetLocation,
      place.googleRating || 4.8,
      place.reviewCount || 10,
      audit
    );

    console.log(`========================================================================================`);
    console.log(`🏢 [#${count}] BUSINESS: ${place.businessName}`);
    console.log(`📞 Phone / WhatsApp: ${place.formattedPhone}`);
    console.log(`📍 Exact Address: ${place.address || aiDecision.targetLocation}`);
    console.log(`⭐ Google Rating: ${place.googleRating}★ (${place.reviewCount} reviews)`);
    console.log(`🌐 Website Status: ${place.websiteUrl ? place.websiteUrl : '❌ NO WEBSITE FOUND'}`);
    console.log(`🔬 Technical Audit: ${audit.auditSummary}`);
    console.log(`🎯 Determined Pitch Angle: ${pitch.pitchAngle} (${pitch.templateCategory})`);
    console.log(`📋 Assigned Meta Template: "${pitch.metaTemplateName}"`);
    console.log(`📝 Tailored Message Preview:\n`);
    console.log(pitch.pitchText);
    console.log(`========================================================================================\n`);

    if (count >= 5) break;
  }

  console.log(`🎉 Successfully audited and generated pitch angles for ${count} hyper-local leads.`);
}

runReadOnlyLeadDiscoveryDemo();
