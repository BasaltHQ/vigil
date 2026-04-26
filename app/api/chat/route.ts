import { NextResponse } from 'next/server';
import { streamText, convertToModelMessages, stepCountIs, generateText, tool } from 'ai';
import { z } from 'zod';
import { azure } from '@ai-sdk/azure';
import { prisma } from '@/lib/db';
import { allSpecialistTools } from '@/lib/tools/specialist_tools';
import * as fs from 'fs';
import * as path from 'path';
import { cookies } from 'next/headers';
import { thirdwebAuth } from '@/lib/auth';

export const maxDuration = 300;

// Pre-compute correct JSON schemas from Zod (workaround for @ai-sdk/azure@3.0.54 serialization bug)
const correctSchemas: Record<string, any> = {};
for (const [name, t] of Object.entries(allSpecialistTools) as [string, any][]) {
  if (t.parameters?.toJSONSchema) {
    const schema = t.parameters.toJSONSchema();
    delete schema.$schema; // Azure doesn't need this metadata
    correctSchemas[name] = schema;
  } else if (t.parameters?.jsonSchema) {
    correctSchemas[name] = t.parameters.jsonSchema;
  }
}
console.log(`[Vigil] Pre-computed ${Object.keys(correctSchemas).length} tool schemas`);

// Pre-load agent instruction files
const instructionsDir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'lib', 'agents', 'instructions');

function loadAgentInstructions(agentName: string, swarmId: string): string {
  const name = agentName.toLowerCase();
  // Try swarm-specific directory first (e.g. criminal/holmes.md), then root (keyes.md)
  const candidates = [
    path.join(instructionsDir, swarmId, `${name}.md`),
    path.join(instructionsDir, `${name}.md`),
  ];
  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        console.log(`[Vigil] Loaded instructions for ${agentName} from ${path.basename(filePath)} (${content.length} chars)`);
        return content;
      }
    } catch { }
  }
  // Fallback
  return `You are ${agentName}, the Lead Orchestrator of the Vigil legal platform's ${swarmId} swarm. You coordinate legal tasks across your specialist agent team. You have deep expertise in legal analysis, research, document drafting, and case strategy. Respond in a professional, thorough manner.`;
}

// Patch the broken serialization before it reaches Azure by using a custom fetch
import { createAzure } from '@ai-sdk/azure';
const patchedAzure = createAzure({
  fetch: async (url, init) => {
    if (init?.body) {
      try {
        const body = JSON.parse(init.body as string);
        if (body.tools && Array.isArray(body.tools)) {
          let patched = false;
          for (const tool of body.tools) {
            const name = tool.function?.name;
            if (name && correctSchemas[name]) {
              tool.function.parameters = correctSchemas[name];
              patched = true;
            }
          }
          if (patched) {
            init = { ...init, body: JSON.stringify(body) };
          }
        }
      } catch { }
    }
    return fetch(url, init);
  }
});

export async function POST(req: Request) {
  try {
    console.log("Processing chat request...");

    // Extract authenticated user from Thirdweb session
    const cookieStore = await cookies();
    const token = cookieStore.get("thirdweb_auth_token")?.value;
    let userId = 'anonymous';
    
    if (token) {
      const authResult = await thirdwebAuth.verifyJWT({ jwt: token });
      if (authResult.valid && authResult.parsedJWT.sub) {
        userId = authResult.parsedJWT.sub;
      }
    }

    const { messages, swarm_id, context, conversation_id } = await req.json();

    const getMessageText = (m: any) => {
      if (typeof m.content === 'string') return m.content;
      if (m.parts) return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
      return '';
    };

    // Persist the latest user message
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
    if (lastUserMsg && conversation_id) {
      await prisma.message.create({
        data: {
          conversationId: String(conversation_id),
          role: 'user',
          content: getMessageText(lastUserMsg),
          metadata: { swarm_id: String(swarm_id) },
        },
      });
      await prisma.conversation.update({
        where: { id: String(conversation_id) },
        data: { updatedAt: new Date() },
      });
    }

    const orchestrators: Record<string, string> = {
      corporate: 'Keyes',
      criminal: 'Holmes',
      family: 'Bennet',
      immigration: 'Polo',
      ip_entertainment: 'Selznick',
      personal_injury: 'House',
      real_estate: 'Earp',
    };
    const orchestratorName = orchestrators[String(swarm_id)] || 'Keyes';
    let systemPrompt = loadAgentInstructions(orchestratorName, String(swarm_id) || 'corporate');
    
    // Inject the roster of available agents so the orchestrator knows who it can route to
    const availableAgents = ['Archer', 'Bannister', 'Cairo', 'Gittes', 'Gutman', 'Hammer', 'Marlowe', 'Neff', 'Ohara', 'Queen', 'Spade', 'Vance'];
    systemPrompt += `\n\nSYSTEM NOTICE: You have the ability to hand off tasks to the following specialist agents: ${availableAgents.join(', ')}. If you need specialist input, YOU MUST route the document to them immediately.`;

    if (userId !== 'anonymous') {
      try {
        const profile = await (prisma as any).profile.findUnique({ where: { id: userId } });
        if (profile) {
          if (profile.brandParameters || profile.brandAssets) {
            systemPrompt += `\n\n[USER BRAND IDENTITY & CONTEXT]\nThe user has provided specific brand guidelines that MUST be followed when drafting any external or formal documents.`;
            if (profile.brandParameters) {
              systemPrompt += `\nTone of Voice: ${profile.brandParameters.tone || 'Professional'}`;
              systemPrompt += `\nKey Offerings: ${profile.brandParameters.offerings?.join(', ') || 'N/A'}`;
            }
            if (profile.brandAssets) {
              systemPrompt += `\nPrimary Color: ${profile.brandAssets.colors?.primary || 'N/A'}`;
              systemPrompt += `\nSecondary Color: ${profile.brandAssets.colors?.secondary || 'N/A'}`;
              systemPrompt += `\nTypography: ${profile.brandAssets.typography?.join(', ') || 'N/A'}`;
              if (profile.brandAssets.logos && profile.brandAssets.logos.length > 0) {
                systemPrompt += `\nLogo URL: ${profile.brandAssets.logos[0]}`;
              }
            }
          }
          if (profile.baseTemplate) {
            systemPrompt += `\n\n[BASE DOCUMENT TEMPLATE]\nThe user has selected the following base template for formal corporate documents: ${profile.baseTemplate}. When drafting LaTeX documents, you should instruct the compilation tool to use this template if applicable (by passing it as the template_name parameter), or heavily base your LaTeX output on the structure commonly associated with ${profile.baseTemplate}.`;
          }
        }
      } catch (e) {
        console.error('Failed to fetch brand context', e);
      }
    }

    // CONTEXT OPTIMIZATION: Extract massive document blocks from the chat history and inject them
    // directly into the System Prompt. This prevents quadratic token-attention slowdowns in Azure 
    // caused by repeatedly passing 50,000+ chars in the multi-turn conversational history array.
    let extractedDocumentText = "";
    const optimizedMessages = messages.map((m: any) => {
      // Create a deep copy to avoid mutating the original req.json() object if it's referenced elsewhere
      const mCopy = JSON.parse(JSON.stringify(m));
      
      // Fix: convertToModelMessages in ai@3.0.x aggressively requires a `parts` array on ALL messages (user and assistant).
      // If it is missing, it will crash with "Cannot read properties of undefined (reading 'map')" or ignore the message.
      if (!mCopy.parts) {
        mCopy.parts = [{ type: 'text', text: mCopy.content || '' }];
      }

      if (mCopy.role === 'user' && mCopy.content) {
        const textContent = typeof mCopy.content === 'string' ? mCopy.content : (mCopy.parts ? mCopy.parts.filter((p:any) => p.type === 'text').map((p:any) => p.text).join('\n') : '');
        const docMatch = textContent.match(/\[The following documents were uploaded by the user:\]\n\n([\s\S]*?)(?=\n\n\[End of attached documents\]|$)/);
        if (docMatch && docMatch[1].length > 500) {
          extractedDocumentText += `\n\n--- UPLOADED DOCUMENT ---\n${docMatch[1]}\n--- END DOCUMENT ---\n`;
          // Replace the massive blob with a lightweight reference
          if (typeof mCopy.content === 'string') {
            mCopy.content = mCopy.content.replace(docMatch[0], '[System Note: A large document was uploaded and has been moved to your system context for performance.]');
          } else if (mCopy.parts) {
            mCopy.parts.forEach((p: any) => {
              if (p.type === 'text' && p.text.includes(docMatch[1])) {
                p.text = p.text.replace(docMatch[0], '[System Note: A large document was uploaded and has been moved to your system context for performance.]');
              }
            });
          }
        }
      }
      return mCopy;
    });

    if (extractedDocumentText) {
      systemPrompt += `\n\n${extractedDocumentText}`;
    }

    console.log("[DEBUG] optimizedMessages:", JSON.stringify(optimizedMessages, null, 2));

    const runtimeTools: any = { ...allSpecialistTools };
    runtimeTools.handoff_to_agent = tool({
      description: "Hand off a task to a specialist agent in the swarm. They will process it and return their detailed opinion to you.",
      parameters: z.object({
        agent_name: z.string().describe("Name of the agent to hand off to (e.g., Holmes, Archer, Bannister, etc.)"),
        next_task: z.string().describe("Clear description of the task the agent needs to perform.")
      }),
      execute: async (args: any) => {
        const { agent_name, next_task } = args;
        console.log(`[Handoff] ${orchestratorName} handing off to ${agent_name}`);
        try {
          // The specialist also needs the extracted document context!
          let specialistPrompt = loadAgentInstructions(agent_name, String(swarm_id) || 'corporate');
          if (extractedDocumentText) specialistPrompt += `\n\n${extractedDocumentText}`;

          const cleanHistory = optimizedMessages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: typeof m.content === 'string' ? m.content : (m.parts ? m.parts.filter((p:any) => p.type === 'text').map((p:any) => p.text).join('\n') : '')
          }));
          
          const { text } = await generateText({
            model: patchedAzure.chat(process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5.4-mini'),
            messages: [
              ...cleanHistory, 
              { role: 'user', content: `[ORCHESTRATOR INSTRUCTION]: ${next_task}\n\nPlease perform this task and return a detailed report.` }
            ],
            system: specialistPrompt,
          });
          return { status: "success", target_agent: agent_name, specialist_report: text };
        } catch (e: any) {
          console.error(`[Handoff Error] Failed to execute handoff to ${agent_name}:`, e);
          return { status: "failed", error: e.message || String(e) };
        }
      }
    } as any);

    const response = await streamText({
      model: patchedAzure.chat(process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5.4-mini'),
      messages: await convertToModelMessages(optimizedMessages),
      system: systemPrompt,
      tools: runtimeTools,
      stopWhen: stepCountIs(10),
      onStepFinish: async (step) => {
        const calls = (step.toolCalls || []).map((tc: any) => tc.toolName);
        const results = (step.toolResults || []).map((tr: any) => tr.toolName);
        console.log(`[Step] tools=[${calls}], results=[${results}], textLen=${step.text?.length || 0}`);

        // Track generated documents per user
        if (userId !== 'anonymous') {
          for (const tr of (step.toolResults || []) as any[]) {
            if (tr.toolName === 'compile_custom_latex' && tr.result?.status === 'success') {
              try {
                const fileUrl = tr.result.file_url || '';
                const filename = fileUrl.split('/').pop() || 'document.pdf';
                await (prisma as any).document.create({
                  data: {
                    userId,
                    conversationId: conversation_id ? String(conversation_id) : null,
                    title: filename.replace(/\.pdf$/i, '').replace(/_/g, ' '),
                    documentType: 'legal',
                    format: 'pdf',
                    filePath: fileUrl,
                    createdBy: orchestratorName,
                  },
                });
              } catch (e) {
                console.error('[Document] Failed to record:', e);
              }
            }
          }
        }
      },
      onFinish: async ({ text, steps, usage }) => {
        console.log(`[Finish] text="${text?.substring(0, 200)}", steps=${steps?.length || 0}, tokens=${JSON.stringify(usage)}`);
        if (conversation_id && text) {
          await prisma.message.create({
            data: {
              conversationId: String(conversation_id),
              role: 'assistant',
              content: text,
              agentName: orchestratorName,
              metadata: { swarm_id: String(swarm_id) },
            },
          });
        }

        // Track token usage per user
        if (usage && userId !== 'anonymous') {
          try {
            await (prisma as any).tokenUsage.create({
              data: {
                userId,
                conversationId: conversation_id ? String(conversation_id) : null,
                model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5.4-mini',
                promptTokens: (usage as any).inputTokens || (usage as any).promptTokens || 0,
                completionTokens: (usage as any).outputTokens || (usage as any).completionTokens || 0,
                totalTokens: ((usage as any).inputTokens || (usage as any).promptTokens || 0) + ((usage as any).outputTokens || (usage as any).completionTokens || 0),
              },
            });
          } catch (e) {
            console.error('[TokenUsage] Failed to record:', e);
          }
        }
      }
    });

    return response.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
  }
}
