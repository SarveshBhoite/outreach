import { cookies } from 'next/headers';
import { prisma } from './prisma';

export const AUTH_COOKIE_NAME = 'outreach_auth_session';

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SALES';
}

// Seed initial users if table is empty or missing them
export async function ensureDefaultUsers() {
  try {
    // 1. Admin user: info.jdsolutions2018@gmail.com
    const adminUser = await prisma.user.upsert({
      where: { email: 'info.jdsolutions2018@gmail.com' },
      update: { role: 'ADMIN' },
      create: {
        email: 'info.jdsolutions2018@gmail.com',
        password: 'Jisnu123',
        name: 'JD Solutions Admin',
        role: 'ADMIN',
      },
    });

    // 2. Sales user: sales@jisnudigital.com
    const salesUser = await prisma.user.upsert({
      where: { email: 'sales@jisnudigital.com' },
      update: { role: 'SALES' },
      create: {
        email: 'sales@jisnudigital.com',
        password: 'Jisnu123',
        name: 'Jisnu Digital Sales',
        role: 'SALES',
      },
    });

    // 3. Assign existing leads with no userId to the sales user
    await prisma.lead.updateMany({
      where: { userId: null },
      data: { userId: salesUser.id },
    });

    // Assign existing campaigns with no userId to salesUser as well
    await prisma.campaign.updateMany({
      where: { userId: null },
      data: { userId: salesUser.id },
    });

    return { adminUser, salesUser };
  } catch (error) {
    console.error('Error ensuring default users & backfilling leads:', error);
  }
}

export function decodeSessionCookie(cookieValue: string): AuthSessionUser | null {
  try {
    const jsonStr = Buffer.from(cookieValue, 'base64').toString('utf-8');
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.id && parsed.email && parsed.role) {
      return {
        id: parsed.id,
        email: parsed.email,
        name: parsed.name || parsed.email,
        role: parsed.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function encodeSessionCookie(user: AuthSessionUser): string {
  const sessionData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    authenticatedAt: Date.now(),
  };
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}

export async function getSessionFromCookies(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return null;
  return decodeSessionCookie(sessionCookie.value);
}
