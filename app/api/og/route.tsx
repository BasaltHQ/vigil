import { ImageResponse } from 'next/og';
import { BG_BASE64, LOGO_BASE64 } from './og-assets';

export const runtime = 'edge';

// Vox font weights from Adobe Typekit (woff format — Satori doesn't support woff2)
const VOX_FONT_URLS = {
  300: 'https://use.typekit.net/af/23214c/00000000000000007735d470/31/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n3&v=3',
  400: 'https://use.typekit.net/af/5d050f/00000000000000007735a575/31/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3',
  700: 'https://use.typekit.net/af/e366b7/00000000000000007735a559/31/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3',
};

async function loadFont(weight: keyof typeof VOX_FONT_URLS): Promise<ArrayBuffer> {
  const res = await fetch(VOX_FONT_URLS[weight]);
  return res.arrayBuffer();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const subtitle = searchParams.get('subtitle');

  // Load multiple Vox weights in parallel
  const [voxLight, voxRegular, voxBold] = await Promise.all([
    loadFont(300),
    loadFont(400),
    loadFont(700),
  ]);

  // Use inlined base64 assets — edge runtime can't fetch from its own origin
  const bgUrl = BG_BASE64;
  const logoUrl = LOGO_BASE64;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          fontFamily: '"Vox"',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgUrl}
          alt=""
          width={1200}
          height={630}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Soft gradient wash to blend edges */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.5) 100%)',
          }}
        />

        {/* Hard curved black mask — the text panel */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: 0,
            width: '580px',
            height: '710px',
            backgroundColor: '#000000',
            borderTopLeftRadius: '300px',
            borderBottomLeftRadius: '300px',
            display: 'flex',
            boxShadow: '-30px 0 60px rgba(0,0,0,0.8)',
          }}
        />

        {/* Red accent glow at the curve edge */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '500px',
            width: '120px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(204,0,0,0.12) 0%, transparent 70%)',
            transform: 'translateY(-50%)',
            display: 'flex',
          }}
        />

        {/* Content — right-aligned on the solid black curved panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingRight: '56px',
            width: '520px',
            zIndex: 10,
            textAlign: 'right',
          }}
        >
          {/* Shield + Brand Name row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '16px',
            }}
          >
            {/* Shield Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt=""
              width={80}
              height={80}
              style={{
                filter: 'drop-shadow(0 0 20px rgba(204,0,0,0.4))',
              }}
            />

            {/* Brand Name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '2px',
                letterSpacing: '0.12em',
              }}
            >
              <span style={{ fontSize: '52px', fontWeight: 300, color: '#d4d4d4' }}>
                BASALT
              </span>
              <span style={{ fontSize: '52px', fontWeight: 700, color: '#ffffff' }}>
                VIGIL
              </span>
            </div>
          </div>

          {/* Red accent line */}
          <div
            style={{
              width: '100%',
              height: '3px',
              marginBottom: '20px',
              display: 'flex',
              background: 'linear-gradient(270deg, #cc0000 0%, #cc0000 60%, transparent 100%)',
              borderRadius: '2px',
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: title ? '26px' : '22px',
              fontWeight: 400,
              color: '#a3a3a3',
              lineHeight: 1.4,
              letterSpacing: '0.04em',
              textAlign: 'right',
              display: 'flex',
            }}
          >
            {title || 'Advanced Legal Swarm Intelligence'}
          </div>

          {/* Optional subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: '17px',
                fontWeight: 300,
                color: '#666666',
                marginTop: '10px',
                letterSpacing: '0.06em',
                display: 'flex',
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Domain badge */}
          <div
            style={{
              marginTop: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 400,
                color: '#525252',
                letterSpacing: '0.15em',
              }}
            >
              VIGIL.BASALTHQ.COM
            </span>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#cc0000',
                boxShadow: '0 0 10px rgba(204,0,0,0.6)',
                display: 'flex',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Vox', data: voxLight, weight: 300 as const, style: 'normal' as const },
        { name: 'Vox', data: voxRegular, weight: 400 as const, style: 'normal' as const },
        { name: 'Vox', data: voxBold, weight: 700 as const, style: 'normal' as const },
      ],
    }
  );
}
