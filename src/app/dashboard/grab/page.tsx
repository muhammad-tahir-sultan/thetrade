"use client";

import { useState } from "react";
import { useTrading } from "@/hooks/useTrading";
import { useGrabOrder } from "@/hooks/useGrabOrder";
import { Package, Smartphone, Laptop, Headphones, Watch, Camera, Tv, Gift, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GrabStats } from "@/components/dashboard/GrabStats";
import { OrderModal } from "@/components/dashboard/OrderModal";
import Link from "next/link";
import { LiveOrderFeed } from "@/components/dashboard/LiveOrderFeed";

const ITEMS = [
    { id: 1, name: "Luxury Watch", icon: Watch, color: "text-amber-500" },
    { id: 2, name: "Smartphone", icon: Smartphone, color: "text-blue-500" },
    { id: 3, name: "Crypto Package", icon: Package, color: "text-emerald-500" },
    { id: 4, name: "High-end Laptop", icon: Laptop, color: "text-purple-500" },
    { id: 5, name: "Wireless Headphones", icon: Headphones, color: "text-rose-500" },
    { id: 6, name: "Mystery Box", icon: Gift, color: "text-indigo-500" },
    { id: 7, name: "DSLR Camera", icon: Camera, color: "text-teal-500" },
    { id: 8, name: "Smart TV", icon: Tv, color: "text-cyan-500" },
];

export default function GrabPage() {
    const { user, balance, dailyTasksCompleted, maxDailyTasks, taskRequestStatus } = useTrading();
    const { grabOrder, completeOrder, requestCS, isGrabbing, isCompleting, currentOrder } = useGrabOrder();

    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    const handleSpin = async () => {
        if (isSpinning || isGrabbing) return;

        if (balance <= 0) {
            toast.error("Insufficient balance to start boosting!");
            return;
        }

        setOrderError(null);

        // 1. INSTANT OPTIMISTIC START
        setIsSpinning(true);
        // Initial "fast spin" to engage user instantly
        const initialRotation = rotation + 1800; 
        setRotation(initialRotation);

        try {
            const result = await grabOrder();
            
            // 2. REFINE LANDING (Once API result is known)
            const sliceAngle = 360 / ITEMS.length;
            
            // Try to match the product name to an icon item index
            const productName = result.order?.productName || "";
            let winnerIndex = ITEMS.findIndex(item => 
                productName.toLowerCase().includes(item.name.toLowerCase())
            );
            if (winnerIndex === -1) winnerIndex = Math.floor(Math.random() * ITEMS.length);

            const targetRotation = (winnerIndex * sliceAngle);
            const randomInnerOffset = (Math.random() * (sliceAngle * 0.6)) - (sliceAngle * 0.3);

            // Accumulate more spins and land on the precise slice
            const finalRotation = initialRotation + 1440 + (360 - targetRotation) + randomInnerOffset;
            
            setRotation(finalRotation);

            setTimeout(() => {
                setIsSpinning(false);
                setShowModal(true);
            }, 5000); // Drama duration matches CSS transition
        } catch (err) {
            setIsSpinning(false);
            setRotation(rotation); // Reset if failed
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto pb-24 px-4 overflow-x-hidden">
            <div className="text-center">
                <h1 className="text-3xl font-black mb-1">Start Boosting</h1>
                <p className="text-secondary text-sm">Grab exclusive deals to boost your earnings.</p>
            </div>

            <GrabStats />

            <div className="flex items-center justify-between px-2">
                <Link
                    href="/dashboard/grab/records"
                    className="flex items-center gap-2 px-6 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-full text-xs font-bold text-secondary transition-all cursor-pointer"
                >
                    <Clock size={16} /> Profit Records
                </Link>
                <div className="px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold tracking-wider uppercase">
                    Completed {dailyTasksCompleted}/{maxDailyTasks}
                </div>
            </div>

            <div className="relative mt-16 mb-16 flex justify-center">
                {taskRequestStatus === "APPROVED" ? (
                    <>
                        <div className={cn(
                            "absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-amber-500 rounded-full z-20 border-[3px] border-background shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center transition-transform",
                            isSpinning && "animate-bounce"
                        )}>
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>

                        <div className="w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] relative rounded-full border-4 border-amber-500/40 p-5 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
                            <div className="absolute inset-0 rounded-full bg-background border-[10px] border-background -z-10" />
                            <div
                                className={cn(
                                    "w-full h-full rounded-full relative transition-[filter,transform]",
                                    isSpinning ? "blur-[0.8px]" : "blur-0"
                                )}
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: isSpinning ? "transform 5s cubic-bezier(0.1, 0, 0, 1)" : "none"
                                }}
                            >
                                {ITEMS.map((item, i) => {
                                    const angle = (i * 360) / ITEMS.length;
                                    const radius = 90;
                                    return (
                                        <div key={item.id} className="absolute w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-black/5"
                                            style={{ left: '50%', top: '50%', transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)` }}>
                                            <item.icon className={cn("w-6 h-6 sm:w-7 sm:h-7", item.color)} strokeWidth={1.5} />
                                        </div>
                                    );
                                })}
                            </div>

                            <button onClick={handleSpin} disabled={isSpinning || isGrabbing}
                                className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-black tracking-widest text-black border-4 border-background transition-all shadow-xl cursor-pointer",
                                    (isSpinning || isGrabbing) ? "bg-amber-600/40 scale-95 opacity-50 cursor-not-allowed" : "bg-gradient-to-br from-amber-300 to-amber-500 hover:scale-105 active:scale-95")}>
                                {isSpinning ? "..." : "START"}
                            </button>

                            <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] z-40 px-4 py-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl text-center pointer-events-none transition-all duration-300",
                                isSpinning ? "opacity-100 scale-100 mt-20" : "opacity-0 scale-95")}>
                                <p className="text-white font-bold text-sm tracking-wide">Processing Order...</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full max-w-sm bg-secondary/5 border border-secondary/10 rounded-[2.5rem] p-10 text-center space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-primary" size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Daily Tasks</h3>
                            <p className="text-secondary text-sm">
                                {taskRequestStatus === "PENDING" 
                                    ? "Your request for 25 orders is being reviewed by the admin." 
                                    : "You haven't requested your daily tasks yet. Click below to request 25 orders."}
                            </p>
                        </div>
                        {taskRequestStatus === "NONE" && (
                            <button 
                                onClick={async () => {
                                    try {
                                        const res = await fetch("/api/user/request-tasks", { method: "POST" });
                                        if (!res.ok) throw new Error("Failed to request tasks");
                                        toast.success("Task request submitted!");
                                        window.location.reload(); // Refresh to update status
                                    } catch (err: any) {
                                        toast.error(err.message);
                                    }
                                }}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                            >
                                Request 25 Orders
                            </button>
                        )}
                        {taskRequestStatus === "PENDING" && (
                            <div className="py-4 bg-secondary/10 text-secondary rounded-2xl font-bold">
                                Pending Approval...
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Featured Products Grid */}
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                        <Package size={14} className="text-primary" /> Products For You
                    </h3>
                    <span className="text-[10px] text-primary font-bold">VIP Items</span>
                 </div>
                <div className="grid grid-cols-2 gap-4">
                    {ITEMS.slice(0, 4).map((item) => (
                        <button 
                            key={item.id} 
                            disabled={isSpinning || isGrabbing}
                            onClick={() => {
                                if (user?.taskRequestStatus === "APPROVED") {
                                    handleSpin();
                                } else {
                                    toast.info("Request 25 orders above to start grabbing!", {
                                        description: "Unlock your daily earning tasks first."
                                    });
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }
                            }}
                            className="bg-white dark:bg-zinc-900 shadow-sm border border-black/5 rounded-[2rem] p-4 space-y-3 group hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all cursor-pointer text-left w-full active:scale-[0.97] disabled:opacity-50"
                        >
                            <div className="aspect-square bg-secondary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <item.icon className={cn("w-8 h-8", item.color)} strokeWidth={1} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold truncate">{item.name}</h4>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">Ready</p>
                                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                                        <div className="w-1 h-1 bg-primary rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Live Feed */}
            <div onClick={() => toast.success("Live stats: User activity is at its peak right now!")} className="cursor-pointer active:scale-[0.98] transition-transform">
                <LiveOrderFeed /> 
            </div>

            <OrderModal
                order={currentOrder}
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setOrderError(null);
                }}
                isProcessing={isCompleting}
                error={orderError}
                onComplete={async () => {
                    try {
                        setOrderError(null);
                        await completeOrder(currentOrder._id);
                        setShowModal(false);
                    } catch (err: any) {
                        setOrderError(err.message);
                    }
                }}
                onContactCS={async () => {
                    await requestCS({
                        orderId: currentOrder._id,
                        message: "I hit a combo order, please help me unlock it.",
                        type: "COMBO_UNLOCK"
                    });
                    setShowModal(false);
                }}
            />
        </div>
    );
}
