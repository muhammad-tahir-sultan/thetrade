import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supportConfigServer } from "@/lib/services/server/support-config.server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as { id?: string })?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const data = await supportConfigServer.getPublicContact();
        return NextResponse.json(data);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Server error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
