/**
 * Combo orders: show order total as admin-required deposit + user's wallet balance
 * (product rule — not the internal `storedPrice` used for legacy combo math).
 */
export function getDisplayedOrderAmount(params: {
    isCombo: boolean;
    storedPrice: number;
    requiredDeposit: number;
    walletBalance: number;
}): number {
    const { isCombo, storedPrice, requiredDeposit, walletBalance } = params;
    if (!isCombo) return Number(storedPrice) || 0;
    const r = Number(requiredDeposit) || 0;
    const b = Number(walletBalance) || 0;
    return parseFloat((r + b).toFixed(2));
}

export function getDisplayedExpectedIncome(orderAmount: number, commission: number): number {
    return parseFloat((orderAmount + commission).toFixed(4));
}
