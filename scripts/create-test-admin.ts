/**
 * Create or refresh a super-admin test account.
 * Run: npx tsx scripts/create-test-admin.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROOT = resolve(import.meta.dirname, "..");

const ADMIN_EMAIL = "testadmin@thetrade.com";
const ADMIN_PASSWORD = "TestAdmin123!";
const ADMIN_NAME = "Test Admin";

function loadEnv() {
    const envPath = resolve(ROOT, ".env.local");
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = value;
    }
}

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    plainPassword: String,
    balance: { type: Number, default: 0 },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    staffRole: { type: mongoose.Schema.Types.ObjectId, default: null },
    invitationCode: String,
    status: { type: String, default: "ACTIVE" },
});

async function main() {
    loadEnv();
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI missing in .env.local");

    await mongoose.connect(uri);
    const User = mongoose.models.SeedUser || mongoose.model("SeedUser", UserSchema, "users");

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
    let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (admin) {
        admin.name = ADMIN_NAME;
        admin.password = hashed;
        admin.plainPassword = ADMIN_PASSWORD;
        admin.role = "ADMIN";
        admin.staffRole = null;
        admin.status = "ACTIVE";
        if (!admin.invitationCode) admin.invitationCode = "TSTADM1";
        await admin.save();
        console.log("Updated existing admin account.");
    } else {
        admin = await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL.toLowerCase(),
            password: hashed,
            plainPassword: ADMIN_PASSWORD,
            role: "ADMIN",
            staffRole: null,
            balance: 0,
            status: "ACTIVE",
            invitationCode: "TSTADM1",
        });
        console.log("Created new admin account.");
    }

    console.log("\n--- Login credentials ---");
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Role:     ADMIN (full access)`);
    console.log("\nLogin at: /auth/login then open /dashboard/admin");

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
