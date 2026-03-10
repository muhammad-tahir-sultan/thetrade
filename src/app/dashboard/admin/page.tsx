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

    if (userLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (role !== "ADMIN") return null;

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
                
                <button onClick={() => refresh()} disabled={isLoading} className="flex items-center gap-2 px-6 py-3 bg-secondary/10 hover:bg-secondary/20 rounded-xl font-bold transition-all disabled:opacity-50">
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Tab System */}
            <div className="flex items-center p-1 bg-secondary/10 rounded-2xl w-fit">
                <button onClick={() => setActiveTab("TRANSACTIONS")} className={cn("px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all", activeTab === "TRANSACTIONS" ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-secondary hover:text-primary")}>
                    <ArrowLeftRight size={18} /> Transactions
                </button>
                <button onClick={() => setActiveTab("CS_REQUESTS")} className={cn("px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all relative", activeTab === "CS_REQUESTS" ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-secondary hover:text-primary")}>
                    <MessageCircle size={18} /> CS Requests
                    {csRequests.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-background animate-pulse">{csRequests.length}</span>}
                </button>
            </div>

            <div className="bg-background border border-secondary/10 rounded-[2rem] overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-8 space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="h-20 bg-secondary/10 rounded-2xl animate-pulse" />))}</div>
                ) : activeTab === "TRANSACTIONS" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-secondary/10 bg-secondary/5">
                                    <th className="p-4 sm:p-6 font-bold text-secondary text-xs uppercase tracking-wider">User</th>
                                    <th className="p-4 sm:p-6 font-bold text-secondary text-xs uppercase tracking-wider">Type</th>
                                    <th className="p-4 sm:p-6 font-bold text-secondary text-xs uppercase tracking-wider">Amount</th>
                                    <th className="p-4 sm:p-6 font-bold text-secondary text-xs uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingTransactions.map((tx: any) => (
                                    <tr key={tx._id} className="border-b border-secondary/5 hover:bg-secondary/5 transition-colors">
                                        <td className="p-4 sm:p-6"><div className="font-bold">{tx.userId?.name}</div><div className="text-xs text-secondary">{tx.userId?.email}</div></td>
                                        <td className="p-4 sm:p-6"><span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", tx.type === "DEPOSIT" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary")}>{tx.type}</span></td>
                                        <td className="p-4 sm:p-6 font-black">${tx.amount.toFixed(2)}</td>
                                        <td className="p-4 sm:p-6 flex items-center justify-end gap-2">
                                            <button disabled={isUpdating} onClick={() => handleAccept(tx._id)} className="p-2 bg-green-500/10 text-green-500 rounded-xl"><CheckCircle size={18}/></button>
                                            <button disabled={isUpdating} onClick={() => updateStatus({id: tx._id, status: "REJECTED"})} className="p-2 bg-red-500/10 text-red-500 rounded-xl"><XCircle size={18}/></button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingTransactions.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-secondary font-medium">No pending transactions</td></tr>}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <CSRequestList requests={csRequests} onResolve={handleResolveCS} isUpdating={isUpdating} />
                )}
            </div>
        </div>
    );
}
