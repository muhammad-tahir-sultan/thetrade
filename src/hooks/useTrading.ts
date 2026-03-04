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
            // Invalidate queries to trigger background refresh
            queryClient.invalidateQueries({ queryKey: ["user-me"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });

    return {
        balance: userQuery.data?.balance || 0,
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
