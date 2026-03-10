import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CSRequest from "@/lib/models/CSRequest";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, message, type } = await req.json();
        
        await dbConnect();
        const request = await CSRequest.create({
            userId: (session.user as any).id,
            orderId,
            message,
            type: type || "COMBO_UNLOCK",
            status: "OPEN"
        });

        return NextResponse.json({ success: true, request });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to create request" }, 
            { status: 400 }
        );
    }
}
