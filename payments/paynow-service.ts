"use client";

/**
 * PayNow (mBank) Payment Service
 * Calls /api/payments/paynow backend route which uses PayNow REST API v2.
 *
 * Required environment variables (set in Coolify):
 *   PAYNOW_ACCESS_KEY    — API key from PayNow merchant panel
 *   PAYNOW_SIGNATURE_KEY — Signature key from PayNow merchant panel
 *   PAYNOW_ENVIRONMENT   — "sandbox" or "production" (default: sandbox)
 *
 * Webhook endpoint to register in PayNow merchant panel:
 *   https://kamila.ofshore.dev/api/webhooks/paynow
 *
 * PayNow merchant panel:
 *   Sandbox: https://panel.sandbox.paynow.pl
 *   Production: https://panel.paynow.pl
 */

export async function processPayNowPayment(
  total: number,
  orderId: string,
  email: string,
  description?: string
): Promise<{ success: boolean; status?: string; redirectUrl?: string; paymentId?: string; error?: string }> {
  try {
    const res = await fetch("/api/payments/paynow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: total,
        orderId,
        email,
        description,
        continueUrl: `${window.location.origin}/pl/success?order=${orderId}`,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "PayNow API error");
    }

    // Redirect to PayNow payment page (BLIK / card)
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }

    return {
      success: true,
      status: data.status,
      redirectUrl: data.redirectUrl,
      paymentId: data.paymentId,
    };
  } catch (error: any) {
    console.error("[PayNow] Payment failed:", error);
    return { success: false, error: error.message };
  }
}

// Legacy export for backward compatibility with admin settings UI
export function getPayNowConfig() {
  return null; // Config now lives in server-side env vars, not localStorage
}
