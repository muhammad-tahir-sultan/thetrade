import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const admin = await User.findById((session.user as any).id);
        if (!admin || admin.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = (searchParams.get("search") || "").trim();
        const role = (searchParams.get("role") || "").trim().toUpperCase();
        const inviterId = (searchParams.get("inviterId") || "").trim();

        const query: Record<string, any> = {};
        if (role === "ADMIN" || role === "USER") query.role = role;
        if (inviterId) query.invitedBy = inviterId;
        if (search) {
            query.$or = [
                { invitationCode: { $regex: search, $options: "i" } },
                { invitedByCode: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(query)
            .select("name email role invitationCode invitedByCode invitedBy totalInvites createdAt")
            .sort({ createdAt: -1 })
            .limit(500)
            .lean();

        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}
