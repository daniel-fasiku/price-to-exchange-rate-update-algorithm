"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
function createExchangeRateUpdater({ fetchProducts, updateProduct, apiKey, baseCurrency, targetCurrency }) {
    // Add this block for the warning and default API key
    const effectiveApiKey = apiKey || 'c6371980480236e19fd6e145';
    if (!apiKey) {
        console.warn("WARNING: No API key provided. Using a default key, which may have usage limitations.\n" +
            "Please obtain your own API key from the Exchange Rate API service provider (https://www.exchangerate-api.com/).\n" +
            "Note: A Pro version account is required to access historical data.");
    }
    async function fetchExchangeRate(date) {
        const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        // Use effectiveApiKey instead of apiKey
        const url = `https://v6.exchangerate-api.com/v6/${effectiveApiKey}/history/${baseCurrency}/${formattedDate}`;
        const response = await axios_1.default.get(url);
        return response.data.conversion_rates[targetCurrency];
    }
    async function updatePrices() {
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const [newRate, oldRate] = await Promise.all([
                fetchExchangeRate(today),
                fetchExchangeRate(yesterday)
            ]);
            const ratio = newRate / oldRate;
            if (ratio !== 1) {
                const products = await fetchProducts();
                for (const product of products) {
                    const newOriginalPrice = Math.round(product.originalPrice * ratio);
                    const newDiscountPrice = product.discountPrice ? Math.round(product.discountPrice * ratio) : null;
                    await updateProduct(product.id, {
                        originalPrice: newOriginalPrice,
                        discountPrice: newDiscountPrice
                    });
                }
                return {
                    success: true,
                    message: `Prices updated based on exchange rate change. Ratio: ${ratio.toFixed(5)}`,
                };
            }
            else {
                return {
                    success: true,
                    message: "No change in exchange rate. Prices remain the same.",
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: `Error updating prices: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
    return updatePrices;
}
module.exports = createExchangeRateUpdater;
