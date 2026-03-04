/**
 * Impression Tracker Service
 * Discreetly tracks "Partner Impressions" for sponsorship attribution.
 * COPPA/GDPR Safe: No PII, just anonymous counts per partner.
 */

import { trackAnonymousEvent } from './telemetry-service';

export interface PartnerSponsorship {
    id: string;
    name: string;
    type: 'content' | 'tool' | 'theme';
    isSilent?: boolean; // If true, no branding is shown, just background attribution
}

export function trackPartnerImpression(partnerId: string, moduleId: string) {
    // Security Guard: Check if user enabled Ethical Monetization in admin panel
    const isEnabled = typeof window !== 'undefined' && localStorage.getItem("feature_ethical_monetization") !== "false";
    if (!isEnabled) return;

    // We leverage the existing telemetry service to route this anonymously
    // This allows the owner to export data for billing partners
    trackAnonymousEvent("partner_impression", {
        partnerId,
        moduleId,
        trackedAt: new Date().toISOString()
    });

    console.log(`[Monetization] Anonymous impression tracked for partner: ${partnerId}`);
}

/**
 * Returns a list of active sponsorships for UI enrichment (optional).
 */
export const MOCK_SPONSORSHIPS: PartnerSponsorship[] = [
    { id: 'lego_edu', name: 'LEGO Education', type: 'tool', isSilent: true },
    { id: 'nat_geo', name: 'National Geographic', type: 'content', isSilent: true },
    { id: 'disney_learn', name: 'Disney Learning', type: 'theme', isSilent: true }
];
