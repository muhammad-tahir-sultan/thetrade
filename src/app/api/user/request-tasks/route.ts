import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as any).id;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const maxTasks = Number(user.maxDailyTasks || 25);
        const completed = Number(user.dailyTasksCompleted || 0);
        const now = Date.now();
        const last = user.lastGrabDate ? new Date(user.lastGrabDate).getTime() : 0;
        const cooldownMs = 24 * 60 * 60 * 1000;

        if (completed >= maxTasks) {
            const elapsed = last > 0 ? now - last : 0;
            const remaining = cooldownMs - elapsed;
            if (remaining > 0) {
                const totalMins = Math.ceil(remaining / (60 * 1000));
                const hours = Math.floor(totalMins / 60);
                const minutes = totalMins % 60;
                return NextResponse.json(
                    { error: `You can request new tasks after 24 hours. Remaining: ${hours}h ${minutes}m.` },
                    { status: 400 }
                );
            }
            // Cooldown passed: reset counters so a new batch can be requested.
            user.dailyTasksCompleted = 0;
            user.dailyCommission = 0;
            user.taskRequestStatus = "NONE";
        }

        if (user.taskRequestStatus && user.taskRequestStatus !== "NONE") {
            return NextResponse.json({ error: "Task request already exists or approved" }, { status: 400 });
        }

        user.taskRequestStatus = "PENDING";
        await user.save();

        return NextResponse.json({ message: "Task request submitted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
