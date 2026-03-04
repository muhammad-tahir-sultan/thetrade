import apiClient from "@/lib/api-client";

export const transactionService = {
    async createTransaction(type: "DEPOSIT" | "WITHDRAW", amount: number) {
        const response = await apiClient.post("/transactions", { type, amount });
        return response.data;
    },

    async getTransactions() {
        const response = await apiClient.get("/transactions");
        return response.data;
    },

    async getCurrentUser() {
        const response = await apiClient.get("/user/me");
        return response.data;
    },
};
