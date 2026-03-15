import User from "@/lib/models/User";
import GrabOrder from "@/lib/models/GrabOrder";
import dbConnect from "@/lib/mongodb";

export const grabServerService = {
    async grabNewOrder(userId: string) {
        await dbConnect();
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        // 1. Daily Reset & Initialization Logic (Robust Date Handling)
        const now = new Date();
        const lastGrab = user.lastGrabDate ? new Date(user.lastGrabDate) : null;
        let needsSave = false;

        // Compare dates using YYYY-MM-DD to avoid timezone/toDateString glitches
        const formatDate = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        
        if (lastGrab && lastGrab.toString() !== "Invalid Date" && formatDate(now) !== formatDate(lastGrab)) {
            user.dailyTasksCompleted = 0;
            user.dailyCommission = 0;
            user.lastGrabDate = now;
            user.taskRequestStatus = "NONE";
            user.comboConfig = [];
            needsSave = true;
        }
        
        // SANITY CHECK: Ensure counters are never undefined or NaN
        if (typeof user.dailyTasksCompleted !== 'number' || isNaN(user.dailyTasksCompleted)) { user.dailyTasksCompleted = 0; needsSave = true; }
        if (typeof user.dailyCommission !== 'number' || isNaN(user.dailyCommission)) { user.dailyCommission = 0; needsSave = true; }
        if (typeof user.totalCommission !== 'number' || isNaN(user.totalCommission)) { user.totalCommission = 0; needsSave = true; }
        if (!user.lastGrabDate) { user.lastGrabDate = now; needsSave = true; }
        if (!user.maxDailyTasks) { user.maxDailyTasks = 25; needsSave = true; }
        if (!user.taskRequestStatus) { user.taskRequestStatus = "NONE"; needsSave = true; }

        if (needsSave) {
            await user.save();
        }

        // 2. Check Task Request Status
        if (user.taskRequestStatus !== "APPROVED") {
            const errorMsg = user.taskRequestStatus === "PENDING" 
                ? "Your task request is pending approval." 
                : "You need to request daily tasks first.";
            throw new Error(errorMsg);
        }

        // 3. Check Limits
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

        // 3. Determine if it's a COMBO order (Based on Admin Configuration)
        const nextGrabIndex = user.dailyTasksCompleted + 1;
        const comboSetting = user.comboConfig?.find((c: any) => c.grabIndex === nextGrabIndex);
        const isCombo = !!comboSetting;
        
        // 4. Generate Order Details
        const baseProfitRate = 0.008; // 0.8%
        const commission = user.balance * baseProfitRate;
        
        // For combos, price is usually 2.5x balance, or enough to require a deposit
        const price = user.balance * (isCombo ? (comboSetting.multiple || 2.5) : 0.8);
        const productName = this.getRandomProduct();

        const finalPrice = Math.max(parseFloat(price.toFixed(2)), 0.01);
        const finalCommission = Math.max(parseFloat(commission.toFixed(2)), 0.01);

        // Generate items for the order (especially for combos)
        const items = [];
        if (isCombo) {
            const numItems = Math.floor(Math.random() * 3) + 3; // 3-5 items
            let remainingPrice = finalPrice;
            for (let i = 0; i < numItems; i++) {
                const itemPrice = i === numItems - 1 ? remainingPrice : parseFloat((Math.random() * (remainingPrice / 2)).toFixed(2));
                const qty = Math.floor(Math.random() * 500) + 1;
                items.push({
                    name: this.getRandomProduct(),
                    image: `https://picsum.photos/seed/${Math.random()}/200`,
                    price: itemPrice,
                    quantity: qty
                });
                remainingPrice -= itemPrice;
                if (remainingPrice <= 0) break;
            }
        } else {
            items.push({
                name: productName,
                image: `https://picsum.photos/seed/${Math.random()}/200`,
                price: finalPrice,
                quantity: 1
            });
        }

        const newOrder = await GrabOrder.create({
            userId,
            productName: isCombo ? "Combine Order" : productName,
            items,
            price: finalPrice,
            commission: finalCommission,
            isCombo,
            requiredDeposit: comboSetting?.requiredDeposit || 0,
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
            const shortAmount = (balanceNeeded - user.balance).toFixed(4);
            const errorMsg = `Your account balance is not enough, you need to recharge ${shortAmount} to submit this order`;
            throw new Error(errorMsg);
        }

        // SANITY CHECK: Initialize missing fields
        if (typeof user.dailyTasksCompleted !== 'number') user.dailyTasksCompleted = 0;
        if (typeof user.dailyCommission !== 'number') user.dailyCommission = 0;
        if (typeof user.totalCommission !== 'number') user.totalCommission = 0;

        // Process completion with forceful field updates
        user.balance = parseFloat((user.balance + order.commission).toFixed(2));
        user.totalCommission = parseFloat((user.totalCommission + order.commission).toFixed(2));
        user.dailyCommission = parseFloat((user.dailyCommission + order.commission).toFixed(2));
        user.dailyTasksCompleted += 1;
        user.lastGrabDate = new Date();
        user.status = "ACTIVE";
        
        await user.save();

        order.status = "COMPLETED";
        await order.save();

        return { 
            order, 
            newBalance: user.balance, 
            dailyTasksCompleted: user.dailyTasksCompleted, 
            dailyCommission: user.dailyCommission 
        };
    },

    getRandomProduct() {
        const products = ["Luxury Watch", "iPhone 15 Pro", "Crypto Node", "Designer Bag", "Graphics Card", "Gaming Laptop"];
        return products[Math.floor(Math.random() * products.length)];
    }
};
