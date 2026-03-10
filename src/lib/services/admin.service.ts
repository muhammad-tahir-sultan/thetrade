import apiClient from "@/lib/api-client";

export const adminService = {
    async getPendingTransactions() {
        const response = await apiClient.get("/admin/transactions");
        return response.data;
    },

    async updateTransactionStatus(id: string, status: "COMPLETED" | "REJECTED") {
        const response = await apiClient.put(`/admin/transactions/${id}`, { status });
        return response.data;
    },

    async getCSRequests() {
        const response = await apiClient.get("/admin/cs");
        return response.data;
    },

    async updateCSStatus(id: string, data: { status: string; adminRemark?: string }) {
        const response = await apiClient.patch("/admin/cs", { id, ...data });
        return response.data;
    }
};
