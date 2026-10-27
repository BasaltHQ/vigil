// @ts-nocheck
import * as fs from "fs/promises";
import * as path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { cookies } from "next/headers";
import { prisma } from "../db";
import { thirdwebAuth } from "../auth";
import { FORTUNE_50_TEMPLATES } from "../templates/fortune50";
import {
  buildSectionsLatex,
  buildSignaturesLatex,
  buildMemoHeadersLatex,
} from "./latex-helpers";

export async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("thirdweb_auth_token")?.value;
    if (!token) return null;

    const authResult = await thirdwebAuth.verifyJWT({ jwt: token });
    if (!authResult.valid) return null;

    return authResult.parsedJWT.sub;
  } catch {
    return null;
  }
}

export async function getAuthUserProfile(): Promise<{ userId: string; profile: any }> {
  const userId = await getAuthUserId();
  if (userId) {
    try {
      const profile = await (prisma as any).profile.findUnique({ where: { id: userId } });
      if (profile) {
        return { userId, profile };
      }
    } catch {}
  }

  // Fallback for workbench or unauthenticated session: try first profile or synthetic default
  try {
    const firstProfile = await (prisma as any).profile.findFirst();
    if (firstProfile) {
      return { userId: firstProfile.id, profile: firstProfile };
    }
  } catch {}

  return {
    userId: userId || "anonymous",
    profile: {
      id: userId || "anonymous",
      companyName: "BASALT VIGIL CLIENT",
      docIdTemplate: "VARUNA-[YYYY]-[####]",
      docIdCounter: Math.floor(Math.random() * 900) + 100,
      brandAssets: {
        colors: { primary: "#8B0000", secondary: "#374151" },
        logos: [],
      },
      brandParameters: {},
    },
  };
}

export async function allocateNextDisplayId(userId: string, profile: any, prefixOverride?: string): Promise<string> {
  const currentCounter = profile?.docIdCounter || 0;
  const nextCounter = currentCounter + 1;
  const template = prefixOverride
    ? `${prefixOverride}-[YYYY]-[####]`
    : profile?.docIdTemplate || "VARUNA-[YYYY]-[####]";

  const displayId = template
    .replace("[YYYY]", new Date().getFullYear().toString())
    .replace("[####]", nextCounter.toString().padStart(4, "0"))
    .replace("[##]", nextCounter.toString().padStart(2, "0"))
    .replace("[#]", nextCounter.toString());

  if (userId && userId !== "anonymous") {
    try {
      await (prisma as any).profile.update({
        where: { id: userId },
        data: { docIdCounter: nextCounter },
      });
    } catch {}
  }

  return displayId;
}

export async function uploadOrSaveDocumentBuffer(
  buffer: Buffer,
  cleanFilename: string,
  ext: "pdf" | "docx" | "md",
  contentType: string
): Promise<string> {
  if (
    process.env.STORAGE_PROVIDER === "s3" &&
    process.env.S3_ACCESS_KEY &&
    process.env.S3_SECRET_KEY
  ) {
    try {
      const s3Client = new S3Client({
        region: process.env.S3_REGION || "us-west-or",
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
      });
      const key = `documents/${cleanFilename}_${Date.now()}.${ext}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME || "basaltvigil",
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ACL: "public-read",
        })
      );
      return `/api/s3/${key}`;
    } catch (e) {
      console.error("S3 upload failed, falling back to local public/docs:", e);
    }
  }

  const outDir = path.join(process.cwd(), "public", "docs");
  await fs.mkdir(outDir, { recursive: true });
  const filePath = path.join(outDir, `${cleanFilename}.${ext}`);
  await fs.writeFile(filePath, buffer);
  return `/docs/${cleanFilename}.${ext}`;
}

export interface CompileStructuredDocOptions {
  title: string;
  layoutStyle: string;
  sections?: { heading: string; content: string }[];
  rawSectionsLatex?: string;
  signatures?: { entity?: string; name: string; title: string }[];
  memoHeaders?: { to: string; from: string; date: string; subject: string } | null;
  documentType?: string;
  createdBy?: string;
  extraMetadata?: Record<string, any>;
  idPrefixOverride?: string;
}

export async function compileStructuredLatexDocument(
  options: CompileStructuredDocOptions
): Promise<{
  status: "success" | "failed";
  display_id?: string;
  file_url?: string;
  message?: string;
  error?: string;
}> {
  const {
    title,
    layoutStyle,
    sections = [],
    rawSectionsLatex,
    signatures = [],
    memoHeaders = null,
    documentType,
    createdBy = "Keyes",
    extraMetadata = {},
    idPrefixOverride,
  } = options;

  try {
    const { userId, profile } = await getAuthUserProfile();
    const displayId = await allocateNextDisplayId(userId, profile, idPrefixOverride);

    const layoutInfo =
      FORTUNE_50_TEMPLATES[layoutStyle] || FORTUNE_50_TEMPLATES["modern_dual_column"];

    let latex = layoutInfo.latex;

    const primaryColor =
      profile?.brandAssets?.colors?.primary?.replace("#", "") || "000000";
    const secondaryColor =
      profile?.brandAssets?.colors?.secondary?.replace("#", "") || "555555";
    const companyName =
      profile?.companyName || profile?.companyUrl || "COMPANY NAME";
    const logoUrl = profile?.brandAssets?.logos?.[0] || null;
    const isValidLogo =
      logoUrl &&
      !logoUrl.toLowerCase().includes(".svg") &&
      !logoUrl.toLowerCase().includes(".webp");
    const coverUrl = profile?.brandAssets?.coverImage || null;
    const isValidCover =
      coverUrl &&
      !coverUrl.toLowerCase().includes(".svg") &&
      !coverUrl.toLowerCase().includes(".webp");

    const companyHeader = isValidLogo
      ? `\\includegraphics[height=1.2cm]{logo.png}`
      : `\\textbf{\\textcolor{BrandPrimary}{${companyName}}}`;
    const coverImageBlock = isValidCover
      ? `\\includegraphics[width=\\textwidth,height=10cm,keepaspectratio]{cover.png}`
      : "";

    latex = latex.replace(/\[BRAND_PRIMARY\]/g, primaryColor);
    latex = latex.replace(/\[BRAND_SECONDARY\]/g, secondaryColor);
    latex = latex.replace(/\[COMPANY_HEADER\]/g, companyHeader);
    latex = latex.replace(/\[COMPANY_NAME\]/g, companyName);
    latex = latex.replace(/\[COVER_IMAGE_BLOCK\]/g, coverImageBlock);
    latex = latex.replace(/\[DISPLAY_ID\]/g, displayId);
    latex = latex.replace(/\[TITLE\]/g, title);

    const sectionsLatex =
      rawSectionsLatex !== undefined
        ? rawSectionsLatex
        : buildSectionsLatex(sections);
    latex = latex.replace("[SECTIONS_CONTENT]", sectionsLatex);

    const sigLatex = buildSignaturesLatex(signatures, layoutStyle);
    latex = latex.replace("[SIGNATURES_CONTENT]", sigLatex);

    const memoLatex = buildMemoHeadersLatex(
      layoutStyle === "internal_memo" || layoutStyle === "diligence_report"
        ? memoHeaders
        : null
    );
    latex = latex.replace("[MEMO_HEADERS]", memoLatex);

    const cleanFilename = displayId.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    const resources: any[] = [{ main: true, content: latex }];

    const toAbsoluteS3Url = (url: string) => {
      const endpoint = (process.env.S3_ENDPOINT || "").replace(/\/$/, "");
      const bucket = process.env.S3_BUCKET_NAME || "basaltvigil";

      if (url.startsWith("/api/s3/")) {
        const s3Key = url.replace("/api/s3/", "");
        if (endpoint.includes("ovh.us")) {
          const host = endpoint.replace("https://", "").replace("http://", "");
          return `https://${bucket}.${host}/${s3Key}`;
        }
        return `${endpoint}/${bucket}/${s3Key}`;
      } else if (
        endpoint.includes("ovh.us") &&
        url.includes(`${endpoint}/${bucket}`)
      ) {
        const host = endpoint.replace("https://", "").replace("http://", "");
        return url.replace(`${endpoint}/${bucket}`, `https://${bucket}.${host}`);
      }
      return url;
    };

    if (isValidLogo) {
      resources.push({ path: "logo.png", url: toAbsoluteS3Url(logoUrl) });
    }
    if (isValidCover) {
      resources.push({ path: "cover.png", url: toAbsoluteS3Url(coverUrl) });
    }

    const compileRes = await fetch("https://latex.ytotech.com/builds/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compiler: "pdflatex", resources }),
    });

    if (!compileRes.ok) {
      const errorBody = await compileRes.text();
      console.error(
        `[LaTeX Compile Error] Status: ${compileRes.status}, Body: ${errorBody}`
      );
      throw new Error(
        `LaTeX API compilation failed: ${compileRes.statusText} — ${errorBody.substring(0, 200)}`
      );
    }

    const pdfBuffer = Buffer.from(await compileRes.arrayBuffer());
    const publicUrl = await uploadOrSaveDocumentBuffer(
      pdfBuffer,
      cleanFilename,
      "pdf",
      "application/pdf"
    );

    if (userId && userId !== "anonymous") {
      try {
        await (prisma as any).document.create({
          data: {
            userId,
            displayId,
            title,
            filePath: publicUrl,
            fileSize: pdfBuffer.length,
            documentType: documentType || layoutStyle,
            format: "pdf",
            createdBy,
            metadata: {
              sections,
              signatures,
              memoHeaders,
              ...extraMetadata,
            },
          },
        });
      } catch (dbErr) {
        console.error("[Document DB Save Error]:", dbErr);
      }
    }

    return {
      status: "success",
      display_id: displayId,
      file_url: publicUrl,
      message: `Document successfully compiled and vaulted as ${displayId}. Present this exact markdown link to the user: [${displayId} - ${title}](${publicUrl})`,
    };
  } catch (error: any) {
    return {
      status: "failed",
      error: error.message || String(error),
    };
  }
}
