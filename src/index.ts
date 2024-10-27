import axios from 'axios';

interface Product {
  id: string | number;
  originalPrice: number;
  discountPrice?: number | null;
}

interface UpdatedProduct {
  originalPrice: number;
  discountPrice?: number | null;
}

interface ExchangeRateUpdaterOptions {
  fetchProducts: () => Promise<Product[]>;
  updateProduct: (id: string | number, data: UpdatedProduct) => Promise<void>;
  apiKey?: string;
  baseCurrency: string;
  targetCurrency: string;
}

interface UpdateResult {
  success: boolean;
  message: string;
}

function createExchangeRateUpdater({
  fetchProducts,
  updateProduct,
  apiKey,
  baseCurrency,
  targetCurrency
}: ExchangeRateUpdaterOptions): () => Promise<UpdateResult> {
  // Add this block for the warning and default API key
  const effectiveApiKey = apiKey || 'c6371980480236e19fd6e145';
  if (!apiKey) {
    console.warn(
      "WARNING: No API key provided. Using a default key, which may have usage limitations.\n" +
      "Please obtain your own API key from the Exchange Rate API service provider (https://www.exchangerate-api.com/).\n" +
      "Note: A Pro version account is required to access historical data."
    );
  }

  async function fetchExchangeRate(date: Date): Promise<number> {
    const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    // Use effectiveApiKey instead of apiKey
    const url = `https://v6.exchangerate-api.com/v6/${effectiveApiKey}/history/${baseCurrency}/${formattedDate}`;
    const response = await axios.get(url);
    return response.data.conversion_rates[targetCurrency];
  }

  async function updatePrices(): Promise<UpdateResult> {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const [newRate, oldRate] = await Promise.all([
        fetchExchangeRate(today),
        fetchExchangeRate(yesterday)
      ]);

      const ratio = newRate < oldRate ? oldRate / newRate : newRate / oldRate;

      if (ratio !== 1) {
        const products = await fetchProducts();

        for (const product of products) {
          const newOriginalPrice = newRate < oldRate ? Math.round(product.originalPrice * ratio) : Math.round(product.originalPrice / ratio);
          const newDiscountPrice = product.discountPrice ? newRate < oldRate ? Math.round(product.discountPrice * ratio) : Math.round(product.discountPrice / ratio) : null;

          await updateProduct(product.id, {
            originalPrice: newOriginalPrice,
            discountPrice: newDiscountPrice
          });
        }

        return {
          success: true,
          message: `Prices updated based on exchange rate change. Ratio: ${ratio.toFixed(5)}`,
        };
      } else {
        return {
          success: true,
          message: "No change in exchange rate. Prices remain the same.",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error updating prices: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  return updatePrices;
}

export = createExchangeRateUpdater;
