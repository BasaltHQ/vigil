import { Document, Paragraph, TextRun, Packer, HeadingLevel } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as fs from "fs/promises";
import * as path from "path";

// Helper to simulate jinja2 templates
async function templateEngineLoad(slug: string): Promise<string> {
  return "Default template body for " + slug;
}

export async function docWriterWord(template: string, data: Record<string, any>, saveAs: string): Promise<{ filePath: string, sections: number }> {
  // Simulating the Python doc_writer_word
  const templateBody = await templateEngineLoad(template);
  // Simple replacement (not full Jinja)
  let rendered = templateBody;
  for (const [key, value] of Object.entries(data)) {
    rendered = rendered.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
  }

  const sections = rendered.split('---');
  const docSections = [];

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const children = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith('# ')) {
        children.push(new Paragraph({ text: line.substring(2), heading: HeadingLevel.HEADING_1 }));
      } else if (line.startsWith('## ')) {
        children.push(new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2 }));
      } else if (line.startsWith('### ')) {
        children.push(new Paragraph({ text: line.substring(4), heading: HeadingLevel.HEADING_3 }));
      } else if (line.startsWith('**') && line.endsWith('**')) {
        children.push(new Paragraph({ children: [new TextRun({ text: line.substring(2, line.length - 2), bold: true })] }));
      } else if (line.startsWith('- ') || line.startsWith('☐ ')) {
        children.push(new Paragraph({ text: line.substring(2), bullet: { level: 0 } }));
      } else {
        children.push(new Paragraph({ text: line }));
      }
    }

    docSections.push({ children });
  }

  const doc = new Document({
    sections: docSections
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.mkdir(path.dirname(saveAs), { recursive: true });
  await fs.writeFile(saveAs, buffer);

  return { filePath: saveAs, sections: sections.length };
}

export async function docWriterPdf(source: string | string[], options: Record<string, any>, saveAs: string): Promise<{ filePath: string, pages: number }> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const sources = Array.isArray(source) ? source : [source];

  for (const content of sources) {
    let page = pdfDoc.addPage();
    let yPos = page.getHeight() - 50;

    const lines = content.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line) {
        yPos -= 12;
        continue;
      }

      if (yPos < 50) {
        page = pdfDoc.addPage();
        yPos = page.getHeight() - 50;
      }

      if (line.startsWith('# ')) {
        page.drawText(line.substring(2), { x: 50, y: yPos, size: 18, font: timesRomanBold, color: rgb(0, 0, 0.5) });
        yPos -= 30;
      } else if (line.startsWith('## ')) {
        page.drawText(line.substring(3), { x: 50, y: yPos, size: 14, font: timesRomanBold, color: rgb(0, 0, 0.5) });
        yPos -= 20;
      } else {
        page.drawText(line, { x: 50, y: yPos, size: 12, font: timesRomanFont });
        yPos -= 16;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  await fs.mkdir(path.dirname(saveAs), { recursive: true });
  await fs.writeFile(saveAs, pdfBytes);

  return { filePath: saveAs, pages: pdfDoc.getPageCount() };
}
