/** Admin-set combo amount (0 is valid — do not fall back to storedPrice). */
export function getComboAdminAmount(params: {
    isCombo: boolean;
    requiredDeposit?: number | null;
    storedPrice?: number;
}): number {
    if (!params.isCombo) {
        return Math.max(0, Number(params.storedPrice) || 0);
    }
    if (params.requiredDeposit !== undefined && params.requiredDeposit !== null) {
        const parsed = Number(params.requiredDeposit);
        if (Number.isFinite(parsed)) return Math.max(0, parseFloat(parsed.toFixed(2)));
    }
    return Math.max(0, Number(params.storedPrice) || 0);
}

/**
 * Combo orders show the admin-configured required deposit exactly (including 0).
 * Regular orders use `storedPrice` as-is.
 */
export function getDisplayedOrderAmount(params: {
    isCombo: boolean;
    storedPrice: number;
    requiredDeposit?: number | null;
    walletBalance?: number;
}): number {
    return getComboAdminAmount({
        isCombo: params.isCombo,
        requiredDeposit: params.requiredDeposit,
        storedPrice: params.storedPrice,
    });
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
    requiredDeposit?: number | null;
    walletBalance: number;
}): boolean {
    const { isCombo, isAdminAuthorized, storedPrice, requiredDeposit, walletBalance } = params;
    if (!isCombo || isAdminAuthorized) return false;
    const threshold = getComboAdminAmount({ isCombo: true, requiredDeposit, storedPrice });
    if (threshold <= 1e-6) return false;
    return getComboTopUpAmount(threshold, walletBalance) > 1e-6;
}
