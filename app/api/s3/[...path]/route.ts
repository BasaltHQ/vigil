import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathSegments } = await params;
    const key = pathSegments.join('/');

    if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      return NextResponse.json({ error: 'S3 not configured' }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: process.env.S3_REGION || 'us-west-or',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    });

    const result = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'basaltvigil',
      Key: key,
    }));

    const bodyBytes = await result.Body?.transformToByteArray();
    if (!bodyBytes) {
      return NextResponse.json({ error: 'Empty response from S3' }, { status: 404 });
    }

    return new NextResponse(Buffer.from(bodyBytes), {
      headers: {
        'Content-Type': result.ContentType || 'application/pdf',
        'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[S3 Proxy Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch file' }, { status: 500 });
  }
}
