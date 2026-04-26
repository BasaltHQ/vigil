import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { thirdwebAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { uploadBufferToS3 } from '@/lib/tools/s3_tools';
import sharp from 'sharp';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("thirdweb_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authResult = await thirdwebAuth.verifyJWT({ jwt: token });
    if (!authResult.valid || !authResult.parsedJWT.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({ where: { id: authResult.parsedJWT.sub } });
    if (!profile) {
      return NextResponse.json({ role: 'client', status: 'pending' });
    }

    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      role: profile.role,
      status: profile.status,
      companyUrl: (profile as any).companyUrl,
      companyName: (profile as any).companyName,
      brandAssets: (profile as any).brandAssets,
      brandParameters: (profile as any).brandParameters,
      baseTemplate: (profile as any).baseTemplate,
      docIdTemplate: (profile as any).docIdTemplate,
      docIdCounter: (profile as any).docIdCounter,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("thirdweb_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authResult = await thirdwebAuth.verifyJWT({ jwt: token });
    if (!authResult.valid || !authResult.parsedJWT.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Intercept scraped external logos and save to S3
    if (body.brandAssets && Array.isArray(body.brandAssets.logos) && body.brandAssets.logos.length > 0) {
      const logoUrl = body.brandAssets.logos[0] as string;
      if (logoUrl && logoUrl.startsWith('http') && !logoUrl.includes('s3.amazonaws.com') && !logoUrl.includes(process.env.S3_ENDPOINT || 's3')) {
        try {
          const imageRes = await fetch(logoUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });
          if (imageRes.ok) {
            const arrayBuffer = await imageRes.arrayBuffer();
            let buffer = Buffer.from(arrayBuffer);
            let contentType = imageRes.headers.get('content-type') || 'image/png';
            let ext = 'png';
            
            // Convert everything to PNG to ensure LaTeX compatibility
            try {
              buffer = (await sharp(buffer).png().toBuffer()) as any;
              contentType = 'image/png';
              ext = 'png';
            } catch (sharpErr) {
              console.error('[Profile PUT] Sharp conversion failed, using original buffer', sharpErr);
              if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
              if (contentType.includes('svg')) ext = 'svg';
              if (contentType.includes('webp')) ext = 'webp';
            }
            
            const filename = `brand_logo_${Date.now()}.${ext}`;
            const uploadRes = await uploadBufferToS3(buffer as any, filename, 'brand-assets', contentType);
            
            if (uploadRes.shareUrl) {
              body.brandAssets.logos[0] = uploadRes.shareUrl;
            } else {
              body.brandAssets.logos = []; // Clear on upload failure
            }
          } else {
            console.error(`[Profile PUT] Failed to fetch external logo. Status: ${imageRes.status}`);
            body.brandAssets.logos = []; // Clear if inaccessible
          }
        } catch (err) {
          console.error('[Profile PUT] Failed to mirror external logo to S3:', err);
          body.brandAssets.logos = []; // Clear if inaccessible
        }
      }
    }

    if (body.brandAssets && body.brandAssets.coverImage) {
      const coverUrl = body.brandAssets.coverImage as string;
      if (coverUrl && coverUrl.startsWith('http') && !coverUrl.includes('s3.amazonaws.com') && !coverUrl.includes(process.env.S3_ENDPOINT || 's3')) {
        try {
          const imageRes = await fetch(coverUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });
          if (imageRes.ok) {
            const arrayBuffer = await imageRes.arrayBuffer();
            let buffer = Buffer.from(arrayBuffer);
            let contentType = imageRes.headers.get('content-type') || 'image/png';
            let ext = 'png';
            
            try {
              buffer = (await sharp(buffer).png().toBuffer()) as any;
              contentType = 'image/png';
              ext = 'png';
            } catch (sharpErr) {
              console.error('[Profile PUT] Sharp conversion failed, using original buffer', sharpErr);
              if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
              if (contentType.includes('svg')) ext = 'svg';
              if (contentType.includes('webp')) ext = 'webp';
            }
            
            const filename = `brand_cover_${Date.now()}.${ext}`;
            const uploadRes = await uploadBufferToS3(buffer as any, filename, 'brand-assets', contentType);
            
            if (uploadRes.shareUrl) {
              body.brandAssets.coverImage = uploadRes.shareUrl;
            } else {
              body.brandAssets.coverImage = null; // Clear on upload failure
            }
          } else {
            console.error(`[Profile PUT] Failed to fetch external cover. Status: ${imageRes.status}`);
            body.brandAssets.coverImage = null; // Clear if inaccessible
          }
        } catch (err) {
          console.error('[Profile PUT] Failed to mirror external cover to S3:', err);
          body.brandAssets.coverImage = null; // Clear if inaccessible
        }
      }
    }

    // Using (prisma as any) due to cached type definitions during active development
    const updated = await (prisma as any).profile.upsert({
      where: { id: authResult.parsedJWT.sub },
      update: {
        companyUrl: body.companyUrl !== undefined ? body.companyUrl : undefined,
        companyName: body.companyName !== undefined ? body.companyName : undefined,
        brandAssets: body.brandAssets !== undefined ? body.brandAssets : undefined,
        brandParameters: body.brandParameters !== undefined ? body.brandParameters : undefined,
        baseTemplate: body.baseTemplate !== undefined ? body.baseTemplate : undefined,
        docIdTemplate: body.docIdTemplate !== undefined ? body.docIdTemplate : undefined,
        docIdCounter: body.docIdCounter !== undefined ? body.docIdCounter : undefined,
        displayName: body.displayName !== undefined ? body.displayName : undefined,
      },
      create: {
        id: authResult.parsedJWT.sub,
        email: body.email || 'unknown',
        displayName: body.displayName,
        companyUrl: body.companyUrl,
        companyName: body.companyName,
        brandAssets: body.brandAssets,
        brandParameters: body.brandParameters,
        baseTemplate: body.baseTemplate,
        docIdTemplate: body.docIdTemplate,
        docIdCounter: body.docIdCounter,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[Profile PUT Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
