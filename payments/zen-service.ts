"use client";

/**
 * Zen.com Payment Service
 * Calls /api/payments/zen backend route which uses Zen.com Checkout API.
 *
 * Required environment variables (set in Coolify):
 *   ZEN_TERMINAL_UUID  — Terminal UUID from Zen merchant panel
 *   ZEN_SECRET_KEY     — Secret key for HMAC signature generation
 *   ZEN_ENVIRONMENT    — "sandbox" or "production" (default: sandbox)
 *
 * Webhook (IPN) endpoint to register in Zen merchant panel:
 *   https://kamila.ofshore.dev/api/webhooks/zen
 *
 * Zen merchant panels:
 *   Sandbox:    https://merchant.zen-test.com
 *   Production: https://merchant.zen.com
 *
 * Supported payment methods: BLIK, card, Apple Pay, Google Pay, bank transfer
 */

export async function processZenPayment(
  amount: number,
  currency: string = "PLN",
  orderId?: string,
  email?: string,
  firstName?: string,
  lastName?: string,
  productName?: string
): Promise<{ success: boolean; redirectUrl?: string; transactionId?: string; error?: string }> {
  try {
    const resolvedOrderId = orderId || `order_${Date.now()}`;

    const res = await fetch("/api/payments/zen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        orderId: resolvedOrderId,
        email,
        firstName,
        lastName,
        productName,
        successUrl: `${window.location.origin}/pl/success?order=${resolvedOrderId}`,
        failureUrl: `${window.location.origin}/pl/checkout?failed=true&order=${resolvedOrderId}`,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Zen API error");
    }

    // Redirect to Zen checkout page
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }

    return {
      success: true,
      redirectUrl: data.redirectUrl,
      transactionId: data.transactionId,
    };
  } catch (error: any) {
    console.error("[Zen] Payment failed:", error);
    return { success: false, error: error.message };
  }
}
