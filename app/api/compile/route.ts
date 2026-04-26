import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { latex, filename = 'preview', logoUrl, coverUrl } = await req.json();
    if (!latex) return NextResponse.json({ error: 'No LaTeX provided' }, { status: 400 });

    const cleanFilename = `${filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}_${Date.now()}`;
    
    // Helper: convert /api/s3/... proxy URLs to absolute S3 URLs, or pass through external URLs
    const getResourcePayload = (url: string, pathName: string) => {
      let fetchUrl = url;
      const endpoint = (process.env.S3_ENDPOINT || '').replace(/\/$/, '');
      const bucket = process.env.S3_BUCKET_NAME || 'basaltvigil';
      
      if (url.startsWith('/api/s3/')) {
        const s3Key = url.replace('/api/s3/', '');
        if (endpoint.includes('ovh.us')) {
          const host = endpoint.replace('https://', '').replace('http://', '');
          fetchUrl = `https://${bucket}.${host}/${s3Key}`;
        } else {
          fetchUrl = `${endpoint}/${bucket}/${s3Key}`;
        }
      } else if (endpoint.includes('ovh.us') && url.includes(`${endpoint}/${bucket}`)) {
        // Fix old path-style URLs that were saved directly to DB
        const host = endpoint.replace('https://', '').replace('http://', '');
        fetchUrl = url.replace(`${endpoint}/${bucket}`, `https://${bucket}.${host}`);
      }
      return { path: pathName, url: fetchUrl };
    };

    const resources: any[] = [{ main: true, content: latex }];
    if (logoUrl && !logoUrl.toLowerCase().includes('.svg') && !logoUrl.toLowerCase().includes('.webp')) {
      resources.push(getResourcePayload(logoUrl, 'logo.png'));
    }
    if (coverUrl && !coverUrl.toLowerCase().includes('.svg') && !coverUrl.toLowerCase().includes('.webp')) {
      resources.push(getResourcePayload(coverUrl, 'cover.png'));
    }

    // Compile using public latex API instead of local pdflatex
    const compileRes = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler: 'pdflatex', resources })
    });
    
    if (!compileRes.ok) {
      const errorBody = await compileRes.text();
      console.error(`[LaTeX API Error] Status: ${compileRes.status}, Body: ${errorBody}`);
      console.error(`[LaTeX API Error] Resources Payload: ${JSON.stringify(resources, null, 2)}`);
      throw new Error(`LaTeX API compilation failed: ${compileRes.statusText} - ${errorBody.substring(0, 300)}`);
    }
    
    const pdfBuffer = Buffer.from(await compileRes.arrayBuffer());

    let publicUrl = "";

    if (process.env.STORAGE_PROVIDER === 's3' && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
      const s3Client = new S3Client({
        region: process.env.S3_REGION || 'us-west-or',
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
      });
      
      const key = `documents/${cleanFilename}.pdf`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || 'basaltvigil',
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        ACL: 'public-read'
      }));
      
      publicUrl = `/api/s3/${key}`;
    } else {
      // Fallback: save locally
      const outDir = path.join(process.cwd(), 'public', 'docs');
      await fs.mkdir(outDir, { recursive: true });
      const pdfPath = path.join(outDir, `${cleanFilename}.pdf`);
      await fs.writeFile(pdfPath, pdfBuffer);
      publicUrl = `/docs/${cleanFilename}.pdf`;
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Compile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
