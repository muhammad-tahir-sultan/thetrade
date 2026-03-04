import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import dbConnect from "@/lib/mongodb";

export const transactionServerService = {
    async processTransaction(userId: string, type: "DEPOSIT" | "WITHDRAW", amount: number) {
        await dbConnect();

        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        if (type === "WITHDRAW" && user.balance < amount) {
            throw new Error("Insufficient balance");
        }

        // Business Logic: Calculate new balance
        const balanceChange = type === "DEPOSIT" ? amount : -amount;
        user.balance += balanceChange;
        await user.save();

        // Create record
        const transaction = await Transaction.create({
            userId,
            type,
            amount,
            status: "COMPLETED",
        });

        return { balance: user.balance, transaction };
    },

    async getRecentTransactions(userId: string, limit = 10) {
        await dbConnect();
        return await Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    },
};
