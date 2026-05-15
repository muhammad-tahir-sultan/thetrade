"use client";

import { useState } from "react";
import { Package, X, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDisplayedExpectedIncome, getDisplayedOrderAmount } from "@/lib/grab-display";
import { DepositModal } from "./DepositModal";

interface OrderModalProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    isProcessing: boolean;
    onContactCS?: () => void;
    error?: string | null;
    onDepositSubmit?: (amount: number, depositAddress: string) => Promise<void>;
    isDepositPending?: boolean;
    /** Wallet balance — combo orders show order amount as requiredDeposit + balance */
    balance?: number;
    /** Block opening a second deposit while one is PENDING */
    hasPendingDeposit?: boolean;
}

export function OrderModal({
    order,
    isOpen,
    onClose,
    onComplete,
    isProcessing,
    onContactCS,
    error,
    onDepositSubmit,
    isDepositPending,
    balance = 0,
    hasPendingDeposit = false,
}: OrderModalProps) {
    const [showDepositModal, setShowDepositModal] = useState(false);

    if (!isOpen || !order) return null;

    const displayOrderAmount = getDisplayedOrderAmount({
        isCombo: !!order.isCombo,
        storedPrice: Number(order.price) || 0,
        requiredDeposit: Number(order.requiredDeposit) || 0,
        walletBalance: balance,
    });
    const displayExpectedIncome = getDisplayedExpectedIncome(displayOrderAmount, Number(order.commission) || 0);

    const items = order.items ?? [];
    const isInsufficientBalance = error?.toLowerCase().includes("balance");

    // Parse required top-up from error messages like "…recharge 4295.9868 to submit…"
    const rechargeMatch = error?.match(/recharge\s+([\d.]+)/i);
    const requiredTopUp = rechargeMatch ? parseFloat(rechargeMatch[1]) : order.requiredDeposit ?? 0;

    return (
        <>
            <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="relative bg-[#f8f8f8] dark:bg-zinc-950 w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-[2.5rem] sm:rounded-4xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-500">

                    {/* Header */}
                    <div className="bg-white dark:bg-zinc-900 px-6 py-4 flex items-center justify-between border-b border-black/5">
                        <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">
                            <X size={24} />
                        </button>
                        <h2 className="text-lg font-bold">Order Details</h2>
                        <div className="w-10 h-10" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="space-y-3">
                            {items.length > 0 ? items.map((item: any, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-zinc-900 p-3 rounded-2xl flex gap-3 shadow-sm border border-black/5">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-0.5">
                                        <p className="text-xs sm:text-sm font-medium line-clamp-2 text-zinc-800 dark:text-zinc-200">{item.name}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-primary font-bold text-sm sm:text-base">{item.price.toFixed(2)} USDT</p>
                                            <p className="text-zinc-400 text-[10px] sm:text-xs">x{item.quantity}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-center space-y-2">
                                    <Package className="mx-auto text-zinc-300" size={40} />
                                    <p className="text-zinc-500 font-medium">{order.productName}</p>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-4xl space-y-3 shadow-sm border border-black/5">
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-zinc-400 font-medium">Transaction time</span>
                                <span className="text-zinc-800 dark:text-zinc-200 font-bold">
                                    {new Date(order.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-zinc-400 font-medium">Order amount</span>
                                <span className="text-zinc-800 dark:text-zinc-200 font-bold">{displayOrderAmount.toFixed(2)} USDT</span>
                            </div>
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-zinc-400 font-medium">Commissions</span>
                                <span className="text-zinc-800 dark:text-zinc-200 font-bold">{order.commission.toFixed(4)} USDT</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 mt-1 border-t border-black/5">
                                <span className="text-zinc-400 font-bold text-sm">Expected income</span>
                                <span className="text-xl font-black text-amber-600">
                                    {displayExpectedIncome.toFixed(4)} USDT
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-white dark:bg-zinc-900 border-t border-black/5 space-y-3">
                        <button
                            onClick={onComplete}
                            disabled={isProcessing || !!error}
                            className={cn(
                                "w-full py-4 rounded-2xl font-bold bg-[#6b5555] text-white hover:opacity-95 transition-all active:scale-[0.98] shadow-lg cursor-pointer",
                                (isProcessing || !!error) && "opacity-40 grayscale-[0.5] cursor-not-allowed"
                            )}
                        >
                            {isProcessing ? "Processing..." : "Submit order"}
                        </button>

                        {error && (
                            <button
                                onClick={onContactCS}
                                className="w-full py-3.5 rounded-2xl font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all border border-primary/10 active:scale-[0.98] cursor-pointer"
                            >
                                Request Instant Unlock
                            </button>
                        )}
                    </div>

                    {/* Floating insufficient balance popup — matches reference UI */}
                    {isInsufficientBalance && (
                        <div className="absolute inset-x-4 top-1/3 z-120 animate-in zoom-in-95 fade-in duration-300 pointer-events-none">
                            <div className="bg-black/88 backdrop-blur-xl text-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 ring-1 ring-white/20 space-y-4">
                                <p className="text-sm font-bold leading-relaxed text-center">
                                    Your account balance is not enough, you need to recharge{" "}
                                    <span className="text-amber-400 font-black">
                                        {requiredTopUp > 0 ? requiredTopUp.toFixed(4) : ""}
                                    </span>{" "}
                                    USDT to submit this order.
                                </p>

                                {onDepositSubmit && (
                                    <button
                                        type="button"
                                        disabled={hasPendingDeposit}
                                        onClick={() => {
                                            if (hasPendingDeposit) return;
                                            setShowDepositModal(true);
                                        }}
                                        className="w-full pointer-events-auto flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black text-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        <Wallet size={16} />
                                        {hasPendingDeposit ? "Deposit pending…" : "Deposit Now"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Deposit modal triggered from the combo popup */}
            <DepositModal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                requiredAmount={requiredTopUp > 0 ? requiredTopUp : undefined}
                hasPendingDeposit={hasPendingDeposit}
                onSubmitPending={onDepositSubmit}
                isPending={isDepositPending}
            />
        </>
    );
}
