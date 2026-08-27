import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function debugDirectMetaSend() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const targetPhone = '918104053193';

  console.log(`Testing Direct Meta Call to ${targetPhone}...`);
  console.log(`Phone Number ID: ${phoneNumberId}`);

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: targetPhone,
      type: 'template',
      template: {
        name: 'universal_b2b_web_v2',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: 'Pink Octopus' },
              { type: 'text', text: '4.8★' },
              { type: 'text', text: 'Bandra West' },
              { type: 'text', text: 'interior designers' },
            ],
          },
        ],
      },
    };

    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Direct Meta Response:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('❌ Direct Meta Error:');
    if (err.response) {
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

debugDirectMetaSend();
