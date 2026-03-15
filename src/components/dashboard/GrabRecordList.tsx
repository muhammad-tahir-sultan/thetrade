"use client";

import { useState } from "react";
import { Package, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrabRecordListProps {
    records: any[];
    onAction?: (order: any) => void;
}

export function GrabRecordList({ records, onAction }: GrabRecordListProps) {
    const [activeTab, setActiveTab] = useState<"INCOMPLETE" | "COMPLETE">("INCOMPLETE");

    const filteredRecords = records.filter(r => 
        activeTab === "COMPLETE" ? r.status === "COMPLETED" : (r.status === "PENDING" || r.status === "COMBO")
    );

    if (records.length === 0) {
        return (
            <div className="p-12 text-center space-y-4">
                <Package size={48} className="mx-auto opacity-10" />
                <p className="text-secondary font-medium italic">No transactions found yet...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-black/5 px-2">
                <button 
                    onClick={() => setActiveTab("INCOMPLETE")}
                    className={cn(
                        "flex-1 py-4 text-sm font-bold transition-all relative",
                        activeTab === "INCOMPLETE" ? "text-primary" : "text-zinc-400"
                    )}
                >
                    Wait
                    {activeTab === "INCOMPLETE" && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full animate-in fade-in zoom-in duration-300" />
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab("COMPLETE")}
                    className={cn(
                        "flex-1 py-4 text-sm font-bold transition-all relative",
                        activeTab === "COMPLETE" ? "text-primary" : "text-zinc-400"
                    )}
                >
                    Completed
                    {activeTab === "COMPLETE" && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full animate-in fade-in zoom-in duration-300" />
                    )}
                </button>
            </div>

            {/* List */}
            <div className="space-y-6">
                {filteredRecords.length === 0 ? (
                    <div className="py-20 text-center opacity-40">
                        <p className="text-sm font-medium">No {activeTab.toLowerCase()} records</p>
                    </div>
                ) : filteredRecords.map((record) => (
                    <div key={record._id} className="bg-white dark:bg-zinc-950 rounded-[2.5rem] overflow-hidden shadow-sm border border-black/5 flex flex-col animate-in fade-in slide-in-from-bottom-2">
                        <div className="px-5 py-4 border-b border-black/5 flex justify-between items-center">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Order Nos: {record._id.slice(-12).toUpperCase()}</p>
                            {activeTab === "COMPLETE" && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                                    <CheckCircle2 size={10} />
                                    Settled
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 space-y-3">
                            {/* Items */}
                            <div className="space-y-3">
                                {(record.items && record.items.length > 0) ? record.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden shrink-0 border border-black/5">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight">{item.name}</p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[14px] font-bold text-primary">{item.price.toFixed(2)} USDT</p>
                                                <p className="text-zinc-400 text-[12px]">x{item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-black/5">
                                            <Package className="text-zinc-300" size={28} />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 line-clamp-1">{record.productName}</p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[14px] font-bold text-primary">{record.price.toFixed(2)} USDT</p>
                                                <p className="text-zinc-400 text-[12px]">x1</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="pt-3 space-y-2 border-t border-black/5">
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-zinc-400">Transaction time</span>
                                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">{new Date(record.createdAt).toISOString().replace('T', ' ').slice(0, 19)}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-zinc-400">Order amount</span>
                                    <span className="text-zinc-600 dark:text-zinc-400 font-medium font-mono">{record.price.toFixed(2)} USDT</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-zinc-400">Commissions</span>
                                    <span className="text-zinc-600 dark:text-zinc-400 font-medium font-mono">{record.commission.toFixed(2)} USDT</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-zinc-400 text-[12px] font-medium">Expected income</span>
                                    <span className="text-[15px] font-black text-amber-600 font-mono">{(record.price + record.commission).toFixed(3)} USDT</span>
                                </div>
                            </div>
                        </div>

                        {activeTab === "INCOMPLETE" && (
                            <div className="p-4 pt-0">
                                <button 
                                    onClick={() => onAction?.(record)}
                                    className="w-full py-4 bg-[#6b5555] text-white rounded-2xl font-bold text-sm shadow-xl shadow-black/5 active:scale-[0.98] transition-all hover:bg-[#5a4848]"
                                >
                                    Submit order
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
