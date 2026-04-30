import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { assertAdminPermission } from "@/lib/services/server/admin-auth.server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await assertAdminPermission((session.user as any).id, "MANAGE_TASK_REQUESTS");
        await dbConnect();
        const pendingUsers = await User.find({ taskRequestStatus: "PENDING" }).select("-password");

        return NextResponse.json(pendingUsers);
    } catch (error: any) {
        const msg = error.message || "Server error";
        return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
    }
}
