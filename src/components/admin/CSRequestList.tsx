"use client";

import { CheckCircle, XCircle, Info } from "lucide-react";

interface CSRequestListProps {
    requests: any[];
    onResolve: (id: string) => void;
    isUpdating: boolean;
}

export function CSRequestList({ requests, onResolve, isUpdating }: CSRequestListProps) {
    if (requests.length === 0) {
        return (
            <div className="w-full min-h-[400px] p-12 text-center flex flex-col items-center justify-center gap-4 text-secondary flex-1">
                <div className="relative mb-2">
                    <CheckCircle size={56} className="opacity-10 absolute -top-3 -right-3 text-green-500 scale-150 blur-sm" />
                    <XCircle size={56} className="opacity-20" />
                </div>
                <div className="space-y-1">
                    <p className="font-black text-xl text-white/90">No pending CS requests</p>
                    <p className="text-xs opacity-50 max-w-[280px] leading-relaxed mx-auto">
                        All users are currently active. New unlock requests will appear here as soon as they are submitted by users.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-secondary/10 bg-secondary/5">
                        <th className="p-3 sm:p-6 font-bold text-secondary text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap">User</th>
                        <th className="p-3 sm:p-6 font-bold text-secondary text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap">Request Type</th>
                        <th className="p-3 sm:p-6 font-bold text-secondary text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap">Order Info</th>
                        <th className="p-3 sm:p-6 font-bold text-secondary text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap">Time</th>
                        <th className="p-3 sm:p-6 font-bold text-secondary text-xs sm:text-sm uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req: any) => (
                        <tr key={req._id} className="border-b border-secondary/5 hover:bg-secondary/5 transition-colors">
                            <td className="p-3 sm:p-6 whitespace-nowrap">
                                <div className="font-bold text-sm sm:text-base">{req.userId?.name || "Unknown"}</div>
                                <div className="text-xs sm:text-sm text-secondary">{req.userId?.email}</div>
                                <div className="text-[10px] sm:text-xs font-semibold mt-1 text-primary">
                                    Bal: ${req.userId?.balance?.toFixed(2)}
                                </div>
                            </td>
                            <td className="p-3 sm:p-6 whitespace-nowrap">
                                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold">
                                    {req.type}
                                </span>
                            </td>
                            <td className="p-3 sm:p-6 whitespace-nowrap">
                                {req.orderId ? (
                                    <div className="text-xs">
                                        <p className="font-bold">Price: ${req.orderId.price?.toFixed(2)}</p>
                                        <p className="text-secondary">Profit: ${req.orderId.commission?.toFixed(2)}</p>
                                    </div>
                                ) : (
                                    <span className="text-secondary text-xs font-medium">No order linked</span>
                                )}
                            </td>
                            <td className="p-3 sm:p-6 text-xs font-medium text-secondary whitespace-nowrap">
                                {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} <br/>
                                {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3 sm:p-6 flex items-center justify-end gap-2">
                                <button
                                    disabled={isUpdating}
                                    onClick={() => onResolve(req._id)}
                                    className="px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-xl transition-all font-bold flex items-center gap-2 text-xs cursor-pointer"
                                >
                                    <CheckCircle size={14} /> Resolve (Unlock)
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
