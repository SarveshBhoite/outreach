import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { searchGooglePlaces } from './src/lib/places';
import { auditDigitalFootprint } from './src/lib/auditor';
import { generatePersonalizedPitch } from './src/lib/aiPitch';
import { sendWhatsAppMessage } from './src/lib/whatsapp';

async function runLiveDiagnostics() {
  console.log('====================================================');
  console.log('🔍 RUNNING LIVE CREDENTIALS & PIPELINE DIAGNOSTICS');
  console.log('====================================================\n');

  // 1. Test Google Places API
  console.log('1️⃣ Testing Google Places API...');
  try {
    const places = await searchGooglePlaces('Dental Clinics in Bandra Mumbai');
    console.log(`✅ Google Places API Success: Retrieved ${places.length} live candidates.`);
    if (places.length > 0) {
      console.log(`   Sample Business: "${places[0].businessName}"`);
      console.log(`   Phone: ${places[0].formattedPhone || 'N/A'}`);
      console.log(`   Website: ${places[0].websiteUrl || 'None'}`);
    }
  } catch (err: any) {
    console.error('❌ Google Places API Error:', err.message);
  }

  console.log('\n----------------------------------------------------\n');

  // 2. Test Gemini AI Engine
  console.log('2️⃣ Testing Gemini AI Pitch Generator...');
  try {
    const auditSample = await auditDigitalFootprint(
      undefined,
      'Elite Dental Care',
      4.8,
      24
    );
    const pitch = await generatePersonalizedPitch(
      'Elite Dental Care',
      'Dental Clinic',
      'Bandra Mumbai',
      4.8,
      24,
      auditSample
    );
    console.log('✅ Gemini AI Engine Success!');
    console.log(`   Generated Pitch Angle: ${pitch.pitchAngle}`);
    console.log(`   Sample Pitch Copy:\n   "${pitch.pitchText.replace(/\n/g, '\n   ')}"`);
  } catch (err: any) {
    console.error('❌ Gemini AI Error:', err.message);
  }

  console.log('\n----------------------------------------------------\n');

  // 3. Test Meta WhatsApp Cloud API to your number
  const testNumber = '+919136870930';
  console.log(`3️⃣ Testing Meta WhatsApp Cloud API to: ${testNumber}...`);
  try {
    const res = await sendWhatsAppMessage({
      recipientPhone: testNumber,
      templateName: 'hello_world', // Standard official Meta test template
      provider: 'META_CLOUD_API',
    });

    if (res.success) {
      console.log('🎉 ✅ Meta WhatsApp Message SENT SUCCESSFULLY!');
      console.log(`   Meta Message ID: ${res.messageId}`);
      console.log(`   Recipient: ${testNumber}`);
    } else {
      console.error('❌ Meta WhatsApp Dispatch Error:', res.error);
    }
  } catch (err: any) {
    console.error('❌ WhatsApp Exception:', err.message);
  }

  console.log('\n====================================================\n');
}

runLiveDiagnostics();
