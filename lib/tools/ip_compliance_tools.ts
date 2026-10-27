// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import { escapeLatexText } from "./latex-helpers";
import { compileStructuredLatexDocument } from "./compile_helper";

const NICE_CLASS_DESCRIPTIONS: Record<number, string> = {
  9: "Class 9: Downloadable software, mobile applications, blockchain/cryptographic software, computer hardware.",
  35: "Class 35: Advertising, business management, online marketplaces, retail store services.",
  36: "Class 36: Financial services, cryptocurrency exchange, payment processing, investment management, real estate.",
  38: "Class 38: Telecommunications, electronic data transmission, streaming services.",
  41: "Class 41: Education, training, entertainment, online non-downloadable publications.",
  42: "Class 42: SaaS (Software as a Service), PaaS, AI/cloud computing services, technological research and design.",
  45: "Class 45: Legal services, regulatory compliance consulting, identity verification, security services.",
};

export const ipComplianceTools = {
  run_trademark_clearance_analysis: tool({
    description:
      "Conduct a comprehensive USPTO Trademark Clearance & Registrability Analysis under the Lanham Act (15 U.S.C. § 1052). Evaluates Abercrombie distinctiveness, Nice International Classifications, and DuPont Likelihood of Confusion factors, compiling a formal Trademark Clearance Opinion PDF.",
    parameters: z.object({
      proposed_mark: z.string().describe("Proposed brand name, word mark, or token symbol"),
      goods_and_services_description: z.string(),
      nice_classes: z
        .array(z.number())
        .default([9, 36, 42])
        .describe("USPTO International Nice Classes (e.g., [9, 36, 42])"),
      abercrombie_distinctiveness: z
        .enum(["FANCIFUL", "ARBITRARY", "SUGGESTIVE", "MERELY_DESCRIPTIVE", "GENERIC"])
        .default("SUGGESTIVE"),
      filing_basis: z
        .enum(["Section_1a_Use_in_Commerce", "Section_1b_Intent_to_Use", "Section_44d_Foreign_Priority"])
        .default("Section_1b_Intent_to_Use"),
      potential_conflicting_marks: z
        .array(
          z.object({
            mark_name: z.string(),
            owner: z.string(),
            nice_class: z.number(),
            status: z.enum(["LIVE_REGISTERED", "LIVE_PENDING_ITU", "DEAD_CANCELLED_ABANDONED", "COMMON_LAW_UNREGISTERED"]),
            dupont_analysis: z.string().describe("Sight, sound, meaning, and commercial channel comparison"),
            conflict_risk: z.enum(["HIGH_LIKELIHOOD_OF_CONFUSION", "MODERATE_OFFICE_ACTION_RISK", "LOW_DISTINGUISHABLE"]),
          })
        )
        .optional(),
    }),
    execute: async (args: any) => {
      const {
        proposed_mark,
        goods_and_services_description,
        nice_classes = [9, 36, 42],
        abercrombie_distinctiveness = "SUGGESTIVE",
        filing_basis = "Section_1b_Intent_to_Use",
        potential_conflicting_marks = [],
      } = args;

      const classDetails = nice_classes.map((c: number) => ({
        class_number: c,
        standard_description:
          NICE_CLASS_DESCRIPTIONS[c] || `International Class ${c}: Specialized Goods/Services`,
        uspto_teas_standard_fee_usd: 350,
      }));

      const totalUsptoFilingFee = classDetails.length * 350;

      let section2eRisk = "LOW — Inherently Distinctive (Principal Register Eligible)";
      if (abercrombie_distinctiveness === "MERELY_DESCRIPTIVE") {
        section2eRisk =
          "HIGH — Likely 15 U.S.C. § 1052(e)(1) Merely Descriptive Refusal unless Secondary Meaning (§ 2(f)) is shown or Supplemental Register is used.";
      } else if (abercrombie_distinctiveness === "GENERIC") {
        section2eRisk = "FATAL — Generic terms are incapable of functioning as a trademark.";
      }

      let rawSectionsLatex = `\\section*{1. Proposed Mark \\& Statutory Registrability Assessment}\n`;
      rawSectionsLatex += `\\textbf{Proposed Mark:} \`\`${escapeLatexText(proposed_mark)}'' \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Filing Basis:} ${escapeLatexText(filing_basis.replace(/_/g, " "))}\\\\[0.4em]\n`;
      rawSectionsLatex += `\\textbf{Abercrombie Spectrum Classification:} \\textbf{\\textcolor{BrandPrimary}{${escapeLatexText(abercrombie_distinctiveness)}}}\\\\[0.4em]\n`;
      rawSectionsLatex += `\\textbf{Lanham Act § 2(e) Assessment:} ${escapeLatexText(section2eRisk)}\\\\[0.4em]\n`;
      rawSectionsLatex += `\\textbf{Goods \\& Services Identification:} ${escapeLatexText(goods_and_services_description)}\\\\[1.2em]\n`;

      rawSectionsLatex += `\\section*{2. USPTO Nice International Class \\& Fee Schedule}\n`;
      rawSectionsLatex += `\\begin{itemize}\n`;
      for (const cd of classDetails) {
        rawSectionsLatex += `\\item \\textbf{Class ${cd.class_number}:} ${escapeLatexText(cd.standard_description)} (USPTO Base Fee: \\$${cd.uspto_teas_standard_fee_usd})\n`;
      }
      rawSectionsLatex += `\\end{itemize}\n\\textbf{Total Estimated USPTO Government Filing Fees:} \\$${totalUsptoFilingFee}\\\\[1.2em]\n`;

      if (potential_conflicting_marks.length > 0) {
        rawSectionsLatex += `\\section*{3. In re DuPont Likelihood of Confusion (§ 2(d)) Matrix}\n`;
        rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}p{1.2in}p{0.6in}p{1.1in}p{1.1in}X@{}}\n`;
        rawSectionsLatex += `\\toprule\n`;
        rawSectionsLatex += `\\textbf{Cited Mark} & \\textbf{Class} & \\textbf{Status} & \\textbf{§ 2(d) Risk} & \\textbf{DuPont Factor Analysis} \\\\\n`;
        rawSectionsLatex += `\\midrule\n`;
        for (const cm of potential_conflicting_marks) {
          const rColor =
            cm.conflict_risk === "HIGH_LIKELIHOOD_OF_CONFUSION"
              ? "RiskHigh"
              : cm.conflict_risk === "MODERATE_OFFICE_ACTION_RISK"
                ? "RiskMed"
                : "RiskLow";
          rawSectionsLatex += `{\\footnotesize \\textbf{${escapeLatexText(cm.mark_name)}} (${escapeLatexText(cm.owner)})} & {\\footnotesize IC ${cm.nice_class}} & {\\footnotesize ${escapeLatexText(cm.status.replace(/_/g, " "))}} & \\textbf{\\textcolor{${rColor}}{\\footnotesize ${escapeLatexText(cm.conflict_risk.replace(/_/g, " "))}}} & {\\footnotesize ${escapeLatexText(cm.dupont_analysis)}} \\\\[0.4em]\n`;
        }
        rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n`;
      }

      const pdfRes = await compileStructuredLatexDocument({
        title: `USPTO Trademark Clearance Opinion — "${proposed_mark}"`,
        layoutStyle: "diligence_report",
        rawSectionsLatex,
        memoHeaders: {
          to: "Brand & Executive Leadership",
          from: "BasaltVigil IP & Brand Protection Desk (Queen / Selznick)",
          date: new Date().toISOString().split("T")[0],
          subject: `Lanham Act § 2(d)/2(e) Trademark Clearance & Registrability Opinion for "${proposed_mark}"`,
        },
        documentType: "trademark_opinion",
        createdBy: "Queen",
        idPrefixOverride: "TM-CLEAR",
      });

      return {
        status: "success",
        proposed_mark,
        abercrombie_distinctiveness,
        section_2e_assessment: section2eRisk,
        nice_class_breakdown: classDetails,
        total_uspto_government_fee_usd: totalUsptoFilingFee,
        pdf_opinion: pdfRes,
      };
    },
  }),

  generate_patent_claim_chart: tool({
    description:
      "Generate an Element-by-Element Patent Claim Construction, Infringement, or Freedom-to-Operate (FTO) / Invalidity Chart PDF (evaluating Literal Infringement, Doctrine of Equivalents, and 35 U.S.C. §§ 101, 102, 103, 112).",
    parameters: z.object({
      patent_number_or_title: z.string().describe("e.g., 'U.S. Patent No. 11,482,910 B2'"),
      analysis_mode: z.enum([
        "Freedom_to_Operate_Non_Infringement",
        "Offensive_Infringement_Enforcement",
        "IPR_Invalidity_Prior_Art_102_103",
      ]),
      accused_or_target_product: z.string(),
      alice_section_101_assessment: z
        .string()
        .describe("Analysis under Alice Corp. v. CLS Bank Step 1 (Abstract Idea) and Step 2 (Inventive Concept)"),
      claim_elements: z
        .array(
          z.object({
            element_id: z.string().describe("e.g., '1[pre]', '1[a]', '1[b]'"),
            claim_limitation_text: z.string(),
            construed_meaning_phillips: z
              .string()
              .describe("Claim construction under Phillips v. AWH Corp."),
            product_or_prior_art_mapping: z.string(),
            determination: z.enum([
              "LITERAL_MATCH_PRESENT",
              "DOCTRINE_OF_EQUIVALENTS_RISK",
              "ELEMENT_MISSING_NO_INFRINGEMENT",
              "DISCLOSED_IN_PRIOR_ART",
            ]),
          })
        ),
    }),
    execute: async (args: any) => {
      const {
        patent_number_or_title,
        analysis_mode,
        accused_or_target_product,
        alice_section_101_assessment,
        claim_elements = [],
      } = args;

      let rawSectionsLatex = `\\section*{1. Patent \\& 35 U.S.C. § 101 Alice Eligibility Overview}\n`;
      rawSectionsLatex += `\\textbf{Target Patent:} ${escapeLatexText(patent_number_or_title)} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Target System/Reference:} ${escapeLatexText(accused_or_target_product)}\\\\[0.4em]\n`;
      rawSectionsLatex += `\\textbf{Analysis Mode:} ${escapeLatexText(analysis_mode.replace(/_/g, " "))}\\\\[0.6em]\n`;
      rawSectionsLatex += `\\textbf{35 U.S.C. § 101 (Alice Two-Step) Assessment:} ${escapeLatexText(alice_section_101_assessment)}\\\\[1.2em]\n`;

      rawSectionsLatex += `\\section*{2. Element-by-Element Claim Construction \\& Mapping Chart}\n`;
      rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}p{0.45in}p{1.6in}p{1.3in}p{1.6in}X@{}}\n`;
      rawSectionsLatex += `\\toprule\n`;
      rawSectionsLatex += `\\textbf{Lim.} & \\textbf{Claim Language} & \\textbf{Phillips Construction} & \\textbf{System / Prior Art} & \\textbf{Finding} \\\\\n`;
      rawSectionsLatex += `\\midrule\n`;

      for (const el of claim_elements) {
        const cColor =
          el.determination === "ELEMENT_MISSING_NO_INFRINGEMENT"
            ? "RiskLow"
            : el.determination === "LITERAL_MATCH_PRESENT"
              ? "RiskHigh"
              : "RiskMed";
        rawSectionsLatex += `{\\footnotesize \\textbf{${escapeLatexText(el.element_id)}}} & {\\footnotesize ${escapeLatexText(el.claim_limitation_text)}} & {\\footnotesize ${escapeLatexText(el.construed_meaning_phillips)}} & {\\footnotesize ${escapeLatexText(el.product_or_prior_art_mapping)}} & \\textbf{\\textcolor{${cColor}}{\\footnotesize ${escapeLatexText(el.determination.replace(/_/g, " "))}}} \\\\[0.45em]\n`;
      }

      rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n`;

      return await compileStructuredLatexDocument({
        title: `Patent Claim Chart — ${patent_number_or_title}`,
        layoutStyle: "diligence_report",
        rawSectionsLatex,
        memoHeaders: {
          to: "General Counsel & Engineering Leadership",
          from: "BasaltVigil Patent & IP Litigation Desk (Queen)",
          date: new Date().toISOString().split("T")[0],
          subject: `${analysis_mode.replace(/_/g, " ")} Claim Chart: ${patent_number_or_title} vs. ${accused_or_target_product}`,
        },
        documentType: "patent_claim_chart",
        createdBy: "Queen",
        idPrefixOverride: "PAT-CHART",
      });
    },
  }),

  generate_privacy_ropa_and_dpia: tool({
    description:
      "Compile a GDPR Article 30 Record of Processing Activities (RoPA) and Article 35 Data Protection Impact Assessment (DPIA) / CCPA-CPRA Privacy Risk Assessment PDF.",
    parameters: z.object({
      organization_name: z.string(),
      system_or_product_name: z.string(),
      processing_activities: z
        .array(
          z.object({
            activity_name: z.string(),
            data_subjects: z.string().describe("e.g., 'EU/UK End Users, California Consumers, Enterprise Employees'"),
            data_categories: z.string().describe("e.g., 'Identifiers, Biometric, Financial/Wallet Addresses, Behavioral Telemetry'"),
            gdpr_art_6_lawful_basis: z.enum([
              "Art_6_1_a_Explicit_Consent",
              "Art_6_1_b_Contractual_Necessity",
              "Art_6_1_c_Legal_Obligation",
              "Art_6_1_f_Legitimate_Interests",
            ]),
            cross_border_transfer_mechanism: z.string().describe("e.g., 'EU-US Data Privacy Framework / 2021 EU SCCs Module 2 + TIA'"),
            retention_schedule: z.string(),
            technical_security_controls: z.string().describe("e.g., 'AES-256 at rest, TLS 1.3, Zero-Retention LLM Inference'"),
          })
        ),
      dpia_mitigation_measures: z.array(z.string()),
    }),
    execute: async (args: any) => {
      const {
        organization_name,
        system_or_product_name,
        processing_activities = [],
        dpia_mitigation_measures = [],
      } = args;

      let rawSectionsLatex = `\\section*{1. GDPR Article 30 Record of Processing Activities (RoPA)}\n`;
      rawSectionsLatex += `\\textbf{Controller / Processor:} ${escapeLatexText(organization_name)} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Platform / Scope:} ${escapeLatexText(system_or_product_name)}\\\\[1em]\n`;

      rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}p{1.05in}p{0.95in}p{1.15in}p{1.05in}p{1.05in}X@{}}\n`;
      rawSectionsLatex += `\\toprule\n`;
      rawSectionsLatex += `\\textbf{Activity} & \\textbf{Subjects} & \\textbf{Data Categories} & \\textbf{Lawful Basis} & \\textbf{Transfer / SCC} & \\textbf{Retention \\& Controls} \\\\\n`;
      rawSectionsLatex += `\\midrule\n`;
      for (const pa of processing_activities) {
        rawSectionsLatex += `{\\footnotesize \\textbf{${escapeLatexText(pa.activity_name)}}} & {\\footnotesize ${escapeLatexText(pa.data_subjects)}} & {\\footnotesize ${escapeLatexText(pa.data_categories)}} & {\\footnotesize ${escapeLatexText(pa.gdpr_art_6_lawful_basis.replace(/_/g, " "))}} & {\\footnotesize ${escapeLatexText(pa.cross_border_transfer_mechanism)}} & {\\footnotesize ${escapeLatexText(pa.retention_schedule)}; ${escapeLatexText(pa.technical_security_controls)}} \\\\[0.45em]\n`;
      }
      rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n\\vspace{1.5em}\n`;

      rawSectionsLatex += `\\section*{2. GDPR Article 35 DPIA \\& CCPA Risk Mitigation Safeguards}\n`;
      rawSectionsLatex += `\\begin{enumerate}\n`;
      for (const m of dpia_mitigation_measures) {
        rawSectionsLatex += `\\item ${escapeLatexText(m)}\n`;
      }
      rawSectionsLatex += `\\end{enumerate}\n`;

      return await compileStructuredLatexDocument({
        title: `${organization_name} — GDPR Art. 30 RoPA & Art. 35 DPIA`,
        layoutStyle: "diligence_report",
        rawSectionsLatex,
        memoHeaders: {
          to: "Data Protection Officer & Regulatory Authorities",
          from: "BasaltVigil Privacy & Cybersecurity Desk (Hammer)",
          date: new Date().toISOString().split("T")[0],
          subject: `GDPR Art. 30/35 & CCPA/CPRA Privacy Impact Assessment — ${system_or_product_name}`,
        },
        documentType: "privacy_ropa_dpia",
        createdBy: "Hammer",
        idPrefixOverride: "DPIA",
      });
    },
  }),

  run_aml_kyc_and_cta_audit: tool({
    description:
      "Perform a FinCEN Corporate Transparency Act (CTA) Beneficial Ownership Information (BOI) & OFAC / AML-KYC Compliance Audit on a corporate entity and its beneficial owners/counterparties.",
    parameters: z.object({
      entity_name: z.string(),
      formation_jurisdiction: z.string(),
      us_full_time_employee_count: z.number().default(0),
      prior_year_us_gross_receipts_usd: z.number().default(0),
      is_sec_reporting_or_regulated_financial_entity: z.boolean().default(false),
      control_persons_and_owners: z
        .array(
          z.object({
            full_name: z.string(),
            title_or_role: z.string(),
            ownership_percentage: z.number(),
            exercises_substantial_control: z.boolean(),
            jurisdiction_of_citizenship: z.string(),
          })
        ),
    }),
    execute: async (args: any) => {
      const {
        entity_name,
        formation_jurisdiction,
        us_full_time_employee_count = 0,
        prior_year_us_gross_receipts_usd = 0,
        is_sec_reporting_or_regulated_financial_entity = false,
        control_persons_and_owners = [],
      } = args;

      // FinCEN CTA Large Operating Company Exemption test (31 U.S.C. § 5336(a)(11)(B)(xxi)):
      // > 20 full-time US employees AND > $5,000,000 in prior year US gross receipts/sales
      const qualifiesLargeOperatingExemption =
        us_full_time_employee_count > 20 && prior_year_us_gross_receipts_usd > 5000000;

      const isExemptFromCta =
        qualifiesLargeOperatingExemption ||
        is_sec_reporting_or_regulated_financial_entity;

      const reportableBeneficialOwners = control_persons_and_owners.filter(
        (p: any) => p.ownership_percentage >= 25 || p.exercises_substantial_control
      );

      const highRiskSanctionsJurisdictions = [
        "IRAN",
        "NORTH KOREA",
        "DPRK",
        "SYRIA",
        "CUBA",
        "RUSSIA",
        "BELARUS",
        "MYANMAR",
      ];

      const ofacScreeningFlags = control_persons_and_owners
        .filter((p: any) =>
          highRiskSanctionsJurisdictions.some((j) =>
            p.jurisdiction_of_citizenship.toUpperCase().includes(j)
          )
        )
        .map(
          (p: any) =>
            `CRITICAL OFAC/SANCTIONS ALERT: ${p.full_name} (${p.jurisdiction_of_citizenship}) triggers comprehensive OFAC SDN / Country Sanctions screening.`
        );

      return {
        status: "success",
        entity_name,
        formation_jurisdiction,
        fincen_cta_boi_determination: {
          is_exempt: isExemptFromCta,
          exemption_basis: is_sec_reporting_or_regulated_financial_entity
            ? "Statutory Regulated Entity / Public Reporting Exemption"
            : qualifiesLargeOperatingExemption
              ? "Large Operating Company Exemption (>20 US FT Employees & >$5M US Gross Receipts)"
              : "NOT EXEMPT — Mandatory FinCEN BOI Reporting Company",
          reportable_beneficial_owners_count: isExemptFromCta
            ? 0
            : reportableBeneficialOwners.length,
          reportable_beneficial_owners: isExemptFromCta
            ? []
            : reportableBeneficialOwners,
        },
        ofac_and_aml_kyc_flags: ofacScreeningFlags,
      };
    },
  }),
};
