"use client";

import { useSession } from "next-auth/react";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { TransactionForm } from "@/components/dashboard/TransactionForm";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { useTrading } from "@/hooks/useTrading";
import { toast } from "sonner";

export default function DashboardPage() {
    const { data: session } = useSession();
    const { balance, transactions, loading, isProcessing, createTransaction } = useTrading();

    return (
        <>
            <header className="flex items-center justify-between mb-8 md:mb-12">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-1 md:mb-2">Financial Overview</h1>
                    <p className="text-secondary text-base md:text-lg">Good day, {session?.user?.name || "Trader"}!</p>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary/5 rounded-2xl border border-secondary/10 flex items-center justify-center text-2xl shadow-sm">👤</div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10">
                    <BalanceCard balance={balance} />
                    <TransactionList transactions={transactions.slice(0, 5)} />
                </div>

                <div className="space-y-10">
                    <TransactionForm
                        balance={balance}
                        onAction={async (type, amount) => {
                            toast.promise(createTransaction({ type, amount }), {
                                loading: `Processing ${type.toLowerCase()}...`,
                                success: `${type === "DEPOSIT" ? "Deposited" : "Withdrawn"} $${amount.toLocaleString()} successfully!`,
                                error: (err) => err.message || "Transaction failed",
                            });
                        }}
                        isPending={isProcessing}
                    />
                </div>
            </div>
        </>
    );
}
