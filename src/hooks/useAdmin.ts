"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/services/admin.service";

export function useAdmin() {
    const queryClient = useQueryClient();

    const pendingTransactionsQuery = useQuery({
        queryKey: ["admin-pending-transactions"],
        queryFn: adminService.getPendingTransactions,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: "COMPLETED" | "REJECTED" }) =>
            adminService.updateTransactionStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-pending-transactions"] });
            queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
        },
    });

    const csRequestsQuery = useQuery({
        queryKey: ["admin-cs-requests"],
        queryFn: adminService.getCSRequests,
    });

    const updateCSMutation = useMutation({
        mutationFn: ({ id, status, adminRemark }: { id: string; status: string; adminRemark?: string }) =>
            adminService.updateCSStatus(id, { status, adminRemark }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-cs-requests"] });
            queryClient.invalidateQueries({ queryKey: ["admin-pending-transactions"] });
            queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
        },
    });

    const taskRequestsQuery = useQuery({
        queryKey: ["admin-task-requests"],
        queryFn: adminService.getTaskRequests,
    });

    const approveTasksMutation = useMutation({
        mutationFn: ({ userId, comboConfig }: { userId: string, comboConfig: any[] }) =>
            adminService.approveTasks(userId, comboConfig),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-task-requests"] });
        },
    });

    return {
        pendingTransactions: pendingTransactionsQuery.data || [],
        csRequests: csRequestsQuery.data || [],
        taskRequests: taskRequestsQuery.data || [],
        isLoading: pendingTransactionsQuery.isLoading || csRequestsQuery.isLoading || taskRequestsQuery.isLoading,
        error: taskRequestsQuery.error || csRequestsQuery.error || pendingTransactionsQuery.error,
        isUpdating: updateStatusMutation.isPending || updateCSMutation.isPending || approveTasksMutation.isPending,
        updateStatus: updateStatusMutation.mutateAsync,
        updateCSStatus: updateCSMutation.mutateAsync,
        approveTasks: approveTasksMutation.mutateAsync,
        refresh: () => {
            pendingTransactionsQuery.refetch();
            csRequestsQuery.refetch();
            taskRequestsQuery.refetch();
        },
    };
}
