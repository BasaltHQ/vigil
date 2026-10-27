// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  HeadingLevel,
  UnderlineType,
  BorderStyle,
  AlignmentType,
} from "docx";
import { prisma } from "../db";
import {
  escapeLatexText,
  computeWordDiff,
  buildRedlineLatexFromDiff,
  buildRedlineMarkdownFromDiff,
  DiffSegment,
} from "./latex-helpers";
import {
  getAuthUserProfile,
  allocateNextDisplayId,
  uploadOrSaveDocumentBuffer,
  compileStructuredLatexDocument,
} from "./compile_helper";

/**
 * Helper to build a Microsoft Word (.docx) redline buffer from redlined sections
 */
async function buildRedlineDocxBuffer(
  title: string,
  displayId: string,
  counterpartyName: string,
  negotiationSummary: string,
  processedSections: Array<{
    heading: string;
    risk_severity: string;
    fallback_tier: string;
    rationale: string;
    diffSegments: DiffSegment[];
    stats: { wordsAdded: number; wordsDeleted: number; wordsUnchanged: number; changeRatio: number };
  }>
): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Title Header
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "CONFIDENTIAL COUNSEL REDLINE / TRACK CHANGES",
          bold: true,
          color: "B91C1C",
          size: 20,
        }),
      ],
      spacing: { after: 120 },
    })
  );

  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 120 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Reference ID: ${displayId}  |  Counterparty: ${counterpartyName || "Counterparty"}  |  Date: ${new Date().toISOString().split("T")[0]}`, color: "4B5563", size: 20 }),
      ],
      spacing: { after: 240 },
    })
  );

  if (negotiationSummary) {
    children.push(
      new Paragraph({
        text: "Executive Negotiation Summary",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 120 },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: negotiationSummary, size: 22 })],
        spacing: { after: 240 },
      })
    );
  }

  // Legend
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Legend: ", bold: true, size: 20 }),
        new TextRun({ text: "Deleted Counterparty Language", strike: true, color: "B91C1C", size: 20 }),
        new TextRun({ text: "   |   ", size: 20 }),
        new TextRun({
          text: "Inserted Protective Language",
          underline: { type: UnderlineType.SINGLE, color: "1D4ED8" },
          color: "1D4ED8",
          size: 20,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Sections
  for (const sec of processedSections) {
    children.push(
      new Paragraph({
        text: `${sec.heading} [${sec.risk_severity} RISK — ${sec.fallback_tier}]`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 120 },
      })
    );

    const runs: TextRun[] = sec.diffSegments.map((seg) => {
      if (seg.type === "delete") {
        return new TextRun({
          text: seg.text,
          strike: true,
          color: "B91C1C",
          size: 22,
        });
      }
      if (seg.type === "insert") {
        return new TextRun({
          text: seg.text,
          underline: { type: UnderlineType.SINGLE, color: "1D4ED8" },
          color: "1D4ED8",
          bold: true,
          size: 22,
        });
      }
      return new TextRun({
        text: seg.text,
        size: 22,
      });
    });

    children.push(
      new Paragraph({
        children: runs,
        spacing: { after: 140 },
      })
    );

    if (sec.rationale) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[COUNSEL RATIONALE & PLAYBOOK NOTE]: `,
              bold: true,
              color: "8B0000",
              size: 19,
            }),
            new TextRun({
              text: sec.rationale,
              italics: true,
              color: "374151",
              size: 19,
            }),
          ],
          border: {
            left: { color: "B91C1C", space: 8, style: BorderStyle.SINGLE, size: 12 },
          },
          indent: { left: 240 },
          spacing: { after: 240 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBuffer(doc);
}

export const redlineTools = {
  redline_document: tool({
    description:
      "Perform word-by-word legal contract redlining (track changes / blackline). Computes exact token-level deletions (crimson strikethrough) and insertions (royal blue underline) across contract sections, attaches counsel rationale and risk severity badges, and compiles BOTH a Fortune 50 Redline Comparison PDF and a Microsoft Word (.docx) Redline file.",
    parameters: z.object({
      title: z
        .string()
        .describe("Title of the redlined contract (e.g., 'Master Services Agreement - Counsel Redline')"),
      counterparty_name: z
        .string()
        .optional()
        .describe("Name of the counterparty whose draft is being redlined"),
      negotiation_summary: z
        .string()
        .optional()
        .describe("High-level executive summary of the negotiation posture and key commercial/legal shifts"),
      sections: z
        .array(
          z.object({
            heading: z
              .string()
              .describe("Clause or Section heading (e.g., 'Section 8.1 - Mutual Indemnification')"),
            original_clause: z
              .string()
              .describe("Exact original text of the clause before redlining (leave empty if brand new rider/clause)"),
            proposed_clause: z
              .string()
              .describe("Proposed revised text of the clause after counsel's edits (leave empty if deleting clause in its entirety)"),
            rationale: z
              .string()
              .describe("Legal rationale and playbook justification for this redline"),
            risk_severity: z
              .enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"])
              .default("HIGH")
              .describe("Severity of the legal/commercial risk being mitigated"),
            fallback_tier: z
              .enum(["PRIMARY_POSITION", "COMMERCIAL_COMPROMISE", "WALK_AWAY_DEALBREAKER"])
              .default("PRIMARY_POSITION")
              .describe("Negotiation posture for this revision"),
          })
        )
        .describe("List of contract sections/clauses to redline"),
      export_docx: z
        .boolean()
        .default(true)
        .describe("Whether to also generate a downloadable Microsoft Word (.docx) redline document"),
      signatures: z
        .array(
          z.object({
            entity: z.string().optional(),
            name: z.string(),
            title: z.string(),
          })
        )
        .optional(),
    }),
    execute: async (args: any) => {
      const {
        title,
        counterparty_name = "Counterparty",
        negotiation_summary = "This redline incorporates mandatory risk-mitigation revisions aligned with firm playbook standards.",
        sections = [],
        export_docx = true,
        signatures = [],
      } = args;

      try {
        let totalWordsAdded = 0;
        let totalWordsDeleted = 0;
        let criticalCount = 0;
        let highCount = 0;

        const processedSections = sections.map((sec: any) => {
          const diff = computeWordDiff(sec.original_clause || "", sec.proposed_clause || "");
          totalWordsAdded += diff.stats.wordsAdded;
          totalWordsDeleted += diff.stats.wordsDeleted;
          if (sec.risk_severity === "CRITICAL") criticalCount++;
          if (sec.risk_severity === "HIGH") highCount++;

          return {
            heading: sec.heading,
            original_clause: sec.original_clause || "",
            proposed_clause: sec.proposed_clause || "",
            rationale: sec.rationale || "",
            risk_severity: sec.risk_severity || "HIGH",
            fallback_tier: sec.fallback_tier || "PRIMARY_POSITION",
            diffSegments: diff.segments,
            redlineLatex: buildRedlineLatexFromDiff(diff.segments),
            redlineMarkdown: buildRedlineMarkdownFromDiff(diff.segments),
            stats: diff.stats,
          };
        });

        // Build LaTeX Executive Summary + Redline Sections
        let rawSectionsLatex = `\\section*{Executive Redline Summary}\n`;
        rawSectionsLatex += `\\textbf{Counterparty:} ${escapeLatexText(counterparty_name)} \\quad|\\quad `;
        rawSectionsLatex += `\\textbf{Clauses Redlined:} ${processedSections.length} \\quad|\\quad `;
        rawSectionsLatex += `\\textbf{Critical/High Risks Addressed:} ${criticalCount + highCount} \\quad|\\quad `;
        rawSectionsLatex += `\\textbf{Net Edits:} \\textcolor{RedlineIns}{+${totalWordsAdded} words} / \\textcolor{RedlineDel}{-${totalWordsDeleted} words}\\\\[0.8em]\n`;
        rawSectionsLatex += `${escapeLatexText(negotiation_summary)}\\\\[1.2em]\n`;

        // Summary Matrix Table
        rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}p{1.9in}p{0.85in}p{1.2in}X@{}}\n`;
        rawSectionsLatex += `\\toprule\n`;
        rawSectionsLatex += `\\textbf{Section / Clause} & \\textbf{Risk Level} & \\textbf{Posture} & \\textbf{Primary Counsel Rationale} \\\\\n`;
        rawSectionsLatex += `\\midrule\n`;
        for (const s of processedSections) {
          const riskColor =
            s.risk_severity === "CRITICAL" || s.risk_severity === "HIGH"
              ? "RedlineDel"
              : "BrandPrimary";
          rawSectionsLatex += `${escapeLatexText(s.heading)} & \\textbf{\\textcolor{${riskColor}}{${escapeLatexText(s.risk_severity)}}} & {\\footnotesize ${escapeLatexText(s.fallback_tier.replace(/_/g, " "))}} & {\\footnotesize ${escapeLatexText(s.rationale)}} \\\\[0.4em]\n`;
        }
        rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n\\vspace{1.8em}\n`;

        // Detailed Clause-by-Clause Track Changes
        for (const s of processedSections) {
          const riskColor =
            s.risk_severity === "CRITICAL" || s.risk_severity === "HIGH"
              ? "RedlineDel"
              : "BrandPrimary";
          rawSectionsLatex += `\\section*{${escapeLatexText(s.heading)} \\hfill {\\small\\textcolor{${riskColor}}{[${escapeLatexText(s.risk_severity)} --- ${escapeLatexText(s.fallback_tier.replace(/_/g, " "))}]}}}\n`;
          rawSectionsLatex += `${s.redlineLatex}\\\\[0.6em]\n`;
          if (s.rationale) {
            rawSectionsLatex += `\\noindent\\textbf{\\textcolor{RationaleGray}{[Counsel Note \\& Playbook Justification]:}} {\\itshape\\textcolor{RationaleGray}{${escapeLatexText(s.rationale)}}}\\\\[1.2em]\n`;
          }
        }

        const pdfRes = await compileStructuredLatexDocument({
          title,
          layoutStyle: "redline_comparison",
          rawSectionsLatex,
          signatures,
          documentType: "redline",
          idPrefixOverride: "REDLINE",
          extraMetadata: {
            counterparty_name,
            negotiation_summary,
            redline_stats: {
              clauses_modified: processedSections.length,
              words_added: totalWordsAdded,
              words_deleted: totalWordsDeleted,
              critical_risks: criticalCount,
              high_risks: highCount,
            },
            sections: processedSections.map((s: any) => ({
              heading: s.heading,
              original_clause: s.original_clause,
              proposed_clause: s.proposed_clause,
              rationale: s.rationale,
              risk_severity: s.risk_severity,
              fallback_tier: s.fallback_tier,
              redline_markdown: s.redlineMarkdown,
            })),
          },
        });

        let docxUrl: string | null = null;
        if (export_docx && pdfRes.status === "success") {
          try {
            const { userId } = await getAuthUserProfile();
            const docxBuffer = await buildRedlineDocxBuffer(
              title,
              pdfRes.display_id || "REDLINE-DOCX",
              counterparty_name,
              negotiation_summary,
              processedSections
            );
            const cleanDocxName = `${(pdfRes.display_id || "redline").replace(/[^a-z0-9_-]/gi, "_").toLowerCase()}_track_changes`;
            docxUrl = await uploadOrSaveDocumentBuffer(
              docxBuffer,
              cleanDocxName,
              "docx",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            );

            if (userId && userId !== "anonymous") {
              await (prisma as any).document.create({
                data: {
                  userId,
                  displayId: `${pdfRes.display_id}-DOCX`,
                  title: `${title} (Word Track Changes)`,
                  filePath: docxUrl,
                  fileSize: docxBuffer.length,
                  documentType: "redline",
                  format: "docx",
                  createdBy: "Bannister",
                  metadata: { parentDisplayId: pdfRes.display_id },
                },
              });
            }
          } catch (docxErr) {
            console.error("[Redline DOCX Generation Error]:", docxErr);
          }
        }

        return {
          status: pdfRes.status,
          display_id: pdfRes.display_id,
          pdf_redline_url: pdfRes.file_url,
          docx_redline_url: docxUrl,
          summary_stats: {
            clauses_redlined: processedSections.length,
            words_added: totalWordsAdded,
            words_deleted: totalWordsDeleted,
            critical_risks_mitigated: criticalCount,
            high_risks_mitigated: highCount,
          },
          markdown_redline_preview: processedSections.map((s: any) => ({
            heading: s.heading,
            risk_severity: s.risk_severity,
            fallback_tier: s.fallback_tier,
            diff_markdown: s.redlineMarkdown,
            rationale: s.rationale,
          })),
          message:
            pdfRes.status === "success"
              ? `Redline comparison compiled as ${pdfRes.display_id}. Present these exact links to the user:\n- Track-Changes PDF: [${pdfRes.display_id} - ${title} (Redline PDF)](${pdfRes.file_url})${docxUrl ? `\n- Word Track-Changes (.docx): [${pdfRes.display_id} - ${title} (DOCX)](${docxUrl})` : ""}`
              : pdfRes.error,
        };
      } catch (e: any) {
        return { status: "failed", error: e.message || String(e) };
      }
    },
  }),

  compare_document_versions: tool({
    description:
      "Run a forensic blackline comparison between two document versions (either by their vault display_ids or raw text/sections) to detect all additions, deletions, numerical shifts, and sneaky counterparty modifications, compiling a Blackline Comparison PDF.",
    parameters: z.object({
      comparison_title: z
        .string()
        .describe("Title for the blackline comparison report"),
      base_display_id: z
        .string()
        .optional()
        .describe("Vault displayId of the original/baseline document (e.g., 'VARUNA-2026-0001')"),
      revised_display_id: z
        .string()
        .optional()
        .describe("Vault displayId of the revised/counterparty document (e.g., 'VARUNA-2026-0002')"),
      base_text: z
        .string()
        .optional()
        .describe("Raw text of the original document if not loading from vault"),
      revised_text: z
        .string()
        .optional()
        .describe("Raw text of the revised document if not loading from vault"),
    }),
    execute: async (args: any) => {
      const {
        comparison_title,
        base_display_id,
        revised_display_id,
        base_text,
        revised_text,
      } = args;

      try {
        let baseSections: { heading: string; content: string }[] = [];
        let revSections: { heading: string; content: string }[] = [];

        if (base_display_id) {
          const baseDoc = await (prisma as any).document.findUnique({
            where: { displayId: base_display_id },
          });
          if (baseDoc?.metadata?.sections) {
            baseSections = baseDoc.metadata.sections.map((s: any) => ({
              heading: s.heading || s.title || "Section",
              content: s.content || s.proposed_clause || "",
            }));
          }
        }
        if (revised_display_id) {
          const revDoc = await (prisma as any).document.findUnique({
            where: { displayId: revised_display_id },
          });
          if (revDoc?.metadata?.sections) {
            revSections = revDoc.metadata.sections.map((s: any) => ({
              heading: s.heading || s.title || "Section",
              content: s.content || s.proposed_clause || "",
            }));
          }
        }

        if (baseSections.length === 0 && base_text) {
          baseSections = [{ heading: "Baseline Document Text", content: base_text }];
        }
        if (revSections.length === 0 && revised_text) {
          revSections = [{ heading: "Baseline Document Text", content: revised_text }];
        }

        if (baseSections.length === 0 || revSections.length === 0) {
          return {
            status: "failed",
            error:
              "Provide either valid base_display_id & revised_display_id from the vault or base_text & revised_text.",
          };
        }

        const maxLen = Math.max(baseSections.length, revSections.length);
        let rawSectionsLatex = `\\section*{Forensic Version Comparison Summary}\n`;
        rawSectionsLatex += `\\textbf{Baseline Version:} ${escapeLatexText(base_display_id || "Provided Baseline Text")} \\quad|\\quad `;
        rawSectionsLatex += `\\textbf{Revised Version:} ${escapeLatexText(revised_display_id || "Provided Revised Text")}\\\\[1em]\n`;

        const sectionComparisons = [];
        let totalAdded = 0;
        let totalDeleted = 0;

        for (let i = 0; i < maxLen; i++) {
          const bSec = baseSections[i] || { heading: revSections[i]?.heading || `Section ${i + 1}`, content: "" };
          const rSec = revSections[i] || { heading: bSec.heading, content: "" };
          const heading = rSec.heading || bSec.heading;

          const diff = computeWordDiff(bSec.content, rSec.content);
          totalAdded += diff.stats.wordsAdded;
          totalDeleted += diff.stats.wordsDeleted;

          const hasChanges = diff.stats.wordsAdded > 0 || diff.stats.wordsDeleted > 0;
          rawSectionsLatex += `\\section*{${escapeLatexText(heading)} ${hasChanges ? `\\hfill {\\small\\textcolor{RedlineDel}{[MODIFIED: +${diff.stats.wordsAdded} / -${diff.stats.wordsDeleted} words]}}` : `\\hfill {\\small\\textcolor{BrandSecondary}{[UNCHANGED]}}`}}\n`;
          rawSectionsLatex += `${buildRedlineLatexFromDiff(diff.segments)}\\\\[1em]\n`;

          sectionComparisons.push({
            heading,
            modified: hasChanges,
            words_added: diff.stats.wordsAdded,
            words_deleted: diff.stats.wordsDeleted,
            change_ratio: diff.stats.changeRatio,
            diff_markdown: buildRedlineMarkdownFromDiff(diff.segments),
          });
        }

        const pdfRes = await compileStructuredLatexDocument({
          title: comparison_title,
          layoutStyle: "redline_comparison",
          rawSectionsLatex,
          documentType: "blackline_comparison",
          idPrefixOverride: "BLKLINE",
          extraMetadata: {
            base_display_id,
            revised_display_id,
            total_words_added: totalAdded,
            total_words_deleted: totalDeleted,
            section_comparisons: sectionComparisons,
          },
        });

        return {
          status: pdfRes.status,
          display_id: pdfRes.display_id,
          file_url: pdfRes.file_url,
          total_words_added: totalAdded,
          total_words_deleted: totalDeleted,
          sections_modified: sectionComparisons.filter((s) => s.modified).length,
          section_comparisons: sectionComparisons,
          message: pdfRes.message,
        };
      } catch (e: any) {
        return { status: "failed", error: e.message || String(e) };
      }
    },
  }),

  generate_clean_execution_version: tool({
    description:
      "Take a previously redlined document (by display_id) or a set of negotiated clauses, apply the accepted revisions cleanly (stripping all strikethroughs and counsel notes), and compile a Clean Execution-Ready PDF.",
    parameters: z.object({
      redline_display_id: z
        .string()
        .optional()
        .describe("Display ID of a previously generated redline document (e.g. 'REDLINE-2026-0005')"),
      title: z.string().describe("Official clean title of the execution agreement"),
      layout_style: z
        .enum([
          "modern_dual_column",
          "strict_legal_watermark",
          "corporate_governance",
          "mutual_nda",
          "term_sheet_financial",
          "employment_offer",
          "founder_equity_grid",
          "safe_agreement",
          "ip_assignment",
          "operating_agreement",
          "consulting_agreement",
          "board_resolution",
          "convertible_note",
          "privacy_policy",
        ])
        .default("modern_dual_column"),
      rejected_section_headings: z
        .array(z.string())
        .optional()
        .describe("Optional list of section headings where the proposed redline was REJECTED (reverts those sections to original_clause)"),
      override_sections: z
        .array(
          z.object({
            heading: z.string(),
            content: z.string(),
          })
        )
        .optional()
        .describe("Optional explicit clean sections if not loading from redline_display_id"),
      signatures: z
        .array(
          z.object({
            entity: z.string().optional(),
            name: z.string(),
            title: z.string(),
          })
        )
        .optional(),
    }),
    execute: async (args: any) => {
      const {
        redline_display_id,
        title,
        layout_style = "modern_dual_column",
        rejected_section_headings = [],
        override_sections,
        signatures = [],
      } = args;

      try {
        let cleanSections: { heading: string; content: string }[] = [];

        if (override_sections && override_sections.length > 0) {
          cleanSections = override_sections;
        } else if (redline_display_id) {
          const doc = await (prisma as any).document.findUnique({
            where: { displayId: redline_display_id },
          });
          if (!doc || !doc.metadata?.sections) {
            return {
              status: "failed",
              error: `Redline document '${redline_display_id}' not found or has no structured sections.`,
            };
          }
          const rejectedSet = new Set(
            rejected_section_headings.map((h: string) => h.toLowerCase().trim())
          );
          cleanSections = doc.metadata.sections
            .map((s: any) => {
              const isRejected = rejectedSet.has((s.heading || "").toLowerCase().trim());
              return {
                heading: s.heading,
                content: isRejected
                  ? s.original_clause || s.content || ""
                  : s.proposed_clause || s.content || "",
              };
            })
            .filter((s: any) => s.content.trim().length > 0);
        } else {
          return {
            status: "failed",
            error: "Provide either redline_display_id or override_sections.",
          };
        }

        return await compileStructuredLatexDocument({
          title,
          layoutStyle: layout_style,
          sections: cleanSections,
          signatures,
          documentType: "execution_version",
          extraMetadata: {
            derived_from_redline: redline_display_id || null,
            rejected_section_headings,
          },
        });
      } catch (e: any) {
        return { status: "failed", error: e.message || String(e) };
      }
    },
  }),
};
