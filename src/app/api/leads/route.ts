import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { cleanBusinessName, cleanCategoryName, cleanLocationName } from '@/lib/aiPitch';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        campaign: {
          select: { name: true, targetNiche: true, targetLocation: true },
        },
      },
    });

    const stats = {
      totalLeads: await prisma.lead.count(),
      totalAudited: await prisma.lead.count({ where: { status: { not: 'DISCOVERED' } } }),
      totalSent: await prisma.lead.count({ where: { isTemplateSent: true } }),
      totalPending: await prisma.lead.count({ where: { isTemplateSent: false } }),
    };

    return NextResponse.json({
      success: true,
      data: {
        leads,
        stats,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Single-click send template to individual lead from Lead CRM table modal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId } = body;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || !lead.formattedPhone) {
      return NextResponse.json({ success: false, error: 'Lead not found or missing valid phone.' }, { status: 400 });
    }

    // Determine correct Meta template
    let templateName = lead.assignedTemplate;
    if (!templateName) {
      if (!lead.hasWebsite) {
        templateName = 'universal_b2b_web_v2';
      } else if (lead.pitchAngle?.includes('SEO') || lead.pitchAngle?.includes('3-Pack') || lead.pitchCategory === 'LOCAL_SEO_MARKETING') {
        templateName = 'universal_b2b_seo_intro';
      } else {
        templateName = 'universal_b2b_crm_intro';
      }
    }

    // Build the exact 4 parameters required by all 3 Meta templates
    const name = cleanBusinessName(lead.businessName);
    const location = cleanLocationName(lead.city, lead.address);
    const cleanCategory = cleanCategoryName(lead.category);
    const ratingStr = `${lead.googleRating || 4.8}★`;

    let templateParameters: string[] = [];
    if (templateName === 'universal_b2b_seo_intro') {
      // universal_b2b_seo_intro: {{1}} Business Name, {{2}} Category, {{3}} Location, {{4}} Rating
      templateParameters = [name, cleanCategory, location, ratingStr];
    } else {
      // universal_b2b_web_v2 and universal_b2b_crm_intro: {{1}} Business Name, {{2}} Rating, {{3}} Location, {{4}} Category
      templateParameters = [name, ratingStr, location, cleanCategory];
    }

    const sendRes = await sendWhatsAppMessage({
      recipientPhone: lead.formattedPhone,
      recipientName: lead.businessName,
      templateName: templateName,
      templateParameters: templateParameters,
      bodyText: lead.personalizedPitch || undefined,
    });

    if (sendRes.success) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          assignedTemplate: templateName,
          templateParameters: JSON.stringify(templateParameters),
          isTemplateSent: true,
          status: 'SENT',
          lastMessageSentAt: new Date(),
        },
      });

      await prisma.dispatchLog.create({
        data: {
          leadId: lead.id,
          campaignId: lead.campaignId,
          provider: sendRes.provider,
          messageType: 'TEMPLATE',
          templateName: templateName,
          messageBody: `Template: ${templateName} | Params: ${JSON.stringify(templateParameters)}`,
          status: 'SENT',
          whatsappMsgId: sendRes.messageId,
        },
      });

      return NextResponse.json({ success: true, message: `Template "${templateName}" sent to ${lead.businessName} via CRM!` });
    } else {
      return NextResponse.json({ success: false, error: sendRes.error }, { status: 500 });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
