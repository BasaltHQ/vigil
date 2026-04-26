import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get('path');
  if (!filePath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  try {
    // Remove leading slashes to ensure it is treated as a relative path
    const cleanPath = filePath.replace(/^[\\/]+/, '');

    // If the path is an S3 proxy path, fetch from S3 directly
    if (cleanPath.startsWith('api/s3/')) {
      const s3Key = cleanPath.replace('api/s3/', '');
      const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = new S3Client({
        region: process.env.S3_REGION || 'us-west-or',
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY!,
          secretAccessKey: process.env.S3_SECRET_KEY!,
        },
      });
      const result = await s3Client.send(new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || 'basaltvigil',
        Key: s3Key,
      }));
      const bodyBytes = await result.Body?.transformToByteArray();
      if (!bodyBytes) {
        return NextResponse.json({ error: 'Empty response from S3' }, { status: 404 });
      }
      return new NextResponse(Buffer.from(bodyBytes), {
        headers: {
          'Content-Type': result.ContentType || 'application/pdf',
          'Content-Disposition': `inline; filename="${s3Key.split('/').pop()}"`,
        },
      });
    }

    const publicDir = path.join(process.cwd(), 'public');
    const resolvedPath = path.resolve(publicDir, cleanPath);
    
    if (!resolvedPath.startsWith(publicDir)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    const buffer = await fs.readFile(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(resolvedPath)}"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'File not found', details: e.message }, { status: 404 });
  }
}
