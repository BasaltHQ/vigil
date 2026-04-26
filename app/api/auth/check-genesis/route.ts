import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const userCount = await prisma.profile.count();
    return NextResponse.json({ isGenesis: userCount === 0 });
  } catch (error: any) {
    console.error('[Check Genesis Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
