import User from "@/lib/models/User";
import GrabOrder from "@/lib/models/GrabOrder";
import dbConnect from "@/lib/mongodb";

export const grabServerService = {
    async grabNewOrder(userId: string) {
        await dbConnect();
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        // 1. Daily Reset Logic
        const now = new Date();
        const lastGrab = new Date(user.lastGrabDate);
        if (now.toDateString() !== lastGrab.toDateString()) {
            user.dailyTasksCompleted = 0;
            user.dailyCommission = 0;
            user.lastGrabDate = now;
        }

        // SANITY CHECK: Initialize missing fields for legacy accounts
        if (typeof user.dailyTasksCompleted !== 'number') user.dailyTasksCompleted = 0;
        if (typeof user.dailyCommission !== 'number') user.dailyCommission = 0;
        if (typeof user.totalCommission !== 'number') user.totalCommission = 0;

        // 2. Check Limits
        if (user.dailyTasksCompleted >= user.maxDailyTasks) {
            throw new Error("Daily task limit reached (25/25)");
        }

        if (user.status === "PENDING_COMBO") {
            throw new Error("Please complete your pending combo order first");
        }

        // Check if there's already a pending order
        const pendingOrder = await GrabOrder.findOne({ userId, status: "PENDING" });
        if (pendingOrder) {
            return { order: pendingOrder, message: "Continue with your pending order" };
        }

        // 3. Determine if it's a COMBO order (roughly 15% chance, or based on specific task indices)
        // Let's say indices 7, 14, 21 are combos for simplicity, or just random
        const isCombo = Math.random() < 0.15; // 15% chance
        
        // 4. Generate Order Details
        // Profit usually 0.5% to 1% of balance
        const baseProfitRate = 0.008; // 0.8%
        const commission = user.balance * baseProfitRate;
        const price = user.balance * (isCombo ? 2.5 : 0.8);

        // Ensure we don't have orders with 0 price for very low balances
        const finalPrice = Math.max(parseFloat(price.toFixed(2)), 0.01);
        const finalCommission = Math.max(parseFloat(commission.toFixed(2)), 0.01);

        const newOrder = await GrabOrder.create({
            userId,
            productName: this.getRandomProduct(),
            price: finalPrice,
            commission: finalCommission,
            isCombo,
            status: "PENDING"
        });

        if (isCombo) {
            user.status = "PENDING_COMBO";
            await user.save();
        }

        return { order: newOrder, isCombo };
    },

    async completeOrder(orderId: string, userId: string) {
        await dbConnect();
        const order = await GrabOrder.findById(orderId);
        if (!order || order.userId.toString() !== userId) {
            throw new Error("Order not found");
        }
        if (order.status !== "PENDING") {
            throw new Error("Order is already processed");
        }

        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        // If it's a combo, it needs authorization or enough balance
        // If it's a regular order, we allow a small grace to prevent getting stuck
        const balanceNeeded = order.isCombo ? order.price : 0; 

        if (!order.isAdminAuthorized && user.balance < balanceNeeded) {
            const errorMsg = "Balance insufficient for 💎 Combo. Request Instant Unlock now!";
            throw new Error(errorMsg);
        }

        // SANITY CHECK: Initialize missing fields
        if (typeof user.dailyTasksCompleted !== 'number') user.dailyTasksCompleted = 0;
        if (typeof user.dailyCommission !== 'number') user.dailyCommission = 0;
        if (typeof user.totalCommission !== 'number') user.totalCommission = 0;

        // Process completion with ATOMIC updates to avoid stale state issues
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $inc: {
                balance: order.commission,
                totalCommission: order.commission,
                dailyCommission: order.commission,
                dailyTasksCompleted: 1
            },
            $set: {
                status: "ACTIVE",
                lastGrabDate: new Date() // Ensure reset logic doesn't trigger on same-day tasks
            }
        }, { new: true });

        order.status = "COMPLETED";
        await order.save();

        return { order, newBalance: updatedUser.balance };
    },

    getRandomProduct() {
        const products = ["Luxury Watch", "iPhone 15 Pro", "Crypto Node", "Designer Bag", "Graphics Card", "Gaming Laptop"];
        return products[Math.floor(Math.random() * products.length)];
    }
};
