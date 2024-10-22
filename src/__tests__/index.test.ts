import createExchangeRateUpdater from '../index';

test('createExchangeRateUpdater returns a function', () => {
  const updatePrices = createExchangeRateUpdater({
    fetchProducts: jest.fn(),
    updateProduct: jest.fn(),
    apiKey: 'test-key',
    baseCurrency: 'USD',
    targetCurrency: 'NGN'
  });
  expect(typeof updatePrices).toBe('function');
});