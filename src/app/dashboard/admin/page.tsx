"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { useTrading } from "@/hooks/useTrading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, RefreshCw, MessageCircle, ArrowLeftRight, Wallet, Users, Copy, Search, UserPlus2 } from "lucide-react";
import { toast } from "sonner";
import { CSRequestList } from "@/components/admin/CSRequestList";
import { TaskRequestList } from "@/components/admin/TaskRequestList";
import { DepositAddressManager } from "@/components/admin/DepositAddressManager";
import { cn } from "@/lib/utils";

type Tab = "TRANSACTIONS" | "CS_REQUESTS" | "TASK_REQUESTS" | "DEPOSIT_ADDRESS" | "INVITATIONS" | "HISTORY";

export default function AdminDashboard() {
    const { role, loading: userLoading } = useTrading();
    const router = useRouter();
    const {
        pendingTransactions,
        csRequests,
        taskRequests,
        depositAddresses,
        invitations,
        adminHistory,
        invitationSearch,
        invitationRoleFilter,
        selectedInviterId,
        historySearch,
        historyTypeFilter,
        setInvitationSearch,
        setInvitationRoleFilter,
        setSelectedInviterId,
        setHistorySearch,
        setHistoryTypeFilter,
        isLoadingAddresses,
        isLoading,
        error,
        updateStatus,
        updateCSStatus,
        approveTasks,
        isUpdating,
        refresh,
        refreshAddresses,
    } = useAdmin();
    const [activeTab, setActiveTab] = useState<Tab>("TRANSACTIONS");

    useEffect(() => {
        if (!userLoading && role !== "ADMIN") router.push("/dashboard");
    }, [role, userLoading, router]);

    if (!userLoading && role !== "ADMIN") return null;

    const handleAccept = async (id: string) => {
        try {
            await updateStatus({ id, status: "COMPLETED" });
            toast.success("Transaction accepted successfully");
        } catch (error: any) {
            toast.error("Failed to accept: " + error.message);
        }
    };

    const handleResolveCS = async (id: string) => {
        try {
            await updateCSStatus({ id, status: "RESOLVED" });
            toast.success("Request resolved and order unlocked!");
        } catch (error: any) {
            toast.error("Failed to resolve: " + error.message);
        }
    };

    const handleApproveTasks = async (userId: string, comboConfig: any[]) => {
        try {
            await approveTasks({ userId, comboConfig });
            toast.success("Tasks approved successfully!");
            return true;
        } catch (error: any) {
            toast.error("Failed to approve: " + error.message);
            return false;
        }
    };

    const handleCopyCode = async (code?: string) => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            toast.success(`Copied: ${code}`);
        } catch {
            toast.error("Could not copy code");
        }
    };

    const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
        { id: "TRANSACTIONS", label: "Transactions", icon: <ArrowLeftRight size={18} /> },
        { id: "CS_REQUESTS", label: "CS Requests", icon: <MessageCircle size={18} />, badge: csRequests.length },
        { id: "TASK_REQUESTS", label: "Task Requests", icon: <Clock size={18} />, badge: taskRequests.length },
        { id: "DEPOSIT_ADDRESS", label: "Deposit Address", icon: <Wallet size={18} /> },
        { id: "INVITATIONS", label: "Invitations", icon: <Users size={18} /> },
        { id: "HISTORY", label: "History", icon: <Clock size={18} /> },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Super Admin Space</h1>
                    <p className="text-secondary font-medium">System overview and manual authorization</p>
                </div>
                <button
                    onClick={() => refresh()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary/10 hover:bg-secondary/20 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Tab System */}
            <div className="flex items-center p-1 bg-secondary/10 rounded-2xl overflow-x-auto max-w-full gap-0.5">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all relative cursor-pointer whitespace-nowrap text-sm",
                            activeTab === tab.id
                                ? "bg-white dark:bg-zinc-800 shadow-sm text-primary"
                                : "text-secondary hover:text-primary"
                        )}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                        {!!tab.badge && tab.badge > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-background animate-pulse">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-2">
                    <XCircle size={18} />
                    Failed to sync: {(error as any).message}
                </div>
            )}

            <div className="bg-background border border-secondary/10 rounded-4xl overflow-hidden shadow-sm min-h-[400px]">
                {(isLoading || userLoading) && activeTab !== "DEPOSIT_ADDRESS" ? (
                    <div className="p-8 space-y-4">
                        <div className="h-12 bg-secondary/5 rounded-2xl animate-pulse w-full mb-8" />
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="h-16 bg-secondary/5 rounded-2xl animate-pulse flex-1" />
                                <div className="h-16 bg-secondary/5 rounded-2xl animate-pulse w-24" />
                            </div>
                        ))}
                    </div>
                ) : activeTab === "TRANSACTIONS" ? (
                    pendingTransactions.length === 0 ? (
                        <div className="w-full min-h-[400px] p-12 text-center flex flex-col items-center justify-center gap-4 text-secondary flex-1">
                            <Clock size={56} className="opacity-20 mb-2" />
                            <div className="space-y-1">
                                <p className="font-black text-xl text-white/90">No pending transactions</p>
                                <p className="text-xs opacity-50 max-w-[280px] leading-relaxed mx-auto">
                                    New deposit or withdrawal requests appear here as soon as users submit them.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-secondary/10 bg-secondary/5">
                                        <th className="p-4 sm:p-6 font-bold text-secondary text-xs uppercase tracking-wider">User</th>
                                        <th className="p-4 sm:p-6 font-bold text-secondary text-xs uppercase tracking-wider">Type</th>
                                        <th className="p-4 sm:p-6 font-bold text-secondary text-xs uppercase tracking-wider">Amount</th>
                                        <th className="p-4 sm:p-6 font-bold text-secondary text-xs uppercase tracking-wider">Time</th>
                                        <th className="p-4 sm:p-6 font-bold text-secondary text-xs uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingTransactions.map((tx: any) => (
                                        <tr key={tx._id} className="border-b border-secondary/5 hover:bg-secondary/5 transition-colors">
                                            <td className="p-4 sm:p-6">
                                                <div className="font-bold">{tx.userId?.name}</div>
                                                <div className="text-xs text-secondary">{tx.userId?.email}</div>
                                            </td>
                                            <td className="p-4 sm:p-6">
                                                <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", tx.type === "DEPOSIT" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary")}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="p-4 sm:p-6">
                                                <div className="font-black">${tx.amount.toFixed(2)}</div>
                                                {tx.type === "DEPOSIT" && tx.depositAddress && (
                                                    <div className="text-[10px] font-mono text-secondary mt-1 max-w-[120px] truncate" title={tx.depositAddress}>
                                                        {tx.depositAddress}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 sm:p-6 text-xs font-medium text-secondary">
                                                {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}<br />
                                                {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </td>
                                            <td className="p-4 sm:p-6 flex items-center justify-end gap-2 text-right">
                                                <button disabled={isUpdating} onClick={() => handleAccept(tx._id)} className="p-2 bg-green-500/10 text-green-500 rounded-xl cursor-pointer transition-transform active:scale-90">
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button disabled={isUpdating} onClick={() => updateStatus({ id: tx._id, status: "REJECTED" })} className="p-2 bg-red-500/10 text-red-500 rounded-xl cursor-pointer transition-transform active:scale-90">
                                                    <XCircle size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : activeTab === "CS_REQUESTS" ? (
                    <CSRequestList requests={csRequests} onResolve={handleResolveCS} isUpdating={isUpdating} />
                ) : activeTab === "TASK_REQUESTS" ? (
                    <TaskRequestList requests={taskRequests} onApprove={handleApproveTasks} isUpdating={isUpdating} />
                ) : activeTab === "INVITATIONS" ? (
                    <div className="space-y-5 p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-2 relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                <input
                                    value={invitationSearch}
                                    onChange={(e) => setInvitationSearch(e.target.value)}
                                    placeholder="Search by invitation code, name, email..."
                                    className="w-full pl-9 pr-3 py-2.5 bg-secondary/5 border border-secondary/10 rounded-xl outline-none focus:border-primary/40 text-sm"
                                />
                            </div>
                            <select
                                value={invitationRoleFilter}
                                onChange={(e) => setInvitationRoleFilter(e.target.value as any)}
                                className="px-3 py-2.5 bg-secondary/5 border border-secondary/10 rounded-xl outline-none text-sm"
                            >
                                <option value="ALL">All roles</option>
                                <option value="ADMIN">Admin</option>
                                <option value="USER">User</option>
                            </select>
                            <button
                                onClick={() => setSelectedInviterId("")}
                                className="px-3 py-2.5 bg-secondary/10 hover:bg-secondary/20 rounded-xl font-bold text-sm cursor-pointer"
                            >
                                {selectedInviterId ? "Clear Inviter Filter" : "Inviter Filter: All"}
                            </button>
                        </div>

                        {invitations.length === 0 ? (
                            <div className="w-full min-h-[320px] p-8 text-center flex flex-col items-center justify-center gap-4 text-secondary">
                                <Users size={48} className="opacity-20 mb-2" />
                                <p className="font-black text-lg text-white/90">No invitation records found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-secondary/10 bg-secondary/5">
                                            <th className="p-4 font-bold text-secondary text-xs uppercase tracking-wider">User</th>
                                            <th className="p-4 font-bold text-secondary text-xs uppercase tracking-wider">Own Code</th>
                                            <th className="p-4 font-bold text-secondary text-xs uppercase tracking-wider">Invited By</th>
                                            <th className="p-4 font-bold text-secondary text-xs uppercase tracking-wider">Direct Invites</th>
                                            <th className="p-4 font-bold text-secondary text-xs uppercase tracking-wider">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invitations.map((u: any) => (
                                            <tr key={u._id} className="border-b border-secondary/5 hover:bg-secondary/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold">{u.name}</div>
                                                    <div className="text-xs text-secondary">{u.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs bg-secondary/10 px-2 py-1 rounded-lg">{u.invitationCode || "—"}</span>
                                                        <button
                                                            onClick={() => handleCopyCode(u.invitationCode)}
                                                            className="p-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 cursor-pointer"
                                                            title="Copy invitation code"
                                                        >
                                                            <Copy size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-secondary">{u.invitedByCode || "ROOT"}</span>
                                                        {!!u.invitedBy && (
                                                            <button
                                                                onClick={() => setSelectedInviterId(String(u.invitedBy))}
                                                                className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-lg font-bold cursor-pointer"
                                                            >
                                                                Filter by inviter
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Link
                                                        href={`/dashboard/admin?tab=INVITATIONS&inviterId=${u._id}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSelectedInviterId(String(u._id));
                                                        }}
                                                        className="inline-flex items-center gap-1.5 text-xs px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg font-bold hover:bg-emerald-500/20"
                                                    >
                                                        <UserPlus2 size={12} />
                                                        {Number(u.totalInvites || 0)}
                                                    </Link>
                                                </td>
                                                <td className="p-4">
                                                    <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", u.role === "ADMIN" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500")}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : activeTab === "HISTORY" ? (
                    <div className="space-y-5 p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="relative md:col-span-2">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                <input
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    placeholder="Search user, email, invitation code, address..."
                                    className="w-full pl-9 pr-3 py-2.5 bg-secondary/5 border border-secondary/10 rounded-xl outline-none focus:border-primary/40 text-sm"
                                />
                            </div>
                            <select
                                value={historyTypeFilter}
                                onChange={(e) => setHistoryTypeFilter(e.target.value as any)}
                                className="px-3 py-2.5 bg-secondary/5 border border-secondary/10 rounded-xl outline-none text-sm"
                            >
                                <option value="ALL">All transaction types</option>
                                <option value="DEPOSIT">Deposits only</option>
                                <option value="WITHDRAW">Withdrawals only</option>
                            </select>
                        </div>

                        {adminHistory.length === 0 ? (
                            <div className="w-full min-h-[320px] p-8 text-center flex flex-col items-center justify-center gap-4 text-secondary">
                                <Clock size={48} className="opacity-20 mb-2" />
                                <p className="font-black text-lg text-white/90">No history entries found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-secondary/10 bg-secondary/5">
                                            <th className="p-4 font-bold text-secondary text-xs uppercase tracking-wider">Event</th>
                                            <th className="p-4 font-bold text-secondary text-xs uppercase tracking-wider">User</th>
                                            <th className="p-4 font-bold text-secondary text-xs uppercase tracking-wider">Invitation Chain</th>
                                            <th className="p-4 font-bold text-secondary text-xs uppercase tracking-wider">Flow</th>
                                            <th className="p-4 font-bold text-secondary text-xs uppercase tracking-wider">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminHistory.map((item: any) => (
                                            <tr key={item.id} className="border-b border-secondary/5 hover:bg-secondary/5 transition-colors align-top">
                                                <td className="p-4">
                                                    {item.eventType === "USER_REGISTERED" ? (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">USER_REGISTERED</span>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", item.txType === "DEPOSIT" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary")}>
                                                                {item.txType}
                                                            </span>
                                                            <div className="text-[10px] text-secondary">{item.status}</div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold">{item.userName}</div>
                                                    <div className="text-xs text-secondary">{item.userEmail}</div>
                                                    <div className="text-[10px] text-secondary mt-1">{item.role}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs font-mono">{item.invitationCode || "—"}</div>
                                                    <div className="text-[11px] text-secondary mt-1">via {item.invitedByCode || "ROOT"}</div>
                                                </td>
                                                <td className="p-4">
                                                    {item.eventType === "TRANSACTION" ? (
                                                        <div className="space-y-1">
                                                            <div className={cn("text-sm font-black", item.direction === "INCOMING" ? "text-emerald-500" : "text-orange-500")}>
                                                                {item.direction === "INCOMING" ? "+" : "-"}${Number(item.amount || 0).toFixed(2)}
                                                            </div>
                                                            {!!item.address && (
                                                                <div className="text-[10px] text-secondary max-w-[220px] truncate" title={item.address}>
                                                                    {item.address}
                                                                </div>
                                                            )}
                                                            {!!item.network && (
                                                                <div className="text-[10px] text-secondary">{item.network}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-secondary">Account joined</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-xs font-medium text-secondary">
                                                    {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}<br />
                                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <DepositAddressManager
                        addresses={depositAddresses}
                        onRefresh={refreshAddresses}
                        isLoading={isLoadingAddresses}
                    />
                )}
            </div>
        </div>
    );
}
