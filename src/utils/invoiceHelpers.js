export function calculateInvoiceTotals(estimateTotal = 0, discountPercent = 0, taxPercent = 0) {
    const subtotal = estimateTotal;
    const discount = (subtotal * discountPercent) / 100;
    const taxes = ((subtotal - discount) * taxPercent) / 100;
    const total = subtotal - discount + taxes;

    return { subtotal, discount, taxes, total };
}


export function calculateBalanceDue(totalAmount, paidAmount = 0) {
    return totalAmount - paidAmount;
}
