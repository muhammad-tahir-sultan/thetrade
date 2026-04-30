import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import dbConnect from "@/lib/mongodb";
import { assertAdminPermission } from "@/lib/services/server/admin-auth.server";

type AdminHistoryItem = {
    id: string;
    eventType: "USER_REGISTERED" | "TRANSACTION";
    createdAt: Date;
    userName: string;
    userEmail: string;
    role: string;
    invitationCode?: string;
    invitedByCode?: string;
    txType?: "DEPOSIT" | "WITHDRAW";
    direction?: "INCOMING" | "OUTGOING";
    amount?: number;
    status?: string;
    address?: string;
    network?: string;
};

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await assertAdminPermission((session.user as any).id, "VIEW_HISTORY");
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const typeFilter = (searchParams.get("type") || "ALL").toUpperCase();
        const search = (searchParams.get("search") || "").trim();

        const txQuery: Record<string, any> = {};
        if (typeFilter === "DEPOSIT" || typeFilter === "WITHDRAW") txQuery.type = typeFilter;
        if (search) {
            txQuery.$or = [
                { depositAddress: { $regex: search, $options: "i" } },
                { withdrawAddress: { $regex: search, $options: "i" } },
                { withdrawNetwork: { $regex: search, $options: "i" } },
            ];
        }

        const [users, txs] = await Promise.all([
            User.find(search ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { invitationCode: { $regex: search, $options: "i" } },
                    { invitedByCode: { $regex: search, $options: "i" } },
                ],
            } : {})
                .select("name email role invitationCode invitedByCode createdAt")
                .sort({ createdAt: -1 })
                .limit(300)
                .lean(),
            Transaction.find(txQuery)
                .populate("userId", "name email role invitationCode invitedByCode")
                .sort({ createdAt: -1 })
                .limit(500)
                .lean(),
        ]);

        const registerEvents: AdminHistoryItem[] = users.map((u: any) => ({
            id: `reg-${u._id}`,
            eventType: "USER_REGISTERED",
            createdAt: u.createdAt,
            userName: u.name || "Unknown",
            userEmail: u.email || "—",
            role: u.role || "USER",
            invitationCode: u.invitationCode || "",
            invitedByCode: u.invitedByCode || "",
        }));

        const txEvents: AdminHistoryItem[] = txs.map((tx: any) => ({
            id: `tx-${tx._id}`,
            eventType: "TRANSACTION",
            createdAt: tx.createdAt,
            userName: tx.userId?.name || "Unknown",
            userEmail: tx.userId?.email || "—",
            role: tx.userId?.role || "USER",
            invitationCode: tx.userId?.invitationCode || "",
            invitedByCode: tx.userId?.invitedByCode || "",
            txType: tx.type,
            direction: tx.type === "DEPOSIT" ? "INCOMING" : "OUTGOING",
            amount: tx.amount,
            status: tx.status,
            address: tx.type === "DEPOSIT" ? tx.depositAddress : tx.withdrawAddress,
            network: tx.withdrawNetwork || "",
        }));

        const events = [...registerEvents, ...txEvents]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 800);

        return NextResponse.json(events);
    } catch (error: any) {
        const msg = error.message || "Server error";
        return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
    }
}
