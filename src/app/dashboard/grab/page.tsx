"use client";

import { useState } from "react";
import { useTrading } from "@/hooks/useTrading";
import { Package, Smartphone, Laptop, Headphones, Watch, Camera, Tv, Gift, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    const { balance } = useTrading();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [processingMessage, setProcessingMessage] = useState("");

    const handleSpin = () => {
        if (isSpinning) return;
        
        if (balance <= 0) {
            toast.error("Insufficient balance to start boosting!");
            return;
        }

        setIsSpinning(true);
        setProcessingMessage("Please Complete Pending Order First!");
        
        // Pick a random winner item (0 to 7)
        const winningIndex = Math.floor(Math.random() * ITEMS.length);
        
        // Items are placed dynamically. item 0 starts at Top (0 degrees rotation + translateY(-radius))
        // The angle each item is placed clockwise starting from top.
        const itemAngle = (360 / ITEMS.length) * winningIndex;
        
        // Calculate the absolute destination rotation to land the winning item at the TOP pointer.
        // Math.ceil(rotation / 360) * 360 normalizes the current rotation to the nearest full completed spin.
        // We add 1800 (5 full spins) for visual effect, then subtract itemAngle to align the winning item under the Top Pointer.
        const newRotation = Math.ceil(rotation / 360) * 360 + 1800 - itemAngle;

        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setProcessingMessage("");
            const winner = ITEMS[winningIndex];
            toast.success(`Successfully grabbed: ${winner.name}!`, {
                icon: <winner.icon className="h-5 w-5 text-amber-500" />
            });
        }, 3000); // 3 seconds matches CSS transition duration
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto pb-24">
            {/* Header Area */}
            <div className="text-center">
                <h1 className="text-3xl font-black mb-1">Start Boosting</h1>
                <p className="text-secondary text-sm">Grab exclusive deals to boost your earnings.</p>
            </div>

            {/* Dashboard Stats Panel (Matching User's Reference) */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 bg-gradient-to-br from-red-600/10 to-amber-600/10 rounded-[2rem] p-6 border border-amber-500/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
                
                <div className="space-y-1 relative z-10 text-center">
                    <p className="text-secondary text-xs tracking-wider">Today's Commission</p>
                    <p className="text-xl font-black text-amber-500">374.81</p>
                </div>
                <div className="space-y-1 relative z-10 text-center">
                    <p className="text-secondary text-xs tracking-wider">Wallet Balance</p>
                    <p className="text-xl font-black">{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="space-y-1 mt-2 relative z-10 text-center">
                    <p className="text-secondary text-xs tracking-wider">Cash Gap</p>
                    <p className="text-lg font-bold text-red-400">-198.42 USDT</p>
                </div>
                <div className="space-y-1 mt-2 relative z-10 text-center">
                    <p className="text-secondary text-xs tracking-wider">Account Status</p>
                    <p className="text-lg font-bold text-green-500">ACTIVE</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-2">
                <button className="flex items-center gap-2 px-6 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-full text-xs font-bold text-secondary transition-all cursor-pointer">
                    <Clock size={16} />
                    Profit Records
                </button>
                <div className="px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold tracking-wider">
                    COMPLETED 17/25
                </div>
            </div>

            {/* Spinning Wheel */}
            <div className="relative mt-16 mb-16 flex justify-center">
                {/* Center Pointer (Top Indicator marker attached to the background) */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-amber-500 rounded-full z-20 border-[3px] border-background shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>

                <div className="w-[320px] h-[320px] relative rounded-full border-4 border-amber-500/40 p-5 shadow-[0_0_40px_rgba(245,158,11,0.15)] shadow-amber-500/10">
                    
                    {/* Background glow behind wheel */}
                    <div className="absolute inset-0 rounded-full bg-background border-[10px] border-background -z-10" />
                    
                    {/* The Rotatable Track */}
                    <div 
                        className="w-full h-full rounded-full relative"
                        style={{ 
                            transform: `rotate(${rotation}deg)`, 
                            transition: isSpinning ? "transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none" 
                        }}
                    >
                        {ITEMS.map((item, i) => {
                            const angle = (i * 360) / ITEMS.length;
                            // Distance of items from center (maxed to fit inside the ring securely)
                            const radius = 100; 
                            
                            return (
                                <div
                                    key={item.id}
                                    className="absolute w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-black/5"
                                    style={{ 
                                        left: '50%',
                                        top: '50%',
                                        // Rotate container outwards, push by Y (making it top oriented), then counter-rotate so icons stay upright at rest
                                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`
                                    }}
                                >
                                    <item.icon className={cn("w-7 h-7", item.color)} strokeWidth={1.5} />
                                </div>
                            );
                        })}
                    </div>

                    {/* The Non-spinning Start Button (Fixed in dead center) */}
                    <button 
                        onClick={handleSpin}
                        disabled={isSpinning}
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-24 h-24 rounded-full flex flex-col items-center justify-center font-black tracking-widest text-black border-4 border-background transition-all shadow-xl",
                            isSpinning 
                                ? "bg-amber-600/40 scale-95 opacity-50 cursor-not-allowed" 
                                : "bg-gradient-to-br from-amber-300 to-amber-500 hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] cursor-pointer"
                        )}
                    >
                        {isSpinning ? "..." : "START"}
                    </button>
                    
                    {/* Wheel Overlay Message when spinning (like the reference image prompt "Please Complete Pending Order...") */}
                    <div className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] z-40 px-4 py-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl text-center pointer-events-none transition-all duration-300",
                        isSpinning ? "opacity-100 scale-100 mt-20" : "opacity-0 scale-95"
                    )}>
                        <p className="text-white font-bold text-sm tracking-wide">{processingMessage}</p>
                    </div>
                </div>
            </div>
            
        </div>
    );
}
