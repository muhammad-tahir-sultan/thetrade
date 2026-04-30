"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminService } from "@/lib/services/admin.service";

export function useAdmin() {
    const queryClient = useQueryClient();
    const [invitationSearch, setInvitationSearch] = useState("");
    const [invitationRoleFilter, setInvitationRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
    const [selectedInviterId, setSelectedInviterId] = useState("");
    const [historySearch, setHistorySearch] = useState("");
    const [historyTypeFilter, setHistoryTypeFilter] = useState<"ALL" | "DEPOSIT" | "WITHDRAW">("ALL");

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

    const depositAddressesQuery = useQuery({
        queryKey: ["admin-deposit-addresses"],
        queryFn: async () => {
            const res = await fetch("/api/admin/deposit-address");
            if (!res.ok) throw new Error("Failed to load addresses");
            return res.json();
        },
    });

    const invitationsQuery = useQuery({
        queryKey: ["admin-invitations", invitationSearch, invitationRoleFilter, selectedInviterId],
        queryFn: () =>
            adminService.getInvitationsFiltered({
                search: invitationSearch || undefined,
                role: invitationRoleFilter === "ALL" ? undefined : invitationRoleFilter,
                inviterId: selectedInviterId || undefined,
            }),
    });

    const historyQuery = useQuery({
        queryKey: ["admin-history", historyTypeFilter, historySearch],
        queryFn: () =>
            adminService.getAdminHistory({
                type: historyTypeFilter,
                search: historySearch || undefined,
            }),
    });

    return {
        pendingTransactions: pendingTransactionsQuery.data || [],
        csRequests: csRequestsQuery.data || [],
        taskRequests: taskRequestsQuery.data || [],
        depositAddresses: depositAddressesQuery.data || [],
        invitations: invitationsQuery.data || [],
        adminHistory: historyQuery.data || [],
        invitationSearch,
        invitationRoleFilter,
        selectedInviterId,
        historySearch,
        historyTypeFilter,
        setInvitationSearch,
        setInvitationRoleFilter,
        setSelectedInviterId,
        setHistorySearch,
        setHistoryTypeFilter,
        isLoadingAddresses: depositAddressesQuery.isLoading,
        isLoading: pendingTransactionsQuery.isLoading || csRequestsQuery.isLoading || taskRequestsQuery.isLoading || invitationsQuery.isLoading || historyQuery.isLoading,
        error: taskRequestsQuery.error || csRequestsQuery.error || pendingTransactionsQuery.error || invitationsQuery.error || historyQuery.error,
        isUpdating: updateStatusMutation.isPending || updateCSMutation.isPending || approveTasksMutation.isPending,
        updateStatus: updateStatusMutation.mutateAsync,
        updateCSStatus: updateCSMutation.mutateAsync,
        approveTasks: approveTasksMutation.mutateAsync,
        refreshAddresses: () => depositAddressesQuery.refetch(),
        refresh: () => {
            pendingTransactionsQuery.refetch();
            csRequestsQuery.refetch();
            taskRequestsQuery.refetch();
            depositAddressesQuery.refetch();
            invitationsQuery.refetch();
            historyQuery.refetch();
            void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        },
    };
}
