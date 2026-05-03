"use client";

import { useState, useEffect } from "react";
import { Shield, Users, MessageSquare, Zap, Check, X, Ban, UserPlus, RefreshCw } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  tier?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  requestCount: number;
}

interface SystemStats {
  users: { total: number; active: number; pending: number };
  conversations: number;
  messages: number;
  tokens: {
    allTime: { prompt: number; completion: number; total: number; requests: number };
    last24h: { prompt: number; completion: number; total: number; requests: number };
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function estimateCost(promptTokens: number, completionTokens: number): string {
  // Using gpt-5.4-mini / Kimi-K2.5 base estimate: $0.15 / 1M prompt, $0.60 / 1M completion
  const cost = (promptTokens / 1_000_000) * 0.15 + (completionTokens / 1_000_000) * 0.60;
  return `$${cost.toFixed(4)}`;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats"),
      ]);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch admin data:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateUser = async (userId: string, updates: { status?: string; role?: string; tier?: string }) => {
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
    }
    setActionLoading(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Permanently delete this user and all their data?")) return;
    setActionLoading(userId);
    try {
      await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to delete user:", e);
    }
    setActionLoading(null);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "pending": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "suspended": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="h-full overflow-auto custom-scrollbar p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-900/20 border border-red-700/30 flex items-center justify-center">
            <Shield className="text-red-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-vox tracking-wider">ADMIN CONSOLE</h1>
            <p className="text-xs text-gray-500 font-mono tracking-wider uppercase">System Administration & Metering</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="glass-button px-4 py-2 flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          REFRESH
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-5 rounded-lg border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Users size={18} className="text-red-500" />
              <span className="text-xs text-gray-500 font-mono tracking-wider uppercase">Users</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.users.total}</div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-green-400">{stats.users.active} active</span>
              <span className="text-yellow-400">{stats.users.pending} pending</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-lg border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare size={18} className="text-red-500" />
              <span className="text-xs text-gray-500 font-mono tracking-wider uppercase">Conversations</span>
            </div>
            <div className="text-3xl font-bold text-white">{formatNumber(stats.conversations)}</div>
            <div className="text-xs text-gray-500 mt-2">{formatNumber(stats.messages)} total messages</div>
          </div>

          <div className="glass-panel p-5 rounded-lg border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Zap size={18} className="text-red-500" />
              <span className="text-xs text-gray-500 font-mono tracking-wider uppercase">Tokens (All Time)</span>
            </div>
            <div className="text-3xl font-bold text-white">{formatNumber(stats.tokens.allTime.total)}</div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-gray-500">↑ {formatNumber(stats.tokens.allTime.prompt)} prompt</span>
              <span className="text-gray-500">↓ {formatNumber(stats.tokens.allTime.completion)} compl</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-lg border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Zap size={18} className="text-yellow-500" />
              <span className="text-xs text-gray-500 font-mono tracking-wider uppercase">Tokens (24h)</span>
            </div>
            <div className="text-3xl font-bold text-white">{formatNumber(stats.tokens.last24h.total)}</div>
            <div className="text-xs text-gray-500 mt-2">{stats.tokens.last24h.requests} requests</div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-panel rounded-lg border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-mono tracking-wider text-gray-400 uppercase font-vox">Client Accounts</h2>
          <span className="text-xs text-gray-600">{users.length} total</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-mono">LOADING ACCOUNTS...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlus size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No registered users yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 font-mono tracking-wider uppercase border-b border-white/5">
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Tier</th>
                  <th className="px-5 py-3 text-right">Tokens Used</th>
                  <th className="px-5 py-3 text-right">Est. Cost</th>
                  <th className="px-5 py-3 text-right">Requests</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <span className="text-white font-medium">{user.email}</span>
                        {user.displayName && (
                          <span className="block text-xs text-gray-500 mt-0.5">{user.displayName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded border font-mono tracking-wider uppercase ${
                        user.role === "admin" ? "text-red-400 bg-red-900/10 border-red-700/20" : "text-gray-400 bg-white/5 border-white/10"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded border font-mono tracking-wider uppercase ${statusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.tier || "starter"}
                        onChange={(e) => updateUser(user.id, { tier: e.target.value })}
                        disabled={actionLoading === user.id}
                        className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 font-mono focus:outline-none focus:border-red-500/50"
                      >
                        <option value="starter">STARTER</option>
                        <option value="pro">PRO</option>
                        <option value="firm">FIRM</option>
                        <option value="enterprise">ENTERPRISE</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-gray-300">
                      {formatNumber(user.tokenUsage.totalTokens)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-green-400">
                      {estimateCost(user.tokenUsage.promptTokens, user.tokenUsage.completionTokens)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-gray-500">
                      {user.requestCount}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {user.role !== "admin" && (
                          <>
                            {user.status === "pending" && (
                              <button
                                onClick={() => updateUser(user.id, { status: "active" })}
                                disabled={actionLoading === user.id}
                                className="p-1.5 rounded hover:bg-green-500/10 text-green-400 transition-colors"
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            {user.status === "active" && (
                              <button
                                onClick={() => updateUser(user.id, { status: "suspended" })}
                                disabled={actionLoading === user.id}
                                className="p-1.5 rounded hover:bg-yellow-500/10 text-yellow-400 transition-colors"
                                title="Suspend"
                              >
                                <Ban size={14} />
                              </button>
                            )}
                            {user.status === "suspended" && (
                              <button
                                onClick={() => updateUser(user.id, { status: "active" })}
                                disabled={actionLoading === user.id}
                                className="p-1.5 rounded hover:bg-green-500/10 text-green-400 transition-colors"
                                title="Reactivate"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(user.id)}
                              disabled={actionLoading === user.id}
                              className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                              title="Delete"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {user.role === "admin" && (
                          <span className="text-[10px] text-gray-600 font-mono">OWNER</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
