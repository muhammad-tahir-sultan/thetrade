"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTrading } from "@/hooks/useTrading";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { DepositModal } from "@/components/dashboard/DepositModal";
import { Users, ClipboardList, TrendingUp, Mail, UserCircle, ArrowDownCircle, ArrowUpCircle, Settings, Shield, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
    { label: "Teams", icon: Users, bg: "bg-amber-500", href: "/dashboard/invite" },
    { label: "Record", icon: ClipboardList, bg: "bg-emerald-500", href: "/dashboard/grab/records" },
    { label: "Wallet", icon: TrendingUp, bg: "bg-rose-500", href: "/dashboard/history" },
    { label: "Invite", icon: Mail, bg: "bg-teal-500", href: "/dashboard/invite" },
];

function WithdrawModal({ isOpen, onClose, balance, dailyTasksCompleted, maxDailyTasks, onWithdraw, isPending }: {
    isOpen: boolean; onClose: () => void; balance: number;
    dailyTasksCompleted: number; maxDailyTasks: number;
    onWithdraw: (amount: number, address: string, network: string) => Promise<void>; isPending: boolean;
}) {
    const [amount, setAmount] = useState("");
    const [address, setAddress] = useState("");
    const tasksComplete = dailyTasksCompleted >= maxDailyTasks;

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!tasksComplete) { toast.error(`Complete all ${maxDailyTasks} orders first`); return; }
        const val = Number(amount);
        if (!val || val <= 0) { toast.error("Enter a valid amount"); return; }
        if (val > balance) { toast.error("Insufficient balance"); return; }
        if (!address.trim()) { toast.error("Enter your wallet address"); return; }
        try { await onWithdraw(val, address.trim(), "Binance (TRC-20)"); onClose(); setAmount(""); setAddress(""); }
        catch (e: any) { toast.error(e.message); }
    };

    return (
        <div className="fixed inset-0 z-110 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-t-[2.5rem] sm:rounded-4xl p-8 space-y-5 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">Withdrawal</h3>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl transition-colors cursor-pointer"><X size={20} /></button>
                </div>

                {/* Tasks gate */}
                {!tasksComplete && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-center space-y-1">
                        <p className="text-sm font-black text-amber-600 dark:text-amber-400">Orders Required</p>
                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                            Complete all {maxDailyTasks} daily orders to unlock withdrawal.
                        </p>
                        <p className="text-lg font-black text-amber-500 mt-1">{dailyTasksCompleted} / {maxDailyTasks}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">Network</p>
                        <div className="px-4 py-3 bg-secondary/5 border border-secondary/10 rounded-2xl font-bold text-sm text-foreground">
                            Binance (TRC-20)
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">Wallet Address</p>
                        <input value={address} onChange={(e) => setAddress(e.target.value)} disabled={!tasksComplete}
                            className="w-full px-4 py-3 bg-secondary/5 border border-secondary/10 rounded-2xl font-mono text-sm focus:border-primary/50 outline-none transition-all disabled:opacity-40"
                            placeholder="Enter your USDT TRC-20 address" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">
                            Amount <span className="text-zinc-400 normal-case font-medium">({balance.toFixed(2)} USDT available)</span>
                        </p>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-sm">$</span>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={!tasksComplete}
                                className="w-full pl-9 pr-4 py-3 bg-secondary/5 border border-secondary/10 rounded-2xl font-bold text-base focus:border-primary/50 outline-none transition-all disabled:opacity-40"
                                placeholder="0.00" />
                        </div>
                    </div>
                </div>

                <button onClick={handleSubmit} disabled={isPending || !tasksComplete}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer">
                    {isPending ? "Submitting..." : "Submit Withdrawal Request"}
                </button>
            </div>
        </div>
    );
}

export default function MinePage() {
    const { data: session } = useSession();
    const { user, balance, dailyTasksCompleted, maxDailyTasks, isProcessing, createTransaction } = useTrading();
    const [showDeposit, setShowDeposit] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);

    const name = session?.user?.name ?? "User";

    const menuItems = [
        { label: "Profile", icon: UserCircle, href: "/dashboard/profile" },
        { label: "Deposit records", icon: ArrowDownCircle, href: "/dashboard/history?type=DEPOSIT" },
        { label: "Withdrawal records", icon: ArrowUpCircle, href: "/dashboard/history?type=WITHDRAW" },
        { label: "Setting", icon: Settings, href: "/dashboard/settings" },
        ...((user as any)?.role === "ADMIN"
            ? [{ label: "Admin Panel", icon: Shield, href: "/dashboard/admin" }]
            : []),
    ];

    return (
        <div className="pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProfileHeader
                name={name}
                balance={balance}
                invitationCode={(user as any)?.invitationCode}
                onDeposit={() => setShowDeposit(true)}
                onWithdraw={() => setShowWithdraw(true)}
            />

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 px-2 py-6">
                {QUICK_ACTIONS.map(({ label, icon: Icon, bg, href }) => {
                    const content = (
                        <div className="flex flex-col items-center gap-2 py-4 cursor-pointer group">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md group-active:scale-90 transition-transform", bg)}>
                                <Icon size={22} />
                            </div>
                            <span className="text-[11px] font-bold text-secondary text-center leading-tight">{label}</span>
                        </div>
                    );
                    return href ? (
                        <Link key={label} href={href}>{content}</Link>
                    ) : (
                        <div key={label} onClick={() => toast.info(`${label} coming soon!`)}>{content}</div>
                    );
                })}
            </div>

            <div className="h-2 bg-secondary/5" />

            {/* Menu List */}
            <div className="divide-y divide-secondary/5">
                {menuItems.map(({ label, icon: Icon, href }) => (
                    <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/5 active:bg-secondary/10 transition-colors cursor-pointer group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Icon size={18} />
                        </div>
                        <span className="flex-1 text-sm font-bold">{label}</span>
                        <ChevronRight size={16} className="text-secondary/50" />
                    </Link>
                ))}
            </div>

            <DepositModal
                isOpen={showDeposit}
                onClose={() => setShowDeposit(false)}
                onSubmitPending={async (amount, depositAddress) => {
                    await createTransaction({ type: "DEPOSIT", amount, depositAddress });
                }}
                isPending={isProcessing}
            />

            <WithdrawModal
                isOpen={showWithdraw}
                onClose={() => setShowWithdraw(false)}
                balance={balance}
                dailyTasksCompleted={dailyTasksCompleted}
                maxDailyTasks={maxDailyTasks}
                onWithdraw={async (amount, withdrawAddress, withdrawNetwork) => {
                    await createTransaction({ type: "WITHDRAW", amount, withdrawAddress, withdrawNetwork });
                    toast.success("Withdrawal request submitted! Admin will review shortly.");
                }}
                isPending={isProcessing}
            />
        </div>
    );
}
