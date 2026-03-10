"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { useTrading } from "@/hooks/useTrading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw, MessageCircle, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { CSRequestList } from "@/components/admin/CSRequestList";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
    const { role, loading: userLoading } = useTrading();
    const router = useRouter();
    const { pendingTransactions, csRequests, isLoading, updateStatus, updateCSStatus, isUpdating, refresh } = useAdmin();
    const [activeTab, setActiveTab] = useState<"TRANSACTIONS" | "CS_REQUESTS">("TRANSACTIONS");

    useEffect(() => {
        if (!userLoading && role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [role, userLoading, router]);

    // Don't render content if we're sure they aren't admin, but don't block with a full-page spinner while checking
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Super Admin Space</h1>
                    <p className="text-secondary font-medium">System overview and manual authorization</p>
                </div>
                
                <button onClick={() => refresh()} disabled={isLoading} className="flex items-center gap-2 px-6 py-3 bg-secondary/10 hover:bg-secondary/20 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer">
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Tab System */}
            <div className="flex items-center p-1 bg-secondary/10 rounded-2xl w-fit">
                <button onClick={() => setActiveTab("TRANSACTIONS")} className={cn("px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer", activeTab === "TRANSACTIONS" ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-secondary hover:text-primary")}>
                    <ArrowLeftRight size={18} /> Transactions
                </button>
                <button onClick={() => setActiveTab("CS_REQUESTS")} className={cn("px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all relative cursor-pointer", activeTab === "CS_REQUESTS" ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-secondary hover:text-primary")}>
                    <MessageCircle size={18} /> CS Requests
                    {(isLoading || userLoading) ? (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary/20 rounded-full animate-pulse border-2 border-background" />
                    ) : csRequests.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-background animate-pulse">{csRequests.length}</span>
                    )}
                </button>
            </div>

            <div className="bg-background border border-secondary/10 rounded-[2rem] overflow-hidden shadow-sm min-h-[400px]">
                {(isLoading || userLoading) ? (
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
                                    Your workspace is clear! New deposit or withdrawal requests will appear here as soon as they are submitted by users.
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
                                            <td className="p-4 sm:p-6"><div className="font-bold">{tx.userId?.name}</div><div className="text-xs text-secondary">{tx.userId?.email}</div></td>
                                            <td className="p-4 sm:p-6"><span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", tx.type === "DEPOSIT" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary")}>{tx.type}</span></td>
                                            <td className="p-4 sm:p-6 font-black">${tx.amount.toFixed(2)}</td>
                                            <td className="p-4 sm:p-6 text-xs font-medium text-secondary">
                                                {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} <br/>
                                                {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-4 sm:p-6 flex items-center justify-end gap-2">
                                                <button disabled={isUpdating} onClick={() => handleAccept(tx._id)} className="p-2 bg-green-500/10 text-green-500 rounded-xl cursor-pointer transition-transform active:scale-90"><CheckCircle size={18}/></button>
                                                <button disabled={isUpdating} onClick={() => updateStatus({id: tx._id, status: "REJECTED"})} className="p-2 bg-red-500/10 text-red-500 rounded-xl cursor-pointer transition-transform active:scale-90"><XCircle size={18}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <CSRequestList requests={csRequests} onResolve={handleResolveCS} isUpdating={isUpdating} />
                )}
            </div>
        </div>
    );
}
