import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({
    status: 'success',
    data: { id: 'corporate', name: 'Corporate Law', description: 'Securities, M&A, governance', icon: '🎬', color: '#4A5568' }
  });
}
