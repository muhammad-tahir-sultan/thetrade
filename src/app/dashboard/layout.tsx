"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTrading } from "@/hooks/useTrading";
import { LogOut, LayoutDashboard, History, Settings, Menu as MenuIcon, Zap, X, Shield } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { role } = useTrading();
    const adminNotifications = useAdminNotifications();

    // Default sidebar to open only on desktop sized screens
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 1024) {
            setIsSidebarOpen(true);
        }
    }, []);

    // Sidebar keyboard shortcut (Ctrl+B)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
                e.preventDefault();
                setIsSidebarOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/auth/login");
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const navItems = [
        { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
        { label: "History", icon: History, href: "/dashboard/history" },
        { label: "Grab", icon: Zap, href: "/dashboard/grab" },
        { label: "Settings", icon: Settings, href: "/dashboard/settings" },
    ];

    if (role === "ADMIN") {
        navItems.push({ label: "Admin", icon: Shield, href: "/dashboard/admin" });
    }


    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row overflow-hidden pb-16 lg:pb-0">
            {/* Mobile Top Header */}
            <header className="flex lg:hidden items-center justify-between p-4 border-b border-secondary/10 bg-background/80 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 text-sm">T</div>
                    <span className="font-bold tracking-tighter">The Trade</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 bg-secondary/5 border border-secondary/10 rounded-xl hover:bg-secondary/10 transition-all cursor-pointer"
                >
                    <MenuIcon size={20} />
                </button>
            </header>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-secondary/10 flex flex-col p-6 gap-8 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 shrink-0",
                !isSidebarOpen ? "-translate-x-full lg:-ml-72" : "translate-x-0"
            )}>
                <div className="flex items-center justify-between mb-4">
                    <Link href="/dashboard" className="flex items-center gap-3 px-2 cursor-pointer transition-opacity hover:opacity-80">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 text-lg">T</div>
                        <span className="text-xl font-bold tracking-tighter">The Trade</span>
                    </Link>
                    {/* Internal Toggle Button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 text-secondary hover:bg-secondary/10 rounded-xl transition-colors cursor-pointer"
                        title="Toggle Sidebar (Ctrl+B)"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 flex flex-col gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all cursor-pointer",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-secondary hover:bg-secondary/5"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </div>
                            {item.label === "Admin" && adminNotifications.count > 0 && (
                                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-black bg-red-500 text-white rounded-full animate-pulse shadow-lg shadow-red-500/40">
                                    {adminNotifications.count}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-500/5 rounded-2xl font-bold transition-all mt-auto cursor-pointer"
                >
                    <LogOut size={20} />
                    <span>Log Out</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative transition-all duration-300">
                {/* Desktop Toggle Button (Only visible when sidebar is closed) */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="hidden lg:flex fixed top-6 left-6 z-40 p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        title="Open Sidebar (Ctrl+B)"
                    >
                        <MenuIcon size={20} />
                    </button>
                )}

                <div className="p-5 md:p-12 max-w-7xl mx-auto min-h-full">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-secondary/10 px-6 py-3 z-40 flex items-center justify-between">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all relative",
                            pathname === item.href ? "text-primary" : "text-secondary"
                        )}
                    >
                        <div className="relative">
                            <item.icon size={22} strokeWidth={pathname === item.href ? 3 : 2} />
                            {item.label === "Admin" && adminNotifications.count > 0 && (
                                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-3.5 px-1 text-[8px] font-black bg-red-500 text-white rounded-full border border-background">
                                    {adminNotifications.count}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden cursor-pointer"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
