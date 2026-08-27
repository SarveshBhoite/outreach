import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { sendWhatsAppMessage } from './src/lib/whatsapp';

async function sendOnlyToPinkOctopus() {
  console.log('================================================================================');
  console.log('🎯 DISPATCHING EXCLUSIVELY TO: Pink Octopus by T & J (+918104053193)');
  console.log('📡 VIA JISNU CRM API: https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template');
  console.log('================================================================================\n');

  const lead = {
    phone: '8104053193',
    template: 'universal_b2b_web_v2',
    name: 'Pink Octopus by T & J',
    params: ['Pink Octopus', '4.8★', 'Bandra West', 'interior designers'],
  };

  console.log(`📱 Target: +91${lead.phone}`);
  console.log(`🏷️ Template: "${lead.template}"`);
  console.log(`📌 Variables: ${JSON.stringify(lead.params)}\n`);

  const res = await sendWhatsAppMessage({
    recipientPhone: lead.phone,
    templateName: lead.template,
    templateLanguage: 'en_US',
    templateParameters: lead.params,
    crmApiUrl: 'https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template',
    crmApiKey: 'ak_live_bb3a202dc4c32629a10ebb3a2c3f86a4',
  });

  if (res.success) {
    console.log(`✅ SUCCESS: Dispatched & Logged in CRM Chat History! ID: ${res.messageId}`);
  } else {
    console.error(`❌ DISPATCH RESULT:`, res.error);
  }
}

sendOnlyToPinkOctopus();
