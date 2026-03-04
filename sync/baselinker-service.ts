/**
 * BaseLinker API Service
 * Integration for physical products from external wholesalers and publishers.
 */

const BASELINKER_API_URL = "https://api.baselinker.com/connector.php";
const BL_TOKEN = process.env.BASELINKER_TOKEN || "";

interface BaseLinkerResponse<T> {
    status: "SUCCESS" | "ERROR";
    error_code?: string;
    error_message?: string;
    [key: string]: any;
}

export async function callBaseLinkerApi<T>(method: string, parameters: object = {}): Promise<T> {
    if (!BL_TOKEN) {
        console.warn("BaseLinker token not found. Set BASELINKER_TOKEN env variable.");
    }

    const body = new URLSearchParams();
    body.append("method", method);
    body.append("parameters", JSON.stringify(parameters));

    try {
        const response = await fetch(BASELINKER_API_URL, {
            method: "POST",
            headers: {
                "X-BLToken": BL_TOKEN,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });

        const data: BaseLinkerResponse<T> = await response.json();

        if (data.status === "ERROR") {
            throw new Error(`BaseLinker API Error: ${data.error_message} (${data.error_code})`);
        }

        return data as T;
    } catch (error) {
        console.error("BaseLinker API call failed:", error);
        throw error;
    }
}

/**
 * Fetch a list of products from specific wholesaler/inventory.
 */
export async function getWholesalerProducts(inventoryId: string = "default") {
    return callBaseLinkerApi("getInventoryProductsList", {
        inventory_id: inventoryId,
    });
}

/**
 * Fetch detailed data for a specific product.
 */
export async function getProductDetails(productId: string) {
    return callBaseLinkerApi("getInventoryProductsData", {
        inventory_id: "default",
        products: [productId],
    });
}
