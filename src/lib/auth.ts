import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await dbConnect();
                const email = String(credentials?.email || "")
                    .trim()
                    .toLowerCase();
                if (!email) return null;
                const user = await User.findOne({ email });

                if (user && bcrypt.compareSync(credentials!.password, user.password)) {
                    return { 
                        id: user._id.toString(), 
                        email: user.email, 
                        name: user.name,
                        role: user.role 
                    };
                }
                return null;
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            /** Keep JWT role aligned with MongoDB (fixes stale ADMIN after DB role changes). */
            const uid = String((token as any).id || token.sub || "");
            if (uid.length === 24) {
                const last = (token as any).roleSyncedAt as number | undefined;
                const now = Date.now();
                if (!last || now - last > 60_000) {
                    await dbConnect();
                    const doc = await User.findById(uid).select("role").lean();
                    if (doc?.role) (token as any).role = doc.role;
                    (token as any).roleSyncedAt = now;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: { signIn: "/auth/login" },
    secret: process.env.NEXTAUTH_SECRET,
};
