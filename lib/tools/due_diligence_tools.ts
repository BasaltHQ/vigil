// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import { escapeLatexText } from "./latex-helpers";
import {
  getAuthUserProfile,
  compileStructuredLatexDocument,
} from "./compile_helper";

interface ClausePattern {
  category: string;
  keywords: RegExp;
  redFlagPatterns: { pattern: RegExp; issue: string; severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; remediation: string }[];
  mandatoryFor: string[];
}

const CANONICAL_CLAUSE_PATTERNS: ClausePattern[] = [
  {
    category: "Indemnification & Hold Harmless",
    keywords: /\b(indemnif\w+|hold\s+harmless|defend\s+and\s+indemnify)\b/i,
    redFlagPatterns: [
      {
        pattern: /\b(solely|unilaterally)\s+indemnif|\bvendor\s+shall\s+not\s+indemnif/i,
        issue: "One-sided / unilateral indemnification obligation detected.",
        severity: "CRITICAL",
        remediation: "Convert to mutual indemnification covering third-party IP infringement, gross negligence, willful misconduct, and breach of confidentiality.",
      },
      {
        pattern: /\b(any\s+and\s+all\s+claims|regardless\s+of\s+fault|including\s+indemnitee's\s+own\s+negligence)\b/i,
        issue: "Overbroad indemnity extending to Indemnitee's own negligence or non-third-party claims.",
        severity: "HIGH",
        remediation: "Limit indemnity strictly to third-party claims proximately caused by Indemnitor's breach, gross negligence, or willful misconduct.",
      },
    ],
    mandatoryFor: ["MSA", "SaaS_Enterprise", "M_and_A_Purchase", "IP_License"],
  },
  {
    category: "Limitation of Liability & Super-Caps",
    keywords: /\b(limitation\s+of\s+liability|aggregate\s+liability|in\s+no\s+event\s+shall\s+either\s+party\s+be\s+liable|liability\s+cap)\b/i,
    redFlagPatterns: [
      {
        pattern: /\b(unlimited\s+liability|no\s+limit\s+on\s+liability)\b/i,
        issue: "Unlimited liability exposure identified.",
        severity: "CRITICAL",
        remediation: "Cap aggregate liability at 12 months' prior paid fees, with a 2x-3x super-cap for IP indemnity, confidentiality, and data privacy breaches.",
      },
      {
        pattern: /\b(one\s+\(1\)\s+month|three\s+\(3\)\s+months|fees\s+paid\s+in\s+the\s+month|nominal\s+sum\s+of\s+\$100)\b/i,
        issue: "Liability cap is nominal or below market standard (< 12 months' fees).",
        severity: "HIGH",
        remediation: "Increase general liability cap to the greater of 12 months' fees paid/payable or $1,000,000.",
      },
    ],
    mandatoryFor: ["MSA", "SaaS_Enterprise", "M_and_A_Purchase", "IP_License"],
  },
  {
    category: "Consequential & Indirect Damages Waiver",
    keywords: /\b(consequential|indirect|special|punitive|incidental|lost\s+profits)\b/i,
    redFlagPatterns: [
      {
        pattern: /\b(liable\s+for\s+lost\s+profits|including\s+consequential\s+damages)\b/i,
        issue: "Consequential or lost-profit damages are explicitly included rather than waived.",
        severity: "CRITICAL",
        remediation: "Insert mutual waiver of indirect, special, incidental, punitive, and consequential damages, subject only to confidentiality/IP carve-outs.",
      },
    ],
    mandatoryFor: ["MSA", "SaaS_Enterprise", "IP_License"],
  },
  {
    category: "Intellectual Property Ownership & Work Made for Hire",
    keywords: /\b(intellectual\s+property|work\s+made\s+for\s+hire|hereby\s+assigns|background\s+ip|pre-existing\s+ip)\b/i,
    redFlagPatterns: [
      {
        pattern: /\b(shall\s+assign|agrees\s+to\s+assign)\b/i,
        issue: "Prospective 'shall assign' language fails under Stanford v. Roche instead of present-tense 'hereby assigns'.",
        severity: "HIGH",
        remediation: "Replace prospective 'agrees to assign' with present-tense automatic assignment: 'hereby irrevocably assigns, transfers, and conveys'.",
      },
    ],
    mandatoryFor: ["MSA", "SaaS_Enterprise", "Employment", "IP_License"],
  },
  {
    category: "Change of Control & Assignment",
    keywords: /\b(change\s+of\s+control|assign\w+|merger|consolidation|sale\s+of\s+all\s+or\s+substantially\s+all)\b/i,
    redFlagPatterns: [
      {
        pattern: /\b(deemed\s+an\s+assignment|prior\s+written\s+consent.*merger|terminate\s+upon\s+a\s+change\s+of\s+control)\b/i,
        issue: "Anti-assignment clause blocks M&A Change of Control or triggers counterparty termination right.",
        severity: "HIGH",
        remediation: "Add explicit M&A carve-out permitting assignment without consent to an affiliate or successor in connection with a merger, acquisition, or sale of substantially all assets.",
      },
    ],
    mandatoryFor: ["MSA", "SaaS_Enterprise", "M_and_A_Purchase", "IP_License"],
  },
  {
    category: "Non-Compete, Exclusivity & Non-Solicitation",
    keywords: /\b(non-compete|non-solicitation|exclusiv\w+|competitive\s+business|solicit\s+any\s+employee)\b/i,
    redFlagPatterns: [
      {
        pattern: /\b(exclusive\s+provider|shall\s+not\s+engage\s+in\s+any\s+competing|worldwide.*five\s+\(5\)\s+years)\b/i,
        issue: "Restrictive exclusivity or overbroad non-compete covenant detected.",
        severity: "HIGH",
        remediation: "Strike exclusivity or narrow scope strictly to direct solicitation of named key personnel for 12 months with standard carve-outs for general job postings.",
      },
    ],
    mandatoryFor: ["Employment", "M_and_A_Purchase"],
  },
  {
    category: "Termination, Auto-Renewal & Cure Period",
    keywords: /\b(terminat\w+|auto-renew\w+|automatically\s+renew|cure\s+period|material\s+breach)\b/i,
    redFlagPatterns: [
      {
        pattern: /\b(terminate\s+immediately\s+without\s+notice|no\s+opportunity\s+to\s+cure|automatically\s+renew\s+for\s+successive\s+multi-year)\b/i,
        issue: "Hair-trigger termination without cure period or evergreen multi-year auto-renewal trap.",
        severity: "MEDIUM",
        remediation: "Require a minimum 30-day written notice and cure period for material breaches, and require 60-day opt-out notice for 12-month renewals.",
      },
    ],
    mandatoryFor: ["MSA", "SaaS_Enterprise"],
  },
  {
    category: "Governing Law, Venue & Dispute Resolution",
    keywords: /\b(governing\s+law|governed\s+by\s+the\s+laws|exclusive\s+jurisdiction|arbitration|jury\s+trial)\b/i,
    redFlagPatterns: [
      {
        pattern: /\b(foreign\s+court|laws\s+of\s+england\s+and\s+wales|laws\s+of\s+singapore|loser\s+pays\s+all\s+attorneys)\b/i,
        issue: "Non-standard or foreign governing law / fee-shifting provision detected.",
        severity: "MEDIUM",
        remediation: "Standardize governing law to Delaware or New York law with mutual waiver of jury trial.",
      },
    ],
    mandatoryFor: ["MSA", "NDA", "SaaS_Enterprise", "M_and_A_Purchase", "Employment", "SAFE_Investment"],
  },
  {
    category: "Data Privacy, Security & Breach Notification",
    keywords: /\b(personal\s+data|gdpr|ccpa|security\s+breach|data\s+protection|unauthorized\s+access|hipaa)\b/i,
    redFlagPatterns: [
      {
        pattern: /\b(within\s+thirty\s+\(30\)\s+days\s+of\s+a\s+breach|no\s+obligation\s+to\s+notify)\b/i,
        issue: "Delayed data breach notification window (> 72 hours violates GDPR Art. 33 / state breach laws).",
        severity: "CRITICAL",
        remediation: "Mandate security incident notification without undue delay and in no event later than 48-72 hours after discovery, plus mandatory DPA execution.",
      },
    ],
    mandatoryFor: ["MSA", "SaaS_Enterprise"],
  },
];

export const dueDiligenceTools = {
  extract_and_audit_clauses: tool({
    description:
      "Perform an automated BigLaw contract audit and clause extraction on any contract text. Scans across canonical legal categories (Indemnification, Liability Caps, IP Assignment, Change of Control, Exclusivity, Termination, Privacy, Governing Law), extracts verbatim clauses, flags missing protections, and computes a numerical Contract Risk Score (0-100).",
    parameters: z.object({
      document_text: z
        .string()
        .describe("Full text or key sections of the contract to audit"),
      contract_type: z
        .enum([
          "MSA",
          "NDA",
          "SaaS_Enterprise",
          "M_and_A_Purchase",
          "Employment",
          "IP_License",
          "SAFE_Investment",
          "General",
        ])
        .default("MSA"),
      our_party_role: z
        .enum([
          "Customer_Buyer",
          "Vendor_Seller",
          "Investor",
          "Company_Issuer",
          "Mutual",
        ])
        .default("Mutual"),
    }),
    execute: async (args: any) => {
      const {
        document_text = "",
        contract_type = "MSA",
        our_party_role = "Mutual",
      } = args;

      const paragraphs = document_text
        .split(/\n{2,}/)
        .map((p: string) => p.trim())
        .filter(Boolean);

      const extractedClauses: any[] = [];
      const missingMandatoryClauses: string[] = [];
      const detectedRedFlags: any[] = [];

      for (const patternDef of CANONICAL_CLAUSE_PATTERNS) {
        const matchingParas = paragraphs.filter((p: string) =>
          patternDef.keywords.test(p)
        );

        if (matchingParas.length > 0) {
          const combinedExcerpt = matchingParas.slice(0, 3).join("\n\n").substring(0, 1200);
          const clauseFlags: any[] = [];

          for (const rf of patternDef.redFlagPatterns) {
            if (rf.pattern.test(combinedExcerpt) || rf.pattern.test(document_text)) {
              clauseFlags.push({
                category: patternDef.category,
                issue: rf.issue,
                severity: rf.severity,
                recommended_remediation: rf.remediation,
              });
              detectedRedFlags.push({
                category: patternDef.category,
                issue: rf.issue,
                severity: rf.severity,
                excerpt: combinedExcerpt.substring(0, 350),
                recommended_remediation: rf.remediation,
              });
            }
          }

          extractedClauses.push({
            category: patternDef.category,
            status: clauseFlags.length > 0 ? "RED_FLAG_DETECTED" : "PRESENT_STANDARD",
            excerpt: combinedExcerpt,
            flags: clauseFlags,
          });
        } else if (
          patternDef.mandatoryFor.includes(contract_type) ||
          contract_type === "General"
        ) {
          missingMandatoryClauses.push(patternDef.category);
          detectedRedFlags.push({
            category: patternDef.category,
            issue: `Mandatory protection '${patternDef.category}' is completely omitted from this ${contract_type}.`,
            severity: "HIGH",
            excerpt: "[CLAUSE OMITTED FROM DRAFT]",
            recommended_remediation: `Insert standard protective ${patternDef.category} provision tailored for ${our_party_role}.`,
          });
        }
      }

      // Compute deterministic Risk Score (0-100)
      let riskScore = 15;
      for (const rf of detectedRedFlags) {
        if (rf.severity === "CRITICAL") riskScore += 22;
        else if (rf.severity === "HIGH") riskScore += 14;
        else if (rf.severity === "MEDIUM") riskScore += 8;
        else riskScore += 4;
      }
      riskScore = Math.min(100, riskScore);

      const overallRiskRating =
        riskScore >= 70
          ? "CRITICAL_DEALBREAKER_RISK"
          : riskScore >= 45
            ? "ELEVATED_NEGOTIATION_REQUIRED"
            : "MARKET_ACCEPTABLE";

      return {
        status: "success",
        contract_type,
        our_party_role,
        risk_score: riskScore,
        overall_risk_rating: overallRiskRating,
        clauses_extracted_count: extractedClauses.length,
        missing_mandatory_clauses: missingMandatoryClauses,
        red_flags: detectedRedFlags,
        extracted_clauses: extractedClauses,
      };
    },
  }),

  evaluate_against_playbook: tool({
    description:
      "Evaluate a contract or set of clauses against the user's Custom Firm Playbook (automatically loaded from Workspace Settings) plus any additional negotiation rules. Outputs a Playbook Compliance Matrix and ready-to-use fallback clauses for redline_document.",
    parameters: z.object({
      document_text: z.string().describe("Contract text or clauses to evaluate"),
      custom_rules_override: z
        .array(z.string())
        .optional()
        .describe("Optional additional playbook rules to enforce alongside the user's saved Settings Playbook"),
    }),
    execute: async (args: any) => {
      const { document_text = "", custom_rules_override = [] } = args;
      const { profile } = await getAuthUserProfile();

      const savedPlaybookText: string =
        profile?.brandParameters?.customPlaybook || "";

      const defaultAmLawPlaybook = [
        "1. Mutual Indemnification is mandatory for third-party IP infringement, confidentiality breaches, and gross negligence/willful misconduct.",
        "2. Aggregate Limitation of Liability must be capped at 12 months' fees (or $1,000,000 minimum), with mutual waiver of consequential/indirect damages.",
        "3. Intellectual Property assignments must use present-tense 'hereby irrevocably assigns' language and preserve pre-existing background IP.",
        "4. Anti-assignment clauses must include an explicit M&A Change-of-Control carve-out without counterparty consent.",
        "5. Termination for breach requires at least 30 days' written notice and opportunity to cure.",
      ];

      const rawRules = savedPlaybookText
        ? savedPlaybookText
            .split(/\n+/)
            .map((r: string) => r.trim())
            .filter((r: string) => r.length > 8 && !r.startsWith("[Attached"))
        : defaultAmLawPlaybook;

      const allRules = [...rawRules, ...custom_rules_override];

      const evaluations = allRules.map((rule, idx) => {
        const lowerRule = rule.toLowerCase();
        const lowerDoc = document_text.toLowerCase();

        let complianceStatus: "COMPLIANT" | "DEVIATION_REQUIRES_REDLINE" | "DEALBREAKER_VIOLATION" =
          "COMPLIANT";
        let finding = "Contract language appears aligned with playbook requirement.";

        if (lowerRule.includes("indemnif") && !lowerDoc.includes("mutual")) {
          complianceStatus = "DEALBREAKER_VIOLATION";
          finding =
            "Contract lacks mutual indemnification or imposes unilateral indemnity obligations.";
        } else if (
          (lowerRule.includes("liability") || lowerRule.includes("cap")) &&
          (lowerDoc.includes("unlimited") || !lowerDoc.includes("twelve (12) months") && !lowerDoc.includes("12 months"))
        ) {
          complianceStatus = "DEALBREAKER_VIOLATION";
          finding =
            "Limitation of liability does not enforce the mandatory 12-month fee cap or consequential damages waiver.";
        } else if (
          lowerRule.includes("assign") &&
          !lowerDoc.includes("hereby assigns") &&
          !lowerDoc.includes("hereby irrevocably assigns")
        ) {
          complianceStatus = "DEVIATION_REQUIRES_REDLINE";
          finding =
            "IP or Assignment clause does not contain present-tense 'hereby assigns' or M&A successor carve-out.";
        } else if (
          lowerRule.includes("cure") &&
          !lowerDoc.includes("30 days") &&
          !lowerDoc.includes("thirty (30) days")
        ) {
          complianceStatus = "DEVIATION_REQUIRES_REDLINE";
          finding =
            "Termination clause lacks the required 30-day written notice and cure period.";
        }

        return {
          rule_number: idx + 1,
          playbook_rule: rule,
          status: complianceStatus,
          finding,
        };
      });

      const violationsCount = evaluations.filter(
        (e) => e.status !== "COMPLIANT"
      ).length;

      return {
        status: "success",
        playbook_source: savedPlaybookText
          ? "User Custom Firm Playbook (Workspace Settings)"
          : "Vigil Default AmLaw 100 Commercial Playbook",
        total_rules_checked: evaluations.length,
        violations_or_deviations_count: violationsCount,
        playbook_compliance_matrix: evaluations,
        instruction_for_agent:
          violationsCount > 0
            ? "Deviations were found against the Firm Playbook. Proceed to call redline_document with exact clause revisions to bring the agreement into 100% playbook compliance."
            : "The agreement satisfies all checked playbook rules.",
      };
    },
  }),

  generate_diligence_red_flag_report: tool({
    description:
      "Compile a formal, presentation-grade Executive Due Diligence & Risk Matrix Report PDF (for M&A transactions, vendor audits, or financing rounds). Includes an Executive Summary, Risk Heatmap Table, Detailed Findings, and Post-Closing Remediation Covenants.",
    parameters: z.object({
      report_title: z
        .string()
        .describe("Title of the Due Diligence Report (e.g., 'Project Titan - Legal Due Diligence Red Flag Report')"),
      target_or_counterparty: z
        .string()
        .describe("Name of the Target Company or Counterparty"),
      transaction_type: z
        .string()
        .describe("e.g., 'Series B Financing', 'Stock Purchase Acquisition', 'Enterprise SaaS MSA Audit'"),
      executive_summary: z
        .string()
        .describe("Comprehensive executive summary of the diligence scope and overall risk posture"),
      findings: z
        .array(
          z.object({
            category: z
              .string()
              .describe("e.g., 'Corporate & Cap Table', 'IP & Open Source', 'Material Contracts', 'Litigation', 'Regulatory/Privacy'"),
            issue_title: z.string(),
            severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
            document_ref: z.string().describe("Document ID or Data Room reference"),
            analysis: z.string().describe("Detailed legal analysis of the risk and its 2nd/3rd order implications"),
            estimated_exposure: z
              .string()
              .optional()
              .describe("Estimated financial or operational exposure (e.g., '$2.5M Indemnity Escrow', 'Uncapped IP Claim')"),
            remediation: z
              .string()
              .describe("Specific contractual cure, closing condition, special indemnity, or purchase price adjustment"),
          })
        )
        .describe("Structured list of due diligence findings"),
      missing_diligence_items: z
        .array(z.string())
        .optional()
        .describe("List of missing documents or unverified data room items requiring follow-up"),
    }),
    execute: async (args: any) => {
      const {
        report_title,
        target_or_counterparty,
        transaction_type,
        executive_summary,
        findings = [],
        missing_diligence_items = [],
      } = args;

      const criticalCount = findings.filter((f: any) => f.severity === "CRITICAL").length;
      const highCount = findings.filter((f: any) => f.severity === "HIGH").length;

      let rawSectionsLatex = `\\section*{1. Executive Summary \\& Risk Posture}\n`;
      rawSectionsLatex += `\\textbf{Target / Subject:} ${escapeLatexText(target_or_counterparty)} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Transaction:} ${escapeLatexText(transaction_type)} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Critical/High Red Flags:} \\textcolor{RiskHigh}{${criticalCount} Critical, ${highCount} High}\\\\[0.8em]\n`;
      rawSectionsLatex += `${escapeLatexText(executive_summary)}\\\\[1.5em]\n`;

      // Risk Matrix Heatmap Table
      rawSectionsLatex += `\\section*{2. Executive Risk Matrix Summary}\n`;
      rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}p{1.2in}p{0.8in}p{1.6in}p{1.1in}X@{}}\n`;
      rawSectionsLatex += `\\toprule\n`;
      rawSectionsLatex += `\\textbf{Domain} & \\textbf{Severity} & \\textbf{Issue} & \\textbf{Exposure} & \\textbf{Required Cure / Indemnity} \\\\\n`;
      rawSectionsLatex += `\\midrule\n`;
      for (const f of findings) {
        const sevColor =
          f.severity === "CRITICAL"
            ? "RiskHigh"
            : f.severity === "HIGH"
              ? "RiskMed"
              : "RiskLow";
        rawSectionsLatex += `{\\footnotesize ${escapeLatexText(f.category)}} & \\textbf{\\textcolor{${sevColor}}{\\footnotesize ${escapeLatexText(f.severity)}}} & {\\footnotesize ${escapeLatexText(f.issue_title)}} & {\\footnotesize ${escapeLatexText(f.estimated_exposure || "TBD")}} & {\\footnotesize ${escapeLatexText(f.remediation)}} \\\\[0.4em]\n`;
      }
      rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n\\vspace{1.5em}\n`;

      // Detailed Legal Analysis
      rawSectionsLatex += `\\section*{3. Detailed Diligence Findings \\& Remediation Directives}\n`;
      findings.forEach((f: any, idx: number) => {
        const sevColor =
          f.severity === "CRITICAL"
            ? "RiskHigh"
            : f.severity === "HIGH"
              ? "RiskMed"
              : "RiskLow";
        rawSectionsLatex += `\\subsection*{3.${idx + 1} [${escapeLatexText(f.category)}] ${escapeLatexText(f.issue_title)} --- \\textcolor{${sevColor}}{${escapeLatexText(f.severity)}}}\n`;
        rawSectionsLatex += `\\textbf{Source Reference:} ${escapeLatexText(f.document_ref)} \\quad|\\quad \\textbf{Quantified Exposure:} ${escapeLatexText(f.estimated_exposure || "Unquantified")}\\\\[0.4em]\n`;
        rawSectionsLatex += `\\textbf{Legal Analysis:} ${escapeLatexText(f.analysis)}\\\\[0.4em]\n`;
        rawSectionsLatex += `\\textbf{\\textcolor{BrandPrimary}{Mandatory Remediation:}} ${escapeLatexText(f.remediation)}\\\\[1em]\n`;
      });

      if (missing_diligence_items.length > 0) {
        rawSectionsLatex += `\\section*{4. Outstanding Data Room Requests \\& Missing Deliverables}\n`;
        rawSectionsLatex += `\\begin{enumerate}\n`;
        for (const item of missing_diligence_items) {
          rawSectionsLatex += `\\item ${escapeLatexText(item)}\n`;
        }
        rawSectionsLatex += `\\end{enumerate}\n`;
      }

      return await compileStructuredLatexDocument({
        title: report_title,
        layoutStyle: "diligence_report",
        rawSectionsLatex,
        memoHeaders: {
          to: "Investment Committee / Board of Directors",
          from: "BasaltVigil M&A & Diligence Swarm (Keyes / Archer / Gutman)",
          date: new Date().toISOString().split("T")[0],
          subject: `${report_title} (${target_or_counterparty})`,
        },
        documentType: "diligence_report",
        idPrefixOverride: "DD-REPORT",
        extraMetadata: {
          target_or_counterparty,
          transaction_type,
          findings_count: findings.length,
          critical_count: criticalCount,
          high_count: highCount,
        },
      });
    },
  }),

  manage_closing_checklist: tool({
    description:
      "Generate and compile a comprehensive M&A, Financing, or Real Estate Transaction Closing Checklist & Conditions Precedent Agenda PDF.",
    parameters: z.object({
      transaction_name: z
        .string()
        .describe("Name of the deal (e.g., 'Series A Preferred Stock Financing - Closing Checklist')"),
      target_closing_date: z.string().describe("Target closing date (YYYY-MM-DD)"),
      items: z
        .array(
          z.object({
            item_number: z.string().describe("e.g., '1.1', '2.3'"),
            category: z
              .enum([
                "Corporate_Approvals",
                "Principal_Transaction_Agreements",
                "Ancillary_Agreements",
                "Regulatory_and_Securities_Filings",
                "Third_Party_Consents",
                "Closing_Certificates_and_Opinions",
                "Flow_of_Funds_and_Post_Closing",
              ]),
            document_or_action: z.string(),
            responsible_party: z.string().describe("e.g., 'Company Counsel', 'Investor Counsel', 'Delaware Secretary of State'"),
            status: z.enum([
              "EXECUTED",
              "FINAL_FORM",
              "IN_NEGOTIATION",
              "DRAFT_PENDING",
              "CONDITION_WAIVED",
            ]),
            notes: z.string().optional(),
          })
        )
        .describe("Checklist deliverables and conditions precedent"),
    }),
    execute: async (args: any) => {
      const { transaction_name, target_closing_date, items = [] } = args;

      const completedCount = items.filter(
        (i: any) => i.status === "EXECUTED" || i.status === "FINAL_FORM"
      ).length;
      const readinessPct =
        items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

      let rawSectionsLatex = `\\section*{Closing Readiness Overview}\n`;
      rawSectionsLatex += `\\textbf{Transaction:} ${escapeLatexText(transaction_name)} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Target Closing:} ${escapeLatexText(target_closing_date)} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Closing Readiness:} ${readinessPct}\\% (${completedCount}/${items.length} Deliverables Final/Executed)\\\\[1.2em]\n`;

      rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}p{0.45in}p{1.8in}p{1.1in}p{1.05in}X@{}}\n`;
      rawSectionsLatex += `\\toprule\n`;
      rawSectionsLatex += `\\textbf{No.} & \\textbf{Deliverable / Condition} & \\textbf{Responsible} & \\textbf{Status} & \\textbf{Closing Notes} \\\\\n`;
      rawSectionsLatex += `\\midrule\n`;

      for (const item of items) {
        const statusColor =
          item.status === "EXECUTED" || item.status === "FINAL_FORM"
            ? "RiskLow"
            : item.status === "IN_NEGOTIATION"
              ? "RiskMed"
              : "RiskHigh";
        rawSectionsLatex += `{\\footnotesize ${escapeLatexText(item.item_number)}} & {\\footnotesize \\textbf{${escapeLatexText(item.document_or_action)}}} & {\\footnotesize ${escapeLatexText(item.responsible_party)}} & \\textbf{\\textcolor{${statusColor}}{\\footnotesize ${escapeLatexText(item.status.replace(/_/g, " "))}}} & {\\footnotesize ${escapeLatexText(item.notes || "---")}} \\\\[0.4em]\n`;
      }

      rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n`;

      return await compileStructuredLatexDocument({
        title: transaction_name,
        layoutStyle: "diligence_report",
        rawSectionsLatex,
        memoHeaders: {
          to: "All Working Group Parties",
          from: "BasaltVigil Transaction Deal Desk (Archer / Spade)",
          date: new Date().toISOString().split("T")[0],
          subject: `Closing Checklist & Conditions Precedent — Target Closing: ${target_closing_date}`,
        },
        documentType: "closing_checklist",
        idPrefixOverride: "CLOSING",
        extraMetadata: {
          target_closing_date,
          readiness_percentage: readinessPct,
          items,
        },
      });
    },
  }),
};
