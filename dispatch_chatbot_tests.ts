import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { sendWhatsAppMessage } from './src/lib/whatsapp';

// Specific distribution: 1 unique template per number to test chatbot flows
const assignments = [
  {
    phone: '9136870930',
    template: 'universal_b2b_web_v2',
    name: 'Web & App Development Flow',
    params: ['Apex Architecture Studio', '4.9★', 'Bandra Mumbai', 'interior designers'],
  },
  {
    phone: '9765305817',
    template: 'universal_b2b_crm_intro',
    name: 'CRM & WhatsApp ERP Automation Flow',
    params: ['Krystal Manufacturing', '4.8★', 'Pune', 'manufacturers'],
  },
  {
    phone: '9420467377',
    template: 'universal_b2b_seo_intro',
    name: 'Local SEO & Google 3-Pack Flow',
    params: ['Royal Interiors', 'interior designers', 'Bangalore', '5.0★'],
  },
  {
    phone: '7219088207',
    template: 'universal_b2b_web_v2',
    name: 'Web & App Development Flow',
    params: ['Prime Modular Systems', '4.9★', 'Mumbai', 'architects'],
  },
  {
    phone: '8087631421',
    template: 'universal_b2b_crm_intro',
    name: 'CRM & WhatsApp ERP Automation Flow',
    params: ['Supreme Law Associates', '4.8★', 'Pune', 'corporate law firms'],
  },
  {
    phone: '9325174465',
    template: 'universal_b2b_seo_intro',
    name: 'Local SEO & Google 3-Pack Flow',
    params: ['Elite Dental Care', 'dentists', 'Bandra Mumbai', '4.9★'],
  },
];

async function dispatchChatbotTests() {
  console.log('================================================================================');
  console.log('🤖 DISPATCHING 1 TEMPLATE PER NUMBER TO TEST YOUR CRM AI CHATBOT FLOWS');
  console.log('================================================================================\n');

  for (let i = 0; i < assignments.length; i++) {
    const item = assignments[i];
    console.log(`📱 [${i + 1}/${assignments.length}] Sending to: +91${item.phone}`);
    console.log(`   🏷️ Flow: "${item.name}"`);
    console.log(`   📋 Template: "${item.template}"`);
    console.log(`   📌 Parameters: [${item.params.join(', ')}]`);

    try {
      const res = await sendWhatsAppMessage({
        recipientPhone: item.phone,
        templateName: item.template,
        templateLanguage: 'en_US',
        templateParameters: item.params,
      });

      if (res.success) {
        console.log(`   ✅ DISPATCHED! Meta Message ID: ${res.messageId}\n`);
      } else {
        console.error(`   ❌ FAILED: ${res.error}\n`);
      }
    } catch (err: any) {
      console.error(`   ❌ EXCEPTION: ${err.message}\n`);
    }

    if (i < assignments.length - 1) {
      await new Promise((r) => setTimeout(r, 2500));
    }
  }

  console.log('================================================================================');
  console.log('🎉 ALL CHATBOT TEST TEMPLATES SENT! Tap "Yes Send" or reply to test your bot.');
  console.log('================================================================================\n');
}

dispatchChatbotTests();
