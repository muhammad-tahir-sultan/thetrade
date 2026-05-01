"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { transactionService } from "@/lib/services/transaction.service";

export function useTrading() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    // Fetch User Data with caching
    const userQuery = useQuery({
        queryKey: ["user-me"],
        queryFn: transactionService.getCurrentUser,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });

    // Fetch Transactions with caching
    const transactionsQuery = useQuery({
        queryKey: ["transactions"],
        queryFn: transactionService.getTransactions,
    });

    // Mutation for creating transactions
    const transactionMutation = useMutation({
        mutationFn: ({ type, amount, depositAddress, withdrawAddress, withdrawNetwork }: {
            type: "DEPOSIT" | "WITHDRAW"; amount: number;
            depositAddress?: string; withdrawAddress?: string; withdrawNetwork?: string;
        }) => transactionService.createTransaction(type, amount, depositAddress, withdrawAddress, withdrawNetwork),
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
        totalCommission: userQuery.data?.totalCommission || 0,
        status: userQuery.data?.status || "ACTIVE",
        taskRequestStatus: userQuery.data?.taskRequestStatus || "NONE",
        role: (() => {
            const apiRole = userQuery.data?.role || "USER";
            const sessionRole = (session?.user as { role?: string } | undefined)?.role;
            return apiRole === "ADMIN" || sessionRole === "ADMIN" ? "ADMIN" : apiRole;
        })(),
        isSuperAdmin: Boolean(userQuery.data?.isSuperAdmin),
        adminPermissions: (userQuery.data?.adminPermissions || []) as string[],
        transactions: transactionsQuery.data || [],
        loading: userQuery.isLoading || transactionsQuery.isLoading,
        isProcessing: transactionMutation.isPending,
        createTransaction: transactionMutation.mutateAsync,
        refresh: useCallback(() => {
            void queryClient.invalidateQueries({ queryKey: ["user-me"] });
            void queryClient.invalidateQueries({ queryKey: ["transactions"] });
        }, [queryClient]),
    };
}
