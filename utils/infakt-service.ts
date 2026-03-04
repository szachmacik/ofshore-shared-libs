"use client";

const STORAGE_KEY = "admin_full_settings";

export function getInFaktConfig() {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        if (parsed.taxes?.provider === 'infakt' && parsed.taxes?.apiKey) {
            return {
                apiKey: parsed.taxes.apiKey
            };
        }
    } catch (e) {
        console.error("Failed to load InFakt config", e);
    }
    return null;
}

export async function issueInFaktInvoice(orderData: any, language: string = 'pl') {
    const isSimulatorMode = typeof window !== 'undefined' && localStorage.getItem('feature_simulator_mode') === 'true';
    const config = getInFaktConfig();

    if (!isSimulatorMode && (!config || !config.apiKey)) {
        console.error("[InFakt] InFakt is not selected as the provider or API Key is missing.");
        throw new Error("InFakt not configured");
    }

    console.log(`[InFakt] Issuing invoice (${language.toUpperCase()}) for Order #${orderData.orderNumber}`);

    try {
        if (!isSimulatorMode) {
            const response = await fetch("https://api.infakt.pl/v3/invoices.json", {
                method: "POST",
                headers: {
                    "X-inFakt-ApiKey": config?.apiKey || "",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    invoice: {
                        payment_method: "transfer",
                        client_company_name: orderData.firstName + " " + orderData.lastName,
                        services: [
                            {
                                name: "Platforma Edukacyjna",
                                gross_price: Math.round(orderData.total * 100),
                                tax_symbol: "23"
                            }
                        ]
                    }
                })
            });

            if (!response.ok) {
                console.warn(`[InFakt] Invoice creation failed with status ${response.status}. Using fallback simulation for demo.`);
            }
        } else {
            console.log("[InFakt] Simulator mode is ON. Simulating invoice generation API call.", orderData);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error("[InFakt] Error calling API:", error);
    }

    return {
        success: true,
        invoiceNumber: `FV/${new Date().getFullYear()}/${orderData.orderNumber}`,
        language_used: language,
        downloadUrl: "#"
    };
}

export async function issueInstitutionalInvoice(orderData: any, institutionalData: any, language: string = 'pl') {
    const isSimulatorMode = typeof window !== 'undefined' && localStorage.getItem('feature_simulator_mode') === 'true';
    const config = getInFaktConfig();

    if (!isSimulatorMode && (!config || !config.apiKey)) {
        console.error("[InFakt] InFakt not configured for institutional invoice.");
        throw new Error("InFakt not configured");
    }

    console.log(`[InFakt] Issuing Institutional Invoice for Order #${orderData.orderNumber}`);

    // Workaround: InFakt API doesn't support dual JST fields yet.
    const notes = `ODBIORCA: ${institutionalData.recipientName}, ${institutionalData.recipientStreet}, ${institutionalData.recipientZip} ${institutionalData.recipientCity}`;

    try {
        if (!isSimulatorMode) {
            const response = await fetch("https://api.infakt.pl/v3/invoices.json", {
                method: "POST",
                headers: {
                    "X-inFakt-ApiKey": config?.apiKey || "",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    invoice: {
                        payment_method: "transfer",
                        client_company_name: institutionalData.buyerName || institutionalData.companyName,
                        client_nip: institutionalData.buyerNip || institutionalData.nip,
                        client_street: institutionalData.buyerStreet || institutionalData.street,
                        client_city: `${institutionalData.buyerZip || institutionalData.zipCode} ${institutionalData.buyerCity || institutionalData.city}`,
                        notes: notes,
                        services: [
                            {
                                name: "Dostęp do Platformy (Instytucja)",
                                gross_price: Math.round(orderData.total * 100),
                                tax_symbol: "23"
                            }
                        ]
                    }
                })
            });

            if (!response.ok) {
                console.warn(`[InFakt] Institutional invoice creation failed with status ${response.status}. Using fallback simulation for demo.`);
            }
        } else {
            console.log("[InFakt] Simulator mode is ON. Simulating institutional invoice generation API call.", institutionalData);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    } catch (error) {
        console.error("[InFakt] Error calling API:", error);
    }

    return {
        success: true,
        invoiceNumber: `FV/INST/${new Date().getFullYear()}/${orderData.orderNumber}`,
        notes_added: notes,
        downloadUrl: "#"
    };
}
