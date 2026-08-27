import { NextResponse } from 'next/server';
import { runAutopilotPipeline } from '@/lib/orchestrator';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customNiche, customLocation, overrideAutoDispatch, overrideScrapeLimit } = body;

    const result = await runAutopilotPipeline(
      customNiche,
      customLocation,
      overrideAutoDispatch,
      overrideScrapeLimit ? parseInt(overrideScrapeLimit, 10) : undefined
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Autopilot run error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Pipeline run failed.',
      },
      { status: 500 }
    );
  }
}
