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
  totalQueued: number;
  leads: unknown[];
  logs: string[];
}

export async function runAutopilotPipeline(
  customNiche?: string,
  customLocation?: string,
  autoDispatch: boolean = false
): Promise<PipelineRunResult> {
  const logs: string[] = [];
  logs.push(`[${new Date().toLocaleTimeString()}] 🚀 Initiating Autonomous Outreach Pipeline...`);

  // 1. Fetch Past Campaigns to prevent duplicate targeting
  const pastCampaigns = await prisma.campaign.findMany({
    take: 15,
    orderBy: { createdAt: 'desc' },
    select: { targetNiche: true, targetLocation: true },
  });
  const pastTargets = pastCampaigns.map((c) => `${c.targetNiche} in ${c.targetLocation}`);

  // 2. Decide Strategy
  let strategy = {
    targetNiche: customNiche || '',
    targetLocation: customLocation || '',
    searchQuery: '',
    rationale: '',
    estimatedLeadVolume: 20,
  };

  if (!customNiche || !customLocation) {
    logs.push(`[${new Date().toLocaleTimeString()}] 🧠 AI Market Strategy Engine analyzing high-ticket niches...`);
    const aiStrategy = await decideDailyStrategy(pastTargets);
    strategy = {
      targetNiche: customNiche || aiStrategy.targetNiche,
      targetLocation: customLocation || aiStrategy.targetLocation,
      searchQuery: aiStrategy.searchQuery,
      rationale: aiStrategy.rationale,
      estimatedLeadVolume: aiStrategy.estimatedLeadVolume,
    };
  } else {
    strategy.searchQuery = `${strategy.targetNiche} in ${strategy.targetLocation}`;
    strategy.rationale = 'Manually specified niche and market location.';
  }

  logs.push(`[${new Date().toLocaleTimeString()}] 🎯 Target: "${strategy.targetNiche}" in "${strategy.targetLocation}"`);

  // 3. Create Campaign Record
  const campaign = await prisma.campaign.create({
    data: {
      name: `${strategy.targetNiche} - ${strategy.targetLocation} (${new Date().toLocaleDateString()})`,
      targetNiche: strategy.targetNiche,
      targetLocation: strategy.targetLocation,
      status: 'ACTIVE',
    },
  });

  // 4. Extract Leads from Google Places
  logs.push(`[${new Date().toLocaleTimeString()}] 🔍 Querying Google Places API: "${strategy.searchQuery}"...`);
  const rawLeads = await searchGooglePlaces(strategy.searchQuery);
  logs.push(`[${new Date().toLocaleTimeString()}] 📍 Found ${rawLeads.length} business candidates.`);

  let totalAudited = 0;
  let totalQueued = 0;
  const processedLeads = [];

  for (const raw of rawLeads) {
    try {
      if (!raw.formattedPhone) {
        // Skip leads with no valid phone
        continue;
      }

      // Check if lead already exists in DB
      let lead = await prisma.lead.findFirst({
        where: {
          OR: [{ placeId: raw.placeId }, { formattedPhone: raw.formattedPhone }],
        },
      });

      if (!lead) {
        // 5. Digital Footprint Audit
        const audit = await auditDigitalFootprint(
          raw.websiteUrl,
          raw.businessName,
          raw.googleRating,
          raw.reviewCount
        );
        totalAudited++;

        // 6. Generate AI Personalized Pitch
        const aiPitch = await generatePersonalizedPitch(
          raw.businessName,
          raw.category || strategy.targetNiche,
          raw.city || strategy.targetLocation,
          raw.googleRating || 4.8,
          raw.reviewCount || 10,
          audit
        );

        // 7. Save to CRM Database
        lead = await prisma.lead.create({
          data: {
            campaignId: campaign.id,
            placeId: raw.placeId,
            businessName: raw.businessName,
            category: raw.category || strategy.targetNiche,
            address: raw.address,
            city: raw.city || strategy.targetLocation,
            phoneNumber: raw.phoneNumber,
            formattedPhone: raw.formattedPhone,
            websiteUrl: raw.websiteUrl,
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
            
            personalizedPitch: aiPitch.pitchText,
            pitchAngle: aiPitch.pitchAngle,
            status: autoDispatch ? 'QUEUED' : 'PITCH_GENERATED',
          },
        });

        // 8. Auto Dispatch if requested
        if (autoDispatch && raw.formattedPhone) {
          logs.push(`[${new Date().toLocaleTimeString()}] 📨 Dispatching pitch to ${lead.businessName} (${lead.formattedPhone})...`);
          
          const sendRes = await sendWhatsAppMessage({
            recipientPhone: raw.formattedPhone,
            templateName: 'hello_world', // Default standard template or custom
            bodyText: lead.personalizedPitch || undefined,
            templateParameters: [lead.businessName],
          });

          await prisma.dispatchLog.create({
            data: {
              leadId: lead.id,
              campaignId: campaign.id,
              provider: sendRes.provider,
              messageType: 'TEMPLATE',
              templateName: 'hello_world',
              messageBody: lead.personalizedPitch || 'Intro template',
              status: sendRes.success ? 'SENT' : 'FAILED',
              whatsappMsgId: sendRes.messageId,
              errorMessage: sendRes.error,
            },
          });

          if (sendRes.success) {
            await prisma.lead.update({
              where: { id: lead.id },
              data: { status: 'SENT', lastMessageSentAt: new Date() },
            });
            totalQueued++;
          }
        }

        processedLeads.push(lead);
      }
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
      totalSent: totalQueued,
    },
  });

  logs.push(`[${new Date().toLocaleTimeString()}] ✅ Pipeline Completed: Processed ${processedLeads.length} qualified leads.`);

  return {
    campaignId: campaign.id,
    targetNiche: strategy.targetNiche,
    targetLocation: strategy.targetLocation,
    totalFound: rawLeads.length,
    totalAudited,
    totalQueued,
    leads: processedLeads,
    logs,
  };
}
