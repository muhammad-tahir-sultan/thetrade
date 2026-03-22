import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    dailyTasksCompleted: { type: Number, default: 0 },
    maxDailyTasks: { type: Number, default: 25 },
    lastGrabDate: { type: Date, default: Date.now },
    totalCommission: { type: Number, default: 0 },
    dailyCommission: { type: Number, default: 0 },
    status: { type: String, enum: ["ACTIVE", "FROZEN", "PENDING_COMBO"], default: "ACTIVE" },
    taskRequestStatus: { 
        type: String, 
        enum: ["NONE", "PENDING", "APPROVED"], 
        default: "NONE" 
    },
    comboConfig: [{
        grabIndex: { type: Number }, // 1 to 25
        requiredDeposit: { type: Number, default: 0 }
    }],
    createdAt: { type: Date, default: Date.now },
});

const User = models.User || model("User", UserSchema);
export default User;
