import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionFromCookies();
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
