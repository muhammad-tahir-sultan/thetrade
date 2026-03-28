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
    { label: "Teams", icon: Users, bg: "bg-amber-500", href: null },
    { label: "Record", icon: ClipboardList, bg: "bg-emerald-500", href: "/dashboard/grab/records" },
    { label: "Wallet", icon: TrendingUp, bg: "bg-rose-500", href: "/dashboard/history" },
    { label: "Invite", icon: Mail, bg: "bg-teal-500", href: null },
];

function WithdrawModal({ isOpen, onClose, balance, onWithdraw, isPending }: {
    isOpen: boolean; onClose: () => void; balance: number;
    onWithdraw: (amount: number) => Promise<void>; isPending: boolean;
}) {
    const [amount, setAmount] = useState("");
    if (!isOpen) return null;
    const handleSubmit = async () => {
        const val = Number(amount);
        if (!val || val <= 0) { toast.error("Enter a valid amount"); return; }
        if (val > balance) { toast.error("Insufficient balance"); return; }
        try { await onWithdraw(val); onClose(); setAmount(""); }
        catch (e: any) { toast.error(e.message); }
    };
    return (
        <div className="fixed inset-0 z-110 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-t-[2.5rem] sm:rounded-4xl p-8 space-y-6 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">Withdrawal</h3>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl transition-colors cursor-pointer"><X size={20} /></button>
                </div>
                <p className="text-xs text-secondary">Available: <strong className="text-foreground">{balance.toFixed(4)} USDT</strong></p>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold">$</span>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-9 pr-4 py-4 bg-secondary/5 border border-secondary/10 rounded-2xl font-bold text-lg focus:border-primary/50 outline-none transition-all"
                        placeholder="0.00" />
                </div>
                <button onClick={handleSubmit} disabled={isPending}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer">
                    {isPending ? "Submitting..." : "Submit Withdrawal"}
                </button>
            </div>
        </div>
    );
}

export default function MinePage() {
    const { data: session } = useSession();
    const { user, balance, isProcessing, createTransaction } = useTrading();
    const [showDeposit, setShowDeposit] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);

    const userId = (user as any)?._id ?? (session?.user as any)?.id ?? "000000";
    const name = session?.user?.name ?? "User";

    const menuItems = [
        { label: "Profile", icon: UserCircle, href: "/dashboard/profile" },
        { label: "Deposit records", icon: ArrowDownCircle, href: "/dashboard/history" },
        { label: "Withdrawal records", icon: ArrowUpCircle, href: "/dashboard/history" },
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
                userId={String(userId)}
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
                onSubmitPending={async (amount) => {
                    await createTransaction({ type: "DEPOSIT", amount });
                }}
                isPending={isProcessing}
            />

            <WithdrawModal
                isOpen={showWithdraw}
                onClose={() => setShowWithdraw(false)}
                balance={balance}
                onWithdraw={async (amount) => {
                    await createTransaction({ type: "WITHDRAW", amount });
                    toast.success("Withdrawal request submitted!");
                }}
                isPending={isProcessing}
            />
        </div>
    );
}
