import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { sendWhatsAppMessage } from './src/lib/whatsapp';

async function sendTemplatesAgain() {
  const targetNumber = '9136870930';

  console.log('================================================================================');
  console.log('🚀 RE-SENDING APPROVED TEMPLATES TO: ' + targetNumber);
  console.log('================================================================================\n');

  // 1. Send universal_b2b_web_v2
  console.log('1️⃣ Sending "universal_b2b_web_v2"...');
  const res1 = await sendWhatsAppMessage({
    recipientPhone: targetNumber,
    templateName: 'universal_b2b_web_v2',
    templateLanguage: 'en_US',
    templateParameters: ['Apex Architecture Studio', '4.9★', 'Bandra Mumbai', 'interior designers'],
  });
  console.log('   Result 1:', res1);

  await new Promise((r) => setTimeout(r, 3000));

  // 2. Send universal_b2b_crm_intro
  console.log('\n2️⃣ Sending "universal_b2b_crm_intro"...');
  const res2 = await sendWhatsAppMessage({
    recipientPhone: targetNumber,
    templateName: 'universal_b2b_crm_intro',
    templateLanguage: 'en_US',
    templateParameters: ['Prime Manufacturing Works', '4.9★', 'Pune', 'manufacturers'],
  });
  console.log('   Result 2:', res2);

  await new Promise((r) => setTimeout(r, 3000));

  // 3. Send universal_b2b_seo_intro
  console.log('\n3️⃣ Sending "universal_b2b_seo_intro"...');
  const res3 = await sendWhatsAppMessage({
    recipientPhone: targetNumber,
    templateName: 'universal_b2b_seo_intro',
    templateLanguage: 'en_US',
    templateParameters: ['Supreme Law Advocates', 'corporate law firms', 'Bangalore', '5.0★'],
  });
  console.log('   Result 3:', res3);

  console.log('\n================================================================================');
  console.log('🎉 Templates dispatched! Please check your WhatsApp.');
  console.log('================================================================================\n');
}

sendTemplatesAgain();
