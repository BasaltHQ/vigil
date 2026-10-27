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
    const [profiles, conversationsByUser, documentsByUser] = await Promise.all([
      prisma.profile.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          tokenUsage: {
            select: {
              promptTokens: true,
              completionTokens: true,
              totalTokens: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.conversation.groupBy({
        by: ['userId'],
        _count: { id: true },
      }),
      (prisma as any).document.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          displayId: true,
          userId: true,
          title: true,
          documentType: true,
          format: true,
          createdAt: true,
          filePath: true,
        },
      }),
    ]);

    const convCountMap: Record<string, number> = {};
    for (const c of conversationsByUser) {
      convCountMap[c.userId] = c._count.id;
    }

    const docsByUserMap: Record<string, any[]> = {};
    for (const d of documentsByUser) {
      if (!docsByUserMap[d.userId]) docsByUserMap[d.userId] = [];
      docsByUserMap[d.userId].push(d);
    }

    const now24hAgo = Date.now() - 24 * 60 * 60 * 1000;

    const users = profiles.map((p: any) => {
      let lastActiveAt: string | null = null;
      let last24hTokens = 0;

      const totals = p.tokenUsage.reduce(
        (acc: any, t: any) => {
          const ts = new Date(t.createdAt).getTime();
          if (ts >= now24hAgo) {
            last24hTokens += t.totalTokens;
          }
          if (!lastActiveAt || ts > new Date(lastActiveAt).getTime()) {
            lastActiveAt = t.createdAt;
          }
          return {
            promptTokens: acc.promptTokens + t.promptTokens,
            completionTokens: acc.completionTokens + t.completionTokens,
            totalTokens: acc.totalTokens + t.totalTokens,
          };
        },
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      );

      const userDocs = docsByUserMap[p.id] || [];

      return {
        id: p.id,
        email: p.email,
        displayName: p.displayName,
        companyName: p.companyName,
        companyUrl: p.companyUrl,
        role: p.role,
        status: p.status,
        tier: p.tier || 'starter',
        stripeCustomerId: p.stripeCustomerId,
        stripeSubscriptionId: p.stripeSubscriptionId,
        stripePriceId: p.stripePriceId,
        baseTemplate: p.baseTemplate,
        docIdTemplate: p.docIdTemplate,
        docIdCounter: p.docIdCounter,
        onboardingComplete: p.onboardingComplete,
        brandParameters: p.brandParameters || {},
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        lastActiveAt: lastActiveAt || p.updatedAt,
        tokenUsage: {
          ...totals,
          last24hTokens,
        },
        requestCount: p.tokenUsage.length,
        conversationsCount: convCountMap[p.id] || 0,
        documentsCount: userDocs.length,
        recentDocuments: userDocs.slice(0, 8),
      };
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      id,
      email,
      displayName,
      companyName,
      companyUrl,
      role = 'client',
      status = 'active',
      tier = 'pro',
      docIdTemplate = 'VARUNA-[YYYY]-[####]',
      customQuotaTokens,
      adminNotes,
    } = body;

    if (!email) {
      return NextResponse.json({ error: 'Subscriber email is required' }, { status: 400 });
    }

    const newId =
      id?.trim() ||
      `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const created = await (prisma as any).profile.create({
      data: {
        id: newId,
        email: email.trim(),
        displayName: displayName || null,
        companyName: companyName || null,
        companyUrl: companyUrl || null,
        role,
        status,
        tier,
        docIdTemplate,
        onboardingComplete: true,
        brandParameters: {
          customQuotaTokens: customQuotaTokens ? Number(customQuotaTokens) : null,
          adminNotes: adminNotes || '',
        },
      },
    });

    return NextResponse.json({ user: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      userId,
      userIds,
      action,
      status,
      role,
      tier,
      displayName,
      email,
      companyName,
      companyUrl,
      docIdTemplate,
      docIdCounter,
      baseTemplate,
      stripeCustomerId,
      stripeSubscriptionId,
      customQuotaTokens,
      adminNotes,
      customPlaybook,
    } = body;

    // Support bulk updates across multiple subscribers
    if (Array.isArray(userIds) && userIds.length > 0) {
      const safeIds = userIds.filter((id) => id !== admin.id);
      const bulkData: any = {};
      if (status) bulkData.status = status;
      if (tier) bulkData.tier = tier;
      if (role) bulkData.role = role;

      await prisma.profile.updateMany({
        where: { id: { in: safeIds } },
        data: bulkData,
      });

      return NextResponse.json({ success: true, updatedCount: safeIds.length });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Handle token usage reset action
    if (action === 'reset_tokens') {
      await (prisma as any).tokenUsage.deleteMany({
        where: { userId },
      });
      return NextResponse.json({ success: true, message: 'Token usage reset' });
    }

    if (userId === admin.id && role && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
    }

    const existing = await (prisma as any).profile.findUnique({
      where: { id: userId },
    });

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) updateData.role = role;
    if (tier !== undefined) updateData.tier = tier;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyUrl !== undefined) updateData.companyUrl = companyUrl;
    if (docIdTemplate !== undefined) updateData.docIdTemplate = docIdTemplate;
    if (docIdCounter !== undefined) updateData.docIdCounter = Number(docIdCounter);
    if (baseTemplate !== undefined) updateData.baseTemplate = baseTemplate;
    if (stripeCustomerId !== undefined) updateData.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId !== undefined)
      updateData.stripeSubscriptionId = stripeSubscriptionId;

    if (
      customQuotaTokens !== undefined ||
      adminNotes !== undefined ||
      customPlaybook !== undefined
    ) {
      const currentBrandParams = existing?.brandParameters || {};
      updateData.brandParameters = {
        ...currentBrandParams,
        ...(customQuotaTokens !== undefined
          ? { customQuotaTokens: customQuotaTokens ? Number(customQuotaTokens) : null }
          : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        ...(customPlaybook !== undefined ? { customPlaybook } : {}),
      };
    }

    const updated = await (prisma as any).profile.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { userId, userIds } = await req.json();

    const targets: string[] = Array.isArray(userIds)
      ? userIds.filter((id) => id !== admin.id)
      : userId && userId !== admin.id
      ? [userId]
      : [];

    if (targets.length === 0) {
      return NextResponse.json(
        { error: 'Valid subscriber userId(s) required (cannot delete yourself)' },
        { status: 400 }
      );
    }

    await (prisma as any).document.deleteMany({
      where: { userId: { in: targets } },
    });
    await prisma.conversation.deleteMany({
      where: { userId: { in: targets } },
    });
    await prisma.profile.deleteMany({
      where: { id: { in: targets } },
    });

    return NextResponse.json({ success: true, deletedCount: targets.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
