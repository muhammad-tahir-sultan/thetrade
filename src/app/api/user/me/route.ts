import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

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
        });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH /api/user/me — update name and/or password
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, currentPassword, newPassword } = await req.json();
        await dbConnect();

        const user = await User.findById((session.user as any).id);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (name?.trim()) user.name = name.trim();

        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: "Current password is required" }, { status: 400 });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
            }
            if (newPassword.length < 6) {
                return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        return NextResponse.json({ success: true, name: user.name });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
