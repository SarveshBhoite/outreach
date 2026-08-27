import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

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

    const templateName = lead.assignedTemplate || 'universal_b2b_web_v2';
    const params = lead.templateParameters ? JSON.parse(lead.templateParameters) : [lead.businessName];

    const sendRes = await sendWhatsAppMessage({
      recipientPhone: lead.formattedPhone,
      recipientName: lead.businessName,
      templateName: templateName,
      templateParameters: params,
      bodyText: lead.personalizedPitch || undefined,
    });

    if (sendRes.success) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
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
          messageBody: `Template: ${templateName} | Params: ${JSON.stringify(params)}`,
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
