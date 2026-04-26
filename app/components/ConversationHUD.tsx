"use client";

import { useState, useEffect } from "react";

interface Conversation {
  id: string;
  title: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  message_count?: number;
}

interface ConversationHUDProps {
  currentConversationId: string | null;
  onConversationChange: (conversationId: string) => void;
  onNewConversation: () => void;
  activeAgents?: string[];
  swarmId?: string;
  connectionStatus?: string;
}

export default function ConversationHUD({
  currentConversationId,
  onConversationChange,
  onNewConversation,
  activeAgents = [],
  swarmId = 'corporate',
  connectionStatus = 'connected'
}: ConversationHUDProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/conversations");
        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : (Array.isArray(data.conversations) ? data.conversations : []);
          setConversations(items);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };

    if (isExpanded) {
      fetchConversations();
    }
  }, [isExpanded, currentConversationId]);

  const handleDelete = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        if (currentConversationId === conversationId) {
          onNewConversation();
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
    setSelectedForDeletion(null);
  };

  return (
    <div className={`absolute top-4 right-4 z-40 transition-all duration-300 ${isExpanded ? 'w-80' : 'w-auto'
      }`}>
      <div className="glass-panel rounded-lg overflow-hidden border border-white/10 shadow-xl bg-black/80 backdrop-blur-md">
        {/* Header */}
        <div className="p-2 border-b border-glass-border flex items-center justify-between gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`glass-button p-2 ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}
            title={connectionStatus}
          >
            <span className="text-lg">{isExpanded ? '◉' : '◈'}</span>
          </button>

          {!isExpanded ? (
            activeAgents.length > 0 && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-900/20 border border-red-700/50 text-[10px] text-red-400 font-bold">
                {activeAgents.length}
              </div>
            )
          ) : (
            <>
              <div className="flex-1 flex flex-col items-center">
                <h3 className="microtext tracking-widest text-gray-400">CONVERSATIONS</h3>
                <span className="text-[9px] text-red-500/80 font-mono tracking-wider">{swarmId.toUpperCase()} SWARM</span>
              </div>
              <button
                onClick={onNewConversation}
                className="glass-button glass-button-primary px-3 py-1 text-xs"
                title="New Conversation"
              >
                NEW
              </button>
            </>
          )}
        </div>

        {/* Conversation List */}
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="microtext-label">NO CONVERSATIONS</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`glass-panel p-2 rounded cursor-pointer transition-all group ${conv.id === currentConversationId
                      ? 'ring-1 ring-red-600 bg-red-900/10'
                      : 'hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1"
                        onClick={() => onConversationChange(conv.id)}
                      >
                        <p className="microtext truncate">
                          {conv.title || `SESSION ${conv.id.slice(0, 8).toUpperCase()}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="data-label text-xs">
                            {(() => {
                              const raw = conv.updatedAt || conv.updated_at || conv.createdAt || conv.created_at;
                              if (!raw) return 'Unknown';
                              const d = new Date(raw);
                              if (isNaN(d.getTime())) return 'Unknown';
                              const now = Date.now();
                              const diff = now - d.getTime();
                              if (diff < 60000) return 'Just now';
                              if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                              if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
                              return d.toLocaleDateString();
                            })()}
                          </span>
                        </div>
                      </div>

                      {selectedForDeletion === conv.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(conv.id)}
                            className="glass-button p-1 text-red-400"
                            title="Confirm Delete"
                          >
                            <span className="text-xs">✓</span>
                          </button>
                          <button
                            onClick={() => setSelectedForDeletion(null)}
                            className="glass-button p-1"
                            title="Cancel"
                          >
                            <span className="text-xs">✗</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForDeletion(conv.id);
                          }}
                          className="glass-button p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Conversation"
                        >
                          <span className="text-xs text-red-400">◆</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {isExpanded && (
          <div className="p-2 border-t border-glass-border">
            <p className="microtext-label text-center">
              {conversations.length} TOTAL
            </p>
          </div>
        )}
      </div>
    </div>
  );
}