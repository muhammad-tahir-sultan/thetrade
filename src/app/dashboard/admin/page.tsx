"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { useTrading } from "@/hooks/useTrading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
    const { role, loading: userLoading } = useTrading();
    const router = useRouter();
    const { pendingTransactions, isLoading, updateStatus, isUpdating, refresh } = useAdmin();

    useEffect(() => {
        if (!userLoading && role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [role, userLoading, router]);

    if (userLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (role !== "ADMIN") return null;

    const handleAccept = async (id: string) => {
        try {
            await updateStatus({ id, status: "COMPLETED" });
            toast.success("Transaction accepted successfully");
        } catch (error) {
            toast.error("Failed to accept transaction: " + (error as any).message);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await updateStatus({ id, status: "REJECTED" });
            toast.success("Transaction rejected successfully");
        } catch (error) {
            toast.error("Failed to reject transaction: " + (error as any).message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Super Admin Space</h1>
                    <p className="text-secondary font-medium">Manage pending deposits and withdrawals</p>
                </div>
                
                <button
                    onClick={() => refresh()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary/10 hover:bg-secondary/20 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    Refresh Data
                </button>
            </div>

            <div className="bg-background border border-secondary/10 rounded-[2rem] overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-secondary/10 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : pendingTransactions.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-4 text-secondary">
                        <Clock size={48} className="opacity-20" />
                        <p className="font-medium text-lg">No pending requests at the moment</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-secondary/10 bg-secondary/5">
                                    <th className="p-6 font-bold text-secondary text-sm uppercase tracking-wider">User</th>
                                    <th className="p-6 font-bold text-secondary text-sm uppercase tracking-wider">Type</th>
                                    <th className="p-6 font-bold text-secondary text-sm uppercase tracking-wider">Amount</th>
                                    <th className="p-6 font-bold text-secondary text-sm uppercase tracking-wider">Date</th>
                                    <th className="p-6 font-bold text-secondary text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingTransactions.map((tx: any) => (
                                    <tr key={tx._id} className="border-b border-secondary/5 hover:bg-secondary/5 transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold">{tx.userId?.name || "Unknown"}</div>
                                            <div className="text-sm text-secondary">{tx.userId?.email || "No email"}</div>
                                            <div className="text-xs font-semibold mt-1 text-primary flex items-center gap-1">
                                                Balance: ${tx.userId?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? "0.00"}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                tx.type === "DEPOSIT"
                                                    ? "bg-green-500/10 text-green-500"
                                                    : "bg-primary/10 text-primary"
                                            }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="p-6 font-black text-lg">
                                            ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-6 text-secondary text-sm font-medium">
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-6 flex items-center justify-end gap-2">
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => handleAccept(tx._id)}
                                                className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-xl transition-all cursor-pointer font-bold flex items-center gap-2"
                                            >
                                                <CheckCircle size={18} />
                                                <span className="hidden sm:inline">Accept</span>
                                            </button>
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => handleReject(tx._id)}
                                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all cursor-pointer font-bold flex items-center gap-2"
                                            >
                                                <XCircle size={18} />
                                                <span className="hidden sm:inline">Reject</span>
                                            </button>
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
