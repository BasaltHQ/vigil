import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; 

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connected event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'connected',
        message: 'Native Next.js stream initialized',
        timestamp: Date.now() / 1000
      })}\n\n`));

      // Keep connection alive
      const keepAliveInterval = setInterval(() => {
        try {
          if (controller.desiredSize !== null) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'heartbeat',
              source: 'nextjs',
              timestamp: Date.now() / 1000
            })}\n\n`));
          }
        } catch (e) {
          clearInterval(keepAliveInterval);
        }
      }, 5000);

      // Clean up when request closes
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAliveInterval);
        try { controller.close(); } catch (e) {}
      });
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
    },
  });
}