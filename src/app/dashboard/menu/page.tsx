"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ShoppingBag, Store, ShoppingCart, ChevronRight, Zap, Target, Star } from "lucide-react";

const PLATFORMS = [
    {
        id: "amazon",
        name: "Amazon",
        vip: "VIP 1",
        balance: "20USDT - 498 USDT",
        commission: "4%",
        icon: ShoppingBag,
        color: "from-orange-400 to-orange-600",
        description: "Intelligent cloud global order matching center"
    },
    {
        id: "alibaba",
        name: "Alibaba",
        vip: "VIP 2",
        balance: "499USDT - 899 USDT",
        commission: "8%",
        icon: Store,
        color: "from-blue-400 to-blue-600",
        description: "Cross-border e-commerce supply chain platform"
    },
    {
        id: "aliexpress",
        name: "Aliexpress",
        vip: "VIP 3",
        balance: "≥ 899 USDT",
        commission: "12%",
        icon: ShoppingCart,
        color: "from-red-400 to-red-600",
        description: "Global consumer direct supply engine"
    }
];

export default function MenuPage() {
    const [activeTab, setActiveTab] = useState("All");

    const filteredPlatforms = activeTab === "All"
        ? PLATFORMS
        : PLATFORMS.filter(p => p.vip === activeTab);

    return (
        <div className="space-y-8 md:space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Market Menu</h1>
                    <p className="text-secondary text-lg">Select a platform to start your assignment.</p>
                </div>

                <div className="flex bg-secondary/5 p-1.5 rounded-2xl border border-secondary/10 w-fit">
                    {["All", "VIP 1", "VIP 2", "VIP 3"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer",
                                activeTab === tab
                                    ? "bg-background text-foreground shadow-sm shadow-black/5"
                                    : "text-secondary hover:bg-secondary/5"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {filteredPlatforms.map((platform) => (
                    <div
                        key={platform.id}
                        className="group bg-secondary/5 border border-secondary/10 rounded-[2.5rem] p-8 hover:border-primary/20 transition-all hover:bg-secondary/10 relative overflow-hidden flex flex-col cursor-pointer"
                    >
                        {/* Decorative Gradient Background */}
                        <div className={cn(
                            "absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity",
                            platform.color
                        )} />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-8">
                                <div className={cn(
                                    "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform bg-gradient-to-br",
                                    platform.color
                                )}>
                                    <platform.icon size={32} className="text-white" />
                                </div>
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-black tracking-widest text-white shadow-sm",
                                    platform.color
                                )}>
                                    {platform.vip}
                                </span>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black mb-2">{platform.name}</h3>
                                <p className="text-secondary text-sm font-medium leading-relaxed">
                                    {platform.description}
                                </p>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-secondary/5">
                                    <div className="flex items-center gap-3">
                                        <Zap size={18} className="text-primary" />
                                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">Commission</span>
                                    </div>
                                    <span className="text-lg font-black text-primary">{platform.commission}</span>
                                </div>

                                <div className="p-4 bg-background/50 rounded-2xl border border-secondary/5">
                                    <div className="flex items-center gap-3 mb-1">
                                        <Target size={16} className="text-secondary" />
                                        <span className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">Available Balance</span>
                                    </div>
                                    <p className="text-sm font-black tracking-tight">{platform.balance}</p>
                                </div>

                                <button className="w-full py-4 bg-foreground text-background rounded-2xl font-black text-sm flex items-center justify-center gap-2 group/btn cursor-pointer">
                                    Enter Marketplace
                                    <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredPlatforms.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-secondary/5 rounded-[3rem] border border-dashed border-secondary/20">
                        <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6 text-secondary">
                            <Star size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No more items available</h3>
                        <p className="text-secondary">Check back later for new opportunities.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
