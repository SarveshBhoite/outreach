import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { searchGooglePlaces } from './src/lib/places';
import { auditDigitalFootprint } from './src/lib/auditor';
import { generatePersonalizedPitch } from './src/lib/aiPitch';

async function fetchMicroLocalLeads() {
  console.log('========================================================================================');
  console.log('🎯 HYPER-LOCAL MICRO-MARKET LEAD EXTRACTION & AUDIT (0 MESSAGES DISPATCHED)');
  console.log('========================================================================================\n');

  // Search tight micro-local areas (e.g. Lokhandwala Andheri West, Kalyani Nagar Pune)
  const microTarget = 'Interior Designers in Lokhandwala Andheri West Mumbai';
  console.log(`🔍 Querying Google Places: "${microTarget}"...\n`);

  const places = await searchGooglePlaces(microTarget);
  console.log(`✅ Extracted ${places.length} businesses in this micro-neighbourhood.\n`);

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
      place.category || 'Interior Designer',
      place.city || 'Lokhandwala, Mumbai',
      place.googleRating || 4.8,
      place.reviewCount || 10,
      audit
    );

    console.log(`----------------------------------------------------------------------------------------`);
    console.log(`🏢 [#${count}] BUSINESS: ${place.businessName}`);
    console.log(`📞 WhatsApp: ${place.formattedPhone} | 📍 Address: ${place.address || 'Lokhandwala, Andheri West'}`);
    console.log(`⭐ Google Rating: ${place.googleRating}★ (${place.reviewCount} reviews)`);
    console.log(`🌐 Website: ${place.websiteUrl ? place.websiteUrl : '❌ NO WEBSITE FOUND'}`);
    console.log(`🔬 Digital Audit: ${audit.auditSummary}`);
    console.log(`🎯 Assigned Pitch: ${pitch.pitchAngle}`);
    console.log(`🏷️ Meta Template: "${pitch.metaTemplateName}"`);
    console.log(`📋 Custom Message To Send:\n`);
    console.log(pitch.pitchText);
    console.log(`----------------------------------------------------------------------------------------\n`);

    if (count >= 5) break;
  }
}

fetchMicroLocalLeads();
