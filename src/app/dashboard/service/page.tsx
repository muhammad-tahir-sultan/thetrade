"use client";

import { Headphones, MessageCircle, Clock, Shield, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const SUPPORT_ITEMS = [
    {
        icon: MessageCircle,
        bg: "bg-blue-500/10",
        color: "text-blue-500",
        title: "Live Chat Support",
        desc: "Chat with our support team for instant help.",
    },
    {
        icon: Clock,
        bg: "bg-emerald-500/10",
        color: "text-emerald-500",
        title: "Available 24 / 7",
        desc: "Our customer service team is always ready to help you.",
    },
    {
        icon: Shield,
        bg: "bg-amber-500/10",
        color: "text-amber-500",
        title: "Secure & Trusted",
        desc: "All transactions and requests are handled with full security.",
    },
];

export default function ServicePage() {
    const router = useRouter();

    return (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()}
                    className="p-3 bg-secondary/10 hover:bg-secondary/20 rounded-full text-secondary transition-all cursor-pointer">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Customer Service</h1>
                    <p className="text-secondary text-xs font-medium">We're here to help you</p>
                </div>
            </div>

            {/* Hero icon */}
            <div className="flex flex-col items-center gap-4 py-10 bg-secondary/5 rounded-4xl border border-secondary/10">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
                    <Headphones className="text-primary" size={40} />
                </div>
                <div className="text-center space-y-1">
                    <p className="font-black text-lg">How can we help?</p>
                    <p className="text-secondary text-sm max-w-[240px] leading-relaxed">
                        For combo order unlocks, deposits, or account issues — reach out anytime.
                    </p>
                </div>
            </div>

            {/* Support features */}
            <div className="space-y-3">
                {SUPPORT_ITEMS.map(({ icon: Icon, bg, color, title, desc }) => (
                    <div key={title} className="flex items-start gap-4 p-5 bg-secondary/5 border border-secondary/10 rounded-3xl">
                        <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                            <Icon size={20} className={color} />
                        </div>
                        <div>
                            <p className="font-bold text-sm mb-0.5">{title}</p>
                            <p className="text-xs text-secondary leading-relaxed">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <a
                href="mailto:support@thetrade.app"
                className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
            >
                <MessageCircle size={18} />
                Contact Support
            </a>
        </div>
    );
}
