import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function createUtilitySeoTemplate() {
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '919114364548233';
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  console.log('================================================================================');
  console.log('🛠️ CREATING & SUBMITTING HIGH-DELIVERY UTILITY SEO AUDIT TEMPLATE TO META');
  console.log('================================================================================\n');

  const templatePayload = {
    name: 'b2b_seo_audit_alert',
    category: 'UTILITY',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Google Maps & Search Audit for {{1}}',
        example: {
          header_text: ['Pink Octopus Studio'],
        },
      },
      {
        type: 'BODY',
        text: 'Hello Team {{1}},\n\nYour digital audit report for {{2}} in {{3}} is ready. We analyzed your Google 3-Pack visibility (current rating: {{4}}) and identified high-intent local search keywords where your business can capture more weekly client inquiries.\n\nWould you like to review your free 2-minute diagnostic summary?',
        example: {
          body_text: [
            ['Pink Octopus Studio', 'interior designers', 'Bandra West', '4.8★'],
          ],
        },
      },
      {
        type: 'FOOTER',
        text: 'Reply to view your report or ask any questions.',
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'QUICK_REPLY',
            text: 'View Audit Report',
          },
          {
            type: 'QUICK_REPLY',
            text: 'Not interested',
          },
        ],
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/v21.0/${wabaId}/message_templates`;
    const res = await axios.post(url, templatePayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Template Submitted Successfully to Meta!');
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    if (err.response) {
      console.error('❌ Meta Submission Error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

createUtilitySeoTemplate();
