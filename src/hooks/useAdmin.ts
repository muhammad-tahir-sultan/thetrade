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

    return {
        pendingTransactions: pendingTransactionsQuery.data || [],
        csRequests: csRequestsQuery.data || [],
        isLoading: pendingTransactionsQuery.isLoading || csRequestsQuery.isLoading,
        isUpdating: updateStatusMutation.isPending || updateCSMutation.isPending,
        updateStatus: updateStatusMutation.mutateAsync,
        updateCSStatus: updateCSMutation.mutateAsync,
        refresh: () => {
            pendingTransactionsQuery.refetch();
            csRequestsQuery.refetch();
        },
    };
}
