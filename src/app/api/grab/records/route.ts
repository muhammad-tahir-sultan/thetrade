import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import GrabOrder from "@/lib/models/GrabOrder";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const userId = (session.user as any).id;
        const records = await GrabOrder.find({ userId, status: "COMPLETED" })
            .sort({ updatedAt: -1 })
            .limit(50);

        return NextResponse.json(records);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
