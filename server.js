const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();
const port = process.env.PORT || 3000; // Use environment port for Render/Heroku

// List of pink-tax-affected products to scrape
const pinkTaxProducts = [
  { name: "Dove Beauty Bar 4-pack", category: "Soaps" },
  { name: "Dial Antibacterial Bar 4-pack", category: "Soaps" },
  { name: "Gillette Venus Razor Women", category: "Razors" },
  { name: "Gillette Fusion Razor Men", category: "Razors" },
  { name: "Dove Body Wash Women", category: "Body Wash" },
  { name: "Dove Body Wash Men", category: "Body Wash" },
  { name: "Secret Deodorant Women", category: "Deodorants" },
  { name: "Old Spice Deodorant Men", category: "Deodorants" },
  { name: "Pantene Shampoo Women", category: "Shampoos" },
  { name: "Head & Shoulders Men", category: "Shampoos" },
  { name: "Women’s Jeans", category: "Apparel" },
  { name: "Men’s Jeans", category: "Apparel" },
  { name: "Tampax Pearl Tampons 36-count", category: "Hygiene" }
];

// CORS middleware to allow GitHub Pages frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://xrb2.github.io'); // Update to your GitHub Pages URL (e.g., 'https://your-username.github.io') for production
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Generic scraping function
async function scrapePrice(url, selector) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for Render/Heroku
    });
    const page = await browser.newPage();
    // Set a common user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const price = await page.$eval(selector, el => el.textContent.match(/\d+\.\d+/)?.[0] || '0');
    return parseFloat(price) || 0;
  } catch (error) {
    console.error(`Scraping error for ${url}:`, error.message);
    return 0;
  } finally {
    if (browser) await browser.close();
  }
}

// Fetch prices from multiple stores
async function fetchStorePrices(productName) {
  const searches = {
    walmart: {
      url: `https://www.walmart.com/search?q=${encodeURIComponent(productName)}`,
      selector: '.f3.b' // Walmart price selector (may need adjustment if site changes)
    },
    target: {
      url: `https://www.target.com/s?searchTerm=${encodeURIComponent(productName)}`,
      selector: '[data-test="product-price"]' // Target price selector
    }
    // Add more stores here (e.g., Costco: 'https://www.costco.com/CatalogSearch?keyword=${productName}', selector: '.price')
  };

  const prices = {};
  for (const [store, { url, selector }] of Object.entries(searches)) {
    prices[store] = await scrapePrice(url, selector);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay to avoid rate limiting
  }
  return prices;
}

// API endpoint to serve scraped prices
app.get('/api/prices', async (req, res) => {
  const searchQuery = req.query.search ? req.query.search.toLowerCase().trim() : '';

  const products = await Promise.all(
    pinkTaxProducts
      .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery) || p.category?.toLowerCase().includes(searchQuery))
      .map(async (product) => {
        const storePrices = await fetchStorePrices(product.name);
        const validPrices = Object.values(storePrices).filter(p => p > 0);
        const averagePrice = validPrices.length ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : 0;
        const fairlyPrice = averagePrice > 0 ? (averagePrice * 0.9).toFixed(2) : 5.00; // 10% below average as "no pink tax"

        return {
          name: product.name,
          price: parseFloat(fairlyPrice),
          category: product.category || "Other",
          storePrices: {
            walmart: storePrices.walmart.toFixed(2),
            target: storePrices.target.toFixed(2),
            average: averagePrice.toFixed(2)
          }
        };
      })
  );

  res.json(products.filter(p => p.storePrices.walmart !== "0.00" || p.storePrices.target !== "0.00"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
