import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { transactionServerService } from "@/lib/services/server/transaction.server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById((session.user as any).id);
        if (!user || user.role !== "ADMIN") {
             return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const transactions = await transactionServerService.getPendingTransactions();
        return NextResponse.json(transactions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}
