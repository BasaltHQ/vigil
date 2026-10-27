"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Users,
  MessageSquare,
  Zap,
  Check,
  X,
  Ban,
  UserPlus,
  RefreshCw,
  Search,
  Download,
  DollarSign,
  FileText,
  Sliders,
  Trash2,
  Building2,
  CreditCard,
  RotateCcw,
  Save,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Crown,
} from "lucide-react";

interface SubscriberDoc {
  id: string;
  displayId?: string | null;
  title: string;
  documentType: string;
  format: string;
  createdAt: string;
  filePath: string;
}

interface SubscriberProfile {
  id: string;
  email: string;
  displayName: string | null;
  companyName?: string | null;
  companyUrl?: string | null;
  role: string;
  tier: string;
  status: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  baseTemplate?: string | null;
  docIdTemplate?: string;
  docIdCounter?: number;
  onboardingComplete?: boolean;
  brandParameters?: {
    customQuotaTokens?: number | null;
    adminNotes?: string;
    customPlaybook?: string;
    tone?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    last24hTokens?: number;
  };
  requestCount: number;
  conversationsCount: number;
  documentsCount: number;
  recentDocuments?: SubscriberDoc[];
}

interface SystemStats {
  users: {
    total: number;
    active: number;
    pending: number;
    suspended?: number;
    admins?: number;
  };
  tiers?: {
    starter: number;
    pro: number;
    firm: number;
    enterprise: number;
  };
  revenue?: {
    estimatedMrr: number;
    estimatedArr: number;
    activePaidSubscribers: number;
    estimatedAiComputeCost: number;
  };
  conversations: number;
  messages: number;
  documents?: {
    total: number;
    pdfCount: number;
    docxCount: number;
  };
  tokens: {
    allTime: {
      prompt: number;
      completion: number;
      total: number;
      requests: number;
    };
    last24h: {
      prompt: number;
      completion: number;
      total: number;
      requests: number;
    };
  };
}

const DEFAULT_TIER_QUOTAS: Record<string, number> = {
  starter: 100_000,
  pro: 2_000_000,
  firm: 10_000_000,
  enterprise: 50_000_000,
};

const TIER_PRICES: Record<string, number> = {
  starter: 0,
  pro: 29.99,
  firm: 149,
  enterprise: 299,
};

function formatNumber(n: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function estimateCost(promptTokens: number, completionTokens: number): number {
  return (
    (promptTokens / 1_000_000) * 0.15 + (completionTokens / 1_000_000) * 0.6
  );
}

export default function AdminSubscriberSuite() {
  const [users, setUsers] = useState<SubscriberProfile[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "tokens" | "documents" | "conversations" | "mrr"
  >("createdAt");

  // Multi-select for Bulk Operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Inspector Drawer State
  const [inspectedUser, setInspectedUser] =
    useState<SubscriberProfile | null>(null);
  const [drawerTab, setDrawerTab] = useState<
    "account" | "playbook" | "deliverables"
  >("account");
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);

  // Provision New Subscriber Modal State
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    email: "",
    displayName: "",
    companyName: "",
    companyUrl: "",
    role: "client",
    tier: "firm",
    status: "active",
    docIdTemplate: "VARUNA-[YYYY]-[####]",
    customQuotaTokens: "",
    adminNotes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats"),
      ]);
      if (usersRes.ok) {
        const data = await usersRes.json();
        const list = data.users || [];
        setUsers(list);
        if (inspectedUser) {
          const refreshed = list.find(
            (u: SubscriberProfile) => u.id === inspectedUser.id
          );
          if (refreshed) {
            setInspectedUser(refreshed);
          }
        }
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openSubscriberDrawer = (u: SubscriberProfile) => {
    setInspectedUser(u);
    setDrawerTab("account");
    setEditForm({
      displayName: u.displayName || "",
      email: u.email || "",
      companyName: u.companyName || "",
      companyUrl: u.companyUrl || "",
      role: u.role || "client",
      status: u.status || "active",
      tier: u.tier || "starter",
      docIdTemplate: u.docIdTemplate || "VARUNA-[YYYY]-[####]",
      docIdCounter: u.docIdCounter ?? 0,
      baseTemplate: u.baseTemplate || "executive_minimal",
      stripeCustomerId: u.stripeCustomerId || "",
      stripeSubscriptionId: u.stripeSubscriptionId || "",
      customQuotaTokens: u.brandParameters?.customQuotaTokens || "",
      adminNotes: u.brandParameters?.adminNotes || "",
      customPlaybook: u.brandParameters?.customPlaybook || "",
    });
  };

  const updateUser = async (
    userId: string,
    updates: Record<string, any>
  ) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error("Failed to update user:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveDrawer = async () => {
    if (!inspectedUser) return;
    setIsSavingDrawer(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: inspectedUser.id,
          ...editForm,
        }),
      });
      if (res.ok) {
        await fetchData();
      }
    } finally {
      setIsSavingDrawer(false);
    }
  };

  const handleResetTokens = async (userId: string) => {
    if (
      !confirm(
        "Reset this subscriber's token usage counter to 0 for the current cycle?"
      )
    )
      return;
    await updateUser(userId, { action: "reset_tokens" });
  };

  const handleBulkUpdate = async (updates: Record<string, any>) => {
    if (selectedIds.length === 0) return;
    setActionLoading("bulk");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedIds, ...updates }),
      });
      if (res.ok) {
        setSelectedIds([]);
        await fetchData();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        "Permanently delete this subscriber and all their matters, documents, and token records?"
      )
    )
      return;
    setActionLoading(userId);
    try {
      await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (inspectedUser?.id === userId) setInspectedUser(null);
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleProvisionSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("provision");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(provisionForm),
      });
      if (res.ok) {
        setShowProvisionModal(false);
        setProvisionForm({
          email: "",
          displayName: "",
          companyName: "",
          companyUrl: "",
          role: "client",
          tier: "firm",
          status: "active",
          docIdTemplate: "VARUNA-[YYYY]-[####]",
          customQuotaTokens: "",
          adminNotes: "",
        });
        await fetchData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to provision subscriber");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const exportSubscribersCsv = () => {
    const headers = [
      "ID",
      "Email",
      "DisplayName",
      "Company",
      "Role",
      "Status",
      "Tier",
      "MRR_USD",
      "TotalTokens",
      "EstCost_USD",
      "Documents",
      "Matters",
      "JoinedAt",
    ];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.email || "",
      u.displayName || "",
      u.companyName || "",
      u.role,
      u.status,
      u.tier,
      u.status === "active" ? TIER_PRICES[u.tier] || 0 : 0,
      u.tokenUsage.totalTokens,
      estimateCost(
        u.tokenUsage.promptTokens,
        u.tokenUsage.completionTokens
      ).toFixed(4),
      u.documentsCount,
      u.conversationsCount,
      new Date(u.createdAt).toISOString(),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vigil_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = useMemo(() => {
    const list = users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (u.email || "").toLowerCase().includes(q) ||
        (u.displayName || "").toLowerCase().includes(q) ||
        (u.companyName || "").toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.stripeCustomerId || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || u.status === statusFilter;
      const matchesTier =
        tierFilter === "all" || (u.tier || "starter") === tierFilter;
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesStatus && matchesTier && matchesRole;
    });

    return list.sort((a, b) => {
      if (sortBy === "tokens")
        return b.tokenUsage.totalTokens - a.tokenUsage.totalTokens;
      if (sortBy === "documents") return b.documentsCount - a.documentsCount;
      if (sortBy === "conversations")
        return b.conversationsCount - a.conversationsCount;
      if (sortBy === "mrr")
        return (TIER_PRICES[b.tier] || 0) - (TIER_PRICES[a.tier] || 0);
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [users, searchQuery, statusFilter, tierFilter, roleFilter, sortBy]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-300 bg-emerald-500/15 border-emerald-500/30";
      case "pending":
        return "text-amber-300 bg-amber-500/15 border-amber-500/30";
      case "suspended":
        return "text-red-300 bg-red-500/15 border-red-500/30";
      default:
        return "text-zinc-400 bg-white/5 border-white/10";
    }
  };

  const tierBadge = (tier: string) => {
    switch ((tier || "starter").toLowerCase()) {
      case "enterprise":
        return "text-purple-300 bg-purple-500/20 border-purple-500/40";
      case "firm":
        return "text-red-300 bg-red-500/20 border-red-500/40";
      case "pro":
        return "text-blue-300 bg-blue-500/20 border-blue-500/40";
      default:
        return "text-zinc-400 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#040507] text-zinc-100 overflow-hidden">
      {/* TOP EXECUTIVE ADMIN HEADER */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-white/[0.07] bg-[#080a10] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider uppercase font-vox text-white">
                SUBSCRIBER & PLATFORM COMMAND CENTER
              </h1>
              <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-[10px] font-mono font-bold text-red-300">
                SUPERADMIN
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Enterprise Subscriber Provisioning, Tier & Quota Governance, Token Metering, and Firm Playbook Administration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportSubscribersCsv}
            className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProvisionModal(true)}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
          >
            <UserPlus size={14} />
            <span>+ Provision Subscriber</span>
          </button>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-zinc-400 hover:text-white"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* MAIN SCROLLABLE ADMIN BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* 1. PLATFORM & REVENUE KPI CARDS */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue & MRR Card */}
            <div className="p-5 rounded-2xl bg-[#0b0e16] border border-white/[0.08] space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  ESTIMATED MRR / ARR
                </span>
                <DollarSign size={16} className="text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">
                  ${(stats.revenue?.estimatedMrr || 0).toLocaleString()}
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  / mo
                </span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <span>
                  ARR: ${(stats.revenue?.estimatedArr || 0).toLocaleString()}
                </span>
                <span className="text-emerald-300">
                  {stats.revenue?.activePaidSubscribers || 0} Paid Tiers
                </span>
              </div>
            </div>

            {/* Subscribers & Tier Mix Card */}
            <div className="p-5 rounded-2xl bg-[#0b0e16] border border-white/[0.08] space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  SUBSCRIBERS & TIERS
                </span>
                <Users size={16} className="text-red-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white font-mono">
                  {stats.users.total}
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-emerald-400">
                    {stats.users.active} active
                  </span>
                  {stats.users.pending > 0 && (
                    <span className="text-amber-400">
                      {stats.users.pending} pending
                    </span>
                  )}
                </div>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <span>ENT: {stats.tiers?.enterprise || 0}</span>
                <span>FIRM: {stats.tiers?.firm || 0}</span>
                <span>PRO: {stats.tiers?.pro || 0}</span>
                <span>START: {stats.tiers?.starter || 0}</span>
              </div>
            </div>

            {/* Token Metering & Compute Cost Card */}
            <div className="p-5 rounded-2xl bg-[#0b0e16] border border-white/[0.08] space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  AI TOKEN METERING
                </span>
                <Zap size={16} className="text-amber-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white font-mono">
                  {formatNumber(stats.tokens.allTime.total)}
                </span>
                <span className="text-xs font-mono text-amber-300">
                  24h: {formatNumber(stats.tokens.last24h.total)}
                </span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <span>{stats.tokens.allTime.requests} LLM calls</span>
                <span className="text-emerald-400">
                  Cost: ${stats.revenue?.estimatedAiComputeCost || 0}
                </span>
              </div>
            </div>

            {/* Matters & Deliverables Vault Card */}
            <div className="p-5 rounded-2xl bg-[#0b0e16] border border-white/[0.08] space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  MATTERS & DELIVERABLES
                </span>
                <FileText size={16} className="text-blue-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white font-mono">
                  {stats.documents?.total || 0}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {stats.conversations} Matters
                </span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <span className="text-red-300">
                  {stats.documents?.pdfCount || 0} PDFs
                </span>
                <span className="text-blue-300">
                  {stats.documents?.docxCount || 0} .DOCX
                </span>
                <span>{formatNumber(stats.messages)} msgs</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. FILTER, SEARCH & BULK OPERATIONS BAR */}
        <div className="p-4 rounded-2xl bg-[#0b0e16] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscriber email, name, firm, wallet, or Stripe ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-zinc-300"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-zinc-300"
            >
              <option value="all">Tier: All</option>
              <option value="enterprise">Enterprise ($299)</option>
              <option value="firm">Firm ($149)</option>
              <option value="pro">Pro ($29.99)</option>
              <option value="starter">Starter</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-zinc-300"
            >
              <option value="createdAt">Sort: Newest Joined</option>
              <option value="mrr">Sort: Highest Tier / MRR</option>
              <option value="tokens">Sort: Token Consumption</option>
              <option value="documents">Sort: Deliverables Compiled</option>
              <option value="conversations">Sort: Active Matters</option>
            </select>
          </div>

          {/* Bulk Actions Strip */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-500/40">
              <span className="text-xs font-mono font-bold text-red-200">
                {selectedIds.length} selected:
              </span>
              <button
                type="button"
                onClick={() => handleBulkUpdate({ status: "active" })}
                className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-[10px] font-mono font-bold text-emerald-200"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleBulkUpdate({ status: "suspended" })}
                className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-[10px] font-mono font-bold text-amber-200"
              >
                Suspend
              </button>
              <button
                type="button"
                onClick={() => handleBulkUpdate({ tier: "firm" })}
                className="px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-[10px] font-mono font-bold text-purple-200"
              >
                Set Firm Tier
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-zinc-400 hover:text-white ml-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* 3. SUBSCRIBERS TABLE */}
        <div className="rounded-2xl bg-[#0b0e16] border border-white/[0.08] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.02] text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={
                        filteredUsers.length > 0 &&
                        selectedIds.length === filteredUsers.length
                      }
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked
                            ? filteredUsers.map((u) => u.id)
                            : []
                        )
                      }
                    />
                  </th>
                  <th className="py-3.5 px-4">Subscriber / Firm</th>
                  <th className="py-3.5 px-4">Status & Role</th>
                  <th className="py-3.5 px-4">Subscription Tier</th>
                  <th className="py-3.5 px-4">Token Quota & Metering</th>
                  <th className="py-3.5 px-4 text-right">Matters / Docs</th>
                  <th className="py-3.5 px-4 text-right">Est. AI Cost</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredUsers.map((user) => {
                  const quotaLimit =
                    user.brandParameters?.customQuotaTokens ||
                    DEFAULT_TIER_QUOTAS[user.tier || "starter"] ||
                    100_000;
                  const usedPct = Math.min(
                    100,
                    Math.round((user.tokenUsage.totalTokens / quotaLimit) * 100)
                  );
                  const cost = estimateCost(
                    user.tokenUsage.promptTokens,
                    user.tokenUsage.completionTokens
                  );

                  return (
                    <tr
                      key={user.id}
                      onClick={() => openSubscriberDrawer(user)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                    >
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={(e) =>
                            setSelectedIds((prev) =>
                              e.target.checked
                                ? [...prev, user.id]
                                : prev.filter((id) => id !== user.id)
                            )
                          }
                        />
                      </td>

                      {/* Subscriber / Firm */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {user.displayName || user.email || "Unnamed Subscriber"}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {user.email}
                        </div>
                        {user.companyName && (
                          <div className="text-[10px] font-mono text-red-300 mt-0.5 flex items-center gap-1">
                            <Building2 size={10} />
                            <span>{user.companyName}</span>
                          </div>
                        )}
                      </td>

                      {/* Status & Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase font-bold ${statusBadge(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                          {user.role === "admin" && (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-[10px] font-mono font-bold text-red-300 flex items-center gap-1">
                              <Crown size={10} /> ADMIN
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subscription Tier Quick Selector */}
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={user.tier || "starter"}
                          onChange={(e) =>
                            updateUser(user.id, { tier: e.target.value })
                          }
                          disabled={actionLoading === user.id}
                          className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold uppercase cursor-pointer ${tierBadge(
                            user.tier
                          )}`}
                        >
                          <option value="starter" className="bg-[#090b10]">
                            STARTER ($0)
                          </option>
                          <option value="pro" className="bg-[#090b10]">
                            PRO ($29.99)
                          </option>
                          <option value="firm" className="bg-[#090b10]">
                            FIRM ($149)
                          </option>
                          <option value="enterprise" className="bg-[#090b10]">
                            ENTERPRISE ($299)
                          </option>
                        </select>
                      </td>

                      {/* Token Quota & Progress Bar */}
                      <td className="py-3.5 px-4 min-w-[170px]">
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="text-zinc-200 font-bold">
                            {formatNumber(user.tokenUsage.totalTokens)}
                          </span>
                          <span className="text-zinc-500">
                            / {formatNumber(quotaLimit)} ({usedPct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              usedPct > 85
                                ? "bg-red-500"
                                : usedPct > 60
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                            }`}
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Matters / Docs */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className="text-white font-bold">
                          {user.conversationsCount}
                        </span>{" "}
                        <span className="text-zinc-500">matters</span>
                        <div className="text-[10px] text-red-300">
                          {user.documentsCount} deliverables
                        </div>
                      </td>

                      {/* Est Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                        ${cost.toFixed(4)}
                      </td>

                      {/* Joined */}
                      <td className="py-3.5 px-4 text-[11px] font-mono text-zinc-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {user.status === "pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateUser(user.id, { status: "active" })
                              }
                              className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 text-[10px] font-mono font-bold"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openSubscriberDrawer(user)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] font-mono text-zinc-200"
                          >
                            Manage →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =====================================================================
          360° SUBSCRIBER MANAGEMENT DRAWER
         ===================================================================== */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-2xl h-full bg-[#080a10] border-l border-white/15 flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-[#0b0e16] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {inspectedUser.displayName ||
                      inspectedUser.email ||
                      "Subscriber Account"}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase font-bold ${tierBadge(
                      inspectedUser.tier
                    )}`}
                  >
                    {inspectedUser.tier}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase font-bold ${statusBadge(
                      inspectedUser.status
                    )}`}
                  >
                    {inspectedUser.status}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  ID: {inspectedUser.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectedUser(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Sub-Tabs */}
            <div className="px-6 py-2 border-b border-white/[0.07] bg-[#06080d] flex items-center gap-2">
              {[
                { id: "account", label: "Account, Tier & Quotas" },
                { id: "playbook", label: "Firm Playbook & Numbering" },
                {
                  id: "deliverables",
                  label: `Deliverables (${inspectedUser.documentsCount})`,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDrawerTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    drawerTab === t.id
                      ? "bg-red-600/25 border border-red-500/40 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {drawerTab === "account" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Display Name
                      </label>
                      <input
                        value={editForm.displayName || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            displayName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Email Address
                      </label>
                      <input
                        value={editForm.email || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Law Firm / Company Name
                      </label>
                      <input
                        value={editForm.companyName || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            companyName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Company Website URL
                      </label>
                      <input
                        value={editForm.companyUrl || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            companyUrl: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Account Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/15 text-xs text-white"
                      >
                        <option value="active">Active (Approved)</option>
                        <option value="pending">Pending Approval</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Subscription Tier
                      </label>
                      <select
                        value={editForm.tier}
                        onChange={(e) =>
                          setEditForm({ ...editForm, tier: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/15 text-xs text-white"
                      >
                        <option value="starter">Starter (100K Tokens)</option>
                        <option value="pro">Pro ($29.99/mo — 2M Tokens)</option>
                        <option value="firm">Firm ($149/mo — 10M Tokens)</option>
                        <option value="enterprise">
                          Enterprise ($299/mo — 50M Tokens)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Platform Role
                      </label>
                      <select
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm({ ...editForm, role: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/15 text-xs text-white"
                      >
                        <option value="client">Client / Subscriber</option>
                        <option value="admin">Platform Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Custom Token Quota Override (Optional)
                      </label>
                      <input
                        type="number"
                        placeholder="Leave blank for tier default"
                        value={editForm.customQuotaTokens}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customQuotaTokens: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>

                  {/* Token Metering Card */}
                  <div className="p-4 rounded-xl bg-[#0c0f17] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-white">
                        Token Metering & Billing Cycle Reset
                      </span>
                      <button
                        type="button"
                        onClick={() => handleResetTokens(inspectedUser.id)}
                        className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-[10px] font-mono text-amber-300 flex items-center gap-1"
                      >
                        <RotateCcw size={11} /> Reset Cycle Usage
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                      <div className="p-2.5 rounded bg-black/40 border border-white/5">
                        <div className="text-[10px] text-zinc-500">
                          PROMPT TOKENS
                        </div>
                        <div className="text-white font-bold">
                          {formatNumber(inspectedUser.tokenUsage.promptTokens)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-black/40 border border-white/5">
                        <div className="text-[10px] text-zinc-500">
                          COMPLETION
                        </div>
                        <div className="text-white font-bold">
                          {formatNumber(
                            inspectedUser.tokenUsage.completionTokens
                          )}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-black/40 border border-white/5">
                        <div className="text-[10px] text-zinc-500">
                          EST. COST
                        </div>
                        <div className="text-emerald-400 font-bold">
                          $
                          {estimateCost(
                            inspectedUser.tokenUsage.promptTokens,
                            inspectedUser.tokenUsage.completionTokens
                          ).toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Internal Notes */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Internal Admin Account Notes
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.adminNotes || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, adminNotes: e.target.value })
                      }
                      placeholder="Enterprise contract notes, custom SLA terms, partner contact..."
                      className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-xs text-zinc-200"
                    />
                  </div>
                </>
              )}

              {drawerTab === "playbook" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Document ID Template
                      </label>
                      <input
                        value={editForm.docIdTemplate || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            docIdTemplate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Document Counter
                      </label>
                      <input
                        type="number"
                        value={editForm.docIdCounter ?? 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            docIdCounter: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Subscriber Firm Negotiation Playbook (White-Glove Admin Configuration)
                    </label>
                    <textarea
                      rows={12}
                      value={editForm.customPlaybook || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          customPlaybook: e.target.value,
                        })
                      }
                      placeholder="Configure mandatory fallback clauses and risk tolerances for this subscriber..."
                      className="w-full p-3.5 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-zinc-200"
                    />
                  </div>
                </div>
              )}

              {drawerTab === "deliverables" && (
                <div className="space-y-2.5">
                  {!inspectedUser.recentDocuments ||
                  inspectedUser.recentDocuments.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 text-xs">
                      No deliverables generated by this subscriber yet.
                    </div>
                  ) : (
                    inspectedUser.recentDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl bg-[#0c0f17] border border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {doc.displayId && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                                {doc.displayId}
                              </span>
                            )}
                            <span className="text-xs font-semibold text-white truncate">
                              {doc.title}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                            {doc.documentType} • .{doc.format.toUpperCase()} •{" "}
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <a
                          href={doc.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white no-underline flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#0b0e16] flex items-center justify-between">
              <button
                type="button"
                onClick={() => deleteUser(inspectedUser.id)}
                className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-mono text-red-300 flex items-center gap-1.5"
              >
                <Trash2 size={13} /> Delete Subscriber
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setInspectedUser(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDrawer}
                  disabled={isSavingDrawer}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-lg"
                >
                  <Save size={13} />
                  <span>{isSavingDrawer ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PROVISION NEW SUBSCRIBER MODAL
         ===================================================================== */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleProvisionSubscriber}
            className="w-full max-w-lg rounded-2xl bg-[#090b10] border border-white/15 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-red-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-vox">
                  PROVISION NEW PLATFORM SUBSCRIBER
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProvisionModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  Subscriber Email *
                </label>
                <input
                  required
                  type="email"
                  value={provisionForm.email}
                  onChange={(e) =>
                    setProvisionForm({ ...provisionForm, email: e.target.value })
                  }
                  placeholder="partner@lawfirm.com"
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  Partner / Display Name
                </label>
                <input
                  value={provisionForm.displayName}
                  onChange={(e) =>
                    setProvisionForm({
                      ...provisionForm,
                      displayName: e.target.value,
                    })
                  }
                  placeholder="Managing Partner"
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  Law Firm / Organization
                </label>
                <input
                  value={provisionForm.companyName}
                  onChange={(e) =>
                    setProvisionForm({
                      ...provisionForm,
                      companyName: e.target.value,
                    })
                  }
                  placeholder="Cravath / Skadden / Enterprise"
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={provisionForm.tier}
                  onChange={(e) =>
                    setProvisionForm({ ...provisionForm, tier: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/15 text-xs text-white"
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro ($29.99/mo)</option>
                  <option value="firm">Firm ($149/mo)</option>
                  <option value="enterprise">Enterprise ($299/mo)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  Initial Status
                </label>
                <select
                  value={provisionForm.status}
                  onChange={(e) =>
                    setProvisionForm({
                      ...provisionForm,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/15 text-xs text-white"
                >
                  <option value="active">Active (Immediate Access)</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowProvisionModal(false)}
                className="px-4 py-2 rounded-lg bg-white/5 text-xs text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading === "provision"}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white"
              >
                {actionLoading === "provision"
                  ? "Provisioning..."
                  : "Provision Subscriber"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
