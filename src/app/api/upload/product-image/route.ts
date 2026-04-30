import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { configureCloudinary } from "@/lib/cloudinary";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user && "id" in session.user ? (session.user as { id?: string }).id : undefined;
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await dbConnect();
        const admin = await User.findById(userId);
        if (!admin || admin.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file");
        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Image file is required" }, { status: 400 });
        }
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "Image must be 5MB or less" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        const cloudinary = configureCloudinary();
        const uploaded = await cloudinary.uploader.upload(dataUri, {
            folder: `thetrade/products/${userId}`,
            resource_type: "image",
        });

        return NextResponse.json({
            secureUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to upload image";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
