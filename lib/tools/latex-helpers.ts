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
