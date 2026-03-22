import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import CSRequest from "@/lib/models/CSRequest";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const user = await User.findById((session.user as any).id);
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const [pendingTransactions, openCSRequests, pendingTasks] = await Promise.all([
            Transaction.countDocuments({ status: "PENDING" }),
            CSRequest.countDocuments({ status: "OPEN" }),
            User.countDocuments({ taskRequestStatus: "PENDING" })
        ]);

        return NextResponse.json({
            count: pendingTransactions + openCSRequests + pendingTasks,
            transactions: pendingTransactions,
            csRequests: openCSRequests,
            taskRequests: pendingTasks
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
