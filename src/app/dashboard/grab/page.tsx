"use client";

import { useState } from "react";
import { useTrading } from "@/hooks/useTrading";
import { useGrabOrder } from "@/hooks/useGrabOrder";
import { Package, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GrabStats } from "@/components/dashboard/GrabStats";
import { GrabButton } from "@/components/dashboard/GrabButton";
import { OrderModal } from "@/components/dashboard/OrderModal";
import Link from "next/link";
import { LiveOrderFeed } from "@/components/dashboard/LiveOrderFeed";
import { useQuery } from "@tanstack/react-query";
import { grabService } from "@/lib/services/grab.service";

export default function GrabPage() {
    const { user, balance, dailyTasksCompleted, maxDailyTasks, taskRequestStatus, createTransaction, isProcessing } = useTrading();
    const { grabOrder, completeOrder, requestCS, isGrabbing, isCompleting, currentOrder } = useGrabOrder();

    const [isSpinning, setIsSpinning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [hoveredProductName, setHoveredProductName] = useState<string | null>(null);
    const spinnerProductsQuery = useQuery({
        queryKey: ["grab-spinner-products"],
        queryFn: grabService.getSpinnerProducts,
    });
    const spinnerProducts = spinnerProductsQuery.data || [];

    const busy = isSpinning || isGrabbing;
    const maxOrders = Number(maxDailyTasks || 25);
    const completedOrders = Number(dailyTasksCompleted || 0);
    const lastGrabTime = user?.lastGrabDate ? new Date(user.lastGrabDate).getTime() : 0;
    const cooldownMs = 24 * 60 * 60 * 1000;
    const remainingMs = completedOrders >= maxOrders && lastGrabTime > 0
        ? Math.max(0, cooldownMs - (Date.now() - lastGrabTime))
        : 0;
    const isRequestCooldown = taskRequestStatus === "NONE" && completedOrders >= maxOrders && remainingMs > 0;
    const remainMins = Math.ceil(remainingMs / (60 * 1000));
    const remainHours = Math.floor(remainMins / 60);
    const remainMinutes = remainMins % 60;

    const handleGrab = async () => {
        if (busy) return;
        if (balance <= 0) { toast.error("Insufficient balance to start boosting!"); return; }
        setOrderError(null);
        setIsSpinning(true);
        try {
            await grabOrder();
            setTimeout(() => { setIsSpinning(false); setShowModal(true); }, 1200);
        } catch { setIsSpinning(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto pb-24 px-4">

            <GrabStats />

            {/* Nav row */}
            <div className="flex items-center justify-between px-1">
                <Link href="/dashboard/grab/records"
                    className="flex items-center gap-2 px-5 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-full text-xs font-bold text-secondary transition-all cursor-pointer">
                    <Clock size={13} /> Profit Records
                </Link>
                <div className="flex items-center gap-1.5 px-5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <span className="text-xs font-black text-amber-500">{dailyTasksCompleted}/{maxDailyTasks}</span>
                    <span className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest">Orders</span>
                </div>
            </div>

            {/* Main action zone */}
            {taskRequestStatus === "APPROVED" ? (
                <div className="flex flex-col items-center gap-2 py-2">
                    <GrabButton
                        busy={busy}
                        completed={dailyTasksCompleted}
                        total={maxDailyTasks}
                        onClick={handleGrab}
                        products={spinnerProducts}
                        hoveredName={hoveredProductName}
                        onHoverName={setHoveredProductName}
                    />
                    <p className={cn("text-xs font-medium transition-colors", busy ? "text-amber-500 animate-pulse" : "text-secondary")}>
                        {busy
                            ? "Finding your order..."
                            : hoveredProductName
                                ? hoveredProductName
                                : "Tap the button to grab your next order"}
                    </p>
                </div>
            ) : (
                <div className="bg-secondary/5 border border-secondary/10 rounded-3xl p-8 text-center space-y-5">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                        <Clock className="text-primary" size={30} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-1">Daily Tasks</h3>
                        <p className="text-secondary text-sm">
                            {isRequestCooldown
                                ? `You've completed ${maxOrders}/${maxOrders}. New request unlocks in ${remainHours}h ${remainMinutes}m.`
                                : taskRequestStatus === "PENDING"
                                ? "Your request for 25 orders is being reviewed by the admin."
                                : "Request your daily 25 orders to start earning."}
                        </p>
                    </div>
                    {taskRequestStatus === "NONE" && (
                        <button onClick={async () => {
                            try {
                                const res = await fetch("/api/user/request-tasks", { method: "POST" });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data?.error || "Failed to request tasks");
                                toast.success("Task request submitted!");
                                window.location.reload();
                            } catch (e: any) { toast.error(e.message || "Request failed. Try again."); }
                        }} disabled={isRequestCooldown} className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                            Request 25 Orders
                        </button>
                    )}
                    {taskRequestStatus === "PENDING" && (
                        <div className="py-4 bg-secondary/10 text-secondary rounded-2xl font-bold text-sm">Pending Approval...</div>
                    )}
                </div>
            )}

            {/* Products grid sourced from admin-managed catalog */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                        <Package size={12} className="text-primary" /> Products For You
                    </h3>
                    <span className="text-[10px] text-primary font-bold cursor-pointer">VIP Items</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                    {spinnerProducts.map((item: any, idx: number) => (
                        <button key={item._id || idx} disabled={busy}
                            onClick={() => {
                                if (user?.taskRequestStatus === "APPROVED") { handleGrab(); }
                                else { toast.info("Request your orders to start grabbing!"); window.scrollTo({ top: 0, behavior: "smooth" }); }
                            }}
                            onMouseEnter={() => setHoveredProductName(item.name)}
                            onMouseLeave={() => setHoveredProductName(null)}
                            className="bg-white dark:bg-zinc-900 shadow-sm border border-black/5 dark:border-white/5 rounded-2xl p-2.5 flex flex-col items-center gap-1.5 group hover:border-amber-500/30 hover:bg-amber-500/2 transition-all cursor-pointer active:scale-95 disabled:opacity-50">
                            <div className="w-9 h-9 bg-secondary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[8px] font-bold text-center leading-tight w-full truncate">{item.name}</span>
                        </button>
                    ))}
                </div>
                {spinnerProducts.length === 0 && (
                    <div className="py-4 text-center text-xs text-secondary">
                        No spinner products configured yet. Ask admin to add products from Admin → Products.
                    </div>
                )}
            </div>

            {/* Live feed */}
            <div onClick={() => toast.success("Live stats: User activity is at its peak right now!")}
                className="cursor-pointer active:scale-[0.98] transition-transform">
                <LiveOrderFeed />
            </div>

            <OrderModal
                order={currentOrder}
                balance={balance}
                isOpen={showModal}
                onClose={() => { setShowModal(false); setOrderError(null); }}
                isProcessing={isCompleting}
                error={orderError}
                onComplete={async () => {
                    try {
                        setOrderError(null);
                        await completeOrder(currentOrder._id);
                        setShowModal(false);
                    } catch (err: unknown) { setOrderError((err as Error).message); }
                }}
                onContactCS={async () => {
                    await requestCS({ orderId: currentOrder._id, message: "I hit a combo order, please help me unlock it.", type: "COMBO_UNLOCK" });
                    setShowModal(false);
                }}
                onDepositSubmit={async (amount, depositAddress) => {
                    await createTransaction({ type: "DEPOSIT", amount, depositAddress });
                }}
                isDepositPending={isProcessing}
            />
        </div>
    );
}
