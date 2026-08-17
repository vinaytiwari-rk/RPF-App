const fs = require('fs');
let c = fs.readFileSync('src/routes/donationRoutes.ts', 'utf8');

const saveTokenEndpoint = `
router.post('/api/save-fcm-token', async (req, res) => {
  try {
    const { volunteerId, token } = req.body;
    if (!volunteerId || !token) return res.status(400).json({ success: false, error: 'Missing data' });
    
    // Add fcm_token column if it doesn't exist
    await pool.query('ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(500)');
    
    // Update the token
    await pool.query('UPDATE volunteers SET fcm_token=$1 WHERE id=$2', [token, volunteerId]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

c = c.replace('export default router;', saveTokenEndpoint + '\nexport default router;');
fs.writeFileSync('src/routes/donationRoutes.ts', c);
