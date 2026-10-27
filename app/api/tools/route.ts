import { NextResponse } from 'next/server';
import { zodSchema } from 'ai';
import { allSpecialistTools } from '@/lib/tools/specialist_tools';

const executionCounts: Record<string, { count: number; lastRun: number | null }> = {};

function categorizeTool(name: string): string {
  if (name.includes('redline') || name.includes('compare_document') || name.includes('clean_execution')) {
    return 'redlining';
  }
  if (name.includes('clause') || name.includes('playbook') || name.includes('diligence') || name.includes('closing_checklist')) {
    return 'diligence';
  }
  if (name.includes('cap_table') || name.includes('waterfall') || name.includes('vesting') || name.includes('form_d') || name.includes('blue_sky')) {
    return 'corporate';
  }
  if (name.includes('bluebook') || name.includes('privilege_log') || name.includes('litigation_deadlines') || name.includes('examination_outline')) {
    return 'litigation';
  }
  if (name.includes('trademark') || name.includes('patent') || name.includes('privacy_ropa') || name.includes('aml_kyc')) {
    return 'ip_compliance';
  }
  if (name.includes('invoice') || name.includes('esignature')) {
    return 'firm_ops';
  }
  if (name.includes('sec') || name.includes('edgar') || name.includes('case') || name.includes('judge')) {
    return 'research';
  }
  if (name.includes('document') || name.includes('section') || name.includes('compile')) {
    return 'document';
  }
  if (name.includes('human')) {
    return 'utility';
  }
  return 'workflow';
}

export async function GET() {
  const tools = Object.entries(allSpecialistTools).map(([name, t]: [string, any]) => {
    let extractedParams: Record<string, any> = {};
    if (t.parameters) {
      try {
        const wrapped = zodSchema(t.parameters);
        const jsonSchema: any = wrapped.jsonSchema || {};
        const props = jsonSchema.properties || {};
        const requiredList: string[] = Array.isArray(jsonSchema.required) ? jsonSchema.required : [];

        for (const [propKey, propSchema] of Object.entries(props) as [string, any][]) {
          extractedParams[propKey] = {
            type: propSchema.type || 'string',
            description: propSchema.description || '',
            enum: propSchema.enum,
            default: propSchema.default,
            required: requiredList.includes(propKey),
          };
        }
      } catch {}
    }

    const stats = executionCounts[name] || { count: 0, lastRun: null };

    return {
      name,
      category: categorizeTool(name),
      description: t.description || name,
      parameters: extractedParams,
      usage_stats: {
        execution_count: stats.count,
        last_execution_time: stats.lastRun,
      },
    };
  });

  return NextResponse.json({ tools });
}

export async function POST(req: Request) {
  try {
    const { tool_name, parameters } = await req.json();
    const targetTool = (allSpecialistTools as any)[tool_name];

    if (!targetTool || typeof targetTool.execute !== 'function') {
      return NextResponse.json(
        { error: `Tool '${tool_name}' not found or not executable.` },
        { status: 404 }
      );
    }

    const result = await targetTool.execute(parameters || {});
    const prev = executionCounts[tool_name] || { count: 0, lastRun: null };
    executionCounts[tool_name] = { count: prev.count + 1, lastRun: Date.now() };

    return NextResponse.json({
      status: result?.status === 'failed' || result?.error ? 'error' : 'success',
      tool_name,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', error: error.message || String(error) },
      { status: 500 }
    );
  }
}
