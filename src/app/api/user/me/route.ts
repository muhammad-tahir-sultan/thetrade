import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        let user = await User.findById((session.user as any).id).select("-password");

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // MIGRATION: Initialize fields for older accounts if missing
        let needsUpdate = false;
        if (user.dailyTasksCompleted === undefined) { user.dailyTasksCompleted = 0; needsUpdate = true; }
        if (user.maxDailyTasks === undefined) { user.maxDailyTasks = 25; needsUpdate = true; }
        if (user.dailyCommission === undefined) { user.dailyCommission = 0; needsUpdate = true; }
        if (user.totalCommission === undefined) { user.totalCommission = 0; needsUpdate = true; }
        if (!user.lastGrabDate) { user.lastGrabDate = new Date(); needsUpdate = true; }
        if (!user.status) { user.status = "ACTIVE"; needsUpdate = true; }

        if (needsUpdate) {
            await user.save();
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
