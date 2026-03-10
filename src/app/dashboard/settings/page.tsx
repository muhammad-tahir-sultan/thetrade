"use client";

import { Settings, Shield, User, Wallet, Bell, Moon, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const categories = [
        { name: "Account Profile", icon: User, description: "Manage your personal information and identity." },
        { name: "Security & Passwords", icon: Shield, description: "Update your login credentials and 2FA." },
        { name: "Wallet Preferences", icon: Wallet, description: "Configure your deposit and withdrawal methods." },
        { name: "Notifications", icon: Bell, description: "Choose what alerts you want to receive." },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter mb-4 text-white">System Settings</h1>
                    <p className="text-secondary font-medium text-lg max-w-lg">Customize your experience and manage your global security parameters from one place.</p>
                </div>
                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-500">Feature Under Construction</span>
                </div>
            </div>

            {/* Coming Soon Teaser */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-[3rem] p-12 text-center flex flex-col items-center justify-center gap-8 min-h-[450px]">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-all duration-1000" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full group-hover:bg-amber-500/10 transition-all duration-1000" />

                <div className="relative z-10 space-y-4">
                    <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-12 transition-transform duration-500">
                        <Lock size={40} className="text-secondary opacity-30 group-hover:opacity-60 transition-opacity" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white/90">Refining Your Experience</h2>
                    <p className="text-secondary font-medium max-w-sm mx-auto leading-relaxed">
                        We are currently building out an advanced settings panel giving you 100% control over your account.
                    </p>
                </div>

                <div className="relative z-10 flex flex-wrap justify-center gap-3">
                    {categories.map((cat, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-default opacity-60">
                            <cat.icon size={16} className="text-primary" />
                            <span className="text-xs font-bold text-white/70">{cat.name}</span>
                        </div>
                    ))}
                </div>
                
                <div className="relative z-10 mt-4">
                    <div className="flex items-center gap-1.5 px-6 py-3 bg-primary/10 rounded-2xl">
                        <Moon size={16} className="text-primary" />
                        <span className="text-sm font-black text-primary">Coming VERY Soon</span>
                    </div>
                </div>
            </div>

            {/* Placeholder Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-30 grayscale">
                {categories.map((cat, i) => (
                    <div key={i} className="p-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] flex gap-6 filter blur-[2px] transition-all hover:blur-0 cursor-not-allowed">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                            <cat.icon size={24} className="text-secondary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg">{cat.name}</h3>
                            <p className="text-sm text-secondary line-clamp-2">{cat.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
