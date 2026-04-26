import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import TurndownService from 'turndown';

// Turndown service converts HTML to Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let markdown = '';

    console.log(`[Parser] Processing file: ${file.name} (${file.type})`);

    // PDF Parsing
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const parser = new PDFParse(new Uint8Array(arrayBuffer));
      const data = await parser.getText();
      markdown = data.text;
    } 
    // DOCX Parsing
    else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      file.name.toLowerCase().endsWith('.docx')
    ) {
      const result = await mammoth.convertToHtml({ buffer });
      const html = result.value;
      markdown = turndownService.turndown(html);
    } 
    // TXT/MD Parsing (Direct read)
    else if (
      file.type.startsWith('text/') || 
      file.name.toLowerCase().match(/\.(md|txt|csv|json)$/)
    ) {
      markdown = buffer.toString('utf-8');
    }
    // Unsupported
    else {
      return NextResponse.json({ 
        error: 'Unsupported file type. Supported types: PDF, DOCX, TXT, MD.',
        type: file.type 
      }, { status: 415 });
    }

    // Clean up excessive whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

    return NextResponse.json({ 
      success: true, 
      filename: file.name,
      markdown,
      length: markdown.length
    });

  } catch (error: any) {
    console.error('[Parser] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse document' }, { status: 500 });
  }
}
