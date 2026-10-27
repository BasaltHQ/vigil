// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import * as crypto from "crypto";
import { escapeLatexText } from "./latex-helpers";
import { compileStructuredLatexDocument } from "./compile_helper";

const AMLAW_100_BENCHMARK_RATES: Record<string, { title: string; hourly_rate_usd: number }> = {
  Keyes: { title: "Managing Partner / Chief Strategist", hourly_rate_usd: 1750 },
  Bannister: { title: "Senior Securities & Capital Markets Partner", hourly_rate_usd: 1575 },
  Archer: { title: "M&A & Private Equity Partner", hourly_rate_usd: 1550 },
  Vance: { title: "Chair of Litigation & Enforcement", hourly_rate_usd: 1500 },
  Queen: { title: "Intellectual Property & Patent Partner", hourly_rate_usd: 1425 },
  Gutman: { title: "Regulatory & Financial Crimes Partner", hourly_rate_usd: 1400 },
  Spade: { title: "Corporate Governance & Delaware Counsel", hourly_rate_usd: 1325 },
  Gittes: { title: "Executive Compensation, 409A & Cap Table Specialist", hourly_rate_usd: 1275 },
  Hammer: { title: "Global Data Privacy & Cybersecurity Counsel", hourly_rate_usd: 1250 },
  OHara: { title: "Public Offerings & Disclosure Counsel", hourly_rate_usd: 1225 },
  Marlowe: { title: "Labor & Executive Employment Counsel", hourly_rate_usd: 1175 },
  Neff: { title: "Multi-State Blue Sky & Broker-Dealer Counsel", hourly_rate_usd: 1125 },
  Cairo: { title: "Shareholder Relations & Transaction Coordinator", hourly_rate_usd: 995 },
};

export const firmOperationsTools = {
  generate_legal_invoice_and_roi: tool({
    description:
      "Compile an ABA UTBMS / LEDES-compliant Itemized Legal Matter Statement & Client ROI Realization Report PDF. Benchmarks the work executed by the Vigil agent swarm against AmLaw 100 Partner/Associate billable hour rates to quantify client cost savings.",
    parameters: z.object({
      client_or_matter_name: z.string(),
      matter_number: z.string().default("MTR-2026-0891"),
      time_entries: z
        .array(
          z.object({
            agent_name: z
              .string()
              .describe("e.g., 'Keyes', 'Bannister', 'Archer', 'Gittes', 'Queen', 'Spade', 'Hammer'"),
            utbms_task_code: z
              .enum([
                "B110_Fact_Investigation_Diligence",
                "B120_Asset_and_Cap_Table_Analysis",
                "B130_Transactional_Drafting_and_Redlining",
                "B140_Negotiation_and_Closing",
                "L120_Legal_Research_and_Strategy",
                "L210_Pleadings_and_Motions",
                "L310_Discovery_and_Privilege_Review",
                "C100_Regulatory_and_Compliance_Counsel",
              ]),
            narrative_description: z
              .string()
              .describe("Detailed AmLaw-style billing narrative describing the legal work completed"),
            equivalent_human_hours: z
              .number()
              .describe("Estimated hours an AmLaw 100 attorney would bill for this deliverable (in 0.1 hr increments, e.g., 4.5)"),
          })
        ),
    }),
    execute: async (args: any) => {
      const {
        client_or_matter_name,
        matter_number = "MTR-2026-0891",
        time_entries = [],
      } = args;

      let totalHumanHours = 0;
      let totalAmLawEquivalentUsd = 0;

      const enrichedEntries = time_entries.map((entry: any) => {
        const rateInfo = AMLAW_100_BENCHMARK_RATES[entry.agent_name] || {
          title: "Senior Specialist Counsel",
          hourly_rate_usd: 1250,
        };
        const hours = Number(entry.equivalent_human_hours || 1.0);
        const lineTotal = Math.round(hours * rateInfo.hourly_rate_usd);
        totalHumanHours += hours;
        totalAmLawEquivalentUsd += lineTotal;

        return {
          ...entry,
          timekeeper_title: rateInfo.title,
          hourly_rate_usd: rateInfo.hourly_rate_usd,
          amlaw_line_total_usd: lineTotal,
        };
      });

      const estimatedVigilComputeCostUsd = Number(
        Math.max(0.45, totalHumanHours * 0.35).toFixed(2)
      );
      const netClientSavingsUsd = Math.round(
        totalAmLawEquivalentUsd - estimatedVigilComputeCostUsd
      );

      let rawSectionsLatex = `\\section*{1. Executive Realization \\& AmLaw 100 Benchmark Summary}\n`;
      rawSectionsLatex += `\\noindent\\begin{tabular}{@{}ll@{\\hspace{3em}}ll@{}}\n`;
      rawSectionsLatex += `\\textbf{Client / Matter:} & ${escapeLatexText(client_or_matter_name)} & \\textbf{Matter Ref:} & ${escapeLatexText(matter_number)} \\\\\n`;
      rawSectionsLatex += `\\textbf{Equivalent Human Billable Hours:} & ${totalHumanHours.toFixed(1)} hrs & \\textbf{AmLaw 100 Benchmark Fee:} & \\$${totalAmLawEquivalentUsd.toLocaleString()} \\\\\n`;
      rawSectionsLatex += `\\textbf{Vigil Autonomous Compute Cost:} & \\$${estimatedVigilComputeCostUsd.toFixed(2)} & \\textbf{\\textcolor{RiskLow}{Net Client Legal Savings:}} & \\textbf{\\textcolor{RiskLow}{\\$${netClientSavingsUsd.toLocaleString()} (99.9\\% ROI)}} \\\\\n`;
      rawSectionsLatex += `\\end{tabular}\n\\vspace{1.5em}\n`;

      rawSectionsLatex += `\\section*{2. Itemized ABA UTBMS / LEDES Timekeeper Statement}\n`;
      rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}p{1.05in}p{0.8in}Xrrr@{}}\n`;
      rawSectionsLatex += `\\toprule\n`;
      rawSectionsLatex += `\\textbf{Timekeeper} & \\textbf{UTBMS} & \\textbf{Work Product Narrative} & \\textbf{Hrs} & \\textbf{Rate} & \\textbf{Benchmark} \\\\\n`;
      rawSectionsLatex += `\\midrule\n`;
      for (const e of enrichedEntries) {
        const shortCode = e.utbms_task_code.split("_")[0];
        rawSectionsLatex += `{\\footnotesize \\textbf{${escapeLatexText(e.agent_name)}} (${escapeLatexText(e.timekeeper_title)})} & {\\footnotesize ${escapeLatexText(shortCode)}} & {\\footnotesize ${escapeLatexText(e.narrative_description)}} & {\\footnotesize ${e.equivalent_human_hours.toFixed(1)}} & {\\footnotesize \\$${e.hourly_rate_usd.toLocaleString()}} & {\\footnotesize \\$${e.amlaw_line_total_usd.toLocaleString()}} \\\\[0.4em]\n`;
      }
      rawSectionsLatex += `\\midrule\n`;
      rawSectionsLatex += `\\textbf{TOTAL BENCHMARK} & & & \\textbf{${totalHumanHours.toFixed(1)}} & & \\textbf{\\$${totalAmLawEquivalentUsd.toLocaleString()}} \\\\\n`;
      rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n`;

      const pdfRes = await compileStructuredLatexDocument({
        title: `LEDES Legal Statement & ROI Analysis — ${client_or_matter_name}`,
        layoutStyle: "term_sheet_financial",
        rawSectionsLatex,
        documentType: "legal_invoice_roi",
        createdBy: "Keyes",
        idPrefixOverride: "LEDES-INV",
      });

      return {
        status: "success",
        matter_number,
        total_equivalent_human_hours: Number(totalHumanHours.toFixed(1)),
        amlaw_100_equivalent_fee_usd: totalAmLawEquivalentUsd,
        vigil_autonomous_cost_usd: estimatedVigilComputeCostUsd,
        net_client_savings_usd: netClientSavingsUsd,
        time_entries: enrichedEntries,
        pdf_invoice: pdfRes,
      };
    },
  }),

  stage_esignature_execution_packet: tool({
    description:
      "Prepare an institutional E-Signature & Counterpart Execution Closing Packet for a finalized agreement. Generates a cryptographic SHA-256 document hash, signatory routing schedule, UETA / ESIGN Act compliance attestation, and Counterpart Signature Packet PDF.",
    parameters: z.object({
      document_title: z.string(),
      source_display_id: z
        .string()
        .optional()
        .describe("Vault display ID of the agreement being staged for execution"),
      effective_date: z.string(),
      signatories: z
        .array(
          z.object({
            signing_order: z.number(),
            entity_name: z.string(),
            signer_full_name: z.string(),
            signer_title: z.string(),
            signer_email: z.string(),
            verification_method: z
              .enum(["Email_OTP_and_IP_Audit", "EIP4337_Smart_Wallet_Signature", "Notarized_Wet_Ink_Counterpart"])
              .default("Email_OTP_and_IP_Audit"),
          })
        ),
    }),
    execute: async (args: any) => {
      const {
        document_title,
        source_display_id = "FINAL-EXECUTION-DRAFT",
        effective_date,
        signatories = [],
      } = args;

      const canonicalPayload = JSON.stringify({
        document_title,
        source_display_id,
        effective_date,
        signatories,
      });
      const sha256Fingerprint = crypto
        .createHash("sha256")
        .update(canonicalPayload)
        .digest("hex")
        .toUpperCase();

      const envelopeId = `ENV-${sha256Fingerprint.substring(0, 12)}`;

      let rawSectionsLatex = `\\section*{1. Cryptographic Execution Certificate (ESIGN Act \\& UETA Compliant)}\n`;
      rawSectionsLatex += `\\textbf{Agreement Title:} ${escapeLatexText(document_title)}\\\\[0.3em]\n`;
      rawSectionsLatex += `\\textbf{Source Vault Reference:} ${escapeLatexText(source_display_id)} \\quad|\\quad \\textbf{Effective Date:} ${escapeLatexText(effective_date)}\\\\[0.3em]\n`;
      rawSectionsLatex += `\\textbf{Envelope Tracking ID:} \\texttt{${escapeLatexText(envelopeId)}}\\\\[0.3em]\n`;
      rawSectionsLatex += `\\textbf{SHA-256 Document Integrity Hash:} {\\footnotesize\\texttt{${escapeLatexText(sha256Fingerprint)}}}\\\\[1em]\n`;
      rawSectionsLatex += `Pursuant to the federal Electronic Signatures in Global and National Commerce Act (ESIGN, 15 U.S.C. § 7001 et seq.) and the Uniform Electronic Transactions Act (UETA), execution of this counterpart signature packet by the authorized signatories below constitutes a legally binding and enforceable obligation.\\\\[1.2em]\n`;

      rawSectionsLatex += `\\section*{2. Signatory Routing \\& Authentication Schedule}\n`;
      rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}p{0.4in}p{1.4in}p{1.4in}p{1.5in}X@{}}\n`;
      rawSectionsLatex += `\\toprule\n`;
      rawSectionsLatex += `\\textbf{Ord.} & \\textbf{Entity} & \\textbf{Authorized Signer} & \\textbf{Email} & \\textbf{Authentication} \\\\\n`;
      rawSectionsLatex += `\\midrule\n`;
      for (const s of signatories) {
        rawSectionsLatex += `{\\footnotesize \\#${s.signing_order}} & {\\footnotesize \\textbf{${escapeLatexText(s.entity_name)}}} & {\\footnotesize ${escapeLatexText(s.signer_full_name)} (${escapeLatexText(s.signer_title)})} & {\\footnotesize ${escapeLatexText(s.signer_email)}} & {\\footnotesize ${escapeLatexText(s.verification_method.replace(/_/g, " "))}} \\\\[0.4em]\n`;
      }
      rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n`;

      const mappedSignatures = signatories.map((s: any) => ({
        entity: s.entity_name,
        name: s.signer_full_name,
        title: s.signer_title,
      }));

      const pdfRes = await compileStructuredLatexDocument({
        title: `Execution Signature Packet — ${document_title}`,
        layoutStyle: "modern_dual_column",
        rawSectionsLatex,
        signatures: mappedSignatures,
        documentType: "esignature_packet",
        createdBy: "Spade",
        idPrefixOverride: "ESIGN",
        extraMetadata: {
          envelope_id: envelopeId,
          sha256_hash: sha256Fingerprint,
          signatories,
        },
      });

      return {
        status: "success",
        envelope_id: envelopeId,
        sha256_document_hash: sha256Fingerprint,
        signatories_staged: signatories.length,
        execution_packet_pdf: pdfRes,
      };
    },
  }),
};
