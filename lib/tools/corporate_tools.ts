// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import { escapeLatexText } from "./latex-helpers";
import { compileStructuredLatexDocument } from "./compile_helper";

// State Blue Sky Notice Filing Fee & Regulatory Lookup (Rule 506(b)/(c) NSMIA Covered Securities)
const STATE_BLUE_SKY_FEES: Record<
  string,
  { fee: string; deadline_days: number; portal: string; special_note: string }
> = {
  CA: {
    fee: "$300 flat fee",
    deadline_days: 15,
    portal: "CA DFPI DocQNet / NASAA EFD",
    special_note: "File Form D notice + fee within 15 days of first sale in California (Cal. Corp. Code § 25102.1).",
  },
  NY: {
    fee: "$300 (Offerings <= $500k) or $1,200 (Offerings > $500k) + $35 State Notice",
    deadline_days: 15,
    portal: "NASAA EFD (Investor Protection Bureau)",
    special_note: "Mandatory Form D via EFD within 15 days of first NY sale under 13 NYCRR Part 10.",
  },
  TX: {
    fee: "1/10 of 1% of aggregate offering (Max $500)",
    deadline_days: 15,
    portal: "NASAA EFD / Texas State Securities Board",
    special_note: "Form D notice + consent to service of process within 15 days of first Texas sale.",
  },
  FL: {
    fee: "$0 (Exempt from Rule 506 notice filing)",
    deadline_days: 0,
    portal: "No Form D Notice Required (FL OFR)",
    special_note: "Florida does not require a notice filing for federal Rule 506 offerings unless issuer uses unregistered finders.",
  },
  DE: {
    fee: "1/2 of 1% of DE offering amount ($200 min / $1,000 max)",
    deadline_days: 15,
    portal: "NASAA EFD / DE Investor Protection Unit",
    special_note: "File within 15 days after first sale in Delaware (distinct from corporate charter domicile).",
  },
  IL: {
    fee: "$100 flat fee",
    deadline_days: 15,
    portal: "NASAA EFD / Illinois Secretary of State",
    special_note: "File within 15 days after first sale in Illinois.",
  },
  MA: {
    fee: "$250 (up to $2M), $500 ($2M-$7.5M), or $750 (over $7.5M)",
    deadline_days: 15,
    portal: "NASAA EFD / MA Securities Division",
    special_note: "Strict enforcement on late filings; file within 15 days of first MA sale.",
  },
  WA: {
    fee: "$300 flat fee",
    deadline_days: 15,
    portal: "NASAA EFD / WA DFI",
    special_note: "File within 15 days after first sale in Washington.",
  },
  CO: {
    fee: "$50 flat fee",
    deadline_days: 15,
    portal: "NASAA EFD / CO Division of Securities",
    special_note: "File within 15 days after first sale in Colorado.",
  },
};

export const corporateTools = {
  model_cap_table_and_dilution: tool({
    description:
      "Perform deterministic Venture Capital / Corporate Cap Table and Dilution math. Models Pre-Money vs. Post-Money valuations, SAFE and Convertible Note conversions (with Valuation Caps and Discounts), Pre-Money Option Pool Shuffles, and New Money Preferred Stock issuances. Optionally compiles a Pro-Forma Cap Table PDF.",
    parameters: z.object({
      company_name: z.string(),
      round_name: z.string().describe("e.g., 'Series A Preferred Stock Financing'"),
      pre_money_valuation: z
        .number()
        .describe("Headline pre-money valuation in USD (e.g., 15000000)"),
      new_money_investment: z
        .number()
        .describe("Total new cash investment in USD (e.g., 4000000)"),
      target_unallocated_option_pool_pct: z
        .number()
        .default(10)
        .describe("Target post-financing unallocated option pool percentage (e.g., 10 for 10%)"),
      option_pool_in_pre_money: z
        .boolean()
        .default(true)
        .describe("True if the option pool expansion dilutes existing holders in the pre-money (standard VC term)"),
      existing_holders: z
        .array(
          z.object({
            name: z.string(),
            category: z.enum(["Founder", "Existing_Preferred", "Option_Pool_Allocated", "Option_Pool_Unallocated", "Advisor"]),
            shares: z.number(),
          })
        )
        .describe("Current capitalization prior to round"),
      converting_safes_or_notes: z
        .array(
          z.object({
            holder_name: z.string(),
            principal_plus_interest: z.number(),
            valuation_cap: z.number().optional(),
            discount_pct: z.number().default(0).describe("e.g., 20 for a 20% discount"),
          })
        )
        .optional()
        .describe("SAFEs or Convertible Notes converting in this priced round"),
      compile_pdf: z.boolean().default(true),
    }),
    execute: async (args: any) => {
      const {
        company_name,
        round_name,
        pre_money_valuation,
        new_money_investment,
        target_unallocated_option_pool_pct = 10,
        option_pool_in_pre_money = true,
        existing_holders = [],
        converting_safes_or_notes = [],
        compile_pdf = true,
      } = args;

      const existingTotalShares = existing_holders.reduce(
        (sum: number, h: any) => sum + Number(h.shares || 0),
        0
      );
      const existingUnallocatedShares = existing_holders
        .filter((h: any) => h.category === "Option_Pool_Unallocated")
        .reduce((sum: number, h: any) => sum + Number(h.shares || 0), 0);

      const postMoneyValuation = pre_money_valuation + new_money_investment;
      const newInvestorTargetPct = new_money_investment / postMoneyValuation;
      const targetPoolFraction = target_unallocated_option_pool_pct / 100;

      // Calculate effective pre-money share price accounting for option pool expansion & converting SAFEs
      const totalSafePrincipal = converting_safes_or_notes.reduce(
        (s: number, n: any) => s + Number(n.principal_plus_interest || 0),
        0
      );

      // Iterative solver (25 iterations converges to < 1e-10) for simultaneous SAFE conversion & pre-money pool shuffle
      let sharePrice = pre_money_valuation / Math.max(1, existingTotalShares);
      let safeTotalShares = 0;
      let optionPoolTopUpShares = 0;
      let newMoneyShares = 0;

      for (let iter = 0; iter < 30; iter++) {
        safeTotalShares = converting_safes_or_notes.reduce((acc: number, safe: any) => {
          const discountFactor = 1 - (safe.discount_pct || 0) / 100;
          const discountPrice = sharePrice * discountFactor;
          const capPrice = safe.valuation_cap
            ? safe.valuation_cap / Math.max(1, existingTotalShares + (option_pool_in_pre_money ? optionPoolTopUpShares : 0))
            : Infinity;
          const conversionPrice = Math.min(sharePrice, discountPrice, capPrice);
          return acc + safe.principal_plus_interest / Math.max(0.0001, conversionPrice);
        }, 0);

        newMoneyShares = new_money_investment / Math.max(0.0001, sharePrice);

        const totalPostSharesEstimate =
          (existingTotalShares - existingUnallocatedShares + safeTotalShares + newMoneyShares) /
          Math.max(0.01, 1 - targetPoolFraction);

        const requiredUnallocatedPool = totalPostSharesEstimate * targetPoolFraction;
        optionPoolTopUpShares = Math.max(0, requiredUnallocatedPool - existingUnallocatedShares);

        const preMoneyBaseShares = option_pool_in_pre_money
          ? existingTotalShares + optionPoolTopUpShares + safeTotalShares
          : existingTotalShares + safeTotalShares;

        sharePrice = pre_money_valuation / Math.max(1, preMoneyBaseShares);
      }

      const finalSafeBreakdowns = converting_safes_or_notes.map((safe: any) => {
        const discountFactor = 1 - (safe.discount_pct || 0) / 100;
        const discountPrice = sharePrice * discountFactor;
        const capPrice = safe.valuation_cap
          ? safe.valuation_cap /
            Math.max(1, existingTotalShares + (option_pool_in_pre_money ? optionPoolTopUpShares : 0))
          : Infinity;
        const conversionPrice = Math.min(sharePrice, discountPrice, capPrice);
        const sharesIssued = Math.round(safe.principal_plus_interest / conversionPrice);
        return {
          name: `${safe.holder_name} (SAFE/Note Conversion)`,
          category: "Converting_SAFE_Note",
          investment: safe.principal_plus_interest,
          conversion_price: Number(conversionPrice.toFixed(4)),
          shares: sharesIssued,
        };
      });

      const roundedNewMoneyShares = Math.round(newMoneyShares);
      const roundedPoolTopUp = Math.round(optionPoolTopUpShares);

      const postRoundRows: any[] = [];

      for (const h of existing_holders) {
        if (h.category === "Option_Pool_Unallocated") continue;
        postRoundRows.push({
          stakeholder: h.name,
          class_or_category: h.category.replace(/_/g, " "),
          pre_round_shares: Math.round(h.shares),
          pre_round_pct: Number(((h.shares / Math.max(1, existingTotalShares)) * 100).toFixed(2)),
          post_round_shares: Math.round(h.shares),
          implied_value_usd: Math.round(h.shares * sharePrice),
        });
      }

      for (const s of finalSafeBreakdowns) {
        postRoundRows.push({
          stakeholder: s.name,
          class_or_category: `Shadow ${round_name} (@ $${s.conversion_price})`,
          pre_round_shares: 0,
          pre_round_pct: 0,
          post_round_shares: s.shares,
          implied_value_usd: Math.round(s.shares * sharePrice),
        });
      }

      postRoundRows.push({
        stakeholder: `New ${round_name} Investors`,
        class_or_category: `${round_name} (@ $${sharePrice.toFixed(4)})`,
        pre_round_shares: 0,
        pre_round_pct: 0,
        post_round_shares: roundedNewMoneyShares,
        implied_value_usd: Math.round(new_money_investment),
      });

      const finalUnallocatedPoolShares = existingUnallocatedShares + roundedPoolTopUp;
      postRoundRows.push({
        stakeholder: "Unallocated Employee Option Pool",
        class_or_category: `Common Options (+${roundedPoolTopUp.toLocaleString()} Top-Up)`,
        pre_round_shares: existingUnallocatedShares,
        pre_round_pct: Number(
          ((existingUnallocatedShares / Math.max(1, existingTotalShares)) * 100).toFixed(2)
        ),
        post_round_shares: finalUnallocatedPoolShares,
        implied_value_usd: Math.round(finalUnallocatedPoolShares * sharePrice),
      });

      const totalPostRoundShares = postRoundRows.reduce(
        (acc, r) => acc + r.post_round_shares,
        0
      );

      for (const r of postRoundRows) {
        r.post_round_pct = Number(
          ((r.post_round_shares / Math.max(1, totalPostRoundShares)) * 100).toFixed(2)
        );
        r.dilution_pct_points = Number((r.post_round_pct - r.pre_round_pct).toFixed(2));
      }

      let pdfResult: any = null;
      if (compile_pdf) {
        let rawSectionsLatex = `\\section*{1. Financing Economics Summary}\n`;
        rawSectionsLatex += `\\noindent\\begin{tabular}{@{}ll@{\\hspace{3em}}ll@{}}\n`;
        rawSectionsLatex += `\\textbf{Pre-Money Valuation:} & \\$${pre_money_valuation.toLocaleString()} & \\textbf{New Money Raised:} & \\$${new_money_investment.toLocaleString()} \\\\\n`;
        rawSectionsLatex += `\\textbf{Post-Money Valuation:} & \\$${postMoneyValuation.toLocaleString()} & \\textbf{Converting SAFEs/Notes:} & \\$${totalSafePrincipal.toLocaleString()} \\\\\n`;
        rawSectionsLatex += `\\textbf{New Money Share Price:} & \\$${sharePrice.toFixed(4)} & \\textbf{Fully Diluted Post-Round Shares:} & ${totalPostRoundShares.toLocaleString()} \\\\\n`;
        rawSectionsLatex += `\\end{tabular}\n\\vspace{1.5em}\n`;

        rawSectionsLatex += `\\section*{2. Pro-Forma Capitalization \\& Dilution Schedule}\n`;
        rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}Xrrrrr@{}}\n`;
        rawSectionsLatex += `\\toprule\n`;
        rawSectionsLatex += `\\textbf{Stakeholder / Class} & \\textbf{Pre Shares} & \\textbf{Pre \\%} & \\textbf{Post Shares} & \\textbf{Post \\%} & \\textbf{Implied Value} \\\\\n`;
        rawSectionsLatex += `\\midrule\n`;
        for (const r of postRoundRows) {
          rawSectionsLatex += `{\\footnotesize \\textbf{${escapeLatexText(r.stakeholder)}} (${escapeLatexText(r.class_or_category)})} & {\\footnotesize ${r.pre_round_shares.toLocaleString()}} & {\\footnotesize ${r.pre_round_pct.toFixed(2)}\\%} & {\\footnotesize ${r.post_round_shares.toLocaleString()}} & {\\footnotesize \\textbf{${r.post_round_pct.toFixed(2)}\\%}} & {\\footnotesize \\$${r.implied_value_usd.toLocaleString()}} \\\\[0.3em]\n`;
        }
        rawSectionsLatex += `\\midrule\n`;
        rawSectionsLatex += `\\textbf{TOTAL FULLY DILUTED} & \\textbf{${existingTotalShares.toLocaleString()}} & \\textbf{100.00\\%} & \\textbf{${totalPostRoundShares.toLocaleString()}} & \\textbf{100.00\\%} & \\textbf{\\$${Math.round(totalPostRoundShares * sharePrice).toLocaleString()}} \\\\\n`;
        rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n`;

        pdfResult = await compileStructuredLatexDocument({
          title: `${company_name} — ${round_name} Pro-Forma Cap Table`,
          layoutStyle: "term_sheet_financial",
          rawSectionsLatex,
          documentType: "cap_table_model",
          createdBy: "Gittes",
          idPrefixOverride: "CAPTABLE",
        });
      }

      return {
        status: "success",
        round_economics: {
          pre_money_valuation,
          new_money_investment,
          post_money_valuation: postMoneyValuation,
          price_per_share: Number(sharePrice.toFixed(4)),
          option_pool_top_up_shares: roundedPoolTopUp,
          total_post_round_shares: totalPostRoundShares,
        },
        pro_forma_cap_table: postRoundRows,
        pdf_document: pdfResult,
      };
    },
  }),

  model_liquidation_waterfall: tool({
    description:
      "Calculate an M&A or Dissolution Liquidation Waterfall across Senior Debt, Preferred Share Classes (1x/2x Non-Participating vs. Participating Preferred), and Common Stock at a given Exit Enterprise Value.",
    parameters: z.object({
      company_name: z.string(),
      exit_enterprise_value_usd: z
        .number()
        .describe("Total M&A sale price / exit enterprise value in USD"),
      senior_debt_and_transaction_fees_usd: z
        .number()
        .default(0)
        .describe("Debt payoff and M&A investment banking/legal fees paid off the top"),
      preferred_classes: z
        .array(
          z.object({
            series_name: z.string().describe("e.g., 'Series B', 'Series A' (in order of seniority, highest seniority first)"),
            invested_capital_usd: z.number(),
            liquidation_multiple: z.number().default(1).describe("e.g., 1 for 1x liquidation preference"),
            participating: z.boolean().default(false),
            participation_cap_multiple: z
              .number()
              .optional()
              .describe("e.g., 3 for a 3x cap on participating preferred"),
            fully_diluted_ownership_pct: z.number().describe("e.g., 20 for 20%"),
          })
        ),
      common_and_options_ownership_pct: z
        .number()
        .describe("Remaining fully diluted ownership % held by Common & Founders"),
    }),
    execute: async (args: any) => {
      const {
        company_name,
        exit_enterprise_value_usd,
        senior_debt_and_transaction_fees_usd = 0,
        preferred_classes = [],
        common_and_options_ownership_pct,
      } = args;

      let remainingProceeds = Math.max(
        0,
        exit_enterprise_value_usd - senior_debt_and_transaction_fees_usd
      );

      // Determine for each preferred series whether it converts to common or takes preference
      const totalEquityProceeds = remainingProceeds;
      const payouts: any[] = [];
      let totalPreferredPreferenceTaken = 0;
      let convertingPreferredPct = 0;
      let participatingPreferredPct = 0;

      const decisions = preferred_classes.map((cls: any) => {
        const prefAmount = cls.invested_capital_usd * (cls.liquidation_multiple || 1);
        const asConvertedValue =
          totalEquityProceeds * (cls.fully_diluted_ownership_pct / 100);

        if (!cls.participating && asConvertedValue > prefAmount) {
          convertingPreferredPct += cls.fully_diluted_ownership_pct;
          return { ...cls, decision: "CONVERT_TO_COMMON", prefTaken: 0 };
        } else {
          const actualPref = Math.min(remainingProceeds, prefAmount);
          remainingProceeds -= actualPref;
          totalPreferredPreferenceTaken += actualPref;
          if (cls.participating) {
            participatingPreferredPct += cls.fully_diluted_ownership_pct;
          }
          return {
            ...cls,
            decision: cls.participating
              ? "TAKE_PREFERENCE_AND_PARTICIPATE"
              : "TAKE_LIQUIDATION_PREFERENCE",
            prefTaken: actualPref,
          };
        }
      });

      const participatingPoolPct =
        common_and_options_ownership_pct +
        convertingPreferredPct +
        participatingPreferredPct;

      for (const d of decisions) {
        let proRataShare = 0;
        if (
          remainingProceeds > 0 &&
          (d.decision === "CONVERT_TO_COMMON" ||
            d.decision === "TAKE_PREFERENCE_AND_PARTICIPATE")
        ) {
          proRataShare =
            remainingProceeds *
            (d.fully_diluted_ownership_pct / Math.max(0.01, participatingPoolPct));
        }

        let totalPayout = d.prefTaken + proRataShare;
        if (d.participating && d.participation_cap_multiple) {
          const capAmount = d.invested_capital_usd * d.participation_cap_multiple;
          const asConverted =
            totalEquityProceeds * (d.fully_diluted_ownership_pct / 100);
          totalPayout = Math.max(asConverted, Math.min(totalPayout, capAmount));
        }

        payouts.push({
          class_name: d.series_name,
          election: d.decision,
          invested_capital_usd: d.invested_capital_usd,
          preference_payout_usd: Math.round(d.prefTaken),
          common_participation_payout_usd: Math.round(totalPayout - d.prefTaken),
          total_payout_usd: Math.round(totalPayout),
          moic_multiple: Number(
            (totalPayout / Math.max(1, d.invested_capital_usd)).toFixed(2)
          ),
        });
      }

      const commonPayout =
        remainingProceeds *
        (common_and_options_ownership_pct / Math.max(0.01, participatingPoolPct));

      payouts.push({
        class_name: "Common Stock & Vested Options (Founders / Employees)",
        election: "PRO_RATA_RESIDUAL",
        invested_capital_usd: 0,
        preference_payout_usd: 0,
        common_participation_payout_usd: Math.round(commonPayout),
        total_payout_usd: Math.round(commonPayout),
        moic_multiple: null,
      });

      return {
        status: "success",
        company_name,
        exit_enterprise_value_usd,
        senior_debt_and_fees_paid_first_usd: senior_debt_and_transaction_fees_usd,
        net_equity_proceeds_usd: totalEquityProceeds,
        waterfall_distribution: payouts,
      };
    },
  }),

  calculate_vesting_and_83b: tool({
    description:
      "Calculate an equity grant vesting schedule (with cliff and single/double-trigger acceleration) and compute IRC Section 83(b) election statutory deadlines and tax exposure.",
    parameters: z.object({
      recipient_name: z.string(),
      grant_date: z.string().describe("Grant / purchase date in YYYY-MM-DD format"),
      total_shares: z.number(),
      strike_or_purchase_price_per_share: z.number(),
      current_409a_fmv_per_share: z.number(),
      Projected_fmv_at_full_vesting_per_share: z.number().default(10.0),
      vesting_months: z.number().default(48),
      cliff_months: z.number().default(12),
    }),
    execute: async (args: any) => {
      const {
        recipient_name,
        grant_date,
        total_shares,
        strike_or_purchase_price_per_share,
        current_409a_fmv_per_share,
        Projected_fmv_at_full_vesting_per_share = 10.0,
        vesting_months = 48,
        cliff_months = 12,
      } = args;

      const grantDt = new Date(grant_date);
      const deadline83b = new Date(grantDt.getTime() + 30 * 24 * 60 * 60 * 1000);
      const cliffDate = new Date(grantDt);
      cliffDate.setMonth(cliffDate.getMonth() + cliff_months);

      const fullVestDate = new Date(grantDt);
      fullVestDate.setMonth(fullVestDate.getMonth() + vesting_months);

      const cliffShares = Math.floor(total_shares * (cliff_months / vesting_months));
      const monthlySharesAfterCliff = Math.floor(
        (total_shares - cliffShares) / Math.max(1, vesting_months - cliff_months)
      );

      const spreadAtGrant = Math.max(
        0,
        (current_409a_fmv_per_share - strike_or_purchase_price_per_share) * total_shares
      );
      const estimatedOrdinaryTaxWith83b = Math.round(spreadAtGrant * 0.37);

      const spreadWithout83b = Math.max(
        0,
        (Projected_fmv_at_full_vesting_per_share - strike_or_purchase_price_per_share) *
          total_shares
      );
      const estimatedOrdinaryTaxWithout83b = Math.round(spreadWithout83b * 0.37);

      return {
        status: "success",
        recipient_name,
        grant_summary: {
          grant_date,
          total_shares,
          cliff_date: cliffDate.toISOString().split("T")[0],
          cliff_shares_vesting: cliffShares,
          monthly_vesting_shares_post_cliff: monthlySharesAfterCliff,
          full_vesting_date: fullVestDate.toISOString().split("T")[0],
        },
        irc_83b_analysis: {
          strict_30_day_filing_deadline: deadline83b.toISOString().split("T")[0],
          statutory_warning:
            "CRITICAL: Under IRC § 83(b), the election MUST be filed with the IRS within 30 calendar days of the property transfer date. There is ZERO statutory relief for late filings.",
          taxable_spread_at_grant_usd: spreadAtGrant,
          estimated_federal_tax_at_grant_with_83b_usd: estimatedOrdinaryTaxWith83b,
          estimated_ordinary_income_tax_during_vesting_without_83b_usd:
            estimatedOrdinaryTaxWithout83b,
          projected_tax_savings_from_timely_83b_usd: Math.max(
            0,
            estimatedOrdinaryTaxWithout83b - estimatedOrdinaryTaxWith83b
          ),
        },
      };
    },
  }),

  prepare_sec_form_d_and_blue_sky: tool({
    description:
      "Prepare an SEC Form D Notice of Exempt Offering of Securities (Reg D Rule 506(b) or 506(c)) and compute state-by-state Blue Sky notice filing fees, 15-day statutory deadlines, and NASAA EFD instructions across all investor states, compiling a Compliance Filing Package PDF.",
    parameters: z.object({
      issuer_name: z.string(),
      issuer_jurisdiction: z.string().default("Delaware"),
      exemption_claimed: z
        .enum(["Rule_506b", "Rule_506c", "Rule_504", "Reg_A_Tier_2"])
        .default("Rule_506b"),
      total_offering_amount_usd: z.number(),
      total_amount_sold_to_date_usd: z.number(),
      date_of_first_sale: z.string().describe("Date of first binding subscription/irrevocable commitment (YYYY-MM-DD)"),
      investor_states: z
        .array(z.string())
        .describe("2-letter US state codes where investors reside (e.g., ['CA', 'NY', 'TX', 'FL'])"),
      has_non_accredited_investors: z.boolean().default(false),
    }),
    execute: async (args: any) => {
      const {
        issuer_name,
        issuer_jurisdiction = "Delaware",
        exemption_claimed = "Rule_506b",
        total_offering_amount_usd,
        total_amount_sold_to_date_usd,
        date_of_first_sale,
        investor_states = [],
        has_non_accredited_investors = false,
      } = args;

      const firstSaleDt = new Date(date_of_first_sale);
      const secFormDDeadline = new Date(
        firstSaleDt.getTime() + 15 * 24 * 60 * 60 * 1000
      );

      const complianceAlerts: string[] = [];
      if (exemption_claimed === "Rule_506c" && has_non_accredited_investors) {
        complianceAlerts.push(
          "CRITICAL SEC VIOLATION: Rule 506(c) strictly prohibits any non-accredited purchasers and mandates third-party/reasonable-steps verification of accredited status under 17 CFR § 230.506(c)(2)."
        );
      }
      if (exemption_claimed === "Rule_506b" && has_non_accredited_investors) {
        complianceAlerts.push(
          "HIGH RISK NOTICE: Rule 506(b) permits up to 35 sophisticated non-accredited investors, but triggers mandatory Regulation A / S-1 level audited financial statement disclosures under Rule 502(b)."
        );
      }

      const stateFilings = investor_states.map((st: string) => {
        const code = st.toUpperCase().trim();
        const info = STATE_BLUE_SKY_FEES[code] || {
          fee: "$100 - $500 standard state Form D notice fee",
          deadline_days: 15,
          portal: "NASAA Electronic Filing Depository (EFD)",
          special_note: `File Form D notice + fee within 15 days of first sale in ${code}.`,
        };
        return {
          state: code,
          filing_deadline:
            info.deadline_days > 0
              ? secFormDDeadline.toISOString().split("T")[0]
              : "N/A (Exempt)",
          filing_fee: info.fee,
          portal: info.portal,
          instructions: info.special_note,
        };
      });

      let rawSectionsLatex = `\\section*{1. Federal SEC Form D Filing Summary}\n`;
      rawSectionsLatex += `\\textbf{Issuer:} ${escapeLatexText(issuer_name)} (${escapeLatexText(issuer_jurisdiction)}) \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Federal Exemption:} ${escapeLatexText(exemption_claimed.replace(/_/g, " "))}\\\\[0.4em]\n`;
      rawSectionsLatex += `\\textbf{Total Offering Size:} \\$${total_offering_amount_usd.toLocaleString()} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{Amount Sold to Date:} \\$${total_amount_sold_to_date_usd.toLocaleString()}\\\\[0.4em]\n`;
      rawSectionsLatex += `\\textbf{Date of First Sale:} ${escapeLatexText(date_of_first_sale)} \\quad|\\quad `;
      rawSectionsLatex += `\\textbf{\\textcolor{RiskHigh}{Statutory 15-Day EDGAR Deadline:}} \\textbf{${secFormDDeadline.toISOString().split("T")[0]}}\\\\[1.2em]\n`;

      if (complianceAlerts.length > 0) {
        rawSectionsLatex += `\\section*{2. Securities Compliance Warnings}\n\\begin{itemize}\n`;
        for (const alert of complianceAlerts) {
          rawSectionsLatex += `\\item \\textbf{\\textcolor{RiskHigh}{${escapeLatexText(alert)}}}\n`;
        }
        rawSectionsLatex += `\\end{itemize}\n`;
      }

      rawSectionsLatex += `\\section*{3. State-by-State Blue Sky Notice Filing Schedule (NSMIA Covered Securities)}\n`;
      rawSectionsLatex += `\\noindent\\begin{tabularx}{\\textwidth}{@{}p{0.5in}p{0.9in}p{1.4in}p{1.3in}X@{}}\n`;
      rawSectionsLatex += `\\toprule\n`;
      rawSectionsLatex += `\\textbf{State} & \\textbf{Deadline} & \\textbf{Statutory Fee} & \\textbf{Portal} & \\textbf{Regulatory Notes} \\\\\n`;
      rawSectionsLatex += `\\midrule\n`;
      for (const sf of stateFilings) {
        rawSectionsLatex += `\\textbf{${escapeLatexText(sf.state)}} & {\\footnotesize ${escapeLatexText(sf.filing_deadline)}} & {\\footnotesize ${escapeLatexText(sf.filing_fee)}} & {\\footnotesize ${escapeLatexText(sf.portal)}} & {\\footnotesize ${escapeLatexText(sf.instructions)}} \\\\[0.4em]\n`;
      }
      rawSectionsLatex += `\\bottomrule\n\\end{tabularx}\n`;

      const pdfRes = await compileStructuredLatexDocument({
        title: `${issuer_name} — SEC Form D & Blue Sky Filing Schedule`,
        layoutStyle: "diligence_report",
        rawSectionsLatex,
        memoHeaders: {
          to: `${issuer_name} Board & Executive Team`,
          from: "BasaltVigil Securities & Blue Sky Desk (Bannister / OHara / Neff)",
          date: new Date().toISOString().split("T")[0],
          subject: `Regulation D (${exemption_claimed.replace(/_/g, " ")}) & Multi-State Blue Sky Compliance Package`,
        },
        documentType: "securities_filing",
        createdBy: "Neff",
        idPrefixOverride: "FORM-D",
      });

      return {
        status: "success",
        sec_form_d_deadline: secFormDDeadline.toISOString().split("T")[0],
        compliance_alerts: complianceAlerts,
        state_blue_sky_schedule: stateFilings,
        pdf_package: pdfRes,
      };
    },
  }),
};
