import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

/**
 * Extracts public business emails from websites, contact pages, and mailto: links
 */
export async function scrapeBusinessEmail(websiteUrl?: string): Promise<string | null> {
  if (!websiteUrl || !websiteUrl.trim()) return null;

  let targetUrl = websiteUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const junkExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.js', '.css'];

  try {
    const res = await axios.get(targetUrl, {
      timeout: 7000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      maxRedirects: 3,
      validateStatus: (s) => s < 500,
    });

    const html = typeof res.data === 'string' ? res.data : '';
    const $ = cheerio.load(html);

    const foundEmails = new Set<string>();

    // 1. Check direct mailto links
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const email = href.replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase();
      if (email && email.includes('@') && !junkExtensions.some((ext) => email.endsWith(ext))) {
        foundEmails.add(email);
      }
    });

    // 2. Scan entire HTML text for emails
    const matches = html.match(emailRegex);
    if (matches) {
      for (const m of matches) {
        const cleanEmail = m.trim().toLowerCase();
        if (
          !junkExtensions.some((ext) => cleanEmail.endsWith(ext)) &&
          !cleanEmail.includes('example.com') &&
          !cleanEmail.includes('domain.com') &&
          !cleanEmail.includes('sentry') &&
          !cleanEmail.includes('wixpress')
        ) {
          foundEmails.add(cleanEmail);
        }
      }
    }

    if (foundEmails.size > 0) {
      // Prioritize direct business emails / gmail / contact
      const emailList = Array.from(foundEmails);
      const prioritized =
        emailList.find((e) => e.includes('info@') || e.includes('contact@') || e.includes('hello@') || e.includes('gmail.com')) ||
        emailList[0];
      return prioritized;
    }
  } catch (err: any) {
    // Ignore website connection timeouts
  }

  return null;
}

// Test with real scraped lead websites
async function testEmailScraper() {
  console.log('================================================================================');
  console.log('📧 TESTING DYNAMIC BUSINESS EMAIL SCRAPER FOR LEADS');
  console.log('================================================================================\n');

  const testSites = [
    { name: 'Purple Studio', site: 'http://www.purplestudio.in/' },
    { name: 'Shruti Sodhi Designs', site: 'https://shrutisodhi.com/' },
    { name: 'UDC Interiors', site: 'http://www.udcinteriors.com/' },
  ];

  for (const item of testSites) {
    console.log(`🔍 Scanning website for ${item.name} (${item.site})...`);
    const email = await scrapeBusinessEmail(item.site);
    console.log(`   ✉️ Found Business Email: ${email ? email : '❌ No public email on homepage'}\n`);
  }
}

testEmailScraper();
