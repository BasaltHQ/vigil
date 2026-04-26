import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { generateObject } from 'ai';
import { createAzure } from '@ai-sdk/azure';
import { z } from 'zod';

export const maxDuration = 60; // Allow 60 seconds for scraping and analysis

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    // Validate URL
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }

    console.log('[Brand Analysis] Scraping via Jina AI', targetUrl);
    
    // Scrape via Jina AI to bypass Cloudflare and get clean markdown
    const jinaRes = await fetch(`https://r.jina.ai/${targetUrl}`, {
      headers: { 'Accept': 'text/plain' }
    });
    
    if (!jinaRes.ok) {
      throw new Error(`Jina AI scrape failed: ${jinaRes.statusText}`);
    }
    
    const rawText = await jinaRes.text();
    // Intentionally skipped image scraping to enforce manual logo uploads
    const imageElements: string[] = [];

    console.log('[Brand Analysis] Scraping complete, analyzing with Azure OpenAI...');

    // Analyze using Azure OpenAI
    const azure = createAzure({
      resourceName: process.env.AZURE_RESOURCE_NAME,
      apiKey: process.env.AZURE_API_KEY,
    });

    const { object } = await generateObject({
      model: azure.chat(process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5.4-mini'),
      schema: z.object({
        companyName: z.string().describe("The name of the company or brand extracted from the text."),
        colors: z.object({
          primary: z.string().describe("The primary brand color hex code (e.g., #000000)"),
          secondary: z.string().describe("A secondary brand color hex code"),
        }),
        typography: z.array(z.string()).describe("Likely font families used by the brand (e.g., 'Inter', 'Helvetica Neue')"),
        tone: z.string().describe("A 2-3 sentence description of the company's tone of voice and brand personality based on the text."),
        mission: z.string().describe("The company's core mission statement or primary objective based on the text."),
        audience: z.string().describe("The primary target audience or ideal customer profile of the company."),
        offerings: z.array(z.string()).describe("A list of 3-5 key products, services, or value propositions of the company."),
      }),
      prompt: `You are an expert brand analyst. Analyze the following scraped content from ${targetUrl} and extract the brand identity.
      
      Potential image URLs found on page:
      ${imageElements.slice(0, 50).join('\n')}
      
      Raw Text Content:
      ${rawText.substring(0, 15000)}
      `
    });

    return NextResponse.json({ success: true, profile: object });
  } catch (error: any) {
    console.error('[Brand Analysis] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze brand' }, { status: 500 });
  }
}
