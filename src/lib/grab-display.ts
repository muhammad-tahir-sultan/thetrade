/**
 * Combo orders show the admin-configured required deposit exactly.
 * Regular orders use `storedPrice` as-is.
 */
export function getDisplayedOrderAmount(params: {
    isCombo: boolean;
    storedPrice: number;
    requiredDeposit?: number;
    walletBalance?: number;
}): number {
    if (params.isCombo) {
        const adminValue = Math.max(0, Number(params.requiredDeposit) || 0);
        if (adminValue > 0) return parseFloat(adminValue.toFixed(2));
    }
    return parseFloat((Number(params.storedPrice) || 0).toFixed(2));
}

export function getDisplayedExpectedIncome(orderAmount: number, commission: number): number {
    return parseFloat((orderAmount + commission).toFixed(4));
}

/** Admin-set deposit the user must add before submitting a combo order. */
export function getAdminRequiredDeposit(requiredDeposit: number): number {
    return Math.max(0, Number(requiredDeposit) || 0);
}

/** How much more USDT the user must deposit to meet the admin-set combo amount. */
export function getComboTopUpAmount(requiredDeposit: number, walletBalance: number): number {
    const threshold = Math.max(0, Number(requiredDeposit) || 0);
    const balance = Number(walletBalance) || 0;
    return Math.max(0, parseFloat((threshold - balance).toFixed(2)));
}

/** True when a combo order cannot be submitted until the wallet meets the admin amount. */
export function comboNeedsDeposit(params: {
    isCombo: boolean;
    isAdminAuthorized?: boolean;
    storedPrice: number;
    requiredDeposit?: number;
    walletBalance: number;
}): boolean {
    const { isCombo, isAdminAuthorized, storedPrice, requiredDeposit, walletBalance } = params;
    if (!isCombo || isAdminAuthorized) return false;
    const threshold = Math.max(0, Number(requiredDeposit) || Number(storedPrice) || 0);
    return getComboTopUpAmount(threshold, walletBalance) > 1e-6;
}
