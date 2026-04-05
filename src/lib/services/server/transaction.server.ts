import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import dbConnect from "@/lib/mongodb";

export const transactionServerService = {
    async processTransaction(
        userId: string,
        type: "DEPOSIT" | "WITHDRAW",
        amount: number,
        depositAddress?: string,
        withdrawAddress?: string,
        withdrawNetwork?: string,
    ) {
        await dbConnect();

        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const isAdmin = user.role === "ADMIN";

        // [1] Block regular-user withdrawals until daily tasks are complete
        if (!isAdmin && type === "WITHDRAW") {
            const completed = user.dailyTasksCompleted ?? 0;
            const total = user.maxDailyTasks ?? 25;
            if (completed < total) {
                throw new Error(
                    `You must complete all ${total} daily orders before withdrawing. ` +
                    `Currently ${completed}/${total} done.`
                );
            }
        }

        if (isAdmin) {
            if (type === "WITHDRAW" && user.balance < amount) throw new Error("Insufficient balance");
            const balanceChange = type === "DEPOSIT" ? amount : -amount;
            user.balance += balanceChange;
            await user.save();
            const transaction = await Transaction.create({ userId, type, amount, status: "COMPLETED" });
            return { balance: user.balance, transaction };
        }

        // Regular users: create a PENDING request
        const transaction = await Transaction.create({
            userId,
            type,
            amount,
            status: "PENDING",
            depositAddress: depositAddress || "",
            withdrawAddress: withdrawAddress || "",
            withdrawNetwork: withdrawNetwork || "",
        });
        return { balance: user.balance, transaction };
    },

    async getRecentTransactions(userId: string, limit = 10) {
        await dbConnect();
        return await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    },

    async getPendingTransactions() {
        await dbConnect();
        return await Transaction.find({ status: "PENDING" })
            .populate("userId", "name email balance")
            .sort({ createdAt: -1 });
    },

    async updateTransactionStatus(transactionId: string, status: "COMPLETED" | "REJECTED", adminUserId: string) {
        await dbConnect();

        const admin = await User.findById(adminUserId);
        if (!admin || admin.role !== "ADMIN") throw new Error("Unauthorized: Only admins can perform this action");

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) throw new Error("Transaction not found");
        if (transaction.status !== "PENDING") throw new Error("Transaction already processed");

        if (status === "COMPLETED") {
            const user = await User.findById(transaction.userId);
            if (!user) throw new Error("User not found for transaction");

            if (transaction.type === "WITHDRAW") {
                if (user.balance < transaction.amount) {
                    transaction.status = "FAILED";
                    await transaction.save();
                    throw new Error("User has insufficient balance for this withdrawal");
                }
                user.balance -= transaction.amount;
            } else if (transaction.type === "DEPOSIT") {
                user.balance += transaction.amount;
            }
            await user.save();
        }

        transaction.status = status;
        await transaction.save();
        return transaction;
    },
};
