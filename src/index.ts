import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load the .env file from the package's root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
  const packageApiKey = process.env.API_KEY;
  const effectiveApiKey = apiKey || packageApiKey;

  if (!effectiveApiKey) {
    console.warn(
      "WARNING: No API key provided and no default key found in the package's .env file.\n" +
      "Please provide an API key or set one in the package's .env file.\n" +
      "You can obtain an API key from the Exchange Rate API service provider (https://www.exchangerate-api.com/).\n" +
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
