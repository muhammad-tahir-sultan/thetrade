import apiClient from "@/lib/api-client";

export const adminService = {
    async getPendingTransactions() {
        const response = await apiClient.get("/admin/transactions");
        return response.data;
    },

    async updateTransactionStatus(id: string, status: "COMPLETED" | "REJECTED") {
        const response = await apiClient.put(`/admin/transactions/${id}`, { status });
        return response.data;
    }
};
