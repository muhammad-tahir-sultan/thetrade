/** Admin-set combo deposit target (0 is valid). */
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
}): number {
    return getComboAdminAmount({
        isCombo: params.isCombo,
        requiredDeposit: params.requiredDeposit,
        storedPrice: params.storedPrice,
    });
}

/** @deprecated Use getOrderSummaryTotal */
export function getDisplayedExpectedIncome(orderAmount: number, commission: number): number {
    return parseFloat((orderAmount + commission).toFixed(4));
}

/** Expected income / total shown at the bottom of order summary. */
export function getOrderSummaryTotal(params: {
    balance: number;
    orderAmount: number;
    requiredDeposit: number;
    commission: number;
    isCombo?: boolean;
}): number {
    const balance = Math.max(0, Number(params.balance) || 0);
    const orderAmount = Math.max(0, Number(params.orderAmount) || 0);
    const requiredDeposit = Math.max(0, Number(params.requiredDeposit) || 0);
    const commission = Math.max(0, Number(params.commission) || 0);

    if (params.isCombo) {
        return parseFloat((balance + orderAmount + requiredDeposit + commission).toFixed(2));
    }

    return parseFloat((balance + orderAmount + commission).toFixed(2));
}

/** How much more the user must deposit toward this combo (independent of wallet balance). */
export function getComboRemainingDeposit(requiredDeposit: number, depositedAmount: number): number {
    const required = Math.max(0, Number(requiredDeposit) || 0);
    const deposited = Math.max(0, Number(depositedAmount) || 0);
    return Math.max(0, parseFloat((required - deposited).toFixed(2)));
}

/** @deprecated Use getComboRemainingDeposit — wallet balance is not part of combo deposit math. */
export function getComboTopUpAmount(requiredDeposit: number, depositedAmount: number): number {
    return getComboRemainingDeposit(requiredDeposit, depositedAmount);
}

/** True when a combo still needs approved deposits before it can be submitted. */
export function comboNeedsDeposit(params: {
    isCombo: boolean;
    isAdminAuthorized?: boolean;
    requiredDeposit?: number | null;
    storedPrice?: number;
    depositedAmount?: number;
}): boolean {
    const { isCombo, isAdminAuthorized, requiredDeposit, storedPrice, depositedAmount } = params;
    if (!isCombo || isAdminAuthorized) return false;
    const required = getComboAdminAmount({ isCombo: true, requiredDeposit, storedPrice });
    if (required <= 1e-6) return false;
    return getComboRemainingDeposit(required, depositedAmount ?? 0) > 1e-6;
}
