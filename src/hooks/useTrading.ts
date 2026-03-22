"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/lib/services/transaction.service";

export function useTrading() {
    const queryClient = useQueryClient();

    // Fetch User Data with caching
    const userQuery = useQuery({
        queryKey: ["user-me"],
        queryFn: transactionService.getCurrentUser,
    });

    // Fetch Transactions with caching
    const transactionsQuery = useQuery({
        queryKey: ["transactions"],
        queryFn: transactionService.getTransactions,
    });

    // Mutation for creating transactions
    const transactionMutation = useMutation({
        mutationFn: ({ type, amount }: { type: "DEPOSIT" | "WITHDRAW"; amount: number }) =>
            transactionService.createTransaction(type, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-me"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });

    return {
        user: userQuery.data,
        balance: userQuery.data?.balance || 0,
        dailyTasksCompleted: userQuery.data?.dailyTasksCompleted || 0,
        maxDailyTasks: userQuery.data?.maxDailyTasks || 25,
        dailyCommission: userQuery.data?.dailyCommission || 0,
        status: userQuery.data?.status || "ACTIVE",
        taskRequestStatus: userQuery.data?.taskRequestStatus || "NONE",
        role: userQuery.data?.role || "USER",
        transactions: transactionsQuery.data || [],
        loading: userQuery.isLoading || transactionsQuery.isLoading,
        isProcessing: transactionMutation.isPending,
        createTransaction: transactionMutation.mutateAsync,
        refresh: () => {
            userQuery.refetch();
            transactionsQuery.refetch();
        }
    };
}
