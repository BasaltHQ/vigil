"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Message {
  id: string;
  user: string;
  response: string;
  agents_involved?: string[];
  timestamp: string;
  // Optional fields for artifact cards
  action?: string;
  artifact_type?: string;
  path?: string;
  title?: string;
  icon?: string;
  // SwarmThink fields
  is_swarm_think?: boolean;
  reasoning_logs?: any[]; // Stores ReasoningEntry[]
  // Group chat fields
  agent_name?: string;
  is_thinking?: boolean;
  is_handoff_divider?: boolean;
  handoff_from?: string;
  handoff_to?: string;
}

interface ConversationContextType {
  conversationId: string | null;
  messages: Message[];
  setConversationId: (id: string | null) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  loadConversation: (conversationId: string) => Promise<void>;
  createNewConversation: () => Promise<string | null>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedConversationId = localStorage.getItem('currentConversationId');
    const savedMessages = localStorage.getItem(`messages_${savedConversationId}`);

    if (savedConversationId) {
      setConversationId(savedConversationId);
    }

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
      }
    }
  }, []);

  // Save to localStorage when conversation or messages change
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem('currentConversationId', conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId && messages.length > 0) {
      localStorage.setItem(`messages_${conversationId}`, JSON.stringify(messages));
    }
  }, [conversationId, messages]);

  const loadConversation = async (newConversationId: string) => {
    // Load messages from localStorage first
    const savedMessages = localStorage.getItem(`messages_${newConversationId}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }

    setConversationId(newConversationId);

    // Fetch messages from backend
    try {
      const response = await fetch(`/api/conversations/${newConversationId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          localStorage.setItem(`messages_${newConversationId}`, JSON.stringify(data.messages));
        }
      }
    } catch (error) {
      console.error('Failed to load conversation from backend:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Session ${new Date().toLocaleString()}`,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const conversationId = result.data.id;
        setConversationId(conversationId);
        setMessages([]);
        return conversationId;
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
    return null;
  };

  return (
    <ConversationContext.Provider value={{
      conversationId,
      messages,
      setConversationId,
      setMessages,
      loadConversation,
      createNewConversation,
    }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
} 