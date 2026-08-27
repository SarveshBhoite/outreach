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
          globalAutoDispatch: false,
          globalScrapeLimit: 20,
          crmApiUrl: 'https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template',
          crmApiKey: 'ak_live_bb3a202dc4c32629a10ebb3a2c3f86a4',
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
        globalAutoDispatch: body.globalAutoDispatch,
        globalScrapeLimit: body.globalScrapeLimit ? parseInt(body.globalScrapeLimit, 10) : 20,
        crmApiUrl: body.crmApiUrl,
        crmApiKey: body.crmApiKey,
      },
      create: {
        id: 'global_settings',
        globalAutoDispatch: body.globalAutoDispatch ?? false,
        globalScrapeLimit: body.globalScrapeLimit ? parseInt(body.globalScrapeLimit, 10) : 20,
        crmApiUrl: body.crmApiUrl || 'https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template',
        crmApiKey: body.crmApiKey || 'ak_live_bb3a202dc4c32629a10ebb3a2c3f86a4',
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
