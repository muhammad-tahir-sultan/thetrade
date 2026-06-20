import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminUsersServer } from "@/lib/services/server/admin-users.server";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminId = (session.user as any).id;
        await adminUsersServer.assertManageUsers(adminId);

        const { id } = await ctx.params;
        const result = await adminUsersServer.resetUserAccount(id, adminId);

        return NextResponse.json({
            message: "User account reset to a fresh state. Login credentials were kept.",
            ...result,
        });
    } catch (e: any) {
        const msg = e.message || "Server error";
        return NextResponse.json(
            { error: msg },
            { status: msg === "Forbidden" ? 403 : msg === "User not found" ? 404 : 400 }
        );
    }
}
