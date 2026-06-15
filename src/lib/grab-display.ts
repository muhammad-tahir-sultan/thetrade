/**
 * Combo orders: fixed total set at grab time (`storedPrice` = admin deposit + balance then).
 * Regular orders use `storedPrice` as-is.
 */
export function getDisplayedOrderAmount(params: {
    isCombo: boolean;
    storedPrice: number;
    requiredDeposit?: number;
    walletBalance?: number;
}): number {
    return parseFloat((Number(params.storedPrice) || 0).toFixed(2));
}

export function getDisplayedExpectedIncome(orderAmount: number, commission: number): number {
    return parseFloat((orderAmount + commission).toFixed(4));
}

/** Admin-set deposit the user must add before submitting a combo order. */
export function getAdminRequiredDeposit(requiredDeposit: number): number {
    return Math.max(0, Number(requiredDeposit) || 0);
}

/** How much more USDT the user must deposit to meet the combo submit threshold. */
export function getComboTopUpAmount(storedPrice: number, walletBalance: number): number {
    const threshold = Number(storedPrice) || 0;
    const balance = Number(walletBalance) || 0;
    return Math.max(0, parseFloat((threshold - balance).toFixed(2)));
}

/** True when a combo order cannot be submitted until the wallet meets the stored threshold. */
export function comboNeedsDeposit(params: {
    isCombo: boolean;
    isAdminAuthorized?: boolean;
    storedPrice: number;
    walletBalance: number;
}): boolean {
    const { isCombo, isAdminAuthorized, storedPrice, walletBalance } = params;
    if (!isCombo || isAdminAuthorized) return false;
    return getComboTopUpAmount(storedPrice, walletBalance) > 1e-6;
}
