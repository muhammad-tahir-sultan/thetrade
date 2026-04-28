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
    },

    async getNotificationCount() {
        const response = await apiClient.get("/admin/notifications");
        return response.data;
    },

    async getTaskRequests() {
        const response = await apiClient.get("/admin/tasks/requests");
        return response.data;
    },

    async approveTasks(userId: string, comboConfig: any[]) {
        const response = await apiClient.post("/admin/tasks/approve", { userId, comboConfig });
        return response.data;
    },

    async getInvitations() {
        const response = await apiClient.get("/admin/invitations");
        return response.data;
    },

    async getInvitationsFiltered(params?: { search?: string; role?: string; inviterId?: string }) {
        const response = await apiClient.get("/admin/invitations", { params });
        return response.data;
    },

    async getAdminHistory(params?: { type?: string; search?: string }) {
        const response = await apiClient.get("/admin/history", { params });
        return response.data;
    },
};
