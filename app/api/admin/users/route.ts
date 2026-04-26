import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { thirdwebAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getAdminUser() {
  const userId = await getAuthUserId();
  if (userId === 'default_user') return null;

  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile || profile.role !== 'admin') return null;

  return profile;
}

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
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const profiles = await prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tokenUsage: {
          select: {
            promptTokens: true,
            completionTokens: true,
            totalTokens: true,
          },
        },
      },
    });

    // Aggregate token usage per user
    const users = profiles.map(p => {
      const totals = p.tokenUsage.reduce(
        (acc, t) => ({
          promptTokens: acc.promptTokens + t.promptTokens,
          completionTokens: acc.completionTokens + t.completionTokens,
          totalTokens: acc.totalTokens + t.totalTokens,
        }),
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      );

      return {
        id: p.id,
        email: p.email,
        displayName: p.displayName,
        role: p.role,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        tokenUsage: totals,
        requestCount: p.tokenUsage.length,
      };
    });

    return NextResponse.json({ users });
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
    const { userId, status, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Don't allow admin to modify their own role
    if (userId === admin.id && role && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const updated = await prisma.profile.update({
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
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (userId === admin.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Delete profile (cascades to token usage)
    await prisma.profile.delete({ where: { id: userId } });

    // Also delete their conversations
    await prisma.conversation.deleteMany({ where: { userId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
