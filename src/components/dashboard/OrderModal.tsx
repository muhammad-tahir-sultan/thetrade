"use client";

import { Package, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderModalProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    isProcessing: boolean;
    onContactCS?: () => void;
    error?: string | null;
}

export function OrderModal({ order, isOpen, onClose, onComplete, isProcessing, onContactCS, error }: OrderModalProps) {
    if (!isOpen || !order) return null;

    const items = order.items || [];
    
    // Auto-close if error exists (visual drama)
    const isInsufficientBalance = error?.toLowerCase().includes("balance is not enough");

    if (isInsufficientBalance) {
        setTimeout(() => {
            onClose();
        }, 4000);
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-[#f8f8f8] dark:bg-zinc-950 w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-500">
                
                {/* Header */}
                <div className="bg-white dark:bg-zinc-900 px-6 py-4 flex items-center justify-between border-b border-black/5">
                    <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">
                        <X size={24} />
                    </button>
                    <h2 className="text-lg font-bold">Order Details</h2>
                    <div className="w-10 h-10" /> {/* Spacer */}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Items List */}
                    <div className="space-y-3">
                        {items.length > 0 ? items.map((item: any, idx: number) => (
                            <div key={idx} className="bg-white dark:bg-zinc-900 p-3 rounded-2xl flex gap-3 shadow-sm border border-black/5">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
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

                    {/* Stats Summary */}
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] space-y-3 shadow-sm border border-black/5">
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-zinc-400 font-medium">Transaction time</span>
                            <span className="text-zinc-800 dark:text-zinc-200 font-bold">{new Date(order.createdAt).toISOString().replace('T', ' ').slice(0, 19)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-zinc-400 font-medium">Order amount</span>
                            <span className="text-zinc-800 dark:text-zinc-200 font-bold">{order.price.toFixed(2)} USDT</span>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-zinc-400 font-medium">Commissions</span>
                            <span className="text-zinc-800 dark:text-zinc-200 font-bold">{order.commission.toFixed(2)} USDT</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 mt-1 border-t border-black/5">
                            <span className="text-zinc-400 font-bold text-sm">Expected income</span>
                            <span className="text-xl font-black text-amber-600">{(order.price + order.commission).toFixed(3)} USDT</span>
                        </div>
                    </div>
                </div>

                {/* Footer/Action */}
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

                {/* Floating Insufficient Balance Notification */}
                {isInsufficientBalance && (
                    <div className="absolute inset-x-0 top-[40%] px-4 z-[120] animate-in zoom-in-95 duration-300">
                        <div className="bg-black/90 backdrop-blur-xl text-white p-6 rounded-3xl text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/20">
                            <p className="text-sm font-bold leading-relaxed mb-1">
                                {error}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
