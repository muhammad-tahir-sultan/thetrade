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
        const userId = (session.user as any).id;
        let user = await User.findById(userId).select("-password");

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // BRUTE FORCE: If fields are missing in the object, update the DB directly
        const needsInitialization = 
            user.dailyTasksCompleted === undefined || 
            user.dailyCommission === undefined ||
            user.maxDailyTasks === undefined;

        if (needsInitialization) {
            await User.findByIdAndUpdate(userId, {
                $set: {
                    dailyTasksCompleted: user.dailyTasksCompleted ?? 0,
                    dailyCommission: user.dailyCommission ?? 0,
                    maxDailyTasks: user.maxDailyTasks ?? 25,
                    totalCommission: user.totalCommission ?? 0,
                    lastGrabDate: user.lastGrabDate ?? new Date(),
                    status: user.status ?? "ACTIVE",
                    taskRequestStatus: user.taskRequestStatus ?? "NONE",
                    comboConfig: user.comboConfig ?? []
                }
            }, { new: true });
            
            // Refetch fresh document
            user = await User.findById(userId).select("-password");
        }

        // Return a clean object to ensure all fields are visible to frontend
        return NextResponse.json({
            ...user.toObject(),
            dailyTasksCompleted: user.dailyTasksCompleted || 0,
            dailyCommission: user.dailyCommission || 0,
            maxDailyTasks: user.maxDailyTasks || 25,
            totalCommission: user.totalCommission || 0,
            status: user.status || "ACTIVE",
            taskRequestStatus: user.taskRequestStatus || "NONE",
            comboConfig: user.comboConfig || [],
            TEST_FIELD: "IF YOU SEE THIS THE API IS UPDATED"
        });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
