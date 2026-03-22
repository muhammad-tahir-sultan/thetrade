import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
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

        const requests = await CSRequest.find({ status: "OPEN" })
            .populate("userId", "name email balance")
            .populate("orderId")
            .sort({ createdAt: -1 });

        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const user = await User.findById((session.user as any).id);
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id, status, adminRemark } = await req.json();
        const request = await CSRequest.findById(id);
        if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

        request.status = status;
        request.adminRemark = adminRemark;
        await request.save();

        // If the request was for COMBO_UNLOCK, we should authorize the order
        if (request.type === "COMBO_UNLOCK" && status === "RESOLVED" && request.orderId) {
            const GrabOrder = (await import("@/lib/models/GrabOrder")).default;
            await GrabOrder.findByIdAndUpdate(request.orderId, { isAdminAuthorized: true });
            
            // Also notify user by resetting status? (Implicitly they will see the submit button now)
            const targetUser = await User.findById(request.userId);
            if (targetUser) {
                targetUser.status = "ACTIVE";
                await targetUser.save();
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
