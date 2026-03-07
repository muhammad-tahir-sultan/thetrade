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
        },
    });

    return {
        pendingTransactions: pendingTransactionsQuery.data || [],
        isLoading: pendingTransactionsQuery.isLoading,
        isUpdating: updateStatusMutation.isPending,
        updateStatus: updateStatusMutation.mutateAsync,
        refresh: pendingTransactionsQuery.refetch,
    };
}
