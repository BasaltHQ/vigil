import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { thirdwebAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getAuthUserId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("thirdweb_auth_token")?.value;
    if (!token) return 'default_user';

    const authResult = await thirdwebAuth.verifyJWT({ jwt: token });
    if (!authResult.valid || !authResult.parsedJWT.sub) return 'default_user';

    return authResult.parsedJWT.sub;
  } catch {
    return 'default_user';
  }
}

export async function GET() {
  try {
    const userId = await getAuthUserId();

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ status: 'success', conversations });
  } catch (error: any) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    const body = await req.json();
    const id = uuidv4();

    const conversation = await prisma.conversation.create({
      data: {
        id,
        userId,
        swarmId: body.swarm_id || 'corporate',
        title: body.title || `Session ${new Date().toLocaleString()}`,
        metadata: body.metadata || {},
      },
    });

    return NextResponse.json({ status: 'success', data: conversation });
  } catch (error: any) {
    console.error('Conversation create error:', error);
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
