import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function testPlacesQuery() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const queries = [
    'IVF and Fertility Centers in Park Street Kolkata',
    'IVF Center in Park Street Kolkata',
    'Fertility Clinic in Kolkata',
    'Interior Designers in Bandra Mumbai',
  ];

  console.log('API Key configured:', !!apiKey, apiKey?.substring(0, 10) + '...');

  for (const q of queries) {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${apiKey}`;
    try {
      const res = await axios.get(url);
      console.log(`\nQuery: "${q}"`);
      console.log('Status:', res.data.status);
      console.log('Error Message (if any):', res.data.error_message);
      console.log('Results Count:', res.data.results?.length || 0);
      if (res.data.results?.length > 0) {
        console.log('First result:', res.data.results[0].name, '|', res.data.results[0].formatted_address);
      }
    } catch (err: any) {
      console.error(`Error for "${q}":`, err.message);
    }
  }
}

testPlacesQuery();
