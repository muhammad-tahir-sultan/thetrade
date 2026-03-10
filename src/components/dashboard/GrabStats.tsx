"use client";

import { useTrading } from "@/hooks/useTrading";
import { cn } from "@/lib/utils";

export function GrabStats() {
    const { user, balance } = useTrading();
    const potentialProfit = balance > 0 ? (balance * 0.01).toFixed(2) : "0.00";

    return (
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-900 dark:via-black dark:to-zinc-900 rounded-[2.5rem] p-7 border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="space-y-1 relative z-10 text-center border-r border-white/5">
                <p className="text-secondary text-[10px] uppercase tracking-widest font-black opacity-60">Today's Earnings</p>
                <p className="text-2xl font-black text-amber-500 drop-shadow-sm">
                    ${user?.totalCommission?.toFixed(2) || "0.00"}
                </p>
            </div>
            
            <div className="space-y-1 relative z-10 text-center">
                <p className="text-secondary text-[10px] uppercase tracking-widest font-black opacity-60">Wallet Balance</p>
                <p className="text-2xl font-black text-white hover:scale-105 transition-transform">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
            </div>

            <div className="space-y-1 mt-4 relative z-10 text-center border-r border-white/5">
                <p className="text-amber-500/60 text-[10px] uppercase tracking-widest font-black">Estimated Next</p>
                <p className="text-lg font-black text-amber-200/80 animate-pulse">
                    +${potentialProfit}
                </p>
            </div>

            <div className="space-y-1 mt-4 relative z-10 text-center">
                <p className="text-secondary text-[10px] uppercase tracking-widest font-black opacity-60">Status</p>
                <div className="flex items-center justify-center gap-1.5">
                    <div className={cn(
                        "w-2 h-2 rounded-full animate-ping",
                        user?.status === "ACTIVE" ? "bg-green-500" : "bg-amber-500"
                    )} />
                    <p className={cn(
                        "text-sm font-black tracking-tighter",
                        user?.status === "ACTIVE" ? "text-green-500" : "text-amber-500"
                    )}>
                        {user?.status === "PENDING_COMBO" ? "COMBO WAITING" : user?.status || "ACTIVE"}
                    </p>
                </div>
            </div>
        </div>
    );
}
