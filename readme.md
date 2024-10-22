# Price to Exchange Rate Update

A TypeScript/Node.js module for updating product prices based on exchange rate changes.

## Installation

```bash
npm install price-to-exchange-rate-update
```

## Features

- Fetches latest exchange rates from a reliable API
- Calculates price adjustments based on exchange rate changes
- Supports custom database integration
- TypeScript support with type definitions

## Usage

### Basic Setup

1. Install the package:

   ```bash
   npm install price-to-exchange-rate-update
   ```

2. Import and configure the updater in your project:

   ```typescript
   // CommonJS
   const createExchangeRateUpdater = require("price-to-exchange-rate-update");

   // ES6 Modules
   import { createExchangeRateUpdater } from "price-to-exchange-rate-update";

   const updatePrices = createExchangeRateUpdater({
     fetchProducts: async () => {
       // Your logic to fetch products
     },
     updateProduct: async (id, data) => {
       // Your logic to update a product
     },
     apiKey: "your-exchange-rate-api-key",
     baseCurrency: "NGN",
     targetCurrency: "USD",
   });

   // Run the update
   updatePrices().then((result) => console.log(result));
   ```

### Detailed Example with MongoDB

This example demonstrates how to use the package with a MongoDB database using Mongoose.

1. Set up your database connection and model:

   ```typescript
   // db.ts
   import mongoose from "mongoose";

   mongoose.connect("mongodb://localhost/your_database", {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   });

   const ProductSchema = new mongoose.Schema({
     name: String,
     originalPrice: Number,
     discountPrice: Number,
   });

   const Product = mongoose.model("Product", ProductSchema);

   export { Product };
   ```

2. Create functions to fetch and update products:

   ```typescript
   // productOperations.ts
   import { Product } from "./db";

   export async function fetchProducts() {
     return await Product.find({});
   }

   export async function updateProduct(id: string, data: Partial<Product>) {
     await Product.findByIdAndUpdate(id, data);
   }
   ```

3. Use the price-to-exchange-rate-update:
   - assign the currency in your database to the baseCurrency and targetCurrency in the createExchangeRateUpdater function

   ```typescript
   // updatePrices.ts
   import { createExchangeRateUpdater } from "price-to-exchange-rate-update";
   import { fetchProducts, updateProduct } from "./productOperations";

   const updatePrices = createExchangeRateUpdater({
     fetchProducts,
     updateProduct,
     apiKey: "your-exchange-rate-api-key",
     baseCurrency: "NGN",
     targetCurrency: "USD",
   });

   async function runUpdate() {
     try {
       const result = await updatePrices();
       console.log(result);
     } catch (error) {
       console.error("Error updating prices:", error);
     }
   }

   runUpdate();
   ```

4. Run the update script:

   ```bash
   ts-node updatePrices.ts
   ```

### Important Note on API Key

**WARNING:** If you don't provide an API key, the module will use a default key, which may have usage limitations. It's strongly recommended to obtain your own API key from the Exchange Rate API service provider (https://www.exchangerate-api.com/).

To use your own API key, include it in the options when creating the exchange rate updater:

## Important Note on Importing

This package supports both CommonJS and ES6 module systems. Please use the appropriate import syntax based on your project configuration:

### For CommonJS (e.g., in Node.js without ES6 module support):

```javascript
const createExchangeRateUpdater = require("price-to-exchange-rate-update");
```

### For ES6 modules:

```javascript
import createExchangeRateUpdater from "price-to-exchange-rate-update";
```

## API Reference

### `createExchangeRateUpdater(options)`

Creates an exchange rate updater function.

#### Parameters

- `options` (Object):
  - `fetchProducts` (Function): Async function that returns an array of products.
  - `updateProduct` (Function): Async function to update a single product.
  - `apiKey` (String): Your Exchange Rate API key.
  - `baseCurrency` (String): The currency code to convert from (e.g., 'USD').
  - `targetCurrency` (String): The currency code to convert to (e.g., 'NGN').

#### Returns

- (Function): An async function that when called, updates product prices based on the latest exchange rates.

## TypeScript Support

This package is built with TypeScript and includes type definitions. You can import and use the module with full type support:

```typescript
import { createExchangeRateUpdater } from "price-to-exchange-rate-update";

interface Product {
  id: string | number;
  originalPrice: number;
  discountPrice?: number | null;
}

const updatePrices = createExchangeRateUpdater({
  fetchProducts: async (): Promise<Product[]> => {
    // Your logic to fetch products
  },
  updateProduct: async (
    id: string | number,
    data: Partial<Product>
  ): Promise<void> => {
    // Your logic to update a product
  },
  apiKey: "your-exchange-rate-api-key",
  baseCurrency: "USD",
  targetCurrency: "NGN",
});
```



### Product Model Structure

When using this module, ensure your product model adheres to the following structure:
```typescript
interface Product {
  id: string | number;
  originalPrice: number;
  discountPrice?: number | null;
}
```

## License

MIT
