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
            user.lastGrabDate = now;
        }

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
        const price = user.balance * (isCombo ? 2.5 : 0.8); // Combo price is 2.5x balance (stalling them)

        const newOrder = await GrabOrder.create({
            userId,
            productName: this.getRandomProduct(),
            price: parseFloat(price.toFixed(2)),
            commission: parseFloat(commission.toFixed(2)),
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
        if (order.isCombo && !order.isAdminAuthorized) {
            if (user.balance < order.price) {
                throw new Error("Balance insufficient for 💎 Combo. Request Instant Unlock now!");
            }
        }

        // Process completion
        user.balance += order.commission;
        user.totalCommission += order.commission;
        user.dailyTasksCompleted += 1;
        user.status = "ACTIVE"; // Reset status if it was PENDING_COMBO
        
        await user.save();

        order.status = "COMPLETED";
        await order.save();

        return { order, newBalance: user.balance };
    },

    getRandomProduct() {
        const products = ["Luxury Watch", "iPhone 15 Pro", "Crypto Node", "Designer Bag", "Graphics Card", "Gaming Laptop"];
        return products[Math.floor(Math.random() * products.length)];
    }
};
