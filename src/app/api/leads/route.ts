import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        campaign: {
          select: { name: true, targetNiche: true, targetLocation: true },
        },
      },
    });

    const stats = {
      totalLeads: await prisma.lead.count(),
      totalAudited: await prisma.lead.count({ where: { status: { not: 'DISCOVERED' } } }),
      totalSent: await prisma.lead.count({ where: { status: 'SENT' } }),
      totalDelivered: await prisma.lead.count({ where: { status: 'DELIVERED' } }),
      totalReplied: await prisma.lead.count({ where: { status: 'REPLIED' } }),
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
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
