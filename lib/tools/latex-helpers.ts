// Generates the LaTeX fragment for sections, signatures, and memo headers.
// All functions return raw LaTeX strings (with real backslashes).

export function escapeLatexText(text: string | undefined | null): string {
  if (!text) return '';
  // Escape characters that have special meaning in LaTeX text mode
  // \, {, }, _, ^, &, %, $, #, ~
  return String(text)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/_/g, '\\_')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/~/g, '\\textasciitilde{}');
}

export function buildSectionsLatex(sections: { heading: string; content: string }[]): string {
  let result = '';
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    // We don't fully escape sections content as the agent might intentionally use LaTeX formatting there
    // But we MUST escape unescaped underscores, because the agent often draws signature lines like "By: ______"
    // which breaks LaTeX outside of math mode.
    const safeContent = s.content ? String(s.content).replace(/(?<!\\)_/g, '\\_') : '';
    
    result += `\\section*{${escapeLatexText(s.heading)}}\n${safeContent}\n`;
    if (i < sections.length - 1) {
      result += `\n\\vspace{1em}\n`;
    }
  }
  return result;
}

export function buildSignaturesLatex(
  signatures: { entity?: string; name: string; title: string }[],
  layoutStyle: string
): string {
  if (!signatures || signatures.length === 0) return '';
  
  let result = '';
  
  if (layoutStyle === 'modern_dual_column' || layoutStyle === 'mutual_nda') {
    result += `\\begin{tabular}{@{}p{3in}p{3in}@{}}\n`;
    for (let i = 0; i < signatures.length; i += 2) {
      const left = signatures[i];
      const right = signatures[i+1];
      result += `\\textbf{\\textcolor{BrandPrimary}{${escapeLatexText(left.entity || 'PARTY')}}} & ${right ? `\\textbf{\\textcolor{BrandPrimary}{${escapeLatexText(right.entity || 'PARTY')}}}` : ''} \\\\\n`;
      result += `By: \\hrulefill & ${right ? 'By: \\hrulefill' : ''} \\\\\n`;
      result += `Name: ${escapeLatexText(left.name)} & ${right ? `Name: ${escapeLatexText(right.name)}` : ''} \\\\\n`;
      result += `Title: ${escapeLatexText(left.title)} & ${right ? `Title: ${escapeLatexText(right.title)}` : ''} \\\\\n`;
      result += `\\\\[2em]\n`;
    }
    result += `\\end{tabular}`;
  } else if (layoutStyle === 'founder_equity_grid') {
    result += `\\begin{tabular}{@{}p{2.5in}p{0.5in}p{2.5in}@{}}\n`;
    for (let i = 0; i < signatures.length; i += 2) {
      const left = signatures[i];
      const right = signatures[i+1];
      result += `\\textbf{\\textcolor{BrandPrimary}{${escapeLatexText(left.entity || 'THE COMPANY')}}} & & ${right ? `\\textbf{\\textcolor{BrandPrimary}{${escapeLatexText(right.entity || 'PURCHASER')}}}` : ''} \\\\\n`;
      result += `\\\\[1em]\n`;
      result += `By: \\hrulefill & & ${right ? 'By: \\hrulefill' : ''} \\\\\n`;
      result += `Name: ${escapeLatexText(left.name)} & & ${right ? `Name: ${escapeLatexText(right.name)}` : ''} \\\\\n`;
      result += `Title: ${escapeLatexText(left.title)} & & ${right ? `Title: ${escapeLatexText(right.title)}` : ''} \\\\\n`;
      result += `Date: \\hrulefill & & ${right ? 'Date: \\hrulefill' : ''} \\\\\n`;
      result += `\\\\[3em]\n`;
    }
    result += `\\end{tabular}`;
  } else {
    for (const sig of signatures) {
      result += `\\noindent\n`;
      result += `\\textbf{\\textcolor{BrandPrimary}{${escapeLatexText(sig.entity || '')}}}\\\\[1em]\n`;
      result += `\\hrulefill \\\\\n`;
      result += `\\textbf{${escapeLatexText(sig.name)}}, ${escapeLatexText(sig.title)}\\\\[2em]\n`;
    }
  }
  
  return result;
}

export function buildMemoHeadersLatex(
  headers: { to: string; from: string; date: string; subject: string } | null
): string {
  if (!headers) return '';
  let result = `\\begin{tabular}{@{}ll}\n`;
  result += `\\textbf{TO:} & ${escapeLatexText(headers.to)} \\\\\n`;
  result += `\\textbf{FROM:} & ${escapeLatexText(headers.from)} \\\\\n`;
  result += `\\textbf{DATE:} & ${escapeLatexText(headers.date)} \\\\\n`;
  result += `\\textbf{SUBJECT:} & ${escapeLatexText(headers.subject)} \\\\\n`;
  result += `\\end{tabular}\n`;
  return result;
}

export interface DiffSegment {
  type: 'equal' | 'delete' | 'insert';
  text: string;
}

export interface WordDiffResult {
  segments: DiffSegment[];
  stats: {
    wordsAdded: number;
    wordsDeleted: number;
    wordsUnchanged: number;
    changeRatio: number;
  };
}

/**
 * Deterministic token/word-level Longest Common Subsequence (LCS) diff engine
 * for legal contract redlining and blacklining.
 */
export function computeWordDiff(originalText: string, revisedText: string): WordDiffResult {
  const orig = (originalText || '').trim();
  const rev = (revisedText || '').trim();

  if (orig === rev) {
    const wordCount = orig ? orig.split(/\s+/).length : 0;
    return {
      segments: orig ? [{ type: 'equal', text: orig }] : [],
      stats: { wordsAdded: 0, wordsDeleted: 0, wordsUnchanged: wordCount, changeRatio: 0 }
    };
  }

  // Tokenize preserving whitespace attached to words for natural reconstruction
  const origTokens = orig ? orig.match(/\S+\s*/g) || [] : [];
  const revTokens = rev ? rev.match(/\S+\s*/g) || [] : [];

  const m = origTokens.length;
  const n = revTokens.length;

  const rawOps: DiffSegment[] = [];

  // Use exact LCS DP table for typical clause sizes (m * n <= 400,000),
  // or sentence-chunked LCS for massive multi-page clauses
  if (m * n <= 400000) {
    const dp: Int32Array[] = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (origTokens[i].trim() === revTokens[j].trim()) {
          dp[i][j] = 1 + dp[i + 1][j + 1];
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    let i = 0;
    let j = 0;
    while (i < m && j < n) {
      if (origTokens[i].trim() === revTokens[j].trim()) {
        rawOps.push({ type: 'equal', text: revTokens[j] });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        rawOps.push({ type: 'delete', text: origTokens[i] });
        i++;
      } else {
        rawOps.push({ type: 'insert', text: revTokens[j] });
        j++;
      }
    }
    while (i < m) {
      rawOps.push({ type: 'delete', text: origTokens[i++] });
    }
    while (j < n) {
      rawOps.push({ type: 'insert', text: revTokens[j++] });
    }
  } else {
    // Sentence-level fallback for very large blocks
    const origSentences = orig.split(/(?<=[.!?])\s+/);
    const revSentences = rev.split(/(?<=[.!?])\s+/);
    const sm = origSentences.length;
    const sn = revSentences.length;
    const dp: number[][] = Array.from({ length: sm + 1 }, () => Array(sn + 1).fill(0));
    for (let i = sm - 1; i >= 0; i--) {
      for (let j = sn - 1; j >= 0; j--) {
        if (origSentences[i].trim() === revSentences[j].trim()) {
          dp[i][j] = 1 + dp[i + 1][j + 1];
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }
    let i = 0;
    let j = 0;
    while (i < sm && j < sn) {
      if (origSentences[i].trim() === revSentences[j].trim()) {
        rawOps.push({ type: 'equal', text: revSentences[j] + ' ' });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        rawOps.push({ type: 'delete', text: origSentences[i] + ' ' });
        i++;
      } else {
        rawOps.push({ type: 'insert', text: revSentences[j] + ' ' });
        j++;
      }
    }
    while (i < sm) rawOps.push({ type: 'delete', text: origSentences[i++] + ' ' });
    while (j < sn) rawOps.push({ type: 'insert', text: revSentences[j++] + ' ' });
  }

  // Coalesce adjacent segments of the same type
  const coalesced: DiffSegment[] = [];
  for (const op of rawOps) {
    if (coalesced.length > 0 && coalesced[coalesced.length - 1].type === op.type) {
      coalesced[coalesced.length - 1].text += op.text;
    } else {
      coalesced.push({ ...op });
    }
  }

  let wordsAdded = 0;
  let wordsDeleted = 0;
  let wordsUnchanged = 0;

  for (const seg of coalesced) {
    const wc = seg.text.trim() ? seg.text.trim().split(/\s+/).length : 0;
    if (seg.type === 'insert') wordsAdded += wc;
    else if (seg.type === 'delete') wordsDeleted += wc;
    else wordsUnchanged += wc;
  }

  const totalWords = Math.max(1, wordsUnchanged + wordsDeleted + wordsAdded);
  const changeRatio = Number(((wordsAdded + wordsDeleted) / totalWords).toFixed(3));

  return {
    segments: coalesced,
    stats: { wordsAdded, wordsDeleted, wordsUnchanged, changeRatio }
  };
}

/**
 * Renders DiffSegments into ulem/xcolor LaTeX markup for track-changes PDF compilation.
 */
export function buildRedlineLatexFromDiff(segments: DiffSegment[]): string {
  return segments
    .map(seg => {
      const trailingSpace = /\s+$/.test(seg.text) ? ' ' : '';
      const trimmed = seg.text.trim();
      if (!trimmed) return trailingSpace;
      const escaped = escapeLatexText(trimmed);
      if (seg.type === 'delete') {
        return `\\textcolor{RedlineDel}{\\sout{${escaped}}}${trailingSpace}`;
      }
      if (seg.type === 'insert') {
        return `\\textcolor{RedlineIns}{\\uline{${escaped}}}${trailingSpace}`;
      }
      return `${escaped}${trailingSpace}`;
    })
    .join('');
}

/**
 * Renders DiffSegments into Markdown track-changes format.
 */
export function buildRedlineMarkdownFromDiff(segments: DiffSegment[]): string {
  return segments
    .map(seg => {
      const trailingSpace = /\s+$/.test(seg.text) ? ' ' : '';
      const trimmed = seg.text.trim();
      if (!trimmed) return trailingSpace;
      if (seg.type === 'delete') {
        return `~~${trimmed}~~${trailingSpace}`;
      }
      if (seg.type === 'insert') {
        return `**++${trimmed}++**${trailingSpace}`;
      }
      return `${trimmed}${trailingSpace}`;
    })
    .join('');
}

