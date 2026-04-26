import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    const conversationId = (await params).id;

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Map Prisma messages to the frontend Message format
    const formattedMessages = conversation.messages.map((msg) => ({
      id: msg.id,
      user: msg.role === 'user' ? msg.content : '',
      response: msg.role === 'assistant' ? msg.content : '',
      timestamp: msg.createdAt.toISOString(),
      agent_name: (msg.metadata as any)?.agent_name,
      action: (msg.metadata as any)?.action,
      artifact_type: (msg.metadata as any)?.artifact_type,
      path: (msg.metadata as any)?.path,
      title: (msg.metadata as any)?.title,
      icon: (msg.metadata as any)?.icon,
      is_swarm_think: (msg.metadata as any)?.is_swarm_think,
      reasoning_logs: (msg.metadata as any)?.reasoning_logs,
    }));

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      swarmId: conversation.swarmId,
      updatedAt: conversation.updatedAt,
      messages: formattedMessages,
    });
  } catch (error: any) {
    console.error('Conversation fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    const conversationId = (await params).id;

    // Verify ownership
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.conversation.delete({ where: { id: conversationId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Conversation delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
