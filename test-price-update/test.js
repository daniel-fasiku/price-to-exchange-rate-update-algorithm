const createExchangeRateUpdater = require('price-to-exchange-rate-update');

const updatePrices = createExchangeRateUpdater({
  fetchProducts: async () => {
    // Mock function to fetch products
    return [{ id: 1, originalPrice: 100, discountPrice: 90 }];
  },
  updateProduct: async (id, data) => {
    // Mock function to update a product
    console.log(`Updating product ${id}:`, data);
  },
  // Make sure to set this in your environment
  baseCurrency: 'USD',
  targetCurrency: 'EUR'
});

updatePrices().then(console.log).catch(console.error);

