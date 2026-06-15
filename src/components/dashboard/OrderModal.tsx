"use client";

import { useState } from "react";
import { Package, X, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    comboNeedsDeposit,
    getAdminRequiredDeposit,
    getComboTopUpAmount,
    getDisplayedExpectedIncome,
    getDisplayedOrderAmount,
} from "@/lib/grab-display";
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
    const orderPrice = Number(order.price) || 0;
    const adminRequiredDeposit = getAdminRequiredDeposit(order.requiredDeposit);
    const needsDeposit = comboNeedsDeposit({
        isCombo: !!order.isCombo,
        isAdminAuthorized: order.isAdminAuthorized,
        storedPrice: orderPrice,
        walletBalance: balance,
    });
    const requiredTopUp = getComboTopUpAmount(orderPrice, balance);

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
                                <span className="text-zinc-800 dark:text-zinc-200 font-bold">{Number(order.commission).toFixed(2)} USDT</span>
                            </div>
                            {order.isCombo && adminRequiredDeposit > 0 && (
                                <>
                                    <div className="flex justify-between items-center text-xs sm:text-sm">
                                        <span className="text-zinc-400 font-medium">Required deposit</span>
                                        <span className="text-amber-600 font-bold">{adminRequiredDeposit.toFixed(2)} USDT</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs sm:text-sm">
                                        <span className="text-zinc-400 font-medium">Your balance</span>
                                        <span className={cn("font-bold", needsDeposit ? "text-amber-600" : "text-zinc-800 dark:text-zinc-200")}>
                                            {balance.toFixed(2)} USDT
                                        </span>
                                    </div>
                                </>
                            )}
                            {needsDeposit && (
                                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-center">
                                    <p className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                                        Deposit{" "}
                                        <span className="text-amber-600 font-black">{requiredTopUp.toFixed(2)} USDT</span>
                                        {" "}more to submit this combo order.
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 mt-1 border-t border-black/5">
                                <span className="text-zinc-400 font-bold text-sm">Expected income</span>
                                <span className="text-xl font-black text-amber-600">
                                    {displayExpectedIncome.toFixed(2)} USDT
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-white dark:bg-zinc-900 border-t border-black/5 space-y-3">
                        {needsDeposit && onDepositSubmit ? (
                            <button
                                type="button"
                                disabled={hasPendingDeposit}
                                onClick={() => {
                                    if (hasPendingDeposit) return;
                                    setShowDepositModal(true);
                                }}
                                className="w-full py-4 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Wallet size={18} />
                                {hasPendingDeposit ? "Deposit pending…" : "Deposit Now"}
                            </button>
                        ) : (
                            <button
                                onClick={onComplete}
                                disabled={isProcessing || !!error || needsDeposit}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-bold bg-[#6b5555] text-white hover:opacity-95 transition-all active:scale-[0.98] shadow-lg cursor-pointer",
                                    (isProcessing || !!error || needsDeposit) && "opacity-40 grayscale-[0.5] cursor-not-allowed"
                                )}
                            >
                                {isProcessing ? "Processing..." : "Submit order"}
                            </button>
                        )}

                        {error && (
                            <button
                                onClick={onContactCS}
                                className="w-full py-3.5 rounded-2xl font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all border border-primary/10 active:scale-[0.98] cursor-pointer"
                            >
                                Request Instant Unlock
                            </button>
                        )}
                    </div>
                </div>
            </div>

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
