"use client";

import { Package, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrabRecordListProps {
    records: any[];
}

export function GrabRecordList({ records }: GrabRecordListProps) {
    if (records.length === 0) {
        return (
            <div className="p-12 text-center space-y-4">
                <Package size={48} className="mx-auto opacity-10" />
                <p className="text-secondary font-medium italic">No transactions found yet...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {records.map((record) => (
                <div 
                    key={record._id} 
                    className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-secondary/5 flex items-center justify-between group hover:border-amber-500/20 transition-all shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                            record.isCombo ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                        )}>
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm tracking-tight">{record.productName}</h3>
                            <p className="text-[10px] text-secondary font-black uppercase opacity-60">
                                {new Date(record.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <p className="font-black text-amber-500 tracking-tighter">
                            +${record.commission.toFixed(2)}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-green-500">
                            <CheckCircle2 size={10} />
                            Settled
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
