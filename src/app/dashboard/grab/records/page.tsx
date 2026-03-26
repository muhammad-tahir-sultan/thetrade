"use client";

import { useState } from "react";
import { Info, ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGrabOrder } from "@/hooks/useGrabOrder";
import { useTrading } from "@/hooks/useTrading";
import { GrabRecordList } from "@/components/dashboard/GrabRecordList";
import { OrderModal } from "@/components/dashboard/OrderModal";
import { DepositModal } from "@/components/dashboard/DepositModal";

export default function GrabRecordsPage() {
    const { records, isLoadingRecords, refetchRecords, completeOrder, isCompleting } = useGrabOrder();
    const { createTransaction, isProcessing } = useTrading();
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [depositOrder, setDepositOrder] = useState<any>(null);
    const router = useRouter();

    const handleDepositForOrder = async (amount: number) => {
        await createTransaction({ type: "DEPOSIT", amount });
        setDepositOrder(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto pb-24 px-4 overflow-x-hidden">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-secondary/10 hover:bg-secondary/20 rounded-full text-secondary transition-all cursor-pointer"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black tracking-tight mb-1">Profit Records</h1>
                    <p className="text-secondary text-xs font-medium">Your recent earning history</p>
                </div>
                <button
                    onClick={() => refetchRecords()}
                    disabled={isLoadingRecords}
                    className="p-3 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-all disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw size={20} className={isLoadingRecords ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="bg-secondary/5 rounded-[2.5rem] p-6 border border-secondary/10 shadow-sm min-h-[50vh]">
                <div className="flex items-start gap-4 mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-4xl">
                    <div className="p-2 bg-amber-500 rounded-xl text-white shrink-0 shadow-lg shadow-amber-500/20">
                        <Info size={20} />
                    </div>
                    <p className="text-[13px] text-zinc-900 dark:text-zinc-100 font-bold leading-relaxed pt-1">
                        Each settled order adds a direct commission to your wallet instantly. Combo orders require a deposit to unlock.
                    </p>
                </div>

                {isLoadingRecords ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 bg-secondary/10 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <GrabRecordList
                        records={records}
                        onAction={(order) => setSelectedOrder(order)}
                        onDepositRequired={(order) => setDepositOrder(order)}
                    />
                )}
            </div>

            {/* Standard order modal for PENDING orders */}
            <OrderModal
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => {
                    setSelectedOrder(null);
                    setOrderError(null);
                }}
                isProcessing={isCompleting}
                error={orderError}
                onComplete={async () => {
                    try {
                        setOrderError(null);
                        await completeOrder(selectedOrder._id);
                        setSelectedOrder(null);
                    } catch (err: any) {
                        setOrderError(err.message);
                    }
                }}
                onDepositSubmit={async (amount) => {
                    await createTransaction({ type: "DEPOSIT", amount });
                }}
                isDepositPending={isProcessing}
            />

            {/* Deposit modal for COMBO orders that need funding */}
            <DepositModal
                isOpen={!!depositOrder}
                onClose={() => setDepositOrder(null)}
                requiredAmount={depositOrder?.requiredDeposit ?? undefined}
                onSubmitPending={handleDepositForOrder}
                isPending={isProcessing}
            />
        </div>
    );
}
