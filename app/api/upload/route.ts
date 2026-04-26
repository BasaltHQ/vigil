import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (process.env.STORAGE_PROVIDER !== 's3' || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      return NextResponse.json({ error: 'S3 storage is not configured' }, { status: 500 });
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
    
    let buffer = Buffer.from(await file.arrayBuffer());
    let contentType = file.type || 'image/png';
    
    // Always convert to PNG for LaTeX safety
    try {
      buffer = (await sharp(buffer).png().toBuffer()) as any;
      contentType = 'image/png';
    } catch (e) {
      console.warn("Sharp conversion failed, uploading original buffer", e);
    }
    
    const filename = `logo_${uuidv4()}.png`;
    const key = `assets/${filename}`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'basaltvigil',
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read'
    }));
    
    const endpointUrl = (process.env.S3_ENDPOINT || '').endsWith("/") ? (process.env.S3_ENDPOINT || '').slice(0, -1) : (process.env.S3_ENDPOINT || '');
    let publicUrl = `${endpointUrl}/${process.env.S3_BUCKET_NAME || 'basaltvigil'}/${key}`;
    
    if (endpointUrl.includes('ovh.us')) {
      const host = endpointUrl.replace('https://', '').replace('http://', '');
      publicUrl = `https://${process.env.S3_BUCKET_NAME || 'basaltvigil'}.${host}/${key}`;
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('[Upload Error]', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
