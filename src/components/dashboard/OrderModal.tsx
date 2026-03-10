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
}

export function OrderModal({ order, isOpen, onClose, onComplete, isProcessing, onContactCS }: OrderModalProps) {
    if (!isOpen || !order) return null;

    const isCombo = order.isCombo;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
            <div className="relative bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border border-white/10 ring-1 ring-white/20">
                {/* Visual Flair for Combo */}
                {isCombo && (
                    <>
                        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 animate-pulse" />
                        <div className="absolute top-6 right-6 bg-amber-500 text-[8px] font-black text-white px-2.5 py-1 rounded-lg tracking-[0.15em] uppercase shadow-xl border border-white/20 z-50">
                            VIP PRIORITY UNLOCK
                        </div>
                    </>
                )}

                <div className={cn(
                    "pt-16 pb-8 px-8 text-center space-y-4",
                    isCombo ? "bg-gradient-to-b from-amber-500/20 to-transparent" : "bg-emerald-500/10"
                )}>
                    <div className={cn(
                        "w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-500",
                        isCombo ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" : "bg-emerald-500 text-white"
                    )}>
                        <Package size={48} className={isCombo ? "animate-bounce" : ""} />
                    </div>
                    
                    <div className="space-y-1">
                        <h2 className={cn(
                            "text-2xl font-black tracking-tight",
                            isCombo ? "text-amber-500 uppercase italic" : "text-emerald-500"
                        )}>
                            {isCombo ? "💎 EXCLUSIVE COMBO!" : "Order Grabbed!"}
                        </h2>
                        <p className="text-secondary text-sm font-bold opacity-80">{order.productName}</p>
                    </div>
                </div>

                <div className="px-8 pb-10 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/5 dark:bg-zinc-800/50 p-5 rounded-3xl text-center border border-secondary/10">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-secondary font-black opacity-60">Value</p>
                            <p className="text-xl font-black">${order.price.toFixed(2)}</p>
                        </div>
                        <div className="bg-amber-500/5 dark:bg-amber-500/10 p-5 rounded-3xl text-center border border-amber-500/20">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-black">Commission</p>
                            <p className="text-xl font-black text-amber-500">+${order.commission.toFixed(2)}</p>
                        </div>
                    </div>

                    {isCombo && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in slide-in-from-top-2">
                            <p className="text-xs text-red-500 text-center font-bold">
                                Limited Availability: This order is allocated to you. <br/> Completing this restores full account status.
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {isCombo ? (
                            <>
                                <button 
                                    onClick={onContactCS}
                                    className="w-full py-5 rounded-[1.5rem] font-black tracking-widest bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white shadow-[0_10px_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                                >
                                    💬 REQUEST INSTANT UNLOCK
                                </button>
                                <button 
                                    onClick={onComplete}
                                    disabled={isProcessing}
                                    className="w-full py-3 text-secondary text-xs font-bold hover:text-primary transition-colors flex items-center justify-center gap-1 opacity-60 hover:opacity-100"
                                >
                                    Submit Combo Order Anyway
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={onComplete}
                                    disabled={isProcessing}
                                    className="w-full py-5 rounded-[1.5rem] font-black tracking-widest bg-black dark:bg-white dark:text-black text-white hover:opacity-90 shadow-xl transition-all"
                                >
                                    {isProcessing ? "PROCESSING..." : "PROCESS TRANSACTION"}
                                </button>
                                <button onClick={onClose} className="w-full py-2 text-xs font-bold text-secondary hover:text-primary opacity-50">
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
