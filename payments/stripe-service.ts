"use client";

/**
 * Stripe Payment Service
 * Calls /api/payments/stripe backend route which uses the official Stripe SDK.
 *
 * Required environment variables (set in Coolify):
 *   STRIPE_SECRET_KEY                  — sk_live_... or sk_test_...
 *   STRIPE_WEBHOOK_SECRET              — whsec_... from Stripe Dashboard > Webhooks
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — pk_live_... or pk_test_... (optional, for client-side)
 *
 * Webhook endpoint to register in Stripe Dashboard:
 *   https://kamila.ofshore.dev/api/webhooks/stripe
 *   Events: checkout.session.completed, checkout.session.expired, payment_intent.payment_failed
 */

export async function processStripePayment(
  amount: number,
  currency: string = "PLN",
  orderId?: string,
  email?: string,
  productName?: string
): Promise<{ success: boolean; transactionId?: string; redirectUrl?: string; error?: string }> {
  try {
    const resolvedOrderId = orderId || `order_${Date.now()}`;

    const res = await fetch("/api/payments/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        orderId: resolvedOrderId,
        email,
        productName,
        successUrl: `${window.location.origin}/pl/success?order=${resolvedOrderId}`,
        cancelUrl: `${window.location.origin}/pl/checkout?cancelled=true`,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Stripe API error");
    }

    // Redirect to Stripe Checkout hosted page
    if (data.url) {
      window.location.href = data.url;
      return { success: true, transactionId: data.sessionId, redirectUrl: data.url };
    }

    // Simulated mode (no keys configured)
    if (data.simulated) {
      console.warn("[Stripe] Running in simulation mode — no real payment processed");
      return { success: true, transactionId: data.sessionId };
    }

    return { success: true, transactionId: data.sessionId };
  } catch (error: any) {
    console.error("[Stripe] Payment failed:", error);
    return { success: false, error: error.message };
  }
}

// Legacy export for backward compatibility with admin settings UI
export function getStripeConfig() {
  return null; // Config now lives in server-side env vars, not localStorage
}
