import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as fs from "fs/promises";
import * as path from "path";

export interface ReviewStakeholder {
  id: string;
  name: string;
  email: string;
  organization: string;
  role:
    | "LEAD_COUNSEL"
    | "CLIENT_EXECUTIVE"
    | "COUNTERPARTY_COUNSEL"
    | "SPECIALIST_PARTNER"
    | "OBSERVER";
  permissions: "FULL_EDIT" | "PROPOSE_AND_COMMENT" | "COMMENT_ONLY";
  status: "INVITED" | "VIEWED" | "CHANGES_REQUESTED" | "APPROVED";
  updatedAt: string;
}

export interface AnnotationReply {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface ClauseAnnotation {
  id: string;
  clauseId: string;
  clauseHeading: string;
  authorName: string;
  authorEmail?: string;
  authorRole: string;
  type: "QUESTION" | "REVISION_PROPOSAL" | "RISK_FLAG" | "APPROVAL_NOTE";
  selectedQuote?: string;
  comment: string;
  proposedText?: string;
  internalOnly?: boolean;
  resolved: boolean;
  createdAt: string;
  replies: AnnotationReply[];
}

export interface InteractiveClause {
  id: string;
  heading: string;
  category: string;
  riskSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  originalText: string;
  proposedText: string;
  rationale: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTER_PROPOSED";
  lastEditedBy?: string;
}

export interface ReviewSessionRecord {
  token: string;
  documentId?: string;
  displayId?: string;
  title: string;
  counterpartyName: string;
  matterReference: string;
  negotiationPosture: string;
  hideInternalNotesFromExternal: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  clauses: InteractiveClause[];
  stakeholders: ReviewStakeholder[];
  annotations: ClauseAnnotation[];
}

const REVIEWS_DIR = path.join(process.cwd(), "public", "docs", "reviews");

async function ensureReviewsDir() {
  try {
    await fs.mkdir(REVIEWS_DIR, { recursive: true });
  } catch {}
}

async function readReviewFromDisk(
  token: string
): Promise<ReviewSessionRecord | null> {
  try {
    await ensureReviewsDir();
    const safeToken = token.replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(REVIEWS_DIR, `${safeToken}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeReviewToDisk(session: ReviewSessionRecord): Promise<void> {
  try {
    await ensureReviewsDir();
    const safeToken = session.token.replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(REVIEWS_DIR, `${safeToken}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2), "utf-8");
  } catch (e) {
    console.warn("[Review API] Failed to write review file:", e);
  }
}

async function syncReviewToDatabase(session: ReviewSessionRecord) {
  if (!session.documentId) return;
  try {
    const existing = await prisma.document.findUnique({
      where: { id: session.documentId },
    });
    if (existing) {
      const prevMeta =
        existing.metadata && typeof existing.metadata === "object"
          ? (existing.metadata as Record<string, any>)
          : {};
      await prisma.document.update({
        where: { id: session.documentId },
        data: {
          metadata: {
            ...prevMeta,
            reviewSession: JSON.parse(JSON.stringify(session)),
          } as any,
        },
      });
    }
  } catch (e) {
    console.warn("[Review API] Non-fatal DB sync warning:", e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const externalView = searchParams.get("external") === "true";

    if (token) {
      let session = await readReviewFromDisk(token);

      if (!session) {
        // Fallback: check prisma documents metadata
        try {
          const docs = await prisma.document.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
          });
          for (const d of docs) {
            const meta = (d.metadata || {}) as any;
            if (meta?.reviewSession?.token === token) {
              session = meta.reviewSession as ReviewSessionRecord;
              break;
            }
          }
        } catch {}
      }

      if (!session) {
        return NextResponse.json(
          { error: "Review session not found" },
          { status: 404 }
        );
      }

      // Filter internal notes if viewed by an external stakeholder and hideInternalNotesFromExternal is true
      if (externalView && session.hideInternalNotesFromExternal) {
        session = {
          ...session,
          clauses: session.clauses.map((c) => ({
            ...c,
            rationale:
              "Shared for counterparty review — internal counsel risk memo hidden.",
          })),
          annotations: session.annotations.filter((a) => !a.internalOnly),
        };
      }

      return NextResponse.json({ session });
    }

    // List all saved review sessions
    await ensureReviewsDir();
    const files = await fs.readdir(REVIEWS_DIR);
    const sessions: ReviewSessionRecord[] = [];
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(REVIEWS_DIR, f), "utf-8");
        sessions.push(JSON.parse(raw));
      } catch {}
    }
    sessions.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return NextResponse.json({ sessions });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to load review session" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token =
      body.token ||
      `rev-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;

    const existing = await readReviewFromDisk(token);
    const now = new Date().toISOString();

    const session: ReviewSessionRecord = {
      token,
      documentId: body.documentId ?? existing?.documentId,
      displayId: body.displayId ?? existing?.displayId ?? "VIGIL-REV-001",
      title: body.title ?? existing?.title ?? "Master Commercial Agreement",
      counterpartyName:
        body.counterpartyName ??
        existing?.counterpartyName ??
        "Counterparty Holdings, Inc.",
      matterReference:
        body.matterReference ??
        existing?.matterReference ??
        "M&A / Commercial Negotiation",
      negotiationPosture:
        body.negotiationPosture ?? existing?.negotiationPosture ?? "Balanced",
      hideInternalNotesFromExternal:
        body.hideInternalNotesFromExternal ??
        existing?.hideInternalNotesFromExternal ??
        true,
      expiresAt: body.expiresAt ?? existing?.expiresAt,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      clauses: body.clauses ?? existing?.clauses ?? [],
      stakeholders: body.stakeholders ?? existing?.stakeholders ?? [],
      annotations: body.annotations ?? existing?.annotations ?? [],
    };

    await writeReviewToDisk(session);
    await syncReviewToDatabase(session);

    return NextResponse.json({
      success: true,
      token: session.token,
      reviewUrl: `/review/${session.token}`,
      session,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to save review session" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, action } = body;
    if (!token) {
      return NextResponse.json(
        { error: "Review token is required" },
        { status: 400 }
      );
    }

    const session = await readReviewFromDisk(token);
    if (!session) {
      return NextResponse.json(
        { error: "Review session not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    if (action === "add_annotation") {
      const newAnnotation: ClauseAnnotation = {
        id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        clauseId: body.clauseId || session.clauses[0]?.id || "clause-1",
        clauseHeading: body.clauseHeading || "General Provision",
        authorName: body.authorName || "External Stakeholder",
        authorEmail: body.authorEmail || "",
        authorRole: body.authorRole || "COUNTERPARTY_COUNSEL",
        type: body.type || "QUESTION",
        selectedQuote: body.selectedQuote || "",
        comment: body.comment || "",
        proposedText: body.proposedText || "",
        internalOnly: Boolean(body.internalOnly),
        resolved: false,
        createdAt: now,
        replies: [],
      };
      session.annotations = [newAnnotation, ...session.annotations];

      // If the annotation includes a counter-proposal and updateClause is true, mark clause as COUNTER_PROPOSED
      if (body.proposedText && body.applyToClause) {
        session.clauses = session.clauses.map((c) =>
          c.id === newAnnotation.clauseId
            ? {
                ...c,
                proposedText: body.proposedText,
                status: "COUNTER_PROPOSED",
                lastEditedBy: newAnnotation.authorName,
              }
            : c
        );
      }
    } else if (action === "reply_annotation") {
      const { annotationId, authorName, authorRole, content } = body;
      session.annotations = session.annotations.map((a) =>
        a.id === annotationId
          ? {
              ...a,
              replies: [
                ...a.replies,
                {
                  id: `rep-${Date.now()}`,
                  authorName: authorName || "Stakeholder",
                  authorRole: authorRole || "COUNSEL",
                  content: content || "",
                  createdAt: now,
                },
              ],
            }
          : a
      );
    } else if (action === "toggle_resolve") {
      const { annotationId } = body;
      session.annotations = session.annotations.map((a) =>
        a.id === annotationId ? { ...a, resolved: !a.resolved } : a
      );
    } else if (action === "update_clause") {
      const { clauseId, status, proposedText, rationale, lastEditedBy } = body;
      session.clauses = session.clauses.map((c) =>
        c.id === clauseId
          ? {
              ...c,
              ...(status ? { status } : {}),
              ...(proposedText !== undefined ? { proposedText } : {}),
              ...(rationale !== undefined ? { rationale } : {}),
              ...(lastEditedBy ? { lastEditedBy } : {}),
            }
          : c
      );
    } else if (action === "update_stakeholder_status") {
      const { stakeholderId, name, email, role, organization, status } = body;
      const found = session.stakeholders.find(
        (s) =>
          s.id === stakeholderId ||
          (email && s.email.toLowerCase() === email.toLowerCase())
      );
      if (found) {
        session.stakeholders = session.stakeholders.map((s) =>
          s.id === found.id ? { ...s, status, updatedAt: now } : s
        );
      } else if (name) {
        session.stakeholders.push({
          id: `stk-${Date.now()}`,
          name,
          email: email || "",
          organization: organization || "External Reviewer",
          role: role || "COUNTERPARTY_COUNSEL",
          permissions: "PROPOSE_AND_COMMENT",
          status: status || "VIEWED",
          updatedAt: now,
        });
      }
    } else if (action === "add_stakeholder") {
      const newStk: ReviewStakeholder = {
        id: `stk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: body.name || "Stakeholder",
        email: body.email || "",
        organization: body.organization || "Partner Organization",
        role: body.role || "CLIENT_EXECUTIVE",
        permissions: body.permissions || "PROPOSE_AND_COMMENT",
        status: "INVITED",
        updatedAt: now,
      };
      session.stakeholders.push(newStk);
    }

    session.updatedAt = now;
    await writeReviewToDisk(session);
    await syncReviewToDatabase(session);

    return NextResponse.json({ success: true, session });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to update review session" },
      { status: 500 }
    );
  }
}
