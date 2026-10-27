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

export async function GET() {
  try {
    const userId = await getAuthUserId();

    let documents = await (prisma as any).document.findMany({
      where: userId === 'default_user' ? {} : { userId },
      orderBy: { createdAt: 'desc' },
    });

    // If user has no documents under their exact ID yet, check if anonymous/default_user docs exist
    if (documents.length === 0 && userId !== 'default_user') {
      documents = await (prisma as any).document.findMany({
        where: { userId: { in: ['anonymous', 'default_user'] } },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    const body = await req.json();

    const document = await (prisma as any).document.create({
      data: {
        userId,
        displayId: body.displayId || null,
        conversationId: body.conversationId || null,
        title: body.title,
        documentType: body.documentType || 'general',
        format: body.format || 'pdf',
        filePath: body.filePath,
        fileSize: body.fileSize || 0,
        createdBy: body.createdBy || null,
        metadata: body.metadata || {},
      },
    });

    return NextResponse.json({ document });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Document id required' }, { status: 400 });
    }
    await (prisma as any).document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
