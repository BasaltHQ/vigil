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

async function getAdminUser() {
  const userId = await getAuthUserId();
  if (userId === 'default_user') return null;

  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile || profile.role !== 'admin') return null;

  return profile;
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      totalConversations,
      totalMessages,
      tokenAggregation,
      recentUsage,
    ] = await Promise.all([
      (prisma as any).profile.count(),
      (prisma as any).profile.count({ where: { status: 'active' } }),
      (prisma as any).profile.count({ where: { status: 'pending' } }),
      prisma.conversation.count(),
      prisma.message.count(),
      (prisma as any).tokenUsage.aggregate({
        _sum: {
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
        },
        _count: true,
      }),
      // Last 24 hours of token usage
      (prisma as any).tokenUsage.aggregate({
        _sum: {
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
        },
        _count: true,
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
      },
      conversations: totalConversations,
      messages: totalMessages,
      tokens: {
        allTime: {
          prompt: tokenAggregation._sum.promptTokens || 0,
          completion: tokenAggregation._sum.completionTokens || 0,
          total: tokenAggregation._sum.totalTokens || 0,
          requests: tokenAggregation._count,
        },
        last24h: {
          prompt: recentUsage._sum.promptTokens || 0,
          completion: recentUsage._sum.completionTokens || 0,
          total: recentUsage._sum.totalTokens || 0,
          requests: recentUsage._count,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
