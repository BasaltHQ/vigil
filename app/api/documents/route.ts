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

    const documents = await (prisma as any).document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

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
