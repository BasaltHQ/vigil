"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FileText, Download, Search, Filter, Eye, Code, FileOutput, RefreshCw } from "lucide-react";

interface Document {
  id: string;
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

export default function DocumentViewer() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [documentContent, setDocumentContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"preview" | "source" | "rendered">("preview");

  const fetchDocuments = async () => {
    setFetchingDocs(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
    setFetchingDocs(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const loadDocument = async (doc: Document) => {
    setIsLoading(true);
    setSelectedDoc(doc);

    try {
      if (doc.format === "pdf") {
        setDocumentContent("");
      } else {
        const res = await fetch(`/api/artifacts/content?path=${encodeURIComponent(doc.filePath)}`);
        if (res.ok) {
          const data = await res.json();
          setDocumentContent(data.content || "No content available");
        } else {
          setDocumentContent("Error loading document content");
        }
      }
    } catch (error) {
      console.error("Error loading document:", error);
      setDocumentContent("Error loading document content");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || doc.documentType === filterType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const docTypes = ["all", ...Array.from(new Set(documents.map(d => d.documentType)))];

  return (
    <div className="h-full flex">
      {/* Left sidebar - Document list */}
      <div className="w-80 bg-black/40 border-r border-white/5 flex flex-col backdrop-blur-sm">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2 font-vox tracking-wider">
              <FileText size={20} className="text-red-500" />
              DOCUMENTS
            </h2>
            <button
              onClick={fetchDocuments}
              disabled={fetchingDocs}
              className="glass-button p-1.5 text-gray-500 hover:text-white"
            >
              <RefreshCw size={14} className={fetchingDocs ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/5 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-700/30 text-gray-200 border border-white/10 text-sm"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2 bg-white/5 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-700/30 text-gray-200 border border-white/10 text-sm"
          >
            {docTypes.map(t => (
              <option key={t} value={t}>{t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {fetchingDocs ? (
            <div className="p-8 text-center">
              <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-600 font-mono">LOADING...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <FileText size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No documents found</p>
              <p className="text-xs text-gray-600 mt-1">Documents generated in the console will appear here.</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => loadDocument(doc)}
                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group ${
                  selectedDoc?.id === doc.id ? "bg-white/10 border-l-2 border-l-red-600" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-200 truncate text-sm">{doc.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/20 text-red-400 border border-red-700/20 font-mono uppercase">
                        {doc.documentType}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/10 font-mono uppercase">
                        {doc.format}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      {formatDate(doc.createdAt)} • {formatFileSize(doc.fileSize)}
                    </div>
                    {doc.createdBy && (
                      <div className="text-xs text-gray-600 mt-0.5">
                        Agent: <span className="text-gray-400">{doc.createdBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-white/5 text-center">
          <span className="text-[10px] text-gray-600 font-mono tracking-wider">
            {documents.length} DOCUMENT{documents.length !== 1 ? "S" : ""}
          </span>
        </div>
      </div>

      {/* Right side - Document viewer */}
      <div className="flex-1 flex flex-col bg-black/20">
        {selectedDoc ? (
          <>
            {/* Document header */}
            <div className="p-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white">{selectedDoc.title}</h1>
                  <div className="text-xs text-gray-500 mt-1 font-mono">
                    {selectedDoc.filePath}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedDoc.format !== "pdf" && (
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                      <button
                        onClick={() => setViewMode("preview")}
                        className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-xs ${
                          viewMode === "preview" ? "bg-white/20 text-white" : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        <Eye size={12} /> Preview
                      </button>
                      <button
                        onClick={() => setViewMode("source")}
                        className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-xs ${
                          viewMode === "source" ? "bg-white/20 text-white" : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        <Code size={12} /> Source
                      </button>
                      <button
                        onClick={() => setViewMode("rendered")}
                        className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-xs ${
                          viewMode === "rendered" ? "bg-white/20 text-white" : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        <FileOutput size={12} /> Rendered
                      </button>
                    </div>
                  )}

                  <a
                    href={selectedDoc.filePath.startsWith("http") ? selectedDoc.filePath : `/api/artifacts/file?path=${encodeURIComponent(selectedDoc.filePath)}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-red-400 border border-red-700/30 hover:bg-red-900/20"
                  >
                    <Download size={12} /> Download
                  </a>
                </div>
              </div>
            </div>

            {/* Document content */}
            <div className={`flex-1 overflow-auto custom-scrollbar ${selectedDoc.format === "pdf" ? "p-2" : "p-6"}`}>
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-gray-500 font-mono">LOADING DOCUMENT...</p>
                </div>
              ) : selectedDoc.format === "pdf" ? (
                <div className="w-full h-full min-h-[800px] bg-white rounded-lg overflow-hidden shadow-2xl border border-white/10">
                  <iframe
                    src={selectedDoc.filePath.startsWith("http") ? selectedDoc.filePath : `/api/artifacts/file?path=${encodeURIComponent(selectedDoc.filePath)}`}
                    className="w-full h-full border-0 min-h-[800px]"
                    title={selectedDoc.title}
                  />
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  {viewMode === "preview" && (
                    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-gray-200 prose-strong:text-white prose-a:text-red-400">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus as any}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={`${className} text-red-400`} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {documentContent}
                      </ReactMarkdown>
                    </div>
                  )}

                  {viewMode === "source" && (
                    <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto border border-white/10">
                      <code className="text-sm text-gray-400 font-mono">{documentContent}</code>
                    </pre>
                  )}

                  {viewMode === "rendered" && (
                    <div className="bg-white text-black p-8 rounded-lg shadow-lg">
                      <div className="prose max-w-none">
                        <ReactMarkdown>{documentContent}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Document metadata */}
            <div className="p-3 border-t border-white/5 bg-white/5">
              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <div>
                  {selectedDoc.createdBy ? `Agent: ${selectedDoc.createdBy}` : "System"} • {formatDate(selectedDoc.createdAt)}
                </div>
                <div>
                  {formatFileSize(selectedDoc.fileSize)} • {selectedDoc.format.toUpperCase()}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <img src="/Vigil.png" alt="Vigil" className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm text-gray-500">Select a document to view</p>
              <p className="text-xs text-gray-600 mt-1">Generated documents appear here automatically</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
