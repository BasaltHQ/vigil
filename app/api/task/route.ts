import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Task execution is now handled natively by the /api/chat route
  // via LangGraph streaming. This endpoint is kept for backwards
  // compatibility but returns a redirect message.
  return NextResponse.json({
    status: 'info',
    message: 'Task execution is handled via the /api/chat streaming endpoint.'
  });
}