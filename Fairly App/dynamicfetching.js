app.get('/api/prices', async (req, res) => {
  const searchQuery = req.query.search ? req.query.search.toLowerCase().trim() : '';
  const allProducts = await getAllProducts(); // Cache this in production
  // Filter and fetch prices as before...
});