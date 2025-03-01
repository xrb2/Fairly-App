const cache = {};
async function fetchStorePrices(productName) {
  if (cache[productName]) return cache[productName];
  const prices = await fetchStorePricesImpl(productName); // Rename original function
  cache[productName] = prices;
  return prices;
}