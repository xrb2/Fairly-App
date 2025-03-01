const categories = [
  { name: "Razors", walmartUrl: "https://www.walmart.com/browse/personal-care/razors/1005862_1071969", targetUrl: "https://www.target.com/c/razors-blades-cartridges/-/N-5xt3l" },
  { name: "Soaps", walmartUrl: "https://www.walmart.com/browse/personal-care/bar-soap/1005862_1071968", targetUrl: "https://www.target.com/c/bar-soap-bath-body-personal-care/-/N-5xt3o" }
];

async function getAllProducts() {
  let allProducts = [];
  for (const cat of categories) {
    const walmartProds = await scrapeCategoryPrices('walmart', cat.walmartUrl, '.f3.b');
    const targetProds = await scrapeCategoryPrices('target', cat.targetUrl, '[data-test="product-price"]');
    allProducts.push(...walmartProds.map(p => ({ name: p.name, category: cat.name })));
  }
  return allProducts;
}