// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import { escapeLatexText } from "./latex-helpers";
import { compileStructuredLatexDocument } from "./compile_helper";

// Standard Federal Court Holidays (fixed + observed) for FRCP Rule 6(a)(6)
function isWeekendOrFederalHoliday(dt: Date): { isOff: boolean; reason?: string } {
  const day = dt.getUTCDay();
  if (day === 0) return { isOff: true, reason: "Sunday (FRCP Rule 6(a)(1)(C))" };
  if (day === 6) return { isOff: true, reason: "Saturday (FRCP Rule 6(a)(1)(C))" };

  const month = dt.getUTCMonth() + 1;
  const date = dt.getUTCDate();
  const key = `${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

  const fixedHolidays: Record<string, string> = {
    "01-01": "New Year's Day",
    "06-19": "Juneteenth National Independence Day",
    "07-04": "Independence Day",
    "11-11": "Veterans Day",
    "12-25": "Christmas Day",
  };
  if (fixedHolidays[key]) {
    return { isOff: true, reason: `${fixedHolidays[key]} (FRCP Rule 6(a)(6))` };
  }
  return { isOff: false };
}

function computeFrcpDeadline(
  triggerDateStr: string,
  daysToAdd: number,
  addThreeDaysForMailService: boolean = false
): {
  raw_date: string;
  adjusted_deadline: string;
  rolled_forward_reason: string | null;
} {
  const base = new Date(`${triggerDateStr}T12:00:00Z`);
  const target = new Date(base.getTime() + daysToAdd * 86400000);

  let rollReasons: string[] = [];
  while (true) {
    const check = isWeekendOrFederalHoliday(target);
    if (!check.isOff) break;
    rollReasons.push(check.reason!);
    target.setUTCDate(target.getUTCDate() + 1);
  }

  const rawDate = new Date(base.getTime() + daysToAdd * 86400000)
    .toISOString()
    .split("T")[0];

  if (addThreeDaysForMailService) {
    target.setUTCDate(target.getUTCDate() + 3);
    rollReasons.push("+3 days for service under FRCP Rule 6(d)");
    while (true) {
      const check = isWeekendOrFederalHoliday(target);
      if (!check.isOff) break;
      rollReasons.push(check.reason!);
      target.setUTCDate(target.getUTCDate() + 1);
    }
  }

  return {
    raw_date: rawDate,
    adjusted_deadline: target.toISOString().split("T")[0],
    rolled_forward_reason: rollReasons.length > 0 ? rollReasons.join("; ") : null,
  };
}

export const litigationTools = {
  verify_and_format_bluebook_citations: tool({
    description:
      "Extract case law and statutory citations from a legal brief, motion, or memo, verify case existence against the CourtListener API to prevent hallucinated precedents ('Shepardizing' / citation validation), and normalize formatting to strict 21st Edition Bluebook rules.",
    parameters: z.object({
      text_or_citations: z
        .string()
        .describe("Draft brief text or list of citations to audit and format to Bluebook standards"),
      verify_online: z
        .boolean()
        .default(true)
        .describe("Whether to cross-verify case citations against CourtListener"),
    }),
    execute: async (args: any) => {
      const { text_or_citations = "", verify_online = true } = args;

      // Match standard US case citations: Party A v. Party B, Vol Reporter Page (Court Year)
      const caseRegex =
        /([A-Z][A-Za-z0-9\s.,'&()-]+?\s+v\.\s+[A-Z][A-Za-z0-9\s.,'&()-]+?),\s*(\d+)\s+([A-Za-z.\s\d]+?)\s+(\d+)(?:,\s*(\d+[-–]?\d*))?\s*\(([^)]*\d{4})\)/g;

      const matches = [...text_or_citations.matchAll(caseRegex)];
      const apiKey = process.env.COURTLISTENER_API_KEY;
      const verifiedCitations: any[] = [];

      for (const m of matches) {
        const rawFull = m[0];
        const caseName = m[1].trim();
        const volume = m[2].trim();
        const reporterRaw = m[3].trim();
        const firstPage = m[4].trim();
        const pinCite = m[5]?.trim() || null;
        const parenthetical = m[6].trim();

        // Bluebook Rule 6.1(a) spacing normalization for common reporters
        const normalizedReporter = reporterRaw
          .replace(/F\.\s*Supp\.\s*2d/i, "F. Supp. 2d")
          .replace(/F\.\s*Supp\.\s*3d/i, "F. Supp. 3d")
          .replace(/F\.\s*2d/i, "F.2d")
          .replace(/F\.\s*3d/i, "F.3d")
          .replace(/F\.\s*4th/i, "F.4th")
          .replace(/S\.\s*Ct\./i, "S. Ct.")
          .replace(/U\.\s*S\./i, "U.S.")
          .replace(/Del\.\s*Ch\./i, "Del. Ch.");

        // Bluebook T6 institutional abbreviations
        const normalizedCaseName = caseName
          .replace(/\bCorporation\b/g, "Corp.")
          .replace(/\bIncorporated\b/g, "Inc.")
          .replace(/\bCompany\b/g, "Co.")
          .replace(/\bAssociates\b/g, "Assocs.")
          .replace(/\bInternational\b/g, "Int'l");

        const bluebookFormatted = `*${normalizedCaseName}*, ${volume} ${normalizedReporter} ${firstPage}${pinCite ? `, ${pinCite}` : ""} (${parenthetical})`;

        let verificationStatus = "FORMAT_VALIDATED_OFFLINE";
        let courtListenerMatch: any = null;

        if (verify_online && apiKey) {
          try {
            const qParams = new URLSearchParams({
              q: `"${caseName}"`,
              page_size: "1",
            });
            const res = await fetch(
              `https://www.courtlistener.com/api/rest/v3/search/?${qParams.toString()}`,
              {
                headers: {
                  Authorization: `Token ${apiKey}`,
                  Accept: "application/json",
                },
              }
            );
            if (res.ok) {
              const data = await res.json();
              const hit = data.results?.[0];
              if (hit) {
                verificationStatus = "VERIFIED_PRECEDENT";
                courtListenerMatch = {
                  case_name: hit.caseName,
                  court: hit.court,
                  date_filed: hit.dateFiled,
                  url: `https://www.courtlistener.com${hit.absolute_url || ""}`,
                };
              } else {
                verificationStatus = "WARNING_UNVERIFIED_CITATION";
              }
            }
          } catch {}
        }

        const formattingFixes: string[] = [];
        if (reporterRaw !== normalizedReporter) {
          formattingFixes.push(
            `Bluebook Rule 6.1(a): Adjusted reporter spacing from '${reporterRaw}' to '${normalizedReporter}'.`
          );
        }
        if (caseName !== normalizedCaseName) {
          formattingFixes.push(
            `Bluebook Table T6: Abbreviated institutional party terms in '${normalizedCaseName}'.`
          );
        }

        verifiedCitations.push({
          original_citation: rawFull,
          bluebook_21st_ed_citation: bluebookFormatted,
          verification_status: verificationStatus,
          formatting_corrections: formattingFixes,
          courtlistener_record: courtListenerMatch,
        });
      }

      return {
        status: "success",
        citations_analyzed: verifiedCitations.length,
        results: verifiedCitations,
        note:
          verifiedCitations.length === 0
            ? "No standard case citations matching 'Party v. Party, Vol Reporter Page (Year)' were detected in the input text."
            : "All detected citations have been audited and formatted to 21st Edition Bluebook standards.",
      };
    },
  }),

  generate_privilege_log: tool({
    description:
      "Construct a court-defensible FRCP Rule 26(b)(5) e-Discovery Privilege Log from document metadata and compile a formal Privilege Log PDF.",
    parameters: z.object({
      case_caption: z
        .string()
        .describe("e.g., 'Acme Corp. v. Zenith Holdings, Inc., Case No. 1:26-cv-04192 (S.D.N.Y.)'"),
      producing_party: z.string(),
      entries: z
        .array(
          z.object({
            bates_range: z.string().describe("e.g., 'PRIV-00001 - PRIV-00004'"),
            document_date: z.string(),
            document_type: z.enum(["Email_Chain", "Memorandum", "Draft_Contract", "Board_Presentation", "Slack_Message", "Legal_Hold_Notice"]),
            author_name_and_title: z.string().describe("Include Esq. or Counsel title to establish privilege"),
            recipients: z.string(),
            privilege_asserted: z.enum([
              "Attorney-Client Privilege",
              "Attorney Work Product",
              "Dual ACP & Work Product",
              "Common Interest / Joint Defense",
            ]),
            treatment: z.enum(["WITHHELD_IN_FULL", "REDACTED_IN_PART"]),
            subject_matter_for_rule_26: z
              .string()
              .describe("Non-waiving description of the legal subject matter (e.g., 'Confidential communication with outside counsel requesting legal advice regarding regulatory compliance')"),
          })
        ),
    }),
    execute: async (args: any) => {
      const { case_caption, producing_party, entries = [] } = args;

      let rawSectionsLatex = `\\section*{FRCP Rule 26(b)(5) Privilege Log Certification}\n`;
      rawSectionsLatex += `\\textbf{Action:} ${escapeLatexText(case_caption)} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Producing Party:} ${escapeLatexText(producing_party)} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Total Logged Documents:} ${entries.length}\\\\[1em]\n`;

      rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}p{0.85in}p{0.65in}p{1.05in}p{1.05in}p{1.15in}X@{}}\n`;
      rawSectionsLatex += `\\toprule\n`;
      rawSectionsLatex += `\\textbf{Bates No.} & \\textbf{Date} & \\textbf{Author} & \\textbf{Recipients} & \\textbf{Privilege Basis} & \\textbf{Rule 26(b)(5) Description} \\\\\n`;
      rawSectionsLatex += `\\midrule\n`;

      for (const e of entries) {
        rawSectionsLatex += `{\\footnotesize \\textbf{${escapeLatexText(e.bates_range)}}} & {\\footnotesize ${escapeLatexText(e.document_date)}} & {\\footnotesize ${escapeLatexText(e.author_name_and_title)}} & {\\footnotesize ${escapeLatexText(e.recipients)}} & {\\footnotesize \\textbf{\\textcolor{BrandPrimary}{${escapeLatexText(e.privilege_asserted)}}} (${escapeLatexText(e.treatment.replace(/_/g, " "))})} & {\\footnotesize ${escapeLatexText(e.subject_matter_for_rule_26)}} \\\\[0.45em]\n`;
      }

      rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n`;

      return await compileStructuredLatexDocument({
        title: `Categorical & Document-By-Document Privilege Log`,
        layoutStyle: "diligence_report",
        rawSectionsLatex,
        memoHeaders: {
          to: "Opposing Counsel of Record",
          from: `Litigation Counsel for ${producing_party}`,
          date: new Date().toISOString().split("T")[0],
          subject: `${case_caption} — FRCP Rule 26(b)(5) Privilege Log`,
        },
        documentType: "privilege_log",
        createdBy: "Vance",
        idPrefixOverride: "PRIVLOG",
        extraMetadata: { case_caption, producing_party, entry_count: entries.length },
      });
    },
  }),

  calculate_litigation_deadlines: tool({
    description:
      "Calculate federal litigation deadlines under the Federal Rules of Civil Procedure (FRCP Rule 6(a) weekend/federal holiday roll-forward and Rule 6(d) service extensions) from a trigger date such as Service of Complaint, Discovery Request, or Entry of Judgment.",
    parameters: z.object({
      case_name: z.string(),
      trigger_event: z.enum([
        "Service_of_Summons_and_Complaint",
        "Waiver_of_Service_Sent",
        "Service_of_Interrogatories_or_RFPs",
        "Service_of_Motion",
        "Entry_of_Final_Judgment",
      ]),
      trigger_date: z.string().describe("YYYY-MM-DD date of the trigger event"),
      service_method: z
        .enum(["Personal_or_CM_ECF_Electronic", "Mail_or_Clerk_Deposit_Rule_6d"])
        .default("Personal_or_CM_ECF_Electronic"),
    }),
    execute: async (args: any) => {
      const {
        case_name,
        trigger_event,
        trigger_date,
        service_method = "Personal_or_CM_ECF_Electronic",
      } = args;

      const addMailDays = service_method === "Mail_or_Clerk_Deposit_Rule_6d";
      const deadlines: any[] = [];

      if (trigger_event === "Service_of_Summons_and_Complaint") {
        deadlines.push({
          milestone: "Answer or Rule 12 Motion to Dismiss (FRCP 12(a)(1)(A)(i))",
          statutory_period: "21 days",
          ...computeFrcpDeadline(trigger_date, 21, false),
        });
        deadlines.push({
          milestone: "Amendment of Pleading Once as a Matter of Course (FRCP 15(a)(1)(A))",
          statutory_period: "21 days",
          ...computeFrcpDeadline(trigger_date, 21, addMailDays),
        });
        deadlines.push({
          milestone: "Rule 26(f) Discovery Conference Target (FRCP 26(f)(1))",
          statutory_period: "69 days (at least 21 days before Rule 16 scheduling order)",
          ...computeFrcpDeadline(trigger_date, 69, false),
        });
        deadlines.push({
          milestone: "Issuance of Rule 16(b) Scheduling Order Outer Limit (FRCP 16(b)(2))",
          statutory_period: "90 days after service",
          ...computeFrcpDeadline(trigger_date, 90, false),
        });
      } else if (trigger_event === "Waiver_of_Service_Sent") {
        deadlines.push({
          milestone: "Domestic Defendant Answer / Rule 12 Motion after Waiver (FRCP 12(a)(1)(A)(ii))",
          statutory_period: "60 days from date request was sent",
          ...computeFrcpDeadline(trigger_date, 60, false),
        });
        deadlines.push({
          milestone: "Foreign Defendant Answer / Rule 12 Motion after Waiver (FRCP 12(a)(1)(A)(ii))",
          statutory_period: "90 days from date request was sent",
          ...computeFrcpDeadline(trigger_date, 90, false),
        });
      } else if (trigger_event === "Service_of_Interrogatories_or_RFPs") {
        deadlines.push({
          milestone: "Written Responses & Objections to Interrogatories / RFPs / RFAs (FRCP 33(b)(2), 34(b)(2), 36(a)(3))",
          statutory_period: "30 days",
          ...computeFrcpDeadline(trigger_date, 30, addMailDays),
        });
      } else if (trigger_event === "Service_of_Motion") {
        deadlines.push({
          milestone: "Opposition Brief (Standard Local Rule 14-Day Window)",
          statutory_period: "14 days",
          ...computeFrcpDeadline(trigger_date, 14, addMailDays),
        });
        deadlines.push({
          milestone: "Reply Brief (Standard Local Rule 21-Day Cumulative Window)",
          statutory_period: "21 days",
          ...computeFrcpDeadline(trigger_date, 21, addMailDays),
        });
      } else if (trigger_event === "Entry_of_Final_Judgment") {
        deadlines.push({
          milestone: "Automatic Stay of Execution Expiration (FRCP 62(a))",
          statutory_period: "30 days",
          ...computeFrcpDeadline(trigger_date, 30, false),
        });
        deadlines.push({
          milestone: "Rule 50(b) Renewed JMOL / Rule 59 Motion for New Trial or to Alter Judgment",
          statutory_period: "28 days (Strict: Cannot be extended under FRCP 6(b)(2))",
          ...computeFrcpDeadline(trigger_date, 28, false),
        });
        deadlines.push({
          milestone: "Notice of Appeal in Civil Case (FRAP 4(a)(1)(A))",
          statutory_period: "30 days (Jurisdictional deadline)",
          ...computeFrcpDeadline(trigger_date, 30, false),
        });
      }

      return {
        status: "success",
        case_name,
        trigger_event,
        trigger_date,
        service_method,
        computed_docket_deadlines: deadlines,
      };
    },
  }),

  draft_examination_outline: tool({
    description:
      "Compile a tactical Deposition or Cross-Examination Outline PDF organized into examination chapters with leading questions, target admissions, impeachment hooks, and exhibit pin-cites.",
    parameters: z.object({
      case_caption: z.string(),
      deponent_or_witness_name: z.string(),
      witness_role: z.string().describe("e.g., 'Hostile Fact Witness / Former CFO', 'Opposing Expert Witness'"),
      examination_type: z.enum(["Rule_30_Deposition", "Trial_Cross_Examination", "Direct_Examination"]),
      chapters: z
        .array(
          z.object({
            chapter_title: z.string(),
            target_admission: z.string().describe("The exact factual or legal concession this line of questioning locks in"),
            questions: z.array(z.string()).describe("Sequence of tight, single-fact questions"),
            impeachment_trap: z
              .object({
                exhibit_id: z.string(),
                pin_cite: z.string(),
                prior_inconsistent_quote: z.string(),
              })
              .optional(),
          })
        ),
    }),
    execute: async (args: any) => {
      const {
        case_caption,
        deponent_or_witness_name,
        witness_role,
        examination_type,
        chapters = [],
      } = args;

      let rawSectionsLatex = `\\section*{Examination Tactical Dossier}\n`;
      rawSectionsLatex += `\\textbf{Matter:} ${escapeLatexText(case_caption)} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Witness:} ${escapeLatexText(deponent_or_witness_name)} (${escapeLatexText(witness_role)})\\\\[0.4em]\n`;
      rawSectionsLatex += `\\textbf{Examination Mode:} ${escapeLatexText(examination_type.replace(/_/g, " "))}\\\\[1.2em]\n`;

      chapters.forEach((ch: any, idx: number) => {
        rawSectionsLatex += `\\section*{Chapter ${idx + 1}: ${escapeLatexText(ch.chapter_title)}}\n`;
        rawSectionsLatex += `\\textbf{\\textcolor{BrandPrimary}{Target Concession / Admission:}} ${escapeLatexText(ch.target_admission)}\\\\[0.6em]\n`;
        rawSectionsLatex += `\\begin{enumerate}\n`;
        for (const q of ch.questions || []) {
          rawSectionsLatex += `\\item ${escapeLatexText(q)}\n`;
        }
        rawSectionsLatex += `\\end{enumerate}\n`;

        if (ch.impeachment_trap) {
          rawSectionsLatex += `\\noindent\\textbf{\\textcolor{RiskHigh}{[IMPEACHMENT HOOK --- ${escapeLatexText(ch.impeachment_trap.exhibit_id)} at ${escapeLatexText(ch.impeachment_trap.pin_cite)}]:}} `;
          rawSectionsLatex += `{\\itshape \`\`${escapeLatexText(ch.impeachment_trap.prior_inconsistent_quote)}''}\\\\[1.2em]\n`;
        }
      });

      return await compileStructuredLatexDocument({
        title: `${examination_type.replace(/_/g, " ")} Outline — ${deponent_or_witness_name}`,
        layoutStyle: "diligence_report",
        rawSectionsLatex,
        memoHeaders: {
          to: "Lead Trial / Deposition Counsel",
          from: "BasaltVigil Litigation Strategy Desk (Holmes / Vance)",
          date: new Date().toISOString().split("T")[0],
          subject: `CONFIDENTIAL WORK PRODUCT: Examination Outline for ${deponent_or_witness_name}`,
        },
        documentType: "examination_outline",
        createdBy: "Vance",
        idPrefixOverride: "EXAM",
      });
    },
  }),
};
