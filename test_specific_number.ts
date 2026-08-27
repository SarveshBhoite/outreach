import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function testDispatchToSpecificNumber() {
  const targetPhone = '918104053193';
  const crmApiUrl = 'https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template';
  const crmApiKey = 'ak_live_bb3a202dc4c32629a10ebb3a2c3f86a4';

  console.log(`\n========================================================================`);
  console.log(`Testing Direct Dispatch to: ${targetPhone}`);
  console.log(`Endpoint: ${crmApiUrl}`);
  console.log(`========================================================================\n`);

  try {
    const payload = {
      to: targetPhone,
      template_name: 'universal_b2b_crm_intro',
      language: 'en_US',
      variables: ['Studio Lead', '4.8★', 'Mumbai', 'Interior Designers'],
    };

    console.log('Sending Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(crmApiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': crmApiKey,
      },
      timeout: 15000,
    });

    console.log('\n✅ Response Success:', response.status, response.data);
  } catch (error: any) {
    console.error('\n❌ Response Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testDispatchToSpecificNumber();
