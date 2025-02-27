const express = require('express');
const app = express();
const port = 3000;

// Expanded mock product data
const priceData = {
  "Dove Beauty Bar (4-pack)": { fairlyPrice: 6.00, stores: { walmart: 6.97, target: 7.49 } },
  "Dial Antibacterial Bar (4-pack)": { fairlyPrice: 5.50, stores: { walmart: 6.48, target: 6.99 } },
  "Gillette Venus Razor (Women)": { fairlyPrice: 7.00, stores: { walmart: 8.97, target: 9.49 } },
  "Gillette Fusion Razor (Men)": { fairlyPrice: 7.00, stores: { walmart: 7.48, target: 7.99 } },
  "Dove Body Wash (Women)": { fairlyPrice: 5.50, stores: { walmart: 6.78, target: 7.29 } },
  "Dove Body Wash (Men)": { fairlyPrice: 5.50, stores: { walmart: 5.98, target: 6.49 } },
  "Girls' T-Shirt": { fairlyPrice: 4.00, stores: { walmart: 5.50, target: 5.99 } },
  "Boys' T-Shirt": { fairlyPrice: 4.00, stores: { walmart: 4.25, target: 4.75 } },
  "Secret Deodorant (Women)": { fairlyPrice: 4.50, stores: { walmart: 5.97, target: 6.29 } },
  "Old Spice Deodorant (Men)": { fairlyPrice: 4.50, stores: { walmart: 4.88, target: 5.19 } },
  "Pantene Shampoo (Women)": { fairlyPrice: 5.00, stores: { walmart: 6.47, target: 6.99 } },
  "Head & Shoulders (Men)": { fairlyPrice: 5.00, stores: { walmart: 5.78, target: 6.09 } },
  "Women’s Jeans": { fairlyPrice: 15.00, stores: { walmart: 18.97, target: 19.99 } },
  "Men’s Jeans": { fairlyPrice: 15.00, stores: { walmart: 16.48, target: 17.50 } },
  "Tampax Pearl Tampons (36-count)": { fairlyPrice: 8.00, stores: { walmart: 9.47, target: 9.99 } }
};

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Endpoint with search functionality
app.get('/api/prices', (req, res) => {
  const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
  const products = Object.keys(priceData)
    .filter(name => searchQuery === '' || name.toLowerCase().includes(searchQuery))
    .map(name => {
      const data = priceData[name];
      const storePrices = data.stores;
      const average = Object.values(storePrices).reduce((a, b) => a + b, 0) / Object.keys(storePrices).length;
      return {
        name,
        price: data.fairlyPrice,
        storePrices: { ...storePrices, average: average.toFixed(2) }
      };
    });
  res.json(products);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});