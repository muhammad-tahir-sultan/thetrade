import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const user = await User.findById((session.user as any).id);
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await dbConnect();
        const pendingUsers = await User.find({ taskRequestStatus: "PENDING" }).select("-password");

        return NextResponse.json(pendingUsers);
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
