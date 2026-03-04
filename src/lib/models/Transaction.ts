import mongoose, { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["DEPOSIT", "WITHDRAW"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "COMPLETED" },
    createdAt: { type: Date, default: Date.now },
});

const Transaction = models.Transaction || model("Transaction", TransactionSchema);
export default Transaction;
