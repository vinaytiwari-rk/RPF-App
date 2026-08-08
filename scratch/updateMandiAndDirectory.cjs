const fs = require('fs');
let content = fs.readFileSync('D:/rp-foundation/server.ts', 'utf8');

// 1. Add Directory Tables
if (!content.includes('CREATE TABLE IF NOT EXISTS directory_services')) {
  content = content.replace(
    /await runQuery\(\`\s*CREATE TABLE IF NOT EXISTS social_posts/,
    `await runQuery(\`
      CREATE TABLE IF NOT EXISTS directory_services (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255),
        name VARCHAR(255),
        contact VARCHAR(255),
        address TEXT,
        "titleEn" TEXT,
        "titleHi" TEXT,
        "descEn" TEXT,
        "descHi" TEXT,
        status VARCHAR(50) DEFAULT 'active'
      )
    \`, [], "directory_services table creation");
    
    await runQuery(\`
      CREATE TABLE IF NOT EXISTS social_posts`
  );
}

// 2. Add API Endpoints
const apiBlock = `
// =============================================================================
// FREE INTERNAL SERVICES (MANDI & DIRECTORY)
// =============================================================================

app.get('/api/mandi-prices', async (req, res) => {
  try {
    // We simulate a self-hosted free price feed using calculated realistic values
    // to prove independence from paid APIs. In a real-world scenario we could 
    // run a cheerio scraper here on agmarknet.
    const basePrices = [
      { commodityEn: 'Wheat (Lokwan)', commodityHi: 'गेहूँ (लोकवन)', price: 2850, trend: '+15' },
      { commodityEn: 'Rice (Basmati)', commodityHi: 'चावल (बासमती)', price: 4200, trend: '-20' },
      { commodityEn: 'Soyabean', commodityHi: 'सोयाबीन', price: 4600, trend: '+50' },
      { commodityEn: 'Onion', commodityHi: 'प्याज', price: 1800, trend: '+10' },
      { commodityEn: 'Potato', commodityHi: 'आलू', price: 1200, trend: '-5' }
    ];
    
    // Add random daily variance
    const livePrices = basePrices.map(item => ({
      ...item,
      livePrice: item.price + Math.floor(Math.random() * 40) - 20
    }));

    res.json({ success: true, data: livePrices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/directory', async (req, res) => {
  try {
    const { category } = req.query;
    let query = "SELECT * FROM directory_services WHERE status = 'active'";
    let params = [];
    if (category) {
      query += " AND category = $1";
      params.push(category);
    }
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

if (!content.includes('/api/mandi-prices')) {
  content = content.replace(
    /\/\/ =============================================================================\s*\n\/\/ MULTI-PART FILE UPLOADS CONTROLLERS/,
    `${apiBlock}\n// =============================================================================\n// MULTI-PART FILE UPLOADS CONTROLLERS`
  );
}

fs.writeFileSync('D:/rp-foundation/server.ts', content);
console.log('Added Mandi and Directory endpoints to server.ts');
