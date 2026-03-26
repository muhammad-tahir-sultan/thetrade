"use client";

import { useState } from "react";
import { Package, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrabRecordListProps {
    records: any[];
    onAction?: (order: any) => void;
    onDepositRequired?: (order: any) => void;
}

export function GrabRecordList({ records, onAction, onDepositRequired }: GrabRecordListProps) {
    const [activeTab, setActiveTab] = useState<"INCOMPLETE" | "COMPLETE">("INCOMPLETE");

    const filteredRecords = records.filter((r) =>
        activeTab === "COMPLETE"
            ? r.status === "COMPLETED"
            : r.status === "PENDING" || r.status === "COMBO"
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
                {(["INCOMPLETE", "COMPLETE"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 py-4 text-sm font-bold transition-all relative",
                            activeTab === tab ? "text-primary" : "text-zinc-400"
                        )}
                    >
                        {tab === "INCOMPLETE" ? "Incomplete" : "Complete"}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-t-full animate-in fade-in zoom-in duration-300" />
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-6">
                {filteredRecords.length === 0 ? (
                    <div className="py-20 text-center opacity-40">
                        <p className="text-sm font-medium">No {activeTab.toLowerCase()} records</p>
                    </div>
                ) : filteredRecords.map((record) => {
                    const isCombo = record.status === "COMBO" || record.isCombo;
                    const needsDeposit = isCombo && !record.isAdminAuthorized;

                    return (
                        <div
                            key={record._id}
                            className={cn(
                                "bg-white dark:bg-zinc-950 rounded-[2.5rem] overflow-hidden shadow-sm border flex flex-col animate-in fade-in slide-in-from-bottom-2",
                                needsDeposit ? "border-amber-400/50 ring-1 ring-amber-400/20" : "border-black/5"
                            )}
                        >
                            {/* Order header */}
                            <div className="px-5 py-4 border-b border-black/5 flex justify-between items-center">
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                    Order Nos: {record._id.slice(-12).toUpperCase()}
                                </p>
                                {activeTab === "COMPLETE" && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                                        <CheckCircle2 size={10} />
                                        Settled
                                    </div>
                                )}
                                {needsDeposit && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-400/10 rounded-full">
                                        <AlertCircle size={10} className="text-amber-500" />
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">Deposit Required</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 space-y-3">
                                {/* Items */}
                                <div className="space-y-3">
                                    {record.items?.length > 0 ? record.items.map((item: any, idx: number) => (
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

                                {/* Stats summary */}
                                <div className="pt-3 space-y-2 border-t border-black/5">
                                    <StatRow label="Transaction time" value={new Date(record.createdAt).toISOString().replace("T", " ").slice(0, 19)} />
                                    <StatRow label="Order amount" value={`${record.price.toFixed(2)} USDT`} mono />
                                    <StatRow label="Commissions" value={`${record.commission.toFixed(4)} USDT`} mono />
                                    {needsDeposit && record.requiredDeposit > 0 && (
                                        <StatRow
                                            label="Required deposit"
                                            value={`${record.requiredDeposit.toFixed(4)} USDT`}
                                            mono
                                            highlight
                                        />
                                    )}
                                    <div className="flex justify-between pt-2">
                                        <span className="text-zinc-400 text-[12px] font-medium">Expected income</span>
                                        <span className="text-[15px] font-black text-amber-600 font-mono">
                                            {(record.price + record.commission).toFixed(4)} USDT
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action button */}
                            {activeTab === "INCOMPLETE" && (
                                <div className="p-4 pt-0 space-y-2">
                                    {needsDeposit ? (
                                        <button
                                            onClick={() => onDepositRequired?.(record)}
                                            className="w-full py-4 flex items-center justify-center gap-2 bg-amber-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all hover:bg-amber-400 cursor-pointer"
                                        >
                                            <Wallet size={16} />
                                            Deposit to Submit Order
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onAction?.(record)}
                                            className="w-full py-4 bg-[#6b5555] text-white rounded-2xl font-bold text-sm shadow-xl shadow-black/5 active:scale-[0.98] transition-all hover:bg-[#5a4848] cursor-pointer"
                                        >
                                            Submit order
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StatRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
    return (
        <div className="flex justify-between text-[12px]">
            <span className="text-zinc-400">{label}</span>
            <span className={cn(
                "font-medium",
                mono && "font-mono",
                highlight ? "text-amber-600 font-bold" : "text-zinc-600 dark:text-zinc-400"
            )}>
                {value}
            </span>
        </div>
    );
}
