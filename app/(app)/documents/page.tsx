"use client";

import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  FileText,
  Download,
  Search,
  Eye,
  Code,
  FileOutput,
  RefreshCw,
  FileCheck2,
  Trash2,
  Sparkles,
  ArrowUpRight,
  Layers,
  ShieldCheck,
  Calendar,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DocumentItem {
  id: string;
  displayId?: string | null;
  title: string;
  documentType: string;
  format: string;
  createdAt: string;
  createdBy: string | null;
  fileSize: number;
  filePath: string;
  conversationId: string | null;
  metadata: any;
}

export default function DocumentVaultPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [documentContent, setDocumentContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterFormat, setFilterFormat] = useState("all");
  const [viewMode, setViewMode] = useState<
    "preview" | "metadata" | "source" | "rendered"
  >("preview");

  const fetchDocuments = async () => {
    setFetchingDocs(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        const list = data.documents || [];
        setDocuments(list);
        if (list.length > 0 && !selectedDoc) {
          loadDocument(list[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setFetchingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const loadDocument = async (doc: DocumentItem) => {
    setIsLoading(true);
    setSelectedDoc(doc);

    try {
      if (doc.format === "pdf" || doc.format === "docx") {
        setDocumentContent("");
        setViewMode("preview");
      } else {
        const res = await fetch(
          `/api/artifacts/content?path=${encodeURIComponent(doc.filePath)}`
        );
        if (res.ok) {
          const data = await res.json();
          setDocumentContent(data.content || "No text content available.");
        } else {
          setDocumentContent("Error loading document content.");
        }
      }
    } catch {
      setDocumentContent("Error loading document content.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this deliverable from the Document Vault?")) return;
    try {
      const res = await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: docId }),
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        if (selectedDoc?.id === docId) {
          setSelectedDoc(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        doc.title.toLowerCase().includes(q) ||
        (doc.displayId || "").toLowerCase().includes(q) ||
        (doc.documentType || "").toLowerCase().includes(q) ||
        (doc.createdBy || "").toLowerCase().includes(q);
      const matchesType =
        filterType === "all" || doc.documentType === filterType;
      const matchesFormat =
        filterFormat === "all" ||
        doc.format.toLowerCase() === filterFormat.toLowerCase();
      return matchesSearch && matchesType && matchesFormat;
    });
  }, [documents, searchQuery, filterType, filterFormat]);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return "Compiled";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const docTypes = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(documents.map((d) => d.documentType).filter(Boolean))
      ),
    ],
    [documents]
  );

  const stats = useMemo(() => {
    const pdfCount = documents.filter((d) => d.format === "pdf").length;
    const docxCount = documents.filter((d) => d.format === "docx").length;
    const redlineCount = documents.filter((d) =>
      (d.documentType || "").toLowerCase().includes("redline")
    ).length;
    return { total: documents.length, pdfCount, docxCount, redlineCount };
  }, [documents]);

  const getDownloadUrl = (doc: DocumentItem) => {
    if (doc.filePath.startsWith("http") || doc.filePath.startsWith("/docs/")) {
      return doc.filePath;
    }
    return `/api/artifacts/file?path=${encodeURIComponent(doc.filePath)}`;
  };

  return (
    <div className="h-full flex flex-col bg-[#040507] text-zinc-100 overflow-hidden">
      {/* TOP VAULT TELEMETRY HEADER */}
      <header className="flex-shrink-0 px-6 py-3.5 border-b border-white/[0.07] bg-[#080a10] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/35 flex items-center justify-center text-red-400">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider uppercase font-vox text-white">
                EXECUTIVE DOCUMENT VAULT
              </h1>
              <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono text-zinc-300">
                {stats.total} DELIVERABLES
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Compiled Fortune 50 LaTeX PDFs, Microsoft Word (.docx) Track-Changes Redlines & Diligence Reports
            </p>
          </div>
        </div>

        {/* KPI Pills & Quick Studio Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.07] text-xs font-mono">
            <span className="text-zinc-400">
              PDFs <strong className="text-red-400">{stats.pdfCount}</strong>
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400">
              WORD (.DOCX){" "}
              <strong className="text-blue-400">{stats.docxCount}</strong>
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400">
              REDLINES{" "}
              <strong className="text-amber-400">{stats.redlineCount}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/chat?launchpad=redline")}
            className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/35 border border-red-500/40 text-xs font-mono font-semibold text-red-100 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles size={13} className="text-red-400" />
            <span>New Redline / Deliverable</span>
          </button>

          <button
            type="button"
            onClick={fetchDocuments}
            disabled={fetchingDocs}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white"
            title="Refresh Vault"
          >
            <RefreshCw
              size={15}
              className={fetchingDocs ? "animate-spin" : ""}
            />
          </button>
        </div>
      </header>

      {/* MAIN SPLIT VIEW */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT SIDEBAR: FILTERABLE DELIVERABLE LIST */}
        <aside className="w-80 sm:w-96 flex-shrink-0 border-r border-white/[0.07] bg-[#06080d] flex flex-col">
          <div className="p-3.5 border-b border-white/[0.06] space-y-2.5">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="Search title, ID (VARUNA-...), or agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0c0f17] border border-white/10 text-xs text-zinc-300"
              >
                {docTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === "all"
                      ? "All Practice Types"
                      : t.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>

              <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
                {["all", "pdf", "docx"].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFilterFormat(fmt)}
                    className={`px-2 py-1 rounded uppercase transition-colors ${
                      filterFormat === fmt
                        ? "bg-red-600/30 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.05]">
            {fetchingDocs ? (
              <div className="p-10 text-center">
                <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono text-zinc-500">
                  SYNCHRONIZING VAULT...
                </p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <FileText size={32} className="text-zinc-700 mx-auto" />
                <p className="text-sm text-zinc-400 font-medium">
                  No matching deliverables
                </p>
                <p className="text-xs text-zinc-600">
                  Compile a Redline PDF, Word (.docx), or Diligence Report in the Console to populate the vault.
                </p>
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                const isDocx = doc.format.toLowerCase() === "docx";
                return (
                  <div
                    key={doc.id}
                    onClick={() => loadDocument(doc)}
                    className={`p-3.5 cursor-pointer transition-all group ${
                      isSelected
                        ? "bg-red-950/20 border-l-2 border-l-red-500"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          {doc.displayId && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {doc.displayId}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                              isDocx
                                ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                                : "bg-red-500/15 text-red-300 border border-red-500/30"
                            }`}
                          >
                            .{doc.format}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 uppercase truncate">
                            {(doc.documentType || "legal").replace(/_/g, " ")}
                          </span>
                        </div>

                        <h3 className="text-xs font-semibold text-white truncate group-hover:text-red-200">
                          {doc.title}
                        </h3>

                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500 font-mono">
                          <span>
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                          {doc.createdBy && (
                            <>
                              <span>•</span>
                              <span className="text-zinc-400">
                                {doc.createdBy}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all"
                        title="Delete deliverable"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT PANE: DOCUMENT PREVIEW & METADATA INSPECTOR */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#080a10]">
          {selectedDoc ? (
            <>
              {/* Document Action Bar */}
              <div className="px-6 py-3.5 border-b border-white/[0.07] bg-[#0a0d14] flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {selectedDoc.displayId && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300">
                        {selectedDoc.displayId}
                      </span>
                    )}
                    <h2 className="text-base font-bold text-white truncate">
                      {selectedDoc.title}
                    </h2>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-0.5 flex items-center gap-3">
                    <span>Path: {selectedDoc.filePath}</span>
                    {selectedDoc.createdBy && (
                      <span>• Author Agent: {selectedDoc.createdBy}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Switcher */}
                  <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                        viewMode === "preview"
                          ? "bg-white/15 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Eye size={12} /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("metadata")}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                        viewMode === "metadata"
                          ? "bg-white/15 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Layers size={12} /> Structure & Metadata
                    </button>
                  </div>

                  {/* Send to Swarm for Redline / Iteration */}
                  <button
                    type="button"
                    onClick={() => {
                      const refId = selectedDoc.displayId || selectedDoc.title;
                      router.push(
                        `/chat?prompt=${encodeURIComponent(
                          `Please load document ${refId} ("${selectedDoc.title}") using read_document and assist me with redlining or revising its clauses.`
                        )}`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-mono text-zinc-200 flex items-center gap-1.5"
                  >
                    <Sparkles size={13} className="text-red-400" />
                    <span>Revise with Swarm</span>
                    <ArrowUpRight size={12} />
                  </button>

                  {/* Direct Download */}
                  <a
                    href={getDownloadUrl(selectedDoc)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white no-underline flex items-center gap-1.5 shadow-lg"
                  >
                    <Download size={13} />
                    <span>Download .{selectedDoc.format.toUpperCase()}</span>
                  </a>
                </div>
              </div>

              {/* Main Viewer Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                {viewMode === "metadata" ? (
                  <div className="max-w-4xl mx-auto space-y-4">
                    <div className="p-5 rounded-2xl bg-[#0c0f17] border border-white/10 space-y-3">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                        Deliverable Structural Metadata & Audit Trail
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <div className="text-[10px] font-mono text-zinc-500">
                            DISPLAY ID
                          </div>
                          <div className="font-mono font-bold text-white mt-0.5">
                            {selectedDoc.displayId || "Standard"}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <div className="text-[10px] font-mono text-zinc-500">
                            DOCUMENT TYPE
                          </div>
                          <div className="font-mono font-bold text-white mt-0.5 uppercase">
                            {selectedDoc.documentType}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <div className="text-[10px] font-mono text-zinc-500">
                            AUTHOR AGENT
                          </div>
                          <div className="font-mono font-bold text-emerald-400 mt-0.5">
                            {selectedDoc.createdBy || "Keyes"}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <div className="text-[10px] font-mono text-zinc-500">
                            CREATED AT
                          </div>
                          <div className="font-mono text-zinc-300 mt-0.5">
                            {new Date(selectedDoc.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1.5">
                          Stored JSON Payload / Clauses / Signatures
                        </div>
                        <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 overflow-x-auto">
                          {JSON.stringify(selectedDoc.metadata || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : selectedDoc.format.toLowerCase() === "pdf" ? (
                  <div className="w-full h-full min-h-[760px] rounded-xl overflow-hidden border border-white/15 bg-white shadow-2xl">
                    <iframe
                      src={getDownloadUrl(selectedDoc)}
                      className="w-full h-full min-h-[760px] border-0"
                      title={selectedDoc.title}
                    />
                  </div>
                ) : selectedDoc.format.toLowerCase() === "docx" ? (
                  <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-gradient-to-br from-blue-950/35 to-[#0b0e16] border border-blue-500/35 text-center space-y-5 shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 mx-auto">
                      <FileCheck2 size={32} />
                    </div>
                    <div>
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-[10px] font-mono font-bold text-blue-300 uppercase tracking-widest">
                        MICROSOFT WORD (.DOCX) TRACK CHANGES
                      </span>
                      <h3 className="text-xl font-bold text-white mt-3">
                        {selectedDoc.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        Native Word deliverable containing inline crimson strikethrough deletions, royal blue underlined insertions, and counsel rationale callout boxes.
                      </p>
                    </div>

                    {selectedDoc.metadata && (
                      <div className="grid grid-cols-3 gap-3 text-left p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-xs">
                        <div>
                          <div className="text-[10px] text-zinc-500">
                            COUNTERPARTY
                          </div>
                          <div className="text-white font-bold truncate">
                            {selectedDoc.metadata.counterparty_name || "Counterparty"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500">
                            WORDS ADDED
                          </div>
                          <div className="text-blue-400 font-bold">
                            +{selectedDoc.metadata.totalAdded || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500">
                            WORDS DELETED
                          </div>
                          <div className="text-red-400 font-bold">
                            -{selectedDoc.metadata.totalDeleted || 0}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <a
                        href={getDownloadUrl(selectedDoc)}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-mono font-bold text-white no-underline flex items-center gap-2 shadow-lg"
                      >
                        <Download size={15} />
                        <span>Download Word (.DOCX) File</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setViewMode("metadata")}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300"
                      >
                        Inspect Clauses JSON
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-[#0c0f17] border border-white/10 prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {documentContent}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              <div className="text-center space-y-2">
                <FileText size={42} className="mx-auto text-zinc-700" />
                <p className="text-sm font-medium text-zinc-400">
                  Select a deliverable from the Vault
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
