/**
 * Payment gateway (recruiter subscriptions).
 * Flow: backend creates order -> open gateway SDK -> backend verifies signature.
 * Never treat the client-side result alone as proof of payment.
 *
 * TODO: install your gateway SDK (e.g. react-native-razorpay or @stripe/stripe-react-native)
 * and implement openCheckout with it.
 */
export type CheckoutOrder = { orderId: string; amount: number; currency: string; gatewayKey: string };
export type CheckoutResult = Record<string, string>;

export async function openCheckout(_order: CheckoutOrder): Promise<CheckoutResult> {
  throw new Error('Payment gateway not configured yet');
}
