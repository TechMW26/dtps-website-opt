/** A captured payment must belong to this order and match its actual total. */
export function paymentMatchesOrder(
  payment: { order_id?: string; amount?: string | number; currency?: string },
  order: { razorpayOrderId?: string; total: number },
  requestedRazorpayOrderId: unknown
): boolean {
  return Boolean(order.razorpayOrderId && requestedRazorpayOrderId === order.razorpayOrderId
    && payment.order_id === order.razorpayOrderId && payment.currency === 'INR'
    && Number.isFinite(order.total) && order.total >= 0
    && Number(payment.amount) === Math.round(order.total * 100));
}
