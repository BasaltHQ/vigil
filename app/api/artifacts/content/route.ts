import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get('path');
  if (!filePath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  try {
    // Resolve relative to the project's public/docs directory
    const resolvedPath = path.resolve(process.cwd(), 'public', filePath);
    const content = await fs.readFile(resolvedPath, 'utf-8');
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: 'File not found', details: e.message }, { status: 404 });
  }
}
