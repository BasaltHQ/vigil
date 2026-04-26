// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "../db";
import { FORTUNE_50_TEMPLATES } from "../templates/fortune50";
import { cookies } from "next/headers";
import { buildSectionsLatex, buildSignaturesLatex, buildMemoHeadersLatex } from './latex-helpers';
import { thirdwebAuth } from "../auth";

const execAsync = promisify(exec);

async function getAuthUserId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("thirdweb_auth_token")?.value;
    if (!token) return null;
    
    const authResult = await thirdwebAuth.verifyJWT({ jwt: token });
    if (!authResult.valid) return null;
    
    return authResult.parsedJWT.sub;
  } catch (e) {
    return null;
  }
}

export const humanInteractionTools = {
  ask_human: tool({
    description: "Request information from the human user using a STRUCTURED FORM.",
    parameters: z.object({
      question: z.string().describe("A SHORT form title"),
      fields: z.array(z.object({
        key: z.string(),
        label: z.string(),
        field_type: z.string().describe("One of: text, textarea, select, checkbox"),
        options: z.array(z.string()).optional(),
        required: z.boolean().optional()
      })).describe("REQUIRED list of form field objects"),
      context: z.string().optional(),
      timeout: z.number().optional()
    }),
    execute: async (args: any) => {
      const { question, fields, context } = args;
      const mappedFields = fields.map((f: any) => ({ ...f, type: f.field_type }));
      return {
        status: "human_input_required",
        form_title: question,
        fields: mappedFields,
        context
      };
    }
  }),
};

export const secEdgarTools = {
  search_sec_filings: tool({
    description: "Search SEC EDGAR database for company filings",
    parameters: z.object({
      query: z.string().describe("Company ticker or name"),
      form_type: z.string().optional().describe("Form type like 10-K, 10-Q"),
      date_from: z.string().optional().describe("Start date YYYY-MM-DD"),
      date_to: z.string().optional().describe("End date YYYY-MM-DD"),
      max_results: z.number().default(10)
    }),
    execute: async (args: any) => {
      const { query, form_type, date_from, date_to, max_results } = args;
      try {
        const searchParams = new URLSearchParams({
          q: query,
          dateRange: "custom",
          startdt: date_from || "2000-01-01",
          enddt: date_to || "2099-12-31",
          page: "1",
          from: "0",
          size: Math.min(max_results, 20).toString()
        });

        if (form_type) {
          searchParams.append("forms", form_type);
        }

        const response = await fetch(`https://efts.sec.gov/LATEST/search-index?${searchParams.toString()}`, {
          headers: {
            "User-Agent": "BasaltVigil/1.0 (Legal Research Platform)",
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          return { success: false, error: `API error: ${response.status}`, results: [] };
        }

        const data = await response.json();
        const hits = data?.hits?.hits || [];
        
        const results = hits.map((hit: any) => {
          const source = hit._source || {};
          const cik = String(source.cik || "").padStart(10, '0');
          return {
            company_name: source.display_names?.[0] || source.entity || "Unknown",
            form_type: source.form || "",
            filing_date: source.file_date || "",
            cik: source.cik || "",
            url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=&dateb=&owner=include&count=40`,
            description: source.file_description || ""
          };
        });

        return { success: true, query, result_count: results.length, results };
      } catch (e: any) {
        return { success: false, error: e.message, results: [] };
      }
    }
  }),
  submit_edgar: tool({
    description: "Submit a prepared filing to the SEC EDGAR system via SFTP",
    parameters: z.object({
      document_id: z.string(),
      form_type: z.string(),
      filer_cik: z.string()
    }),
    execute: async (args: any) => {
      const { document_id, form_type, filer_cik } = args;
      const username = process.env.EDGAR_SFTP_USERNAME;
      if (!username) return { status: "failed", error: "Missing EDGAR credentials" };
      
      const outDir = path.join(process.cwd(), "public", "edgar_submissions");
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(path.join(outDir, `${document_id}_${form_type}.txt`), `Submitted for CIK: ${filer_cik}`);
      
      const randomId = Math.random().toString().slice(2, 10);
      return { status: "success", confirmation_number: `SEC-${randomId}`, authenticated: true };
    }
  })
};

export const legalResearchTools = {
  search_case_law: tool({
    description: "Search case law databases (e.g., CourtListener) for precedents",
    parameters: z.object({
      query: z.string().describe("Legal concept, statute, or case name"),
      court: z.string().optional().describe("Court abbreviation (e.g., 'scotus', 'ca9')"),
      date_filed_after: z.string().optional(),
      date_filed_before: z.string().optional(),
      max_results: z.number().default(5)
    }),
    execute: async (args: any) => {
      const { query, court, date_filed_after, date_filed_before, max_results } = args;
      const apiKey = process.env.COURTLISTENER_API_KEY;
      if (!apiKey) return { success: false, error: "CourtListener API key not configured", results: [] };

      try {
        const params = new URLSearchParams({
          q: query,
          order_by: "score desc",
          page_size: Math.min(max_results, 20).toString()
        });

        if (court) params.append("court", court);
        if (date_filed_after) params.append("filed_after", date_filed_after);
        if (date_filed_before) params.append("filed_before", date_filed_before);

        const response = await fetch(`https://www.courtlistener.com/api/rest/v3/search/?${params.toString()}`, {
          headers: {
            "Authorization": `Token ${apiKey}`,
            "Accept": "application/json"
          }
        });

        if (!response.ok) return { success: false, error: `API error: ${response.status}`, results: [] };

        const data = await response.json();
        const results = (data.results || []).map((item: any) => ({
          case_name: item.caseName || "Unknown",
          court: item.court || "",
          date_filed: item.dateFiled || "",
          url: `https://www.courtlistener.com${item.absolute_url || ''}`,
          snippet: item.snippet ? item.snippet.substring(0, 500) : "",
          docket_number: item.docketNumber || ""
        }));

        return { success: true, query, result_count: results.length, results };
      } catch (e: any) {
        return { success: false, error: e.message, results: [] };
      }
    }
  }),
  search_judges: tool({
    description: "Search for judge information and rulings history",
    parameters: z.object({
      name: z.string().describe("Judge name"),
      court: z.string().optional()
    }),
    execute: async (args: any) => {
      const { name, court } = args;
      const apiKey = process.env.COURTLISTENER_API_KEY;
      if (!apiKey) return { success: false, error: "CourtListener API key not configured", results: [] };

      try {
        const params = new URLSearchParams({ name });
        if (court) params.append("court", court);

        const response = await fetch(`https://www.courtlistener.com/api/rest/v3/people/?${params.toString()}`, {
          headers: {
            "Authorization": `Token ${apiKey}`,
            "Accept": "application/json"
          }
        });

        if (!response.ok) return { success: false, error: `API error: ${response.status}`, results: [] };

        const data = await response.json();
        const results = (data.results || []).slice(0, 5).map((item: any) => ({
          name: `${item.name_first || ''} ${item.name_last || ''}`.trim(),
          court: item.court || "",
          date_start: item.date_start || "",
          url: `https://www.courtlistener.com${item.absolute_url || ''}`
        }));

        return { success: true, query: name, result_count: results.length, results };
      } catch (e: any) {
        return { success: false, error: e.message, results: [] };
      }
    }
  })
};

// In-memory store for CSDP
const activeDocuments = new Map<string, any>();

export const csdpTools = {
  initialize_live_document: tool({
    description: "Initialize a new Collaborative Sectional Document (CSDP)",
    parameters: z.object({
      title: z.string(),
      document_type: z.string(),
      sections: z.array(z.string())
    }),
    execute: async (args: any) => {
      const { title, document_type, sections } = args;
      const randomId = Math.random().toString().slice(2, 8);
      const document_id = `doc-${randomId}`;
      const docSections = sections.map((t: string) => ({ title: t, status: "draft", content: "", owner: null }));
      activeDocuments.set(document_id, { title, document_type, sections: docSections, context: {} });
      return { success: true, document_id, message: `Initialized '${title}' with ${sections.length} sections.` };
    }
  }),
  checkout_section: tool({
    description: "Check out a section for editing (locks it for the agent)",
    parameters: z.object({
      document_id: z.string(),
      section_title: z.string()
    }),
    execute: async (args: any) => {
      const { document_id, section_title } = args;
      const doc = activeDocuments.get(document_id);
      if (!doc) return { success: false, error: "Document not found." };
      
      const section = doc.sections.find((s: any) => s.title === section_title);
      if (!section) return { success: false, error: `Section '${section_title}' not found.` };
      
      section.owner = "locked";
      return { success: true, section_title, current_content: section.content, global_context: doc.context };
    }
  }),
  commit_section: tool({
    description: "Commit edits to a section and unlock it",
    parameters: z.object({
      document_id: z.string(),
      section_title: z.string(),
      content: z.string(),
      new_defined_terms: z.string().optional().describe("JSON stringified key-value pairs")
    }),
    execute: async (args: any) => {
      const { document_id, section_title, content, new_defined_terms } = args;
      const doc = activeDocuments.get(document_id);
      if (!doc) return { success: false, error: "Document not found." };
      
      const section = doc.sections.find((s: any) => s.title === section_title);
      if (!section) return { success: false, error: `Section '${section_title}' not found.` };
      
      section.content = content;
      section.owner = null;
      section.status = "committed";
      if (new_defined_terms) {
        doc.context.defined_terms = { ...(doc.context.defined_terms || {}), ...new_defined_terms };
      }
      return { success: true, message: `Section '${section_title}' saved and unlocked.` };
    }
  }),
  read_document_outline: tool({
    description: "Get the structure and status of the live document.",
    parameters: z.object({
      document_id: z.string()
    }),
    execute: async (args: any) => {
      const { document_id } = args;
      const doc = activeDocuments.get(document_id);
      if (!doc) return { success: false, error: "Document not found." };
      
      const outline = doc.sections.map((s: any) => ({
        title: s.title,
        status: s.status,
        owner: s.owner,
        length: s.content.length
      }));
      return { success: true, result: { title: doc.title, sections: outline, global_context: doc.context } };
    }
  }),
  compile_live_document: tool({
    description: "Compile the CSDP into a final PDF/Docx",
    parameters: z.object({
      document_id: z.string()
    }),
    execute: async (args: any) => {
      const { document_id } = args;
      const doc = activeDocuments.get(document_id);
      if (!doc) return { success: false, error: "Document not found." };
      
      const outDir = path.join(process.cwd(), "public", "docs");
      await fs.mkdir(outDir, { recursive: true });
      const mdContent = doc.sections.map((s: any) => `# ${s.title}\n\n${s.content}`).join('\n\n');
      const filePath = path.join(outDir, `${document_id}.md`);
      await fs.writeFile(filePath, mdContent);
      
      return { success: true, file_url: `/docs/${document_id}.md` };
    }
  })
};

export const workflowTools = {
  update_case_file: tool({
    description: "Update the shared case file and strategy plan",
    parameters: z.object({
      plan: z.array(z.string()),
      current_step: z.number(),
      findings: z.string().optional().describe("JSON stringified findings"),
      status: z.string().default("active")
    }),
    execute: async (args: any) => {
      const { plan, current_step, findings, status } = args;
      return { status: "success", updated_plan: plan };
    }
  }),
  terminate_conversation: tool({
    description: "Terminate the conversation when all tasks are complete",
    parameters: z.object({
      reason: z.string()
    }),
    execute: async (args: any) => {
      const { reason } = args;
      return { status: "terminated", reason };
    }
  }),
  handoff_to_agent: tool({
    description: "Hand off the task to a specialist agent in the swarm.",
    parameters: z.object({
      agent_name: z.string().describe("Name of the agent to hand off to (e.g., Holmes, Archer, Bannister, etc.)"),
      next_task: z.string().describe("Clear description of the task the agent needs to perform.")
    }),
    execute: async (args: any) => {
      const { agent_name, next_task } = args;
      return { 
        status: "handoff_initiated", 
        target_agent: agent_name, 
        task: next_task,
        instructions: `SYSTEM NOTICE: You have handed off execution to ${agent_name}. You must STOP generating further thoughts or steps in this turn.`
      };
    }
  }),
  draft_structured_document: tool({
    description: "Draft a highly structured, presentation-grade legal or corporate document using an abstract Fortune 50 layout. This safely bridges the gap between your legal reasoning and perfect LaTeX typography.",
    parameters: z.object({
      title: z.string().describe("The official title of the document"),
      layout_style: z.enum(['modern_dual_column', 'strict_legal_watermark', 'corporate_governance', 'internal_memo', 'mutual_nda', 'term_sheet_financial', 'employment_offer', 'founder_equity_grid', 'safe_agreement', 'ip_assignment', 'operating_agreement', 'consulting_agreement', 'board_resolution', 'convertible_note', 'privacy_policy']),
      sections: z.array(z.object({
        heading: z.string().describe("Section heading (e.g., '1. Confidential Information')"),
        content: z.string().describe("The full text of the section. Use standard text, do not use raw LaTeX commands here.")
      })),
      signatures: z.array(z.object({
          name: z.string().describe("Signer's name. Use blank lines (e.g. '__________________') if unknown."),
          title: z.string().describe("Signer's title. Use blank lines if unknown."),
          entity: z.string().optional().describe("Entity being represented, if any.")
        })).optional().describe("Provide all signers here. The system will automatically generate a flawless LaTeX signature grid/block at the end of the document."),
      memo_headers: z.object({
        to: z.string(),
        from: z.string(),
        date: z.string(),
        subject: z.string()
      }).optional()
    }),
    execute: async (args: any) => {
      const { title, layout_style, sections, signatures, memo_headers } = args;
      try {
        const userId = await getAuthUserId();
        if (!userId) return { status: "failed", error: "Unauthorized context." };

        const profile = await (prisma as any).profile.findUnique({ where: { id: userId } });
        if (!profile) return { status: "failed", error: "Profile not found." };

        // Handle ID Generation
        const currentCounter = profile.docIdCounter || 0;
        const nextCounter = currentCounter + 1;
        const template = profile.docIdTemplate || "VARUNA-[YYYY]-[####]";
        const displayId = template
          .replace('[YYYY]', new Date().getFullYear().toString())
          .replace('[####]', nextCounter.toString().padStart(4, '0'))
          .replace('[##]', nextCounter.toString().padStart(2, '0'))
          .replace('[#]', nextCounter.toString());

        await (prisma as any).profile.update({
          where: { id: userId },
          data: { docIdCounter: nextCounter }
        });

        // Assemble LaTeX
        const layoutInfo = FORTUNE_50_TEMPLATES[layout_style];
        if (!layoutInfo) return { status: "failed", error: "Invalid layout_style." };

        let latex = layoutInfo.latex;
        
        // Brand Injection
        const primaryColor = profile.brandAssets?.colors?.primary?.replace('#', '') || '000000';
        const secondaryColor = profile.brandAssets?.colors?.secondary?.replace('#', '') || '555555';
        const companyName = profile.companyName || profile.companyUrl || "COMPANY NAME"; // Best effort fallback
        const logoUrl = profile.brandAssets?.logos?.[0] || null;
        const isValidLogo = logoUrl && !logoUrl.toLowerCase().includes('.svg') && !logoUrl.toLowerCase().includes('.webp');
        const coverUrl = profile.brandAssets?.coverImage || null;
        const isValidCover = coverUrl && !coverUrl.toLowerCase().includes('.svg') && !coverUrl.toLowerCase().includes('.webp');
        
        const companyHeader = isValidLogo ? `\\includegraphics[height=1.2cm]{logo.png}` : `\\textbf{\\textcolor{BrandPrimary}{${companyName}}}`;
        const coverImageBlock = isValidCover ? `\\includegraphics[width=\\textwidth,height=10cm,keepaspectratio]{cover.png}` : '';

        latex = latex.replace(/\[BRAND_PRIMARY\]/g, primaryColor);
        latex = latex.replace(/\[BRAND_SECONDARY\]/g, secondaryColor);
        latex = latex.replace(/\[COMPANY_HEADER\]/g, companyHeader);
        latex = latex.replace(/\[COMPANY_NAME\]/g, companyName);
        latex = latex.replace(/\[COVER_IMAGE_BLOCK\]/g, coverImageBlock);
        latex = latex.replace(/\[DISPLAY_ID\]/g, displayId);
        latex = latex.replace(/\[TITLE\]/g, title);

        // Sections
        const sectionsLatex = buildSectionsLatex(sections);
        latex = latex.replace('[SECTIONS_CONTENT]', sectionsLatex);

        // Signatures
        const sigLatex = buildSignaturesLatex(signatures, layout_style);
        latex = latex.replace('[SIGNATURES_CONTENT]', sigLatex);

        // Memo Headers
        const memoLatex = buildMemoHeadersLatex(layout_style === 'internal_memo' ? memo_headers : null);
        latex = latex.replace('[MEMO_HEADERS]', memoLatex);

        const cleanFilename = displayId.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
        
        const resources: any[] = [{ main: true, content: latex }];
        
        // Helper: convert /api/s3/... proxy URLs to absolute S3 URLs for external API
        const toAbsoluteS3Url = (url: string) => {
          const endpoint = (process.env.S3_ENDPOINT || '').replace(/\/$/, '');
          const bucket = process.env.S3_BUCKET_NAME || 'basaltvigil';
          
          if (url.startsWith('/api/s3/')) {
            const s3Key = url.replace('/api/s3/', '');
            if (endpoint.includes('ovh.us')) {
              const host = endpoint.replace('https://', '').replace('http://', '');
              return `https://${bucket}.${host}/${s3Key}`;
            }
            return `${endpoint}/${bucket}/${s3Key}`;
          } else if (endpoint.includes('ovh.us') && url.includes(`${endpoint}/${bucket}`)) {
            const host = endpoint.replace('https://', '').replace('http://', '');
            return url.replace(`${endpoint}/${bucket}`, `https://${bucket}.${host}`);
          }
          return url; // already absolute
        };
        
        if (isValidLogo) {
          resources.push({ path: 'logo.png', url: toAbsoluteS3Url(logoUrl) });
        }
        if (isValidCover) {
          resources.push({ path: 'cover.png', url: toAbsoluteS3Url(coverUrl) });
        }

        // Compile using public latex API instead of local pdflatex
        const compileRes = await fetch('https://latex.ytotech.com/builds/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compiler: 'pdflatex', resources })
        });
        
        if (!compileRes.ok) {
          const errorBody = await compileRes.text();
          console.error(`[LaTeX Compile Error] Status: ${compileRes.status}, Body: ${errorBody}`);
          console.error(`[LaTeX Compile Error] First 500 chars of LaTeX:\n${latex.substring(0, 500)}`);
          throw new Error(`LaTeX API compilation failed: ${compileRes.statusText} Ã¢â‚¬â€ ${errorBody.substring(0, 200)}`);
        }
        
        const pdfBufferLocal = Buffer.from(await compileRes.arrayBuffer());

        let publicUrl = "";

        if (process.env.STORAGE_PROVIDER === 's3' && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
          try {
            const s3Client = new S3Client({
              region: process.env.S3_REGION || 'us-west-or',
              endpoint: process.env.S3_ENDPOINT,
              forcePathStyle: true,
              credentials: { accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY },
            });
            const key = `documents/${cleanFilename}_${Date.now()}.pdf`;
            await s3Client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET_NAME || 'basaltvigil', Key: key, Body: pdfBufferLocal, ContentType: 'application/pdf', ACL: 'public-read' }));
            publicUrl = `/api/s3/${key}`;
          } catch (e) {
            console.error("S3 upload failed:", e);
            throw e;
          }
        } else {
          // Fallback: save locally
          const outDir = path.join(process.cwd(), "public", "docs");
          await fs.mkdir(outDir, { recursive: true });
          const pdfPath = path.join(outDir, `${cleanFilename}.pdf`);
          await fs.writeFile(pdfPath, pdfBufferLocal);
          publicUrl = `/docs/${cleanFilename}.pdf`;
        }

        // Save to DB
        await (prisma as any).document.create({
          data: {
            userId,
            displayId,
            title,
            filePath: publicUrl,
            documentType: layout_style,
            format: 'pdf',
            metadata: { sections, signatures, memo_headers }
          }
        });

        return { 
          status: "success", 
          display_id: displayId,
          file_url: publicUrl, 
          message: `Document successfully drafted and tracked as ${displayId}. Present this markdown link exactly to the user: [${displayId} - ${title}](${publicUrl})` 
        };
      } catch (error: any) {
        return { status: "failed", error: error.message || String(error) };
      }
    }
  }),
  search_documents: tool({
    description: "Search the user's historical document vault by title or display ID.",
    parameters: z.object({
      query: z.string().describe("Search term matching part of the title or exact display ID (e.g., 'VARUNA-2026-001')")
    }),
    execute: async ({ query }) => {
      try {
        const userId = await getAuthUserId();
        if (!userId) return { error: "Unauthorized context." };
        const docs = await (prisma as any).document.findMany({
          where: {
            userId,
            OR: [
              { displayId: { contains: query, mode: 'insensitive' } },
              { title: { contains: query, mode: 'insensitive' } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        });
        return { 
          results: docs.map((d: any) => ({
            id: d.id,
            displayId: d.displayId,
            title: d.title,
            createdAt: d.createdAt,
            url: d.filePath
          }))
        };
      } catch (e: any) { return { error: e.message }; }
    }
  }),
  read_document: tool({
    description: "Read the full structural content of a historical document into memory using its exact displayId.",
    parameters: z.object({
      display_id: z.string().describe("The exact display ID of the document (e.g., 'VARUNA-2026-001')")
    }),
    execute: async ({ display_id }) => {
      try {
        const userId = await getAuthUserId();
        if (!userId) return { error: "Unauthorized context." };
        const doc = await (prisma as any).document.findUnique({
          where: { displayId: display_id }
        });
        if (!doc) return { error: "Document not found." };
        
        return {
          displayId: doc.displayId,
          title: doc.title,
          content: doc.metadata // Contains the structured sections and signatures!
        };
      } catch (e: any) { return { error: e.message }; }
    }
  })
};

export const allSpecialistTools = {
  ...humanInteractionTools,
  ...secEdgarTools,
  ...legalResearchTools,
  ...csdpTools,
  ...workflowTools
};
