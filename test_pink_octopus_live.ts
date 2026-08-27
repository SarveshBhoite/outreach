import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { sendWhatsAppMessage } from './src/lib/whatsapp';

async function sendToPinkOctopusLive() {
  const targetPhone = '8104053193';
  const templateName = 'universal_b2b_web_v2';
  const params = ['Pink Octopus by T & J', '4.8★', 'Bandra West', 'interior designers'];

  console.log('================================================================================');
  console.log(`🎯 DISPATCHING TO PINK OCTOPUS: +91${targetPhone}`);
  console.log(`🏷️ Template: "${templateName}"`);
  console.log(`📌 Variables: ${JSON.stringify(params)}`);
  console.log('================================================================================\n');

  try {
    const res = await sendWhatsAppMessage({
      recipientPhone: targetPhone,
      templateName: templateName,
      templateLanguage: 'en_US',
      templateParameters: params,
      crmApiUrl: 'https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template',
      crmApiKey: 'ak_live_bb3a202dc4c32629a10ebb3a2c3f86a4',
    });

    console.log('Result:', res);
    if (res.success) {
      console.log(`\n✅ SUCCESSFULLY DISPATCHED TO +91${targetPhone}! Message ID: ${res.messageId}`);
    } else {
      console.error(`\n❌ DISPATCH FAILED: ${res.error}`);
    }
  } catch (err: any) {
    console.error(`\n❌ ERROR:`, err.message);
  }
}

sendToPinkOctopusLive();
