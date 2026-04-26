import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const swarms = await prisma.swarm.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      swarms,
      default_swarm: 'corporate'
    });
  } catch (error: any) {
    console.error('Swarms fetch error:', error);
    return NextResponse.json({ swarms: [], default_swarm: 'corporate', error: error.message }, { status: 500 });
  }
}
