import { NextResponse } from 'next/server';
import { allSpecialistTools } from '@/lib/tools/specialist_tools';

export async function GET() {
  // Build tool list from the specialist tools registry
  const tools = Object.entries(allSpecialistTools).map(([name, t]) => ({
    name,
    category: name.includes('sec') || name.includes('edgar') ? 'research'
      : name.includes('case') || name.includes('judge') ? 'research'
      : name.includes('document') || name.includes('section') || name.includes('compile') ? 'document'
      : name.includes('human') ? 'utility'
      : 'workflow',
    description: (t as any).description || name,
    parameters: {},
    usage_stats: { execution_count: 0, last_execution_time: null }
  }));

  return NextResponse.json({ tools });
}
