import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.appSettings.findUnique({
      where: { id: 'global_settings' },
    });

    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          id: 'global_settings',
          autopilotEnabled: false,
          dailyLeadLimit: 25,
          activeWhatsAppProvider: 'META_CLOUD_API',
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const settings = await prisma.appSettings.upsert({
      where: { id: 'global_settings' },
      update: {
        autopilotEnabled: body.autopilotEnabled,
        dailyLeadLimit: body.dailyLeadLimit,
        sendDelaySecondsMin: body.sendDelaySecondsMin,
        sendDelaySecondsMax: body.sendDelaySecondsMax,
        activeWhatsAppProvider: body.activeWhatsAppProvider,
        customCrmUrl: body.customCrmUrl,
        customCrmKey: body.customCrmKey,
      },
      create: {
        id: 'global_settings',
        autopilotEnabled: body.autopilotEnabled ?? false,
        dailyLeadLimit: body.dailyLeadLimit ?? 25,
        sendDelaySecondsMin: body.sendDelaySecondsMin ?? 30,
        sendDelaySecondsMax: body.sendDelaySecondsMax ?? 90,
        activeWhatsAppProvider: body.activeWhatsAppProvider ?? 'META_CLOUD_API',
        customCrmUrl: body.customCrmUrl,
        customCrmKey: body.customCrmKey,
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
