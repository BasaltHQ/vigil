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

const TIER_MONTHLY_PRICING: Record<string, number> = {
  starter: 0,
  pro: 29.99,
  firm: 149.0,
  enterprise: 299.0,
};

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const [
      profiles,
      totalConversations,
      totalMessages,
      totalDocuments,
      pdfDocuments,
      docxDocuments,
      tokenAggregation,
      recentUsage,
    ] = await Promise.all([
      (prisma as any).profile.findMany({
        select: { status: true, role: true, tier: true },
      }),
      prisma.conversation.count(),
      prisma.message.count(),
      (prisma as any).document.count(),
      (prisma as any).document.count({ where: { format: 'pdf' } }),
      (prisma as any).document.count({ where: { format: 'docx' } }),
      (prisma as any).tokenUsage.aggregate({
        _sum: {
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
        },
        _count: true,
      }),
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

    let activeUsers = 0;
    let pendingUsers = 0;
    let suspendedUsers = 0;
    let adminUsers = 0;
    const tiers: Record<string, number> = {
      starter: 0,
      pro: 0,
      firm: 0,
      enterprise: 0,
    };
    let estimatedMrr = 0;
    let activePaidSubscribers = 0;

    for (const p of profiles) {
      if (p.status === 'active') activeUsers++;
      else if (p.status === 'pending') pendingUsers++;
      else if (p.status === 'suspended') suspendedUsers++;

      if (p.role === 'admin') adminUsers++;

      const t = (p.tier || 'starter').toLowerCase();
      tiers[t] = (tiers[t] || 0) + 1;

      if (p.status === 'active' && TIER_MONTHLY_PRICING[t] > 0) {
        estimatedMrr += TIER_MONTHLY_PRICING[t];
        activePaidSubscribers++;
      }
    }

    const allTimePrompt = tokenAggregation._sum.promptTokens || 0;
    const allTimeCompletion = tokenAggregation._sum.completionTokens || 0;
    const estimatedAiComputeCost =
      (allTimePrompt / 1_000_000) * 0.15 +
      (allTimeCompletion / 1_000_000) * 0.6;

    return NextResponse.json({
      users: {
        total: profiles.length,
        active: activeUsers,
        pending: pendingUsers,
        suspended: suspendedUsers,
        admins: adminUsers,
      },
      tiers,
      revenue: {
        estimatedMrr: Number(estimatedMrr.toFixed(2)),
        estimatedArr: Number((estimatedMrr * 12).toFixed(2)),
        activePaidSubscribers,
        estimatedAiComputeCost: Number(estimatedAiComputeCost.toFixed(4)),
      },
      conversations: totalConversations,
      messages: totalMessages,
      documents: {
        total: totalDocuments,
        pdfCount: pdfDocuments,
        docxCount: docxDocuments,
      },
      tokens: {
        allTime: {
          prompt: allTimePrompt,
          completion: allTimeCompletion,
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
