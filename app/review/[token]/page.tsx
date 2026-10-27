"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Send,
  Edit3,
  Shield,
  Users,
  Clock,
  FileText,
  Check,
  X,
  CornerDownRight,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

function computeWordDiffTokens(original: string, revised: string) {
  const origWords = (original || "").trim().split(/(\s+)/);
  const revWords = (revised || "").trim().split(/(\s+)/);
  const m = origWords.length;
  const n = revWords.length;

  if (m * n > 250000) {
    return [
      { type: "del" as const, text: original },
      { type: "same" as const, text: " " },
      { type: "ins" as const, text: revised },
    ];
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (origWords[i] === revWords[j]) dp[i][j] = 1 + dp[i + 1][j + 1];
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out: Array<{ type: "same" | "del" | "ins"; text: string }> = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (origWords[i] === revWords[j]) {
      out.push({ type: "same", text: origWords[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", text: origWords[i] });
      i++;
    } else {
      out.push({ type: "ins", text: revWords[j] });
      j++;
    }
  }
  while (i < m) out.push({ type: "del", text: origWords[i++] });
  while (j < n) out.push({ type: "ins", text: revWords[j++] });
  return out;
}

export default function StakeholderReviewPortalPage() {
  const params = useParams();
  const token = String(params?.token || "");

  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stakeholder identity
  const [reviewerName, setReviewerName] = useState("Jordan Vance");
  const [reviewerOrg, setReviewerOrg] = useState("Counterparty Legal Group");
  const [reviewerRole, setReviewerRole] = useState("COUNTERPARTY_COUNSEL");

  // UI view state
  const [selectedClauseId, setSelectedClauseId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"diff" | "side_by_side" | "clean">(
    "diff"
  );
  const [mobileTab, setMobileTab] = useState<"clauses" | "annotations">(
    "clauses"
  );

  // Annotation composer state
  const [annType, setAnnType] = useState<
    "QUESTION" | "REVISION_PROPOSAL" | "RISK_FLAG" | "APPROVAL_NOTE"
  >("REVISION_PROPOSAL");
  const [annComment, setAnnComment] = useState("");
  const [annProposedText, setAnnProposedText] = useState("");
  const [applyCounterToClause, setApplyCounterToClause] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Reply state
  const [replyTextByAnn, setReplyTextByAnn] = useState<Record<string, string>>(
    {}
  );

  const fetchSession = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `/api/documents/review?token=${encodeURIComponent(
          token
        )}&external=true`
      );
      if (!res.ok) {
        setError("This stakeholder review link was not found or has expired.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSession(data.session);
      if (data.session?.clauses?.length > 0 && !selectedClauseId) {
        setSelectedClauseId(data.session.clauses[0].id);
        setAnnProposedText(data.session.clauses[0].proposedText || "");
      }
      if (data.session?.stakeholders?.length > 0) {
        const externalStk =
          data.session.stakeholders.find(
            (s: any) => s.role !== "LEAD_COUNSEL"
          ) || data.session.stakeholders[0];
        if (externalStk) {
          setReviewerName(externalStk.name);
          setReviewerOrg(externalStk.organization);
          setReviewerRole(externalStk.role);
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to load review session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [token]);

  const activeClause = useMemo(() => {
    if (!session?.clauses) return null;
    return (
      session.clauses.find((c: any) => c.id === selectedClauseId) ||
      session.clauses[0] ||
      null
    );
  }, [session, selectedClauseId]);

  const handleSelectClause = (clause: any) => {
    setSelectedClauseId(clause.id);
    setAnnProposedText(clause.proposedText || clause.originalText || "");
  };

  const handleSubmitAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annComment.trim() && !annProposedText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/documents/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "add_annotation",
          clauseId: activeClause?.id,
          clauseHeading: activeClause?.heading,
          authorName: reviewerName,
          authorRole: reviewerRole,
          type: annType,
          comment:
            annComment.trim() ||
            `Submitted ${annType.replace("_", " ").toLowerCase()} on ${
              activeClause?.heading
            }`,
          proposedText:
            annType === "REVISION_PROPOSAL" ? annProposedText : undefined,
          applyToClause:
            annType === "REVISION_PROPOSAL" && applyCounterToClause,
          internalOnly: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        setAnnComment("");
        setStatusBanner(
          "Your stakeholder annotation & redline contribution has been synced to the matter ledger."
        );
        setTimeout(() => setStatusBanner(null), 4000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (annotationId: string) => {
    const text = replyTextByAnn[annotationId];
    if (!text?.trim()) return;
    const res = await fetch("/api/documents/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        action: "reply_annotation",
        annotationId,
        authorName: reviewerName,
        authorRole: reviewerRole,
        content: text.trim(),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSession(data.session);
      setReplyTextByAnn((prev) => ({ ...prev, [annotationId]: "" }));
    }
  };

  const handleStakeholderDecision = async (
    decision: "APPROVED" | "CHANGES_REQUESTED"
  ) => {
    const res = await fetch("/api/documents/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        action: "update_stakeholder_status",
        name: reviewerName,
        organization: reviewerOrg,
        role: reviewerRole,
        status: decision,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSession(data.session);
      setStatusBanner(
        decision === "APPROVED"
          ? `Recorded formal sign-off approval from ${reviewerName} (${reviewerOrg}).`
          : `Recorded revision request from ${reviewerName} (${reviewerOrg}).`
      );
      setTimeout(() => setStatusBanner(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040507] text-zinc-100 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center mx-auto animate-pulse">
            <Scale size={20} className="text-red-400" />
          </div>
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            Decrypting Stakeholder Redline Session...
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#040507] text-zinc-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-[#090b10] border border-red-500/30 p-6 text-center space-y-4">
          <AlertTriangle size={28} className="text-red-400 mx-auto" />
          <h1 className="text-lg font-bold text-white">
            Stakeholder Review Link Unavailable
          </h1>
          <p className="text-xs text-zinc-400">{error}</p>
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-xs font-mono font-bold text-white"
          >
            <ArrowLeft size={13} /> Return to Document Workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#040507] text-zinc-100">
      {/* TOP STAKEHOLDER PORTAL HEADER */}
      <header className="px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#080a0f]/95 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href={`/documents?reviewToken=${encodeURIComponent(token)}`}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 text-xs flex items-center gap-1.5 no-underline"
            title="Open in Full Counsel Workspace"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline font-mono text-[11px]">
              Counsel View
            </span>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-[10px] font-mono font-bold text-red-300 uppercase">
                STAKEHOLDER REVIEW PORTAL
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {session.displayId} • {session.counterpartyName}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white mt-0.5">
              {session.title}
            </h1>
          </div>
        </div>

        {/* Stakeholder Identity & 1-Click Sign-Off */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5">
            <Users size={13} className="text-red-400" />
            <input
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none w-28 sm:w-36"
              placeholder="Your Name"
            />
            <select
              value={reviewerRole}
              onChange={(e) => setReviewerRole(e.target.value)}
              className="bg-[#0c0f17] text-[10px] font-mono text-zinc-300 rounded px-1.5 py-0.5 border border-white/10"
            >
              <option value="COUNTERPARTY_COUNSEL">Counterparty Counsel</option>
              <option value="CLIENT_EXECUTIVE">Client Executive</option>
              <option value="SPECIALIST_PARTNER">Specialist Partner</option>
              <option value="OBSERVER">Board / Observer</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleStakeholderDecision("CHANGES_REQUESTED")}
            className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-[11px] font-mono font-semibold text-amber-200 flex items-center gap-1.5"
          >
            <Edit3 size={12} />
            <span>Request Changes</span>
          </button>

          <button
            type="button"
            onClick={() => handleStakeholderDecision("APPROVED")}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-mono font-bold text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <CheckCircle2 size={13} />
            <span>Approve Redline</span>
          </button>
        </div>
      </header>

      {statusBanner && (
        <div className="px-4 py-2 bg-emerald-950/70 border-b border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center justify-between">
          <span>✓ {statusBanner}</span>
          <button onClick={() => setStatusBanner(null)}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* MOBILE TAB SWITCHER */}
      <div className="lg:hidden flex border-b border-white/[0.08] bg-[#090b10]">
        <button
          type="button"
          onClick={() => setMobileTab("clauses")}
          className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 ${
            mobileTab === "clauses"
              ? "border-red-500 text-white font-bold bg-red-500/10"
              : "border-transparent text-zinc-400"
          }`}
        >
          Contract Redlines ({session.clauses?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("annotations")}
          className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 ${
            mobileTab === "annotations"
              ? "border-red-500 text-white font-bold bg-red-500/10"
              : "border-transparent text-zinc-400"
          }`}
        >
          Annotations & Counter-Edits ({session.annotations?.length || 0})
        </button>
      </div>

      {/* MAIN RESPONSIVE SPLIT WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT / CENTER: CLAUSE-BY-CLAUSE REDLINE READER */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 ${
            mobileTab === "annotations" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-red-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Click any clause to comment or propose counter-redlines
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-lg border border-white/10">
              {(
                [
                  { id: "diff", label: "Track Changes" },
                  { id: "side_by_side", label: "Side-by-Side" },
                  { id: "clean", label: "Clean Text" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewMode(m.id)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase ${
                    viewMode === m.id
                      ? "bg-red-600 text-white font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {(session.clauses || []).map((clause: any) => {
            const isSelected = clause.id === activeClause?.id;
            const tokens = computeWordDiffTokens(
              clause.originalText,
              clause.proposedText
            );
            const clauseAnns = (session.annotations || []).filter(
              (a: any) => a.clauseId === clause.id
            );

            return (
              <div
                key={clause.id}
                onClick={() => handleSelectClause(clause)}
                className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all ${
                  isSelected
                    ? "bg-[#0d111a] border-red-500/50 shadow-[0_0_25px_rgba(220,38,38,0.12)]"
                    : "bg-[#090c12] border-white/[0.07] hover:border-white/20"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {clause.heading}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-300">
                      {clause.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {clauseAnns.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[10px] font-mono text-blue-300">
                        💬 {clauseAnns.length}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        clause.status === "ACCEPTED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : clause.status === "COUNTER_PROPOSED"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {clause.status}
                    </span>
                  </div>
                </div>

                {viewMode === "diff" && (
                  <div className="text-xs sm:text-sm leading-relaxed text-zinc-200 bg-black/40 p-3.5 rounded-xl border border-white/[0.05]">
                    {tokens.map((t, idx) =>
                      t.type === "del" ? (
                        <del
                          key={idx}
                          className="bg-red-500/20 text-red-300 line-through px-0.5 rounded"
                        >
                          {t.text}
                        </del>
                      ) : t.type === "ins" ? (
                        <ins
                          key={idx}
                          className="bg-blue-500/20 text-blue-200 underline decoration-blue-400 px-0.5 rounded"
                        >
                          {t.text}
                        </ins>
                      ) : (
                        <span key={idx}>{t.text}</span>
                      )
                    )}
                  </div>
                )}

                {viewMode === "side_by_side" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-red-950/15 border border-red-500/20">
                      <div className="text-[10px] font-mono uppercase text-red-300 mb-1">
                        Original Baseline
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {clause.originalText}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-950/15 border border-blue-500/20">
                      <div className="text-[10px] font-mono uppercase text-blue-300 mb-1">
                        Current Proposed Markup
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed">
                        {clause.proposedText}
                      </p>
                    </div>
                  </div>
                )}

                {viewMode === "clean" && (
                  <div className="text-xs sm:text-sm leading-relaxed text-zinc-200 bg-black/40 p-3.5 rounded-xl border border-white/[0.05]">
                    {clause.status === "REJECTED"
                      ? clause.originalText
                      : clause.proposedText}
                  </div>
                )}

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>
                    Counsel Note: <em>{clause.rationale}</em>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectClause(clause);
                      setMobileTab("annotations");
                    }}
                    className="text-red-300 hover:text-red-200 font-mono text-[10px] flex-shrink-0 ml-2"
                  >
                    + Annotate / Counter-Edit →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT PANE: STAKEHOLDER ANNOTATION & COUNTER-REDLINE COMPOSER */}
        <aside
          className={`w-full lg:w-[430px] xl:w-[460px] flex-shrink-0 border-l border-white/[0.08] bg-[#080a10] flex flex-col ${
            mobileTab === "clauses" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-white/[0.08]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">
              ACTIVE CLAUSE FOR ANNOTATION
            </div>
            <div className="text-sm font-bold text-white truncate mt-0.5">
              {activeClause?.heading || "Select a clause"}
            </div>

            <form onSubmit={handleSubmitAnnotation} className="mt-3 space-y-2.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {(
                  [
                    { id: "REVISION_PROPOSAL", label: "Counter-Edit" },
                    { id: "QUESTION", label: "Question" },
                    { id: "RISK_FLAG", label: "Objection" },
                    { id: "APPROVAL_NOTE", label: "Sign-Off" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAnnType(t.id)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-mono uppercase border ${
                      annType === t.id
                        ? "bg-red-600/25 border-red-500/50 text-white font-bold"
                        : "bg-white/[0.02] border-white/10 text-zinc-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={annComment}
                onChange={(e) => setAnnComment(e.target.value)}
                placeholder="Add your comment, question, or rationale for opposing/modifying this clause..."
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500/50"
              />

              {annType === "REVISION_PROPOSAL" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase text-blue-300">
                      Proposed Counter-Redline Language
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyCounterToClause}
                        onChange={(e) =>
                          setApplyCounterToClause(e.target.checked)
                        }
                      />
                      Update live clause diff
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={annProposedText}
                    onChange={(e) => setAnnProposedText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-zinc-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2"
              >
                <Send size={13} />
                <span>
                  {submitting
                    ? "Syncing Annotation..."
                    : "Post Stakeholder Annotation"}
                </span>
              </button>
            </form>
          </div>

          {/* LIVE ANNOTATION STREAM */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                STAKEHOLDER ANNOTATIONS ({session.annotations?.length || 0})
              </span>
            </div>

            {(session.annotations || []).map((ann: any) => (
              <div
                key={ann.id}
                className={`p-3.5 rounded-xl border space-y-2 ${
                  ann.resolved
                    ? "bg-white/[0.01] border-white/[0.05] opacity-60"
                    : "bg-[#0d1018] border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-white">
                      {ann.authorName}
                    </span>
                    <span className="ml-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 uppercase">
                      {ann.authorRole}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-500/15 text-red-300 uppercase">
                    {ann.type.replace("_", " ")}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-zinc-500">
                  Clause: {ann.clauseHeading}
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed">
                  {ann.comment}
                </p>

                {ann.proposedText && (
                  <div className="p-2.5 rounded-lg bg-blue-950/25 border border-blue-500/30 text-[11px] text-blue-100">
                    <div className="text-[9px] font-mono uppercase text-blue-300 mb-1">
                      Proposed Counter-Language:
                    </div>
                    {ann.proposedText}
                  </div>
                )}

                {ann.replies?.length > 0 && (
                  <div className="pl-3 border-l border-white/10 space-y-1.5 pt-1">
                    {ann.replies.map((r: any) => (
                      <div key={r.id} className="text-[11px] text-zinc-300">
                        <strong className="text-white">{r.authorName}: </strong>
                        {r.content}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    value={replyTextByAnn[ann.id] || ""}
                    onChange={(e) =>
                      setReplyTextByAnn((prev) => ({
                        ...prev,
                        [ann.id]: e.target.value,
                      }))
                    }
                    placeholder="Reply to thread..."
                    className="flex-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleReply(ann.id)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 text-[10px] font-mono text-zinc-200"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
