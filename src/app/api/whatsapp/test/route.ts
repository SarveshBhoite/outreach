import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { normalizePhoneNumber } from '@/lib/places';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, message, templateName, provider } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number is required.' },
        { status: 400 }
      );
    }

    const formatted = normalizePhoneNumber(phoneNumber);
    if (!formatted) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Provide a valid 10-12 digit number.' },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage({
      recipientPhone: formatted,
      templateName: templateName || 'hello_world',
      bodyText: message,
      provider: provider || 'META_CLOUD_API',
    });

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
