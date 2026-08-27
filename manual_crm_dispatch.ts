import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { sendWhatsAppMessage } from './src/lib/whatsapp';

// The verified test phone numbers and their assigned flows
const testNumbers = [
  {
    phone: '9136870930',
    template: 'universal_b2b_web_v2',
    name: 'Web & App Development Flow',
    params: ['Pink Octopus Studio', '4.8★', 'Bandra Mumbai', 'interior designers'],
  },
  {
    phone: '9765305817',
    template: 'universal_b2b_crm_intro',
    name: 'CRM & WhatsApp ERP Automation Flow',
    params: ['Apex Luxury Interiors', '4.9★', 'Pune', 'interior designers'],
  },
  {
    phone: '9420467377',
    template: 'universal_b2b_seo_intro',
    name: 'Local SEO & Google 3-Pack Flow',
    params: ['Royal Architects', 'architects', 'South Delhi', '5.0★'],
  },
  {
    phone: '7219088207',
    template: 'universal_b2b_web_v2',
    name: 'Web & App Development Flow',
    params: ['Prime Modular Kitchens', '4.9★', 'Mumbai', 'modular kitchen studios'],
  },
  {
    phone: '8087631421',
    template: 'universal_b2b_crm_intro',
    name: 'CRM & WhatsApp ERP Automation Flow',
    params: ['Supreme Legal Associates', '4.8★', 'Pune', 'corporate law firms'],
  },
  {
    phone: '9325174465',
    template: 'universal_b2b_seo_intro',
    name: 'Local SEO & Google 3-Pack Flow',
    params: ['Elite Dental Care', 'dentists', 'Bandra Mumbai', '4.9★'],
  },
  {
    phone: '8530241573',
    template: 'universal_b2b_web_v2',
    name: 'Web & App Development Flow',
    params: ['Creative Interiors', '4.8★', 'Mumbai', 'contractors'],
  },
  {
    phone: '8104053193',
    template: 'universal_b2b_web_v2',
    name: 'Web & App Development Flow (Pink Octopus)',
    params: ['Pink Octopus by T & J', '4.8★', 'Maharashtra 400050', 'interior designers'],
  },
];

async function runManualCRMDispatch() {
  console.log('================================================================================');
  console.log('🚀 SENDING TEMPLATES VIA CRM API KEY: ak_live_bb3a202dc4c32629a10ebb3a2c3f86a4');
  console.log('📡 TARGET ENDPOINT: https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template');
  console.log('================================================================================\n');

  for (let i = 0; i < testNumbers.length; i++) {
    const item = testNumbers[i];
    console.log(`📱 [${i + 1}/${testNumbers.length}] Dispatching to: +91${item.phone}`);
    console.log(`   🏷️ Template: "${item.template}"`);
    console.log(`   📌 Parameters: ${JSON.stringify(item.params)}`);

    try {
      const res = await sendWhatsAppMessage({
        recipientPhone: item.phone,
        templateName: item.template,
        templateLanguage: 'en_US',
        templateParameters: item.params,
        crmApiUrl: 'https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template',
        crmApiKey: 'ak_live_bb3a202dc4c32629a10ebb3a2c3f86a4',
      });

      if (res.success) {
        console.log(`   ✅ DISPATCHED & LOGGED IN CRM! ID: ${res.messageId}\n`);
      } else {
        console.error(`   ❌ FAILED: ${res.error}\n`);
      }
    } catch (err: any) {
      console.error(`   ❌ ERROR: ${err.message}\n`);
    }

    // Pacing delay between sends
    if (i < testNumbers.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log('🎉 Manual CRM dispatch run finished!');
}

runManualCRMDispatch();
