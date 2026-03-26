"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, AlertTriangle, ChevronLeft, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Pre-fill amount when coming from a combo order deposit requirement */
    requiredAmount?: number;
    onSubmitPending?: (amount: number) => Promise<void>;
    isPending?: boolean;
}

interface AddressData {
    address: string | null;
    network: string;
}

export function DepositModal({ isOpen, onClose, requiredAmount, onSubmitPending, isPending }: DepositModalProps) {
    const [addressData, setAddressData] = useState<AddressData>({ address: null, network: "TRON (TRC-20)" });
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [amount, setAmount] = useState(requiredAmount?.toString() ?? "");

    useEffect(() => {
        if (!isOpen) return;
        setAmount(requiredAmount?.toString() ?? "");
        fetchAddress();
    }, [isOpen, requiredAmount]);

    const fetchAddress = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/deposit/address");
            const data = await res.json();
            setAddressData(data);
        } catch {
            toast.error("Could not load deposit address");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!addressData.address) return;
        navigator.clipboard.writeText(addressData.address);
        setIsCopied(true);
        toast.success("Address copied!");
        setTimeout(() => setIsCopied(false), 2500);
    };

    const handleSubmitDeposit = async () => {
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (!onSubmitPending) return;
        try {
            await onSubmitPending(numAmount);
            onClose();
        } catch (err: any) {
            toast.error(err.message ?? "Failed to submit deposit request");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-110 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-white dark:bg-zinc-950 w-full max-w-md flex flex-col rounded-t-[2.5rem] sm:rounded-4xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-500 max-h-[95vh]">

                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900">
                    <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-lg font-bold">Deposit</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer">
                        <X size={22} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {/* Network badge */}
                    <div className="text-center space-y-1">
                        <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100">1</p>
                        <p className="text-sm text-zinc-500 font-medium">Network - {addressData.network}</p>
                    </div>

                    {/* Warning banner */}
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
                        <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
                            You have an order that has not been paid. Deposit the required amount and notify customer service.
                        </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-bold tracking-wider uppercase">One Time Address:</p>

                        {isLoading ? (
                            <div className="w-48 h-48 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                                <Loader2 className="animate-spin text-zinc-400" size={32} />
                            </div>
                        ) : addressData.address ? (
                            <div className="p-4 bg-white rounded-2xl shadow-md border border-black/5">
                                <QRCodeSVG value={addressData.address} size={180} level="H" includeMargin />
                            </div>
                        ) : (
                            <div className="w-48 h-48 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 text-xs text-center px-4">
                                No deposit address configured yet. Contact support.
                            </div>
                        )}

                        {/* Address copy row */}
                        {addressData.address && (
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl w-full max-w-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all group cursor-pointer"
                            >
                                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate flex-1 text-left">
                                    {addressData.address}
                                </span>
                                {isCopied ? (
                                    <Check size={16} className="text-green-500 shrink-0" />
                                ) : (
                                    <Copy size={16} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 shrink-0 transition-colors" />
                                )}
                            </button>
                        )}

                        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 animate-pulse">Waiting for payment...</p>
                    </div>

                    {/* Amount input */}
                    {onSubmitPending && (
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Deposit Amount (USDT)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">$</span>
                                <input
                                    type="number"
                                    className="w-full pl-9 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-base"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleSubmitDeposit}
                                disabled={isPending || !addressData.address}
                                className={cn(
                                    "w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all active:scale-[0.98] cursor-pointer",
                                    (isPending || !addressData.address) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isPending ? "Submitting..." : "I Have Paid — Submit Request"}
                            </button>
                        </div>
                    )}

                    {/* Tips section */}
                    <div className="space-y-3 pb-2">
                        <h4 className="font-black text-sm">Tips:</h4>
                        <ol className="space-y-2.5 list-decimal list-inside">
                            {[
                                <>The recharge address is a <span className="text-amber-600 dark:text-amber-400 font-bold">one-time address</span>, please do not leave it or transfer it repeatedly.</>,
                                <>The minimum recharge amount is subject to the actual transfer amount, not less than <span className="text-amber-600 dark:text-amber-400 font-bold">10 USDT</span>.</>,
                                <>After recharging, it will take about <span className="text-amber-600 dark:text-amber-400 font-bold">1 to 2</span> minutes for the amount to arrive.</>,
                                "Send your payment screenshot to customer service to speed up approval.",
                            ].map((tip, i) => (
                                <li key={i} className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    {tip}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
