async function scrapeCategoryPrices(store, categoryUrl, selector) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(categoryUrl, { waitUntil: 'networkidle2' });
  const products = await page.$$eval('.product-title-link', (els, sel) => 
    els.map(el => ({
      name: el.textContent.trim(),
      price: el.nextElementSibling?.querySelector(sel)?.textContent.match(/\d+\.\d+/)?.[0] || '0'
    })), selector);
  await browser.close();
  return products.map(p => ({ ...p, price: parseFloat(p.price) || 0 }));
}

// Example: Scrape Walmart razors
const walmartRazors = await scrapeCategoryPrices('walmart', 'https://www.walmart.com/browse/personal-care/razors/1005862_1071969', '.f3.b');