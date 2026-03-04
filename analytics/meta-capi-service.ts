import crypto from 'crypto';

/**
 * Meta Conversions API (CAPI) Service
 * Implements server-side event tracking and Advanced Matching.
 */

const PIXEL_ID = process.env.META_PIXEL_ID || "1234567890"; // Mock ID
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN || "EAAB..."; // Mock Token
const API_VERSION = "v18.0";

/**
 * Hash data using SHA-256 as required by Meta for Advanced Matching.
 */
function hashData(data: string): string {
    if (!data) return "";
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

/**
 * Unified method to send server-side events to Meta.
 */
export async function sendMetaCapiEvent(
    eventName: string,
    userData: {
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        city?: string;
        clientUserAgent?: string;
        clientIpAddress?: string;
    },
    eventData: {
        value?: number;
        currency?: string;
        orderId?: string;
        contents?: any[];
    }
) {
    if (!ACCESS_TOKEN || ACCESS_TOKEN === "EAAB...") {
        console.warn(`[MetaCAPI] Missing access token. Skipping event: ${eventName}`);
        return { success: false, reason: "missing_token" };
    }

    try {
        const payload = {
            data: [
                {
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: "website",
                    user_data: {
                        em: userData.email ? [hashData(userData.email)] : [],
                        ph: userData.phone ? [hashData(userData.phone)] : [],
                        fn: userData.firstName ? [hashData(userData.firstName)] : [],
                        ln: userData.lastName ? [hashData(userData.lastName)] : [],
                        ct: userData.city ? [hashData(userData.city)] : [],
                        client_user_agent: userData.clientUserAgent,
                        client_ip_address: userData.clientIpAddress,
                    },
                    custom_data: {
                        value: eventData.value,
                        currency: eventData.currency || "PLN",
                        order_id: eventData.orderId,
                        contents: eventData.contents || [],
                    }
                }
            ]
        };

        const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log(`[MetaCAPI] Event ${eventName} sent.`, result);
        return { success: true, result };

    } catch (error) {
        console.error(`[MetaCAPI] Failed to send event ${eventName}:`, error);
        return { success: false, error };
    }
}
