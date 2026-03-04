import User from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authServerService = {
    async registerUser(data: any) {
        const { name, email, password } = data;

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return { id: newUser._id };
    },
};
