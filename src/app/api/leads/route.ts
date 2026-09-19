import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { cleanBusinessName, cleanCategoryName, cleanLocationName } from '@/lib/aiPitch';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const allParam = searchParams.get('all');
    const userFilterParam = searchParams.get('userId');
    const statusFilterParam = searchParams.get('leadStatus'); // PENDING, CONTACTED, DONE, CLOSED

    const isAll = allParam === 'true';
    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const limit = Math.max(1, parseInt(limitParam || '20', 10));
    const skip = (page - 1) * limit;

    // Isolation: SALES reps can ONLY see their own leads. ADMIN can see all or filter by rep.
    const whereClause: any = {};
    if (session.role === 'SALES') {
      whereClause.userId = session.id;
    } else if (session.role === 'ADMIN' && userFilterParam && userFilterParam !== 'ALL') {
      whereClause.userId = userFilterParam;
    }

    if (statusFilterParam && statusFilterParam !== 'ALL') {
      whereClause.leadStatus = statusFilterParam;
    }

    const [totalCount, leads] = await Promise.all([
      prisma.lead.count({ where: whereClause }),
      prisma.lead.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        ...(isAll ? {} : { skip, take: limit }),
        include: {
          campaign: {
            select: { name: true, targetNiche: true, targetLocation: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
          lastUpdatedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    // Role-isolated stats
    const statsWhere = session.role === 'SALES' ? { userId: session.id } : {};
    const stats = {
      totalLeads: await prisma.lead.count({ where: statsWhere }),
      totalAudited: await prisma.lead.count({ where: { ...statsWhere, status: { not: 'DISCOVERED' } } }),
      totalSent: await prisma.lead.count({ where: { ...statsWhere, isTemplateSent: true } }),
      totalPending: await prisma.lead.count({ where: { ...statsWhere, leadStatus: 'PENDING' } }),
      totalContacted: await prisma.lead.count({ where: { ...statsWhere, leadStatus: 'CONTACTED' } }),
      totalDone: await prisma.lead.count({ where: { ...statsWhere, leadStatus: 'DONE' } }),
      totalClosed: await prisma.lead.count({ where: { ...statsWhere, leadStatus: 'CLOSED' } }),
    };

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        leads,
        stats,
        pagination: {
          page: isAll ? 1 : page,
          limit: isAll ? totalCount : limit,
          totalCount,
          totalPages: isAll ? 1 : totalPages,
          hasMore: isAll ? false : page < totalPages,
        },
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Update lead status (PENDING, CONTACTED, DONE, CLOSED) and remarks
export async function PATCH(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, leadStatus, remarks } = body;

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    // Sales users can only edit their own leads
    if (session.role === 'SALES' && lead.userId && lead.userId !== session.id) {
      return NextResponse.json({ success: false, error: 'Access denied: You do not own this lead.' }, { status: 403 });
    }

    const updateData: any = {
      lastUpdatedById: session.id,
      updatedAt: new Date(),
    };

    if (leadStatus !== undefined) {
      updateData.leadStatus = leadStatus;
      if (leadStatus === 'CONTACTED') {
        updateData.lastContactedAt = new Date();
      }
    }

    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        lastUpdatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      lead: updated,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Single-click send template to individual lead from Lead CRM table modal
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId } = body;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || !lead.formattedPhone) {
      return NextResponse.json({ success: false, error: 'Lead not found or missing valid phone.' }, { status: 400 });
    }

    if (session.role === 'SALES' && lead.userId && lead.userId !== session.id) {
      return NextResponse.json({ success: false, error: 'Access denied: You can only message your own leads.' }, { status: 403 });
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
      templateParameters = [name, cleanCategory, location, ratingStr];
    } else {
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
          leadStatus: lead.leadStatus === 'PENDING' ? 'CONTACTED' : lead.leadStatus,
          lastContactedAt: new Date(),
          lastUpdatedById: session.id,
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
