import User from "@/lib/models/User";
import GrabOrder from "@/lib/models/GrabOrder";
import Product from "@/lib/models/Product";
import dbConnect from "@/lib/mongodb";

// Progressive commission rate: starts at 1%, grows ~4% per order (order 1→25 yields 1%→2.6%)
function getCommissionRate(orderIndex: number): number {
    return 0.01 * Math.pow(1.04, orderIndex - 1);
}

export const grabServerService = {
    async getRandomProductData() {
        const products = await Product.find({ isActive: true }).select("name image").lean();
        if (!products.length) {
            throw new Error("No active products configured. Ask admin to add products.");
        }
        const item = products[Math.floor(Math.random() * products.length)] as any;
        return {
            name: item.name,
            image: item.image,
        };
    },

    async grabNewOrder(userId: string) {
        await dbConnect();
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        // Sanity checks — ensure numeric fields are valid, never reset progress
        let needsSave = false;
        if (typeof user.dailyTasksCompleted !== "number" || isNaN(user.dailyTasksCompleted)) { user.dailyTasksCompleted = 0; needsSave = true; }
        if (typeof user.dailyCommission !== "number" || isNaN(user.dailyCommission)) { user.dailyCommission = 0; needsSave = true; }
        if (typeof user.totalCommission !== "number" || isNaN(user.totalCommission)) { user.totalCommission = 0; needsSave = true; }
        if (!user.maxDailyTasks) { user.maxDailyTasks = 25; needsSave = true; }
        if (!user.taskRequestStatus) { user.taskRequestStatus = "NONE"; needsSave = true; }
        if (needsSave) await user.save();

        // ── Guards ──
        if (user.taskRequestStatus !== "APPROVED") {
            throw new Error(
                user.taskRequestStatus === "PENDING"
                    ? "Your task request is pending approval."
                    : "You need to request daily tasks first."
            );
        }

        if (user.dailyTasksCompleted >= user.maxDailyTasks) {
            throw new Error("Daily task limit reached (25/25)");
        }

        if (user.status === "PENDING_COMBO") {
            throw new Error("Please complete your pending combo order first");
        }

        // Return any existing pending order
        const pendingOrder = await GrabOrder.findOne({ userId, status: "PENDING" });
        if (pendingOrder) return { order: pendingOrder, message: "Continue with your pending order" };

        // ── Build new order ──
        const nextGrabIndex = user.dailyTasksCompleted + 1;
        const comboSetting = user.comboConfig?.find((c: any) => c.grabIndex === nextGrabIndex);
        const isCombo = !!comboSetting;

        // [2] Progressive commission — floor ensures minimum regardless of balance
        const rate = getCommissionRate(nextGrabIndex);
        const rawCommission = isCombo
            ? (comboSetting.requiredDeposit || user.balance) * 0.30   // 30% for combo
            : user.balance * rate;
        const commission = Math.max(parseFloat(rawCommission.toFixed(4)), 0.50);

        const price = isCombo
            ? (comboSetting.requiredDeposit || 0) + user.balance
            : user.balance * 0.8;
        const finalPrice = Math.max(parseFloat(price.toFixed(2)), 0.01);
        const baseProduct = await this.getRandomProductData();
        const productName = baseProduct.name;

        const items = [];
        if (isCombo) {
            const numItems = Math.floor(Math.random() * 3) + 3;
            let remaining = finalPrice;
            for (let i = 0; i < numItems; i++) {
                const itemPrice = i === numItems - 1 ? remaining : parseFloat((Math.random() * (remaining / 2)).toFixed(2));
                const randomProduct = await this.getRandomProductData();
                items.push({
                    name: randomProduct.name,
                    image: randomProduct.image,
                    price: itemPrice,
                    quantity: Math.floor(Math.random() * 500) + 1,
                });
                remaining -= itemPrice;
                if (remaining <= 0) break;
            }
        } else {
            items.push({
                name: productName,
                image: baseProduct.image,
                price: finalPrice,
                quantity: 1,
            });
        }

        const newOrder = await GrabOrder.create({
            userId,
            productName: isCombo ? "Combine Order" : productName,
            items,
            price: finalPrice,
            commission,
            isCombo,
            requiredDeposit: comboSetting?.requiredDeposit || 0,
            status: "PENDING",
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
        if (!order || order.userId.toString() !== userId) throw new Error("Order not found");
        if (order.status !== "PENDING") throw new Error("Order is already processed");

        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        if (order.isCombo && !order.isAdminAuthorized && user.balance < order.price) {
            const short = (order.price - user.balance).toFixed(2);
            throw new Error(`Balance insufficient. Deposit ${short} USDT to submit this order.`);
        }

        if (typeof user.dailyTasksCompleted !== "number") user.dailyTasksCompleted = 0;
        if (typeof user.dailyCommission !== "number") user.dailyCommission = 0;
        if (typeof user.totalCommission !== "number") user.totalCommission = 0;

        user.balance = parseFloat((user.balance + order.commission).toFixed(4));
        user.totalCommission = parseFloat((user.totalCommission + order.commission).toFixed(4));
        user.dailyCommission = parseFloat((user.dailyCommission + order.commission).toFixed(4));
        user.dailyTasksCompleted += 1;
        user.status = "ACTIVE";
        if (user.dailyTasksCompleted >= (user.maxDailyTasks || 25)) {
            user.taskRequestStatus = "NONE";
            user.lastGrabDate = new Date();
        }
        await user.save();

        order.status = "COMPLETED";
        await order.save();

        return {
            order,
            newBalance: user.balance,
            dailyTasksCompleted: user.dailyTasksCompleted,
            dailyCommission: user.dailyCommission,
        };
    },

    async cancelOrder(orderId: string, userId: string) {
        await dbConnect();
        const order = await GrabOrder.findById(orderId);
        if (!order || order.userId.toString() !== userId) throw new Error("Order not found");
        if (order.status !== "PENDING") throw new Error("Only pending orders can be cancelled");

        order.status = "CANCELLED";
        await order.save();

        // Reset user combo status if needed
        const user = await User.findById(userId);
        if (user && user.status === "PENDING_COMBO") {
            user.status = "ACTIVE";
            await user.save();
        }

        return { success: true };
    },

};
