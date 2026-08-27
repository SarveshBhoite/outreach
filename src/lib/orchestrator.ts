import { prisma } from './prisma';
import { decideDailyStrategy } from './strategy';
import { searchGooglePlaces } from './places';
import { auditDigitalFootprint } from './auditor';
import { generatePersonalizedPitch } from './aiPitch';
import { sendWhatsAppMessage } from './whatsapp';

export interface PipelineRunResult {
  campaignId: string;
  targetNiche: string;
  targetLocation: string;
  totalFound: number;
  totalAudited: number;
  totalSent: number;
  leads: any[];
  logs: string[];
}

export async function runAutopilotPipeline(
  customNiche?: string,
  customLocation?: string,
  overrideAutoDispatch?: boolean,
  overrideScrapeLimit?: number
): Promise<PipelineRunResult> {
  const logs: string[] = [];
  logs.push(`[${new Date().toLocaleTimeString()}] 🚀 Initiating Outreach Pipeline...`);

  // 1. Fetch Global App Settings
  let settings = await prisma.appSettings.findUnique({
    where: { id: 'global_settings' },
  });

  if (!settings) {
    settings = await prisma.appSettings.create({
      data: {
        id: 'global_settings',
        globalAutoDispatch: false,
        globalScrapeLimit: 20,
        crmApiUrl: process.env.CRM_API_URL || 'https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template',
        crmApiKey: process.env.CRM_API_KEY || null,
      },
    });
  }

  // Determine whether to auto-dispatch templates
  const shouldAutoDispatch =
    overrideAutoDispatch !== undefined ? overrideAutoDispatch : settings.globalAutoDispatch;
  const scrapeLimit = overrideScrapeLimit || settings.globalScrapeLimit || 20;

  logs.push(
    `[${new Date().toLocaleTimeString()}] ⚙️ Mode: ${
      shouldAutoDispatch ? '⚡ AUTO-DISPATCH ENABLED (Templates will be sent via CRM)' : '📋 GATHER DATA ONLY (Zero messages sent)'
    } | Scrape Limit: ${scrapeLimit} leads`
  );

  // 2. Fetch Past Campaigns to prevent duplicate targeting
  const pastCampaigns = await prisma.campaign.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: { targetNiche: true, targetLocation: true },
  });
  const pastTargets = pastCampaigns.map((c) => `${c.targetNiche} in ${c.targetLocation}`);

  // 3. Decide Strategy
  let strategy = {
    targetNiche: customNiche || '',
    targetLocation: customLocation || '',
    searchQuery: '',
    rationale: '',
    estimatedLeadVolume: scrapeLimit,
  };

  if (!customNiche || !customLocation) {
    logs.push(`[${new Date().toLocaleTimeString()}] 🧠 AI Market Strategy Engine analyzing Pan-India opportunity...`);
    const aiStrategy = await decideDailyStrategy(pastTargets);
    strategy = {
      targetNiche: customNiche || aiStrategy.targetNiche,
      targetLocation: customLocation || aiStrategy.targetLocation,
      searchQuery: aiStrategy.searchQuery,
      rationale: aiStrategy.rationale,
      estimatedLeadVolume: scrapeLimit,
    };
  } else {
    strategy.searchQuery = `${strategy.targetNiche} in ${strategy.targetLocation}`;
    strategy.rationale = 'Manually specified niche and hyper-local location.';
  }

  logs.push(`[${new Date().toLocaleTimeString()}] 🎯 Target: "${strategy.targetNiche}" in "${strategy.targetLocation}"`);

  // 4. Create Campaign Record
  const campaign = await prisma.campaign.create({
    data: {
      name: `${strategy.targetNiche} - ${strategy.targetLocation} (${new Date().toLocaleDateString()})`,
      targetNiche: strategy.targetNiche,
      targetLocation: strategy.targetLocation,
      status: 'ACTIVE',
    },
  });

  // 5. Extract Leads from Google Places with dynamic limit
  logs.push(`[${new Date().toLocaleTimeString()}] 🔍 Scraping Google Places: "${strategy.searchQuery}" (Target: ${scrapeLimit} leads)...`);
  const rawLeads = await searchGooglePlaces(strategy.searchQuery, scrapeLimit);
  logs.push(`[${new Date().toLocaleTimeString()}] 📍 Found ${rawLeads.length} business candidates.`);

  let totalAudited = 0;
  let totalSent = 0;
  const processedLeads = [];

  for (const raw of rawLeads) {
    try {
      if (!raw.formattedPhone) {
        continue;
      }

      // Check if lead exists
      let lead = await prisma.lead.findFirst({
        where: {
          OR: [{ placeId: raw.placeId }, { formattedPhone: raw.formattedPhone }],
        },
      });

      // 6. Digital Footprint Audit
      const audit = await auditDigitalFootprint(
        raw.websiteUrl,
        raw.businessName,
        raw.googleRating,
        raw.reviewCount
      );
      totalAudited++;

      // 7. Generate Personalized Pitch & Meta Template Assignment
      const aiPitch = await generatePersonalizedPitch(
        raw.businessName,
        raw.category || strategy.targetNiche,
        raw.city || strategy.targetLocation,
        raw.googleRating || 4.8,
        raw.reviewCount || 10,
        audit
      );

      if (!lead) {
        // Save to Database
        lead = await prisma.lead.create({
          data: {
            campaign: {
              connect: { id: campaign.id },
            },
            placeId: raw.placeId,
            businessName: raw.businessName,
            category: raw.category || strategy.targetNiche,
            address: raw.address,
            city: raw.city || strategy.targetLocation,
            phoneNumber: raw.phoneNumber,
            formattedPhone: raw.formattedPhone,
            websiteUrl: raw.websiteUrl,
            email: audit.extractedEmail,
            googleRating: raw.googleRating,
            reviewCount: raw.reviewCount,
            googleMapsUrl: raw.googleMapsUrl,

            hasWebsite: audit.hasWebsite,
            websiteWorking: audit.websiteWorking,
            isMobileFriendly: audit.isMobileFriendly,
            pageSpeedScore: audit.pageSpeedScore,
            sslValid: audit.sslValid,
            pitchCategory: audit.pitchCategory,
            auditSummary: audit.auditSummary,

            assignedTemplate: aiPitch.metaTemplateName,
            templateParameters: JSON.stringify(aiPitch.metaTemplateParameters),
            personalizedPitch: aiPitch.pitchText,
            pitchAngle: aiPitch.pitchAngle,
            isTemplateSent: false,
            status: 'AUDITED',
          },
        });
      } else {
        // Update existing lead with latest audit, email & template
        lead = await prisma.lead.update({
          where: { id: lead.id },
          data: {
            email: audit.extractedEmail || lead.email,
            assignedTemplate: aiPitch.metaTemplateName,
            templateParameters: JSON.stringify(aiPitch.metaTemplateParameters),
            personalizedPitch: aiPitch.pitchText,
            pitchAngle: aiPitch.pitchAngle,
            pitchCategory: audit.pitchCategory,
            auditSummary: audit.auditSummary,
          },
        });
      }

      // 8. Auto Dispatch via CRM API Gateway (if enabled)
      if (shouldAutoDispatch && !lead.isTemplateSent && raw.formattedPhone) {
        logs.push(`[${new Date().toLocaleTimeString()}] 📨 Sending template "${aiPitch.metaTemplateName}" to ${lead.businessName} (${lead.formattedPhone}) via CRM...`);

        const sendRes = await sendWhatsAppMessage({
          recipientPhone: raw.formattedPhone,
          recipientName: lead.businessName,
          templateName: aiPitch.metaTemplateName,
          templateParameters: aiPitch.metaTemplateParameters,
          bodyText: lead.personalizedPitch || undefined,
        });

        await prisma.dispatchLog.create({
          data: {
            leadId: lead.id,
            campaignId: campaign.id,
            provider: sendRes.provider,
            messageType: 'TEMPLATE',
            templateName: aiPitch.metaTemplateName,
            messageBody: `Template: ${aiPitch.metaTemplateName} | Params: ${JSON.stringify(aiPitch.metaTemplateParameters)}`,
            status: sendRes.success ? 'SENT' : 'FAILED',
            whatsappMsgId: sendRes.messageId,
            errorMessage: sendRes.error,
          },
        });

        if (sendRes.success) {
          lead = await prisma.lead.update({
            where: { id: lead.id },
            data: {
              isTemplateSent: true,
              status: 'SENT',
              lastMessageSentAt: new Date(),
            },
          });
          totalSent++;
        }
      }

      processedLeads.push(lead);
    } catch (err: unknown) {
      const e = err as Error;
      logs.push(`⚠️ Error processing lead ${raw.businessName}: ${e.message}`);
    }
  }

  // Update Campaign totals
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      totalLeadsFound: rawLeads.length,
      totalAudited: totalAudited,
      totalSent: totalSent,
    },
  });

  logs.push(
    `[${new Date().toLocaleTimeString()}] ✅ Pipeline Completed: Processed ${processedLeads.length} leads in database (${totalSent} templates sent).`
  );

  return {
    campaignId: campaign.id,
    targetNiche: strategy.targetNiche,
    targetLocation: strategy.targetLocation,
    totalFound: rawLeads.length,
    totalAudited,
    totalSent,
    leads: processedLeads,
    logs,
  };
}
