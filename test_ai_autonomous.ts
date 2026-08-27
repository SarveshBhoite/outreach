import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { decideDailyStrategy } from './src/lib/strategy';
import { searchGooglePlaces } from './src/lib/places';
import { auditDigitalFootprint } from './src/lib/auditor';
import { generatePersonalizedPitch } from './src/lib/aiPitch';

async function testAutonomousAIDiscovery() {
  console.log('========================================================================================');
  console.log('🧠 TESTING 100% AUTONOMOUS AI STRATEGY & PAN-INDIA MICRO-MARKET LEAD DISCOVERY');
  console.log('🔒 (0 MESSAGES SENT - READ-ONLY EXTRACTION & AUDIT)');
  console.log('========================================================================================\n');

  console.log('1️⃣ AI Strategy Engine analyzing Pan-India market opportunity...\n');
  const aiDecision = await decideDailyStrategy();

  console.log(`🎯 AI CHOSEN NICHE: "${aiDecision.targetNiche}"`);
  console.log(`📍 AI CHOSEN MICRO-LOCALITY: "${aiDecision.targetLocation}" (${aiDecision.targetCity}, ${aiDecision.targetState})`);
  console.log(`💡 AI RATIONALE: ${aiDecision.rationale}`);
  console.log(`🔍 GENERATED SEARCH QUERY: "${aiDecision.searchQuery}"\n`);

  console.log('----------------------------------------------------------------------------------------');
  console.log(`2️⃣ Scraping Google Places for: "${aiDecision.searchQuery}"...`);
  const places = await searchGooglePlaces(aiDecision.searchQuery);
  console.log(`✅ Extracted ${places.length} businesses from this micro-market.\n`);

  let count = 0;
  for (const place of places) {
    if (!place.formattedPhone) continue;
    count++;

    const audit = await auditDigitalFootprint(
      place.websiteUrl,
      place.businessName,
      place.googleRating,
      place.reviewCount
    );

    const pitch = await generatePersonalizedPitch(
      place.businessName,
      place.category || aiDecision.targetNiche,
      place.city || aiDecision.targetLocation,
      place.googleRating || 4.8,
      place.reviewCount || 10,
      audit
    );

    console.log(`========================================================================================`);
    console.log(`🏢 LEAD #${count}: ${place.businessName}`);
    console.log(`📞 WhatsApp: ${place.formattedPhone} | 📍 Address: ${place.address || aiDecision.targetLocation}`);
    console.log(`⭐ Google Rating: ${place.googleRating}★ (${place.reviewCount} reviews)`);
    console.log(`🌐 Website: ${place.websiteUrl ? place.websiteUrl : '❌ NO WEBSITE FOUND'}`);
    console.log(`🔬 Tech Audit: ${audit.auditSummary}`);
    console.log(`🎯 Assigned Pitch Angle: ${pitch.pitchAngle}`);
    console.log(`🏷️ Meta Template: "${pitch.metaTemplateName}"`);
    console.log(`📋 Custom Message To Send:\n`);
    console.log(pitch.pitchText);
    console.log(`========================================================================================\n`);

    if (count >= 5) break;
  }
}

testAutonomousAIDiscovery();
