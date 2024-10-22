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
declare function createExchangeRateUpdater({ fetchProducts, updateProduct, apiKey, baseCurrency, targetCurrency }: ExchangeRateUpdaterOptions): () => Promise<UpdateResult>;
export = createExchangeRateUpdater;
